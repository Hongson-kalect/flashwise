#!/usr/bin/env bash
# Tải nguồn mở về thư mục RAW (ngoài repo) và lọc Wiktionary sang KK, rồi chạy build_seed.py.
# Dùng: bash fetch.sh <RAW> <KK> <OUT>
set -euo pipefail
RAW=${1:?RAW}; KK=${2:?KK}; OUT=${3:?OUT}
HERE=$(cd "$(dirname "$0")" && pwd)
mkdir -p "$RAW/jlpt" "$KK" "$OUT"

# Tần suất (OpenSubtitles, hermitdave/FrequencyWords, CC BY-SA 4.0)
G=https://raw.githubusercontent.com/hermitdave/FrequencyWords/master/content/2018
for l in en ja ko fr de es ru; do curl -sL -o "$RAW/freq_$l.txt" "$G/$l/${l}_full.txt"; done
curl -sL -o "$RAW/freq_zh.txt" "$G/zh_cn/zh_cn_full.txt"

# Nhật: JMdict (EDRDG, CC BY-SA 4.0) + OpenJLPT (CC BY-SA 4.0, cấp N5-N1 của Jonathan Waller, câu ví dụ Tatoeba)
curl -sL -o "$RAW/JMdict_e.gz" http://ftp.edrdg.org/pub/Nihongo/JMdict_e.gz
for n in 5 4 3 2 1; do
  curl -sL -o "$RAW/jlpt/vocab-n$n.csv" "https://raw.githubusercontent.com/evanclan/OpenJLPT/HEAD/data/csv/vocab-n$n.csv"
done

# Trung: CC-CEDICT (CC BY-SA 4.0), HSK 3.0 (drkameleon/complete-hsk-vocabulary), thành ngữ Tân Hoa (pwxcoo/chinese-xinhua)
curl -sL -o "$RAW/cedict.zip" https://www.mdbg.net/chinese/export/cedict/cedict_1_0_ts_utf-8_mdbg.zip
curl -sL -o "$RAW/hsk_complete.json" https://raw.githubusercontent.com/drkameleon/complete-hsk-vocabulary/main/complete.json
curl -sL -o "$RAW/idiom_xinhua.json" https://raw.githubusercontent.com/pwxcoo/chinese-xinhua/master/data/idiom.json

# Wiktionary (kaikki.org, CC BY-SA 4.0 + GFDL): stream rồi lọc, không lưu bản gốc (English ~3,4 GB)
for L in Korean Japanese Chinese French German Spanish Russian English; do
  curl -sL "https://kaikki.org/dictionary/$L/kaikki.org-dictionary-$L.jsonl" | python -I -X utf8 "$HERE/kaikki_filter.py" "$KK/$L.jsonl"
done

python -I -X utf8 "$HERE/build_seed.py" "$RAW" "$KK" "$OUT"
