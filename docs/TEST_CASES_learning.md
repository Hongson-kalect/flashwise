# Case test thủ công: phần học (2026-11-12)

Thiết kế và hiện trạng: `docs/learning-design.md` (mục 0, 5). Môi trường như `docs/TEST_CASES_collections.md` (emulator `FastFast_API36`, Metro, backend Docker). Test đơn vị: `npx tsx --test learning/learning.test.ts learning/knownStats.test.ts` (53 test cùng `stores`, `utils`, `services/sync`: đạt).

Bộ dùng test: `Hai muoi tu` (23 nghĩa, từ có sẵn, có ảnh + dịch vi). Kiểm dữ liệu bằng cách kéo SQLite từ máy ảo (`run-as ... cat files/SQLite/dictionary.db` + `-wal`) và đối chiếu server (Django shell).

Cột **KQ**: ✅ đạt, ◐ chạy một phần, ⏳ chưa chạy, ➖ không áp dụng / bỏ qua có lý do.

Cách chạy: bộ điều khiển adb viết tay (`drive_learn.py` trong thư mục tạm của phiên: đọc màu pixel để biết loại bước, đọc từ cần gõ từ snapshot trong SQLite) để chạy hết các bước; các màn quan trọng được xem bằng ảnh chụp. Thẻ cấp ≥ 3 để thử vuốt được dựng bằng cách sửa `user_sense_progress` trong DB máy ảo (4 từ `boss`, `safe`, `sort`, `lose`; dữ liệu này đã đồng bộ lên server của người dùng thử).

## A. Vào học mới

| # | Thao tác | Mong đợi | KQ |
|---|---|---|---|
| A1 | Chi tiết bộ `Hai muoi tu` → "Học từ mới" | Cụm 5–8 nghĩa (`cluster_size` 6), không 2 nghĩa cùng từ, có thanh tiến độ | ✅ cụm 6 nghĩa, 36 bước (6 × 6), thanh tiến độ `n / 36`; 6 cụm đã học không trùng nhau |
| A2 | Bộ rỗng (`Chuyen B6`) bấm "Học từ mới" | Báo hết từ mới, không crash | ✅ màn "Hết từ mới" + nút "Quay lại bộ từ". Lưu ý chữ "Bạn đã học hết từ mới trong bộ này" chưa đúng với bộ rỗng |
| A3 | Bộ đã học hết thẻ mới | Báo đã học xong, gợi ý ôn | ✅ bộ `Hai muoi tu` học hết (23 nghĩa) → màn "Hết từ mới" |

## B. Các bước trong cụm

| # | Kiểm | Mong đợi | KQ |
|---|---|---|---|
| B1 | Thẻ giới thiệu (copy) | Từ, loại từ, IPA, ảnh, nghĩa, ví dụ; "Mình đã biết từ này"; ô gõ lại từ | ✅ đủ các thành phần, có ô gõ + nút "Kiểm tra" |
| B2 | Chọn nghĩa / chọn từ | 1 đáp án đúng + nhiễu cùng loại; đúng → xanh "Chính xác!"; sai → đỏ | ✅ chọn sai → thẻ đỏ có dấu ✕, chọn đúng → xanh có ✓ + thanh "Chính xác!" + "Tiếp tục" |
| B3 | Gõ từ | Đúng qua; sai báo thử lại; sai 2 lần hiện đáp án; gợi ý hiện chữ cái | ✅ đúng qua; sai → "Chưa đúng, thử lại nhé"; sai 2 lần → "Đáp án đúng: look. Bước này sẽ được hỏi lại sau ít thẻ nữa" (tổng bước 30 → 31); gợi ý hiện "h…" rồi gõ đúng → "Chính xác!". Chưa thử "gần đúng" (sai 1 ký tự) |
| B4 | Nghe chọn, chính tả | Có bước nghe, phát audio; tắt `hearable` bỏ bước nghe | ◐ `listenChoose` và `dictation` chạy và ghi `review_log` (phiên đầu: 8 + 10 dòng); tắt "Bước nghe" thì phiên sau chỉ còn `copy, chooseMeaning, chooseWord, typeWord`. Chưa kiểm tiếng phát ra |
| B5 | Bước nói | Hiện khi có nhận dạng; xin quyền micro khi bấm mic; "Không tiện nói" đổi các bước nói còn lại sang gõ | ◐ bước "Đọc to từ này" hiện nút mic và "Không tiện nói, chuyển sang gõ". Bấm mic mới có hộp xin quyền micro của hệ điều hành (**không cấp quyền**, đó là thao tác hệ thống). Bấm "Không tiện nói" → các bước nói còn lại đổi sang bước gõ. Tắt "Bước nói" thì phiên sau không còn bước nói (`learn_session.methods`). Chưa thử nhận dạng thật |
| B6 | Giãn cách trong cụm | Mỗi nghĩa quay lại xen kẽ, số bước theo cấp | ◐ nghĩa lặp lại nhiều lần xen kẽ, sai thì thêm bước hỏi lại; chưa kiểm số bước theo cấp (chỉ có thẻ cấp 0) |
| B7 | Thẻ không ảnh | Ô trống gọn, không vỡ layout | ⏳ mọi nghĩa trong bộ đều có ảnh |
| B8 | Thoát giữa phiên (X / Back) | Hộp "Thoát phiên học?" | ✅ hộp toàn cục "Thoát phiên học? … Phiên được giữ 1 giờ", "Ở lại" / "Thoát" |

## C. "Đã biết"

| # | Thao tác | Mong đợi | KQ |
|---|---|---|---|
| C1 | "Mình đã biết từ này" ở một thẻ | Thẻ rời cụm, cấp 5, FSRS như Easy, hẹn kiểm tra sau 1 ngày | ✅ thẻ rời cụm (tổng 36 → 30); DB: `level 5`, `state 2`, `stability 8,30`, `next_review_at` +1 ngày |
| C2 | Bấm "đã biết" liên tiếp | Không lỗi, cụm kết thúc đúng | ✅ bấm 5 thẻ liền, còn 1 thẻ (1/6), cụm kết thúc ra bảng tổng kết |

## D. Tổng kết và ghi dữ liệu

| # | Kiểm | Mong đợi | KQ |
|---|---|---|---|
| D1 | Bảng tổng kết cuối cụm | Mỗi nghĩa chọn sẵn mức, sửa tối đa ±1 | ✅ thẻ "đã biết" ghi "Đã"; thẻ còn lại chọn sẵn "Quên", chỉ đổi được sang "Khó" (Vừa / Dễ mờ); nút "Lưu kết quả" |
| D2 | Lưu | `user_sense_progress`, `review_log` (`is_fsrs=1`), `learn_session`, `day_learn_log` | ✅ kiểm cụm 1: 6 tiến độ; `review_log` mỗi thẻ 1 dòng `is_fsrs=1` + các dòng bước `is_fsrs=0`; `learn_session` completed (6 nghĩa, 52 XP, 484 giây); `day_learn_log` 6 từ. Cụm 2 chưa đối chiếu lại DB |
| D3 | Tiến độ theo `original_sense_id` | 1 nghĩa ở 2 bộ chỉ 1 tiến độ | ⏳ |
| D4 | Đồng bộ | Server có tiến độ, review_log, phiên | ✅ server (user 4): 6 `UserSenseProgress`, 1 `DayLearnLog`, 58 `ReviewLog`. Chưa đối chiếu `learn_session` |
| D5 | "Học cụm tiếp" | Không lặp thẻ vừa học | ✅ "còn 17 từ" rồi "còn 11 từ" (23 → 17 → 11) |
| D6 | Chỉ số Home / chi tiết bộ | "Đã học", số hôm nay tăng | ✅ Home: 12 → 17 / 20 từ (học + ôn lại), mục "Từ hay sai" cập nhật; danh sách nghĩa của bộ có dấu ✓ cạnh từ đã học |

## E. Học tiếp phiên dở

| # | Thao tác | Mong đợi | KQ |
|---|---|---|---|
| E1 | Học giữa chừng, thoát, vào lại trong 1 giờ | "Học tiếp / Bắt đầu cụm mới", quay đúng bước | ✅ "Bạn còn một phiên học dở. Đã làm 41/54 bước, dừng cách đây 1 phút"; "Học tiếp" quay đúng bước (hiện 42/54); "Bắt đầu cụm mới" vào cụm mới 1/36. Lưu ý: hộp ghi 41 trong khi thanh ghi 42 |
| E2 | Quá 1 giờ | Snapshot bỏ | ⏳ |
| E3 | Lưu xong | Snapshot bị xoá | ✅ sau khi lưu phiên ôn, `run_snapshot:review` biến khỏi `system_configs`. Còn sót một `run_snapshot:learn:<bộ>` của phiên bỏ dở bị thay bằng "Bắt đầu cụm mới" (xem Phát hiện) |

## F. Ôn tập

| # | Thao tác | Mong đợi | KQ |
|---|---|---|---|
| F1 | Home sau khi học: số "đến hạn" | Thẻ vừa học chưa tính; đến hạn thì Home báo đúng | ✅ ngay sau học Home ghi "Hôm nay đã ôn xong"; sau khi thẻ tới hạn (10 phút) và kéo làm mới: "5 nghĩa cần ôn trước khi quên". Home **không tự cập nhật khi tới giờ**, phải kéo làm mới |
| F2 | "Ôn tập ngay" | Chia nhóm vuốt (cấp ≥ 3) và cụm | ✅ 5 thẻ cấp 0 vào ôn cụm (30 bước, không có bước copy, bắt đầu từ chọn nghĩa); 4 thẻ cấp 4 (dựng trong DB) vào ôn vuốt |
| F3 | Ôn cụm | Bỏ bước copy; điểm theo bước đầu; ghi `review_log`; cấp lên / xuống | ✅ tổng kết chọn sẵn Quên / Khó / Vừa theo bước đầu; lưu "5 thẻ: nhớ 3, quên 2 · +25 XP". DB: `review_log` mode `review:normal` 5 dòng `is_fsrs=1`, `learn_session` type review, `day_learn_log.words_relearned = 5`. Cấp: Vừa +1 (big 0 → 1), Khó giữ (look, king ở 0), Quên giữ 0 |
| F4 | Vuốt | Nhớ / chưa chắc / xem nghĩa; hoàn tác; không có "Dễ" | ✅ nút Nhớ, Chưa chắc, Xem nghĩa (tính là quên), Hoàn tác; vuốt trái = nhớ; "chưa chắc" 1 lần ghi chú "đến 3 lần thì tính là quên"; thẻ quên quay lại cuối phiên ("Từ vừa quên, xem lại một lần"); hoàn tác quay lại thẻ trước. DB: thẻ nhớ lên cấp 5, state 2, stability 6 → 18,6, hẹn 10 ngày; thẻ quên xuống cấp 2, state 3, `forget_count` +1, hẹn 6 giờ; `review_log` mode `review:swipe` rating 3 ×3, rating 1, cùng 1 dòng `is_fsrs=0` cho lần "chưa chắc" |
| F5 | Vừa ôn xong | Home không báo lại | ✅ Home "Hôm nay đã ôn xong" ngay sau lưu |
| F6 | Không có thẻ đến hạn | "Hôm nay đã ôn xong" | ✅ |

## G. Offline và cài đặt

| # | Thao tác | Mong đợi | KQ |
|---|---|---|---|
| G1 | Tắt mạng, học một cụm | Học bình thường, `sync_queue` có dòng; bật mạng thì đẩy | ✅ chế độ máy bay: học, lưu bình thường; `sync_queue` có 21 dòng (6 tiến độ, 13 `review_log`, 1 phiên, 1 nhật ký ngày); bật mạng ~25 giây sau hàng đợi rỗng, server có 18 tiến độ, nhật ký ngày 18 từ / 9 ôn lại / 125 XP |
| G2 | Đổi cài đặt học | Phiên sau theo cài đặt | ◐ "Mục tiêu nhớ" 90% → 95% lưu `request_retention`; tắt "Bước nghe" và "Bước nói" lưu `hearable` / `talkable = false` và phiên sau bỏ các bước đó. Chưa có UI đổi `cluster_size`; chưa so khoảng ôn 90% với 95% |
| G3 | H2: nghĩa chưa dịch rồi học | Dịch lười kích hoạt (`prefetchTranslation`) | ✅ đổi dịch sang tiếng Ý, mở bộ `Chuyen B5` (`damn`): banner "Đã có bản dịch 0/1"; "Học từ mới" → màn "Đang chờ bản dịch"; sau khoảng 12 giây server dịch xong, app tải lại bundle (`user_lang: it`, log Metro) và phiên học tự mở với bản dịch tiếng Ý ("cavolo, dannazione, maledizione", ví dụ tiếng Ý). Đã đổi lại tiếng Việt |

## Phát hiện trong lúc test (chưa sửa)

1. ~~Gõ sai mãi thì phiên không kết thúc~~ **Rút lại**: mỗi bước chỉ được hỏi lại một lần (`pass`), nên tổng bước tối đa gấp đôi (36 → tối đa 72). Con số 54 thấy khi test là phiên đang chạy, chưa tới trần. Đã thêm test khẳng định trần (`sai liên tục mọi bước…` trong `learning/learning.test.ts`).
2. ~~Quyền micro hỏi lại mỗi phiên~~ **Rút lại**: app chỉ xin quyền khi bấm nút mic. Hộp xin quyền xuất hiện vì bộ điều khiển adb bấm trúng nút mic (và "Không tiện nói"), không phải app tự hỏi.
3. ~~Màn học không lộ cây truy cập~~ **Chưa kiểm chứng**: `uiautomator dump` trên máy ảo này không đáng tin (lúc trả màn của route cũ, lúc trả rỗng), nên không kết luận được. Đã thêm `accessibilityRole` / `accessibilityLabel` cho các phương án trả lời; nên kiểm bằng TalkBack thật.
4. ~~Chữ "Hết từ mới" cho bộ rỗng~~ **Đã sửa**: bộ rỗng hiện "Bộ còn trống: Bộ này chưa có nghĩa nào…"; bộ học hết vẫn "Hết từ mới". Hộp "Học tiếp" ghi "Đang ở bước n/m" khớp thanh tiến độ (trước lệch 1). Kiểm trên máy ảo.
5. ~~Home không tự cập nhật khi thẻ tới giờ ôn~~ **Đã sửa theo code, chưa kiểm chạy thật**: `useHomeData` thêm `refetchInterval: 30000` (đọc SQLite nên rẻ). Chưa chờ đủ một mốc để xem số đổi.
6. ~~Snapshot cũ sót trong `system_configs`~~ **Đã sửa**: `loadSnapshot` gọi `purgeExpiredSnapshots` xoá mọi `run_snapshot:*` quá 1 giờ hoặc hỏng JSON (kiểm: snapshot 328 phút tuổi biến sau khi mở một màn học).
7. ~~Bảng tổng kết dễ hiểu nhầm~~ **Đã sửa chữ**: ghi rõ mức chọn sẵn tính theo cả cụm, từ sai hoặc xem đáp án lần đầu vẫn tính Khó / Quên dù sau đó làm đúng.
8. Đính chính G3 / H2: `prefetchTranslation` **đã nối** trong `useLearnRun` và đã chạy được (xem G3). Lưu ý nhỏ: màn "Đang chờ bản dịch" tự chuyển sang phiên học khi có bản dịch, nhưng chữ hướng dẫn vẫn bảo "kéo làm mới sau ít phút rồi quay lại" dù thực tế không cần.

## Cách báo lỗi
Như `TEST_CASES_collections.md`: mã case + ảnh / mô tả + log Metro và backend.
