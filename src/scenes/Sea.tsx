import { memo, useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Stage, Tap, Float, S, B, C, T, K, Cap, Dome, burst, shower, useLater, useOnce, geo, mat, type V3 } from '../kit/base'
import { Person } from '../kit/people'
import { Animal } from '../kit/animals'
import { Item } from '../kit/items'
import { Flyer, TapPlane, newFly, type FlyRef } from '../kit/world'
import { say, task, praise } from '../core/voice'
import { sfx, animal } from '../core/audio'
import { star, win, useSave } from '../core/store'
import { Joy, Back, Tray } from '../ui/HUD'

const FC = ['#ff9a5a', '#ff7fae', '#ffd257', '#7fc4ff', '#b79bff', '#8fe3b0']
const COL: { k: string; x: number; y: number }[] = [['shell', -6, -2.4], ['pearl', -2, -2.6], ['starfish', 3, -2.5], ['shell', 8, -2.4], ['pearl', 12, -2.5], ['starfish', -12, -2.5], ['shell', -16, -2.4], ['pearl', 17, -2.6], ['shell', -9, 2], ['pearl', 6, 4], ['starfish', 14, 3], ['pearl', -15, 5]].map(([k, x, y]) => ({ k: k as string, x: x as number, y: y as number }))
const CH = [-10, 1, 15]
interface Food { x: number; y: number; t: number }
function Fish({ i, food }: { i: number; food: React.MutableRefObject<Food[]> }) {
  const g = useRef<THREE.Group>(null!), s = useRef({ x: -18 + (i * 7.3) % 36, y: -1 + (i * 3.1) % 7, z: -2.4 + (i % 4) * 0.9, vx: i % 2 ? 1 : -1, vy: 0, joy: 0 })
  useFrame((st, d0) => {
    const d = Math.min(d0, 0.05), q = s.current, t = st.clock.elapsedTime
    let tx = q.vx > 0 ? 1.1 : -1.1, ty = Math.sin(t + i) * 0.3; if (q.x > 20) tx = -1.1; if (q.x < -20) tx = 1.1
    let best: Food | null = null, bd = 9; for (const f of food.current) { const l = Math.hypot(f.x - q.x, f.y - q.y); if (l < bd) { bd = l; best = f } }
    if (best) { tx = (best.x - q.x) / bd * 4; ty = (best.y - q.y) / bd * 4; if (bd < 0.5) { food.current.splice(food.current.indexOf(best), 1); q.joy = 1.4; burst([q.x, q.y + 0.6, q.z + 0.4], 'heart', 8, 0.5); sfx('bubble') } }
    q.joy = Math.max(0, q.joy - d); q.vx += (tx - q.vx) * d * 2; q.vy += (ty - q.vy) * d * 2; q.x += q.vx * d; q.y = Math.max(-2.6, Math.min(7, q.y + q.vy * d))
    g.current.position.set(q.x, q.y + (q.joy ? Math.sin(t * 16) * 0.2 : 0), q.z); g.current.rotation.y = q.vx > 0 ? 1.35 : -1.35; g.current.rotation.z = q.joy ? Math.sin(t * 14) * 0.4 : 0
  })
  return <group ref={g}><Tap on={() => { animal('fish'); s.current.joy = 1.2 }} snd={null} fx="bubble" hit={0.8} hitP={[0, 0.4, 0]}><Animal k="fish" c={FC[i % 6]} s={0.8 + (i % 3) * 0.2} /></Tap></group>
}
function FoodDots({ food }: { food: React.MutableRefObject<Food[]> }) {
  const r = useRef<THREE.InstancedMesh>(null!), o = useMemo(() => new THREE.Object3D(), [])
  useFrame((_, d) => { for (let i = 0; i < 40; i++) { const f = food.current[i]; if (f) { f.y = Math.max(-2.6, f.y - d * 0.5); f.t += d; o.position.set(f.x, f.y, 0); o.scale.setScalar(0.12) } else o.scale.setScalar(0); o.updateMatrix(); r.current.setMatrixAt(i, o.matrix) } r.current.instanceMatrix.needsUpdate = true; food.current = food.current.filter(f => f.t < 14) })
  return <instancedMesh ref={r} args={[geo('lowsph', () => new THREE.SphereGeometry(1, 12, 10)), mat('#ffb04a', { em: 0.3 }), 40]} frustumCulled={false} raycast={() => null} dispose={null} />
}
const Reef = memo(function Reef() {
  const g = useRef<THREE.Group>(null!)
  useFrame(s => g.current.children.forEach((c, i) => { c.rotation.z = Math.sin(s.clock.elapsedTime + i) * 0.12 }))
  return <><B a={[70, 1, 16]} p={[0, -3.6, -3]} c="#ffe6b8" o={{ rough: 1 }} ns />{Array.from({ length: 12 }, (_, i) => <S key={i} p={[-24 + i * 4.4, -3.4, -6 + (i % 3)]} s={[3, 0.9 + (i % 4) * 0.5, 2]} c="#ffdca0" ns />)}
    <group ref={g}>{Array.from({ length: 16 }, (_, i) => <group key={i} position={[-22 + i * 2.9, -3.1, -3 - (i % 3)]}><Item k={i % 2 ? 'seaweed' : 'coral'} s={1.6 + (i % 3) * 0.7} c={i % 2 ? undefined : ['#ff8f9f', '#b79bff', '#ffb07a'][i % 3]} /></group>)}</group>
    {Array.from({ length: 6 }, (_, i) => <mesh key={i} position={[-18 + i * 7, 5, -7]} rotation={[0, 0, 0.25]} geometry={geo('ray', () => new THREE.PlaneGeometry(1.6, 18))} material={mat('#ffffff', { op: 0.09, em: 0.6, side: true })} raycast={() => null} dispose={null} />)}
    <group position={[6, -3.1, -5]}><C a={[1.5, 1.7, 2.6]} p={[0, 1.3, 0]} c="#ffd3ec" /><K a={[1.9, 1.8]} p={[0, 3.4, 0]} c="#ff9ecb" /><C a={[0.8, 0.9, 1.8]} p={[-2.2, 0.9, 0]} c="#e6dcff" /><K a={[1.1, 1.2]} p={[-2.2, 2.4, 0]} c="#b79bff" /><S p={[0, 1.2, 1.45]} s={[0.5, 0.7, 0.15]} c="#ffb07a" /></group></>
})
function Chest({ x, open, on }: { x: number; open: boolean; on: () => void }) {
  const lid = useRef<THREE.Group>(null!)
  useFrame((_, d) => { lid.current.rotation.x += ((open ? -1.6 : 0) - lid.current.rotation.x) * Math.min(1, d * 4) })
  return <Tap p={[x, -3.1, -0.6]} on={on} hit={1.1} hitP={[0, 0.6, 0]} glow={!open} s={1.5}><B a={[1, 0.55, 0.7]} p={[0, 0.28, 0]} c="#b97a4a" /><group ref={lid} position={[0, 0.55, -0.32]}><C a={[0.34, 0.34, 1]} r={[0, 0, Math.PI / 2]} p={[0, 0, 0.32]} c="#d0925a" /><B a={[0.16, 0.26, 0.1]} p={[0, -0.04, 0.68]} c="#ffd257" /></group>{open && [0, 1, 2, 3].map(i => <S key={i} p={[-0.3 + i * 0.2, 0.6, 0.05]} s={0.14} c={['#fff6fb', '#ffd257', '#ff8fc5', '#8fd3ff'][i]} o={{ rough: 0.1, em: 0.2 }} />)}</Tap>
}
const AQ: [string, string][] = [['fish', '🐠'], ['turtle', '🐢'], ['shell', '🐚'], ['starfish', '⭐'], ['coral', '🪸'], ['seaweed', '🌿'], ['pearl', '🫧'], ['chest', '🧰'], ['house', '🏰']]
export function Sea() {
  const fl = useRef<FlyRef>(newFly(0, 2)), dir = useRef({ x: 0, y: 0 }), later = useLater(), { outfit, aquarium, set } = useSave(), [got, setGot] = useState<Set<number>>(new Set()), gotR = useRef(got), food = useRef<Food[]>([]), [op, setOp] = useState<number[]>([]), opR = useRef(op), [mode, setMode] = useState<'swim' | 'aqua'>('swim'), [tool, setTool] = useState('fish'), fed = useRef(0)
  useOnce(() => void task('se_intro'))
  const open = (i: number) => { if (opR.current.includes(i)) return; const n = [...opR.current, i]; opR.current = n; setOp(n); sfx('magic'); burst([CH[i], -1.6, 0], 'star', 36); void say('adv_chest'); star(2) }
  const tick = (f: FlyRef) => {
    COL.forEach((c, i) => { if (!gotR.current.has(i) && Math.hypot(f.x - c.x, f.y - c.y) < 1.5) { const n = new Set(gotR.current).add(i); gotR.current = n; setGot(n); burst([c.x, c.y + 0.5, 0.5], 'bubble', 14); star(1); if (n.size % 4 === 0) void say(praise()); if (n.size === COL.length) { later(() => win('sea', 3), 800); later(() => { gotR.current = new Set(); setGot(new Set()); opR.current = []; setOp([]) }, 6000) } } })
    CH.forEach((x, i) => { if (Math.hypot(f.x - x, f.y + 2.4) < 1.7) open(i) })
    if (Math.random() < 0.03) burst([f.x - 1, f.y + 0.6, 0], 'bubble', 1, 0.3)
  }
  const feed = () => { const f = fl.current; for (let i = 0; i < 6; i++) if (food.current.length < 40) food.current.push({ x: f.x + (Math.random() - 0.5) * 2.4, y: f.y - 0.8 - Math.random(), t: 0 }); sfx('bubble'); if (fed.current++ % 4 === 0) void say('se_feed'); if (fed.current % 5 === 0) star(1) }
  if (mode === 'aqua') return <>
    <Stage key="aq" cam={{ t: [0, 2.1, 0], dir: [0, 0.1, 1], w: 9.4, h: 5.2, tray: true }} sky={['#ffd9ec', '#fff0dc']}>
      <B a={[30, 0.4, 8]} p={[0, -0.55, 0]} c="#e2b98a" ns /><B a={[30, 14, 0.3]} p={[0, 5, -3.4]} c="#ffe6f2" ns />
      <group onPointerDown={e => { e.stopPropagation(); if (aquarium.length >= 40) return; const deep = ['fish', 'turtle', 'pearl'].includes(tool); set({ aquarium: [...aquarium, { k: tool, x: Math.max(-3.8, Math.min(3.8, e.point.x)), y: deep ? Math.max(0.3, Math.min(3.2, e.point.y - 0.3)) : 0.1 }] }); sfx('splash'); burst(e.point, 'bubble', 12, 0.5); if ((aquarium.length + 1) % 5 === 0) { void say('beautiful'); star(1) } }}>
        <B a={[9, 4.2, 2.4]} p={[0, 2, 0]} c="#9fe3ff" o={{ op: 0.4, rough: 0.05 }} rad={0.2} ns /></group>
      <B a={[9.3, 0.4, 2.7]} p={[0, -0.1, 0]} c="#b79bff" /><B a={[9.3, 0.3, 2.7]} p={[0, 4.2, 0]} c="#ff9ecb" /><B a={[8.8, 0.3, 2.2]} p={[0, 0.2, 0]} c="#ffe6b8" ns />
      {aquarium.map((a, i) => a.k === 'fish' || a.k === 'turtle' ? <Swimmer key={i} i={i} y={a.y} x0={a.x}><Animal k={a.k as 'fish'} c={a.k === 'fish' ? FC[i % 6] : undefined} s={0.6} /></Swimmer> : <group key={i} position={[a.x, a.k === 'pearl' ? a.y : 0.32, -0.6 + (i % 4) * 0.35]}><Item k={a.k} s={a.k === 'pearl' ? 0.4 : 0.85 + (i % 2) * 0.2} /></group>)}
    </Stage>
    <Back on={() => { setMode('swim'); void task('se_intro') }} />
    <Tray value={tool} items={[...AQ.map(([id, icon]) => ({ id, icon })), { id: 'undo', icon: '↩️' }, { id: 'clear', icon: '🧽' }]} on={t => { if (t === 'undo') set({ aquarium: aquarium.slice(0, -1) }); else if (t === 'clear') set({ aquarium: [] }); else setTool(t) }} /></>
  return <>
    <Stage key="sw" sky={['#4ab8e8', '#b5f0e6']} fog={[14, 46]} sun={1.6} shadow={7}>
      <Reef /><TapPlane fl={fl} w={90} h={40} y={2} /><FoodDots food={food} />
      {Array.from({ length: 12 }, (_, i) => <Fish key={i} i={i} food={food} />)}
      <Turtle /><Float p={[-4, 5.4, -3]} a={0.6}><Jelly c="#ffb9dc" /></Float><Float p={[10, 6, -3]} a={0.6}><Jelly c="#c9b5ff" /></Float>
      {COL.map((c, i) => !got.has(i) && <Tap key={i} p={[c.x, c.y, 0]} bob={0.08} hit={0.9} hitP={[0, 0.3, 0]} on={() => { fl.current.tx = c.x; fl.current.ty = c.y + 0.4 }}><Item k={c.k} s={c.k === 'pearl' ? 0.8 : 1.1} /></Tap>)}
      {CH.map((x, i) => <Chest key={x} x={x} open={op.includes(i)} on={() => { fl.current.tx = x; fl.current.ty = -2; }} />)}
      <Flyer fl={fl} dir={dir} bx={20} by={[-2.3, 7]} max={6} z={12} onTick={tick}><Tap on={() => { sfx('bubble'); burst([fl.current.x, fl.current.y + 1, 0.5], 'bubble', 14) }} snd={null} hit={1.4}>
        <S s={[1.15, 1.05, 1.15]} p={[0, 0.2, 0]} c="#e6faff" o={{ op: 0.28, rough: 0.03 }} /><C a={[1.1, 0.7, 0.7]} p={[0, -0.65, 0]} c="#ffd257" o={{ rough: 0.25 }} /><T a={[1.1, 0.1]} r={[Math.PI / 2, 0, 0]} p={[0, -0.3, 0]} c="#ff8fc5" /><S p={[0, -0.6, 0.95]} s={0.2} c="#fff6c4" o={{ em: 0.9 }} /><Dome p={[0, 1.15, 0]} s={[0.25, 0.2, 0.25]} c="#ff8fc5" /><group position={[0, -0.75, 0]}><Person s={0.9} mood="wave" outfit={outfit} /></group>
      </Tap></Flyer><Cap a={[0.01, 0.01]} />
    </Stage>
    <Joy dir={dir} /><div className="rside"><button className="rb" style={{ height: 76, width: 76 }} aria-label="Ակվարիում" onClick={() => { sfx('tap'); setMode('aqua'); void task('se_aqua') }}>🐠</button><button className="big" aria-label="Կերակրել" style={{ ['--c' as string]: '#ffb07a' }} onPointerDown={feed}>🍤</button></div>
    <div className="quest" style={{ fontSize: 28 }}>🐚 {got.size}/{COL.length}</div>
  </>
}
function Swimmer({ i, x0, y, children }: { i: number; x0: number; y: number; children: React.ReactNode }) { const g = useRef<THREE.Group>(null!); useFrame(s => { const t = s.clock.elapsedTime * (0.35 + (i % 4) * 0.08) + x0; g.current.position.set(Math.sin(t) * 3.6, y + Math.sin(t * 2.3) * 0.18, Math.sin(t * 0.7 + i) * 0.6); g.current.rotation.y = Math.cos(t) > 0 ? 1.3 : -1.3 }); return <group ref={g}>{children}</group> }
function Turtle() { const g = useRef<THREE.Group>(null!); useFrame(s => { const t = s.clock.elapsedTime * 0.2; g.current.position.set(Math.sin(t) * 14, 4 + Math.sin(t * 3) * 0.8, -2); g.current.rotation.y = Math.cos(t) > 0 ? 1.3 : -1.3 }); return <group ref={g}><Tap on={() => { animal('turtle') }} snd={null} fx="heart" hit={1.1}><Animal k="turtle" s={1.3} /></Tap></group> }
const Jelly = ({ c }: { c: string }) => <Tap on={() => sfx('boing')} fx="bubble" hit={1}><Dome s={[0.8, 0.7, 0.8]} c={c} o={{ op: 0.85 }} />{[-0.4, -0.13, 0.13, 0.4].map(x => <Cap key={x} a={[0.07, 0.8]} p={[x, -0.5, 0]} c={c} />)}{[-0.2, 0.2].map(x => <S key={x} p={[x, 0.22, 0.72]} s={[0.07, 0.09, 0.04]} c="#3a2430" ns />)}</Tap>
void (0 as unknown as V3); void shower
