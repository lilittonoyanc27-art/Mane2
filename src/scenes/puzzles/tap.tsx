import { useEffect, useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { B, C, S, T, Tap, Float, Glide, Orbit, Disc, burst, shuffle, pick, Star3, type V3, rnd } from '../../kit/base'
import { RAINBOW, Tree, Mushroom, Flower, Butterfly, House, Pine } from '../../kit/nature'
import { Item } from '../../kit/items'
import { Animal } from '../../kit/animals'
import { Person } from '../../kit/people'
import { PStage, usePz, type GP } from './common'
import { say, task, text, type Phrase } from '../../core/voice'
import { sfx, animal, xylo } from '../../core/audio'
import { useSave } from '../../core/store'
import { Tray } from '../../ui/HUD'

const COL = (n: number, i: number, g: number) => (i - (n - 1) / 2) * g
// ---------- пары ----------
function Card({ p, open, on, k }: { p: V3; open: boolean; on: () => void; k: string }) {
  const g = useRef<THREE.Group>(null!)
  useFrame((_, d) => { g.current.rotation.y += ((open ? Math.PI : 0) - g.current.rotation.y) * Math.min(1, d * 8) })
  return <Tap p={p} on={open ? undefined : on} hit={0.8}><group ref={g}><B a={[1.4, 1.6, 0.16]} c="#ff9ecb" rad={0.1} /><Star3 p={[0, 0, 0.12]} s={0.35} c="#ffe27a" /><group rotation={[0, Math.PI, 0]} position={[0, 0, -0.1]}><B a={[1.25, 1.45, 0.06]} c="#fffaf2" rad={0.03} /><Item k={k} p={[0, -0.45, 0.35]} s={0.9} /></group></group></Tap>
}
export function Pairs({ again }: GP) {
  const z = usePz('pairs', again), deck = useMemo(() => { const s = shuffle(['apple', 'cat', 'star', 'car', 'cupcake', 'heart', 'duck', 'balloon', 'flower']).slice(0, 3); return shuffle([...s, ...s]) }, []), [open, setOpen] = useState<number[]>([]), [ok, setOk] = useState<number[]>([]), lock = useRef(false)
  const on = (i: number) => {
    if (lock.current || open.includes(i) || ok.includes(i)) return
    const n = [...open, i]; setOpen(n); if (n.length < 2) return
    lock.current = true
    if (deck[n[0]] === deck[n[1]]) z.later(() => { const o = [...ok, ...n]; setOk(o); setOpen([]); lock.current = false; z.good(); burst([0, 2.4, 1], 'heart', 24); if (o.length === 6) z.win() }, 600)
    else z.later(() => { setOpen([]); lock.current = false; sfx('whoosh') }, 1500)
  }
  return <PStage cam={{ t: [0, 2.3, 0], dir: [0, 0.06, 1], w: 5.6, h: 4.8 }}>{deck.map((k, i) => <Card key={i} k={k} p={[COL(3, i % 3, 1.7), 3.2 - Math.floor(i / 3) * 1.9, 0]} open={open.includes(i) || ok.includes(i)} on={() => on(i)} />)}</PStage>
}
// ---------- лишний ----------
const GROUPS = [['apple', 'banana', 'orange', 'strawberry', 'pear'], ['cat', 'dog', 'rabbit', 'cow', 'bear'], ['car', 'ball', 'cube', 'drum', 'rocket'], ['cake', 'cupcake', 'icecream', 'cookie']]
export function Odd({ again }: GP) {
  const z = usePz('odd', again), [r, setR] = useState(0), [gone, setGone] = useState(false), [hint, setHint] = useState(false)
  const q = useMemo(() => { const [a, b] = shuffle([0, 1, 2, 3]), o = pick(GROUPS[b]); return { o, l: shuffle([...shuffle(GROUPS[a]).slice(0, 3), o]) } }, [r])
  return <PStage cam={{ t: [0, 1.6, 0], dir: [0, 0.2, 1], w: 8.6, h: 4.6 }}>{q.l.map((k, i) => <group key={r + k} position={[COL(4, i, 2.1), 0, 0]}><C a={[0.85, 0.95, 0.7]} p={[0, 0.35, 0]} c={RAINBOW[i + 2]} /><Tap p={[0, 0.7, 0]} s={1.2} hit={0.8} hitP={[0, 0.5, 0]} glow={hint && k === q.o} bob={gone && k === q.o ? 0.5 : 0} spin={gone && k === q.o ? 5 : 0} on={() => { if (gone) return; if (k === q.o) { setGone(true); setHint(false); z.good(); burst([COL(4, i, 2.1), 2, 0.5], 'star', 26); z.later(() => { if (r === 2) z.win(); else { setR(r + 1); setGone(false); void task('pz_odd') } }, 1500) } else { z.bad(); setHint(true) } }}><Item k={k} /></Tap></group>)}</PStage>
}
// ---------- спрятанный котёнок ----------
const HIDE: { p: V3; el: () => React.ReactNode; off: V3 }[] = [{ p: [-4, 0, -0.6], el: () => <Tree s={1.2} />, off: [0.75, 0, -0.5] }, { p: [-1.9, 0, 0.6], el: () => <Mushroom s={2} />, off: [0.5, 0, -0.8] }, { p: [0.2, 0, -0.8], el: () => <House s={1.1} />, off: [1.15, 0, -0.5] }, { p: [2.4, 0, 0.6], el: () => <Item k="gift" s={1.6} />, off: [0, 0.1, -0.9] }, { p: [4.4, 0, -0.6], el: () => <Pine s={1.1} />, off: [-0.8, 0, -0.5] }, { p: [0, 0, 1.6], el: () => <>{[-0.5, 0, 0.5].map(x => <S key={x} p={[x, 0.4, 0]} s={0.55} c="#8fdc9a" />)}</>, off: [0, 0.05, -0.8] }]
export function Kitten({ again }: GP) {
  const z = usePz('kitten', again), [at, setAt] = useState(() => Math.floor(Math.random() * 6)), [found, setFound] = useState(false), [n, setN] = useState(0)
  const hit = () => { if (found) return; setFound(true); animal('cat'); burst([HIDE[at].p[0], 1.6, 1], 'heart', 24); z.good(); z.later(() => { if (n === 2) z.win(); else { setN(n + 1); setFound(false); setAt((at + 1 + Math.floor(Math.random() * 4)) % 6); void task('pz_kitten') } }, 2000) }
  const h = HIDE[at]
  useEffect(() => { const id = setInterval(() => { if (!found) animal('cat') }, 6500); return () => clearInterval(id) }, [found])
  return <PStage cam={{ t: [0, 1.5, 0], dir: [0, 0.2, 1], w: 10.4, h: 4.8 }}>{HIDE.map((q, i) => <Tap key={i} p={q.p} on={() => { if (i === at) hit(); else { sfx('squeak'); burst([q.p[0], 1.4, q.p[2] + 0.5], 'star', 5) } }} hit={0.9} hitP={[0, 0.7, 0]}>{q.el()}</Tap>)}
    <Glide p={found ? [h.p[0], 0, h.p[2] + 1.6] : [h.p[0] + h.off[0], h.off[1], h.p[2] + h.off[2]]} s={0.9} arc={0.8}><Tap on={hit} hit={0.8} hitP={[0, 0.7, 0]} snd={null}><Animal k="cat" mood={found ? 'happy' : 'idle'} /></Tap></Glide></PStage>
}
// ---------- потерянная игрушка: коробки ----------
const FIND: [Phrase, string, string?][] = [['fi_ball', 'ball', '#ff4f5e'], ['fi_teddy', 'teddy'], ['fi_car', 'car'], ['fi_duckling', 'duckling'], ['fi_rocket', 'rocket']]
export function Toy({ again }: GP) {
  const z = usePz('toy', again), [r, setR] = useState(0), set = useMemo(() => shuffle(FIND), []), slots = useMemo(() => shuffle([0, 1, 2, 3, 4]), [r]), [open, setOpen] = useState<number[]>([]), busy = useRef(false)
  useEffect(() => { const t = setTimeout(() => void task(set[r][0]), r ? 300 : 3200); return () => clearTimeout(t) }, [r])
  return <PStage cam={{ t: [0, 1.7, 0], dir: [0, 0.2, 1], w: 9.6, h: 4.8 }}>
    <Float p={[0, 3.2, -1]} a={0.06}><S s={[0.95, 0.8, 0.15]} c="#fff" o={{ op: 0.9 }} /><Item k={set[r][1]} c={set[r][2]} p={[0, -0.5, 0.3]} s={0.95} /></Float>
    {slots.map((ti, i) => { const o = open.includes(i), it = set[ti]; return <Tap key={r + '-' + i} p={[COL(5, i, 1.85), 0, 0.4]} hit={0.85} hitP={[0, 0.5, 0]} on={() => { if (o || busy.current) return; setOpen([...open, i]); if (ti === r) { busy.current = true; z.good(); sfx('magic'); burst([COL(5, i, 1.85), 1.8, 1], 'star', 30); z.later(() => { busy.current = false; if (r === 2) z.win(); else { setOpen([]); setR(r + 1) } }, 2200) } else sfx('pop') }}><B a={[1.35, 1, 1.1]} p={[0, 0.5, 0]} c={RAINBOW[i + 1]} /><Glide p={o ? [0.75, 1.5, -0.4] : [0, 1.08, 0]} r={o ? [0, 0, -1] : [0, 0, 0]}><B a={[1.5, 0.22, 1.25]} c="#fff" /></Glide>{o && <Glide p={[0, 1, 0]} from={[0, 0.3, 0]} s={1}><Item k={it[1]} c={it[2]} /></Glide>}</Tap> })}
  </PStage>
}
// ---------- посчитай бабочек ----------
export function Count({ again }: GP) {
  const z = usePz('count', again), [r, setR] = useState(0), n = useMemo(() => [2, 3, 4, 5][r] ?? 3, [r]), [tapd, setTap] = useState<number[]>([]), opts = useMemo(() => [...new Set([n, n + 1, Math.max(1, n - 1)])].sort((a, b) => a - b), [n]), busy = useRef(false)
  const cols = ['#ff8fc5', '#b79bff', '#ffd257', '#7fc4ff', '#ff9a6a']
  return <><PStage cam={{ t: [0, 2, 0], dir: [0, 0.12, 1], w: 8.4, h: 5, tray: true }}>
    {[-3, 0, 3].map((x, i) => <Flower key={x} p={[x, 0, -0.6]} s={2} c={cols[i]} />)}
    {Array.from({ length: n }, (_, i) => <Orbit key={r + '-' + i} c={[COL(n, i, 1.5), 2.4 + (i % 2) * 0.9, 0]} rad={0.25} y={0.2} sp={0} ph={0}><Tap hit={0.65} snd={null} on={() => { if (tapd.includes(i)) return; const t = [...tapd, i]; setTap(t); xylo(70 + t.length * 2); void say(('n' + t.length) as Phrase) }}><group rotation={[0, 0, 0]}><Butterfly c={cols[i % 5]} s={tapd.includes(i) ? 2.2 : 1.8} /></group></Tap></Orbit>)}
  </PStage><Tray items={opts.map(o => ({ id: String(o), icon: <b style={{ lineHeight: 1 }}>{o}</b>, color: RAINBOW[o % 7], label: text(('n' + o) as Phrase) }))} on={o => { if (busy.current) return; if (+o === n) { busy.current = true; z.good(); void say(('n' + n) as Phrase, 'bravo'); burst([0, 3, 1], 'star', 40); z.later(() => { busy.current = false; if (r === 2) z.win(); else { setR(r + 1); setTap([]); void task('pz_count') } }, 2600) } else { z.bad(); setTap([]) } }} /></>
}
// ---------- последовательность цветов ----------
const SC = ['#ff5a6a', '#4aa8ff', '#ffd93b', '#5fcf6a']
export function Seq({ again }: GP) {
  const z = usePz('seq', again), [seq, setSeq] = useState<number[]>(() => [pick([0, 1, 2, 3]), pick([0, 1, 2, 3])]), [lit, setLit] = useState(-1), at = useRef(0), playing = useRef(true), [turn, setTurn] = useState(false)
  const note = (i: number) => xylo([72, 76, 79, 84][i])
  const play = (s: number[], d: number) => { playing.current = true; setTurn(false); at.current = 0; s.forEach((c, i) => { z.later(() => { setLit(c); note(c) }, d + i * 800); z.later(() => setLit(-1), d + i * 800 + 520) }); z.later(() => { playing.current = false; setTurn(true); void say('pz_seq_go') }, d + s.length * 800) }
  useEffect(() => { play(seq, 3600) }, [])
  useEffect(() => { if (import.meta.env.DEV) (window as any).__seq = seq }, [seq])
  const on = (i: number) => {
    if (playing.current) return; note(i); setLit(i); z.later(() => setLit(-1), 300)
    if (i === seq[at.current]) { at.current++; if (at.current === seq.length) { z.good(); burst([0, 3, 1], 'star', 24); if (seq.length === 4) z.win(); else { const n = [...seq, pick([0, 1, 2, 3])]; setSeq(n); play(n, 1600) } } } else { z.bad(); play(seq, 1900) }
  }
  return <PStage cam={{ t: [0, 1.9, 0], dir: [0, 0.2, 1], w: 7, h: 4.8 }}>{SC.map((c, i) => <Tap key={c} p={[COL(2, i % 2, 2.3), 0.2 + (1 - Math.floor(i / 2)) * 1.9, 0]} on={() => on(i)} hit={1} hitP={[0, 0.8, 0]} snd={null} s={lit === i ? 1.15 : 1}><S p={[0, 0.85, 0]} s={0.85} c={c} o={{ em: lit === i ? 1.1 : 0.05, rough: 0.2 }} />{lit === i && <Star3 p={[0, 0.85, 1]} s={0.3} c="#fff" o={{ em: 1 }} />}</Tap>)}<Animal k="parrot" p={[-3.4, 0, 0.4]} mood={turn ? 'happy' : 'idle'} s={0.9} /><Person p={[3.4, 0, 0.4]} s={0.85} mood={turn ? 'wave' : 'idle'} outfit={useSave.getState().outfit} /></PStage>
}
// ---------- отличия ----------
const DI: { k: string; p: V3; s: number; alt: { k?: string; c?: string; s?: number; gone?: boolean } }[] = [
  { k: 'house', p: [-0.9, 0, -0.5], s: 1.3, alt: { k: 'tree' } }, { k: 'sun', p: [1, 2, -0.6], s: 0.9, alt: { k: 'moon' } }, { k: 'flower', p: [0.3, 0, 0.5], s: 0.9, alt: { c: '#4aa8ff' } }, { k: 'cat', p: [1.2, 0, 0.3], s: 0.9, alt: { k: 'dog' } }, { k: 'balloon', p: [-1.2, 1.6, 0.2], s: 0.7, alt: { gone: true } }, { k: 'ball', p: [-0.6, 0, 0.9], s: 0.5, alt: { c: '#5fcf6a' } }, { k: 'mushroom', p: [-1.5, 0, 0.5], s: 0.7, alt: { s: 1.2 } }]
export function Diff({ again }: GP) {
  const z = usePz('diff', again), df = useMemo(() => shuffle([0, 1, 2, 3, 4, 5, 6]).slice(0, 3), []), [ok, setOk] = useState<number[]>([]), portrait = window.innerWidth < window.innerHeight
  const on = (i: number) => { if (df.includes(i) && !ok.includes(i)) { const n = [...ok, i]; setOk(n); z.good(); if (n.length === 3) z.win() } else if (!df.includes(i)) z.bad() }
  return <PStage cam={portrait ? { t: [0, 2.4, 0], dir: [0, 0.05, 1], w: 4.8, h: 8 } : { t: [0, 1.7, 0], dir: [0, 0.12, 1], w: 9.2, h: 4.9 }}>{[0, 1].map(side => <group key={side} position={portrait ? [0, side ? -1.4 : 2.9, 0] : [side ? 2.25 : -2.25, 0.1, 0]}>
    <B a={[4.2, 3.5, 0.2]} p={[0, 1.6, -1.2]} c={side ? '#ffd3ec' : '#cfe6ff'} rad={0.2} /><B a={[4, 0.2, 2.6]} p={[0, -0.1, 0]} c="#b5eaa6" />
    {DI.map((q, i) => { const a = side && df.includes(i) ? q.alt : {}; return <Tap key={i} p={q.p} on={() => on(i)} hit={0.55} hitP={[0, 0.4 * q.s, 0]}>{!(a as any).gone && <Item k={(a as any).k ?? q.k} c={(a as any).c ?? (q.k === 'flower' ? '#ff8fc5' : undefined)} s={(a as any).s ?? q.s} />}{ok.includes(i) && <T a={[0.6, 0.06]} p={[0, 0.45 * q.s, 0.4]} c="#ff5a9c" o={{ em: 0.5 }} />}</Tap> })}
  </group>)}{[0, 1, 2].map(i => <Star3 key={i} p={[COL(3, i, 0.7), portrait ? 6.6 : 3.85, 0]} s={0.24} c={i < ok.length ? '#ffd257' : '#e6dcf0'} />)}</PStage>
}
void Disc; void rnd
