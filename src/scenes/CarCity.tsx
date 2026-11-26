import { memo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Stage, Tap, S, B, C, T, K, Star3, Disc, Cap, Sign, burst, shower, useLater, useOnce, Dome, type V3 } from '../kit/base'
import { Clouds, Meadow, House, Tree, Flower, Castle, Pine, RAINBOW } from '../kit/nature'
import { Person } from '../kit/people'
import { Animal } from '../kit/animals'
import { Player, TapGround, Zone, Beam, newPlayer, type PlayerRef } from '../kit/world'
import { say, task } from '../core/voice'
import { sfx, animal } from '../core/audio'
import { star, win, useSave } from '../core/store'
import { Joy } from '../ui/HUD'

const CC = ['#ff7fae', '#7fc4ff', '#ffd257', '#a78bfa', '#8fdc9a', '#ff9a6a']
const ROADZ = [-22, 0, 22]
const onRoadZ = (z: number) => ROADZ.some(r => Math.abs(z - r) < 3)
const OK = (x: number, z: number) => Math.hypot(x, z) < 38 && !(x > 9.6 && x < 16.4 && !onRoadZ(z))
const H = (x: number, z: number) => x > 8 && x < 18 && onRoadZ(z) ? Math.sin((x - 8) / 10 * Math.PI) * 1.5 : 0
const LIGHTS: [number, number][] = [[0, 19], [0, -19], [-19, 0], [4, 0]]
const STARS: [number, number][] = [[-12, 22], [0, 12], [6, 22], [22, 22], [22, 8], [13, 0], [22, -10], [13, -22], [0, -12], [-10, -22], [-22, -14], [-22, 14], [-10, 0], [30, 0], [-30, -6], [0, 30]]
const HS: [number, number, string, string][] = [[-11, 11, '#ffe9d0', '#ff9ecb'], [-11, -11, '#e6dcff', '#b79bff'], [5.6, 11, '#d9f0ff', '#7fc4ff'], [5.4, -11, '#fff3c4', '#ffb07a'], [-30, 14, '#ffe0ea', '#8fdc9a'], [-30, -18, '#fff', '#ff8fa8'], [29, 13, '#ffe9d0', '#a78bfa'], [29, -14, '#d9f5e0', '#ff9ecb'], [-14, 31, '#fff3c4', '#7fc4ff'], [12, 32, '#ffe0ea', '#b79bff'], [-8, -32, '#e6f3ff', '#ffb07a']]
const OBST: [number, number, number][] = [...HS.map(h => [h[0], h[1], 2.6] as [number, number, number]), [8, -32, 4.4]]

const Road = ({ p, w, d }: { p: V3; w: number; d: number }) => <><B a={[w, 0.06, d]} p={p} c="#a9a3c8" rad={0.02} ns o={{ rough: 0.95 }} />{Array.from({ length: Math.floor(Math.max(w, d) / 3) }, (_, i) => { const o = -Math.max(w, d) / 2 + 1.5 + i * 3; return <B key={i} a={w > d ? [1.2, 0.02, 0.2] : [0.2, 0.02, 1.2]} p={w > d ? [p[0] + o, p[1] + 0.035, p[2]] : [p[0], p[1] + 0.035, p[2] + o]} c="#fff" rad={0.01} ns /> })}</>
const City = memo(function City({ pl }: { pl: React.MutableRefObject<PlayerRef> }) {
  return <>
    <C a={[41, 39, 1]} p={[0, -0.56, 0]} c="#b8eaa8" seg={60} ns o={{ rough: 1 }} /><Disc a={140} p={[0, -1, 0]} c="#9fdcf0" /><Meadow n={700} rad={38} />
    <B a={[6, 0.08, 74]} p={[13, 0, 0]} c="#7fd0f0" rad={0.03} ns o={{ rough: 0.1 }} />
    {[-22, 0, 22].map(z => <group key={z}><Road p={[-13, 0.02, z]} w={44} d={5} /><Road p={[24, 0.02, z]} w={14} d={5} />
      {Array.from({ length: 11 }, (_, i) => { const x = 8.5 + i * 0.9; return <B key={i} a={[1, 0.2, 5]} p={[x, H(x, z) - 0.09, z]} c={RAINBOW[i % 7]} rad={0.04} ns /> })}{[-2.5, 2.5].map(o => Array.from({ length: 6 }, (_, i) => { const x = 8.6 + i * 1.76; return <S key={i} p={[x, H(x, z) + 0.35, z + o]} s={0.26} c="#fff" /> }))}</group>)}
    {[-22, 0, 22].map(x => <Road key={x} p={[x, 0.03, 0]} w={5} d={49} />)}
    {HS.map(([x, z, c, r], i) => <Zone key={i} p={[x, 0, z]} pl={pl} far={48}><Tap on={() => { sfx('door'); burst([x, 4, z], 'heart', 12) }}><House s={1.7} c={c} roof={r} /></Tap></Zone>)}
    <Zone p={[8, 0, -32]} pl={pl} far={50}><Castle s={1.5} /></Zone>
    {Array.from({ length: 26 }, (_, i) => { const a = i * 0.2417, r = 36 + (i % 2) * 1.4; return Math.abs(Math.cos(a) * r - 13) < 5 ? null : <Zone key={i} p={[Math.cos(a) * r, 0, Math.sin(a) * r]} pl={pl} far={42}>{i % 3 ? <Tree s={1.3} c={['#8fdc9a', '#ffb9dc', '#c5b0ff'][i % 3]} /> : <Pine s={1.4} />}</Zone> })}
    {Array.from({ length: 32 }, (_, i) => { const side = i % 2 ? 3.4 : -3.4, t = -20 + (i >> 1) * 2.7; return <Zone key={i} p={i % 4 < 2 ? [side, 0, t] : [-22 + side, 0, t]} pl={pl} far={26}><Flower s={1.2} c={['#ff8fc5', '#ffd257', '#b79bff', '#ff7a8a'][i % 4]} /></Zone> })}
    {([['cow', -14, 5], ['duck', 8, 6], ['sheep', -6, -15], ['bear', 25, -5], ['rabbit', -26, 7]] as const).map(([k, x, z]) => <Zone key={k} p={[x, 0, z]} pl={pl} far={30}><Tap on={() => animal(k)} fx="heart"><Animal k={k} s={1.2} mood="idle" /></Tap></Zone>)}
  </>
})
function Light({ p, red }: { p: [number, number]; red: React.MutableRefObject<boolean> }) {
  const r = useRef<THREE.Mesh>(null!), g = useRef<THREE.Mesh>(null!)
  useFrame(() => { (r.current.material as THREE.MeshStandardMaterial).emissiveIntensity = red.current ? 1.4 : 0; (g.current.material as THREE.MeshStandardMaterial).emissiveIntensity = red.current ? 0 : 1.4 })
  return <group position={[p[0] + 3.2, 0, p[1]]}><C a={[0.1, 0.12, 2.4]} p={[0, 1.2, 0]} c="#fff" /><B a={[0.7, 1.5, 0.5]} p={[0, 2.9, 0]} c="#7a68b8" rad={0.2} /><mesh ref={r} position={[0, 3.25, 0.25]}><sphereGeometry args={[0.25, 16, 12]} /><meshStandardMaterial color="#ff7a8a" emissive="#ff2a44" /></mesh><mesh ref={g} position={[0, 2.6, 0.25]}><sphereGeometry args={[0.25, 16, 12]} /><meshStandardMaterial color="#8fe3a0" emissive="#1fd05a" /></mesh></group>
}
const Car = ({ c, spd, outfit, bubbles }: { c: string; spd: React.MutableRefObject<PlayerRef>; outfit: any; bubbles?: boolean }) => {
  const w = useRef<THREE.Group>(null!), b = useRef<THREE.Group>(null!)
  useFrame((s, d) => { w.current.children.forEach(o => { o.rotation.x += spd.current.speed * d * 2.2 }); b.current.position.y = Math.sin(s.clock.elapsedTime * 14) * 0.02 * Math.min(1, spd.current.speed / 3 + 0.2) })
  return <group scale={1.15}><group ref={b}>
    <B a={[1.5, 0.6, 2.5]} p={[0, 0.62, 0]} c={c} rad={0.28} o={{ rough: 0.2 }} /><B a={[1.35, 0.35, 1]} p={[0, 0.95, -0.75]} c={c} rad={0.17} o={{ rough: 0.2 }} /><Dome p={[0, 0.85, 0.62]} s={[0.66, 0.32, 0.6]} c={c} o={{ rough: 0.2 }} />
    <B a={[1.25, 0.55, 0.08]} p={[0, 1.15, 0.3]} r={[-0.35, 0, 0]} c="#d6f2ff" o={{ op: 0.5, rough: 0.05 }} /><S p={[-0.45, 0.66, 1.22]} s={0.17} c="#fff6c4" o={{ em: 0.7 }} /><S p={[0.45, 0.66, 1.22]} s={0.17} c="#fff6c4" o={{ em: 0.7 }} /><T a={[0.2, 0.035]} arc={Math.PI} r={[0, 0, Math.PI]} p={[0, 0.62, 1.26]} c="#fff" /><S p={[-0.45, 0.7, -1.22]} s={0.12} c="#ff5a6a" o={{ em: 0.5 }} /><S p={[0.45, 0.7, -1.22]} s={0.12} c="#ff5a6a" o={{ em: 0.5 }} />
    <group position={[0, 0.35, -0.15]}><Person s={0.82} mood="sit" outfit={outfit} /></group><Star3 p={[0.76, 0.65, 0]} r={[0, 1.57, 0]} s={0.2} c="#fff" /><Star3 p={[-0.76, 0.65, 0]} r={[0, 1.57, 0]} s={0.2} c="#fff" />
    {bubbles && Array.from({ length: 9 }, (_, i) => <S key={i} p={[Math.sin(i * 2) * 0.7, 0.7 + (i % 3) * 0.3, Math.cos(i * 1.7) * 1.1]} s={0.22} c="#fff" o={{ op: 0.9 }} ns />)}
  </group><group ref={w}>{[[-0.75, 0.8], [0.75, 0.8], [-0.75, -0.8], [0.75, -0.8]].map(([x, z], i) => <group key={i} position={[x, 0.36, z]}><C a={[0.36, 0.36, 0.28]} r={[0, 0, 1.57]} c="#5b4a6c" /><C a={[0.18, 0.18, 0.3]} r={[0, 0, 1.57]} c="#fff" /><B a={[0.31, 0.1, 0.3]} c="#ffd257" rad={0.02} /></group>)}</group></group>
}
export function CarCity() {
  const pl = useRef<PlayerRef>({ ...newPlayer(0, 8), heading: 0 }), dir = useRef({ x: 0, y: 0 }), save = useSave(), later = useLater(), [got, setGot] = useState<Set<number>>(new Set()), gotR = useRef(got), red = useRef(false), tm = useRef(0), said = useRef(0), [wash, setWash] = useState(false), washing = useRef(false), parked = useRef(0), [clean, setClean] = useState(false), slow = useRef(1), [arch, setArch] = useState(false), waiting = useRef(false)
  useOnce(() => void task('car_intro'))
  const tick = (p: PlayerRef, d: number) => {
    tm.current += d; const rd = tm.current % 13 > 8; said.current -= d; parked.current -= d
    if (rd !== red.current) { red.current = rd; if (!rd && waiting.current) { waiting.current = false; void say('car_green') } }
    let sl = 1
    if (red.current) for (const [x, z] of LIGHTS) if (Math.hypot(p.x - x, p.z - z) < 4) { sl = 0.18; if (said.current < 0) { said.current = 14; waiting.current = true; void say('car_red') } }
    slow.current = sl; if (sl < 1) p.speed = Math.min(p.speed, 9 * sl + (p.speed - 9 * sl) * 0.94)
    STARS.forEach(([x, z], i) => { if (!gotR.current.has(i) && Math.hypot(p.x - x, p.z - z) < 2.2) { const n = new Set(gotR.current).add(i); gotR.current = n; setGot(n); star(1); burst([p.x, p.y + 2, p.z], 'star', 24); if (n.size === STARS.length) { later(() => { win('car', 3, false); void say('car_all'); shower([p.x, 7, p.z], 4) }, 600); later(() => { gotR.current = new Set(); setGot(new Set()) }, 6000) } } })
    if (!washing.current && Math.hypot(p.x + 22, p.z - 9) < 2.6) {
      washing.current = true; p.lock = true; p.target = null; p.speed = 0; setWash(true); setArch(true); void say('car_wash'); sfx('water')
      for (let i = 0; i < 14; i++) later(() => { sfx('bubble'); burst([p.x + Math.random() * 2 - 1, 1 + Math.random(), p.z + Math.random() * 2 - 1], i > 8 ? 'drop' : 'bubble', 8) }, i * 260)
      later(() => { setWash(false); setArch(false); setClean(true); p.lock = false; void say('car_clean'); sfx('magic'); burst([p.x, 2, p.z], 'star', 40); star(1); later(() => setClean(false), 6000); later(() => { washing.current = false }, 9000) }, 4000)
    }
    if (parked.current < 0 && Math.hypot(p.x + 6.5, p.z - 4.6) < 1.5 && p.speed < 2.5) { parked.current = 14; void say('car_park'); sfx('win'); burst([p.x, 2, p.z], 'confetti', 40); star(1) }
  }
  const horn = () => { sfx('horn'); burst([pl.current.x, 2.6, pl.current.z], 'heart', 6) }
  return <>
    <Stage sky={['#8ecfff', '#ffe6f2']} fog={[30, 70]} shadow={14} env={0.45}>
      <City pl={pl} /><Clouds n={8} r={50} y={18} /><TapGround pl={pl} r={60} y={0.08} />
      {LIGHTS.map((l, i) => <Light key={i} p={l} red={red} />)}
      {STARS.map(([x, z], i) => !got.has(i) && <Zone key={i} p={[x, H(x, z), z]} pl={pl} far={34}><Tap p={[0, 1.4, 0]} spin={1.6} bob={0.15} hit={1.1} on={() => { pl.current.target = { x, z } }}><Star3 s={0.65} c="#ffd94f" o={{ em: 0.4 }} /></Tap></Zone>)}
      {/* мойка */}
      <group position={[-22, 0, 9]}>{[-3, 3].map(x => <C key={x} a={[0.4, 0.45, 3.6]} p={[x, 1.8, 0]} c="#7fc4ff" />)}<B a={[7.2, 0.9, 1.4]} p={[0, 3.8, 0]} c="#ff9ecb" rad={0.3} /><Sign t="🫧 🚗 🫧" p={[0, 3.8, 0.75]} w={3} h={0.6} /><Brush x={-2.2} on={arch} /><Brush x={2.2} on={arch} /></group>
      {/* парковка */}
      <group position={[-6.5, 0, 4.6]}><B a={[4, 0.06, 4]} p={[0, 0.03, 0]} c="#b9b3dc" ns /><B a={[3.4, 0.02, 3.4]} p={[0, 0.07, 0]} c="#8fb8ff" ns /><Beam c="#9fd0ff" h={3} /><Sign t="P" p={[0, 2.4, -2]} w={1} h={1} bg="#4a90ff" fg="#fff" /><C a={[0.08, 0.08, 2]} p={[0, 1, -2]} c="#fff" /></group>
      <Player pl={pl} dir={dir} max={9} ok={OK} height={H} obst={OBST} car onTick={tick} cam={[0, 6, 11.5]}>{() => <Tap on={horn} snd={null} hit={1.5} hitP={[0, 1, 0]}><Car c={CC[save.carColor % 6]} spd={pl} outfit={save.outfit} bubbles={wash} />{clean && [0, 1, 2].map(i => <Star3 key={i} p={[Math.sin(i * 2.1), 1.8, Math.cos(i * 2.1)]} s={0.15} c="#fff" o={{ em: 1 }} />)}</Tap>}</Player>
      <Cap a={[0.01, 0.01]} /><K a={[0.01, 0.01]} />
    </Stage>
    <Joy dir={dir} />
    <div className="rside"><button className="rb" style={{ height: 76, width: 76 }} aria-label="Գույն" onClick={() => { save.set({ carColor: (save.carColor + 1) % 6 }); sfx('magic'); burst([pl.current.x, 2, pl.current.z], 'star', 24) }}>🎨</button><button className="big" aria-label="Ազդանշան" style={{ ['--c' as string]: '#ffd257' }} onPointerDown={horn}>📯</button></div>
    <div className="quest" style={{ fontSize: 30 }}>⭐ {got.size} / {STARS.length}</div>
  </>
}
function Brush({ x, on }: { x: number; on: boolean }) { const g = useRef<THREE.Group>(null!); useFrame((_, d) => { if (on) g.current.rotation.y += d * 9 }); return <group ref={g} position={[x, 1.6, 0]}>{Array.from({ length: 6 }, (_, i) => <S key={i} p={[Math.cos(i * 1.047) * 0.4, 0, Math.sin(i * 1.047) * 0.4]} s={[0.25, 1.4, 0.25]} c={i % 2 ? '#ff9ecb' : '#fff'} />)}</group> }
