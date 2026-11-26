"""Озвучка новых реплик продолжения тем же голосом, что и оригинал (Piper, hy_AM-gor-medium, та же обработка, что в make_voice.py).
Голоса по префиксу ключа (src/core/lines.json): m_/s_ — Мане и рассказчик (тон ×1.27, как в оригинале),
h_ — дядя Харутюн (×1.0, как его реплика card_thanks в оригинале), a_ — Анулик, 15 лет (×1.12: взрослее Мане).
Запуск (macOS): python tools/make_voice_family.py <модель.onnx> <папка espeak-ng-data> [ключи...]
Уже готовые файлы пропускаются — можно запускать повторно. Свой голос: замените public/voice/<ключ>.m4a."""
import json, re, subprocess, sys, tempfile, wave, pathlib
from piper import PiperVoice, SynthesisConfig
root = pathlib.Path(__file__).resolve().parent.parent
voice = PiperVoice.load(sys.argv[1], espeak_data_dir=sys.argv[2])
phr = json.load(open(root / 'src/core/lines.json', encoding='utf8'))
out = root / 'public/voice'; out.mkdir(parents=True, exist_ok=True)
PITCH = {'h_': 1.0, 'a_': 1.12}
def clean(t):
    t = re.sub(r'[\U0001F000-\U0001FAFF☀-➿️‍]', '', t)
    res = []
    for s in re.findall(r'[^։]+', t):
        s = s.strip()
        if not s: continue
        end = '?' if '՞' in s else '!' if ('՜' in s or '՛' in s) else '.'
        res.append(re.sub('[՛՞՜]', '', s) + end)
    return ' '.join(res)
import os
shard = os.environ.get('SHARD')  # «i/N» — параллельный запуск на N процессах
only = set(sys.argv[3:]); n = 0
for idx, (k, t) in enumerate(phr.items()):
    if shard and idx % int(shard.split('/')[1]) != int(shard.split('/')[0]): continue
    if only and k not in only: continue
    dst = out / f'{k}.m4a'
    if dst.exists() and not only: continue
    p = PITCH.get(k[:2], 1.27)
    cfg = SynthesisConfig(length_scale=1.12 * p, noise_scale=0.6, noise_w_scale=0.7)
    data, sr = b'', 22050
    for ch in voice.synthesize(clean(t), syn_config=cfg):
        data += ch.audio_int16_bytes + b'\0' * int(ch.sample_rate * 0.22) * 2; sr = ch.sample_rate
    if not data: continue
    with tempfile.NamedTemporaryFile(suffix='.wav') as f:
        w = wave.open(f.name, 'wb'); w.setnchannels(1); w.setsampwidth(2); w.setframerate(int(sr * p)); w.writeframes(data); w.close()
        subprocess.run(['afconvert', f.name, str(dst), '-f', 'm4af', '-d', 'aac@44100', '-b', '64000'], check=True)
    n += 1
    if n % 50 == 0: print(n, 'готово', flush=True)
print('новых записей:', n)
