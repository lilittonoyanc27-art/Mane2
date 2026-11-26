"""Собирает все новые армянские реплики продолжения → src/core/lines.json (ключ → текст).
Префикс ключа задаёт голос (см. tools/make_voice_family.py): h_ — Харутюн, a_ — Анулик, m_ — Мане/рассказчик.
Запуск: python3 tools/collect_lines.py"""
import re, json, hashlib, pathlib
root = pathlib.Path(__file__).resolve().parent.parent
ARM = re.compile('[Ա-֏]')
STR = re.compile(r"'((?:[^'\\\n]|\\.)*)'|`((?:[^`\\]|\\.)*)`")
WHO = re.compile(r"(?:who:\s*'|L\(')(mane|anulik|harut)'")
FILES = ['src/legacy/data.js', 'src/legacy/engines.js', 'src/legacy/engines2.js', 'src/legacy/engines3.js', 'src/legacy/places.js', 'src/legacy/advdata.js', 'src/legacy/g.js', 'src/legacy/phone.js', 'src/scenes/Family.tsx', 'src/scenes/City.tsx']
orig = set(json.load(open(root / 'src/core/phrases.json', encoding='utf8')).values())
MANUAL = {
  'h_hi_title': ('harut', 'Բարև՛ ձեզ, աղջիկնե՛ր։ Հարություն քեռին պատրաստ է արկածների։'),
  'a_hi_title': ('anulik', 'Բարև՛։ Ես Անուլիկն եմ։ Պատրաստ եմ նոր արկածների։'),
  's_city': ('mane', 'Քաղաք'), 's_fhub': ('mane', 'Ընտանեկան արկածներ'), 's_shub': ('mane', 'Քույրիկները միասին'),
  's_mnew': ('mane', 'Նոր խաղեր'), 's_tales': ('mane', 'Հարություն քեռու հեքիաթները'),
}
def keep(s):
    if '${' in s or '<' in s or not ARM.search(s): return False
    if s != s.strip() or s[:1] in '»«։,./(-՝' or s[-1:] in '«(': return False
    if s.upper() == s and ARM.search(s) and len(s) > 1 and not re.search('[ա-և]', s): return False  # ЗАГЛАВНЫЕ: ответы шифров, алфавит
    return len(ARM.findall(s)) >= 2
lines, who_of = {}, {}
for f in FILES:
    block_who = 'mane'; region = None
    for ln in (root / f).read_text(encoding='utf8').splitlines():
        # области данных с постоянным рассказчиком: сказки и загадки читает Харутюн, дела ведёт Анулик
        for mark, w in (('STORIES: [', 'harut'), ('Q_EASY: [', 'harut'), ('Q_HARD: [', 'harut'), ('CASES: [', 'anulik'), ('Q_COUNTRIES: [', None), ('Q_SPACE: [', None), ('CIPHERS: [', None)):
            if mark in ln: region = w
        if re.match(r'^  \],?\s*$', ln): region = None
        m = re.search(r"\{ id: '[a-z_0-9]+', who: '(mane|anulik|harut|any)'", ln)
        if m: block_who = 'mane' if m.group(1) == 'any' else m.group(1)
        if 'engines' in f or 'g.js' in f: block_who = 'mane'
        whos = [(w.start(), w.group(1)) for w in WHO.finditer(ln)]
        for sm in STR.finditer(ln):
            s = sm.group(1) if sm.group(1) is not None else sm.group(2)
            if not s or not keep(s) or s in orig: continue
            prev = [w for pos, w in whos if pos < sm.start()]
            who = prev[-1] if prev else (whos[0][1] if whos else (region or block_who))
            if s not in who_of: who_of[s] = who
for k, (w, t) in MANUAL.items(): who_of.pop(t, None)
out = {k: t for k, (w, t) in MANUAL.items()}
for s, w in who_of.items():
    key = {'harut': 'h_', 'anulik': 'a_'}.get(w, 'm_') + hashlib.md5(s.encode()).hexdigest()[:8]
    out[key] = s
json.dump(out, open(root / 'src/core/lines.json', 'w', encoding='utf8'), ensure_ascii=False, indent=0)
from collections import Counter
print(len(out), 'реплик', Counter(k[:2] for k in out), sum(len(t) for t in out.values()), 'символов')
