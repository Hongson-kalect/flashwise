# 40 ngôn ngữ nên có, theo thứ tự giảm dần độ "cần có"

Thứ tự này là đánh giá của tôi (chưa kiểm chứng bằng số liệu thật), dựa trên 4 tiêu chí:
1. Nhu cầu của người học Việt Nam (nguồn `vi`).
2. Nhu cầu toàn cầu (nguồn `en`).
3. Khoảng trống: các app hiện có hỗ trợ ngôn ngữ đó tốt hay kém.
4. Độ khó dựng dữ liệu (chữ viết, phiên âm, thư viện có sẵn).

Cột "Roman" cho biết ngôn ngữ cần trường phiên âm chữ Latin. Đã có thư viện tự sinh là ja, zh, ko (xem `utils/ai/romanize.py` bên flashwise_api); các ngôn ngữ khác ghi "cần thư viện" hoặc "AI".

## Nhóm 1 – Bắt buộc có ngay (1–8)

| # | Ngôn ngữ | Mã | Roman | Lý do chính |
|---|---|---|---|---|
| 1 | Tiếng Anh | en | không | Nhu cầu số 1 ở Việt Nam và thế giới |
| 2 | Tiếng Nhật | ja | có (đã làm) | Rất đông người Việt học (du học, lao động, kỹ sư) |
| 3 | Tiếng Hàn | ko | có (đã làm) | Tăng nhanh nhờ giải trí và việc làm |
| 4 | Tiếng Trung (Quan thoại) | zh | có (đã làm) | Học ở trường, thương mại, nhu cầu ổn định |
| 5 | Tiếng Pháp | fr | không | Top thế giới, có nền giảng dạy ở Việt Nam |
| 6 | Tiếng Đức | de | không | Du học nghề, điều dưỡng; ít app tốt cho người Việt |
| 7 | Tiếng Tây Ban Nha | es | không | Top 2 thế giới trên app học ngôn ngữ |
| 8 | Tiếng Nga | ru | cần thư viện | Có cộng đồng học tại Việt Nam, chữ Cyrillic |

## Nhóm 2 – Nên có sớm (9–20)

| # | Ngôn ngữ | Mã | Roman | Lý do chính |
|---|---|---|---|---|
| 9 | Tiếng Thái | th | cần thư viện | Láng giềng, du lịch, nhu cầu tăng; ít app tốt |
| 10 | Tiếng Ý | it | không | Top 7 thế giới, dữ liệu dễ |
| 11 | Tiếng Bồ Đào Nha | pt | không | Thị trường Brazil rất lớn |
| 12 | Tiếng Hindi | hi | cần thư viện | Tăng nhanh nhất trên app học ngôn ngữ |
| 13 | Tiếng Việt (cho người nước ngoài) | vi | không | Thị trường người học Hàn, Nhật, Trung, Mỹ ở Việt Nam; lợi thế dữ liệu của mình |
| 14 | Tiếng Indonesia | id | không | Dân số lớn, ngữ pháp dễ, ít app tốt |
| 15 | Tiếng Ả Rập | ar | cần thư viện | Nhu cầu toàn cầu lớn; khó, cần chữ phải-sang-trái và phiên âm |
| 16 | Tiếng Thổ Nhĩ Kỳ | tr | không | Nhu cầu cao, nhiều người học trên app |
| 17 | Tiếng Quảng Đông | yue | có (jyutping) | Cộng đồng Hoa kiều, thiếu app tốt |
| 18 | Tiếng Mã Lai | ms | không | Dùng chung nhiều nền tảng với tiếng Indonesia |
| 19 | Tiếng Khmer | km | AI | Láng giềng, cầu từ doanh nghiệp và biên giới; gần như không có app |
| 20 | Tiếng Lào | lo | AI | Giống Khmer: nhu cầu nhỏ nhưng không có đối thủ |

## Nhóm 3 – Mở rộng (21–32)

| # | Ngôn ngữ | Mã | Roman | Lý do chính |
|---|---|---|---|---|
| 21 | Tiếng Hà Lan | nl | không | Đông người học trên app |
| 22 | Tiếng Ba Lan | pl | không | Đông người Việt sống ở Ba Lan và Đông Âu |
| 23 | Tiếng Philippines (Tagalog) | tl | không | Láng giềng, nhu cầu lao động |
| 24 | Tiếng Thụy Điển | sv | không | Nhiều người học trên app |
| 25 | Tiếng Ukraina | uk | cần thư viện | Nhu cầu tăng mạnh từ 2022 |
| 26 | Tiếng Séc | cs | không | Đông người Việt sống ở Séc |
| 27 | Tiếng Hy Lạp | el | cần thư viện | Học thuật, du lịch |
| 28 | Tiếng Do Thái | he | cần thư viện | Tôn giáo và học thuật |
| 29 | Tiếng Ba Tư | fa | cần thư viện | Ít app tốt |
| 30 | Tiếng Bengal | bn | cần thư viện | Hơn 250 triệu người nói |
| 31 | Tiếng Urdu | ur | cần thư viện | Cùng thị trường Nam Á với Hindi |
| 32 | Tiếng Swahili | sw | không | Đông người học nhất ở châu Phi |

## Nhóm 4 – Làm khi đã vững (33–40)

| # | Ngôn ngữ | Mã | Roman | Lý do chính |
|---|---|---|---|---|
| 33 | Tiếng Romania | ro | không | Nhu cầu vừa |
| 34 | Tiếng Hungary | hu | không | Khó, ít app tốt |
| 35 | Tiếng Đan Mạch | da | không | Nhu cầu vừa |
| 36 | Tiếng Na Uy | no | không | Nhu cầu vừa |
| 37 | Tiếng Phần Lan | fi | không | Nhu cầu vừa, ngữ pháp khó |
| 38 | Tiếng Tamil | ta | cần thư viện | Nam Á, thị trường tiềm năng |
| 39 | Tiếng Myanmar | my | AI | Láng giềng, nhu cầu nhỏ |
| 40 | Tiếng Latin | la | không | Học thuật, người học đam mê |

## Lưu ý khi dùng bảng

- **Thứ tự theo cặp:** bảng xếp theo ngôn ngữ đích. Với người Việt, cặp quan trọng nhất là `en`, `ja`, `ko`, `zh`, `fr`, `de` (đích) học từ `vi`. Với người nước ngoài, thêm `vi` làm đích (hạng 13).
- **Chi phí:** mỗi ngôn ngữ mới tốn tiền AI để seed từ vựng (xem ước tính 60.000 từ ở `docs/market-research.md`). Nên làm theo nhóm, hết nhóm 1 rồi mới sang nhóm 2, và đo nhu cầu thật bằng số lượt tra từ trước khi mở nhóm sau.
- **Ngôn ngữ cần roman chưa có thư viện:** ru, th, hi, ar, uk, el, he, fa, bn, ur, ta cần thêm thư viện chuyển tự (hoặc để AI sinh rồi kiểm tra) như đã làm cho ja/zh/ko.
- **Độ tin cậy:** đây là phán đoán, không phải số đo. Thứ tự 9–20 và 21–32 dễ đổi nhất khi có dữ liệu thật.
