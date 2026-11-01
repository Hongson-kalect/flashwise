# Thiết kế phần học từ vựng

Ghi từ buổi thảo luận ngày 2026-11-01 (phiên backend `flashwise_api`). Phần cấp / độ khó / thuật toán ngắt quãng chi tiết **chưa chốt**, làm sau.

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
- Thẻ xếp chồng. **Bắt lật thẻ rồi mới cho vuốt** (vuốt trước khi xem mặt sau là đoán).
- Đủ 4 mức FSRS, ít nhất phải có "Nhớ": vuốt phải = Nhớ (Good, dùng nhiều nhất), vuốt trái = Quên (Again), nút Khó (Hard) / Dễ (Easy). Chỉ dễ / khó / quên thì user hay bấm "khó" cho thẻ nhớ bình thường, khoảng ôn bị ngắn.
- Khó / quên: chèn lại vào giữa phần còn lại của bộ (1/2 deck). Quên 3 lần trong phiên thì rút khỏi vuốt, hạ cấp để lần sau quay về học cụm.
- **Chỉ lần chấm đầu tiên của mỗi thẻ trong phiên** vào FSRS; lần quay lại chỉ củng cố.
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

## 5. Chưa chốt
- Cách đổi kết quả sang điểm FSRS cho học cụm (đề xuất ở 3.1), luật lên / xuống cấp, ngưỡng cấp cho từng phương pháp.
- Có cho học tiếp phiên dở không (đã có cột `snapshot` sẵn).
- Từ ôn lại đi qua mấy bước (đề xuất: vuốt 1 lần nếu cấp ≥ 3, còn lại 1–2 bước của học cụm theo cấp).
