# Case test thủ công: tra từ và hiển thị nghĩa (2026-11-12)

Môi trường: backend Docker (535 từ en, 2.085 nghĩa), emulator `FastFast_API36`, Metro `expo start --dev-client`, app gọi `http://10.0.2.2:8000`. Ngôn ngữ học `en`, ngôn ngữ dịch `vi` (kiểm ở tab Cá nhân trước khi test).

Theo dõi khi thao tác:
- Metro (log app): `/tmp/metro.log`.
- Backend: `docker compose logs -f web ai_worker` ở `D:\Code\flashwise_api`.

Cách tra: ô "Tra từ bất kỳ…" ở Trang chủ, gõ từ rồi Enter. Ghi kết quả vào cột cuối (Đạt / Lỗi + mô tả).

## A. Từ đã seed (đọc local / server, không tốn AI)

| # | Từ | Thao tác | Mong đợi | Kết quả |
|---|---|---|---|---|
| A1 | `house` (6 nghĩa) | Tra lần đầu | Hiện nghĩa gần như ngay, vài giây có bản dịch vi; mỗi nghĩa có loại từ, định nghĩa, ví dụ, ảnh (hoặc ô ảnh trống không vỡ layout) | |
| A2 | `house` | Thoát ra, tắt mạng emulator (airplane), tra lại | Hiện từ SQLite, không báo lỗi | |
| A3 | `tell` (7 nghĩa) | Tra, cuộn hết trang | Đủ 7 nghĩa, thứ tự hợp lý, không trùng; mở từng nghĩa (Sense) được | |
| A4 | `big` (4 nghĩa) | Tra, kéo xuống "Cùng nghĩa ở ngôn ngữ khác" | Mục concept hiện hoặc ẩn gọn khi không có tương đương; không crash | |
| A5 | `number` (7), `saw` (3) | Tra | `saw`, `number` là dạng chia có nghĩa riêng: hiện nghĩa riêng, không bị chuyển hướng sang `see` / `numb` | |
| A6 | `look` | Tra | Phần "Biến thể" liệt kê looks, looked, looking | |
| A7 | `Tell`, `  tell  ` | Gõ hoa đầu, thừa khoảng trắng | Ra cùng từ `tell` | |

## B. Dạng chia (`FORM_OF` / `redirect`)

| # | Từ | Mong đợi | Kết quả |
|---|---|---|---|
| B1 | `looked` (chưa có mục) | Chuyển sang `look`, hiện banner "là dạng quá khứ của look" kèm nghĩa của `look`; tab Từ vựng chỉ có `look`, không có `looked` | |
| B2 | `children` | Chuyển sang `child` (nếu `child` chưa seed thì server tạo online như từ mới, xem mục C) | |
| B3 | `bigger` | Chuyển sang `big`, banner "dạng so sánh hơn của big" | |
| B4 | `told` | Chuyển sang `tell` | |
| B5 | `came` (có AIWord, 3 nghĩa) | Hiện nghĩa của `came` hoặc banner "cũng là dạng của come" (`also_form_of`), không lặp vô hạn | |
| B6 | `comes` (AIWord rỗng 0 nghĩa, từng bị từ chối) | Không crash; hiện thông báo hợp lý hoặc chuyển sang `come` | |
| B7 | `been`, `days`, `went` | Như B5: có mục riêng hoặc chuyển hướng, nhưng nhất quán | |

## C. Từ mới, chọn tiếp theo danh sách seed (cần Claude + Gemini key, tốn AI)

Nguồn: `en_lemmas_ref.jsonl`, hạng 507 trở đi, chưa có trong DB: `cause`, `ahead`, `lose`, `king`, `plan`, `dinner`, `boss`, `promise`, `safe`, `sort` (`living`, `running` bỏ qua vì là dạng -ing).

| # | Từ | Thao tác | Mong đợi | Kết quả |
|---|---|---|---|---|
| C1 | `dinner` (8 nghĩa nguồn, ít) | Tra, đứng yên xem | Trạng thái "đang khởi tạo", nghĩa hiện dần (PARTIAL_*), cuối cùng đủ nghĩa + dịch vi + ảnh. Ghi thời gian từ lúc Enter tới đủ | |
| C2 | `dinner` | Thoát ra, tra lại | Đọc local ngay, không hỏi server nếu bản đã final (kiểm log backend không có get-word) | |
| C3 | `king` (23 nghĩa nguồn) | Tra | Nghĩa nhiều: số nghĩa hiển thị hợp lý (không đổ cả 23), không trùng, có từ loại danh / động | |
| C4 | `ahead` (adv, ít nghĩa) | Tra | Từ chỉ có trạng từ hiển thị đúng loại từ | |
| C5 | `lose` | Tra, rồi tra `loses` | `loses` chuyển sang `lose` + banner | |
| C6 | `plan` | Tra, mở mục "Biến thể" | Có plans, planned, planning; `planned` tra riêng cũng về `plan` | |
| C7 | `boss`, `promise` | Tra liên tiếp 2 từ khi `boss` chưa xong | Không lẫn nghĩa giữa hai từ; hai phòng socket độc lập | |
| C8 | `safe` | Tra khi tắt mạng giữa chừng (bật airplane sau 2 giây) | Có thông báo lỗi + nút thử lại; bật mạng, bấm thử lại chạy tiếp | |
| C9 | `cause` | Vừa tra vừa thoát về Home | Backend vẫn tạo xong; vào lại thấy từ đủ | |
| C10 | `xyzqq` | Tra từ vô nghĩa | Báo không tìm thấy / không hợp lệ rõ ràng, không treo "đang khởi tạo" | |

Sau mỗi từ C: kiểm tab **Từ vựng** (từ xuất hiện đúng 1 dòng kèm số nghĩa) và đếm lại số từ trong DB nếu cần:
```bash
cd D:\Code\flashwise_api && docker compose exec -T web python manage.py shell -c "from ai.models import AIWord; print(AIWord.objects.count())"
```

## D. Hiển thị nghĩa (trên từ đã có đủ dữ liệu như `house`, `tell`)

| # | Kiểm | Mong đợi | Kết quả |
|---|---|---|---|
| D1 | Đổi ngôn ngữ dịch (vi → en / zh) ở Cá nhân, tra lại `house` | Bản dịch đổi theo; ngôn ngữ chưa có bản dịch thì làm mới nền, nội dung cũ không nháy mất | |
| D2 | Ảnh nghĩa | Ảnh tải được từ `media_base_url`; nghĩa chưa có ảnh dùng ảnh mở hoặc ô trống | |
| D3 | Ví dụ, collocation, ghi chú dùng | Hiện đúng từ cần học được đánh dấu; không có chuỗi `null` / `undefined` | |
| D4 | Phát âm (IPA, audio) | IPA hiện; nút audio phát được hoặc ẩn khi không có file | |
| D5 | Xoay màn hình / chữ lớn | Layout không vỡ | |
| D6 | Menu ba chấm → "Thêm nghĩa mới" | Mở sheet, gõ định nghĩa gửi được (lỗi hook ở `addSenseSheet.tsx:177` có thể crash tại đây: ghi lại nếu có) | |

## Cách báo lỗi cho mình
Với mỗi case lỗi: mã case, ảnh chụp hoặc mô tả, và đoạn log Metro / backend tại thời điểm đó. Mình sẽ gom lại, tra nguyên nhân rồi sửa theo `docs/TODO-frontend.md` mục liên quan.

## Kết quả chạy tự động qua adb (2026-11-12, Claude)

Thao tác bằng `adb input` trên emulator, đối chiếu log `web`. Chưa chạy: A2, A3, A4, A6, A7, B2 (chỉ thấy banner), B4, B7, C3, C4, C6–C10, D1–D6.

| Case | Kết quả |
|---|---|
| A1 `house` | Đạt: Noun 5 + Verb, IPA, tag nghĩa vi, ảnh, định nghĩa + dịch, ví dụ + dịch |
| A5 `saw` | Đạt: hiện nghĩa riêng (Noun cưa, Verb 2) kèm banner "cũng là dạng quá khứ của see" |
| B1 `looked` | Đạt: banner "là dạng quá khứ của look", ví dụ riêng của dạng đã tra gắn nhãn "looked · quá khứ" |
| B2 `children` | Đạt: banner "dạng số nhiều của child", 3 nghĩa |
| B3 `bigger` | Đạt về chuyển hướng + banner; **ảnh nghĩa của `big` là hình ngôi nhà** (dữ liệu ảnh sai nghĩa, cần xem lại) |
| B5 `came` | Đạt về hiển thị, nhưng **dữ liệu cũ vẫn còn nghĩa kiểu "Past tense of 'come'"** (từ seed trước khi có luật cấm dạng chia) |
| B6 `comes` | get-word 404, app hiện lỗi chung "Không thêm được mục này" (không crash). `come` có trong DB nên **nên chuyển hướng sang `come` thay vì báo lỗi** |
| C1 `dinner` | Đạt: 201, hiện dần (nghĩa + IPA trước, tag dịch và dịch ví dụ về sau), cuối cùng Noun 2 đủ dịch; banner "đang khởi tạo" tự tắt |
| C2 `dinner` tra lại | Không như mong đợi nhưng đúng thiết kế: vẫn gọi get-word (200) vì nghĩa chưa có `image_preview` (`needsRefresh`, cooldown 10 phút) |
| C5 `loses` | Đạt: redirect sang `lose` chưa seed, server tạo mới (201), Verb 7 nghĩa, banner "dạng ngôi 3 số ít của lose" |

Phát hiện khác:
1. **Ảnh không bao giờ ra**: ComfyUI không chạy (`host.docker.internal:8188` unreachable), job ảnh bị giữ và nghỉ 30s; app hiện "Đang tạo hình minh hoạ…" mãi. Môi trường, không phải lỗi app, nhưng ô này không có trạng thái "không có ảnh".
2. **Biểu tượng cạnh tiêu đề "Definition" hiện ô vuông (tofu)**: thiếu glyph / icon font ở mục này (mục Usage có icon kính lúp bình thường).
3. Tiêu đề trang viết hoa chữ đầu ("Looked", "Comes"): chưa rõ chủ ý.

### Xem lại sau vòng 1 (2026-11-12)
- **B6 `comes`**: nguyên nhân là `comes` có `AIWord` REJECTED (0 nghĩa) nên `get-word` bỏ qua bước `resolve_form` dù `WordForm` có `comes → come`. Đã sửa `ai/views/AIWord.py` (cũng xét dạng chia khi mục riêng REJECTED / BANNED). Chạy lại: 200, banner "dạng ngôi 3 số ít của come", Verb 6 + Noun. Đạt.
- **B5 `came`**: nghĩa "Past tense of" giữ nguyên, chấp nhận.
- **Ảnh nghĩa sai (`big`)**: bỏ qua, sẽ rà lại một lượt sau.
- **ComfyUI**: đã bật, redis tự đẩy lệnh vẽ.
- **Icon "Definition" ô vuông**: do `FontAwesome6` mặc định kiểu regular, bản miễn phí thiếu `book`, `pen`, `code-branch`, `quote-left`, `save`, `xmark`... Sửa ở `components/AppIcon.tsx` (nhánh `fa6` luôn `solid`). Đã kiểm trên máy: icon sách hiện đúng.

## Kết quả vòng 2 (2026-11-12, chạy qua adb)

Chưa chạy: A4 (mục concept), A7 chạy `Tell` (ra đúng `tell`; chuỗi có khoảng trắng chưa thử), D1, D3–D6, B7 `been` kiểm kỹ.

| Case | Kết quả |
|---|---|
| A3 `tell`, A6 `look` | Đạt: Verb 6 + Noun, Verb 5 + Noun 2; ví dụ chia dạng (told, telling) hiện trong ví dụ |
| A7 `Tell` | Đạt, ra cùng `tell` |
| B4 `told` | Đạt: banner "dạng quá khứ / phân từ quá khứ của tell", ví dụ riêng gắn nhãn |
| B7 `been`, `days`, `went` | `been` → banner "dạng phân từ quá khứ của be"; `days` → banner "số nhiều của day"; `went` không banner vì `go` chưa có trong DB (đúng). `been` hiện nghĩa riêng "Past participle of 'be'" với **ảnh là cuốn hộ chiếu** (sai nghĩa) |
| C3 `king`, C4 `ahead`, C6 `plan` | Đạt: 4 nghĩa Noun, Adverb 3 + Adjective, Noun 2 + Verb 2; ảnh đã ra (ComfyUI bật) |
| C6 `planned` | Đạt về chuyển hướng + banner, nhưng **mở ở tab Noun** dù đây là dạng quá khứ của động từ (nên mở đúng loại từ của form) |
| C7 `boss` + `promise` liên tiếp | Đạt: không lẫn nghĩa giữa hai từ, quay lại `boss` đủ dữ liệu + ảnh |
| C8 `safe` mất mạng giữa chừng | Trang đang mở **kẹt "Từ đang được khởi tạo…" mãi**, không báo lỗi, không nút thử lại (HTTP đã gửi trước khi mất mạng, chỉ còn chờ socket). Tra lại sau khi có mạng: đủ Adjective 4 + Noun |
| C9 `cause` thoát giữa chừng | Đạt: backend tạo xong (COMPLETED, 4 nghĩa), vào lại thấy đủ |
| C10 `xyzqq` | Server tạo (201) rồi từ chối; app hiện lỗi đỏ với **chuỗi tiếng Anh thô "Word rejected"**, trong khi `comes` trước đó hiện câu tiếng Việt: hai thông báo từ chối không đồng nhất |
| A2 `house` offline | Báo "Không có kết nối" thay vì hiện từ local: **do `LOCAL_WORDS_ENABLED = false`** (`configs/local.ts`, cố ý tắt khi server đổi cấu trúc). Nghĩa là toàn bộ đọc / ghi local của trang từ đang tắt; C2 cũng hết ý nghĩa |

## Sửa và chạy lại (2026-11-12, sau vòng 2)

Quyết định: test hết luồng server trước, giữ `LOCAL_WORDS_ENABLED = false`, test local sau (để local không che lỗi ghi server).

| Lỗi | Sửa | Chạy lại |
|---|---|---|
| 2. Kẹt "đang khởi tạo" khi mất mạng | `useWordData.ts`: khi đang chờ tạo từ mà socket không về, hỏi lại get-word âm thầm mỗi 10 giây; quá 2 phút báo lỗi có nút "Thử lại" | `sort` (từ mới), tắt mạng 1,5 giây sau khi tra, giữ tắt 40 giây (vẫn quay), bật lại: 30 giây sau trang đủ Noun + Verb. Nhánh quá 2 phút chưa thử |
| 3. "Word rejected" tiếng Anh | `Detail/utils.ts`: socket REJECTED không dùng chuỗi của server, hiện lời giải thích tiếng Việt như 404 | `xyzqq3`: hiện câu tiếng Việt đầy đủ |
| 4. `planned` mở tab Noun | `Detail/[value].tsx`: mở bằng dạng chia thì nhảy tới loại từ của dạng đó (một lần mỗi lần mở) | `planned`: mở thẳng tab Verb |

## Kết quả vòng 3 (2026-11-12): D1, D3–D6, A4

| Case | Kết quả |
|---|---|
| A4 `big` | Trang đủ các mục: Definition, Usage, Note, Collocations ("Chưa có"), Discover (Từ liên quan, đồng nghĩa, trái nghĩa, Biến thể bigger / biggest, Tags). **Không có mục "Cùng nghĩa ở ngôn ngữ khác"**: DB mới có tiếng Anh nên không có tương đương, đúng. Cần seed ngôn ngữ thứ hai mới test được mục này |
| D3 | Đạt: không có chuỗi `null` / `undefined`; từ đồng nghĩa / trái nghĩa hiện dạng chip |
| D4 | Đạt: nút loa phát được (Google TTS trên emulator) |
| D6 | **Lỗi P1 đã tái hiện**: bấm "Gửi nghĩa" → màn đỏ "Rendered fewer hooks than expected" (`addSenseSheet.tsx`, `useFocused()` gọi sau các `return` sớm). Đã sửa: chuyển `useFocused()` lên đầu component. Chạy lại: gửi định nghĩa trùng nghĩa có sẵn → "Từ này đã có nghĩa tương tự" kèm nghĩa đã có (không tạo nghĩa mới trong DB), không crash |
| D1 | Chưa chạy: tab Cá nhân chỉ có "Ngôn ngữ: Tiếng Việt", chạm vào chưa thấy gì mở ra; chưa rõ chỗ đổi ngôn ngữ dịch |
| D2, D5 | Chưa chạy |

Phát hiện thêm:
1. **Crash native khi bấm Back từ trang từ** (`IllegalArgumentException: Scrapped or attached views may not be recycled`, `ViewPager2` / `react-native-pager-view`, lúc `onLayout`), một lần duy nhất sau khi bật / tắt dev menu; chưa tái hiện lại.
2. **Lỗi lúc reload JS**: `[Zustand] Khởi tạo dữ liệu thất bại: NativeDatabase.prepareAsync ... Cannot convert JavaScriptObject to Shareable` một lần khi mở lại app trong lúc inspector bật; khởi động sạch thì bình thường.
3. Màn Cá nhân: dòng đỏ tiếng Anh "You are not logged in" lẫn giữa giao diện tiếng Việt.
4. Menu ba chấm luôn có "Xoá nghĩa tự thêm" kể cả nghĩa không phải do người dùng thêm.

## Sửa các phát hiện vòng 3 (2026-11-12)

| Phát hiện | Xử lý |
|---|---|
| Menu ba chấm luôn có "Xoá nghĩa tự thêm" | Thực ra nút dẫn tới chế độ `update` với nút Delete rỗng (`onPress={() => {}}`). Thay bằng: nghĩa chính thức → "Ẩn nghĩa này" (`POST ai-senses/{id}/hide/`, chỉ ẩn trên trang từ của mình); nghĩa tuỳ chỉnh → "Xoá nghĩa này" (`DELETE ai-senses/{id}/`, server chỉ cho xoá nghĩa của mình chưa phát hành, 403 / 409 `sense_frozen` hiện toast). Có hộp xác nhận. Đã thử "Ẩn" trên `big`: Adjective 3 → 2, trang tải lại. Chưa có chỗ "Bỏ ẩn" trong app (đã bỏ ẩn thủ công trong DB sau khi thử); chưa thử nhánh Xoá |
| "You are not logged in" tiếng Anh, tên giả `Guess#1042011` | Màn Cá nhân: chữ tiếng Việt, tên lấy từ `userProfile.full_name`, mặc định "Khách" |
| Lỗi Zustand `prepareAsync` lúc reload | `bootstrapAppData` thử đọc DB lại một lần sau 400ms (lỗi chỉ thấy lúc reload dev; nếu rơi vào catch thì `settings = null` và app tưởng chưa cài đặt). Chưa tái hiện, nên chưa kiểm chứng được tác dụng |
| Crash `ViewPager2` khi Back | Thử 6 vòng mở từ / vuốt tab / Back không tái hiện, chưa sửa |
| Emoji trong định nghĩa | Backend `ai-senses/propose/` bỏ emoji / ký hiệu hình trước khi đếm độ dài và gửi AI |

## Ẩn / xoá / bỏ ẩn theo quyền sở hữu và test local (2026-11-12)

### Quy tắc menu ba chấm (trang từ)
- Nghĩa tuỳ chỉnh **của mình, chưa đóng băng** → "Xoá nghĩa này" (xoá mềm, `DELETE ai-senses/{id}/`).
- Mọi nghĩa còn lại (chính thức, của người khác, của mình đã phát hành / đóng băng) → "Ẩn nghĩa này" (`POST ai-senses/{id}/hide/`, chỉ ảnh hưởng trang từ của mình; người khác vẫn gọi theo id).
- Có nghĩa đang ẩn → thêm "Bỏ ẩn tất cả (n)".
- Quyền sở hữu, trạng thái đóng băng và danh sách ẩn lấy từ `GET ai-senses/mine/?word_id=` mỗi lần mở menu (bản lưu local không có `is_frozen`). Offline thì menu chỉ còn "Ẩn nghĩa này".
- Backend: `hide` chỉ từ chối POST khi nghĩa là của mình, không chính thức và chưa đóng băng; nghĩa của mình đã đóng băng ẩn được. `ai.test_senses` 59 test OK.
- Chạy trên máy ảo: nghĩa chính thức (`big`) → "Ẩn" (Adjective 3 → 2) → menu hiện "Bỏ ẩn tất cả (1)" → bỏ ẩn (về 3). Nghĩa của mình đóng băng (tạo tay trong DB) → "Ẩn nghĩa này" kèm lời nhắc "đã phát hành nên chỉ ẩn". Nghĩa của mình chưa đóng băng → "Xoá nghĩa này" → 204, trang tải lại, DB `is_deleted = True`. Dữ liệu thử đã dọn.

### Test local (`LOCAL_WORDS_ENABLED = true` tạm thời, đã tắt và xoá lại)
| Flow | Kết quả |
|---|---|
| Tra `house` lần đầu | Đạt: server 200, ghi SQLite 6 nghĩa |
| Tra lại `house` | Đạt: 0 lần gọi get-word (bản lưu đủ ảnh / dịch, không `draft`) |
| Tắt mạng, tra `house` | Đạt: hiện từ local |
| `looked` (dạng chia) khi `look` đã lưu local | Banner dạng chia vẫn hiện, nhưng **luôn gọi server** vì `looked` không có mục local; offline thì dạng chia không tra được (hạn chế đã biết) |
| Ẩn một nghĩa rồi mở lại | **Lỗi tìm ra:** bản local vẫn giữ nghĩa đã ẩn (`saveWord` chỉ thêm / thay, không bỏ nghĩa vắng mặt), mở lại ra Noun 5 trong khi server Noun 4. Đã sửa: `markSenseRemoved` (`database/queries/words.ts`) đánh dấu `is_deleted` khi ẩn / xoá và khôi phục khi bỏ ẩn. Chạy lại: local `is_deleted = 1`, mở lại ra Noun 4 |
| Tab Từ vựng | Đạt: 2 từ, 12 nghĩa (house 5 + look 7), tìm "lo" ra `Look`, gloss theo nghĩa đầu còn hiện |

Dọn: xoá `ai_word`, `ai_sense`, `sense_metadata` trong SQLite trên máy ảo (app dừng, sửa file DB rồi đẩy lại, `integrity_check` ok), `LOCAL_WORDS_ENABLED = false`, bỏ ẩn lại các nghĩa đã ẩn trong DB server. Kiểm sau cùng: `house` hiện đủ Noun 5, có gọi get-word (cờ tắt).

## Vòng 4 (2026-11-12): trang Ngôn ngữ, local bật, các case sense còn lại

`LOCAL_WORDS_ENABLED = true` và **giữ nguyên bật**, không xoá local (theo yêu cầu). Đã bỏ 429 / 500.

### Trang đổi ngôn ngữ (mới)
`app/screens/Profile/Language/screen.tsx`, mở từ Cá nhân → hàng "Ngôn ngữ" (hiện "English · Tiếng Việt"). Hai danh sách: ngôn ngữ đang học và ngôn ngữ dịch (danh sách chung ở `constants/languages.ts`, dùng lại ở màn Start). Chọn xong ghi `user_settings` + store; hai ngôn ngữ không được trùng (đổi sang ngôn ngữ kia thì ngôn ngữ còn lại tự đổi sang mặc định). Nút chuyển bản dịch / bản gốc ở trang từ lấy nhãn theo ngôn ngữ đã chọn thay vì "VI" / "EN" cố định.

### Kết quả
| Case | Kết quả |
|---|---|
| D1 đổi ngôn ngữ dịch vi → es | Đạt: `house` hiện bản dịch tiếng Tây Ban Nha (casa, vivienda, hogar; ví dụ dịch es). Local giữ cả es lẫn vi trong `contents`, đổi lại vi mở từ local ngay, không gọi server |
| A4 concept | Đạt: học tiếng Tây Ban Nha, `puerta` hiện mục "Cùng nghĩa ở ngôn ngữ khác → Tiếng Anh: door" |
| Propose: duplicate (`king`, `safe`) | Đạt |
| Propose: rejected không abuse (`king` + "slang: excellent...") | Đạt (`abuse: false`, có lý do) |
| Propose: official (`boss` + "Informal... excellent or very impressive", adjective) | Đạt: nghĩa mới thành chính thức ngay, đủ ví dụ, bản dịch, ảnh; trang từ hiện thêm tab Adjective |
| Propose: pending | Chưa gặp (cần phán quyết "không chắc") |
| "Sửa nghĩa này" (`boss`) | Đạt: tạo bản riêng, hiện nội dung đã sửa. Lỗi tìm ra và đã sửa: sau khi lưu, trang nhảy sang tab khác; nay ở lại đúng nghĩa vừa sửa (nhận bản riêng qua `original_id`) |
| Đặt / bỏ nghĩa chính (sao) | Đạt: `POST` / `DELETE main`, sao đổi màu, nghĩa chính lên đầu |
| Cụm từ `break the ice` (tạo mới) | Đạt: loại "Verb phrase", 4 nhãn dịch, ví dụ + dịch; ảnh còn chờ |
| Local: từ chưa có ảnh | Bản lưu local không có `image_preview` nên mỗi lần mở hỏi lại server (đúng thiết kế, cooldown 10 phút) |

### Phát hiện cần xem
1. **Từ chối bị gắn `abuse: true` cả khi nội dung chỉ lạc đề** ("The colour of bananas is yellow..." cho `king`): app hiện "Nội dung có dấu hiệu spam hoặc cố điều khiển hệ thống", ghi điểm `sense_abuse` -5. Quyết định sản phẩm: có nên tách "lạc đề" khỏi "spam / chèn lệnh" không.
2. Lý do từ chối (`reason`) là tiếng Anh thô, hiện nguyên trong hộp trích dẫn của màn kết quả.
3. Local không bỏ nghĩa đã bị xoá / đổi ở server (admin từ chối, nghĩa của mình bị xoá trên máy khác): `saveWord` chỉ thêm / thay. Chỉ ẩn / xoá thực hiện ngay trong app mới được đánh dấu (`markSenseRemoved`).
4. Từ tiếng Tây Ban Nha có "Tags" bằng tiếng Anh (door, entry, access): có vẻ là từ khoá ảnh, xem lại có nên hiện không.
5. Dữ liệu test còn lại trong DB: nghĩa chính thức `boss` (adjective, giữ lại vì hợp lệ), hai bản riêng "EDITED" / "EDIT2" của `boss` cho tài khoản khách, `break the ice` (ảnh chưa tạo xong). Local có `house`, `look`, `boss`, `break the ice`, `puerta`...

## Vòng 5 (2026-11-12): local làm mới nền, mã lý do từ chối, nút bản dịch

- **Local + mạng**: bản lưu hiện ngay rồi thay bằng bản server. `loadLocalWord` trả `ai_word.updated_at` (thời điểm ghi từ server; bảng từ / nghĩa không có cột `sync_at`, chỉ có `updated_at`); `needsRefresh` làm mới nền khi bản lưu cũ hơn 10 phút (cộng các điều kiện cũ: draft, thiếu ảnh, thiếu dịch; cooldown 10 phút / từ). Bản đủ từ server (`saveWord(..., prune: true)`) đánh dấu xoá ở máy các nghĩa không còn trong kết quả, trừ nghĩa đang nằm trong bộ từ của mình. Ẩn nghĩa không còn đánh dấu ngay (nghĩa ẩn có thể còn trong bộ từ), để lần làm mới ngay sau đó dọn; xoá nghĩa của mình vẫn đánh dấu ngay. Test: `npx tsx --test database/queries/words.test.ts` (3 test). Máy ảo: ẩn một nghĩa của `house` → local `is_deleted = 1` sau lần làm mới, bỏ ẩn → về 0, trang Noun 4 → 5.
- **Mã lý do từ chối**: server (`utils/ai/sense_gate.py`, `ai/views/AISense.py`) trả `reason_code` (`not_a_meaning, inaccurate, wrong_pos, too_vague, unverifiable, offensive, spam, injection`); `reason` tiếng Anh chỉ để log. App (`addSenseSheet.tsx`) dịch mã ra tiếng Việt, không còn hiện câu của AI. Prompt chỉnh: `is_offensive_or_spam` chỉ đặt cho `offensive` / `spam`, lạc đề hoặc sai là `not_a_meaning` / `inaccurate`. Kiểm bằng curl: "bananas" cho `king` → `not_a_meaning`, `abuse: false`; chèn lệnh → `injection`, `abuse: true`. Ca spam quảng cáo chưa kiểm được vì bị throttle (1 giờ).
- **Nút bản dịch** (`toggleWordDisplayMode.tsx`): một nút biểu tượng dịch, bật = nền màu chính, tắt = nền nhạt; không còn chữ VI / EN.
