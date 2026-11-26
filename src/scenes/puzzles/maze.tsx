import { useEffect, useMemo, useRef, useState } from 'react'
import { B, C, Glide, Star3, Tap, burst, pick } from '../../kit/base'
import { Castle, Flower } from '../../kit/nature'
import { Person } from '../../kit/people'
import { PStage, usePz, type GP } from './common'
import { sfx } from '../../core/audio'
import { useSave } from '../../core/store'

// # — кустики, S — старт, E — замок
const MAPS = [['S.#..', '#.#.#', '#...#', '##.##', '##..E'], ['S...#', '###.#', '#...#', '#.###', '#...E'], ['S.###', '#...#', '###.#', '#...#', '##..E'], ['S#...', '.#.#.', '...#.', '##.#.', '##.#E']]
export function Maze({ again }: GP) {
  const z = usePz('maze', again), m = useMemo(() => pick(MAPS), []), [pos, setPos] = useState<[number, number]>([0, 0]), posR = useRef(pos), [moving, setMoving] = useState(false), [vis, setVis] = useState<Set<string>>(new Set(['0,0'])), [ang, setAng] = useState(0), outfit = useSave(s => s.outfit)
  posR.current = pos
  const end: [number, number] = [4, 4], path = useRef<[number, number][]>([])
  const X = (c: number) => (c - 2) * 1.25, Z = (r: number) => (r - 2) * 1.25
  const open = (r: number, c: number) => r >= 0 && c >= 0 && r < 5 && c < 5 && m[r][c] !== '#'
  const step = () => {
    const n = path.current.shift(); if (!n) { setMoving(false); return }
    const p = posR.current; setAng(Math.atan2(n[1] - p[1], n[0] - p[0])); setPos(n); setMoving(true); sfx('tap'); setVis(v => new Set(v).add(n.join()))
    if (n[0] === end[0] && n[1] === end[1]) { path.current = []; z.later(() => { setMoving(false); burst([X(4), 2, Z(4)], 'heart', 40); z.win() }, 500) } else z.later(step, 380)
  }
  const walk = (r: number, c: number) => {
    if (z.isOver() || moving) return
    // кратчайший путь по дорожкам
    const s = posR.current, from = new Map<string, string>([[s.join(), '']]), q: [number, number][] = [s]
    while (q.length) { const [a, b] = q.shift()!; for (const [dr, dc] of [[0, 1], [1, 0], [0, -1], [-1, 0]]) { const k = [a + dr, b + dc].join(); if (open(a + dr, b + dc) && !from.has(k)) { from.set(k, [a, b].join()); q.push([a + dr, b + dc]) } } }
    if (!open(r, c)) { z.bad(); return }
    const out: [number, number][] = []; let k = [r, c].join(); while (k && k !== s.join()) { out.unshift(k.split(',').map(Number) as [number, number]); k = from.get(k) ?? '' }
    // дальше трёх клеток за раз не идём — малышка сама находит путь
    path.current = out.slice(0, 3); step()
  }
  const dir = (dr: number, dc: number) => { const [a, b] = posR.current; if (open(a + dr, b + dc)) { path.current = [[a + dr, b + dc]]; if (!moving) step() } else sfx('soft') }
  useEffect(() => { const f = (e: KeyboardEvent) => { const d = ({ ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1] } as Record<string, number[]>)[e.code]; if (d) dir(d[0], d[1]) }; window.addEventListener('keydown', f); return () => window.removeEventListener('keydown', f) })
  return <PStage cam={{ t: [0, 0.6, 0], dir: [0, 1.15, 1], w: 7.4, h: 7.2 }}>
    <B a={[7, 0.3, 7]} p={[0, -0.02, 0]} c="#ffe9cf" rad={0.2} />
    {m.map((row, r) => [...row].map((ch, c) => <Tap key={r + '' + c} p={[X(c), 0.14, Z(r)]} snd={null} fx={null} on={() => walk(r, c)}>{ch === '#' ? <><B a={[1.15, 0.75, 1.15]} p={[0, 0.38, 0]} c="#8fdc9a" rad={0.3} />{(r + c) % 2 === 0 && <Flower p={[0, 0.72, 0]} stem={false} s={0.8} c={['#ff8fc5', '#ffd257', '#b79bff'][(r * 2 + c) % 3]} />}</> : <><B a={[1.15, 0.08, 1.15]} c={(r + c) % 2 ? '#fff3dc' : '#ffdfee'} rad={0.04} />{!vis.has([r, c].join()) && m[r][c] === '.' && <Star3 p={[0, 0.35, 0]} s={0.16} c="#ffd257" o={{ em: 0.4 }} />}</>}</Tap>))}
    <Castle p={[X(4), 0.15, Z(4) - 0.1]} s={0.33} />
    <Glide p={[X(pos[1]), 0.18, Z(pos[0])]} speed={7}><Person s={0.62} r={[0, ang, 0]} mood={z.isOver() ? 'happy' : moving ? 'walk' : 'idle'} outfit={outfit} /></Glide><C a={[0.01, 0.01, 0.01]} />
  </PStage>
}
