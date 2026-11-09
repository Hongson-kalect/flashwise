# Từ vựng nhóm 1 để seed (en, ja, ko, zh, fr, de, es, ru)

Dựng bằng `fetch.sh` (tải nguồn mở) rồi `build_seed.py` (trích xuất). Mỗi ngôn ngữ một thư mục, mỗi loại một file TSV (UTF-8, LF, dòng đầu là tên cột), **sắp theo độ thông dụng giảm dần** (cột `rank`).

```bash
bash data/seed/fetch.sh <RAW> <KK> data/seed   # RAW, KK: thư mục tạm ngoài repo; tải ~150 MB + stream ~4 GB Wiktionary
```

File TSV sinh ra (~60 MB) có thể dựng lại bằng lệnh trên nên không cần commit; script và README này là phần cần giữ.

## Số dòng

| Ngôn ngữ | words | phrases | idioms | proverbs | Ghi chú |
|---|---:|---:|---:|---:|---|
| en | 115.610 | 132.689 | 9.618 | 1.060 | |
| ja | 36.848 | 11.032 | 3.038 | 935 | thêm `*_wiktionary_extra.tsv` (cụm / thành ngữ / tục ngữ không có trong JMdict) |
| ko | 20.436 | 792 | 62 | 46 | thành ngữ và tục ngữ rất ít (xem hạn chế) |
| zh | 65.997 | 786 | 8.968 | 840 | thêm `idioms_xinhua_zh.tsv` (30.895 thành ngữ, giải nghĩa tiếng Trung) |
| fr | 41.202 | 15.517 | 226 | 265 | |
| de | 53.230 | 2.420 | 911 | 248 | |
| es | 51.979 | 12.027 | 3.183 | 223 | |
| ru | 38.831 | 3.166 | 184 | 138 | |

## Cột

- `words.tsv` (en, fr, de, es, ru): `rank, word, pos, freq_opensubtitles, gloss_en`. Ko: `freq_opensubtitles_agg` (đã gộp các dạng chia vào từ gốc).
- `words.tsv` (ja): `rank, word, reading, pos, jlpt, priority, gloss_en, jmdict_id`. `jlpt` là N5..N1 nếu có, `priority` là nhãn ưu tiên của JMdict (news1, ichi1, spec1, gai1...).
- `words.tsv` (zh): `rank, word_simplified, traditional, pinyin, pos, hsk3_level, freq_opensubtitles, gloss_en`.
- `phrases.tsv`, `idioms.tsv`, `proverbs.tsv`: `rank, text, pos, gloss_en` (ja thêm `reading`, `jlpt`, `priority`, `jmdict_id`; `idioms.tsv` ja thêm `is_yoji`).
- Cách sắp:
  - Từ đơn: theo tần suất phụ đề phim (OpenSubtitles). Ja: theo `nfNN`/ưu tiên JMdict, mức JLPT, và tần suất.
  - Cụm, thành ngữ, tục ngữ: không có tần suất riêng, nên sắp theo **trung bình log hạng của các từ thành phần** (ja, zh: theo từng chữ). Chỉ là ước lượng.

## Gợi ý cho prompt AI: `words_ref.jsonl`

Mỗi từ một dòng `{"rank", "w", "entries": [{"pos", "glosses": [≤2 nghĩa, ≤160 ký tự]}]}`, **tách theo loại từ** (cột `gloss_en` trong `words.tsv` là nghĩa gộp mọi loại từ nên có thể lệch `pos`). Dùng với `seed_words --ref` bên flashwise_api; chi tiết trong CLAUDE.md của backend. Tag của Wiktionary gộp cả mục nên đã bỏ, AI tự bỏ nghĩa cổ / hiếm.

## Nguồn và giấy phép

Phần lớn là CC BY-SA, nên khi đưa dữ liệu vào DB của app cần **ghi nguồn** và có thể phải chia sẻ tương tự. Cần xem lại trước khi công khai API hoặc bán dữ liệu (không phải tư vấn pháp lý).

| Nguồn | Dùng cho | Giấy phép |
|---|---|---|
| [hermitdave/FrequencyWords](https://github.com/hermitdave/FrequencyWords) (OpenSubtitles 2018) | tần suất 8 ngôn ngữ | CC BY-SA 4.0 |
| [kaikki.org](https://kaikki.org) (trích xuất Wiktionary) | lemma, nghĩa Anh, cụm, thành ngữ, tục ngữ cho 8 ngôn ngữ | CC BY-SA 4.0 + GFDL |
| [JMdict](https://www.edrdg.org/jmdict/j_jmdict.html) (EDRDG) | từ, cụm, thành ngữ, tục ngữ tiếng Nhật | CC BY-SA 4.0 |
| [OpenJLPT](https://github.com/evanclan/OpenJLPT) (cấp N5–N1 của Jonathan Waller, câu ví dụ Tatoeba) | mức JLPT | CC BY-SA 4.0 |
| [CC-CEDICT](https://cc-cedict.org) | từ tiếng Trung ngoài HSK | CC BY-SA 4.0 |
| [complete-hsk-vocabulary](https://github.com/drkameleon/complete-hsk-vocabulary) | HSK 3.0 | MIT (nghĩa lấy từ CC-CEDICT) |
| [chinese-xinhua](https://github.com/pwxcoo/chinese-xinhua) | 30.895 thành ngữ tiếng Trung | repo MIT, **nhưng nội dung gốc là Từ điển Tân Hoa có bản quyền**: chưa rõ có dùng thương mại được không, nên tách riêng ở `idioms_xinhua_zh.tsv` |

## Hạn chế đã biết

- **Tiếng Hàn là ngôn ngữ yếu nhất.** Không tìm được nguồn mở tải thẳng cho thành ngữ và tục ngữ (62 và 46 dòng là toàn bộ Wiktionary có). Nguồn tốt là Từ điển Mở 우리말샘 / Từ điển học tập của NIKL (cần đăng ký khoá API hoặc tải file) và danh sách từ vựng TOPIK / 한국어 학습용 어휘 (5.965 từ, chưa có bản mở). Cần làm thêm nếu muốn Hàn ngang các ngôn ngữ khác.
- **Tần suất từ phụ đề phim** thiên về văn nói, thiếu từ trang trọng/học thuật; không có CEFR cho en/fr/de/es/ru và không có TOPIK cho ko.
- **Đuôi bảng nhiễu**: các từ có `freq` 1 đến vài chục thường là từ hiếm hoặc từ ghép lạ. Nên cắt theo `freq` hoặc `rank` khi seed (vd en 20.000 đầu).
- **Từ tiếng Anh/Đức/Nga mang nghĩa phụ nhiễu** vì một dạng viết có thể trùng chữ cái, tên chữ cái, viết tắt (đã lọc bớt nghĩa "tên chữ cái"). Các dạng chia (went, gone) bị loại; tần suất của từ gốc chưa gồm tần suất các dạng đó (chỉ ko được gộp).
- **Ko**: việc gộp dạng chia dùng quy tắc đơn giản (cắt hậu tố, phân biệt danh từ + tiểu từ), không có bộ phân tích hình thái nên còn sai ở động từ bất quy tắc và dạng rút gọn.
- **Ja**: JMdict xếp "thành ngữ" (`id`) và "cụm" (`exp`) theo nghĩa đầu của mục; các mục không có nhãn ưu tiên và không thuộc JLPT bị bỏ khỏi `words.tsv` (~180.000 mục hiếm).
- **Chưa kiểm tay**: tôi chỉ xem một số dòng đầu, giữa, cuối mỗi file. Chưa kiểm sai nghĩa hay lỗi dữ liệu một cách có hệ thống.

## Nên dùng nguồn hay để AI sinh

- **Dùng thẳng từ nguồn:** danh sách từ và thứ tự, từ loại, mức (JLPT, HSK), tần suất, cách đọc gốc (kana, pinyin), câu ví dụ có nguồn (Tatoeba qua OpenJLPT, kèm id để ghi công).
- **Dùng làm gợi ý cho AI:** `gloss_en` của nguồn nên đưa vào prompt như nghĩa tham chiếu để AI dịch sang tiếng Việt chính xác và rẻ hơn, nhất là thành ngữ và tục ngữ.
- **Để AI sinh:** nghĩa và cách dùng tiếng Việt, tách nghĩa thành `ai_sense`, câu ví dụ theo ngôn ngữ nghĩa, ảnh nghĩa.
- **Tự tính, không lấy từ nguồn hay AI:** phiên âm roman (`utils/ai/romanize.py` bên flashwise_api).
