# Tiến độ seed (vị trí đã seed theo ngôn ngữ và loại)

Cập nhật sau mỗi lần seed. Nguồn đầy đủ: `data/seed/<lang>/{words,phrases,idioms,proverbs}.tsv` và `words_ref.jsonl` (sắp theo độ thông dụng giảm dần, cột `rank`). Con trỏ step nằm ở `flashwise_api/seed_runs/<thư mục step>/manifest.json` (gitignore).

Ngữ cảnh: 8 ngôn ngữ nhóm 1 (en, ja, ko, zh, fr, de, es, ru; `docs/language-priority.md`). Tiếng Anh seed nhiều hơn hẳn các ngôn ngữ khác để làm neo concept và vì nhu cầu học nổi bật nhất. Số từ dự kiến theo mức (miễn cưỡng / tạm / ổn / bao quát) ở phần cuối.

## Đã seed

Nguồn đang dùng cho en là **mẫu 1.000 từ đầu** `fixtures/wordlists/en_top1000_ref.jsonl` (996 dòng, hạng trùng hạng trong `data/seed/en/words_ref.jsonl`); sang hạng > 1.000 phải đổi `--source` sang file đầy đủ.

| Ngôn ngữ | Loại | Đã seed tới (hạng nguồn) | Từ cuối | Run | Ghi chú |
|---|---|---|---|---|---|
| en | words | 282 | `haven` | r273 (step_0009) | mọi hạng 1–282 trừ từ ≥ 50 nghĩa Wiktionary (từ step 12 trở đi ngưỡng 40; đưa sang `multi_sense.jsonl`, chưa thêm) |
| en | words | 303 | `myself` | r283 (step_0010) | 20 từ, 69 nghĩa, toàn Haiku batch, concept qua hàng đợi Redis; chi tiết dưới |
| en | words | 381 | `different` | r357 (step_0012) | 20 từ, 76 nghĩa, từ file đã lọc dạng chia `seed_runs/sources/en_lemmas_ref.jsonl` (hạng gốc giữ nguyên); 2 từ ≥ 40 nghĩa sang `multi_sense.jsonl` |
| en | words | 356 | `under` | r304 (step_0011) | 50 từ, 192 nghĩa; 3 từ ≥ 50 nghĩa (`play`, `open`, `turn`) sang `multi_sense.jsonl`; ngưỡng đổi 40 từ step 12 |
| en | words | 506 | (xem step_0013) | r384 (step_0013) | 100 từ (99 lưu, `comes` bị draft từ chối vì chỉ có nghĩa nhạc fugue), 407 nghĩa, từ `en_lemmas_ref.jsonl`; 12 từ ≥ 40 nghĩa sang `multi_sense.jsonl`; hạng 384–506 |
| en | words | 661 | (xem step_0014) | r661 (step_0014) | 100 từ (98 lưu, `o` và `sam` bị draft từ chối), 368 nghĩa, toàn Haiku batch từ `en_lemmas_ref.jsonl`; 12 từ ≥ 40 nghĩa sang `multi_sense.jsonl`, 21 từ bỏ qua vì đã có trong DB (từ thêm tay 12/11); hạng 507–661 |
| en | words | 787 | (xem step_0015) | r787 (step_0015) | 100 từ (99 lưu, `bought` bị draft từ chối: dạng chia của `buy`), 328 nghĩa, toàn Haiku batch từ `en_lemmas_ref.jsonl`; 9 từ ≥ 40 nghĩa sang `multi_sense.jsonl`; hạng 663–787 |
| en | words | 925 | (xem step_0016) | r925 (step_0016) | 110 từ (109 lưu, `lt` bị draft từ chối), 391 nghĩa, toàn Haiku batch từ `en_lemmas_ref.jsonl` (cắt tới hạng 1000: `en_lemmas_ref_top1000.jsonl`); 13 từ ≥ 40 nghĩa sang `multi_sense.jsonl`, 2 từ bỏ qua vì đã có; hạng 788–925 |
| en | words | 1000 | (xem step_0017) | r1000 (step_0017) | 63 từ (62 lưu, `cops` bị từ chối), 210 nghĩa, 2 từ ≥ 40 nghĩa sang `multi_sense.jsonl`; hạng 926–1000 = hết mẫu 1.000 từ đầu; concept qua hàng đợi Redis lần đầu |
| en | phrases / idioms / proverbs | chưa | | | |
| es | words | 5 từ thử (không theo hạng) | `feliz` | xes1 (online, 2026-11-11) | `esposa, mañana, puerta, hermano, feliz` để thử nối concept với en; 13 nghĩa; chi tiết ở mục dưới |
| ja, ko, zh, fr, de, ru | mọi loại | chưa | | | |

Ngoài danh sách bước: DB còn các từ tiếng Anh của các đợt seed thử trước (r130, r232, r252), tổng 338 từ `COMPLETED` tính đến 2026-11-11 trước r283.

## Đối chiếu chi phí với số dư thật

- r273 (10 từ, 36 nghĩa): số dư Claude giảm từ $2,61 xuống $2,58 (người dùng báo), tức ≈ $0,03. Khớp với số tự đo ≈ $0,025 + ~$0,003 chạy lại `hold`. (Log phiên ghi $3,61 lúc bắt đầu, nhiều khả năng gõ nhầm.)
- r283 (20 từ, 69 nghĩa): Claude batch ≈ $0,0415 (draft 0,0059; refine 0,0036; dịch 0,0149; metadata 0,0034; verify 0,0101; brief 0,0036) + judge concept online ≈ $0,006 (ước tính theo r273, chưa đo) ≈ $0,048 ≈ $0,0024 / từ. Số dư thật: $2,58 (sau r273) → $2,53 (người dùng báo sau r283 + xes1, lúc r304 vừa bắt đầu) ≈ $0,05, khớp tự đo r283 ≈ $0,048 + xes1 ≈ $0,008 (≈ $0,056, chênh nhỏ vì r304 có thể đã bị tính một phần).

## r283: số đo (2026-11-11, UTC)

- **Thời gian**: draft 8,7 phút, refine 3,1, enrich 3,1, verify 3,1, brief 2,0, ảnh 10 giây ⇒ 20,3 phút; concept worker 129,5 giây cho 69 nghĩa (1,88 giây / nghĩa; r273: 72 giây / 35 nghĩa ≈ 2,06 giây). Tổng ≈ 22,5 phút cho 20 từ (r273: ≈ 43 phút cho 10 từ, batch hôm nay nhanh hơn).
- **Concept**: 59 tạo mới, 9 nối, 1 ambiguous_split; 0 lỗi, hàng đợi Redis chạy đúng trên dữ liệu thật.
- **Verify** (276 cặp nghĩa x ngôn ngữ): ok 102, fixed 76, flagged 98 (35%; r273 44%, r232 32%). Theo ngôn ngữ flagged: vi 29, zh 29, es 23, fr 17. Trong 98 flagged có 85 là Haiku nói ok nhưng điểm < 80 (79% trong đó nằm 70–75) và 13 là bản sửa điểm thấp. Đọc mẫu: phần lớn bản dịch đúng; lỗi thật ví dụ `tomorrow` (adverb) vi có `tương lai` (danh từ). Nghi ngờ flagged cao chủ yếu do ngưỡng `SEED_VERIFY_OK_MIN_SCORE=80` quá chặt, chưa kiểm độc lập.
- **Brief ảnh**: scene 35, action 18, object 11, manual 5 (7%; r273 11%).
- **Nghĩa**: `meet` 9 nghĩa, `hard` 6, `while` 5; mọi nghĩa đều có metadata.

## r304 (50 từ, 192 nghĩa, 2026-11-11, UTC)

- **Thời gian**: draft 2,6 phút, refine 2,1, enrich 3,6, verify 3,1, brief 2,6, ảnh 36 giây ⇒ 14,9 phút cho flow (08:12 → 08:27); concept worker 352,7 giây cho 192 nghĩa (1,84 giây / nghĩa; 153 tạo mới, 31 nối, 8 ambiguous_split, 0 lỗi) ⇒ tổng ≈ 20,8 phút. Nhanh hơn r283 dù gấp 2,5 lần số từ vì batch của Anthropic xong sớm hơn.
- **Chi phí Claude batch** ≈ $0,1154 (draft 0,016; refine 0,0106; dịch 0,0430; metadata 0,0093; verify 0,0271; brief 0,0093) ≈ $0,0023 / từ ≈ $0,0006 / nghĩa. Chưa gồm judge concept online (ước tính ≈ $0,017, theo giá r273; chưa đo). Ước tính trước đó $0,12 cho 50 từ: đúng.
- **Chất lượng**: 192 nghĩa (7 nghĩa nhiều nhất: `lost` 9, `under` 8, `part` / `working` / `sit` / `school` 7), 0 nghĩa thiếu metadata, 0 request phải chạy online bù (dịch 162/162, brief 51/51). Verify 768 cặp: ok 363 (47%), fixed 146 (19%), flagged 259 (34%); theo ngôn ngữ flagged: es 61, fr 62, vi 66, zh 70. Brief ảnh: object 69, scene 64, action 48, manual 11 (6%). 150/192 nghĩa đã có ảnh lúc kiểm.
- **Dạng chia / biến thể vẫn thành mục riêng** (câu hỏi biến tố còn treo): `killed` có nghĩa "Past tense and past participle of 'kill'" và 2 nghĩa tính từ; `working` 7 nghĩa trộn động từ / tính từ / danh từ, nhiều cặp gần trùng; `gone` có nghĩa giới từ lạ; `having`, `thinking`, `saying`, `looks`, `gotta`, `um` đều ra nghĩa riêng. Sẽ tạo concept trùng với từ gốc khi `kill`, `work`... được seed. Cần quyết: bỏ dạng chia khỏi nguồn, hay để AI ghi "dạng chia của X" rồi nối vào nghĩa gốc.

## r357 (20 từ, 76 nghĩa, 2026-11-11, UTC)

- **Thời gian**: draft 33,3 phút (batch Anthropic chậm lần này; r304 chỉ 2,6 phút), refine 10,2, enrich 2,6, verify 3,1, brief 2,0, ảnh 9 giây ⇒ 51 phút cho flow (09:32 → 10:23); concept worker 144,2 giây cho 76 nghĩa (1,9 giây / nghĩa; 64 tạo mới, 7 nối, 5 ambiguous_split, 0 lỗi). Thời gian batch không ổn định, không nên coi 15 phút là chuẩn.
- **Chi phí Claude batch** ≈ $0,0437 (draft 0,0061; refine 0,0039; dịch 0,0158; metadata 0,0037; verify 0,0107; brief 0,0036) + judge ước tính ≈ $0,007 ≈ $0,0026 / từ. Số dư: $2,53 → $2,38 sau r304, người dùng báo $2,38 trước r357.
- **Chất lượng**: 0 nghĩa thiếu metadata, 0 request chạy bù. Verify 304 cặp: ok 117 (38%), fixed 58 (19%), flagged 129 (42%). Brief ảnh: scene 29, object 21, action 19, manual 7 (9%); 70/76 nghĩa đã có ảnh lúc kiểm.
- **Luật "không tạo nghĩa chỉ là dạng chia" có hiệu lực**: 0 nghĩa kiểu "past tense / plural of ..." trong 76 nghĩa (r304: `killed`, `looks`... có). **Bảng `WordForm` dựng ngay khi lưu**: 56 dòng cho 14 / 20 từ (6 từ không biến cách: `five`, `its`, `whatever`...).

## r384 (100 từ, 407 nghĩa, 2026-11-11, UTC)

- **Thời gian** 47 phút (13:27:50 → 14:14:56): draft 3,1, refine 3,1, enrich 3,6, verify 3,7, brief ảnh 19,5 (batch brief chậm bất thường), ảnh xếp việc 65 giây, concept 12,7 phút (407 nghĩa, 1,87 giây / nghĩa, tuần tự). Chạy bằng `seed_flow run` đơn (không pipeline).
- **Chi phí Claude batch** ≈ $0,2326 (draft 0,0327; refine 0,0199; metadata 0,0196; dịch 0,0855; verify 0,0561; brief 0,0189) + judge ước tính ≈ $0,04 ≈ $0,0027 / từ. Số dư lúc bắt đầu $2,32 (người dùng báo).
- **Chất lượng**: 0 request chạy bù, 0 lỗi batch. Verify 1628 cặp: ok 679 (42%), fixed 338 (21%), flagged 611 (38%). Concept: 345 tạo mới, 52 nối, 10 ambiguous_split. WordForm: 74 / 99 từ có form (dựng lúc lưu). Số nghĩa mỗi từ: 1 nghĩa 5 từ, 2: 18, 3: 26, 4: 14, 5: 11, 6: 11, 7: 6, 8: 5, 9: 2, 11: 1. 384 / 407 nghĩa đã có `image_preview` lúc kiểm.
- **Tổng DB sau r384**: 535 từ, 2085 nghĩa, 1846 concept, 908 dòng WordForm, 54 MB.


## r661 (100 từ, 368 nghĩa, 2026-11-13, UTC)

- **Thời gian** ≈ 25 phút (05:20 → 05:45): draft 2, refine 2, enrich 3,5 (batch Claude xong sớm), verify 2, brief ảnh + xếp việc ≈ 3, concept 12,8 phút (368 nghĩa). Toàn Haiku batch (`SEED_ENRICH_PROVIDER=claude IMAGE_BRIEF_PROVIDER=claude CONCEPT_JUDGE_PROVIDER=claude`); nguyên nhân bỏ Gemini batch: lượt bù `bf1113` cho thấy Gemini batch không có kết quả khớp (58 request đều phải gọi online bù).
- **Chi phí Claude batch** ≈ $0,2181 (draft 0,0324; refine 0,0195; dịch 0,0782; metadata 0,0185; verify 0,0517; brief 0,0178) + judge concept bằng Claude (online) ≈ $0,03 ≈ $0,0025 / từ. enrich: 304 request đều từ batch, 0 gọi online bù; brief: 98 lệnh gộp, 0 viết lại online.
- **Chất lượng**: 98 từ lưu, 2 từ bị draft từ chối (`o`, `sam`: ký tự / tên riêng). Verify 1.472 cặp: ok 652 (44%), fixed 297 (20%), flagged 523 (36%). Concept: 269 tạo mới, 73 nối, 26 ambiguous_split. 368/368 nghĩa đủ 5 ngôn ngữ, đủ verify, đủ metadata, đủ concept; WordForm 228 dòng. Ảnh 149/368 lúc kiểm (còn lại đang trong hàng đợi vẽ ComfyUI).
- **Vị trí seed en**: hạng **661** (con trỏ `make-step` = 661).

## r787 (100 từ, 328 nghĩa, 2026-11-13, UTC)

- **Thời gian** ≈ 26 phút (07:22 → 07:48): draft 2, refine 2, enrich 3, verify 3, brief ảnh + xếp việc ≈ 4, concept 11,2 phút (328 nghĩa). Toàn Haiku batch (`SEED_ENRICH_PROVIDER=claude IMAGE_BRIEF_PROVIDER=claude CONCEPT_JUDGE_PROVIDER=claude`).
- **Chi phí Claude batch** ≈ $0,2048 (draft 0,0313; refine 0,0185; dịch 0,0721; metadata 0,0170; verify 0,0488; brief 0,0172) + judge concept bằng Claude (online) ≈ $0,03 ≈ $0,0024 / từ. 286/286 request enrich và 99 lệnh gộp brief đều lấy từ batch, 0 gọi online bù.
- **Chất lượng**: 99 từ lưu, 1 từ từ chối (`bought`). Verify 1.312 cặp: ok 537 (41%), fixed 280 (21%), flagged 495 (38%). Concept: tạo mới 242, nối 65, `ambiguous_split` 21. 328/328 nghĩa đủ 5 ngôn ngữ, đủ verify, metadata, concept; WordForm 223 dòng. Ảnh 318/328 lúc kiểm (còn lại đang trong hàng đợi vẽ).
- **Vị trí seed en**: hạng **787** (con trỏ `make-step` = 787). DB sau r787: 762 từ `COMPLETED`, 2.897 nghĩa.
- Flow seed kiểm DB trước khi gọi AI: `make-step` bỏ từ đã có (`skipped.existing`) và `stage_prepare` đánh dấu `skipped` từ đã `COMPLETED / REJECTED / BANNED`.

## r925 + r1000 (173 từ, 601 nghĩa, 2026-11-13, UTC)

- **Chạy song song các giai đoạn batch**: hai run gửi batch cùng lúc (giới hạn Message Batches rộng và tách khỏi API thường); xong cả hai trong ≈ 30 phút (07:56 → 08:25) thay vì ≈ 50–60 phút nếu chạy lần lượt. Concept không chồng nhau.
- **r925** (110 từ, 109 lưu, 391 nghĩa): Claude batch ≈ $0,238 (draft 0,0359; refine 0,0213; dịch 0,0853; metadata 0,0198; verify 0,0561; brief 0,0198). 328/328 request dịch từ batch, 111 lệnh gộp brief từ batch, 0 gọi online bù. Verify 1.564 cặp: ok 704, fixed 266, flagged 594. Concept (nối trực tiếp trong flow, 748 s): tạo mới 321, nối 53, ambiguous_split 17. WordForm 248. Ảnh 363/391 lúc kiểm.
- **r1000** (63 từ, 62 lưu, 210 nghĩa): Claude batch ≈ $0,130 (draft 0,0198; refine 0,0118; dịch 0,0458; metadata 0,0106; verify 0,0309; brief 0,0110). 181/181 request dịch từ batch, 0 gọi online bù. Verify 840 cặp: ok 373, fixed 169, flagged 298. WordForm 128. Ảnh 204/210.
- **Concept qua hàng đợi Redis lần đầu** (`SEED_CONCEPT_QUEUE=true` đã bật trong `.env`): stage concept của r1000 chỉ đẩy 210 nghĩa vào `concept_arr:en` rồi báo "xong"; consumer `seed_flow concept-worker --lang en --once` nối hết 210 nghĩa trong 417 s (1,99 s / nghĩa, giống chế độ inline): tạo mới 163, nối 36, ambiguous_split 11. Bật chế độ hàng đợi mà quên chạy consumer thì nghĩa sẽ chưa có concept dù run báo xong.
- **Chi phí lượt này** ≈ $0,37 Claude + ≈ $0,06 judge concept ≈ $0,0025 / từ. Số dư lúc bắt đầu $1,47 (người dùng báo).
- **Vị trí seed en**: hạng **1000** (hết mẫu top 1.000). Tiếp tục cần nguồn đầy đủ `en_lemmas_ref.jsonl` (cursor 1000 trong manifest). DB sau r1000: **933 từ `COMPLETED`, 3.498 nghĩa, 3.487 nghĩa có concept**.

## Bù cho từ online cũ (2026-11-13, run `bf1113`)

29 từ tiếng Anh tạo bằng luồng online ngày 2026-11-12 (các nhóm hạng 508-536 như `plan`, `cause`, `king`, cộng `chair`, `river`, `window`, `kettle`, `gazebo`, `scone`, `xylophone`, `break the ice`; bỏ `bastard`, `bitch` thô tục) thiếu bản dịch es / fr / zh, verify và concept. Bù bằng `seed_flow backfill` + `run` (mode batch). Kết quả: 100 nghĩa, **100/100 đủ 5 ngôn ngữ** (en, vi, zh, es, fr), **100/100 có verify** cả 4 ngôn ngữ dịch (ok 156, fixed 83, flagged 161 / 400 cặp), **100/100 có concept** (tạo mới 87, nối 10, ambiguous_split 3), ảnh 94/100 (6 nghĩa chưa có ảnh), metadata 100/100. Chi phí Claude (verify batch) ≈ $0,0154 (111.688 vào / 39.401 ra); Gemini dịch 58 request: lượt batch không có kết quả khớp nên cả 58 gọi online bù (ghi `enrich_batch: 0 từ batch`), chưa tìm nguyên nhân. Từ nay luồng online tạo từ mới đã làm đủ các bước này (xem CLAUDE.md của flashwise_api). Các từ này nằm ở hạng ≥ 508 nên seed sẽ bỏ qua khi tới (đã có trong DB), con trỏ không lệch.

## Lọc dạng chia khỏi nguồn en (2026-11-11)

`seed_flow lemmas` trên `data/seed/en/words_ref.jsonl` (115.316 dòng): **giữ 108.109** (trong đó 641 dạng chia được giữ vì có nghĩa riêng: 558 vì loại từ riêng như `saw` danh từ, `ground`, `number`, `gone` giới từ, 83 vì ≥ 8 nghĩa riêng như `opening`, `reading`), **loại 7.207** (`is`, `was`, `got`, `going`, `things`, `years`, `wanted`, `talking`...). File: `flashwise_api/seed_runs/sources/en_lemmas_ref.jsonl` (+ `.dropped.tsv`, `.kept_forms.tsv`; gitignore, dựng lại bằng lệnh trên). Rank gốc giữ nguyên nên `make-step --source` file này dùng tiếp cursor 356. Sai đã biết: `evening` bị coi là dạng của `even` (thêm vào `--keep`); `looks`, `saying`, `thinking`, `working` bị loại vì chỉ có nghĩa phái sinh. Chưa seed gì trên file mới.

## xes1: thử nối concept tiếng Tây Ban Nha vào neo tiếng Anh (2026-11-11)

5 từ es (`esposa, mañana, puerta, hermano, feliz`), luồng online, judge Haiku online, nối inline. 13 nghĩa: **9 nối** vào concept en có sẵn, **4 tạo mới**. Cos của nghĩa nối 0,73–0,96. Nối đúng cả 9 theo đọc tay, kể cả ca khó: `puerta` (cơ hội) → `room` (chance), `mañana` (buổi sáng) → `morning` (cos 0,96). 4 tạo mới: `esposa` (còng tay, en chưa có: đúng), `feliz` (dịp vui, en `happy` chỉ có cảm giác / may mắn: hợp lý), `mañana` (tương lai, danh từ vs `tomorrow` trạng từ: hợp lý), `hermano` (người cùng nhóm / dân tộc) có ứng viên `brother` 0,77 nhưng judge chọn không: **nghi âm tính giả**, vì en `brother` có nghĩa "bạn thân / cùng nhóm" (concept 37cf). Judge đưa nó vào `near`. Thời gian ≈ 75 giây, Claude ≈ $0,008 (draft, refine, verify; dịch + metadata online dùng Gemini, chưa đo).

## Mục tiêu số từ theo mức (đề xuất 2026-11-11, mốc từ trí nhớ, chưa kiểm nguồn)

| Mức | en, fr, de, es, ru | ja | zh | ko |
|---|---|---|---|---|
| Miễn cưỡng đủ dùng | 2.000 | 1.500 (N5–N4) | 2.245 (HSK 3.0 cấp 1–3) | 1.800 (TOPIK I) |
| Tạm | 5.000 | 3.750 (N3) | 3.245 | 3.500 |
| Ổn | 10.000 | 6.000–8.000 | 5.456 | 6.000 |
| Gần như bao quát | 20.000 | 10.000–12.000 | 11.092 | 10.000 |

Cụm / thành ngữ / tục ngữ: ít hơn nhiều, bị giới hạn bởi số dòng nguồn (ko, zh chỉ ~790 cụm; ko 62 thành ngữ). Tiếng Anh dự kiến nhiều hơn các ngôn ngữ khác ở mọi mức.

## Từ thô tục / nhạy cảm đã thêm tay (2026-11-12, en) — seed bỏ qua

Thử cơ chế thô tục (`show_offensive`) và chặn nhạy cảm (`sensitive` → `BANNED`). Các từ này **đã có trong DB** nên luồng seed (`DONE_STATUSES` gồm COMPLETED / REJECTED / BANNED) tự bỏ qua; đừng tạo lại hoặc xoá, đặc biệt hai từ BANNED.

| Từ | Trạng thái | Ghi chú |
|---|---|---|
| `damn` | COMPLETED | 4 nghĩa, cả 4 `is_offensive` |
| `bastard` | COMPLETED | 3 nghĩa, 2 `is_offensive` |
| `bitch` | COMPLETED | 3 nghĩa, 1 `is_offensive` |
| `nigger` | **BANNED** | miệt thị chủng tộc, AI đặt `sensitive`, chặn hẳn |
| `chink` | **BANNED** | AI coi là miệt thị (cũng có nghĩa "khe hở", bị chặn theo): nếu cần từ nghĩa thường thì admin `unban` |

Từ thô tục có sẵn do gợi ý theo nghĩa "chết tiệt": `shit`, `fuck`, `fucking`, `motherfucker` (đã có từ trước, `is_offensive`). Kết quả thử: gợi ý theo từ / theo nghĩa ẩn nghĩa `is_offensive` khi chưa bật `show_offensive`, hiện kèm cờ khi đã bật. Cần chạy lại `ai_worker` sau khi sửa prompt (không có `--reload`) và xoá cache Redis `word:*` của từ cũ (`WordCacheManager.cache_word_clear_specific`).
