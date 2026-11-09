import sys, json
out = open(sys.argv[1], 'w', encoding='utf-8')
n = 0
for line in sys.stdin.buffer:
    try:
        e = json.loads(line)
    except Exception:
        continue
    senses = e.get('senses') or []
    if not senses:
        continue
    # bo dang chia / bien the (form_of, alt_of) de chi con lemma
    if all(('form_of' in s or 'alt_of' in s) for s in senses):
        continue
    tags = set()
    gl = []
    for s in senses:
        tags.update(s.get('tags') or [])
        g = s.get('glosses') or []
        if g and len(gl) < 3:
            gl.append(g[-1])
    rec = {'w': e.get('word'), 'p': e.get('pos'), 'g': gl, 't': sorted(tags), 'n': len(senses)}
    if e.get('forms'):
        rec['r'] = [f.get('form') for f in e['forms'] if 'romanization' in (f.get('tags') or [])][:2]
    out.write(json.dumps(rec, ensure_ascii=False) + '\n')
    n += 1
out.close()
print('kept', n, file=sys.stderr)
