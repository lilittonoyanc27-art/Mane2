import { useState, type ReactNode } from 'react'
import * as THREE from 'three'
import { S, C, B, K, Star3, Heart3, burst, type V3 } from './base'
import { Item } from './items'
import { Flower } from './nature'
import { sfx } from '../core/audio'

export const TOPS: { id: string; icon: string; el: ReactNode }[] = [
  { id: 'cherry', icon: '🍒', el: <S s={0.13} c="#ff2f55" o={{ rough: 0.2 }} /> }, { id: 'straw', icon: '🍓', el: <Item k="strawberry" s={0.4} /> }, { id: 'heart', icon: '💖', el: <Heart3 s={0.14} c="#ff5a9c" /> }, { id: 'star', icon: '⭐', el: <Star3 s={0.15} c="#ffd257" o={{ em: 0.3 }} /> },
  { id: 'flower', icon: '🌸', el: <Flower stem={false} s={0.6} /> }, { id: 'choco', icon: '🍫', el: <B a={[0.2, 0.2, 0.1]} c="#7a4a2a" rad={0.03} /> }, { id: 'cream', icon: '☁️', el: <><S s={[0.17, 0.12, 0.17]} c="#fff" /><K a={[0.1, 0.16]} p={[0, 0.13, 0]} c="#fff" /></> }, { id: 'candy', icon: '🍬', el: <><S s={0.1} c="#7fc4ff" /><S s={[0.06, 0.08, 0.03]} p={[0.14, 0, 0]} c="#b79bff" /><S s={[0.06, 0.08, 0.03]} p={[-0.14, 0, 0]} c="#b79bff" /></> }, { id: 'candle', icon: '🕯️', el: <><C a={[0.045, 0.045, 0.36]} p={[0, 0.16, 0]} c="#8fd3ff" /><S p={[0, 0.42, 0]} s={[0.045, 0.08, 0.045]} c="#ffb52e" o={{ em: 1 }} /></> },
]
export interface Put { id: string; p: V3 }
/** Обёртка: касание поверхности кладёт туда выбранное украшение */
export function Decorate({ children, top, puts, add, off }: { children: ReactNode; top: string; puts: Put[]; add: (p: Put) => void; off?: boolean }) {
  return <group onPointerDown={off ? undefined : e => {
    e.stopPropagation()
    const q = (e.eventObject as THREE.Object3D).worldToLocal(e.point.clone())
    sfx('pop'); burst(e.point, 'star', 6, 0.5); if (puts.length < 60) add({ id: top, p: [q.x, q.y + 0.04, q.z] })
  }}>{children}{puts.map((u, i) => <group key={i} position={u.p}>{TOPS.find(t => t.id === u.id)?.el}</group>)}</group>
}
export const CAKEC = ['#ff9ecb', '#fff3e0', '#b79bff', '#8fd3ff', '#ffd98a', '#a8e6b0', '#8a5a3a', '#ff8a8a']
export const CakeLayers = ({ layers }: { layers: string[] }) => <group><C a={[1.5, 1.4, 0.12]} p={[0, -0.06, 0]} c="#fff" />{layers.map((c, i) => { const r = 1.2 - i * 0.22; return <group key={i} position={[0, i * 0.55, 0]}><C a={[r, r, 0.5]} p={[0, 0.26, 0]} c={c} />{Array.from({ length: 14 }, (_, j) => <S key={j} p={[Math.cos(j * 0.449) * r * 0.97, 0.52, Math.sin(j * 0.449) * r * 0.97]} s={0.115} c="#fff" />)}</group> })}</group>
export function usePuts() { const [puts, set] = useState<Put[]>([]); return { puts, add: (p: Put) => set(a => [...a, p]), clear: () => set([]) } }
