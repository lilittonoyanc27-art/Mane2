// Весь звук игры синтезируется через WebAudio — никаких внешних файлов, кроме голоса.
let ctx: AudioContext | null = null
let musicG: GainNode, sfxG: GainNode, voiceG: GainNode, duckG: GainNode
let vol = { music: 0.5, sfx: 0.8, voice: 1 }

export function ac(): AudioContext {
  if (!ctx) {
    const Ctor = window.AudioContext || (window as any).webkitAudioContext
    ctx = new Ctor()
    const comp = ctx.createDynamicsCompressor()
    comp.connect(ctx.destination)
    musicG = ctx.createGain(); duckG = ctx.createGain(); sfxG = ctx.createGain(); voiceG = ctx.createGain()
    musicG.connect(duckG); duckG.connect(comp); sfxG.connect(comp); voiceG.connect(comp)
    setVolumes(vol)
  }
  return ctx
}
export function unlockAudio() { const c = ac(); if (c.state !== 'running') void c.resume() }
export function setVolumes(v: typeof vol) {
  vol = v
  if (!ctx) return
  musicG.gain.value = v.music * 0.55; sfxG.gain.value = v.sfx * 0.8; voiceG.gain.value = v.voice * 1.25
}
export function voiceOut() { ac(); return voiceG }
export function duck(on: boolean) { const c = ac(); duckG.gain.cancelScheduledValues(c.currentTime); duckG.gain.setTargetAtTime(on ? 0.3 : 1, c.currentTime, 0.15) }

type Wave = OscillatorType
export function tone(f: number, dur = 0.2, type: Wave = 'sine', v = 0.3, delay = 0, to?: number, out?: AudioNode) {
  const c = ac(), t = c.currentTime + delay
  const o = c.createOscillator(), g = c.createGain()
  o.type = type; o.frequency.setValueAtTime(f, t)
  if (to) o.frequency.exponentialRampToValueAtTime(Math.max(20, to), t + dur)
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v, t + 0.012); g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  o.connect(g); g.connect(out || sfxG); o.start(t); o.stop(t + dur + 0.03)
}
let nbuf: AudioBuffer | null = null
export function noise(dur = 0.2, freq = 2000, v = 0.3, delay = 0, q = 1, type: BiquadFilterType = 'bandpass', to?: number) {
  const c = ac(), t = c.currentTime + delay
  if (!nbuf) { nbuf = c.createBuffer(1, c.sampleRate * 2, c.sampleRate); const d = nbuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1 }
  const s = c.createBufferSource(); s.buffer = nbuf; s.loop = true
  const f = c.createBiquadFilter(); f.type = type; f.frequency.setValueAtTime(freq, t); f.Q.value = q
  if (to) f.frequency.exponentialRampToValueAtTime(to, t + dur)
  const g = c.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  s.connect(f); f.connect(g); g.connect(sfxG); s.start(t, Math.random()); s.stop(t + dur + 0.03)
}
// «голос» зверька: пила через формантный фильтр
function vox(points: [number, number][], formant: number, formTo: number, v = 0.3, type: Wave = 'sawtooth', delay = 0, trem = 0) {
  const c = ac(), t = c.currentTime + delay, dur = points[points.length - 1][0]
  const o = c.createOscillator(); o.type = type
  o.frequency.setValueAtTime(points[0][1], t)
  for (const [pt, pf] of points.slice(1)) o.frequency.linearRampToValueAtTime(pf, t + pt)
  const f = c.createBiquadFilter(); f.type = 'bandpass'; f.Q.value = 2.2; f.frequency.setValueAtTime(formant, t); f.frequency.linearRampToValueAtTime(formTo, t + dur)
  const g = c.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(v, t + dur * 0.2); g.gain.setValueAtTime(v, t + dur * 0.6); g.gain.linearRampToValueAtTime(0.0001, t + dur)
  if (trem) { const l = c.createOscillator(), lg = c.createGain(); l.frequency.value = trem; lg.gain.value = v * 0.5; l.connect(lg); lg.connect(g.gain); l.start(t); l.stop(t + dur) }
  o.connect(f); f.connect(g); g.connect(sfxG); o.start(t); o.stop(t + dur + 0.02)
}

export const ANIMAL_SOUND: Record<string, () => void> = {
  cat: () => vox([[0, 420], [0.18, 760], [0.6, 430]], 900, 1500, 0.8),
  purr: () => { for (let i = 0; i < 14; i++) noise(0.05, 180, 0.5, i * 0.06, 2) },
  dog: () => { vox([[0, 320], [0.06, 460], [0.16, 190]], 700, 500, 1); vox([[0, 340], [0.06, 480], [0.18, 190]], 700, 500, 1, 'sawtooth', 0.28) },
  rabbit: () => { for (let i = 0; i < 3; i++) tone(1300, 0.07, 'sine', 0.25, i * 0.1, 1900) },
  turtle: () => { tone(260, 0.25, 'triangle', 0.35, 0, 330); tone(300, 0.3, 'triangle', 0.35, 0.28, 220) },
  parrot: () => { vox([[0, 900], [0.1, 1700], [0.2, 1000]], 1800, 2300, 0.8); vox([[0, 1100], [0.1, 1900], [0.22, 900]], 1900, 2200, 0.8, 'sawtooth', 0.25) },
  cow: () => vox([[0, 150], [0.4, 190], [1.2, 130]], 450, 700, 1),
  sheep: () => vox([[0, 360], [0.8, 330]], 900, 1000, 0.8, 'sawtooth', 0, 14),
  duck: () => { for (let i = 0; i < 3; i++) vox([[0, 330], [0.05, 360], [0.16, 260]], 1300, 1000, 0.8, 'sawtooth', i * 0.22) },
  chick: () => { for (let i = 0; i < 4; i++) tone(2200, 0.08, 'sine', 0.25, i * 0.14, 3000) },
  hen: () => { for (let i = 0; i < 3; i++) vox([[0, 500], [0.06, 560], [0.1, 420]], 1200, 1000, 0.7, 'sawtooth', i * 0.14); vox([[0, 500], [0.12, 850], [0.3, 560]], 1400, 1200, 0.7, 'sawtooth', 0.45) },
  pig: () => { for (let i = 0; i < 2; i++) { noise(0.22, 380, 0.7, i * 0.32, 4); vox([[0, 170], [0.2, 140]], 400, 500, 0.5, 'sawtooth', i * 0.32) } },
  frog: () => { for (let i = 0; i < 2; i++) vox([[0, 170], [0.3, 240]], 700, 1100, 0.8, 'square', i * 0.4, 28) },
  bear: () => vox([[0, 110], [0.3, 130], [0.7, 90]], 350, 420, 1),
  fish: () => { for (let i = 0; i < 4; i++) tone(500 + i * 80, 0.09, 'sine', 0.3, i * 0.11, 1100) },
  bird: () => { tone(1800, 0.12, 'sine', 0.25, 0, 2600); tone(2400, 0.12, 'sine', 0.25, 0.16, 1700); tone(2000, 0.2, 'sine', 0.25, 0.32, 2900) },
  bee: () => vox([[0, 210], [0.5, 250], [1, 200]], 800, 1000, 0.5, 'sawtooth', 0, 30),
  horse: () => vox([[0, 500], [0.2, 1000], [1, 400]], 1200, 800, 0.8, 'sawtooth', 0, 12),
  alien: () => { for (let i = 0; i < 5; i++) tone(400 + Math.random() * 900, 0.13, 'triangle', 0.3, i * 0.12, 400 + Math.random() * 900) },
}
export const animal = (k: string) => (ANIMAL_SOUND[k] || ANIMAL_SOUND.chick)()

const arp = (fs: number[], step: number, d: number, type: Wave = 'sine', v = 0.25) => fs.forEach((f, i) => tone(f, d, type, v, i * step))
export const SFX = {
  tap: () => tone(620, 0.09, 'sine', 0.25, 0, 900),
  pop: () => { tone(500, 0.08, 'triangle', 0.5, 0, 1500); noise(0.06, 2500, 0.4) },
  star: () => arp([880, 1175, 1760], 0.07, 0.35),
  win: () => { arp([523, 659, 784, 1047, 1319], 0.11, 0.5, 'triangle', 0.28); arp([1047, 1568, 2093], 0.12, 0.5, 'sine', 0.12) },
  soft: () => arp([440, 392], 0.14, 0.3, 'sine', 0.22),
  splash: () => noise(0.6, 900, 0.5, 0, 0.8, 'bandpass', 3000),
  water: () => { noise(0.9, 1400, 0.25, 0, 0.7); for (let i = 0; i < 6; i++) tone(500 + Math.random() * 600, 0.08, 'sine', 0.12, i * 0.13, 1400) },
  boing: () => tone(160, 0.45, 'triangle', 0.5, 0, 620),
  chop: () => { noise(0.06, 1200, 0.6); tone(220, 0.07, 'square', 0.15) },
  crunch: () => { for (let i = 0; i < 3; i++) noise(0.07, 1800, 0.5, i * 0.13) },
  bubble: () => tone(350 + Math.random() * 250, 0.14, 'sine', 0.3, 0, 1300),
  whoosh: () => noise(0.4, 500, 0.5, 0, 1, 'bandpass', 2600),
  magic: () => { for (let i = 0; i < 9; i++) tone(700 + i * 190, 0.28, 'sine', 0.1, i * 0.05) },
  coin: () => arp([988, 1319], 0.08, 0.35, 'square', 0.1),
  applause: () => { for (let i = 0; i < 60; i++) noise(0.04, 1200 + Math.random() * 1800, 0.22, Math.random() * 2.2) },
  giggle: () => { for (let i = 0; i < 6; i++) vox([[0, 520 + (i % 2) * 90], [0.09, 640 - i * 20]], 1200, 1500, 0.5, 'sawtooth', i * 0.12) },
  snore: () => { noise(0.9, 220, 0.4, 0, 3); tone(330, 0.5, 'sine', 0.1, 1, 250) },
  door: () => { noise(0.2, 300, 0.4); tone(300, 0.3, 'triangle', 0.2, 0.05, 500) },
  ding: () => tone(1568, 0.9, 'sine', 0.3),
  horn: () => { tone(392, 0.16, 'square', 0.13); tone(523, 0.25, 'square', 0.13, 0.18) },
  stir: () => noise(0.25, 700, 0.25, 0, 2, 'bandpass', 1200),
  jump: () => tone(300, 0.25, 'sine', 0.3, 0, 780),
  blow: () => noise(0.7, 800, 0.5, 0, 0.6, 'bandpass', 300),
  rocket: () => noise(1.4, 250, 0.6, 0, 0.7, 'lowpass', 900),
  squeak: () => tone(900, 0.12, 'triangle', 0.3, 0, 1500),
  fart: () => vox([[0, 130], [0.3, 90], [0.5, 110]], 300, 260, 0.9, 'sawtooth', 0, 22), // смешная кнопка-«утка»
  paper: () => { for (let i = 0; i < 4; i++) noise(0.08, 3500, 0.25, i * 0.09) },
}
export type SfxId = keyof typeof SFX
export const sfx = (k: SfxId) => SFX[k]()

// инструменты
export const midi = (n: number) => 440 * Math.pow(2, (n - 69) / 12)
export function piano(n: number) { const f = midi(n); tone(f, 1.1, 'triangle', 0.4); tone(f * 2, 0.6, 'sine', 0.14); tone(f * 3, 0.3, 'sine', 0.05) }
export function xylo(n: number) { const f = midi(n); tone(f, 0.6, 'sine', 0.42); tone(f * 4, 0.16, 'sine', 0.14) }
export function drum(i: number) {
  if (i === 0) tone(130, 0.35, 'sine', 0.9, 0, 45)
  else if (i === 1) { noise(0.18, 1800, 0.55, 0, 0.6); tone(220, 0.1, 'triangle', 0.3) }
  else if (i === 2) tone(220, 0.35, 'sine', 0.7, 0, 110)
  else noise(0.5, 7500, 0.35, 0, 0.5, 'highpass')
}

// ---------- фоновая музыка: генеративная шкатулка ----------
export type Mood = 'menu' | 'happy' | 'calm' | 'space' | 'sea' | 'party' | 'none'
const MOODS: Record<Exclude<Mood, 'none'>, { bpm: number; chords: number[][]; mel: number[]; bass: Wave; lead: Wave }> = {
  menu: { bpm: 92, chords: [[60, 64, 67], [57, 60, 64], [65, 69, 72], [67, 71, 74]], mel: [76, 79, 84, 79, 72, 76, 79, 74], bass: 'sine', lead: 'sine' },
  happy: { bpm: 116, chords: [[60, 64, 67], [65, 69, 72], [67, 71, 74], [60, 64, 67]], mel: [72, 76, 79, 76, 77, 79, 81, 79], bass: 'triangle', lead: 'triangle' },
  calm: { bpm: 72, chords: [[60, 64, 67], [62, 65, 69], [57, 60, 64], [65, 69, 72]], mel: [72, 74, 76, 79, 76, 74, 72, 69], bass: 'sine', lead: 'sine' },
  space: { bpm: 66, chords: [[57, 64, 69], [60, 67, 72], [53, 60, 69], [55, 62, 71]], mel: [81, 84, 88, 86, 84, 79, 81, 76], bass: 'sine', lead: 'sine' },
  sea: { bpm: 70, chords: [[62, 66, 69], [59, 62, 66], [67, 71, 74], [57, 61, 64]], mel: [74, 78, 81, 78, 83, 81, 78, 76], bass: 'sine', lead: 'sine' },
  party: { bpm: 128, chords: [[60, 64, 67], [67, 71, 74], [57, 60, 64], [65, 69, 72]], mel: [79, 79, 76, 79, 84, 83, 81, 79], bass: 'triangle', lead: 'triangle' },
}
let mood: Mood = 'none', timer = 0, step = 0, nextT = 0
export function music(m: Mood) {
  if (m === mood) return
  mood = m; step = 0
  if (ctx) nextT = ctx.currentTime + 0.2
  if (!timer) timer = window.setInterval(sched, 120)
}
function sched() {
  if (!ctx || mood === 'none' || ctx.state !== 'running' || document.hidden) return
  const m = MOODS[mood], d = 60 / m.bpm / 2
  if (nextT < ctx.currentTime) nextT = ctx.currentTime + 0.05
  while (nextT < ctx.currentTime + 0.35) {
    const bar = Math.floor(step / 8) % 4, ch = m.chords[bar], b = step % 8, del = nextT - ctx.currentTime
    tone(midi(ch[b % 3] + 12), d * 2.2, 'sine', 0.07, del, undefined, musicG)
    if (b === 0) tone(midi(ch[0] - 12), d * 6, m.bass, 0.16, del, undefined, musicG)
    if (b === 4) tone(midi(ch[2] - 12), d * 4, m.bass, 0.1, del, undefined, musicG)
    if (b % 2 === 0 && (Math.floor(step / 32) % 3 !== 2 || b === 0)) tone(midi(m.mel[(step / 2 + bar * 3) % 8]), d * 3, m.lead, 0.09, del, undefined, musicG)
    step++; nextT += d
  }
}
