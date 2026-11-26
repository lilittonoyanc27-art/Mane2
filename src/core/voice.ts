import phrases from './phrases.json'
import lines from './lines.json'
import { ac, duck, voiceOut, tone } from './audio'
import { useUI } from './ui'
export type Phrase = keyof typeof phrases
// Оригинальные 192 фразы + новые реплики продолжения (тот же голос Piper hy_AM-gor-medium, см. tools/make_voice.py)
const ALL: Record<string, string> = { ...(lines as Record<string, string>), ...phrases }
export const text = (id: string) => ALL[id] ?? (id.startsWith('#') ? id.slice(1) : '')
// обратный поиск: текст → ключ записи
const norm = (t: string) => t.replace(/\s+/g, ' ').trim()
const BY_TEXT = new Map<string, string>()
for (const [k, t] of [...Object.entries(phrases), ...Object.entries(lines as Record<string, string>)]) if (!BY_TEXT.has(norm(t))) BY_TEXT.set(norm(t), k) // оригинальные записи — в приоритете
export const keyOf = (t: string) => BY_TEXT.get(norm(t)) ?? null

const cache = new Map<string, Promise<AudioBuffer | null>>()
function load(id: string) {
  let p = cache.get(id)
  if (!p) {
    p = fetch(`/voice/${id}.m4a`).then(r => { if (!r.ok) throw 0; return r.arrayBuffer() }).then(b => ac().decodeAudioData(b)).catch(() => { cache.delete(id); return null })
    cache.set(id, p)
  }
  return p
}
let token = 0, src: AudioBufferSourceNode | null = null, last: string[] = []
export function hush() { token++; try { src?.stop() } catch { /* уже остановлен */ } src = null; speechSynthesis?.cancel?.(); duck(false) }

function playOne(id: string, my: number): Promise<void> {
  // '#текст' — реплика без записи (например, составленная из частей): только облачко
  if (id.startsWith('#')) return new Promise(res => window.setTimeout(res, Math.min(4200, 900 + id.length * 45)))
  return load(id).then(buf => new Promise<void>(res => {
    if (my !== token) return res()
    if (buf) {
      const s = ac().createBufferSource(); s.buffer = buf; s.connect(voiceOut()); src = s
      s.onended = () => res(); s.start()
      window.setTimeout(res, buf.duration * 1000 + 400)
      return
    }
    // запасной вариант: системный голос, а если его нет — мелодия и визуальная подсказка
    const v = window.speechSynthesis?.getVoices().find(x => x.lang.toLowerCase().startsWith('hy'))
    if (v) {
      const u = new SpeechSynthesisUtterance(text(id)); u.voice = v; u.lang = v.lang; u.pitch = 1.25; u.rate = 0.9; u.onend = () => res(); u.onerror = () => res()
      speechSynthesis.speak(u)
    } else { [659, 784, 988].forEach((f, i) => tone(f, 0.25, 'sine', 0.2, i * 0.13)); window.setTimeout(res, 1600) }
  }))
}
/** Сказать одну или несколько фраз подряд. Новая реплика прерывает предыдущую. */
export async function say(...ids: string[]) {
  hush(); const my = token
  duck(true)
  for (const id of ids) {
    if (my !== token) return
    useUI.getState().setLine(id, text(id))
    await playOne(id, my)
  }
  if (my === token) { duck(false); window.setTimeout(() => { if (my === token) useUI.getState().setLine(null, '') }, 1800) }
}
/** Сказать готовым текстом: ищет запись этой реплики (оригинальную или новую). */
export function sayText(...ts: string[]) { return say(...ts.map(t => keyOf(t) ?? '#' + t)) }
const DYN = new Map<string, string>()
/** Реплика конкретного героя (для составленных на ходу фраз облачко покажет нужный значок) */
export function sayAs(who: 'mane' | 'anulik' | 'harut', ...ts: string[]) { return say(...ts.map(t => { const k = keyOf(t) ?? '#' + t; if (k.startsWith('#')) DYN.set(k, who); return k })) }
/** Задание: запоминается для кнопки «повторить». */
export function task(...ids: string[]) { last = [ids[ids.length - 1]]; useUI.getState().setTask(last[0]); return say(...ids) }
export function taskText(t: string) { return task(keyOf(t) ?? '#' + t) }
export function repeat() { if (last.length) void say(...last) }
const PRAISE: Phrase[] = ['bravo', 'wonderful', 'beautiful', 'great', 'clever', 'super']
let pi = 0
export const praise = () => PRAISE[pi++ % PRAISE.length]
/** Кто говорит (для значка в облачке): по префиксу ключа */
export const speakerOf = (id: string | null) => !id ? 'mane' : id.startsWith('#') ? (DYN.get(id) ?? 'mane') : id.startsWith('h_') || id === 'card_thanks' ? 'harut' : id.startsWith('a_') ? 'anulik' : 'mane'
