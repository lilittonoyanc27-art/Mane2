import { useEffect, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Stage, Tap, S, B, C, T, Star3, Float, burst, shower, useLater, useOnce, pick, shuffle, type Cam, type V3 } from '../kit/base'
import { Clouds, Meadow, RAINBOW, Rainbow, Island } from '../kit/nature'
import { Person, type Mood } from '../kit/people'
import { Animal, type AKind } from '../kit/animals'
import { say, task } from '../core/voice'
import { sfx, piano, xylo, drum, animal, music, SFX, type SfxId } from '../core/audio'
import { win, useSave } from '../core/store'
import { Tray, Back, Big } from '../ui/HUD'

type Mode = 'piano' | 'xylo' | 'drums' | 'buttons' | 'mel' | 'rhythm' | 'guess' | 'dance' | 'create'
const WHITE = [60, 62, 64, 65, 67, 69, 71, 72, 74, 76], BLACK: [number, number][] = [[61, 0.5], [63, 1.5], [66, 3.5], [68, 4.5], [70, 5.5], [73, 7.5], [75, 8.5]]
function Key({ p, a, c, on, lit, rad = 0.08 }: { p: V3; a: V3; c: string; on: () => void; lit?: boolean; rad?: number }) {
  const g = useRef<THREE.Group>(null!), d0 = useRef(0)
  useFrame((_, d) => { d0.current = Math.max(0, d0.current - d * 4); const t = Math.max(d0.current, lit ? 1 : 0); g.current.position.y += (p[1] - t * 0.13 - g.current.position.y) * Math.min(1, d * 20) })
  return <group ref={g} position={p} onPointerDown={e => { e.stopPropagation(); d0.current = 1; burst(e.point, 'star', 5, 0.6); on() }} onPointerEnter={e => { if (e.nativeEvent.buttons) { d0.current = 1; on() } }}><B a={a} c={c} rad={rad} o={lit ? { em: 0.8 } : undefined} /></group>
}
const Piano = ({ on, lit }: { on: (n: number) => void; lit?: number }) => <group position={[0, 0.4, 0.6]}><B a={[10, 0.8, 2.6]} p={[0, -0.25, -0.2]} c="#a78bfa" rad={0.2} /><B a={[10, 1.4, 0.5]} p={[0, 0.5, -1.4]} c="#8f6bff" rad={0.2} /><Star3 p={[0, 0.6, -1.1]} s={0.35} c="#ffd257" />{WHITE.map((n, i) => <Key key={n} p={[-4.3 + i * 0.955, 0.3, 0.1]} a={[0.9, 0.3, 2]} c={lit === n ? RAINBOW[i % 7] : '#fffdf8'} lit={lit === n} on={() => on(n)} />)}{BLACK.map(([n, x]) => <Key key={n} p={[-4.3 + x * 0.955, 0.55, -0.3]} a={[0.5, 0.3, 1.1]} c="#5b4a7c" lit={lit === n} on={() => on(n)} />)}{WHITE.map((n, i) => <S key={n} p={[-4.3 + i * 0.955, 0.46, 0.75]} s={[0.15, 0.04, 0.15]} c={RAINBOW[i % 7]} ns />)}</group>
const XN = [72, 74, 76, 77, 79, 81, 83, 84]
const Xylo = ({ on, lit }: { on: (i: number) => void; lit?: number }) => <group position={[0, 0.4, 0.6]}><B a={[8.6, 0.2, 0.3]} p={[0, 0, -0.6]} c="#c99a6b" /><B a={[8.6, 0.2, 0.3]} p={[0, 0, 0.6]} c="#c99a6b" />{XN.map((_, i) => <Key key={i} p={[-3.64 + i * 1.04, 0.2, 0]} a={[0.9, 0.24, 2.9 - i * 0.2]} c={RAINBOW[i % 7]} lit={lit === i} on={() => on(i)} rad={0.12} />)}</group>
const DR: { p: V3; r: number; h: number; c: string }[] = [{ p: [0, 0.7, -0.3], r: 1.1, h: 1.4, c: '#ff8fc5' }, { p: [-2.2, 0.55, 0.9], r: 0.85, h: 0.8, c: '#7fc4ff' }, { p: [2.2, 0.55, 0.9], r: 0.85, h: 0.8, c: '#ffd257' }, { p: [-2.6, 2, -0.8], r: 0.95, h: 0.1, c: '#ffe27a' }, { p: [2.6, 2, -0.8], r: 0.95, h: 0.1, c: '#ffe27a' }]
const Drums = ({ on, lit }: { on: (i: number) => void; lit?: number }) => <>{DR.map((q, i) => <Tap key={i} p={q.p} on={() => on(i)} snd={null} hit={q.r}><C a={[q.r, q.r, q.h]} c={q.c} o={i > 2 ? { metal: 0.5, rough: 0.25 } : lit === i ? { em: 0.9 } : undefined} />{i < 3 && <C a={[q.r * 0.94, q.r * 0.94, 0.06]} p={[0, q.h / 2 + 0.02, 0]} c={lit === i ? '#fff3a0' : '#fff8f0'} />}{i > 2 && <C a={[0.05, 0.05, 2]} p={[0, -1, 0]} c="#b9c4d6" />}</Tap>)}</>
const BTNS: [string, SfxId | string][] = [['#ff5a8f', 'giggle'], ['#7fc4ff', 'bubble'], ['#ffd257', 'ding'], ['#8fe3b0', '@duck'], ['#b79bff', 'boing'], ['#ff9a6a', '@cow'], ['#ff8fc5', 'magic'], ['#6fd8d0', '@cat'], ['#a78bfa', 'horn'], ['#ffb9dc', 'applause'], ['#9fdc7a', '@frog'], ['#ffe27a', 'whoosh']]
const GA: AKind[] = ['cow', 'cat', 'dog', 'duck', 'sheep', 'pig', 'frog', 'hen', 'bird', 'horse']

export function Music() {
  const [mode, setMode] = useState<Mode>('piano'), later = useLater(), [lit, setLit] = useState(-1), [mood, setMood] = useState<Mood>('idle'), seq = useRef<number[]>([]), at = useRef(0), locked = useRef(false), [q, setQ] = useState<{ o: AKind[]; a: AKind } | null>(null), [move, setMove] = useState<Mood>('dance'), rec = useRef<[number, number][]>([]), t0 = useRef(0), [recN, setRecN] = useState(0), melody = useSave(s => s.melody), set = useSave(s => s.set), outfit = useSave(s => s.outfit), cnt = useRef(0), run = useRef(0), [hint, setHint] = useState(false)
  useOnce(() => void task('mu_intro'))
  useEffect(() => () => { run.current = -1 }, [])
  const cheer = (m: Mood = 'happy', ms = 1500) => { setMood(m); later(() => setMood('idle'), ms) }
  const playSeq = (s: number[], d: number, gap = 620) => { locked.current = true; at.current = 0; const my = ++run.current; s.forEach((n, i) => { later(() => { if (my !== run.current) return; setLit(n); mode2.current === 'rhythm' ? drum(n) : xylo(XN[n]) }, d + i * gap); later(() => { if (my === run.current) setLit(-1) }, d + i * gap + gap * 0.6) }); later(() => { if (my === run.current) { locked.current = false } }, d + s.length * gap) }
  const mode2 = useRef<Mode>('piano')
  const newSeq = (n: number, first = false) => { seq.current = Array.from({ length: n }, () => mode2.current === 'rhythm' ? pick([0, 0, 1, 2]) : Math.floor(Math.random() * 8)); playSeq(seq.current, first ? 2600 : 1300) }
  const ask = (first: boolean) => { const o = shuffle(GA).slice(0, 3), a = pick(o); setQ({ o, a }); setHint(false); later(() => animal(a), first ? 2600 : 900); locked.current = false }
  const go = (m: Mode) => {
    run.current++; setMode(m); mode2.current = m; setLit(-1); locked.current = false; setMood('idle'); music(m === 'dance' ? 'party' : 'none')
    void task(({ piano: 'mu_intro', xylo: 'mu_intro', drums: 'mu_intro', buttons: 'mu_intro', mel: 'mu_listen', rhythm: 'mu_rhythm', guess: 'mu_guess', dance: 'mu_dance', create: 'mu_create' } as const)[m])
    if (m === 'mel') newSeq(2, true); if (m === 'rhythm') newSeq(3, true); if (m === 'guess') ask(true); if (m === 'dance') { setMove('dance') } if (m === 'create') { rec.current = []; setRecN(0) }
  }
  const check = (i: number) => {
    if (locked.current) return
    if (i === seq.current[at.current]) { at.current++; burst([0, 2.5, 1], 'star', 5); if (at.current >= seq.current.length) { locked.current = true; cheer('dance', 2200); const n = seq.current.length; win('music-' + mode2.current, 1); later(() => newSeq(n >= 5 ? 3 : n + 1), 2300) } }
    else { sfx('soft'); void say('retry'); playSeq(seq.current, 1800) }
  }
  const hitP = (n: number) => { piano(n); setLit(n); later(() => setLit(-1), 180); if (++cnt.current % 8 === 0) cheer('dance'); if (mode2.current === 'create') { if (!rec.current.length) t0.current = performance.now(); if (rec.current.length < 60) { rec.current.push([n, performance.now() - t0.current]); setRecN(rec.current.length) } } }
  const playBack = () => { const m: [number, number][] = rec.current.length ? rec.current : Array.from({ length: melody.length / 2 }, (_, i) => [melody[i * 2], melody[i * 2 + 1]]); if (!m.length) return; if (rec.current.length) set({ melody: rec.current.flat() }); void say('mu_play'); setMood('dance'); const my = ++run.current; m.forEach(([n, t]) => later(() => { if (my === run.current) { piano(n); setLit(n); later(() => setLit(-1), 200); burst([(Math.random() - 0.5) * 8, 2, 0], 'heart', 4) } }, 1900 + t)); later(() => { if (my === run.current) { setMood('idle'); win('music-create', 2); rec.current = []; setRecN(0) } }, 2600 + m[m.length - 1][1]) }
  const pick2 = (a: AKind, x: number) => { if (!q || locked.current) return; animal(a); if (a === q.a) { locked.current = true; burst([x, 2.4, 0.6], 'heart', 24); win('music-guess', 1); later(() => ask(false), 2600) } else { setHint(true); void say('retry'); later(() => q && animal(q.a), 1500) } }
  const cam: Cam = { t: [0, 1.7, 0], dir: [0, mode === 'dance' || mode === 'guess' ? 0.15 : 0.4, 1], w: mode === 'piano' || mode === 'create' ? 10.4 : 9, h: 5, tray: true }
  return <>
    <Stage cam={cam} sky={mode === 'dance' ? ['#6a5fc8', '#ffb9e6'] : ['#b5c9ff', '#ffe3f3']} fog={[20, 60]}>
      <Island r={20} c="#d9c9ff" /><Meadow n={120} rad={14} hole={6} c="#b79bff" /><Clouds /><Rainbow p={[0, 0, -8]} s={2.3} /><C a={[6.2, 6.5, 0.2]} p={[0, -0.02, 0]} c="#fff0fa" ns />
      {Array.from({ length: 6 }, (_, i) => <Float key={i} p={[-6 + i * 2.4, 4 + (i % 2), -4]}><S s={0.28} c={RAINBOW[i]} /><C a={[0.05, 0.05, 0.9]} p={[0.24, 0.45, 0]} c={RAINBOW[i]} /></Float>)}
      {(mode === 'piano' || mode === 'create') && <Piano on={hitP} lit={lit} />}
      {(mode === 'xylo' || mode === 'mel') && <Xylo lit={lit} on={i => { if (locked.current) return; xylo(XN[i]); if (mode === 'mel') check(i); else if (++cnt.current % 8 === 0) cheer('dance') }} />}
      {(mode === 'drums' || mode === 'rhythm') && <Drums lit={lit} on={i => { if (locked.current) return; drum(i > 2 ? 3 : i); if (mode === 'rhythm') { if (i < 3) check(i) } else if (++cnt.current % 8 === 0) cheer('dance') }} />}
      {mode === 'buttons' && BTNS.map(([c, k], i) => <Tap key={i} p={[-3 + (i % 4) * 2, 0.25, -1 + Math.floor(i / 4) * 1.4]} snd={null} hit={0.75} on={() => { k.startsWith('@') ? animal(k.slice(1)) : SFX[k as SfxId](); if (++cnt.current % 6 === 0) cheer() }}><C a={[0.72, 0.8, 0.35]} c={c} o={{ rough: 0.2 }} /><T a={[0.72, 0.08]} r={[Math.PI / 2, 0, 0]} p={[0, 0.17, 0]} c="#fff" /></Tap>)}
      {mode === 'guess' && q && q.o.map((a, i) => <group key={a + i} position={[(i - 1) * 2.8, 0, 0]}><C a={[1, 1.1, 0.5]} p={[0, 0.25, 0]} c={RAINBOW[i * 2]} /><Tap p={[0, 0.5, 0]} hit={1.1} hitP={[0, 0.8, 0]} snd={null} glow={hint && a === q.a} on={() => pick2(a, (i - 1) * 2.8)}><Animal k={a} s={1.25} /></Tap></group>)}
      {mode === 'dance' ? <><Person p={[0, 0, 0.6]} s={1.4} mood={move} outfit={outfit} />{(['cat', 'rabbit', 'bear', 'duck'] as const).map((k, i) => <Animal key={k} k={k} p={[[-3.6, -1.9, 1.9, 3.6][i], 0, i % 3 ? 0.3 : -0.8]} s={1} mood={move === 'spin' || move === 'dance' ? 'dance' : 'happy'} />)}</> : <><Person p={[mode === 'guess' ? -4.6 : -3, mode === 'guess' ? 0 : 0.9, mode === 'guess' ? 0 : -2]} s={1.1} mood={mood} outfit={outfit} /><Animal k="rabbit" p={[mode === 'guess' ? 4.6 : 3, mode === 'guess' ? 0 : 0.9, mode === 'guess' ? 0 : -2]} s={0.9} mood={mood === 'idle' ? 'idle' : 'dance'} /></>}
    </Stage>
    {mode === 'dance' && <div className="acts hi">{([['dance', '💃'], ['jump', '🦘'], ['spin', '🌀'], ['wave', '👋'], ['happy', '🙌']] as [Mood, string][]).map(([m, e]) => <Big key={m} c={move === m ? '#ffd257' : '#ff9ed2'} label={m} on={() => { setMove(m); sfx('boing'); shower([0, 5, 0], 3, 'star', 14); if (++cnt.current % 5 === 0) win('music-dance', 1) }}>{e}</Big>)}</div>}
    {mode === 'create' && <div className="acts hi"><Big c="#8fe3b0" label="Նվագել" on={playBack}>{'▶︎'}</Big>{recN > 0 && <Big label="Նորից" on={() => { rec.current = []; setRecN(0) }}>🗑️</Big>}</div>}
    {mode === 'guess' && q && <div className="acts hi"><Big c="#ffd257" label="Լսել" on={() => animal(q.a)}>👂</Big></div>}
    <Tray small value={mode} items={[['piano', '🎹'], ['xylo', '🌈'], ['drums', '🥁'], ['buttons', '🔘'], ['mel', '🎼'], ['rhythm', '👏'], ['guess', '🐮'], ['dance', '💃'], ['create', '🎤']].map(([id, icon]) => ({ id, icon }))} on={m => go(m as Mode)} />
  </>
}
void Back
