import { useMemo, useState } from 'react'
import { B, C, S, T, Drag, burst, shuffle, type V3 } from '../../kit/base'
import { RAINBOW } from '../../kit/nature'
import { Item } from '../../kit/items'
import { Animal, type AKind } from '../../kit/animals'
import { PStage, usePz, type GP } from './common'
import { animal, sfx } from '../../core/audio'

const COL4 = (n: number, i: number, gap = 2.4) => (i - (n - 1) / 2) * gap
/** Мама и малыш: тащим малыша к маме */
export function Baby({ again }: GP) {
  const z = usePz('baby', again), set = useMemo(() => shuffle(['cat', 'dog', 'duck', 'cow', 'pig', 'sheep', 'rabbit', 'bear', 'horse'] as AKind[]).slice(0, 3), []), low = useMemo(() => shuffle([0, 1, 2]), []), [ok, setOk] = useState<number[]>([])
  return <PStage cam={{ t: [0, 1.9, 0], dir: [0, 0.2, 1], w: 8.2, h: 5.6 }}>
    {set.map((k, i) => <group key={k} position={[COL4(3, i), 1.2, -1]} onPointerDown={e => { e.stopPropagation(); animal(k) }}><C a={[1, 1.1, 1.2]} p={[0, -0.6, 0]} c={RAINBOW[i * 2]} /><Animal k={k} s={1.15} mood={ok.includes(i) ? 'happy' : 'idle'} /></group>)}
    {low.map((i, o) => { const d = ok.includes(i); return <Drag key={i} home={d ? [COL4(3, i) + 0.9, 1.2, -0.4] : [COL4(3, o), 0.05, 2]} off={d} s={0.62} hit={1.2} on={() => animal(set[i])} goal={[COL4(3, i), 1.5, -0.8]} gr={1.25} onDrop={(p, inG) => { const t = COL4(3, i); if (!inG && p.y < 0.6) return false; if (inG) { const n = [...ok, i]; setOk(n); z.good(); animal(set[i]); burst([t, 2.6, 0], 'heart', 18); if (n.length === 3) z.win(); return true } z.bad() }}><Animal k={set[i]} baby mood={d ? 'happy' : 'idle'} /></Drag> })}
  </PStage>
}
/** Сортировка по цвету */
const CS = [{ c: '#ff4f5e', it: ['apple', 'strawberry', 'tomato', 'heart'] }, { c: '#ffd93b', it: ['banana', 'lemon', 'star', 'cheese'] }, { c: '#5fbf6a', it: ['cucumber', 'pear', 'lettuce', 'frog'] }]
export function ColorG({ again }: GP) {
  const z = usePz('color', again), its = useMemo(() => shuffle(CS.flatMap((q, g) => shuffle(q.it).slice(0, 2).map(k => ({ k, g })))), []), [ok, setOk] = useState<number[]>([])
  return <PStage cam={{ t: [0, 1.9, 0], dir: [0, 0.25, 1], w: 8.6, h: 5.6 }}>
    {CS.map((q, g) => <group key={g} position={[COL4(3, g, 2.8), 0, -0.6]}><C a={[1.15, 0.85, 1.1]} p={[0, 0.9, 0]} c={q.c} /><T a={[1.15, 0.12]} p={[0, 1.45, 0]} r={[Math.PI / 2, 0, 0]} c="#fff" /><C a={[1.02, 1, 0.1]} p={[0, 1.36, 0]} c="#fff6e8" /></group>)}
    {its.map((it, i) => { const d = ok.includes(i), gi = ok.filter(x => its[x].g === it.g).indexOf(i), home: V3 = d ? [COL4(3, it.g, 2.8) + (gi ? 0.4 : -0.4), 1.4, -0.4] : [COL4(6, i, 1.35), 0.05, 2.1]; return <Drag key={i} home={home} s={0.85} off={d} hit={0.75} goal={[COL4(3, it.g, 2.8), 1.1, -0.2]} gr={1.35} onDrop={(p, inG) => { const x = COL4(3, it.g, 2.8); if (!inG && p.y < 0.55) return false; if (inG) { const n = [...ok, i]; setOk(n); z.good(); burst([x, 2, 0.4], 'star', 16); if (n.length === 6) z.win(); return true } z.bad() }}><Item k={it.k} /></Drag> })}
  </PStage>
}
/** Тени */
export function Shadow({ again }: GP) {
  const z = usePz('shadow', again), set = useMemo(() => shuffle(['star', 'car', 'teddy', 'balloon', 'rocket', 'umbrella', 'house', 'duck', 'cupcake', 'heart', 'tree', 'teapot']).slice(0, 4), []), low = useMemo(() => shuffle([0, 1, 2, 3]), []), [ok, setOk] = useState<number[]>([])
  return <PStage cam={{ t: [0, 1.9, 0], dir: [0, 0.18, 1], w: 9, h: 5.6 }}>
    <B a={[9, 2.8, 0.2]} p={[0, 2.6, -1.4]} c="#fff8ff" rad={0.2} />
    {set.map((k, i) => <group key={k} position={[COL4(4, i, 2.1), 1.8, -1]}><S s={[0.9, 0.9, 0.1]} p={[0, 0.7, -0.2]} c="#e8dcff" />{!ok.includes(i) && <Item k={k} s={1.15} shadow />}</group>)}
    {low.map((i, o) => { const d = ok.includes(i); return <Drag key={i} home={d ? [COL4(4, i, 2.1), 1.8, -0.8] : [COL4(4, o, 2), 0.05, 1.9]} s={1.1} off={d} hit={0.85} goal={[COL4(4, i, 2.1), 2.1, -1]} gr={1.05} onDrop={(p, inG) => { const x = COL4(4, i, 2.1); if (!inG && p.y < 0.6) return false; if (inG) { const n = [...ok, i]; setOk(n); z.good(); sfx('magic'); burst([x, 2.6, 0], 'star', 18); if (n.length === 4) z.win(); return true } z.bad() }}><Item k={set[i]} /></Drag> })}
  </PStage>
}
