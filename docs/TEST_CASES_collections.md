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
