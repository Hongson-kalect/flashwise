# Thiết kế phần học từ vựng

Ghi từ buổi thảo luận ngày 2026-11-01 (phiên backend `flashwise_api`). Phần cấp / độ khó / thuật toán ngắt quãng chi tiết **chưa chốt**, làm sau.

## 0. Cập nhật 2026-11-05: lát 1 (học cụm, offline) đã chạy

- Logic thuần ở `learning/` (có test `npx tsx --test learning/learning.test.ts`): `engine.ts` (máy trạng thái phiên bằng reducer), `steps.ts` (registry kiểu bước + đáp án nhiễu), `checker.ts` (chấm gõ, gợi ý), `grade.ts` (quy điểm FSRS, chỉnh ±1), `fsrsService.ts` (ts-fsrs, cùng luật server), `cardData.ts` (dòng SQL → thẻ, áp delta), `useLearnRun.ts` (nối SQLite + React).
- SQLite: `database/queries/learning.ts` (`pickNewCards` theo luật server, `saveLearnResult` ghi progress / review_log / learn_session / day_learn_log trong 1 giao dịch).
- UI: `components/learning/` (SessionHeader, WordHeader, SenseImage, FeedbackBar, SummaryView, StateView) và `questions/` (registry `PROMPTS` theo kiểu bước, `ANSWERS` theo cách trả lời: chọn / gõ). Màn `app/screens/Learning/New/screen.tsx` (param `id` = UserCollection) chỉ ghép; vào từ nút "Học từ mới" ở chi tiết bộ.
- Có: 4 bước (copy + "Đã biết", chọn nghĩa, chọn từ, gõ từ), giãn cách tăng dần, gợi ý, tổng kết chọn mức nhớ, ghi tiến độ offline.
- Lát 2 (cùng ngày): **Ôn tập** (`app/screens/Learning/Review/screen.tsx`, từ "Ôn tập ngay" ở Home). `database/queries/review.ts`: `pickReviewBatch` (thẻ đến hạn trước cuối ngày học, R thấp nhất trước, mỗi từ 1 nghĩa; chia 2 nhóm theo `swipe_min_level`: vuốt tối đa 30 thẻ, cụm tối đa `cluster_size`) và `saveReviewResult` (chấm tiếp FSRS, vuốt dùng `swipe_retention`, cấp thẻ, review_log, learn_session type `review`, day_learn_log). `learning/swipe.ts`: reducer vuốt (điểm khó 0..3, nhớ / chưa chắc / xem nghĩa = quên, thẻ quên xem lại 1 lần ở cuối, hoàn tác 1 bước, không có Dễ). Ôn theo cụm dùng lại `engine.ts` với `mode: "review"` (bỏ bước copy, số bước theo cấp, điểm theo bước đầu: `autoGradeReview`). UI vuốt ở `components/learning/swipe/` (kéo ngang bằng gesture-handler + reanimated, có nút bấm tương đương, hướng theo `swipe_direction`).
- "Đến hạn" theo server = `next_review_at` trước cuối ngày học, nên thẻ vừa học / vừa quên (hẹn 10 phút hoặc 6 giờ sau) cũng hiện ở lượt "Ôn tiếp" ngay trong ngày. Có thể đổi thành chỉ lấy thẻ đã đến giờ (<= bây giờ) nếu thấy gắt.
- Đồng bộ (cùng ngày): tiến độ, review_log, phiên, nhật ký ngày, ghi chú, cài đặt tự đẩy lên `sync/push` và kéo về `sync/pull` (xem CLAUDE.md, mục đồng bộ). Server nhận review_log nên thống kê chung của nghĩa (`global_difficulty`, `learner_count`) được cộng.
- Nghe + nói (cùng ngày): 3 kiểu bước mới trong registry `learning/steps.ts`: `listenChoose` (chỉ nghe, chọn từ), `dictation` (chính tả: nghe, gõ), `speak` (đọc to, nhận dạng trên máy bằng `expo-speech-recognition`, `learning/speechRecognizer.ts`). Có bước hay không do `Capabilities {hear, talk}`: `hear` = cài đặt `hearable`, `talk` = cài đặt `talkable` + máy có nhận dạng. Thứ tự đủ: copy, chọn nghĩa, chọn từ, nghe chọn, gõ, chính tả, nói; rút ngắn theo cấp bỏ chọn từ / nghe chọn / chọn nghĩa trước, giữ gõ + nói. Chấm nói: khớp phương án nào cũng đúng, gần đúng chỉ khi là phương án đầu (Khó), sai 2 lần thì hiện đáp án; tiếng Nhật so không phân biệt hira / kata, bỏ dấu cách. "Không nói được lúc này" bỏ mọi bước nói còn lại (`skipKind`, không chấm). Nghe chậm dùng giọng máy (file âm thanh không đổi tốc độ). Chưa kiểm thử với giọng nói thật trên emulator (chỉ luồng quyền / từ chối / bỏ qua).
- Học tiếp phiên dở: có (học mới + ôn, xem 5.7).
- Viết tay (bước `handwrite`, `answerType: "draw"`): zh / ja / ko, từ 1-3 ký tự toàn chữ Hán / kana / Hangul (`learning/handwriting.ts`). Mỗi ký tự một ô vẽ (`InkCanvas`, PanResponder + SVG), nhận dạng trên máy bằng Google ML Kit Digital Ink qua module cục bộ `modules/expo-ink-recognition` (Expo Modules API; Android Kotlin đã chạy thử trên emulator, iOS Swift viết rồi nhưng CHƯA build). Model mỗi ngôn ngữ tải 1 lần (cần mạng): đầu phiên `readyWriteLangs` (`learning/inkAvailability.ts`) kiểm tra, chưa có thì tải nền cho phiên sau và phiên này bỏ bước viết (chờ tối đa 2,5s vì ML Kit khởi tạo lần đầu có thể mất ~20s). Chấm `checkWritten`: mọi ô đứng đầu = đúng, đúng trong top 3 = Khó, sai 2 lần thì hiện đáp án; gợi ý hiện ký tự mờ làm mẫu; "Không viết được lúc này" bỏ các bước viết còn lại. Thời gian viết không tính vào tốc độ chấm Dễ. Cài đặt `writable` (mặc định bật, chưa có UI). Thử trên emulator bằng `adb shell input swipe` vẽ nét.
- Chưa có: cloze / chọn ảnh, luyện nói riêng (nhại theo, chấm từng âm).

## 1. Hiện trạng code app (trước khi làm)

- Mọi nút học (Home "Học từ mới" / "Ôn tập ngay", Collection Detail) đều mở `app/screens/Practice/screen.tsx`, chạy trên dữ liệu giả `testData` (`Practice/example.ts`, khác hình dạng AISense thật). Chưa chọn bộ từ, chưa có thư viện FSRS, chưa ghi `user_sense_progress` / `learn_session`. `app/screens/Learning` trống.
- Vòng lặp hiện tại: mỗi thẻ qua lần lượt từng phương pháp trong `method` (ghi cứng `["write", "listen"]`). Sai được làm lại 1 lần ("1 nhát"), sai lần 2 thì lùi 1 bước và bị đẩy về sau. Thẻ vừa trả lời bị đẩy cuối rồi xáo nhẹ (`reorderArrayWithWeight`). Hết bước thì bài nối từ ↔ nghĩa (`lastQuestion.tsx`) rồi hỏi học tiếp. Thoát là mất tiến độ. Chấm = so chữ thường với `word`.
- `utils/makeQuestion.tsx`: write → mặt trước che từ (ảnh + định nghĩa + ví dụ), mặt sau bản dịch, gõ; listen → chỉ âm thanh, gõ; speak → từ + ảnh, nói, tự lật; chooseWord → như write, chọn. Tắt nghe / nói (`hearable` / `talkable`, chỉ trong bộ nhớ) thì đổi sang gõ.
- `configs/cardOptions.tsx`: đã có thiết kế cấp 0–7 (`memoryLevelCardCases`), danh sách phần tử thẻ (`CARD_ELEMENT`), mặt sau (`backCardInfo`), 6 điều kiện lật (`flipCondition`); chưa nối vào màn học. Trả lời: gõ chạy được, chọn từ dùng đáp án giả, chọn ảnh / nói là file rỗng.

## 2. Nguyên tắc dữ liệu

- Nội dung cấp cao (mẹo `pro_tip`, `cultural_note`, `etymology`, `grammar_note`, `explanation`, câu hỏi) do **user hoặc seeder gõ tay**, không để AI sinh (dữ liệu học thuật dễ sai). Thiếu thì quay về các kiểu thẻ cơ bản.
- Mỗi phương pháp khai báo **dữ liệu cần** (ảnh, âm thanh, ví dụ, từ đồng nghĩa, ≥ N đáp án nhiễu...) và **cấp tối thiểu**; tạo phiên thì bỏ phương pháp thiếu dữ liệu. Đặt trong code app (registry), không lưu DB.
- Ảnh chỉ dùng cho danh từ cụ thể có ảnh. Âm thanh: TTS trên máy (chưa có file audio).
- Điền chỗ trống cần biết vị trí từ trong câu ví dụ (từ biến đổi `runs`, `ran` thì `split(word)` không thấy) -> cần AI đánh dấu lúc tạo từ (việc backend, chưa làm).

## 3. Các phương pháp học

Thứ tự trong phiên: ôn (vuốt) trước vì nhanh, rồi học cụm từ mới. Setting `new_word_first` mặc định đổi thành `false`.

### 3.1 Học theo cụm (từ mới / cấp thấp)
Mỗi phiên 1 cụm 4–10 từ (`cluster_size`), mỗi từ qua 4–8 bước (`cluster_steps`), từ nhận ra → nhớ lại → tự nói / viết:
0. Thẻ đầy đủ, gõ lại từ (cấp 0, "ghi lại nguyên mẫu").
1. Nhìn từ, chọn nghĩa.
2. Nhìn định nghĩa / ảnh, chọn từ.
3. Nghe, chọn từ.
4. Điền chỗ trống trong câu ví dụ.
5. Nhìn định nghĩa, gõ từ.
6. Nghe, gõ (chính tả).
7. Nói.

Chi tiết:
- Đáp án nhiễu lấy từ **chính cụm đang học** trước, rồi từ cùng loại từ trong bộ; bỏ từ đồng nghĩa (`advanced.synonyms`).
- Giãn cách trong phiên: không hỏi 1 từ ở 2 thẻ liền nhau, khoảng cách tăng dần (sau 1, 3, 5 thẻ khác) thay vì đẩy cuối + xáo.
- Gợi ý từng nấc thay vì sai là mất lượt: chữ cái đầu → số chữ cái → hiện đáp án. Số gợi ý = tín hiệu chấm (không gợi ý = Good, có gợi ý = Hard, phải hiện = Again).
- Chấm gõ dễ tính: sai 1 ký tự = "gần đúng" (Hard), bỏ qua dấu / hoa thường, tiếng Nhật nhận cả kana lẫn kanji.
- Rút ngắn: đúng ngay 2 bước đầu hoặc `max_level` cao (đang học lại) thì bỏ bớt bước.
- Cuối cụm: bài nối từ (đã có) + một vòng "chỉ các từ đã sai". Bài nối từ không tính vào FSRS.

### 3.2 Vuốt (từ cấp ≥ 3, `swipe_min_level`)
- Thẻ xếp chồng. Mặt trước toàn tiếng đích: từ, ảnh, định nghĩa, ví dụ. Mặt sau là tiếng mẹ đẻ (bản dịch), chỉ để cứu khi không hiểu, hạn chế thói quen tự dịch trong đầu. Không bắt lật.
- Mỗi thẻ có **điểm khó trong phiên**, bắt đầu từ 0 (chốt 2026-11-02):
  - **Vuốt "nhớ"** (mặc định trái, cùng chiều cuộn thông thường): xong thẻ. Điểm 0 → Good, điểm 1–2 → Hard.
  - **Vuốt "chưa chắc"** (mặc định phải): điểm +1. Dưới 3 thì thẻ quay lại deck (chèn vào giữa phần còn lại); đạt 3 thì tính quên (Again).
  - **Lật thẻ** (xem tiếng mẹ đẻ): điểm lên thẳng 3 = quên, vuốt hướng nào sau đó cũng vậy.
  - Thẻ quên: quay lại deck 1 lần để xem lại (không tính FSRS), lần sau về học cụm (hạ cấp).
- Không có Easy trong vuốt (user hay lạm dụng Easy làm khoảng ôn quá dài). Điểm 1 và 2 cùng là Hard với FSRS, khác nhau ở thống kê / độ khó (`attempts` = điểm khó lúc chốt).
- Mỗi thẻ 1 dòng `is_fsrs=1` lúc chốt (vuốt "nhớ", điểm đạt 3, hoặc lật); các lần vuốt "chưa chắc" trước đó `is_fsrs=0`.
- Lật tốn điểm nặng nên tránh lật nhầm: lật bằng nút "Xem nghĩa" / giữ lâu, không phải chạm nhẹ. Có nút hoàn tác. Cho đảo chiều vuốt trong setting (`swipe_direction`).
- Thời gian từ lúc thẻ hiện tới lúc vuốt (`duration_ms`) chỉ ghi để thống kê, chưa dùng chấm: tự dừng đếm khi app ra nền, có nút tạm dừng, bỏ giá trị quá 60s.
- Có nút hoàn tác. Đảo chiều ngẫu nhiên (nghĩa → từ khó hơn, dành cho cấp cao).

### 3.3 Giọng nói (từ cấp nhất định, `voice_min_level`)
- Nhận dạng **trên máy** (iOS Speech, Android SpeechRecognizer, vd `expo-speech-recognition`): trễ thấp, miễn phí, có tiếng Nhật. Bật kết quả tạm thời, thấy khớp là chấm đúng luôn.
- Âm quá ngắn (1 chữ kana) nhận dạng kém. Chấm theo **cách đọc**: đổi kết quả và đáp án về kana rồi so (bộ nhận dạng có thể trả kanji đồng âm).
- Không phát TTS khi đang ghi âm. Bấm giữ để nói, thả là dừng (hoặc tự dừng khi im lặng).
- Sai 2 lần: cho nghe lại giọng mình + giọng mẫu rồi tự chấm, hoặc chuyển sang gõ. Không có quyền mic: `talkable=false`.
- Chấm phát âm chi tiết (từng âm) cần dịch vụ trả phí (vd Azure Pronunciation Assessment): để dành VIP.
- Chế độ nhại theo (shadowing): nghe rồi nói theo, không chấm. Hợp với bảng chữ cái / phát âm.

### 3.4 Phương pháp khác (để dần)
| Phương pháp | Dữ liệu cần | Ghi chú |
|---|---|---|
| Chọn nghĩa theo ngữ cảnh | ≥ 2 nghĩa của cùng từ (có sẵn) | Câu có `bank`, chọn nghĩa đúng. Điểm riêng của app vì dữ liệu chia theo nghĩa. |
| Ghép chữ / kana | chỉ cần từ | Bấm ô chữ xáo trộn. Dễ hơn gõ cho người mới học Nhật / Hàn. |
| Đúng / sai nhanh | từ + nghĩa | Vuốt đúng / sai, hợp chế độ vuốt hoặc tính giờ. |
| Chơi tính giờ | từ cấp ≥ 3 | Trắc nghiệm 60s, không tính FSRS. |
| Chính tả câu | âm thanh câu ví dụ | Cấp cao. |
| Đồng / trái nghĩa | metadata `advanced` (có sẵn) | |
| Tự đặt câu | không | Không chấm; lưu `user_note`. Sau có thể cho AI chấm (VIP). |
| Từ hay quên | `forget_count` | Đánh dấu, nhắc ghi mẹo nhớ riêng (`user_note`), đưa về học cụm. |

## 4. Ghi dữ liệu (đã sửa schema ngày 2026-11-01, xem `flashwise_api/NEXT_SESSION.md`)

- `review_log` (bảng mới ở app, khớp server): mỗi lần chấm 1 dòng, chỉ thêm. `is_fsrs=1` là lần chấm đưa vào FSRS (1 dòng / thẻ / phiên); các bước trong phiên học cụm và lần thẻ quay lại ghi `is_fsrs=0` để thống kê. `mode` = mã phương pháp dạng `<kiểu phiên>:<phương pháp>` (vd `learn:cloze`, `learn:write`, `review:swipe`, `voice:speak`) để sau này thống kê phương pháp nào giúp nhớ lâu. `level` = cấp thẻ lúc chấm, `hint_count`, `attempts`.
- `user_sense_progress.level` / `max_level`: **cấp thẻ 0–7** (quyết định kiểu thẻ / phương pháp), mặc định 0. `state` vẫn là trạng thái FSRS. Thêm `scheduled_days`, `learning_steps` cho đủ trường Card của `ts-fsrs`.
- `learn_session`: `collection_id`, `status` (in_progress / completed / abandoned), `methods` (JSON mã phương pháp đã bật), `new_count`, `review_count`, `correct_count`, `wrong_count`, `xp_earned`; `snapshot` (JSON, chỉ ở máy, không sync) để học tiếp phiên dở.
- `user_settings` thêm key: `study_methods`, `cluster_size`, `cluster_steps`, `swipe_min_level`, `voice_min_level`, `hearable`, `talkable`, `learning_direction`, `request_retention`.

## 5. Luồng học đã chốt (2026-11-02)

Đơn vị học là **nghĩa** (1 thẻ = 1 nghĩa, tiến độ theo `original_sense_id` nên 1 nghĩa nằm ở nhiều bộ vẫn chỉ 1 tiến độ).

1. **Tải bộ từ** về máy kèm đủ dữ liệu học offline (nghĩa, bản dịch ngôn ngữ user, metadata, ảnh, ipas / audio). Thiếu bản dịch thì chờ dịch bù trước khi học.
2. **Học mới** từ 1 bộ, cấu hình phiên: số nghĩa (`cluster_size`), số bước (`cluster_steps` 5–8). Không xếp 2 nghĩa của cùng 1 từ vào 1 cụm. Thẻ giới thiệu có nút **"Đã biết"**: lên thẳng **cấp 5**, khởi tạo FSRS như chấm Easy, bỏ khỏi cụm.
3. **Màn học**: đi lần lượt từng nghĩa, giãn cách trong phiên (3.1).
4. **Kết thúc**: bảng tổng kết, mỗi nghĩa chọn sẵn Dễ / Vừa / Khó / Quên theo kết quả phiên, user sửa nếu thấy sai. Mỗi thẻ 1 dòng `is_fsrs=1`.
5. **Lần sau**: có thẻ đến hạn thì hiện **"Học lại" trước "Học mới"**.
6. **Vuốt** mở từ cấp 3.
7. **Thống kê**: ghi mọi lần chấm vào `review_log` để tính thống kê cá nhân, độ khó chung của nghĩa và hiệu quả từng phương pháp.

### 5.1 Khởi tạo độ khó: 7 phần phiên học, 3 phần toàn server
Lần học đầu chỉ là 1 lần đo nên dễ phiến diện; độ khó chung của mọi user kéo về cho cân bằng.
- **Điểm chấm lần đầu** (quyết định `stability` ban đầu): lấy từ kết quả phiên (không gợi ý = Good, có gợi ý / sai 1 ký tự = Hard, phải hiện đáp án / sai 2 lần = Again), user tự đánh giá chỉ đẩy lên / xuống tối đa 1 nấc.
- **Độ khó ban đầu** `D0 = 0,7 × D_phiên + 0,3 × D_server` (thang FSRS 1–10). `D_phiên` = độ khó FSRS ứng với điểm chấm trên; `D_server` = trung bình độ khó ban đầu của các user khác với nghĩa này.
- Nghĩa ít người học thì `D_server` chưa đáng tin: trọng số giảm theo số người học `n`, `w = 0,3 × n / (n + 20)`, `n < 5` thì `w = 0` (dùng 100% phiên học). Số 20 / 5 chỉnh sau khi có dữ liệu.

### 5.2 Cấp và số bước
- Số bước học cụm theo cấp: `max(3, cluster_steps − cấp)`. Cấp 0 = 5–8 bước (đủ nghe, nói, đọc, viết), mỗi cấp giảm 1, tối thiểu 3.
- Cấp ≥ 3 (`swipe_min_level`): ôn được bằng vuốt.
- Lên / xuống cấp (tạm, chỉnh khi test thật): học xong từ mới → cấp 1 (Easy → 2); mỗi lần ôn Good / Easy +1, Hard giữ nguyên, Again −2 (tối thiểu 0), tối đa 7. **Vuốt chỉ đưa tối đa tới cấp 5**: cấp 6–7 phải qua 1 lần tự nhớ lại (gõ / nói).

### 5.3 Ôn lần đầu trong cùng ngày
Kinh nghiệm thực tế: sáng học, tối ôn thì 2 ngày sau vẫn nhớ rõ; học xong để cách 1 ngày mới ôn thì dễ rối và quên. Nên từ mới có **1 bước học ngắn hạn cùng ngày** (FSRS `learning_steps`, mặc định `['6h']`, setting `first_review_hours`) trước khi FSRS hẹn khoảng ôn dài. Lần ôn tối đi theo số bước của cấp hiện tại. Cần kiểm tra lại cú pháp `learning_steps` của `ts-fsrs` khi cài (app chưa cài thư viện này).

### 5.4 Vuốt: khoảng ôn ngắn hơn
Vuốt là nhận ra + tự chấm nên yếu hơn tự nhớ lại. Không sửa `stability`; khi tính lịch cho lần chấm `review:swipe` dùng mục tiêu nhớ cao hơn: `request_retention = 0,93` (setting `swipe_retention`) thay vì 0,90 → khoảng ôn ngắn hơn khoảng 30%.

### 5.5 Không giới hạn số thẻ / ngày
Giới hạn chỉ làm lượng tồn tăng dần. Không có trần ôn / ngày; thẻ đến hạn sắp theo xác suất còn nhớ thấp nhất trước (quá hạn lâu đứng đầu), vuốt giúp xử lý nhanh. Số từ mới do cấu hình phiên quyết định. "Đến hạn" = `next_review_at` ≤ cuối ngày theo múi giờ user, ngày mới bắt đầu lúc 4h sáng (`day_start_hour`).

### 5.6 Thống kê và chỉ số phương pháp
- Hiệu quả phương pháp đo bằng **lần ôn FSRS kế tiếp** (thẻ học bằng `learn:cloze` thì lần ôn sau còn nhớ không), không bằng tỉ lệ đúng trong phiên. Làm mượt khi ít dữ liệu, chỉ dùng khi phương pháp có ≥ ~30 lần. Chỉ số này chỉ đổi **tỉ lệ chọn phương pháp** khi tạo phiên (`method_weights`), không đổi FSRS.
- Thống kê cá nhân tính trên máy từ `review_log`.
- Thống kê chung của nghĩa do server cộng dồn khi nhận `review_log`, chỉ dòng `is_fsrs=1` mới chèn (push lặp lại không cộng 2 lần).
- Nghĩa bị quên ≥ 4 lần: đánh dấu "hay quên", gợi ý ghi mẹo nhớ riêng (`user_note`).

### 5.7 Học tiếp phiên dở
Đã làm (`learning/snapshot.ts`): sau mỗi bước, trạng thái máy học (`RunState` / `SwipeState`, thuần JSON) được ghi vào `system_configs` khoá `run_snapshot:learn:<userCollectionId>` hoặc `run_snapshot:review`. Chọn `system_configs` thay vì cột `learn_session.snapshot` vì bảng đó có trigger sync (mỗi lần ghi sẽ đẩy cả phiên chưa xong lên server); cột `snapshot` hiện không dùng. Mở lại trong **1 giờ** thì hỏi "Học tiếp / Bắt đầu cụm mới" (Ôn: "Ôn tiếp / Nạp lượt mới"); quá 1 giờ hoặc JSON hỏng thì bỏ. Lưu kết quả thành công thì xoá snapshot. Chưa lưu kết quả thì chưa có dòng `review_log` / `user_sense_progress`, nên bỏ phiên dở không để lại dữ liệu nửa vời. Bước đang dở được tính giờ lại từ lúc học tiếp.

### 5.8 Dữ liệu chấm của từng kiểu phiên
FSRS chỉ cần **1 điểm chấm (Again / Hard / Good / Easy) + thời điểm** cho mỗi thẻ mỗi phiên; mọi thứ khác là để quy ra điểm đó.
- **Học mới**: user chỉ làm bài, không phải tự chấm từng bước. Mỗi bước ghi `correct`, `hint_count`, `attempts`, `duration_ms`. Cuối phiên app quy ra điểm (bước nhớ lại phải hiện đáp án / sai 2 lần → Again; có gợi ý / gần đúng → Hard; còn lại → Good; mọi bước đúng ngay, không gợi ý, nhanh hơn thời gian trung vị của chính user → Easy), hiện bảng tổng kết chọn sẵn, user sửa tối đa ±1 nấc.
- **Học lại (học cụm theo cấp)**: điểm lấy theo **bước đầu tiên** (lúc user chưa được nhắc lại, đúng là đang đo trí nhớ); các bước sau là học lại, chỉ hạ điểm nếu sai nặng, không nâng.
- **Vuốt**: điểm khó trong phiên (3.2), mỗi lần vuốt "chưa chắc" +1, lật = 3: chốt ở 0 = Good, 1–2 = Hard, 3 = Again.
- **Giọng nói**: đúng lần đầu = Good, đúng sau khi thử lại = Hard, sai / bỏ qua = Again.

## 6. Việc cần làm

### Backend
| # | Việc | Ghi chú |
|---|---|---|
| 1 | ~~`GET user-collections/{id}/bundle?user_lang`~~ | Xong 2026-11-02: từ + nghĩa + metadata + dòng bộ từ theo cột SQLite, `pending`, `etag` |
| 2 | ~~Sync `user_collection`~~ | Xong: `sync/pull` có `user_collection`; `collection_items` lấy qua bundle (dòng đã gộp nháp / phát hành, không sync từng dòng thô) |
| 3 | ~~`AISense.global_difficulty`, `learner_count`~~ | Xong: cộng dồn khi push `review_log` (lần `is_fsrs=1` đầu của user, độ khó theo điểm chấm, tham số FSRS-6), cộng số lần quên / nhớ |
| 4 | ~~Trả `global_difficulty`, `learner_count`~~ | Xong: trong get-word, bundle, các API nghĩa; cột mới ở `ai_sense` (cùng `original_id`, `delta`) |
| 5 | ~~Seed key `user_settings`~~ | Xong ở app: `first_review_hours`, `swipe_retention`, `day_start_hour`, `swipe_direction`, `method_weights`; `review_limit` = 0 (không giới hạn) |
| 5b | ~~`GET /api/learn/new/`, `GET /api/learn/review/`~~ | Xong 2026-11-02, tách 2 API: học mới (`count` nghĩa của 1 bộ, không 2 nghĩa cùng từ) và ôn tập (`mode` normal / quick, theo bộ hoặc mọi nghĩa, R thấp nhất trước); kiểu mới thêm vào `NEW_MODES` / `REVIEW_MODES` |
| 5c | ~~`POST /api/learn/new/complete/`, `POST /api/learn/review/complete/`~~ | Xong 2026-11-02: server tính FSRS (py-fsrs, cùng tham số ts-fsrs), khởi tạo / chấm tiếp tiến độ theo 5.1–5.4, ghi log / phiên / thống kê ngày; gửi lại cùng phiên không áp 2 lần. App gửi điểm chấm cuối mỗi thẻ (`gradeMapper` ở app) + các bước |
| 6 | Sau: `GET me/fsrs-params` | Tối ưu tham số FSRS riêng từng user từ `review_log` |

### App
- `fsrsService`: bọc `ts-fsrs` (khởi tạo thẻ theo 5.1, chấm theo phương pháp với mục tiêu nhớ riêng, bước học cùng ngày).
- `gradeMapper`: tín hiệu phiên (gợi ý, số lần sai, thời gian) + tự đánh giá → điểm chấm.
- `levelPolicy`: luật cấp 5.2, trần cấp cho vuốt.
- `sessionBuilder`: thẻ đến hạn trước, rồi từ mới; không 2 nghĩa cùng từ trong cụm; chọn phương pháp theo cấp + dữ liệu có sẵn + `method_weights`; xếp giãn cách.
- `methodRegistry`, `answerChecker` (sai 1 ký tự, kana / kanji), `distractorPicker`, `statsAggregator`, `dueQueue` (mốc 4h sáng, đếm thẻ đến hạn cho Home).

## 7. Chưa chốt
- Các con số trong 5.1 / 5.2 / 5.3 (trọng số theo số người học, bước cấp, `6h`): chỉnh khi test thật.
