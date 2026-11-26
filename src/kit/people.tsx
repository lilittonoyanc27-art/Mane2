import { useMemo, useRef, type ReactNode } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { S, B, C, K, T, Cap, Dome, Star3, Heart3, geo, mat, type V3 } from './base'
import { Flower } from './nature'
import type { Outfit } from '../core/store'

export type Mood = 'idle' | 'walk' | 'jump' | 'dance' | 'wave' | 'happy' | 'sleep' | 'spin' | 'sit' | 'fly'
export const DRESS: { c: string; c2: string; n: string }[] = [
  { c: '#ff8fc5', c2: '#fff', n: '🌸' }, { c: '#a78bfa', c2: '#ffe27a', n: '⭐' }, { c: '#7fc4ff', c2: '#fff', n: '🌊' }, { c: '#ffc861', c2: '#ff8fc5', n: '☀️' }, { c: '#8fdcb0', c2: '#fff', n: '🍀' }, { c: '#ff7a8a', c2: '#fff0a0', n: '🍓' },
  // волшебные платья-награды
  { c: '#ff6fb5', c2: '#ffd257', n: '💖' }, { c: '#8f6bff', c2: '#8fe3ff', n: '🔮' }, { c: '#ffd257', c2: '#fff', n: '👑' }, { c: '#56cfc0', c2: '#ffc2e2', n: '🧜' }, { c: '#ffffff', c2: '#ffb9dc', n: '🦢' },
]
export const HAIRC = ['#5b3a2c', '#8a4f2a', '#f1c25b', '#e0703d', '#ff9ecb', '#b79bff']
export const SHOES = ['#ff5a9c', '#8f6bff', '#ffd257', '#5ab8ff', '#ffffff', '#56cf8a']
export const BOWC = ['', '#ff5a9c', '#8f6bff', '#ffd257', '#5ab8ff', '#ff7a4a']

function Hair({ style, c }: { style: number; c: string }) {
  const m = { rough: 0.6 }
  return <group>
    {/* шапочка волос + чёлка */}
    <Dome p={[0, 0.06, -0.04]} s={[0.555, 0.53, 0.55]} r={[-0.28, 0, 0]} c={c} o={m} /><S p={[0, 0, -0.14]} s={[0.53, 0.5, 0.46]} c={c} o={m} />
    <S p={[-0.2, 0.36, 0.33]} s={[0.25, 0.14, 0.16]} r={[0.3, 0, 0.45]} c={c} o={m} /><S p={[0.2, 0.36, 0.33]} s={[0.25, 0.14, 0.16]} r={[0.3, 0, -0.45]} c={c} o={m} />
    {style === 0 && [-1, 1].map(k => <group key={k} position={[0.56 * k, 0.12, -0.06]}><S s={0.14} c={c} o={m} /><S p={[0.09 * k, -0.22, 0]} s={[0.16, 0.26, 0.16]} r={[0, 0, 0.25 * k]} c={c} o={m} /><S p={[0.12 * k, -0.46, 0]} s={[0.09, 0.14, 0.09]} c={c} o={m} /></group>)}
    {style === 1 && <><S p={[0, -0.34, -0.26]} s={[0.46, 0.62, 0.26]} c={c} o={m} />{[-1, 1].map(k => <S key={k} p={[0.44 * k, -0.32, -0.04]} s={[0.14, 0.48, 0.16]} c={c} o={m} />)}</>}
    {style === 2 && <><S p={[0, 0.62, -0.1]} s={0.25} c={c} o={m} /><T a={[0.16, 0.05]} p={[0, 0.48, -0.08]} r={[Math.PI / 2, 0, 0]} c="#ff8fc5" /></>}
    {style === 3 && <><S p={[0, 0.2, -0.52]} s={0.16} c={c} o={m} /><S p={[0, -0.12, -0.62]} s={[0.2, 0.4, 0.18]} r={[0.2, 0, 0]} c={c} o={m} /></>}
    {style === 4 && Array.from({ length: 9 }, (_, i) => { const a = -0.3 + i * (Math.PI + 0.6) / 8; return <S key={i} p={[Math.cos(a) * 0.5, -0.05 + Math.sin(a) * 0.46, -0.1]} s={0.18} c={c} o={m} /> })}
  </group>
}
export const Bow = ({ c, s = 1, p, r }: { c: string; s?: number; p?: V3; r?: V3 }) => <group position={p} scale={s} rotation={r}><S p={[-0.16, 0, 0]} s={[0.17, 0.13, 0.07]} r={[0, 0, 0.35]} c={c} /><S p={[0.16, 0, 0]} s={[0.17, 0.13, 0.07]} r={[0, 0, -0.35]} c={c} /><S s={0.075} c="#fff" /></group>
export const Crown = ({ c = '#ffd257', s = 1, p }: { c?: string; s?: number; p?: V3 }) => <group position={p} scale={s}><C a={[0.3, 0.27, 0.14]} c={c} o={{ metal: 0.5, rough: 0.25 }} />{[0, 1, 2, 3, 4, 5, 6].map(i => <group key={i} rotation={[0, i * 0.898, 0]}><K a={[0.09, 0.2]} seg={10} p={[0, 0.15, 0.27]} c={c} o={{ metal: 0.5, rough: 0.25 }} /><S p={[0, 0.27, 0.27]} s={0.045} c={['#ff6fae', '#7fc4ff', '#8fe3a0'][i % 3]} o={{ em: 0.4 }} /></group>)}</group>
function Hat({ k }: { k: number }) {
  if (k === 1) return <Crown p={[0, 0.5, 0]} />
  if (k === 2) return <group position={[0, 0.4, -0.04]} rotation={[-0.12, 0, 0]}><C a={[0.75, 0.75, 0.06]} c="#ffe0a3" /><Dome s={[0.42, 0.34, 0.42]} c="#ffe0a3" /><T a={[0.42, 0.05]} p={[0, 0.06, 0]} r={[Math.PI / 2, 0, 0]} c="#ff8fc5" /><Flower p={[0.34, 0.05, 0.26]} stem={false} s={0.6} /></group>
  if (k === 3) return <group position={[0, 0.38, -0.05]} rotation={[-0.1, 0, 0]}><C a={[0.62, 0.62, 0.05]} c="#8f6bff" /><K a={[0.4, 0.95]} p={[0, 0.48, 0]} c="#8f6bff" /><Star3 p={[0, 0.35, 0.33]} s={0.13} c="#ffd257" o={{ em: 0.4 }} /></group>
  if (k === 4) return <group position={[0, 0.5, 0]}>{[-0.24, 0.24].map(x => <group key={x} position={[x, 0.2, 0]} rotation={[0, 0, -x * 0.6]}><S s={[0.11, 0.32, 0.08]} c="#fff" /><S s={[0.06, 0.24, 0.05]} p={[0, 0, 0.05]} c="#ffb9dc" /></group>)}</group>
  if (k === 5) return <group position={[0, 0.2, 0]}>{[0, 1, 2, 3, 4, 5, 6, 7].map(i => <Flower key={i} p={[Math.cos(i * 0.785) * 0.5, 0.14, Math.sin(i * 0.785) * 0.5]} stem={false} s={0.55} c={['#ff8fc5', '#ffd257', '#b79bff', '#fff'][i % 4]} />)}</group>
  return null
}
function Face({ mood, skin = '#ffd9c2', iris = '#5b3a2c' }: { mood: Mood; skin?: string; iris?: string }) {
  const eyes = useRef<THREE.Group>(null!), o = useMemo(() => Math.random() * 4, [])
  useFrame(st => { const t = (st.clock.elapsedTime + o) % 3.4; eyes.current.scale.y = mood === 'sleep' ? 0.1 : t < 0.14 ? 0.12 : 1 })
  return <group>
    <S s={0.52} c={skin} />
    <group ref={eyes} position={[0, 0.02, 0.44]}>
      {[-0.19, 0.19].map(x => <group key={x} position={[x, 0, 0]}><S s={[0.098, 0.125, 0.06]} c="#fff" ns /><S p={[0, -0.005, 0.03]} s={[0.075, 0.1, 0.045]} c={iris} ns /><S p={[0, -0.01, 0.052]} s={[0.045, 0.062, 0.03]} c="#221522" ns /><S p={[0.03, 0.04, 0.076]} s={0.024} c="#fff" o={{ em: 0.6 }} ns /></group>)}
    </group>
    <S p={[-0.31, -0.14, 0.37]} s={[0.085, 0.06, 0.04]} c="#ffa9b5" ns /><S p={[0.31, -0.14, 0.37]} s={[0.085, 0.06, 0.04]} c="#ffa9b5" ns />
    <S p={[0, -0.07, 0.52]} s={0.035} c="#ffc4ad" ns />
    <T a={[0.1, 0.02]} arc={Math.PI} p={[0, -0.14, 0.475]} r={[0.25, 0, Math.PI]} c="#d9536f" ns />
    {(mood === 'happy' || mood === 'jump' || mood === 'dance') && <S p={[0, -0.19, 0.46]} s={[0.085, 0.06, 0.03]} c="#d9536f" ns />}
  </group>
}

export interface PersonProps { p?: V3; r?: V3; s?: number; mood?: Mood; outfit?: Partial<Outfit>; skin?: string; wings?: boolean; kind?: 'girl' | 'man' | 'lady' | 'boy'; hold?: ReactNode; facing?: number }
export const NOFIT: Outfit = { dress: 0, shoes: 0, hair: 0, hairColor: 0, hat: 0, bow: 1, jewel: 0 }
export function Person({ p, r, s = 1, mood = 'idle', outfit, skin = '#ffd9c2', wings, kind = 'girl', hold }: PersonProps) {
  const o = { ...NOFIT, ...outfit }, d = DRESS[o.dress % DRESS.length]
  const body = useRef<THREE.Group>(null!), la = useRef<THREE.Group>(null!), ra = useRef<THREE.Group>(null!), ll = useRef<THREE.Group>(null!), rl = useRef<THREE.Group>(null!), head = useRef<THREE.Group>(null!), w = useRef<THREE.Group>(null), t0 = useMemo(() => Math.random() * 5, [])
  useFrame((st, dt) => {
    const t = st.clock.elapsedTime + t0, k = 1 - Math.exp(-dt * 12)
    let y = 0, rz = 0, ry = 0, rx = 0, L = 0.35, R = 0.35, LL = 0, RL = 0, hz = Math.sin(t * 1.3) * 0.06, sy = 1 + Math.sin(t * 2.2) * 0.012
    if (mood === 'walk') { const a = Math.sin(t * 10); LL = a * 0.75; RL = -a * 0.75; y = Math.abs(Math.cos(t * 10)) * 0.08; rz = a * 0.05 }
    else if (mood === 'jump' || mood === 'happy') { const a = Math.abs(Math.sin(t * 5.5)); y = a * 0.45; L = 2.4 + a * 0.4; R = 2.4 + a * 0.4; sy = 0.95 + a * 0.08 }
    else if (mood === 'dance') { const a = Math.sin(t * 6); rz = a * 0.16; y = Math.abs(a) * 0.16; L = 1.5 + a; R = 1.5 - a; ry = Math.sin(t * 2) * 0.6; hz = -a * 0.2; LL = a * 0.3; RL = -a * 0.3 }
    else if (mood === 'wave') { R = 2.5 + Math.sin(t * 9) * 0.35; hz = 0.1 }
    else if (mood === 'spin') { ry = t * 3.2 % (Math.PI * 2); L = R = 1.2 }
    else if (mood === 'sit') { LL = RL = -1.45; y = -0.22 }
    else if (mood === 'sleep') { L = R = 0.2; sy = 1 + Math.sin(t * 1.5) * 0.02 }
    else if (mood === 'fly') { rx = 0.5; L = R = 1.8 + Math.sin(t * 3) * 0.2; LL = Math.sin(t * 4) * 0.2; RL = -LL; y = Math.sin(t * 2) * 0.1 }
    const b = body.current
    b.position.y += (y - b.position.y) * k; b.rotation.z += (rz - b.rotation.z) * k; b.rotation.x += (rx - b.rotation.x) * k; b.rotation.y = mood === 'spin' ? ry : b.rotation.y + (ry - b.rotation.y) * k; b.scale.y += (sy - b.scale.y) * k
    const sw = mood === 'walk' ? Math.sin(t * 10) * 0.7 : 0
    la.current.rotation.z += (-L - la.current.rotation.z) * k; ra.current.rotation.z += (R - ra.current.rotation.z) * k
    la.current.rotation.x += (-sw - la.current.rotation.x) * k; ra.current.rotation.x += (sw - ra.current.rotation.x) * k
    ll.current.rotation.x += (LL - ll.current.rotation.x) * k; rl.current.rotation.x += (RL - rl.current.rotation.x) * k
    head.current.rotation.z += (hz - head.current.rotation.z) * k
    if (w.current) w.current.children.forEach((c, i) => { c.rotation.y = (i ? -1 : 1) * (0.5 + Math.sin(t * 9) * 0.4) })
  })
  const man = kind === 'man', boy = kind === 'boy', sh = SHOES[o.shoes % SHOES.length], hc = HAIRC[o.hairColor % HAIRC.length]
  const top = man ? '#6fa8e8' : boy ? '#8fdc9a' : d.c
  return <group position={p} rotation={r} scale={s}>
    <group ref={body}>
      {[ll, rl].map((ref, i) => <group key={i} ref={ref} position={[(i ? 0.14 : -0.14), 0.46, 0]}><Cap a={[0.085, 0.24]} p={[0, -0.2, 0]} c={man || boy ? '#5d6fae' : skin} /><S p={[0, -0.38, 0.06]} s={[0.12, 0.09, 0.18]} c={sh} /></group>)}
      {man || boy ? <><Cap a={[0.27, 0.3]} p={[0, 0.78, 0]} c={top} /><B a={[0.5, 0.2, 0.42]} p={[0, 0.5, 0]} c="#5d6fae" rad={0.1} />{man && <Bow c="#ff7fae" s={0.5} p={[0, 1.02, 0.26]} />}</>
        : <>
          <C a={[0.2, 0.46, 0.55]} p={[0, 0.63, 0]} c={d.c} /><T a={[0.45, 0.055]} p={[0, 0.37, 0]} r={[Math.PI / 2, 0, 0]} c={d.c2} />
          <S p={[0, 0.92, 0]} s={[0.23, 0.2, 0.2]} c={d.c} /><T a={[0.2, 0.035]} p={[0, 0.84, 0]} r={[Math.PI / 2, 0, 0]} c={d.c2} />
          {[0, 1, 2, 3, 4, 5].map(i => <S key={i} p={[Math.sin(i * 1.05) * 0.4, 0.52, Math.cos(i * 1.05) * 0.4]} s={0.045} c={d.c2} />)}
          {o.dress >= 6 && [0, 1, 2, 3, 4, 5, 6].map(i => <Star3 key={i} p={[Math.sin(i * 0.9 + 0.4) * 0.35, 0.68, Math.cos(i * 0.9 + 0.4) * 0.35]} r={[0, i * 0.9 + 0.4, 0]} s={0.05} c="#fff3b0" o={{ em: 0.7 }} ns />)}
        </>}
      <group ref={la} position={[-0.22, 0.98, 0]}><S s={0.11} c={top} /><Cap a={[0.07, 0.28]} p={[0, -0.2, 0]} c={skin} /><S p={[0, -0.4, 0]} s={0.085} c={skin} /></group>
      <group ref={ra} position={[0.22, 0.98, 0]}><S s={0.11} c={top} /><Cap a={[0.07, 0.28]} p={[0, -0.2, 0]} c={skin} /><S p={[0, -0.4, 0]} s={0.085} c={skin} />{hold && <group position={[0, -0.5, 0.1]}>{hold}</group>}</group>
      {o.jewel === 1 && Array.from({ length: 9 }, (_, i) => <S key={i} p={[Math.sin(-0.9 + i * 0.22) * 0.2, 1.0 - Math.cos(-0.9 + i * 0.22) * 0.06, Math.cos(-0.9 + i * 0.22) * 0.22]} s={0.035} c="#fff" o={{ rough: 0.1, metal: 0.3 }} />)}
      {o.jewel === 2 && <Heart3 p={[0, 0.95, 0.24]} s={0.07} c="#ff5a9c" o={{ em: 0.4 }} />}
      <group ref={head} position={[0, 1.06, 0]}><group position={[0, 0.46, 0]}>
        <Face mood={mood} skin={skin} />
        {man || boy ? <><Dome p={[0, 0.1, -0.05]} s={[0.54, 0.47, 0.54]} r={[-0.35, 0, 0]} c={man ? '#3c2c26' : '#8a4f2a'} /><S p={[0, 0.4, 0.28]} s={[0.36, 0.13, 0.18]} c={man ? '#3c2c26' : '#8a4f2a'} />{[-0.52, 0.52].map(x => <S key={x} p={[x, -0.03, 0]} s={0.09} c={skin} />)}
          {man && <>{[-0.19, 0.19].map(x => <S key={x} p={[x, 0.17, 0.46]} s={[0.1, 0.022, 0.03]} c="#3c2c26" ns />)}{[-0.08, 0.08].map(x => <S key={x} p={[x, -0.115, 0.505]} s={[0.09, 0.03, 0.03]} r={[0, 0, x * -3]} c="#3c2c26" ns />)}</>}</>
          : <Hair style={o.hair} c={hc} />}
        {!man && !boy && o.bow > 0 && o.hat !== 2 && o.hat !== 3 && <Bow c={BOWC[o.bow % BOWC.length]} p={[0.28, 0.46, 0.18]} r={[0, 0.3, -0.45]} s={1.1} />}
        <Hat k={o.hat} />
        {o.jewel >= 1 && [-0.5, 0.5].map(x => o.jewel === 3 ? <Star3 key={x} p={[x, -0.22, 0.1]} s={0.07} c="#ffd257" o={{ em: 0.4 }} /> : <S key={x} p={[x, -0.2, 0.1]} s={0.05} c={o.jewel === 1 ? '#fff' : '#ff5a9c'} />)}
      </group></group>
      {wings && <group ref={w} position={[0, 1, -0.2]}>{[-1, 1].map(k => <group key={k}><S p={[0.36 * k, 0.2, -0.05]} s={[0.36, 0.3, 0.03]} r={[0, 0, 0.4 * k]} c="#e8d6ff" o={{ op: 0.75, rough: 0.1 }} /><S p={[0.28 * k, -0.18, -0.05]} s={[0.24, 0.2, 0.03]} c="#d3f0ff" o={{ op: 0.75, rough: 0.1 }} /></group>)}</group>}
    </group>
  </group>
}
export const Uncle = (q: PersonProps) => <Person kind="man" {...q} s={(q.s ?? 1) * 1.18} outfit={{ shoes: 1, jewel: 0, bow: 0 }} />
export const Fairy = (q: PersonProps) => <Person wings outfit={{ dress: 9, hair: 1, hairColor: 2, hat: 5, bow: 0, shoes: 2 }} {...q} />
export const Princess = (q: PersonProps) => <Person outfit={{ dress: 6, hair: 1, hairColor: 3, hat: 1, bow: 0, shoes: 2, jewel: 1 }} {...q} />
export const Granny = (q: PersonProps) => <Person kind="lady" outfit={{ dress: 1, hair: 2, hairColor: 5, bow: 0, shoes: 1, jewel: 1 }} {...q} />
void geo; void mat
