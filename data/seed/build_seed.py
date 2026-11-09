"""Dựng file từ vựng nhóm 1 (en, ja, ko, zh, fr, de, es, ru) từ nguồn mở đã tải.

Chạy: python -I -X utf8 build_seed.py <RAW> <KK> <OUT>
  RAW: freq_<lang>.txt, JMdict_e.gz, cedict.zip, hsk_complete.json, idiom_xinhua.json, jlpt/vocab-n*.csv
  KK : <Language>.jsonl đã lọc từ kaikki.org (Wiktionary) bằng fetch.sh
  OUT: thư mục ra, mỗi ngôn ngữ một thư mục con với words/phrases/idioms/proverbs.tsv

Mỗi file sắp theo độ thông dụng giảm dần (cột rank). Nguồn và giấy phép: xem README.md.
"""
import csv
import gzip
import html
import json
import math
import os
import re
import sys
import zipfile
from collections import defaultdict

RAW, KK, OUT = sys.argv[1], sys.argv[2], sys.argv[3]

SPACE_LANGS = {"en", "fr", "de", "es", "ru", "ko"}
KK_NAME = {"en": "English", "ja": "Japanese", "ko": "Korean", "zh": "Chinese", "fr": "French", "de": "German", "es": "Spanish", "ru": "Russian"}
PHRASE_POS = {"phrase", "prep_phrase", "adv_phrase", "verb_phrase", "adj_phrase", "noun_phrase", "contraction"}
SKIP_POS = {"name", "character", "symbol", "abbrev", "punct", "syllable", "romanization", "soft-redirect", "root", "affix", "prefix", "suffix", "combining_form", "infix", "circumfix", "interfix", "postp"}
CJK = re.compile(r"[぀-ヿ㐀-鿿豈-﫿]")


def clean(s):
    return re.sub(r"[\t\r\n]+", " ", str(s)).strip()


def write_tsv(lang, name, header, rows):
    d = os.path.join(OUT, lang)
    os.makedirs(d, exist_ok=True)
    with open(os.path.join(d, name), "w", encoding="utf-8", newline="\n") as f:
        f.write("\t".join(header) + "\n")
        for r in rows:
            f.write("\t".join(clean(x) for x in r) + "\n")
    print(f"{lang}/{name}: {len(rows)}")


def load_freq(lang):
    rows = []
    for line in open(os.path.join(RAW, f"freq_{lang}.txt"), encoding="utf-8"):
        p = line.rstrip("\n").rsplit(" ", 1)
        if len(p) == 2 and p[1].isdigit():
            rows.append((p[0], int(p[1])))
    return rows


def load_kk(lang):
    out = []
    with open(os.path.join(KK, KK_NAME[lang] + ".jsonl"), encoding="utf-8") as f:
        for line in f:
            e = json.loads(line)
            if e.get("w"):
                out.append(e)
    return out


def tokens(text, lang):
    if lang in ("ja", "zh"):
        return CJK.findall(text)
    return re.findall(r"\w+", text.lower())


def phrase_scores(entries, lang, rank, size):
    """Điểm càng nhỏ càng thông dụng: trung bình log(rank) của các từ trong cụm (từ lạ = ngoài bảng)."""
    miss = math.log(size + 1000)
    scored = []
    for e in entries:
        toks = tokens(e["w"], lang)
        if not toks:
            continue
        s = sum(math.log(rank[t] + 1) if t in rank else miss for t in toks) / len(toks)
        scored.append((s, len(e["w"]), e))
    scored.sort(key=lambda x: (x[0], x[1], x[2]["w"]))
    return scored


def classify(e, lang):
    """words / phrases / idioms / proverbs / None."""
    pos, w, tags = e.get("p") or "", e["w"], set(e.get("t") or [])
    if pos in SKIP_POS:
        return None
    if pos == "proverb":
        return "proverbs"
    multi = (" " in w) if lang in SPACE_LANGS else len(w) >= 3 and lang in ("zh", "ja") and pos in PHRASE_POS
    if "idiomatic" in tags and (multi or pos in PHRASE_POS):
        return "idioms"
    if pos in PHRASE_POS or (" " in w and lang in SPACE_LANGS):
        return "phrases"
    if lang in SPACE_LANGS and " " in w:
        return "phrases"
    return "words"


LETTER_GLOSS = re.compile(r"(letter of|name of the .{0,30}(letter|script)|numeral symbol|^misspelling of|^alternative (form|spelling) of)", re.I)


def short(g, limit=160):
    g = clean(g)
    if len(g) <= limit:
        return g
    cut = g[:limit].rsplit(" ", 1)[0].rstrip(",;:- ")
    return cut + "…"


def gloss_of(entries):
    out = []
    for ban in (True, False):
        for e in entries:
            for g in e.get("g") or []:
                g = short(g)
                if ban and LETTER_GLOSS.search(g):
                    continue
                if g and g not in out:
                    out.append(g)
                if len(out) >= 3:
                    return "; ".join(out)
        if out:
            break
    return "; ".join(out)


def _unused_gloss_of(entries):
    out = []
    for e in entries:
        for g in e.get("g") or []:
            g = clean(g)
            if g and g not in out:
                out.append(g)
            if len(out) >= 3:
                return "; ".join(out)
    return "; ".join(out)


def dump_kk_extras(lang, kk, rank, size, skip_words=False):
    """phrases / idioms / proverbs từ Wiktionary. Trả về số dòng."""
    groups = defaultdict(list)
    for e in kk:
        k = classify(e, lang)
        if k and k != "words":
            groups[k].append(e)
    for kind in ("phrases", "idioms", "proverbs"):
        seen, rows = set(), []
        for s, _, e in phrase_scores(groups.get(kind, []), lang, rank, size):
            if e["w"] in seen:
                continue
            seen.add(e["w"])
            rows.append([len(rows) + 1, e["w"], e.get("p") or "", gloss_of([e])])
        write_tsv(lang, f"{kind}.tsv", ["rank", "text", "pos", "gloss_en"], rows)


DROP_TAGS = {"obsolete", "archaic", "historical", "dialectal", "rare", "nonstandard", "misspelling"}
KEEP_TAGS = ("slang", "vulgar", "offensive", "informal", "dated", "colloquial", "figuratively", "transitive", "intransitive")


def write_refs(lang, rows, lemmas):
    """words_ref.jsonl: mỗi từ một dòng, gợi ý THEO TỪNG LOẠI TỪ (không trộn nghĩa giữa các loại từ) để đưa vào prompt AI.
    Mỗi mục tối đa 2 nghĩa, gloss cắt 160 ký tự; chưa lọc nghĩa cổ / hiếm (nguồn không gắn nhãn theo từng nghĩa, để AI tự bỏ); dùng với `seed_words --ref`."""
    path = os.path.join(OUT, lang, "words_ref.jsonl")
    n = 0
    with open(path, "w", encoding="utf-8", newline="\n") as f:
        for r in rows:
            rank_, word = r[0], r[1]
            key = word.lower() if lang != "en" or word != "I" else "i"
            entries = []
            for e in lemmas.get(key, []):
                if e["w"] != word:
                    continue
                gl = []
                for g in e.get("g") or []:
                    g = short(g)
                    if g and not LETTER_GLOSS.search(g) and g not in gl:
                        gl.append(g)
                    if len(gl) >= 2:
                        break
                if not gl:
                    continue
                entries.append({"pos": e.get("p"), "glosses": gl, "n": e.get("n", 0)})  # tag của kaikki gộp mọi nghĩa trong mục nên không đáng tin ở mức nghĩa: bỏ
            if entries:
                f.write(json.dumps({"rank": rank_, "w": word, "n_senses": sum(x["n"] for x in entries), "entries": entries[:6]}, ensure_ascii=False) + "\n")
                n += 1
    print(f"{lang}/words_ref.jsonl: {n}")


def build_space_lang(lang):
    freq = load_freq(lang)
    kk = load_kk(lang)
    lemmas = defaultdict(list)
    for e in kk:
        if classify(e, lang) == "words":
            lemmas[e["w"].lower()].append(e)
    rows, seen = [], set()
    for word, cnt in freq:
        key = word.lower()
        if key in seen or key not in lemmas or (not key.isalpha() and lang != "ko"):
            continue
        seen.add(key)
        ents = lemmas[key]
        want = "I" if (lang == "en" and word == "i") else word
        pick = [e for e in ents if e["w"] == want] or ([e for e in ents if e["w"] == word.capitalize()] if lang == "de" else []) or ents
        pos = list(dict.fromkeys(e["p"] for e in pick if e["p"]))
        rows.append([len(rows) + 1, pick[0]["w"], "/".join(pos), cnt, gloss_of(pick)])
    write_tsv(lang, "words.tsv", ["rank", "word", "pos", "freq_opensubtitles", "gloss_en"], rows)
    write_refs(lang, rows, lemmas)
    rank = {w.lower(): i + 1 for i, (w, _) in enumerate(freq)}
    dump_kk_extras(lang, kk, rank, len(freq))


def build_ko():
    lang = "ko"
    freq = load_freq(lang)
    kk = load_kk(lang)
    lemmas = defaultdict(list)
    for e in kk:
        if classify(e, lang) == "words":
            lemmas[e["w"]].append(e)
    particles = {"이", "가", "은", "는", "을", "를", "에", "에서", "의", "도", "로", "으로", "와", "과", "랑", "이랑", "하고", "만", "까지", "부터", "한테", "에게", "보다", "처럼", "이야", "야", "들", "들이", "들은", "들을"}
    agg = defaultdict(int)
    for word, cnt in freq:
        for n in range(len(word), 0, -1):
            p, rest = word[:n], word[n:]
            noun = p in lemmas
            verb = (p + "다") in lemmas and rest != ""
            hit = None
            if rest == "" and noun:
                hit = p
            elif rest in particles and noun:
                hit = p
            elif verb:
                hit = p + "다"
            elif noun:
                hit = p
            if hit:
                agg[hit] += cnt
                break
    rows = []
    for w, c in sorted(agg.items(), key=lambda x: -x[1]):
        es = lemmas[w]
        rows.append([len(rows) + 1, w, "/".join(dict.fromkeys(e["p"] for e in es)), c, gloss_of(es)])
    write_tsv(lang, "words.tsv", ["rank", "word", "pos", "freq_opensubtitles_agg", "gloss_en"], rows)
    rank = {w: i + 1 for i, (w, _) in enumerate(freq)}
    dump_kk_extras(lang, kk, rank, len(freq))


def numeric_pinyin(py):
    marks = {"a": "āáǎà", "e": "ēéěè", "i": "īíǐì", "o": "ōóǒò", "u": "ūúǔù", "ü": "ǖǘǚǜ"}

    def conv(s):
        m = re.fullmatch(r"([a-zA-Z:]+?)([1-5])", s)
        if not m:
            return s
        base, t = m.group(1).replace("u:", "ü").replace("U:", "Ü"), int(m.group(2))
        if t == 5:
            return base
        low = base.lower()
        pos = None
        for v in "ae":
            if v in low:
                pos = low.index(v)
                break
        if pos is None and "ou" in low:
            pos = low.index("o")
        if pos is None:
            for i in range(len(low) - 1, -1, -1):
                if low[i] in "aeiouü":
                    pos = i
                    break
        if pos is None:
            return base
        ch = base[pos]
        rep = marks.get(ch.lower())
        if not rep:
            return base
        r = rep[t - 1]
        return base[:pos] + (r.upper() if ch.isupper() else r) + base[pos + 1:]

    return " ".join(conv(s) for s in py.split())


def build_zh():
    lang = "zh"
    freq = load_freq("zh")
    kk = load_kk("zh")
    crank = {w: i + 1 for i, (w, _) in enumerate(freq) if len(w) == 1}
    wrank = {w: i + 1 for i, (w, _) in enumerate(freq)}
    cnt = dict(freq)
    # CC-CEDICT
    ced = defaultdict(list)
    with zipfile.ZipFile(os.path.join(RAW, "cedict.zip")) as z:
        data = z.read(z.namelist()[0]).decode("utf-8")
    for line in data.splitlines():
        if line.startswith("#"):
            continue
        m = re.match(r"(\S+) (\S+) \[([^\]]+)\] /(.+)/$", line)
        if m:
            ced[m.group(2)].append((m.group(1), m.group(3), m.group(4).split("/")))
    # HSK
    hsk = json.load(open(os.path.join(RAW, "hsk_complete.json"), encoding="utf-8"))
    hsk_by = {}
    for h in hsk:
        lv = [int(x.split("-")[1]) for x in h.get("level", []) if x.startswith("new-") and x.split("-")[1].isdigit()]
        old = [int(x.split("-")[1]) for x in h.get("level", []) if x.startswith("old-") and x.split("-")[1].isdigit()]
        form = (h.get("forms") or [{}])[0]
        hsk_by[h["simplified"]] = {
            "new": min(lv) if lv else None, "old": min(old) if old else None, "freq": h.get("frequency") or 10**9,
            "pinyin": (form.get("transcriptions") or {}).get("pinyin", ""), "pos": "/".join(h.get("pos") or []),
            "gloss": "; ".join((form.get("meanings") or [])[:3]), "trad": form.get("traditional", ""),
        }

    def noise(defs):
        return all(re.match(r"(surname |variant of|old variant|see |erhua variant|abbr\. for|used in )", d) for d in defs)

    rows, seen = [], set()
    body = []
    for w, c in freq:
        if w in seen:
            continue
        h = hsk_by.get(w)
        ent = ced.get(w)
        if not h and not ent:
            continue
        if not h:
            if any(p[1][:1].isupper() for p in ent) and all(p[1][:1].isupper() for p in ent):
                continue
            if all(noise(p[2]) for p in ent):
                continue
        seen.add(w)
        if h:
            body.append((w, h["pinyin"], h["pos"], h["new"], h["gloss"], c, h["trad"]))
        else:
            p = ent[0]
            body.append((w, numeric_pinyin(p[1]), "", None, "; ".join(p[2][:3]), c, p[0] if p[0] != w else ""))
    left = sorted((w for w in hsk_by if w not in seen), key=lambda w: (hsk_by[w]["new"] or 9, hsk_by[w]["freq"]))
    for w in left:
        h = hsk_by[w]
        body.append((w, h["pinyin"], h["pos"], h["new"], h["gloss"], cnt.get(w, 0), h["trad"]))
    for i, b in enumerate(body, 1):
        rows.append([i, b[0], b[6], b[1], b[2], b[3] if b[3] else "", b[5], b[4]])
    write_tsv(lang, "words.tsv", ["rank", "word_simplified", "traditional", "pinyin", "pos", "hsk3_level", "freq_opensubtitles", "gloss_en"], rows)
    dump_kk_extras(lang, kk, crank, len(crank))
    # thành ngữ Tân Hoa (giải nghĩa tiếng Trung), sắp theo độ thông dụng của từng chữ
    idi = json.load(open(os.path.join(RAW, "idiom_xinhua.json"), encoding="utf-8"))
    miss = math.log(len(crank) + 1000)
    sc = []
    for x in idi:
        w = x["word"]
        s = sum(math.log(crank[ch] + 1) if ch in crank else miss for ch in w) / max(len(w), 1)
        sc.append((wrank.get(w, 10**9), s, x))
    sc.sort(key=lambda t: (t[0], t[1]))
    write_tsv(lang, "idioms_xinhua_zh.tsv", ["rank", "text", "pinyin", "explanation_zh", "example_zh"],
              [[i, x["word"], x["pinyin"], x["explanation"], x["example"]] for i, (_, _, x) in enumerate(sc, 1)])


def build_ja():
    lang = "ja"
    freq = load_freq(lang)
    jrank = {}
    for i, (w, _) in enumerate(freq):
        jrank.setdefault(w, i + 1)
    # JLPT (OpenJLPT, theo jmdict_id)
    jlpt = {}
    for n in (5, 4, 3, 2, 1):
        with open(os.path.join(RAW, "jlpt", f"vocab-n{n}.csv"), encoding="utf-8", newline="") as f:
            for r in csv.DictReader(f):
                if r.get("jmdict_id"):
                    jlpt.setdefault(r["jmdict_id"], n)
    raw = gzip.open(os.path.join(RAW, "JMdict_e.gz")).read().decode("utf-8")
    jl_score = {5: 2000, 4: 4000, 3: 6000, 2: 9000, 1: 12000}
    buckets = defaultdict(list)
    for m in re.finditer(r"<entry>(.*?)</entry>", raw, re.S):
        ent = m.group(1)
        seq = re.search(r"<ent_seq>(\d+)</ent_seq>", ent).group(1)
        kebs = re.findall(r"<keb>(.*?)</keb>", ent)
        rebs = re.findall(r"<reb>(.*?)</reb>", ent)
        pris = re.findall(r"<(?:ke|re)_pri>(.*?)</", ent)
        poss, miscs, glosses, cur = [], set(), [], []
        first_pos, first_misc = [], set()
        any_alive = False
        for sm in re.findall(r"<sense>(.*?)</sense>", ent, re.S):
            sp = re.findall(r"<pos>&?([^;<]+);?</pos>", sm)
            if sp:
                cur = sp
            sm_misc = set(re.findall(r"<misc>&?([^;<]+);?</misc>", sm))
            if not glosses and not first_pos:
                first_pos, first_misc = list(cur), set(sm_misc)
            miscs |= sm_misc
            if not (sm_misc & {"arch", "obs"}):
                any_alive = True
            for p in cur:
                if p not in poss:
                    poss.append(p)
            for g in re.findall(r"<gloss[^>]*>(.*?)</gloss>", sm):
                glosses.append(html.unescape(g))
        if not any_alive or not rebs:
            continue
        head = (rebs[0] if "uk" in miscs and not kebs else (kebs[0] if kebs else rebs[0]))
        if "uk" in miscs:
            head = rebs[0]
        score = 10**9
        nf = [int(p[2:]) for p in pris if re.fullmatch(r"nf\d\d", p)]
        if nf:
            score = min(score, min(nf) * 500)
        elif {"news1", "ichi1"} & set(pris):
            score = min(score, 24000)
        elif pris:
            score = min(score, 30000)
        for form in set(kebs if (kebs and "uk" not in miscs) else rebs):
            if form in jrank:
                score = min(score, jrank[form])
        lv = jlpt.get(seq)
        if lv:
            score = min(score, jl_score[lv])
        kind = "words"
        if "proverb" in first_misc:
            kind = "proverbs"
        elif "yoji" in miscs or "id" in first_misc:
            kind = "idioms"
        elif "exp" in first_pos:
            kind = "phrases"
        elif miscs & {"organization", "company", "product", "work", "hist"} and score >= 10**9:
            continue
        if kind == "words" and score >= 10**9:
            continue  # không có dấu hiệu thông dụng: bỏ khỏi words
        tag = ",".join(sorted(set(pris) & {"news1", "news2", "ichi1", "ichi2", "spec1", "spec2", "gai1", "gai2"}))
        row = (score, len(head), head, rebs[0], "/".join(poss), f"N{lv}" if lv else "", tag, "; ".join(glosses[:3]), seq, "yoji" if "yoji" in miscs else "")
        buckets[kind].append(row)
    for kind, name in (("words", "words.tsv"), ("phrases", "phrases.tsv"), ("idioms", "idioms.tsv"), ("proverbs", "proverbs.tsv")):
        rs = sorted(buckets[kind], key=lambda r: (r[0], r[1], r[2]))
        header = ["rank", "word", "reading", "pos", "jlpt", "priority", "gloss_en", "jmdict_id"] + (["is_yoji"] if kind == "idioms" else [])
        out = []
        for i, r in enumerate(rs, 1):
            line = [i, r[2], r[3], r[4], r[5], r[6], r[7], r[8]]
            if kind == "idioms":
                line.append(r[9])
            out.append(line)
        write_tsv(lang, name, header, out)
    # bổ sung cụm / tục ngữ từ Wiktionary không có trong JMdict
    kk = load_kk(lang)
    have = {r[2] for k in buckets for r in buckets[k]}
    rank = {c: i + 1 for i, c in enumerate(dict.fromkeys(CJK.findall("".join(w for w, _ in freq))))}
    groups = defaultdict(list)
    for e in kk:
        k = classify(e, lang)
        if k and k != "words" and e["w"] not in have:
            groups[k].append(e)
    for kind in ("phrases", "idioms", "proverbs"):
        rows = [[i, e["w"], e.get("p") or "", gloss_of([e])] for i, (_, _, e) in enumerate(phrase_scores(groups.get(kind, []), lang, rank, len(rank)), 1)]
        write_tsv(lang, f"{kind}_wiktionary_extra.tsv", ["rank", "text", "pos", "gloss_en"], rows)


if __name__ == "__main__":
    only = sys.argv[4:] or ["en", "fr", "de", "es", "ru", "ko", "zh", "ja"]
    for lg in only:
        {"ko": build_ko, "zh": build_zh, "ja": build_ja}.get(lg, lambda lg=lg: build_space_lang(lg))()
