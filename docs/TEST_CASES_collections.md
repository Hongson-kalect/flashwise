# Case test thủ công: luồng bộ từ (collections) (2026-11-12)

Môi trường như `docs/TEST_CASES_word-search.md`. **DB hiện có 0 bộ từ** (chưa bộ chính thức nào), nên Khám phá / Gợi ý rỗng cho tới khi có bộ được phát hành. Thứ tự test: tạo → xem / sửa → phát hành → khám phá / thích / tải / remix → offline → học.
`LOCAL_WORDS_ENABLED` vẫn `false` (chỉ ảnh hưởng trang từ; bộ từ luôn ghi SQLite qua `saveBundle`). Người dùng thứ hai (tải, remix, thích): dùng `GET /api/auth/dev-token/?username=<tên>` + curl, hoặc tài khoản khách thứ hai.

Từ dùng để test (đã có trong DB): `house, tell, look, big, cause, ahead, lose, king, plan, dinner, boss, promise, safe, sort`.
Từ mới, theo danh sách seed tiếp theo (hạng 522+, chưa có): `book, white, hour, anybody, small, perfect, special, himself, perhaps, serious, sick, company`. `sent` (dạng chia của send), `john` (tên riêng) dùng làm ca biên.

## A. Tạo bộ, chế độ Nhanh (`collections/bulk-create`)

| # | Thao tác | Mong đợi |
|---|---|---|
| A1 | Tên "Thử 1", dán `house tell look big` | Tạo xong, vào chi tiết bộ: 4 từ, số nghĩa mỗi từ hợp lý, không có từ chờ AI |
| A2 | Tên "Thử 2", dán `book white hour small perfect` (5 từ mới) | Bộ tạo ngay, mục "từ chờ AI" (`pending_words`) hiện 5 từ rồi giảm dần mỗi 6s tới 0; số nghĩa tăng; khi xong đủ nghĩa + dịch |
| A3 | Từ ghép dạng chia: `looked children bigger told` | Server đổi thành `look child big tell`; kết quả báo `form_of`; bộ không chứa dạng chia |
| A4 | Từ trùng và hoa thường: `House house HOUSE` | Một dòng `house` |
| A5 | Từ lạ / sai: `xyzqq` | Báo từ không hợp lệ (`invalid_words`), không treo chờ |
| A6 | Tên rỗng; danh sách rỗng | Chặn ở form, có thông báo |
| A7 | 20+ từ cùng lúc (cả cũ lẫn mới) | Không timeout; từ cũ có ngay, từ mới vào `pending_words` |
| A8 | Tắt mạng rồi bấm Tạo | Thông báo lỗi kết nối, nút thử lại, không tạo bộ nửa vời |
| A9 | Bấm Tạo nhiều lần liên tiếp | Chỉ một bộ (nút khoá khi đang xử lý) |
| A10 | Từ không còn quota (giới hạn 500 từ mới / ngày) | Chưa test được, chỉ ghi nhận thông báo |

## B. Tạo bộ, chế độ Chuyên sâu (`ai-words/senses` rồi `POST collections/`)

| # | Thao tác | Mong đợi |
|---|---|---|
| B1 | Nhập `king plan boss`, chọn nhiều nghĩa mỗi từ | Danh sách nghĩa theo từ, chọn / bỏ chọn được; tạo xong bộ có đúng các nghĩa đã chọn |
| B2 | Chọn 0 nghĩa của một từ | Từ đó không vào bộ, bộ vẫn tạo |
| B3 | Trộn từ đã có và từ mới (`king` + `special`) | Từ mới đi `add-words` rồi vào chờ AI |

## C. Chi tiết bộ

| # | Kiểm | Mong đợi |
|---|---|---|
| C1 | Tên, mô tả, số nghĩa, trạng thái dưới tên bộ | "Nháp" cho bộ vừa tạo |
| C2 | Ảnh bìa tự động | Lấy từ ảnh nghĩa; nghĩa chưa có ảnh dùng ảnh mở hoặc ô trống, không vỡ layout |
| C3 | "Đổi ảnh" (tác giả, chưa phát hành) | Chọn ảnh → tải lên → ảnh bìa đổi, gỡ ảnh được (về ảnh tự động) |
| C4 | Mục Từ vựng của bộ | Mỗi từ một dòng kèm số nghĩa; mở từ vào đúng trang từ |
| C5 | "đã có bản dịch x/n" | Số khớp bản dịch thật (đổi ngôn ngữ dịch → số đổi) |
| C6 | Từ chờ AI khi thoát màn rồi vào lại | Polling tiếp tục, không dừng mãi |

## D. Sửa bộ (tác giả, nháp)

| # | Thao tác | Mong đợi |
|---|---|---|
| D1 | "Sửa" → xoá một nghĩa | Nghĩa biến khỏi danh sách; đếm "thay đổi chưa phát hành" tăng |
| D2 | Đổi thứ tự (reorder) | Thứ tự mới giữ sau khi thoát và vào lại; `collection_items.display_order` ghi ở máy |
| D3 | "Thêm từ" (sheet `addWordsSheet`) từ đã có / từ mới / dạng chia / từ lạ | Từ đã có vào ngay; từ mới vào chờ AI; dạng chia đổi thành từ gốc; từ lạ báo `invalid` |
| D4 | Xoá hết nghĩa | Bộ rỗng: nút phát hành xử lý đúng (xem E4) |
| D5 | Từ trang từ → thêm nghĩa đó vào bộ (nếu app có nút) / `containing` | Bộ nào đang chứa nghĩa này hiển thị đúng |

## E. Phát hành / cập nhật / thu hồi

| # | Thao tác | Mong đợi |
|---|---|---|
| E1 | "Phát hành bộ" (tên, mô tả, ảnh bìa) | `upload` → trạng thái "Đã phát hành", version 1, bundle tải lại; nút đổi thành "Cập nhật" mờ |
| E2 | Sửa (xoá / thêm nghĩa) sau khi phát hành | Nút "Cập nhật" sáng, trạng thái "có thay đổi"; bấm → version 2 |
| E3 | "Cập nhật" khi không có thay đổi | Backend không tăng version, chỉ cập nhật tên / mô tả / ảnh (`changed: false`) |
| E4 | Phát hành bộ chưa từng phát hành mà không có nghĩa nào | 400 `no_changes`, app báo rõ |
| E5 | "Thu hồi" | `released=false`; người chưa tải không thấy / tải được; nút đổi thành "Tiếp tục phát hành" |
| E6 | "Tiếp tục phát hành" | Công khai lại không cần thay đổi |
| E7 | Đổi ảnh bìa khi đã phát hành | Phải qua màn Phát hành (409 `collection_released` ở nút Đổi ảnh) |
| E8 | "Bộ đã phát hành của tôi" (`me/uploads`) | Có bộ vừa phát hành, số xem / thích / tải đúng |

## F. Khám phá, thích, tải, remix (cần người dùng thứ hai)

| # | Thao tác | Mong đợi |
|---|---|---|
| F1 | Tab Bộ từ → Khám phá (trước khi có bộ) | Trạng thái rỗng rõ ràng, không lỗi |
| F2 | Sau E1: người thứ hai thấy bộ trong Khám phá; tìm theo tên; sắp xếp popular / newest / tải nhiều | Bộ hiện, phân trang không lặp |
| F3 | Xem trước bộ (`gloss`) rồi thích / bỏ thích | `like_count` đổi, trạng thái tim giữ |
| F4 | "Thêm & tải về" | `download` → bundle ghi SQLite; mở lại thì "mở bộ", không tải lần hai |
| F5 | Người tải bấm "Sửa", xoá / thêm từ | Chỉ là nháp của mình; bộ gốc và người khác không đổi |
| F6 | Người tải bấm "Tạo bản remix" → Phát hành | Server tách bộ mới, `user_collection` chuyển sang bộ mới; bộ gốc `remix_count` +1; ghi nguồn remix |
| F7 | Thu hồi bộ gốc khi người khác đã tải | Người đã tải học tiếp; người mới không tìm thấy |
| F8 | Bộ bị ban (admin) | Tải / mở trả 403 `collection_banned`, app xoá / ẩn bộ |
| F9 | Chủ đề / gợi ý ở Home ("Xem tất cả") | Có bộ phù hợp chủ đề; bỏ bộ đã tải / của mình |

## G. Offline, đồng bộ bundle

| # | Thao tác | Mong đợi |
|---|---|---|
| G1 | Tải bộ rồi tắt mạng, mở bộ và các từ trong bộ | Chi tiết bộ, danh sách từ, nghĩa, ảnh (nếu đã cache) mở được, không gọi mạng |
| G2 | Mở lại bộ khi có mạng, không có thay đổi | `etag` cũ → `unchanged`, không tải lại cả bundle |
| G3 | Bộ có thay đổi trên server (tác giả cập nhật) | App hiện có bản mới (`updates`), "nâng bản" trả `conflicts` nếu người dùng có nháp |
| G4 | Nghĩa bị admin ban | Xuất hiện trong `banned`, biến khỏi SQLite |
| G5 | Xoá bộ khỏi máy (nếu có) | Dữ liệu SQLite của bộ dọn sạch, tiến độ học giữ |

## H. Cầu nối sang học (kiểm nhẹ ở vòng này)

| # | Thao tác | Mong đợi |
|---|---|---|
| H1 | "Học từ mới" từ chi tiết bộ | Vào `Learning/New` với đúng bộ; không có 2 nghĩa cùng 1 từ trong 1 lượt |
| H2 | Bộ còn nghĩa chưa dịch (`translation_missing`) | Dịch lười được kích hoạt khi chạm nghĩa, bản dịch về trong lúc học |

## Cách báo lỗi
Như `TEST_CASES_word-search.md`: mã case + ảnh / mô tả + log Metro và backend.

## Kết quả chạy (2026-11-12, Claude, qua adb + curl)

Người dùng thứ hai (B) tạo bằng `POST auth/device-login/` với `device_id` khác rồi dùng token trả về (không cần đổi chủ sở hữu trong DB; đi đúng luồng API thật).

| Case | Kết quả |
|---|---|
| A1 Nhanh `house,tell,look,big` | Đạt: 4 nghĩa, nháp |
| A2 5 từ mới + từ chờ AI | Đạt: banner "Đang tạo 5", ~30 giây sau đủ 8 nghĩa, banner tắt |
| A3 dạng chia `looked, children` | Đạt: vào bộ là `look`, `child` |
| A4 trùng hoa thường `House` | Đạt: một dòng |
| A5 từ lạ `xyzqq` | Đạt: banner "1 từ không dùng được" |
| C1, C2, C4 | Đạt: trạng thái "Bản nháp", ảnh bìa tự động lấy từ nghĩa đầu, danh sách nghĩa |
| D1 xoá nghĩa nháp | Đạt (hộp xác nhận, server `delete-sense` 200). **Lỗi tìm ra và đã sửa**: "Nghĩa" ở chi tiết bộ vẫn 6 sau khi xoá (xem dưới) |
| D2 đổi thứ tự | Đạt: `reorder` 200, ảnh bìa đổi theo nghĩa đầu |
| E1 phát hành | Đạt: v1, "Cập nhật" mờ + "Thu hồi", server `released`, `item_count` 5 |
| E2 sửa rồi cập nhật | Đạt: "có 1 thay đổi chưa phát hành", "Cập nhật" sáng, v2 |
| E3 cập nhật không đổi | Đạt (API): `changed: false`, version giữ 2, mô tả cập nhật |
| E4 phát hành bộ rỗng | Đạt (API): 400 `no_changes` |
| E5 thu hồi | Đạt: "Đã thu hồi (v2), chỉ người đã tải còn học được", nút "Tiếp tục phát hành"; B không còn thấy trong danh sách nhưng bundle của B vẫn 200 |
| E6 tiếp tục phát hành | Đạt: công khai lại v2, không cần thay đổi |
| F1/F2 Khám phá | Đạt: thấy bộ công khai, tìm / sắp xếp hiển thị |
| F3 xem trước + thích | Đạt (cả app lẫn API): `gloss` hiện, `like_count` +1 |
| F4 tải về | Đạt (app): `download` 201, bundle, lần sau gửi `etag` (G2) |
| F5 người tải sửa | Đạt (API): xoá / thêm từ chỉ là nháp của B; `add-words` của người không phải tác giả: từ có sẵn thêm được, `xyzqqq` vào `unavailable`; bộ gốc không đổi |
| F6 remix | Đạt (API): bộ mới v1, 4 nghĩa, `remix_count` bộ gốc +1; app hiện "Remix từ 'Thu 3'" |
| G1 offline | Đạt: tắt mạng vẫn mở danh sách bộ, chi tiết bộ, sắp xếp |
| G2 etag | Đạt: lần mở sau gửi `etag` |
| H1 | Mở `Học từ mới` từ bộ 8 từ ra phiên 36 bước (chưa xét sâu); thoát phiên hỏi "Thoát phiên học?" |

Chưa chạy: A6–A10, B (Chuyên sâu), C3 / C5 / C6 (ảnh bìa, đếm dịch, polling khi thoát), D3 (thêm từ trong app), D4 / D5, E7 / E8, F8 (bộ bị ban), F9, G3 / G4 / G5, H2.

### Lỗi tìm ra và đã sửa
1. **`item_count` lệch số nghĩa thật** (bộ `Thu 2`: 9 trong khi có 8 nghĩa): `utils/celery/worker.py` cộng dồn `item_count + valid_count` ở hai đường chạy lệch pha (`atoms_update` và `collection_items_create`). Nay cả hai đếm lại từ `collection_item` (distinct `original_id`, bỏ dòng xoá). Kiểm: bộ mới `Thu 3` 6 / 6.
2. **Số nghĩa ở app không giảm sau khi xoá nghĩa nháp**: `total` lấy `max(item_count server, dòng local)`, mà `item_count` chỉ tính bản đang hiệu lực. Nay bộ đã tải dùng số dòng thật trong SQLite (`database/queries/collections.ts`).

### Cần xem
- Hộp xác nhận xoá nghĩa / thu hồi bộ / thoát phiên học dùng `Alert` gốc của Android, khác hệ modal của app.
- Thẻ bộ ở Khám phá và trang xem trước chỉ có chữ cái đầu, chưa có ảnh bìa (bộ chưa đặt ảnh thì app chỉ tự lấy ảnh nghĩa ở danh sách "Bộ từ của tôi").
- Bộ của chính mình vẫn hiện trong Khám phá (gợi ý ở Home thì đã loại).
- Dữ liệu test còn lại: bộ `Thu 1`, `Thu 2`, `Thu 3` (đã phát hành, v2), `Thu 3 remix cua B` (đã tải), bộ rỗng `Rong`, tài khoản khách B (`device_id` 11111111-2222-4333-8444-555555555555).

## Vòng 2 (2026-11-12): modal toàn cục, ảnh bìa Khám phá, đánh dấu bộ của mình, gợi ý từ và thêm ngược

- **Alert → modal toàn cục**: `Alert.alert` ở Chi tiết bộ (thu hồi, xoá nghĩa), thoát phiên học / ôn và quyền ảnh nay dùng `addModal({ type: "confirm" | "alert" })`. ConfirmModal có `destructive` (nút đồng ý đỏ). Máy ảo: hộp "Xoá "house" khỏi bộ?" hiện bằng modal của app, nút Xoá đỏ.
- **Ảnh bìa Khám phá / xem trước**: server (`CollectionListSerializer`) thêm `cover_image` (ảnh của nghĩa đầu tiên có ảnh trong bản đang hiệu lực, bỏ dòng xoá, tính cả trang bằng một truy vấn) và `cover_word`; ảnh riêng của bộ vẫn ưu tiên. Xem trước lấy ảnh đầu tiên khả dụng trong `senses`, không có thì tìm ảnh mở theo từ đầu. Trang xem trước in tên bộ in hoa, đậm, mờ, cỡ lớn ngay trên khung ảnh (`watermark`). Máy ảo: thẻ bánh sinh nhật / toà nhà thay cho chữ "T", tên mờ hiện trên ảnh.
- **Bộ của mình / đã tải trong Khám phá**: vẫn hiện, nhưng có thẻ "Của bạn" (màu chính, tác giả) hoặc "Đã tải" (xanh), khung viền đậm và nền tô nhẹ cùng màu; trang xem trước có thẻ cạnh tên. Dữ liệu lấy từ bảng `user_collection` ở máy (`getOwnedCollectionMap`).
- **Gợi ý từ khi thêm** (`ai-words/suggest/`, `ai/suggest.py`, `WordSuggest`): ô thêm từ ở Tạo bộ và "Thêm từ" của bộ có hai chế độ.
  - "Gõ từ": gõ đầu từ của ngôn ngữ đang học → từ kèm loại từ, nghĩa ngắn, ảnh; chạm để thêm vào danh sách (từ đã có thì mờ, có dấu tick).
  - "Gõ nghĩa" (thêm ngược): gõ nghĩa tiếng Việt ("cua", "nha", "chao") → từ tiếng Anh có bản dịch khớp (door, home, hello...). Khớp theo đầu từ của bản dịch, **không phân biệt dấu** (extension `unaccent`, migration `ai.0015`), khớp trọn / đầu bản dịch xếp trước, gõ có dấu thì khớp đúng dấu xếp trước. Định nghĩa chỉ bổ sung khi bản dịch khớp < 3.
  - Chỉ gợi ý được từ đã có trong hệ thống; từ chưa có vẫn gõ thẳng vào danh sách. Tìm ngược cho từ chưa có trong DB (hoặc qua AI) là bước sau.
  - Test backend: `ai.test_suggest` (7 test); tổng `ai.test_senses ai.test_suggest core ai.test_forms` 173 test OK.
  - Chưa kiểm khi dữ liệu lớn: tìm theo nghĩa quét `contents` của các nghĩa chính thức (iregex trên jsonb), cần chỉ mục trigram trên cột văn bản bản dịch khi lên hàng trăm nghìn nghĩa.

## Vòng 3 (2026-11-12): thêm ngược tự hỏi AI (không có nút), mang nghĩa đã chọn

- **Tự hỏi AI khi DB ít**: ở "Gõ nghĩa", kết quả từ hệ thống hiện trước; nếu ít hơn 3 và người dùng ngừng gõ ~0,7 giây (≥ 3 ký tự), app tự gọi `ai-words/suggest/?ai=1`. Không có nút gợi ý AI. Server (`ai/meaning_lookup.py`): lọc rẻ bằng luật (quá dài / nhiều từ → `sentence`) → một lượt Claude Haiku vừa **kiểm duyệt cụm gõ** (câu, xúc phạm, spam, chèn lệnh, vô nghĩa) vừa trả 1–5 ứng viên `{từ, loại từ, nghĩa ngắn}` → server kiểm lại từng ứng viên (chuẩn hoá, mục từ hợp lệ, dạng chia → từ gốc, bỏ từ REJECTED / BANNED) → đối chiếu DB: từ đã có thì chọn nghĩa chính thức khớp nhất (loại từ → bản dịch khớp cụm gõ → điểm), từ chưa có thì trả không kèm nghĩa (hiện thẻ "Từ mới").
- **Chi phí và an toàn**: kết quả (kể cả từ chối) cache 30 ngày theo (cụm bỏ dấu / hoa thường, cặp ngôn ngữ); chỉ lượt AI thật tính vào hạn mức `MEANING_LOOKUPS_PER_DAY` (150 / người / ngày); hết hạn mức, bị từ chối hay AI lỗi thì vẫn trả phần từ DB kèm `ai_reason`, app hiện câu giải thích ngắn.
- **Mang nghĩa đã chọn**: chọn một từ đã có trong hệ thống thì app giữ `sense_id`; chế độ Nhanh gửi `senses {từ: sense_id}` cho `collections/bulk-create` và `user-collections/{id}/add-words`, server dùng đúng nghĩa đó thay vì nghĩa điểm cao nhất (chỉ nhận nghĩa chính thức của đúng từ). Từ mới do AI gợi ý được tạo qua luồng thường rồi lấy nghĩa tốt nhất (chưa chọn nghĩa theo ý người gõ cho từ mới).
- **Test**: `ai.test_suggest` 18 test (AI giả: gộp DB + AI, từ chối, câu bị lọc trước AI, cache, hạn mức, lỗi AI, từ BANNED, nghĩa chọn sẵn); tổng bộ `ai.test_senses ai.test_suggest core ai.test_forms ai.test_seedflow` OK. Gọi Claude thật: "nồi cơm điện" → rice cooker; "ấm đun nước" → kettle, teapot; "cái chổi" → broom, brush; "chửi thề" → swear, curse, cuss; "hôm nay trời đẹp quá" → bị loại là câu, không tốn AI.
- **Máy ảo**: gõ không dấu "am dun nuoc" → kettle, teapot (thẻ "Từ mới"); thêm kettle + `door` (từ "cua", nghĩa cửa ra vào) rồi Tạo → bộ có `door` đúng sense_id đã chọn, `kettle` được tạo mới và vào bộ sau vài giây.
- **Cần xem**: gõ không dấu cho nhiều nghĩa trùng ("cua" ra of, saw, from trước door); từ vựng thô tục thông thường vẫn được gợi ý (swear / curse), chặn thêm hay không là quyết định sản phẩm.
