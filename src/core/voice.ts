import phrases from './phrases.json'
import { ac, duck, voiceOut, tone } from './audio'
import { useUI } from './ui'
export type Phrase = keyof typeof phrases
export const text = (id: Phrase) => phrases[id]

const cache = new Map<string, Promise<AudioBuffer | null>>()
function load(id: string) {
  let p = cache.get(id)
  if (!p) {
    p = fetch(`/voice/${id}.m4a`).then(r => { if (!r.ok) throw 0; return r.arrayBuffer() }).then(b => ac().decodeAudioData(b)).catch(() => { cache.delete(id); return null })
    cache.set(id, p)
  }
  return p
}
let token = 0, src: AudioBufferSourceNode | null = null, last: Phrase[] = []
export function hush() { token++; try { src?.stop() } catch { /* уже остановлен */ } src = null; speechSynthesis?.cancel?.(); duck(false) }

function playOne(id: Phrase, my: number): Promise<void> {
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
      const u = new SpeechSynthesisUtterance(phrases[id]); u.voice = v; u.lang = v.lang; u.pitch = 1.25; u.rate = 0.9; u.onend = () => res(); u.onerror = () => res()
      speechSynthesis.speak(u)
    } else { [659, 784, 988].forEach((f, i) => tone(f, 0.25, 'sine', 0.2, i * 0.13)); window.setTimeout(res, 1600) }
  }))
}
/** Сказать одну или несколько фраз подряд. Новая реплика прерывает предыдущую. */
export async function say(...ids: Phrase[]) {
  hush(); const my = token
  duck(true)
  for (const id of ids) {
    if (my !== token) return
    useUI.getState().setLine(id, phrases[id])
    await playOne(id, my)
  }
  if (my === token) { duck(false); window.setTimeout(() => { if (my === token) useUI.getState().setLine(null, '') }, 1800) }
}
/** Задание: запоминается для кнопки «повторить». */
export function task(...ids: Phrase[]) { last = [ids[ids.length - 1]]; useUI.getState().setTask(last[0]); return say(...ids) }
export function repeat() { if (last.length) void say(...last) }
const PRAISE: Phrase[] = ['bravo', 'wonderful', 'beautiful', 'great', 'clever', 'super']
let pi = 0
export const praise = () => PRAISE[pi++ % PRAISE.length]
