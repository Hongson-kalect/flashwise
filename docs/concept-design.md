# Thiết kế Concept (liên kết nghĩa giữa các từ và ngôn ngữ)

## Cập nhật 2026-11-07 (chiều): đã dựng tầng 1, đây là phạm vi hiện tại

**Hai tầng (chốt cùng chủ dự án):**
- **Tầng 1, Concept** = các nghĩa GIỐNG HỆT nhau giữa các ngôn ngữ (`big` = `lớn`; `hi` = `hello` cùng ngôn ngữ cũng gộp được vì thay nhau hoàn toàn). Dùng chung định nghĩa và ảnh. **Đã dựng** (xem dưới).
- **Tầng 2** = đồ thị phủ lên các concept tầng 1: nhóm gần nghĩa (`big`, `huge`, `vast`, `wide`) với ghi chú khác biệt, viết một lần cho concept rồi dịch. **Chưa dựng.** Đầu vào đã có: `ConceptDecision.near` (cặp "gần nhưng khác" mà judge ghi lại, 200+ dòng sau lần chạy thử).
- Các mục 1-7 bên dưới là thiết kế gốc (trước khi tách hai tầng): phần "nhóm gần nghĩa", `ConceptLink`, `axes`/`only_when` thuộc về tầng 2.

**Đã dựng (backend `D:\Code\flashwise_api`, tắt mặc định, bật `CONCEPT_LINKING_ENABLED=true`):**
- Mô hình `ai.Concept` (nhãn, mô tả en, embedding trung bình thành viên, trạng thái anchored / provisional / lexical_gap), `ai.ConceptDecision` (nhật ký: ứng viên, cosine, từng lần judge, `near`), `AISense.concept` (FK). Migration `0012_concept`.
- `utils/concept/`: `text.py` (gloss + định nghĩa en), `embedding.py` (gemini-embedding-001, 3072 chiều), `judge.py` (Gemini JSON, **2 lần với thứ tự ứng viên đảo, chỉ nối khi cùng chọn một concept**, prompt phép thử dịch), `linker.py` (ứng viên = top vector cos >= 0,70 hợp với concept của nghĩa tiếng Anh có headword trùng gloss, loại concept đã có nghĩa của cùng từ; khoá advisory Postgres để hai worker không cùng tạo concept; chia sẻ ảnh hai chiều trong concept), `payload.py` (dữ liệu cho app), `notify.py` (chạy sau khi từ lưu xong, nạp lại cache, socket `PARTIAL_LINKS`).
- Hook ở cuối `word_render` (sau ảnh, bọc try, timeout 120s); lệnh `manage.py link_concepts [--lang --word --limit --reset --judge-runs]` (tiếng Anh trước làm neo).
- Model judge: `CONCEPT_JUDGE_MODEL` (mặc định `gemini-2.5-flash`; flash-lite nối sai nhiều hơn rõ rệt, xem số đo).
- API: mỗi nghĩa trong `get-word` / `FULL_SENSE` có `concept: {id, label, status, equivalents[{id, word_id, word, language_code, pos}]}` hoặc `null` (không thêm endpoint). Liên kết sinh bất đồng bộ sau `FULL_SENSE`, app nhận qua socket `PARTIAL_LINKS`.
- App: cột `ai_sense.concept` (JSON), `SenseConcept` trong `data.ts`, reducer `PARTIAL_LINKS`, mục "Cùng nghĩa ở ngôn ngữ khác" (`Word/Detail/components/equivalents.tsx`, chạm chip mở từ), mục khuyết từ vựng ghi chú riêng. Chưa chạy thử trên máy / emulator (chỉ kiểm tsc cho file mới).
- Test: `ai/test_concept.py` (17 test, embedding và judge giả) + 2 test hook trong `ai/tests.py`; các bộ `ai` chính 303 test đạt.

**Số đo (722 nghĩa trong DB dev: ~100 từ chia theo case + từ thử cũ; chấm tay, nhãn do tôi đọc nên có thiên lệch):**

| | judge flash-lite | judge flash (mặc định) |
|---|---|---|
| Nghĩa nối vào concept có sẵn | 194 | 168 |
| Tách vì hai lần judge không đồng ý | 39 | 16 |
| Concept tạo ra (anchored / provisional) | 528 (473 / 55) | 554 (492 / 62) |
| Concept >= 2 thành viên | 119 | 100 |
| Nối SAI rõ ràng (chấm tay) | ~13 (7%) | ~1-3 (1-2%) |
| Nối đáng ngờ (gần nghĩa, thuộc tầng 2) | ~20 | ~12 |
| Thời gian / 722 nghĩa, tuần tự | 17 phút | 21 phút |
| Token judge (lượt / vào / ra) | 692 / 276k / 52k | 678 / 271k / 43k |
| Chi phí judge (theo giá nhớ từ trí nhớ, chưa kiểm lại) | ~$0,05 | ~$0,19 |

Ví dụ lỗi flash-lite đã được flash sửa: `estrenar` (dùng lần đầu) nối vào `begin`; `tambor` (bộ phận máy) nối vào `drum` (thùng); `seta` vào `dowel`; `proud` vào `clever`; `cushion` vào `mattress`; `bet` vào `banque`. Phát lại 233 quyết định flash-lite bằng flash: đổi 41 (phần lớn là sửa lỗi thật, một số ít quá chặt như `libro` khỏi `book`).

Theo case (judge flash):
- **A. Neo tiếng Anh:** 45 từ, mọi nghĩa có concept `anchored`.
- **B. Nước ngoài có từ Anh sẵn:** 27/28 từ nối đúng vào concept chứa từ Anh mong đợi (es/fr/ja/zh/ko/vi). Từ trượt là `bánh mì` (gloss "Vietnamese baguette", cụ thể hơn `bread`: tách là đúng).
- **C. Nước ngoài đến trước, tiếng Anh sau:** `zapato`/`靴`/`신발`/`giày` gom thành 1 concept tạm; `fromage`/`奶酪`/`치즈` gom 1; `reloj`/`時計` gom 1. Khi `cheese`, `clock` (tiếng Anh) tới sau, hook thật (worker) nối vào đúng concept tạm và chuyển thành anchored. `shoe` lúc đầu **không** nối được (xem lỗi dưới), sau khi sửa nhãn thì nối đủ 4 ngôn ngữ.
- **D. Khuyết từ vựng (8 từ, 11 nghĩa):** không nối nhầm vào concept tiếng Anh nào; mỗi nghĩa thành concept tạm riêng. Trạng thái `lexical_gap` **không bao giờ xuất hiện** (luật hiện tại chỉ bật khi gloss rỗng, mà AI luôn đưa gloss). Cần luật khác.
- **E. Đồng nghĩa cùng ngôn ngữ:** nên gộp: 6/6 gộp đúng (hello/hi, big/large, begin/start, buy/purchase, sofa/couch, shout/yell); nên tách: 3/5 tách đúng (wide/vast, big/huge, tiny/small), huge/vast và wide/large vẫn bị gộp (định nghĩa gần như trùng, ranh giới tầng 1 / tầng 2). Judge flash không đổi các kết quả này so với flash-lite.
- **G. Đa nghĩa (9 từ nước ngoài, 28 nghĩa):** `banco` 5 nghĩa vào 5 concept đúng (bank tiền, bench, data bank, workbench, shoal); `avocat` 3 nghĩa (lawyer / avocado / tree) tách đúng; `はし`/`橋` (bridge, chopsticks, edge, nose bridge); `tambor` nhạc cụ vào `drum`, bộ phận máy vào concept riêng cùng `fr:tambour` (flash-lite gộp sai vào thùng). Không thấy nối nhầm.
- **Chia sẻ ảnh (cơ hội):** 168/722 nghĩa (23%) dùng lại ảnh của nghĩa cùng concept thay vì vẽ lại. Mẫu thiên lệch (nhiều từ chọn để có cặp), không nhân thẳng ra 90.000 nghĩa.

**Lỗi và hạn chế tìm ra khi thử:**
- Nhãn concept tạm là cả chuỗi gloss ("shoes, footwear, boots") làm judge cho rằng nó "rộng hơn" `shoe` nên không nối tiếng Anh vào. **Đã sửa**: nhãn = gloss đầu. (Chưa chạy lại toàn bộ sau sửa này; mới kiểm lại riêng `shoe`.)
- `gemini-embedding-001` trả 429 thoáng qua khi nối liền 722 nghĩa; có thử lại 4 lần, không mất nghĩa nào.
- Judge flash vẫn nối vài cặp gần nghĩa (huge/vast, wide/large, spoon/ladle, jump/start, affectionate/cuddly) và `ja:抱擁` (ôm) vào `acceptance`. Đây là đầu vào cho tầng 2 và cho bước duyệt (chưa có).
- Hai lần judge cùng một model không độc lập (cùng sai cùng một chỗ vẫn xảy ra). Chưa thử model khác (Haiku) hay lần thứ ba bằng model mạnh hơn.
- `lexical_gap` chưa kích hoạt; khoá advisory tuần tự (~1,7 giây / nghĩa), nạp hàng loạt cần bước gom cụm toàn cục; pool vector nạp lại từ DB mỗi lần (đủ tới vài chục nghìn concept, sau đó dùng pgvector / Redis Stack); embedding 768 chiều chưa thử.
- Mẫu nhỏ và tự chấm: số liệu trên chỉ để so sánh tương đối (flash-lite vs flash), chưa thay được bộ kiểm 300+ nghĩa có nhãn người.

---

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
