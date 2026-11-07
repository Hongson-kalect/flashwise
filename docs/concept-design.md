# Thiết kế Concept (liên kết nghĩa giữa các từ và ngôn ngữ)

Thiết kế, **chưa có dòng code nào** (2026-11-07). Mục đích: một "ý" (concept) dùng chung giữa các nghĩa tương đương trong mọi ngôn ngữ, để dùng chung ảnh, và về sau dùng chung định nghĩa / bản dịch, thay vì vẽ và dịch lại từng nghĩa. Số đo lấy từ các thử nghiệm phiên 2026-11-06/07 (script ở container `/tmp`, ảnh ở `docs/image-tests/`).

## 1. Nguyên tắc

1. **Concept = một ý, không phải một từ.** Nhãn (`label`, ví dụ `bridge (dental)`) chỉ để đọc. Danh tính nằm ở **mô tả chuẩn tiếng Anh + vector**, không ở khoá chữ. Nhờ vậy khái niệm không có từ tiếng Anh (sobremesa, 木漏れ日) vẫn là concept hợp lệ.
2. **Gộp chặt, tách dễ.** Gộp nhầm làm nhiều nghĩa hiện sai ảnh và sai định nghĩa chung; tách nhầm chỉ tốn thêm một ảnh (~$0,003). Mọi ngưỡng và prompt thiên về tách.
3. **Phép thử dịch quyết định gộp:** hai nghĩa gộp được khi người dịch sẽ chọn cùng một từ ở các ngôn ngữ khác. `hi` / `hello` → cùng `hola`: gộp (khác biệt trang trọng chỉ là thẻ `register`). `wide` / `vast` / `huge` / `large` → `ancho` / `vasto` / `enorme` / `grande`: tách, nối bằng cạnh `near_synonym`.
4. **Ảnh lỏng hơn concept.** Ảnh vẫn khoá bằng `image_key` (chủ thể tiếng Anh do brief sinh ra). Concept khác nhau vẫn dùng chung ảnh nếu brief ra cùng chủ thể; concept giống nhau thì chắc chắn dùng chung. Gộp ảnh không bắt concept phải gộp.
5. **Mọi quyết định đều có log** (ứng viên, cosine, kết quả judge, model) để kiểm toán và sửa; có đường tách / gộp lại.
6. **Có cờ cấu hình** (`CONCEPT_LINKING_ENABLED`, mặc định tắt). Tắt thì mọi thứ chạy như hiện tại.

## 2. Mô hình dữ liệu (đề xuất)

- `Concept`: `id`, `label`, `description_en` (mô tả chuẩn, nhúng vector từ đây + gloss), `embedding`, `pos_class` (noun / verb / adj / adv / other, dùng làm bộ lọc mềm), `status` (`anchored` = có nghĩa tiếng Anh thật, `provisional` = tạo từ nghĩa nước ngoài, `lexical_gap` = không có từ tiếng Anh), `created_by` (seed / link / admin).
- `AISense.concept` (FK, null được). Nghĩa chưa gán vẫn hoạt động bình thường.
- `ConceptLink(a, b, kind)`: `near_synonym` (gợi ý từ gần nghĩa, ứng viên dùng chung ảnh), `merged_into` khi gộp.
- `ConceptDecision`: `sense`, `candidates` (id + cosine), `judge_runs`, `chosen`, `model`, `at`. Là nguồn sự thật để audit và huấn luyện ngưỡng.
- Ảnh gắn vào concept thông qua `image_key` hiện có (không đổi bảng ảnh).
- Vector: giai đoạn đầu numpy trong bộ nhớ / Redis (≤ vài trăm nghìn dòng đủ); pgvector hoặc Redis Stack khi vượt. **Chưa thử, quyết khi dựng.**

## 3. Cách tăng độ chính xác gán concept (phân tích và lựa chọn)

Điểm yếu đã thấy qua thử nghiệm: (a) định nghĩa đứng riêng thất bại khi nó nhắc lại từ chính ("this fruit"); (b) LLM judge không nhất quán (`headlights` lúc khớp lúc không, `tambor` cùng ý nhưng gộp khác nhau); (c) từ đa nghĩa gây gộp sai (`tambor` máy → `drum` thùng); (d) mẫu kiểm nhỏ, ngưỡng tune trên chính nó. Các cải tiến, xếp theo giá trị / chi phí:

| # | Cải tiến | Lý do | Chọn |
|---|---|---|---|
| 1 | **Đầu vào nhúng = gloss + định nghĩa en + loại từ** (không dùng định nghĩa trần) | gloss ổn định hơn: 96,8% khớp khi có gloss, thất bại khi không | Có |
| 2 | **Ứng viên = hợp của top-k vector và các nghĩa có headword trùng gloss** | vector bỏ sót khi gloss đa nghĩa; tra thẳng headword bổ sung recall rẻ | Có |
| 3 | **Concept so sánh bằng centroid** của mọi thành viên (en + ngôn ngữ khác), không chỉ nghĩa tiếng Anh | concept lớn dần càng khớp đúng; nghĩa nước ngoài thứ hai tìm thấy nghĩa nước ngoài thứ nhất | Có |
| 4 | **Bộ lọc loại từ mềm**: khác nhóm (danh / động) chỉ gộp concept khi judge nói rõ cùng ý; mặc định tách, nhưng vẫn dùng chung ảnh qua `image_key` | `hug` danh / động cùng ảnh, khác định nghĩa | Có |
| 5 | **Judge hai lần, thứ tự ứng viên đảo, nhiệt độ 0**; chỉ gộp khi hai lần cùng chọn một concept | trị chính xác lỗi không nhất quán đã thấy | Có |
| 6 | **Rubric phép thử dịch trong prompt**: khác độ trang trọng / phương ngữ / chính tả = cùng; khác mức độ / chiều / sắc thái / vật khác loại = khác; kèm ví dụ hi/hello, wide/large, drum | tách đồng nghĩa mà cosine không tách được (cả hai ~0,8–0,9) | Có |
| 7 | **Bậc tin cậy**: cosine < 0,72 → concept mới không hỏi; 0,72–0,80 → judge, cần 2/2; ≥ 0,80 → judge, cần 2/2 (judge luôn có mặt, cosine chỉ chọn ứng viên) | giữ gộp chặt; số ngưỡng từ mẫu nhỏ, phải kiểm lại | Có, ngưỡng tạm |
| 8 | **Mô tả chuẩn do LLM viết trước khi nhúng** cho nghĩa mới (lặp lại ổn định, cosine 0,906) | lấy danh tính ra khỏi cách diễn đạt riêng của từng định nghĩa | Có cho nghĩa không-Anh, tuỳ chọn cho nghĩa Anh |
| 9 | **Judge trả lời 2 tầng**: chọn ứng viên rồi tự kiểm "nêu một câu dịch khiến hai nghĩa không thay được nhau" | ép phản chứng, giảm gộp quá tay | Thử, bỏ nếu không cải thiện |
| 10 | **Bộ kiểm riêng ≥ 300 nghĩa** (thêm zh / ko / vi, từ trừu tượng, cặp đồng nghĩa, cặp đa nghĩa) có nhãn người, báo precision gộp và recall riêng | không có thì mọi ngưỡng chỉ là phỏng đoán | **Bắt buộc trước khi bật cờ** |
| 11 | **Hàng "chờ gộp"** (độ tin cậy giữa): giữ tách, ghi lại, một job định kỳ gom cụm toàn cục rồi gộp khi có thêm bằng chứng | tránh phụ thuộc thứ tự và đua giữa worker | Có |
| 12 | Hiệu chuẩn trọng số bằng log `ConceptDecision` sau khi chạy thật | dữ liệu thật tốt hơn mẫu của tôi | Sau |

Mục tiêu đặt ra (để đo, chưa đạt được chứng minh): **precision gộp ≥ 98%** (sai gộp là lỗi đắt), recall chỉ cần vừa phải (≥ 60–70% các cặp thật), phần còn lại tách ra là chấp nhận được.

**Phương án đã chọn:** 1–8, 10, 11 (và 9 chỉ thử). Ước chi phí nối khoảng $7 mỗi 90.000 nghĩa với một judge; hai lần judge nhân đôi phần đó (~$14), vẫn rẻ so với phần ảnh tiết kiệm (~$142 Prodia hoặc ~65 giờ GPU, mẫu lệch nên là ước lượng thô).

## 4. Các trường hợp và cách xử lý

| Trường hợp | Xử lý |
|---|---|
| **A. Seed tiếng Anh** | Mỗi nghĩa một concept `anchored`. **Không gộp** trong cùng ngôn ngữ ở lúc seed. Gộp chỉ ở job dọn trùng thưa theo phép thử dịch. |
| **B. Nghĩa nước ngoài có nghĩa Anh tương ứng** | Ứng viên → judge 2 lần → gán vào concept `anchored`. Ảnh dùng sẵn. |
| **C. Chưa có từ tiếng Anh trong DB** | Tạo concept `provisional` ngay (mô tả chuẩn, ảnh từ brief). **Không đợi** từ tiếng Anh. Nền, có cổng chất lượng (gloss là từ phổ biến, qua lọc nhạy cảm / rác): tạo từ tiếng Anh từ gloss; nếu có nghĩa khớp (judge 2/2) thì gộp, nếu không thì đánh dấu `no_english_match` và không thử lại trong một thời gian. (Đo: 22/38 dùng được, 4 khớp sai, 8 "không khớp đúng" do gloss đa nghĩa — nên không thể là con đường duy nhất.) |
| **D. Không có từ tương đương tiếng Anh** | Concept `lexical_gap`, định danh bằng mô tả. Ảnh vẽ từ mô tả. App hiển thị từ gốc + định nghĩa ngôn ngữ người học, không ép từ Anh. |
| **E. Đồng nghĩa cùng ngôn ngữ** | Phép thử dịch. Cùng dịch → gộp, giữ cả hai từ, thẻ `register`. Khác sắc thái → tách + cạnh `near_synonym`. **Chưa đo riêng**, xem mục 6. |
| **F. Cùng chữ khác loại từ** (hug N/V) | Concept tách; ảnh dùng chung qua `image_key` nếu brief cùng chủ thể. |
| **G. Từ đa nghĩa** | Mỗi nghĩa một concept; judge nhận cả loại từ và ví dụ để tránh `tambor` máy → `drum` thùng. |
| **H. Nghĩa bị sửa / refine đổi định nghĩa / bị xoá** | Đổi định nghĩa → huỷ gán, chạy lại nối. Xoá nghĩa → concept còn thành viên khác thì giữ, không còn thì để nguyên (đã có ảnh), không xoá. |
| **I. Hai worker cùng tạo concept** | Khoá Redis theo hash mô tả chuẩn; ở nạp hàng loạt thì bước gom cụm toàn cục cuối thay vì song song. |
| **J. Gộp nhầm bị phát hiện** | Công cụ admin tách (clone concept, gán lại nghĩa), ghi `ConceptDecision`; bài học thêm vào bộ kiểm. |
| **K. Từ tiếng Anh về sau mới được thêm** | Job định kỳ so concept `provisional` với concept `anchored` mới (cùng quy trình B), gộp khi 2/2. |
| **L. Gloss kém / không có** | Không nối; nghĩa sống độc lập, thử lại khi gloss tốt hơn. Không tạo từ tiếng Anh. |
| **M. Từ chạm nhạy cảm** | Gloss nhạy cảm không bao giờ tự tạo từ tiếng Anh (cổng chất lượng ở C). |

## 5. Lộ trình dựng (khi được duyệt)

1. Bộ kiểm 300+ nghĩa có nhãn + script đo precision / recall (đủ mục 3.10). **Không bật cờ nếu chưa đo.**
2. Mô hình `Concept`, `ConceptDecision`, `AISense.concept`; nối nội tuyến sau lúc từ xong (B, C, D), sau cờ.
3. Dùng concept để chia sẻ ảnh (đã có `image_key`; thêm tra `concept → image`), rồi mới tính tới chia sẻ định nghĩa / bản dịch (tiết kiệm nhỏ: định nghĩa ~29% văn bản dịch).
4. Job: dọn trùng (E), nối lại (K), gom cụm toàn cục cho nạp hàng loạt (I).
5. Admin: xem / gộp / tách concept, xem log quyết định.

## 6. Việc chưa biết (phải đo trước khi tin)

- Cặp đồng nghĩa cùng ngôn ngữ (E) **chưa đo**; dự kiến 30 cặp (hi/hello, big/large, begin/start, wide/vast/huge, smart/clever, buy/purchase…) xem phép thử dịch có phân loại đúng gộp / tách.
- Mẫu hiện tại: 38 nghĩa, 5 cặp dương, chỉ es / fr / ja, nhãn do tôi đọc, ngưỡng tune trên chính nó. Chưa có zh / ko / vi, từ trừu tượng.
- Embedding 768 chiều (rẻ hơn 3072) và cách lưu vector (Redis Stack / pgvector / numpy) chưa thử.
- Chưa có cách đánh giá "nghĩa nước ngoài tới trước nghĩa Anh" ngoài mô phỏng nhỏ (4/5 cặp gộp đúng ở ba thứ tự).

## 7. Quyết định mở (mặc định tôi chọn, đổi được)

- Đồng nghĩa khác từ: **tách + cạnh `near_synonym`**, trừ khi phép thử dịch cho là cùng.
- Concept cho ảnh bỏ qua loại từ: **có**, qua `image_key` (không gộp concept).
- Tạo từ tiếng Anh từ gloss: **chỉ nền, có cổng** (mục C), không là đường chính.
- Hiển thị khái niệm khuyết từ vựng (D): từ gốc + định nghĩa bản ngữ, không có từ Anh.
