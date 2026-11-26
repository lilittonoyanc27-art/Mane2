import { useEffect, useRef, type ReactNode } from 'react'
import * as THREE from 'three'
import { S, B, C, K, T, Dome, Cap, Star3, Heart3, mat, type V3 } from './base'
import { Flower, Butterfly, Tree, House, Mushroom } from './nature'
import { Animal, type AKind } from './animals'
import { Crown, Bow } from './people'

export const FOODS = ['apple', 'banana', 'strawberry', 'orange', 'pear', 'grapes', 'lemon', 'watermelon', 'carrot', 'tomato', 'cucumber', 'milk', 'cheese', 'bread', 'egg', 'juice', 'honey'] as const
const leaf = (p: V3, s = 1) => <S p={p} s={[0.14 * s, 0.04, 0.07 * s]} r={[0, 0, 0.5]} c="#6fbf5f" />
const stem = (y: number) => <C a={[0.025, 0.03, 0.16]} p={[0, y, 0]} c="#8a5a3a" />
/** Предметы размером примерно 1 единица, стоят на y=0 */
const IT: Record<string, (c?: string) => ReactNode> = {
  apple: c => <><S p={[-0.1, 0.4, 0]} s={[0.34, 0.39, 0.4]} c={c ?? '#ff4f5e'} o={{ rough: 0.25 }} /><S p={[0.1, 0.4, 0]} s={[0.34, 0.39, 0.4]} c={c ?? '#ff4f5e'} o={{ rough: 0.25 }} />{stem(0.82)}{leaf([0.12, 0.86, 0])}</>,
  banana: () => <group position={[0, 0.5, 0]} rotation={[0, 0, 0.3]}>{[-2, -1, 0, 1, 2].map(i => <S key={i} p={[i * 0.17, i * i * 0.07 - 0.15, 0]} s={[0.17, 0.15, 0.15]} r={[0, 0, i * 0.35]} c="#ffd93b" />)}<S p={[-0.44, 0.22, 0]} s={0.07} c="#8a6a2a" /><S p={[0.44, 0.22, 0]} s={0.06} c="#8a6a2a" /></group>,
  strawberry: () => <><S p={[0, 0.5, 0]} s={[0.36, 0.3, 0.36]} c="#ff3f5f" o={{ rough: 0.3 }} /><K a={[0.35, 0.5]} p={[0, 0.24, 0]} r={[Math.PI, 0, 0]} c="#ff3f5f" o={{ rough: 0.3 }} />{Array.from({ length: 9 }, (_, i) => <S key={i} p={[Math.sin(i * 1.4) * 0.3, 0.3 + (i % 3) * 0.13, Math.cos(i * 1.4) * 0.3]} s={0.03} c="#ffe27a" ns />)}{[0, 1, 2, 3, 4].map(i => <S key={i} p={[Math.cos(i * 1.257) * 0.17, 0.76, Math.sin(i * 1.257) * 0.17]} s={[0.16, 0.04, 0.08]} r={[0, -i * 1.257, 0]} c="#5fbf5f" />)}</>,
  orange: c => <><S p={[0, 0.42, 0]} s={0.42} c={c ?? '#ff9a2e'} o={{ rough: 0.4 }} />{leaf([0.08, 0.86, 0])}<S p={[0, 0.83, 0]} s={0.05} c="#6f8f3f" /></>,
  pear: () => <><S p={[0, 0.34, 0]} s={[0.37, 0.35, 0.37]} c="#c5e05a" /><S p={[0, 0.66, 0]} s={[0.23, 0.26, 0.23]} c="#c5e05a" />{stem(0.98)}{leaf([0.1, 1, 0])}</>,
  grapes: () => <>{[[0, 0.1], [-0.15, 0.32], [0.15, 0.32], [-0.28, 0.55], [0, 0.55], [0.28, 0.55], [-0.15, 0.75], [0.15, 0.75]].map(([x, y], i) => <S key={i} p={[x, y, (i % 2) * 0.1]} s={0.17} c="#9a6bd8" o={{ rough: 0.2 }} />)}{stem(0.95)}{leaf([0.14, 0.95, 0], 1.4)}</>,
  lemon: () => <group position={[0, 0.36, 0]}><S s={[0.42, 0.34, 0.34]} c="#ffe84a" /><S p={[0.4, 0, 0]} s={0.1} c="#ffe84a" /><S p={[-0.4, 0, 0]} s={0.08} c="#ffe84a" />{leaf([0.4, 0.14, 0])}</group>,
  watermelon: () => <group position={[0, 0.12, 0]}><C a={[0.55, 0.55, 0.24]} seg={40} r={[Math.PI / 2, 0, 0]} p={[0, 0.4, 0]} c="#4fae5a" /><C a={[0.49, 0.49, 0.27]} seg={40} r={[Math.PI / 2, 0, 0]} p={[0, 0.4, 0]} c="#ff5f70" />{Array.from({ length: 7 }, (_, i) => <S key={i} p={[Math.cos(i * 0.9) * 0.28, 0.4 + Math.sin(i * 0.9) * 0.28, 0.14]} s={[0.035, 0.055, 0.02]} c="#4a2a2a" ns />)}</group>,
  carrot: () => <group position={[0, 0.1, 0]}><K a={[0.24, 0.8]} p={[0, 0.35, 0]} r={[Math.PI, 0, 0]} c="#ff8a3a" />{[-0.12, 0, 0.12].map(x => <S key={x} p={[x, 0.9, 0]} s={[0.06, 0.2, 0.06]} r={[0, 0, -x * 3]} c="#5fbf5f" />)}</group>,
  tomato: () => <><S p={[0, 0.37, 0]} s={[0.43, 0.37, 0.43]} c="#ff5040" o={{ rough: 0.2 }} />{[0, 1, 2, 3, 4].map(i => <S key={i} p={[Math.cos(i * 1.257) * 0.14, 0.73, Math.sin(i * 1.257) * 0.14]} s={[0.14, 0.03, 0.05]} r={[0, -i * 1.257, 0]} c="#4fae5a" />)}</>,
  cucumber: () => <group position={[0, 0.3, 0]} rotation={[0, 0, 0.5]}><Cap a={[0.2, 0.6]} r={[0, 0, 1.57]} c="#5fbf6a" />{[-0.25, 0, 0.25].map(x => <S key={x} p={[x, 0.1, 0.16]} s={0.04} c="#8fdc8a" ns />)}</group>,
  milk: () => <><B a={[0.5, 0.72, 0.5]} p={[0, 0.36, 0]} c="#fff" rad={0.05} /><B a={[0.51, 0.26, 0.51]} p={[0, 0.3, 0]} c="#7fc4ff" rad={0.05} /><C a={[0.04, 0.36, 0.26]} seg={4} r={[0, Math.PI / 4, 0]} p={[0, 0.84, 0]} c="#fff" /><B a={[0.5, 0.12, 0.06]} p={[0, 0.98, 0]} c="#7fc4ff" rad={0.03} /><S p={[0, 0.3, 0.26]} s={[0.12, 0.09, 0.02]} c="#fff" ns /></>,
  cheese: () => <group position={[0, 0.02, 0]}><C a={[0.52, 0.52, 0.45]} seg={3} p={[0, 0.25, 0]} c="#ffd257" /><S p={[0.1, 0.3, 0.26]} s={[0.1, 0.1, 0.05]} c="#eeb63a" ns /><S p={[-0.12, 0.18, 0.28]} s={[0.07, 0.07, 0.05]} c="#eeb63a" ns /></group>,
  bread: () => <><B a={[0.9, 0.5, 0.5]} p={[0, 0.28, 0]} c="#e2a55f" rad={0.22} />{[-0.25, 0, 0.25].map(x => <B key={x} a={[0.07, 0.05, 0.36]} p={[x, 0.53, 0]} r={[0, 0.4, 0]} c="#ffe0ae" rad={0.02} />)}</>,
  egg: () => <S p={[0, 0.38, 0]} s={[0.29, 0.38, 0.29]} c="#fff1e0" />,
  juice: () => <><C a={[0.28, 0.24, 0.7]} p={[0, 0.35, 0]} c="#ffb03a" o={{ rough: 0.1 }} /><C a={[0.29, 0.28, 0.1]} p={[0, 0.72, 0]} c="#fff" /><C a={[0.03, 0.03, 0.5]} p={[0.06, 0.9, 0]} r={[0, 0, -0.2]} c="#ff7fae" /></>,
  honey: () => <><C a={[0.32, 0.36, 0.55]} p={[0, 0.28, 0]} c="#ffb52e" o={{ rough: 0.15 }} /><C a={[0.34, 0.34, 0.14]} p={[0, 0.63, 0]} c="#fff0dc" /><S p={[0, 0.3, 0.35]} s={[0.16, 0.14, 0.03]} c="#fff" ns /></>,
  flour: () => <><B a={[0.6, 0.8, 0.4]} p={[0, 0.4, 0]} c="#fff6e6" rad={0.1} /><S p={[0, 0.4, 0.2]} s={[0.17, 0.17, 0.03]} c="#ffc861" /></>,
  sugar: () => <><C a={[0.3, 0.3, 0.5]} p={[0, 0.25, 0]} c="#ffd3ec" /><S p={[0, 0.5, 0]} s={[0.28, 0.14, 0.28]} c="#fff" /></>,
  fishfood: () => <S p={[0, 0.3, 0]} s={0.3} c="#e2a55f" />,
  bone: () => <group position={[0, 0.3, 0]}><Cap a={[0.11, 0.5]} r={[0, 0, 1.57]} c="#fff6e6" />{[-0.34, 0.34].flatMap(x => [-0.12, 0.12].map(y => <S key={x + '' + y} p={[x, y, 0]} s={0.15} c="#fff6e6" />))}</group>,
  seeds: () => <>{[0, 1, 2, 3, 4, 5].map(i => <S key={i} p={[Math.cos(i) * 0.2, 0.12 + (i % 2) * 0.12, Math.sin(i) * 0.2]} s={[0.11, 0.08, 0.08]} c="#c99a5a" />)}</>,
  lettuce: () => <>{[0, 1, 2, 3, 4].map(i => <S key={i} p={[Math.cos(i * 1.26) * 0.18, 0.3, Math.sin(i * 1.26) * 0.18]} s={[0.22, 0.28, 0.22]} c={i % 2 ? '#8fdc7a' : '#6fcf6a'} />)}</>,
  cookie: () => <><C a={[0.42, 0.42, 0.16]} p={[0, 0.08, 0]} c="#e2b06f" />{[0, 1, 2, 3, 4].map(i => <S key={i} p={[Math.cos(i * 1.25) * 0.24, 0.17, Math.sin(i * 1.25) * 0.24]} s={0.06} c="#7a4a2a" />)}</>,
  cupcake: c => <><C a={[0.36, 0.26, 0.4]} p={[0, 0.2, 0]} c="#ffb9dc" /><S p={[0, 0.48, 0]} s={[0.38, 0.2, 0.38]} c={c ?? '#fff0f8'} /><S p={[0, 0.66, 0]} s={[0.26, 0.17, 0.26]} c={c ?? '#fff0f8'} /><S p={[0, 0.82, 0]} s={0.12} c="#ff4f6e" /></>,
  icecream: c => <><K a={[0.26, 0.7]} p={[0, 0.35, 0]} r={[Math.PI, 0, 0]} c="#e2a55f" /><S p={[0, 0.82, 0]} s={0.32} c={c ?? '#ff9ecb'} /><S p={[0, 1.18, 0]} s={0.25} c="#fff3c4" /></>,
  cake: c => <><C a={[0.55, 0.55, 0.36]} p={[0, 0.18, 0]} c={c ?? '#ff9ecb'} /><C a={[0.4, 0.4, 0.3]} p={[0, 0.5, 0]} c="#fff3e0" /><C a={[0.26, 0.26, 0.24]} p={[0, 0.76, 0]} c="#b79bff" /><S p={[0, 0.94, 0]} s={0.1} c="#ff4f6e" />{Array.from({ length: 10 }, (_, i) => <S key={i} p={[Math.cos(i * 0.628) * 0.53, 0.36, Math.sin(i * 0.628) * 0.53]} s={0.08} c="#fff" />)}</>,
  salad: () => <><C a={[0.55, 0.3, 0.4]} p={[0, 0.2, 0]} c="#8fd3ff" />{['#ff4f5e', '#ffd93b', '#ff9a2e', '#8fdc7a', '#9a6bd8', '#ff3f5f', '#fff1c4'].map((c, i) => <B key={i} a={[0.22, 0.22, 0.22]} rad={0.07} p={[Math.cos(i * 0.9) * 0.28 * (i ? 1 : 0), 0.45, Math.sin(i * 0.9) * 0.28 * (i ? 1 : 0)]} r={[i, i, 0]} c={c} />)}</>,
  plate: () => <><C a={[0.5, 0.36, 0.08]} p={[0, 0.04, 0]} c="#fff" /><T a={[0.45, 0.04]} p={[0, 0.09, 0]} r={[1.57, 0, 0]} c="#ff9ecb" /></>,
  cup: c => <><C a={[0.28, 0.22, 0.5]} p={[0, 0.25, 0]} c={c ?? '#b79bff'} /><T a={[0.14, 0.04]} p={[0.32, 0.28, 0]} c={c ?? '#b79bff'} /><C a={[0.25, 0.25, 0.02]} p={[0, 0.5, 0]} c="#8a4f2a" /></>,
  teapot: () => <><S p={[0, 0.38, 0]} s={[0.42, 0.38, 0.42]} c="#8fd3ff" /><Cap a={[0.07, 0.3]} p={[0.46, 0.42, 0]} r={[0, 0, -0.8]} c="#8fd3ff" /><T a={[0.2, 0.05]} p={[-0.45, 0.4, 0]} c="#8fd3ff" /><S p={[0, 0.8, 0]} s={0.09} c="#ff9ecb" /></>,
  candle: () => <><C a={[0.13, 0.15, 0.6]} p={[0, 0.3, 0]} c="#ffd3ec" /><S p={[0, 0.74, 0]} s={[0.07, 0.13, 0.07]} c="#ffc93a" o={{ em: 1 }} ns /></>,
  vase: () => <><C a={[0.18, 0.26, 0.5]} p={[0, 0.25, 0]} c="#b79bff" />{[-0.2, 0, 0.2].map((x, i) => <Flower key={i} p={[x, 0.45, 0]} s={0.9} c={['#ff8fc5', '#ffd257', '#ff7a8a'][i]} />)}</>,
  ball: c => <><S p={[0, 0.45, 0]} s={0.45} c={c ?? '#ff4f5e'} o={{ rough: 0.25 }} /><T a={[0.44, 0.05]} p={[0, 0.45, 0]} r={[1.57, 0.3, 0]} c="#fff" /></>,
  teddy: () => <Animal k="bear" s={0.75} />,
  car: c => <><B a={[1.1, 0.32, 0.6]} p={[0, 0.3, 0]} c={c ?? '#ff7fae'} rad={0.13} /><B a={[0.6, 0.32, 0.52]} p={[-0.05, 0.56, 0]} c="#c9efff" rad={0.13} />{[-0.32, 0.32].flatMap(x => [-0.3, 0.3].map(z => <C key={x + '' + z} a={[0.17, 0.17, 0.12]} r={[1.57, 0, 0]} p={[x, 0.17, z]} c="#5b4a5c" />))}<S p={[0.54, 0.34, 0.16]} s={0.07} c="#fff3a0" /></>,
  star: c => <Star3 p={[0, 0.5, 0]} s={0.5} c={c ?? '#ffd257'} o={{ em: 0.2, rough: 0.3 }} />,
  heart: c => <Heart3 p={[0, 0.5, 0]} s={0.45} c={c ?? '#ff5a8f'} o={{ rough: 0.25 }} />,
  crown: c => <Crown p={[0, 0.15, 0]} s={1.5} c={c ?? '#ffd257'} />,
  balloon: c => <><S p={[0, 0.75, 0]} s={[0.4, 0.46, 0.4]} c={c ?? '#ff7fae'} o={{ rough: 0.15 }} /><K a={[0.08, 0.1]} p={[0, 0.28, 0]} c={c ?? '#ff7fae'} /><C a={[0.012, 0.012, 0.5]} p={[0, 0, 0]} c="#fff" ns /></>,
  gift: c => <><B a={[0.8, 0.62, 0.8]} p={[0, 0.31, 0]} c={c ?? '#a78bfa'} rad={0.05} /><B a={[0.86, 0.16, 0.86]} p={[0, 0.66, 0]} c={c ?? '#a78bfa'} rad={0.05} /><B a={[0.16, 0.76, 0.9]} p={[0, 0.38, 0]} c="#ffd257" rad={0.03} /><B a={[0.9, 0.76, 0.16]} p={[0, 0.38, 0]} c="#ffd257" rad={0.03} /><Bow c="#ffd257" p={[0, 0.86, 0]} s={1.4} /></>,
  flower: c => <Flower s={1.2} c={c} />,
  butterfly: c => <group position={[0, 0.5, 0]} scale={1.2}><Butterfly c={c} /></group>,
  tree: () => <Tree s={0.42} />, house: () => <House s={0.42} />, mushroom: c => <Mushroom s={0.95} c={c} />,
  key: () => <group position={[0, 0.5, 0]} rotation={[0, 0, 0.6]}><T a={[0.2, 0.06]} p={[0, 0.25, 0]} c="#ffd257" o={{ metal: 0.5, rough: 0.25 }} /><C a={[0.05, 0.05, 0.6]} p={[0, -0.2, 0]} c="#ffd257" o={{ metal: 0.5, rough: 0.25 }} /><B a={[0.2, 0.07, 0.07]} p={[0.1, -0.4, 0]} c="#ffd257" /></group>,
  shell: c => <group position={[0, 0.35, 0]}>{[-2, -1, 0, 1, 2].map(i => <S key={i} p={[i * 0.13, 0.04 - Math.abs(i) * 0.05, 0]} s={[0.1, 0.36, 0.16]} r={[0, 0, -i * 0.3]} c={c ?? (i % 2 ? '#ffd3e0' : '#ff9ebb')} />)}<S p={[0, -0.28, 0]} s={[0.14, 0.09, 0.12]} c="#ff9ebb" /></group>,
  pearl: () => <S p={[0, 0.35, 0]} s={0.35} c="#fff6fb" o={{ rough: 0.08, metal: 0.25 }} />,
  starfish: c => <group position={[0, 0.5, 0]}><Star3 s={0.48} c={c ?? '#ffa05a'} />{[-0.1, 0.1].map(x => <S key={x} p={[x, 0.06, 0.14]} s={[0.04, 0.06, 0.03]} c="#3a2430" ns />)}</group>,
  coral: c => <>{[[-0.2, 0.5, 0.3], [0, 0.75, 0], [0.22, 0.55, -0.35]].map(([x, h, r], i) => <Cap key={i} a={[0.1, h]} p={[x, h / 2, 0]} r={[0, 0, r]} c={c ?? '#ff8f9f'} />)}</>,
  seaweed: () => <>{[-0.2, 0, 0.2].map((x, i) => <S key={i} p={[x, 0.45 + i * 0.08, 0]} s={[0.08, 0.5, 0.06]} r={[0, 0, x]} c="#5fc98a" />)}</>,
  chest: () => <><B a={[0.9, 0.5, 0.6]} p={[0, 0.25, 0]} c="#b97a4a" /><C a={[0.3, 0.3, 0.9]} r={[0, 0, 1.57]} p={[0, 0.5, 0]} c="#d0925a" /><B a={[0.14, 0.24, 0.1]} p={[0, 0.42, 0.31]} c="#ffd257" /></>,
  duckling: () => <Animal k="duck" s={0.75} baby />,
  moon: () => <group position={[0, 0.5, 0]} rotation={[0, 0, 0.5]}><T a={[0.36, 0.14]} arc={3.7} r={[0, 0, 1.2]} c="#ffe9a0" o={{ em: 0.4 }} /></group>,
  sun: () => <group position={[0, 0.5, 0]}><S s={0.32} c="#ffd24a" o={{ em: 0.4 }} />{Array.from({ length: 8 }, (_, i) => <S key={i} p={[Math.cos(i * 0.785) * 0.45, Math.sin(i * 0.785) * 0.45, 0]} s={0.09} c="#ffb52e" o={{ em: 0.3 }} />)}</group>,
  rocket: () => <group><Cap a={[0.24, 0.4]} p={[0, 0.55, 0]} c="#fff" /><K a={[0.23, 0.36]} p={[0, 1.02, 0]} c="#ff7fae" /><S p={[0, 0.62, 0.22]} s={[0.11, 0.11, 0.05]} c="#8fd3ff" o={{ em: 0.3 }} />{[0, 1, 2].map(i => <group key={i} rotation={[0, i * 2.09, 0]}><B a={[0.07, 0.34, 0.26]} p={[0, 0.26, 0.28]} c="#b79bff" /></group>)}</group>,
  hat: () => <group><C a={[0.5, 0.5, 0.06]} p={[0, 0.2, 0]} c="#8f6bff" /><K a={[0.32, 0.75]} p={[0, 0.56, 0]} c="#8f6bff" /></group>,
  shoe: () => <group><S p={[0, 0.16, 0.1]} s={[0.22, 0.16, 0.42]} c="#ff5a9c" /><C a={[0.17, 0.2, 0.34]} p={[0, 0.32, -0.16]} c="#ff5a9c" /></group>,
  pillow: c => <S p={[0, 0.3, 0]} s={[0.6, 0.26, 0.45]} c={c ?? '#b79bff'} />,
  cube: c => <B a={[0.75, 0.75, 0.75]} p={[0, 0.38, 0]} c={c ?? '#7fc4ff'} />,
  pyramid: c => <K a={[0.5, 0.85]} seg={4} p={[0, 0.43, 0]} c={c ?? '#ffb03a'} />,
  drum: () => <><C a={[0.42, 0.42, 0.5]} p={[0, 0.28, 0]} c="#ff7a8a" /><C a={[0.4, 0.4, 0.04]} p={[0, 0.55, 0]} c="#fff6ea" /></>,
  umbrella: () => <><Dome p={[0, 0.55, 0]} s={[0.5, 0.4, 0.5]} c="#ff8fc5" /><C a={[0.03, 0.03, 0.7]} p={[0, 0.3, 0]} c="#8a5a3a" /></>,
}
const ANIMALS = ['cat', 'dog', 'rabbit', 'turtle', 'parrot', 'cow', 'sheep', 'duck', 'hen', 'pig', 'frog', 'bear', 'fish', 'bird', 'bee', 'horse', 'alien']
export function Item({ k, c, p, r, s = 1, shadow }: { k: string; c?: string; p?: V3; r?: V3; s?: number; shadow?: boolean }) {
  const ref = useRef<THREE.Group>(null!)
  useEffect(() => {
    if (!shadow) return
    const m = mat('#7d6a9c', { rough: 1 })
    ref.current.traverse(o => { const q = o as THREE.Mesh; if (q.isMesh) q.material = m })
  }, [shadow, k])
  return <group ref={ref} position={p} rotation={r} scale={s}>{ANIMALS.includes(k) ? <Animal k={k as AKind} s={0.72} c={c} /> : (IT[k] ?? IT.star)(c)}</group>
}
