"""Генерация армянской озвучки (Piper, голос hy_AM-gor-medium) → public/voice/*.m4a
Запуск (macOS): python tools/make_voice.py <модель.onnx> [папка espeak-ng-data]
Свой голос: просто замените файл public/voice/<id>.m4a записью с тем же именем (тексты — в src/core/phrases.json)
"""
import json, re, subprocess, sys, tempfile, wave, pathlib
from piper import PiperVoice, SynthesisConfig
import piper.phonemize_espeak as pe

root = pathlib.Path(__file__).resolve().parent.parent
kw = {'espeak_data_dir': pathlib.Path(sys.argv[2])} if len(sys.argv) > 2 else {}
voice = PiperVoice.load(sys.argv[1], **kw)
phr = json.load(open(root / 'src/core/phrases.json', encoding='utf8'))
out = root / 'public/voice'; out.mkdir(parents=True, exist_ok=True)
PITCH = 1.27  # выше и мягче: речь замедляется при синтезе и ускоряется при записи
UNCLE = {'card_thanks'}

def clean(t):
    parts = re.findall(r'[^։]+', t)
    res = []
    for s in parts:
        s = s.strip()
        if not s: continue
        end = '?' if '՞' in s else '!' if ('՜' in s or '՛' in s) else '.'
        res.append(re.sub('[՛՞՜]', '', s) + end)
    return ' '.join(res)

only = set(sys.argv[3:])  # можно перезаписать только указанные фразы
for k, t in phr.items():
    if only and k not in only: continue
    p = 1.0 if k in UNCLE else PITCH
    cfg = SynthesisConfig(length_scale=1.12 * p, noise_scale=0.6, noise_w_scale=0.7)
    data, sr = b'', 22050
    for ch in voice.synthesize(clean(t), syn_config=cfg):
        data += ch.audio_int16_bytes + b'\0' * int(ch.sample_rate * 0.22) * 2; sr = ch.sample_rate
    with tempfile.NamedTemporaryFile(suffix='.wav') as f:
        w = wave.open(f.name, 'wb'); w.setnchannels(1); w.setsampwidth(2); w.setframerate(int(sr * p)); w.writeframes(data); w.close()
        subprocess.run(['afconvert', f.name, str(out / f'{k}.m4a'), '-f', 'm4af', '-d', 'aac@44100', '-b', '64000'], check=True)
print(len(phr), 'фраз')
