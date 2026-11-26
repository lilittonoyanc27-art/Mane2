import { useMemo, useRef, type ReactNode } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { S, B, C, K, T, Dome, Cap, type V3 } from './base'
import { Bow, Crown } from './people'

export type AKind = 'cat' | 'dog' | 'rabbit' | 'turtle' | 'parrot' | 'cow' | 'sheep' | 'duck' | 'hen' | 'pig' | 'frog' | 'bear' | 'fish' | 'bird' | 'bee' | 'horse' | 'alien'
export type AMood = 'idle' | 'happy' | 'eat' | 'sleep' | 'walk' | 'dance' | 'tickle' | 'swim'
interface Def { b: string; b2: string; ear?: 'tri' | 'flop' | 'long' | 'round' | 'side'; snout?: string; tail?: 'curl' | 'stub' | 'puff' | 'long'; legs?: boolean; beak?: string; wing?: boolean; horn?: boolean; mane?: string; wool?: boolean }
const DEF: Record<Exclude<AKind, 'turtle' | 'fish' | 'bee' | 'alien'>, Def> = {
  cat: { b: '#ffc27a', b2: '#fff3e0', ear: 'tri', tail: 'curl', legs: true }, dog: { b: '#d9a777', b2: '#fff0dc', ear: 'flop', tail: 'curl', legs: true }, rabbit: { b: '#fdfbff', b2: '#ffd3e6', ear: 'long', tail: 'puff', legs: true },
  parrot: { b: '#5fd08a', b2: '#ffe27a', beak: '#ff9a4a', wing: true }, cow: { b: '#fff', b2: '#ffc4cf', ear: 'side', snout: '#ffc4cf', horn: true, legs: true, tail: 'long' }, sheep: { b: '#fff8f2', b2: '#ffe0cc', ear: 'side', wool: true, legs: true, tail: 'puff' },
  duck: { b: '#ffe06a', b2: '#fff3b0', beak: '#ff9a4a', wing: true }, hen: { b: '#fff6ec', b2: '#ffe0cc', beak: '#ffb03a', wing: true }, pig: { b: '#ffb9cc', b2: '#ff9ebb', ear: 'tri', snout: '#ff8fb0', tail: 'curl', legs: true },
  frog: { b: '#8fdc7a', b2: '#e0ffc8', legs: true }, bear: { b: '#c98f5e', b2: '#f3d7b5', ear: 'round', snout: '#f3d7b5', tail: 'stub', legs: true }, bird: { b: '#7fc4ff', b2: '#fff', beak: '#ffb03a', wing: true }, horse: { b: '#d9a777', b2: '#f3d7b5', ear: 'tri', snout: '#f3d7b5', mane: '#8a4f2a', legs: true, tail: 'long' },
}
function Eyes({ z = 0.42, y = 0.08, x = 0.17, s = 1, mood = 'idle' as AMood }) {
  const ref = useRef<THREE.Group>(null!), o = useMemo(() => Math.random() * 4, [])
  useFrame(st => { const t = (st.clock.elapsedTime + o) % 3.1; ref.current.scale.y = mood === 'sleep' ? 0.12 : mood === 'tickle' ? 0.3 : t < 0.13 ? 0.15 : 1 })
  return <group ref={ref} position={[0, y, z]}>{[-x, x].map(k => <group key={k} position={[k, 0, 0]} scale={s}><S s={[0.08, 0.1, 0.05]} c="#3a2430" ns /><S p={[0.025, 0.035, 0.035]} s={0.03} c="#fff" o={{ em: 0.5 }} ns /><S p={[-0.02, -0.04, 0.035]} s={0.015} c="#fff" o={{ em: 0.4 }} ns /></group>)}</group>
}
function Wear({ k, bear }: { k: number; bear?: boolean }) {
  void bear
  if (k === 1) return <Bow c="#ff5a9c" p={[0, 0.5, 0.15]} s={1.2} />
  if (k === 2) return <Crown p={[0, 0.52, 0]} s={0.85} />
  if (k === 3) return <group position={[0, 0.46, 0]}><K a={[0.26, 0.6]} p={[0, 0.25, 0]} c="#8f6bff" /><S p={[0, 0.56, 0]} s={0.08} c="#ffd257" /></group>
  if (k === 4) return <group position={[0, -0.36, 0.1]}><T a={[0.36, 0.09]} r={[1.4, 0, 0]} c="#ff7a8a" /><Cap a={[0.08, 0.3]} p={[0.16, -0.22, 0.34]} r={[0.2, 0, 0.15]} c="#ff7a8a" /></group>
  if (k === 5) return <group position={[0, 0.08, 0.46]}>{[-0.17, 0.17].map(x => <T key={x} a={[0.13, 0.025]} p={[x, 0, 0.02]} c="#ff5a9c" />)}<B a={[0.1, 0.03, 0.03]} p={[0, 0, 0.04]} c="#ff5a9c" rad={0.01} /></group>
  return null
}
export interface AnimalProps { k: AKind; p?: V3; r?: V3; s?: number; mood?: AMood; wear?: number; c?: string; baby?: boolean; children?: ReactNode }
export function Animal({ k, p, r, s = 1, mood = 'idle', wear = 0, c, baby, children }: AnimalProps) {
  const body = useRef<THREE.Group>(null!), head = useRef<THREE.Group>(null!), tail = useRef<THREE.Group>(null), wl = useRef<THREE.Group>(null), wr = useRef<THREE.Group>(null), t0 = useMemo(() => Math.random() * 6, [])
  useFrame((st, dt) => {
    const t = st.clock.elapsedTime + t0, q = 1 - Math.exp(-dt * 10)
    let y = 0, rz = 0, hx = 0, hz = Math.sin(t * 1.4) * 0.07, sy = 1 + Math.sin(t * 2.6) * 0.02, rx = 0, ry = 0, tw = Math.sin(t * 3) * 0.3
    if (mood === 'happy') { const a = Math.abs(Math.sin(t * 6)); y = a * 0.4; sy = 0.93 + a * 0.12; hz = Math.sin(t * 6) * 0.15; tw = Math.sin(t * 18) * 0.7 }
    else if (mood === 'eat') { hx = 0.35 + Math.sin(t * 12) * 0.14; tw = Math.sin(t * 10) * 0.5 }
    else if (mood === 'sleep') { hx = 0.3; hz = 0.25; sy = 0.9 + Math.sin(t * 1.4) * 0.035; tw = 0 }
    else if (mood === 'walk') { rz = Math.sin(t * 10) * 0.07; y = Math.abs(Math.sin(t * 10)) * 0.08 }
    else if (mood === 'dance') { const a = Math.sin(t * 6); rz = a * 0.2; y = Math.abs(a) * 0.2; ry = Math.sin(t * 2) * 0.7; hz = -a * 0.25; tw = a }
    else if (mood === 'tickle') { rz = Math.sin(t * 30) * 0.12; y = Math.abs(Math.sin(t * 14)) * 0.1; hx = -0.2; tw = Math.sin(t * 25) * 0.6 }
    const b = body.current
    b.position.y += (y - b.position.y) * q; b.rotation.z += (rz - b.rotation.z) * q; b.rotation.x += (rx - b.rotation.x) * q; b.rotation.y += (ry - b.rotation.y) * q; b.scale.y += (sy - b.scale.y) * q
    if (head.current) { head.current.rotation.x += (hx - head.current.rotation.x) * q; head.current.rotation.z += (hz - head.current.rotation.z) * q }
    if (tail.current) tail.current.rotation.y = tw
    const f = mood === 'happy' || mood === 'dance' ? Math.sin(t * 16) * 0.7 + 0.6 : k === 'bee' || k === 'bird' && mood === 'walk' ? Math.sin(t * 40) * 0.6 + 0.4 : Math.sin(t * 2) * 0.06
    if (wl.current) wl.current.rotation.z = -f; if (wr.current) wr.current.rotation.z = f
  })
  const big = baby ? 1.18 : 1
  let inner: ReactNode
  if (k === 'fish') inner = <><S s={[0.3, 0.36, 0.5]} p={[0, 0.5, 0]} c={c ?? '#ff9a5a'} /><group ref={tail} position={[0, 0.5, -0.45]}><S p={[0, 0.15, -0.2]} s={[0.05, 0.2, 0.2]} c="#ffd257" /><S p={[0, -0.15, -0.2]} s={[0.05, 0.2, 0.2]} c="#ffd257" /></group><S p={[0, 0.85, -0.05]} s={[0.05, 0.2, 0.25]} c="#ffd257" /><T a={[0.31, 0.05]} p={[0, 0.5, 0.08]} c="#fff" /><group position={[0, 0.5, 0]}><Eyes z={0.36} x={0.2} y={0.1} mood={mood} /></group></>
  else if (k === 'bee') inner = <><S s={[0.34, 0.32, 0.42]} p={[0, 0.5, 0]} c="#ffd95a" />{[-0.18, 0.06].map(z => <T key={z} a={[0.31, 0.06]} p={[0, 0.5, z]} c="#5b4030" />)}<group ref={head} position={[0, 0.55, 0.4]}><S s={0.28} c="#ffd95a" /><group position={[0, 0, -0.16]}><Eyes x={0.13} mood={mood} /></group>{[-0.1, 0.1].map(x => <S key={x} p={[x, 0.32, 0]} s={0.05} c="#5b4030" />)}</group><group ref={wl} position={[-0.12, 0.76, 0]}><S p={[-0.26, 0.06, 0]} s={[0.28, 0.04, 0.18]} c="#e6f6ff" o={{ op: 0.8 }} /></group><group ref={wr} position={[0.12, 0.76, 0]}><S p={[0.26, 0.06, 0]} s={[0.28, 0.04, 0.18]} c="#e6f6ff" o={{ op: 0.8 }} /></group></>
  else if (k === 'turtle') inner = <><Dome p={[0, 0.2, -0.1]} s={[0.62, 0.55, 0.68]} c={c ?? '#6fbf86'} />{[[0, 0.72, -0.1], [0.3, 0.55, 0.15], [-0.3, 0.55, 0.15], [0.3, 0.55, -0.38], [-0.3, 0.55, -0.38]].map((q, i) => <S key={i} p={q as V3} s={[0.16, 0.06, 0.16]} c="#a5e0a8" />)}<T a={[0.6, 0.09]} p={[0, 0.2, -0.1]} r={[Math.PI / 2, 0, 0]} s={[1, 1.1, 1]} c="#e8d79a" />
    {[[-0.45, 0.35], [0.45, 0.35], [-0.45, -0.5], [0.45, -0.5]].map(([x, z], i) => <S key={i} p={[x, 0.1, z]} s={[0.16, 0.13, 0.2]} c="#b7e39a" />)}<group ref={head} position={[0, 0.42, 0.75]}><S s={[0.36, 0.34, 0.34]} c="#b7e39a" /><group position={[0, 0, -0.12]}><Eyes x={0.15} z={0.43} mood={mood} /></group><T a={[0.09, 0.02]} arc={Math.PI} p={[0, -0.08, 0.31]} r={[0.2, 0, Math.PI]} c="#4c8a4a" ns /><group position={[0, -0.12, -0.12]} scale={0.8}><Wear k={wear} /></group></group><group ref={tail} position={[0, 0.2, -0.8]}><S s={[0.08, 0.06, 0.16]} c="#b7e39a" /></group></>
  else if (k === 'alien') inner = <><S s={[0.45, 0.5, 0.4]} p={[0, 0.5, 0]} c={c ?? '#8fe3b0'} /><S s={[0.28, 0.3, 0.1]} p={[0, 0.42, 0.34]} c="#f2fff2" /><group ref={head} position={[0, 1.15, 0]}><S s={[0.55, 0.46, 0.48]} c={c ?? '#8fe3b0'} /><Eyes s={1.5} x={0.2} z={0.44} mood={mood} /><T a={[0.11, 0.025]} arc={Math.PI} p={[0, -0.14, 0.44]} r={[0.2, 0, Math.PI]} c="#5b3a5c" ns />{[-0.22, 0.22].map(x => <group key={x} position={[x, 0.42, 0]} rotation={[0, 0, -x]}><C a={[0.03, 0.03, 0.3]} p={[0, 0.12, 0]} c={c ?? '#8fe3b0'} /><S p={[0, 0.32, 0]} s={0.09} c="#ffd257" o={{ em: 0.6 }} /></group>)}{[-0.36, 0.36].map(x => <S key={x} p={[x, -0.08, 0.36]} s={[0.08, 0.06, 0.04]} c="#ffa9c5" ns />)}</group><group ref={wl} position={[-0.4, 0.6, 0]}><Cap a={[0.08, 0.2]} p={[-0.1, -0.12, 0]} c={c ?? '#8fe3b0'} /></group><group ref={wr} position={[0.4, 0.6, 0]}><Cap a={[0.08, 0.2]} p={[0.1, -0.12, 0]} c={c ?? '#8fe3b0'} /></group>{[-0.18, 0.18].map(x => <S key={x} p={[x, 0.06, 0.08]} s={[0.15, 0.1, 0.2]} c={c ?? '#8fe3b0'} />)}</>
  else {
    const d = DEF[k], b = c ?? d.b
    const cute = k === 'frog'
    inner = <>
      <S p={[0, 0.42, 0]} s={d.beak ? [0.4, 0.42, 0.44] : [0.42, 0.42, 0.4]} c={b} /><S p={[0, 0.36, 0.2]} s={[0.28, 0.3, 0.22]} c={d.b2} />
      {d.wool && Array.from({ length: 9 }, (_, i) => <S key={i} p={[Math.cos(i * 0.7) * 0.36, 0.45 + (i % 3) * 0.12, Math.sin(i * 0.7) * 0.34 - 0.04]} s={0.19} c={b} />)}
      {k === 'cow' && <><S p={[0.28, 0.55, 0.12]} s={[0.16, 0.2, 0.2]} c="#6b5560" /><S p={[-0.26, 0.4, -0.2]} s={[0.2, 0.2, 0.2]} c="#6b5560" /></>}
      {d.legs ? [[-0.2, 0.28], [0.2, 0.28]].map(([x, z], i) => <S key={i} p={[x, 0.08, z]} s={[0.15, 0.11, 0.2]} c={b} />) : [-0.15, 0.15].map(x => <S key={x} p={[x, 0.03, 0.12]} s={[0.12, 0.04, 0.16]} c="#ff9a4a" />)}
      {d.legs && [-0.34, 0.34].map(x => <S key={x} p={[x, 0.45, 0.2]} s={[0.1, 0.17, 0.12]} r={[0.6, 0, x * -1.2]} c={b} />)}
      {d.wing && <><group ref={wl} position={[-0.36, 0.55, 0]}><S p={[-0.08, -0.14, -0.04]} s={[0.1, 0.26, 0.24]} c={k === 'parrot' ? '#4aa8ff' : b} /></group><group ref={wr} position={[0.36, 0.55, 0]}><S p={[0.08, -0.14, -0.04]} s={[0.1, 0.26, 0.24]} c={k === 'parrot' ? '#4aa8ff' : b} /></group></>}
      <group ref={tail} position={[0, 0.32, -0.38]}>
        {d.tail === 'puff' && <S s={0.14} c="#fff" />}{d.tail === 'stub' && <S s={0.1} c={b} />}{d.tail === 'curl' && <><Cap a={[0.065, 0.3]} p={[0.05, 0.16, -0.14]} r={[-0.6, 0, -0.2]} c={b} /><S p={[0.1, 0.36, -0.26]} s={0.09} c={d.b2} /></>}{d.tail === 'long' && <><Cap a={[0.04, 0.3]} p={[0, -0.02, -0.1]} r={[0.5, 0, 0]} c={b} /><S p={[0, -0.2, -0.2]} s={0.09} c={d.mane ?? '#6b5560'} /></>}{d.beak && <>{[0, 1, 2].map(i => <S key={i} p={[(i - 1) * 0.1, 0.04, -0.14]} s={[0.07, 0.08, 0.22]} r={[0.4, (i - 1) * -0.3, 0]} c={k === 'parrot' ? ['#ff7a8a', '#ffd257', '#4aa8ff'][i] : b} />)}</>}
      </group>
      <group ref={head} position={[0, 0.85, 0.08]}><group position={[0, 0.2, 0]} scale={big}>
        <S s={cute ? [0.54, 0.42, 0.46] : [0.47, 0.44, 0.44]} c={b} />
        {cute ? [-0.26, 0.26].map(x => <group key={x} position={[x, 0.36, 0.16]}><S s={0.19} c={b} /><S p={[0, 0.02, 0.1]} s={[0.12, mood === 'sleep' ? 0.02 : 0.13, 0.1]} c="#fff" ns /><S p={[0, 0.02, 0.17]} s={[0.07, mood === 'sleep' ? 0.02 : 0.09, 0.05]} c="#3a2430" ns /></group>) : <Eyes mood={mood} z={0.4} />}
        {!d.beak && !d.snout && !cute && <><S p={[0, -0.1, 0.38]} s={[0.2, 0.13, 0.1]} c={d.b2} /><S p={[0, -0.04, 0.48]} s={[0.06, 0.045, 0.04]} c={k === 'dog' ? '#4a3038' : '#ff8fa5'} ns /></>}
        {d.snout && <><S p={[0, -0.12, 0.4]} s={[0.23, 0.16, 0.14]} c={d.snout} />{k === 'bear' ? <S p={[0, -0.05, 0.53]} s={[0.08, 0.055, 0.04]} c="#4a3038" ns /> : [-0.08, 0.08].map(x => <S key={x} p={[x, -0.11, 0.53]} s={[0.035, 0.05, 0.02]} c="#b5607a" ns />)}</>}
        {d.beak && <K a={[0.13, 0.26]} p={[0, -0.06, 0.5]} r={[k === 'parrot' ? 2.1 : 1.57, 0, 0]} s={k === 'duck' ? [1.5, 1, 0.6] : 1} c={d.beak} />}
        {!d.beak && <T a={[0.07, 0.016]} arc={Math.PI} p={[0, d.snout ? -0.2 : -0.13, d.snout ? 0.5 : cute ? 0.44 : 0.46]} r={[0.3, 0, Math.PI]} s={cute ? 2 : 1} c="#8a4a58" ns />}
        {[-0.3, 0.3].map(x => <S key={x} p={[x, -0.12, 0.32]} s={[0.075, 0.05, 0.04]} c="#ffa9b5" ns />)}
        {d.ear === 'tri' && [-0.27, 0.27].map(x => <group key={x} position={[x, 0.38, 0]} rotation={[0, 0, -x * 1.2]}><K a={[0.16, 0.3]} c={b} /><K a={[0.09, 0.19]} p={[0, -0.02, 0.08]} c="#ffb9c9" /></group>)}
        {d.ear === 'flop' && [-0.42, 0.42].map(x => <S key={x} p={[x, 0.08, -0.02]} s={[0.12, 0.3, 0.18]} r={[0, 0, x * 0.9]} c="#a8754a" />)}
        {d.ear === 'long' && [-0.17, 0.17].map(x => <group key={x} position={[x, 0.62, -0.04]} rotation={[0, 0, -x * 1.1]}><S s={[0.11, 0.34, 0.08]} c={b} /><S s={[0.06, 0.26, 0.05]} p={[0, 0, 0.05]} c="#ffb9d4" /></group>)}
        {d.ear === 'round' && [-0.32, 0.32].map(x => <group key={x} position={[x, 0.34, 0]}><S s={[0.16, 0.16, 0.1]} c={b} /><S s={[0.09, 0.09, 0.05]} p={[0, 0, 0.08]} c="#f3d7b5" /></group>)}
        {d.ear === 'side' && [-0.46, 0.46].map(x => <S key={x} p={[x, 0.12, -0.04]} s={[0.17, 0.08, 0.08]} r={[0, 0, -x * 0.7]} c={d.wool ? '#ffe0cc' : b} />)}
        {d.horn && [-0.18, 0.18].map(x => <K key={x} a={[0.07, 0.2]} p={[x, 0.46, 0]} r={[0, 0, -x * 1.4]} c="#fff0c4" />)}
        {d.wool && Array.from({ length: 5 }, (_, i) => <S key={i} p={[(i - 2) * 0.15, 0.38 - Math.abs(i - 2) * 0.04, 0.08]} s={0.15} c="#fff" />)}
        {d.mane && Array.from({ length: 4 }, (_, i) => <S key={i} p={[0, 0.42 - i * 0.2, -0.08 - i * 0.11]} s={[0.14, 0.18, 0.18]} c={d.mane!} />)}
        {k === 'hen' && [0, 1, 2].map(i => <S key={i} p={[0, 0.46, 0.14 - i * 0.14]} s={0.09} c="#ff5a6a" />)}
        {(k === 'parrot' || k === 'bird') && [0, 1, 2].map(i => <S key={i} p={[0, 0.5, 0.06 - i * 0.1]} s={[0.05, 0.17, 0.07]} r={[-0.4 - i * 0.3, 0, 0]} c={['#ff7a8a', '#ffd257', '#4aa8ff'][i]} />)}
        {(k === 'cat') && [-1, 1].flatMap(x => [0, 1].map(i => <C key={x + '' + i} a={[0.008, 0.008, 0.26]} p={[x * 0.34, -0.08 - i * 0.06, 0.38]} r={[0, 0, 1.57 + x * (i ? 0.2 : -0.1)]} c="#fff" ns />))}
        <Wear k={wear} />
      </group></group>
    </>
  }
  return <group position={p} rotation={r} scale={s}><group ref={body}>{inner}{children}</group></group>
}
