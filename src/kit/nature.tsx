import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { S, B, C, K, T, Dome, Disc, Cap, geo, mat, Star3, Orbit, type V3 } from './base'

export const Tree = ({ p, s = 1, c = '#8fdc9a' }: { p?: V3; s?: number; c?: string }) => <group position={p} scale={s}>
  <C a={[0.16, 0.24, 1.2]} p={[0, 0.6, 0]} c="#b98a63" /><S p={[0, 1.7, 0]} s={0.85} c={c} /><S p={[0.5, 1.4, 0.1]} s={0.5} c={c} /><S p={[-0.5, 1.45, 0.1]} s={0.52} c={c} /><S p={[0.1, 2.3, 0]} s={0.5} c={c} />
</group>
export const Pine = ({ p, s = 1, c = '#79c9a5' }: { p?: V3; s?: number; c?: string }) => <group position={p} scale={s}>
  <C a={[0.14, 0.18, 0.6]} p={[0, 0.3, 0]} c="#b98a63" /><K a={[0.9, 1.2]} p={[0, 1, 0]} c={c} /><K a={[0.7, 1]} p={[0, 1.6, 0]} c={c} /><K a={[0.48, 0.9]} p={[0, 2.2, 0]} c={c} />
</group>
export function Flower({ p, s = 1, c = '#ff8fc5', stem = true }: { p?: V3; s?: number; c?: string; stem?: boolean }) {
  return <group position={p} scale={s}>
    {stem && <><C a={[0.035, 0.05, 0.6]} p={[0, 0.3, 0]} c="#67b96c" /><S p={[0.14, 0.22, 0]} s={[0.15, 0.04, 0.08]} r={[0, 0, 0.5]} c="#7fd07f" /></>}
    <group position={[0, stem ? 0.65 : 0, 0]} rotation={[0.5, 0, 0]}>
      {[0, 1, 2, 3, 4, 5].map(i => <S key={i} p={[Math.cos(i * 1.047) * 0.19, Math.sin(i * 1.047) * 0.19, 0]} s={[0.14, 0.14, 0.07]} c={c} />)}
      <S s={[0.13, 0.13, 0.1]} p={[0, 0, 0.04]} c="#ffe27a" />
    </group>
  </group>
}
export const Cloud = ({ p, s = 1 }: { p?: V3; s?: number }) => <group position={p} scale={s}>
  <S s={0.7} c="#ffffff" o={{ rough: 1, em: 0.25 }} ns /><S p={[0.8, -0.1, 0]} s={0.5} c="#fff" o={{ rough: 1, em: 0.25 }} ns /><S p={[-0.8, -0.12, 0]} s={0.55} c="#fff" o={{ rough: 1, em: 0.25 }} ns /><S p={[0.3, 0.4, -0.1]} s={0.5} c="#fff" o={{ rough: 1, em: 0.25 }} ns />
</group>
export function Clouds({ n = 7, r = 22, y = 9 }: { n?: number; r?: number; y?: number }) {
  const ref = useRef<THREE.Group>(null!)
  useFrame((_, d) => { ref.current.rotation.y += d * 0.012 })
  return <group ref={ref}>{Array.from({ length: n }, (_, i) => <Cloud key={i} p={[Math.cos(i * 6.28 / n) * r, y + (i * 37 % 5), Math.sin(i * 6.28 / n) * r]} s={1.2 + (i * 13 % 4) * 0.4} />)}</group>
}
export function Butterfly({ c = '#b79bff', s = 1 }: { c?: string; s?: number }) {
  const l = useRef<THREE.Group>(null!), r = useRef<THREE.Group>(null!), o = useMemo(() => Math.random() * 6, [])
  useFrame(st => { const a = Math.sin(st.clock.elapsedTime * 11 + o) * 0.75; l.current.rotation.y = a; r.current.rotation.y = -a })
  const wing = (k: number) => <><S p={[0.2 * k, 0.12, 0]} s={[0.21, 0.19, 0.03]} c={c} ns /><S p={[0.15 * k, -0.13, 0]} s={[0.15, 0.14, 0.03]} c="#ffd3ec" ns /></>
  return <group scale={s}><Cap a={[0.04, 0.3]} c="#7a5680" ns /><S p={[0, 0.24, 0]} s={0.065} c="#7a5680" ns /><group ref={l}>{wing(-1)}</group><group ref={r}>{wing(1)}</group></group>
}
export const Butterflies = ({ n = 5, c = [0, 1.6, 0] as V3, rad = 4 }) => <>{Array.from({ length: n }, (_, i) => <Orbit key={i} c={[c[0], c[1] + (i % 3) * 0.5, c[2]]} rad={rad * (0.6 + (i % 4) * 0.2)} sp={(i % 2 ? 1 : -1) * (0.25 + i * 0.05)} ph={i * 2} y={0.5}><Butterfly c={['#b79bff', '#ff8fc5', '#ffd257', '#8fd3ff', '#ffb07a'][i % 5]} s={0.9} /></Orbit>)}</>
export const RAINBOW = ['#ff7a8a', '#ffb07a', '#ffe27a', '#8fe3a0', '#7fc4ff', '#8f9bff', '#c79bff']
export const Rainbow = ({ p, s = 1, r }: { p?: V3; s?: number; r?: V3 }) => <group position={p} scale={s} rotation={r}>{RAINBOW.map((c, i) => <T key={c} a={[3 - i * 0.22, 0.115]} arc={Math.PI} c={c} o={{ em: 0.25 }} ns />)}</group>

/** Пушистая трава и цветочки россыпью (инстансы) */
export function Meadow({ n = 90, rad = 9, hole = 0, c = '#7fd08a', flowers = true, center = [0, 0, 0] as V3, seed = 1 }) {
  const ref = useRef<THREE.InstancedMesh>(null!), fr = useRef<THREE.InstancedMesh>(null!)
  useEffect(() => {
    let a = seed * 9301 + 49297; const R = () => { a = (a * 9301 + 49297) % 233280; return a / 233280 }
    const o = new THREE.Object3D(), col = new THREE.Color()
    for (let i = 0; i < n; i++) {
      const q = Math.sqrt(R() * (1 - (hole / rad) ** 2) + (hole / rad) ** 2) * rad, t = R() * 6.28
      o.position.set(center[0] + Math.cos(t) * q, center[1] + 0.1, center[2] + Math.sin(t) * q); o.rotation.set(R() * 0.4 - 0.2, R() * 6, R() * 0.4 - 0.2); o.scale.setScalar(0.6 + R() * 0.9); o.updateMatrix(); ref.current.setMatrixAt(i, o.matrix)
      if (fr.current) { o.position.y = center[1] + 0.16; o.position.x += 0.25; o.rotation.set(0, 0, 0); o.scale.set(0.09, 0.07, 0.09); o.updateMatrix(); fr.current.setMatrixAt(i, o.matrix); fr.current.setColorAt(i, col.set(['#ff8fc5', '#ffe27a', '#ffffff', '#b79bff', '#ffb07a'][i % 5])) }
    }
    ref.current.instanceMatrix.needsUpdate = true
    if (fr.current) { fr.current.instanceMatrix.needsUpdate = true; fr.current.instanceColor!.needsUpdate = true }
  }, [])
  const g = geo('blade', () => new THREE.ConeGeometry(0.07, 0.3, 5))
  return <><instancedMesh ref={ref} args={[g, mat(c), n]} receiveShadow raycast={() => null} frustumCulled={false} dispose={null} />
    {flowers && <instancedMesh ref={fr} args={[geo('lowsph', () => new THREE.SphereGeometry(1, 12, 10)), mat('#fffffe'), n]} raycast={() => null} frustumCulled={false} dispose={null} />}</>
}
export const Island = ({ r = 9, c = '#a9e5a4', side = '#d9a57c', p }: { r?: number; c?: string; side?: string; p?: V3 }) => <group position={p}>
  <C a={[r, r * 0.97, 0.5]} p={[0, -0.25, 0]} c={c} o={{ rough: 0.9 }} seg={56} ns /><C a={[r * 0.97, r * 0.45, 3.2]} p={[0, -2.1, 0]} c={side} o={{ rough: 1 }} seg={40} ns />
</group>
export function Tower({ p, h = 2, r = 0.6, c = '#ffe3f2', roof = '#b79bff' }: { p?: V3; h?: number; r?: number; c?: string; roof?: string }) {
  const flag = useRef<THREE.Group>(null!)
  useFrame(st => { flag.current.rotation.y = Math.sin(st.clock.elapsedTime * 2) * 0.5 })
  return <group position={p}><C a={[r, r * 1.08, h]} p={[0, h / 2, 0]} c={c} /><T a={[r * 1.02, 0.09]} p={[0, h, 0]} r={[Math.PI / 2, 0, 0]} c="#fff" /><K a={[r * 1.3, r * 2.2]} p={[0, h + r * 1.1, 0]} c={roof} />
    <group ref={flag} position={[0, h + r * 2.4, 0]}><C a={[0.03, 0.03, 0.7]} c="#ffd257" /><B a={[0.4, 0.24, 0.04]} p={[0.22, 0.2, 0]} c="#ff7fae" /></group>
    <S p={[0, h * 0.62, r]} s={[r * 0.28, r * 0.4, 0.08]} c="#8fd3ff" o={{ em: 0.3 }} /></group>
}
export const Castle = ({ p, s = 1, r }: { p?: V3; s?: number; r?: V3 }) => <group position={p} scale={s} rotation={r}>
  <B a={[3.2, 1.8, 1.8]} p={[0, 0.9, 0]} c="#fff0f8" rad={0.12} /><Tower p={[-1.7, 0, 0.5]} h={2.4} roof="#ff9ecb" /><Tower p={[1.7, 0, 0.5]} h={2.4} roof="#ff9ecb" /><Tower p={[0, 1.2, -0.3]} h={2.6} r={0.75} roof="#b79bff" /><Tower p={[-0.95, 1.4, 0.2]} h={1.1} r={0.36} roof="#8fd3ff" /><Tower p={[0.95, 1.4, 0.2]} h={1.1} r={0.36} roof="#8fd3ff" />
  <C a={[0.5, 0.5, 0.16]} r={[Math.PI / 2, 0, 0]} p={[0, 0.75, 0.9]} c="#ffb07a" /><B a={[1, 0.8, 0.16]} p={[0, 0.4, 0.9]} c="#ffb07a" rad={0.03} /><S p={[0.3, 0.45, 1]} s={0.07} c="#ffd257" /><Star3 p={[0, 1.55, 0.95]} s={0.22} c="#ffd257" o={{ em: 0.3 }} />
</group>
export const House = ({ p, s = 1, c = '#ffe9d0', roof = '#ff9ecb', r }: { p?: V3; s?: number; c?: string; roof?: string; r?: V3 }) => <group position={p} scale={s} rotation={r}>
  <B a={[1.8, 1.3, 1.5]} p={[0, 0.65, 0]} c={c} rad={0.14} /><K a={[1.6, 1.2]} seg={4} r={[0, Math.PI / 4, 0]} p={[0, 1.85, 0]} c={roof} /><B a={[0.22, 0.6, 0.22]} p={[0.6, 2, 0]} c="#fff" /><B a={[0.5, 0.8, 0.1]} p={[0, 0.42, 0.75]} c="#b98a63" rad={0.2} /><S p={[0.14, 0.42, 0.82]} s={0.05} c="#ffd257" />
  <S p={[-0.55, 0.8, 0.75]} s={[0.22, 0.22, 0.06]} c="#9fdcff" o={{ em: 0.3 }} /><S p={[0.55, 0.8, 0.75]} s={[0.22, 0.22, 0.06]} c="#9fdcff" o={{ em: 0.3 }} />
  {[-0.55, 0.55].map(x => <S key={x} p={[x, 0.48, 0.82]} s={[0.28, 0.1, 0.12]} c="#8fdc9a" />)}
</group>
export const Mushroom = ({ p, s = 1, c = '#ff7a8a' }: { p?: V3; s?: number; c?: string }) => <group position={p} scale={s}><C a={[0.16, 0.22, 0.5]} p={[0, 0.25, 0]} c="#fff3e0" /><Dome p={[0, 0.45, 0]} s={[0.48, 0.38, 0.48]} c={c} />{[0, 1, 2, 3].map(i => <S key={i} p={[Math.cos(i * 1.57) * 0.28, 0.68, Math.sin(i * 1.57) * 0.28]} s={0.07} c="#fff" />)}</group>
/** Комната: пол, стены, окно */
export function Room({ wall = '#ffe1f0', floor = '#f4d2ae', w = 12, h = 6.5, d = 7, trim = '#fff' }) {
  return <group>
    <B a={[w, 0.3, d]} p={[0, -0.15, 0]} c={floor} rad={0.05} o={{ rough: 0.7 }} ns />
    {Array.from({ length: Math.floor(w / 1.2) }, (_, i) => <B key={i} a={[0.03, 0.02, d]} p={[-w / 2 + 0.6 + i * 1.2, 0.005, 0]} c="#e3bb92" ns rad={0.01} />)}
    <B a={[w, h, 0.3]} p={[0, h / 2, -d / 2]} c={wall} rad={0.02} o={{ rough: 0.9 }} ns /><B a={[0.3, h, d]} p={[-w / 2, h / 2, 0]} c={wall} rad={0.02} o={{ rough: 0.9 }} ns /><B a={[0.3, h, d]} p={[w / 2, h / 2, 0]} c={wall} rad={0.02} o={{ rough: 0.9 }} ns />
    <B a={[w, 0.35, 0.12]} p={[0, 0.17, -d / 2 + 0.2]} c={trim} ns />
    {/* за пределами комнаты — мягкий фон */}
    <B a={[70, 0.3, 40]} p={[0, -0.5, 0]} c={floor} o={{ rough: 1 }} ns /><B a={[70, 40, 0.3]} p={[0, 18, -d / 2 - 0.4]} c={wall} o={{ rough: 1 }} ns />
  </group>
}
export const Window3 = ({ p, s = 1, night }: { p?: V3; s?: number; night?: boolean }) => <group position={p} scale={s}>
  <B a={[1.9, 2.1, 0.15]} c="#fff" /><B a={[1.6, 1.8, 0.1]} p={[0, 0, 0.06]} c={night ? '#5a5fae' : '#a8dfff'} o={{ em: 0.5 }} /><B a={[0.1, 1.8, 0.1]} p={[0, 0, 0.1]} c="#fff" /><B a={[1.6, 0.1, 0.1]} p={[0, 0, 0.1]} c="#fff" />
  {night ? <S p={[0.4, 0.45, 0.14]} s={[0.2, 0.2, 0.03]} c="#fff3b0" o={{ em: 0.9 }} /> : <S p={[0.4, 0.45, 0.12]} s={[0.22, 0.22, 0.03]} c="#ffe27a" o={{ em: 0.6 }} />}
  <B a={[0.45, 2.3, 0.14]} p={[-1.05, -0.05, 0.16]} c="#ffb9dc" rad={0.07} /><B a={[0.45, 2.3, 0.14]} p={[1.05, -0.05, 0.16]} c="#ffb9dc" rad={0.07} /><B a={[2.7, 0.35, 0.2]} p={[0, 1.15, 0.16]} c="#ff9ecb" rad={0.1} />
</group>
export const Rug = ({ p = [0, 0.02, 0] as V3, r = 2.2, c = ['#ffd3ec', '#fff', '#c8b5ff'] }) => <>{c.map((x, i) => <Disc key={i} a={r * (1 - i * 0.28)} p={[p[0], p[1] + i * 0.008, p[2]]} c={x} o={{ rough: 1 }} />)}</>
export { Disc }
