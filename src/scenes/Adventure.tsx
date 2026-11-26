import { useMemo, useRef, useState, memo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Stage, Tap, Float, S, B, C, T, K, Star3, Dome, burst, shower, useLater, useOnce, Disc, Heart3, Emoji, type V3 } from '../kit/base'
import { Castle, Clouds, Butterflies, Meadow, Flower, Tree, Rainbow, Mushroom, House, Pine, RAINBOW } from '../kit/nature'
import { Person, Fairy, Princess, Granny } from '../kit/people'
import { Animal } from '../kit/animals'
import { Item } from '../kit/items'
import { Player, TapGround, Zone, Beam, newPlayer, type PlayerRef } from '../kit/world'
import { say, task, type Phrase } from '../core/voice'
import { sfx, animal } from '../core/audio'
import { star, useSave } from '../core/store'
import { Joy } from '../ui/HUD'

type ZId = 'forest' | 'castle' | 'garden' | 'park' | 'village' | 'pets' | 'bridge' | 'island'
const ZONES: { id: ZId; p: [number, number]; icon: string; item: string; ip: [number, number]; npc: [number, number]; chest: [number, number]; gift: [number, number]; pad: string }[] = [
  { id: 'forest', p: [-30, -20], icon: '🌲', item: 'honey', ip: [-7, -5], npc: [3, 5], chest: [8, -3], gift: [-9, 4], pad: '#8fd8a0' },
  { id: 'castle', p: [0, -40], icon: '🏰', item: 'crown', ip: [8, 3], npc: [0, 4.5], chest: [-8, 2], gift: [8.5, -4], pad: '#ffd9ec' },
  { id: 'garden', p: [28, -24], icon: '🌷', item: 'flower', ip: [6, -7], npc: [-3, 5], chest: [7, 4], gift: [-7, -5], pad: '#c9f0a8' },
  { id: 'park', p: [38, 6], icon: '🎡', item: 'balloon', ip: [-8, 5], npc: [-5, -3], chest: [2, 8], gift: [7, -7], pad: '#ffe3b8' },
  { id: 'village', p: [-36, 10], icon: '🏘️', item: 'cookie', ip: [7, 6], npc: [4, -1], chest: [-2, 8], gift: [-8, -6], pad: '#ffe8cf' },
  { id: 'pets', p: [-12, 26], icon: '🐾', item: 'carrot', ip: [-7, 4], npc: [2, 4], chest: [7, 3], gift: [-5, -6], pad: '#d9f0b0' },
  { id: 'bridge', p: [10, 40], icon: '🌈', item: 'heart', ip: [-9, -5], npc: [-3.8, 1], chest: [8, -2], gift: [9, -8], pad: '#e3d3ff' },
  { id: 'island', p: [10, 82], icon: '🏝️', item: 'pearl', ip: [-7, 5], npc: [4, 0], chest: [0, 7], gift: [8, -5], pad: '#ffe9b0' },
]
const STARS = ZONES.flatMap(z => [0, 1, 2, 3, 4].map(i => { const a = i * 1.257 + 0.5, r = 5.6 + (i % 2) * 2.2; return { id: `${z.id}-s${i}`, x: z.p[0] + Math.cos(a) * r, z: z.p[1] + Math.sin(a) * r } })).concat([0, 1, 2].map(i => ({ id: `br-s${i}`, x: 10, z: 50 + i * 7 })))
const land = (x: number, z: number) => Math.hypot(x, z + 4) < 52
const bridge = (x: number, z: number) => Math.abs(x - 10) < 2.2 && z > 43 && z < 73
const OK = (x: number, z: number) => land(x, z) || bridge(x, z) || Math.hypot(x - 10, z - 82) < 12.5
const BH = (z: number) => z > 45 && z < 71 ? Math.sin((z - 45) / 26 * Math.PI) * 4 : 0
const H = (x: number, z: number) => Math.abs(x - 10) < 2.8 && z > 44 ? BH(z) : 0
const OBST: [number, number, number][] = [[0, -43, 5.6], [-36, 4, 2.2], [-42, 10, 2.2], [-31, 6, 2.2], [-36, 17, 2], [-12, 21, 2.6], [38, 1, 3.4], [44, 10, 2.8], [-34, -24, 1], [-26, -25, 1], [-36, -15, 1], [-24, -17, 1], [-31, -29, 1], [10, 88, 1.2]]

const Scenery = memo(function Scenery({ pl, ride }: { pl: React.MutableRefObject<PlayerRef>; ride: (k: 'car' | 'wheel') => void }) {
  return <>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.6, 20]} receiveShadow raycast={() => null}><circleGeometry args={[190, 40]} /><meshStandardMaterial color="#7fd6ee" roughness={0.15} /></mesh>
    <C a={[53.5, 51, 1.2]} p={[0, -0.6, -4]} c="#b5eaa6" seg={64} ns o={{ rough: 0.95 }} /><C a={[55, 54, 0.7]} p={[0, -0.75, -4]} c="#ffeec4" seg={64} ns o={{ rough: 1 }} />
    <C a={[13.6, 12.6, 1]} p={[10, -0.5, 82]} c="#ffe9b0" ns o={{ rough: 1 }} /><C a={[8, 8, 0.1]} p={[10, 0, 82]} c="#b5eaa6" ns />
    <Meadow n={1400} rad={50} center={[0, 0, -4]} />
    {ZONES.map((z, i) => z.id !== 'island' && <Disc key={z.id} a={11} p={[z.p[0], 0.012 + i * 0.001, z.p[1]]} c={z.pad} o={{ rough: 1 }} />)}
    <Disc a={6} p={[0, 0.02, 0]} c="#ffe9d3" o={{ rough: 1 }} /><Disc a={4} p={[0, 0.03, 0]} c="#ffd3ec" o={{ rough: 1 }} /><Disc a={2} p={[0, 0.04, 0]} c="#fff6c9" o={{ rough: 1 }} />
    {/* тропинки */}
    {ZONES.slice(0, 7).map(z => Array.from({ length: 10 }, (_, i) => <C key={z.id + i} a={[0.85, 0.9, 0.06]} seg={14} p={[z.p[0] * (i + 2) / 13, 0.03, z.p[1] * (i + 2) / 13]} c={i % 2 ? '#fff0da' : '#ffdfee'} ns />))}
    <Zone p={[-30, 0, -20]} pl={pl}>{[[-4, -4], [4, -5], [-6, 5], [6, 3], [-1, -9]].map(([x, z], i) => <Tap key={i} p={[x, 0, z]} on={() => sfx('magic')} fx="heart">{i % 2 ? <Pine s={1.8} /> : <Tree s={1.8} c={['#8fdc9a', '#7fd0b0', '#a8dc7a'][i % 3]} />}</Tap>)}
      {[[2, 1, '#ff7a8a'], [-3, 2, '#b79bff'], [5, -1, '#ffb07a'], [-2, 7, '#7fc4ff']].map(([x, z, c], i) => <Tap key={i} p={[x as number, 0, z as number]} on={() => { sfx('boing'); if (Math.hypot(pl.current.x + 30 - (x as number), pl.current.z + 20 - (z as number)) < 3) pl.current.vy = 9 }}><Mushroom s={1.9} c={c as string} /></Tap>)}</Zone>
    <Zone p={[0, 0, -43]} pl={pl} far={60}><Castle s={2.1} />{[-5, 5].map(x => <Tap key={x} p={[x, 0, 5]} on={() => { sfx('splash'); burst([x, 1.5, -38], 'drop', 26) }} fx={null}><C a={[1.3, 1.4, 0.5]} p={[0, 0.25, 0]} c="#fff" /><C a={[1.1, 1.1, 0.1]} p={[0, 0.5, 0]} c="#7fd6ee" /><C a={[0.2, 0.3, 1]} p={[0, 0.8, 0]} c="#fff" /><S p={[0, 1.4, 0]} s={0.35} c="#ffc2e2" /></Tap>)}</Zone>
    <Zone p={[28, 0, -24]} pl={pl}>{Array.from({ length: 18 }, (_, i) => { const a = i * 0.7, r = 2.6 + (i % 4) * 1.9; return <Tap key={i} p={[Math.cos(a) * r, 0, Math.sin(a) * r]} on={() => sfx('magic')} fx="heart"><Flower s={1.6 + (i % 3) * 0.4} c={['#ff8fc5', '#ffd257', '#b79bff', '#8fd3ff', '#ffb07a', '#ffffff'][i % 6]} /></Tap> })}<Butterflies n={6} rad={6} /></Zone>
    <Zone p={[38, 0, 6]} pl={pl}><Carousel on={() => ride('car')} /><Wheel on={() => ride('wheel')} />{[[-5, 4, '#ff8fc5'], [-7, -2, '#7fc4ff'], [3, -9, '#ffd257']].map(([x, z, c], i) => <Tap key={i} p={[x as number, 0, z as number]} on={() => { sfx('boing'); pl.current.target = { x: 38 + (x as number), z: 6 + (z as number) } }}><C a={[1.3, 1.3, 0.3]} p={[0, 0.2, 0]} c={c as string} /><C a={[1.05, 1.05, 0.08]} p={[0, 0.36, 0]} c="#5b4a7c" /></Tap>)}</Zone>
    <Zone p={[-36, 0, 10]} pl={pl}><Tap p={[0, 0, -6]} on={() => sfx('door')}><House s={1.8} /></Tap><Tap p={[-6, 0, 0]} on={() => sfx('door')}><House s={1.8} c="#e6dcff" roof="#b79bff" r={[0, 0.6, 0]} /></Tap><Tap p={[5, 0, -4]} on={() => sfx('door')}><House s={1.7} c="#d9f0ff" roof="#7fc4ff" r={[0, -0.5, 0]} /></Tap><Tap p={[0, 0, 7]} on={() => { sfx('splash'); burst([-36, 1.4, 17], 'drop', 20) }} fx={null}><C a={[1, 1.1, 0.9]} p={[0, 0.45, 0]} c="#e8d8c8" /><C a={[0.8, 0.8, 0.1]} p={[0, 0.9, 0]} c="#7fd6ee" />{[-0.9, 0.9].map(x => <C key={x} a={[0.07, 0.07, 1.4]} p={[x, 1.5, 0]} c="#b98a63" />)}<K a={[1.4, 0.8]} seg={4} r={[0, 0.78, 0]} p={[0, 2.5, 0]} c="#ff9ecb" /></Tap></Zone>
    <Zone p={[-12, 0, 26]} pl={pl}><House s={2} p={[0, 0, -5]} c="#fff0c9" roof="#8fdc9a" />{([['cat', -4, 1], ['dog', 5, 0], ['hen', -2, 6], ['sheep', 5, 6], ['cow', -6, -3]] as const).map(([k, x, z]) => <Tap key={k} p={[x, 0, z]} on={() => animal(k)} fx="heart"><Animal k={k} s={1.1} /></Tap>)}{Array.from({ length: 9 }, (_, i) => <B key={i} a={[0.16, 0.8, 1.1]} p={[-9.6, 0.4, -5 + i * 1.25]} c="#fff" />)}</Zone>
    <Zone p={[10, 0, 58]} pl={pl} far={70}><Rainbow p={[0, 0.5, 14.5]} s={1.3} />
      {Array.from({ length: 27 }, (_, i) => { const z = -13 + i; return <B key={i} a={[5, 0.24, 1.06]} p={[0, BH(z + 58) - 0.14, z]} c={RAINBOW[i % 7]} rad={0.05} ns /> })}{Array.from({ length: 14 }, (_, i) => [-2.6, 2.6].map(x => <S key={i + '' + x} p={[x, BH(45 + i * 2) + 0.35, -13 + i * 2]} s={0.32} c="#fff" ns />))}</Zone>
    <Zone p={[10, 0, 82]} pl={pl}><C a={[0.3, 0.45, 4.6]} p={[0, 2.3, 6]} r={[0.08, 0, 0.08]} c="#c99a6b" />{Array.from({ length: 6 }, (_, i) => <S key={i} p={[Math.cos(i * 1.047) * 1.2 - 0.2, 4.6, 6.2 + Math.sin(i * 1.047) * 1.2]} s={[1.3, 0.14, 0.45]} r={[0, -i * 1.047, -0.3]} c="#6fcf8a" />)}<Item k="shell" p={[5, 0, 5]} s={1.4} /><Item k="starfish" p={[-6, 0, 0]} s={1.3} /><Item k="coral" p={[-4, 0, -6]} s={1.4} /><Item k="shell" p={[7, 0, -2]} s={1.1} c="#c9b5ff" /></Zone>
    {ZONES.map((z, i) => { const a = Math.atan2(z.p[1], z.p[0]) + (z.id === 'island' ? -0.85 : z.id === 'bridge' ? -0.5 : z.id === 'pets' ? 0.35 : 0), x = Math.cos(a) * 7, y = Math.sin(a) * 7; return <Tap key={'sg' + z.id} p={[x, 0, y]} hit={0.9} hitP={[0, 1.6, 0]} on={() => { pl.current.target = { x: z.p[0], z: z.p[1] + 6 }; void say(('adv_' + z.id) as Phrase) }}><C a={[0.1, 0.12, 1.5]} p={[0, 0.75, 0]} c="#c99a6b" /><B a={[1.5, 1.2, 0.2]} p={[0, 1.8, 0]} c={z.pad} rad={0.2} /><Emoji e={z.icon} p={[0, 1.8, 0.13]} s={1} />{i < 0 && <group />}</Tap> })}
    {[[-9, -6], [9, -7], [-12, 3], [12, 3], [-5, 10], [6, 11], [-4, -11], [5, -12], [-16, -4], [17, -3]].map(([x, z], i) => <Zone key={'t' + i} p={[x, 0, z]} pl={pl}><Tap on={() => sfx('magic')} fx="heart">{i % 3 === 0 ? <Tree s={1.4} c={['#8fdc9a', '#ffb9dc', '#c5b0ff'][i % 3 + (i > 4 ? 1 : 0)]} /> : i % 3 === 1 ? <Flower s={2.2} c={['#ff8fc5', '#ffd257', '#b79bff'][i % 3]} /> : <Mushroom s={1.6} c="#b79bff" />}</Tap></Zone>)}
    <Butterflies n={5} c={[0, 1.6, 0]} rad={5} />
    {/* площадь */}
    <Tap p={[0, 0, -2.6]} on={() => { sfx('splash'); burst([0, 2.4, -2.6], 'drop', 34) }} fx={null}><C a={[1.1, 1.2, 0.4]} p={[0, 0.2, 0]} c="#fff" /><C a={[0.95, 0.95, 0.1]} p={[0, 0.4, 0]} c="#7fd6ee" /><C a={[0.16, 0.24, 1]} p={[0, 0.8, 0]} c="#fff" /><Heart3 p={[0, 1.6, 0]} s={0.45} c="#ff8fc5" /></Tap>
    {Array.from({ length: 22 }, (_, i) => { const a = i * 0.2856, r = 47 + (i % 3) * 1.5; return Math.abs(Math.cos(a) * r - 10) < 9 && Math.sin(a) > 0 ? null : <Zone key={i} p={[Math.cos(a) * r, 0, Math.sin(a) * r - 4]} pl={pl}>{i % 2 ? <Tree s={1.6} c={['#8fdc9a', '#ffb9dc', '#c5b0ff'][i % 3]} /> : <Pine s={1.8} />}</Zone> })}
  </>
})
const rideT = { car: 0, wheel: 0 }
function Carousel({ on }: { on: () => void }) {
  const g = useRef<THREE.Group>(null!)
  useFrame((s, d) => { rideT.car = Math.max(0, rideT.car - d); g.current.rotation.y += d * (rideT.car > 0 ? 1.6 : 0.25); g.current.children.forEach((c, i) => { if (i >= 3 && i < 9) c.position.y = 0.5 + Math.sin(s.clock.elapsedTime * 2.5 + i) * 0.25 }) })
  return <Tap p={[0, 0, -5]} on={on} hit={2.6} hitP={[0, 1.5, 0]}><group ref={g}><C a={[2.9, 3, 0.4]} p={[0, 0.2, 0]} c="#ffc2e2" /><C a={[0.3, 0.3, 3.4]} p={[0, 1.9, 0]} c="#fff" /><K a={[3.2, 1.5]} p={[0, 4.2, 0]} c="#ff8fc5" />
    {Array.from({ length: 6 }, (_, i) => { const a = i * 1.047; return <group key={i} position={[Math.cos(a) * 2, 0.5, Math.sin(a) * 2]} rotation={[0, -a, 0]}><Animal k={(['horse', 'rabbit', 'duck', 'horse', 'bear', 'sheep'] as const)[i]} s={0.85} /></group> })}
    {Array.from({ length: 8 }, (_, i) => <S key={i} p={[Math.cos(i * 0.785) * 3, 3.45, Math.sin(i * 0.785) * 3]} s={0.2} c={RAINBOW[i % 7]} o={{ em: 0.4 }} />)}</group></Tap>
}
function Wheel({ on }: { on: () => void }) {
  const g = useRef<THREE.Group>(null!)
  useFrame((_, d) => { rideT.wheel = Math.max(0, rideT.wheel - d); g.current.rotation.z += d * (rideT.wheel > 0 ? 0.9 : 0.15); g.current.children.forEach((c, i) => { if (i >= 5) c.rotation.z = -g.current.rotation.z }) })
  return <Tap p={[6, 0, 4]} on={on} hit={2.6} hitP={[0, 3, 0]}><group position={[0, 4, 0]}><group ref={g}><T a={[3, 0.13]} c="#b79bff" /><T a={[1.2, 0.1]} c="#ffd257" />{[0, 1, 2].map(i => <B key={i} a={[6, 0.12, 0.12]} r={[0, 0, i * 1.047]} c="#fff" />)}{Array.from({ length: 6 }, (_, i) => <group key={i} position={[Math.cos(i * 1.047) * 3, Math.sin(i * 1.047) * 3, 0]}><S p={[0, -0.4, 0]} s={[0.55, 0.45, 0.55]} c={RAINBOW[i]} /><Dome p={[0, -0.1, 0]} s={[0.6, 0.5, 0.6]} c="#fff" /></group>)}</group></group>{[-1, 1].map(k => <B key={k} a={[0.2, 4.4, 0.2]} p={[k * 0.9, 2, -0.5]} r={[0, 0, k * 0.4]} c="#fff" />)}</Tap>
}
function NPC({ id, mood }: { id: ZId; mood: 'idle' | 'happy' }) {
  const m = mood === 'happy' ? 'dance' : 'wave'
  if (id === 'castle') return <Princess mood={m} s={1.1} />
  if (id === 'garden') return <Fairy mood={m} s={1} />
  if (id === 'village') return <Granny mood={m} s={1.05} />
  const k = { forest: 'bear', park: 'duck', bridge: 'bird', pets: 'rabbit', island: 'turtle' }[id] as 'bear'
  return <Animal k={k} s={1.35} mood={mood} />
}
export function Adventure() {
  const pl = useRef<PlayerRef>(newPlayer(0, 4)), dir = useRef({ x: 0, y: 0 }), later = useLater(), outfit = useSave(s => s.outfit)
  const save = useSave.getState()
  const [found, setFound] = useState<Set<string>>(() => { const f = new Set(save.found); return STARS.every(s => f.has(s.id)) ? new Set() : f })
  const foundR = useRef(found); foundR.current = found
  const [quest, setQuest] = useState<{ id: ZId; has: boolean } | null>(null), qR = useRef(quest); qR.current = quest
  const [done, setDone] = useState<Set<string>>(new Set()), doneR = useRef(done); doneR.current = done
  const [map, setMap] = useState(false), [mood, setMood] = useState<'' | 'happy' | 'sit'>(''), zone = useRef(''), cool = useRef(0), [mark, setMark] = useState<V3 | null>(null)
  const rider = useRef<THREE.Group>(null!), riding = useRef<'' | 'car' | 'wheel'>('')
  useOnce(() => { const s = new Set(foundR.current); useSave.getState().set({ found: [...s] }); void task('adv_intro') })
  const cheer = () => { setMood('happy'); later(() => setMood(''), 1600) }
  const get = (id: string) => { const n = new Set(foundR.current); n.add(id); foundR.current = n; setFound(n); useSave.getState().set({ found: [...n] }) }
  const tick = (p: PlayerRef, d: number) => {
    cool.current -= d
    for (const s of STARS) if (!foundR.current.has(s.id) && Math.hypot(p.x - s.x, p.z - s.z) < 1.3) { get(s.id); burst([p.x, p.y + 2, p.z], 'star', 24); star(1); if (Math.random() < 0.4) { void say('adv_star'); cheer() } }
    let near = ''
    for (const z of ZONES) {
      const lx = p.x - z.p[0], lz = p.z - z.p[1]; if (Math.hypot(lx, lz) > 14) continue
      if (Math.hypot(lx, lz) < 11) near = z.id
      if (!doneR.current.has('c' + z.id) && Math.hypot(lx - z.chest[0], lz - z.chest[1]) < 2) { mk('c' + z.id); sfx('magic'); shower([p.x, 5, p.z], 2, 'star', 30); void say('adv_chest'); star(2); cheer() }
      if (!doneR.current.has('g' + z.id) && Math.hypot(lx - z.gift[0], lz - z.gift[1]) < 1.7) { mk('g' + z.id); sfx('magic'); burst([p.x, 2, p.z], 'confetti', 40); void say('adv_gift'); star(2); cheer() }
      const q = qR.current, dn = Math.hypot(lx - z.npc[0], lz - z.npc[1])
      if (dn < 3 && cool.current < 0 && !doneR.current.has('q' + z.id)) {
        if (q?.id === z.id && q.has) { mk('q' + z.id); sq(null); cool.current = 4; sfx('win'); burst([z.p[0] + z.npc[0], 3, z.p[1] + z.npc[1]], 'heart', 40); void say('q_thanks'); star(3); cheer() }
        else if (q?.id !== z.id) { sq({ id: z.id, has: false }); cool.current = 6; void task(('q_' + z.id) as Phrase) }
      }
      if (q?.id === z.id && !q.has && Math.hypot(lx - z.ip[0], lz - z.ip[1]) < 1.6) { sq({ id: z.id, has: true }); burst([p.x, 2, p.z], 'heart', 24); sfx('magic'); void task('q_got') }
      if (z.id === 'park') for (const [tx, tz] of [[-5, 4], [-7, -2], [3, -9]]) if (Math.hypot(lx - tx, lz - tz) < 1.2 && p.y < 0.1) { p.vy = 10; sfx('boing') }
    }
    if (near && near !== zone.current && cool.current < 0) { zone.current = near; cool.current = 2.5; void say(('adv_' + near) as Phrase) }
  }
  const mk = (k: string) => { const n = new Set(doneR.current); n.add(k); doneR.current = n; setDone(n) }
  const sq = (q: typeof quest) => { qR.current = q; setQuest(q) }
  const ride = (k: 'car' | 'wheel') => {
    if (riding.current) return
    const c = k === 'car' ? [38, 1] : [44, 10]
    if (Math.hypot(pl.current.x - c[0], pl.current.z - c[1]) > 8) { pl.current.target = { x: c[0], z: c[1] + 4 }; return }
    riding.current = k; rideT[k] = 7; pl.current.lock = true; setMood('sit'); void say('adv_ride'); sfx('magic')
    later(() => { riding.current = ''; pl.current.lock = false; pl.current.x = c[0]; pl.current.z = c[1] + (k === 'car' ? 4 : 3.4); setMood('happy'); star(1); later(() => setMood(''), 1200) }, 7000)
  }
  const jump = () => { if (pl.current.vy === 0) { pl.current.vy = 8; sfx('jump') } }
  const zoneItem = useMemo(() => ZONES.find(z => z.id === quest?.id), [quest])
  return <>
    <Stage sky={['#7fc8ff', '#ffe3f3']} fog={[34, 78]} shadow={13} env={0.45}>
      <Scenery pl={pl} ride={ride} /><Clouds n={9} r={60} y={22} />
      <TapGround pl={pl} r={120} y={0.06} on={(x, z) => setMark([x, 0.1 + H(x, z), z])} />
      {mark && <Marker p={mark} />}
      {STARS.map(s => !found.has(s.id) && <Zone key={s.id} p={[s.x, H(s.x, s.z), s.z]} pl={pl} far={34}><Tap p={[0, 1.2, 0]} spin={1.6} bob={0.18} hit={0.9} on={() => { pl.current.target = { x: s.x, z: s.z } }}><Star3 s={0.5} c="#ffd94f" o={{ em: 0.4, rough: 0.25 }} /></Tap></Zone>)}
      {ZONES.map(z => <Zone key={z.id} p={[z.p[0], 0, z.p[1]]} pl={pl}>
        <Tap p={[z.npc[0], 0, z.npc[1]]} hit={1.3} hitP={[0, 1, 0]} fx="heart" on={() => { pl.current.target = { x: z.p[0] + z.npc[0], z: z.p[1] + z.npc[1] + 1.6 }; if (done.has('q' + z.id)) void say('hi') }}><NPC id={z.id} mood={done.has('q' + z.id) ? 'happy' : 'idle'} />
          {!done.has('q' + z.id) && <Float p={[0.3, 2.7, 0]} a={0.12}><S s={[0.75, 0.75, 0.2]} c="#fff" o={{ op: 0.85 }} /><Item k={z.item} c={z.item === 'flower' ? '#ff4f5e' : undefined} p={[0, -0.4, 0.25]} s={0.8} /></Float>}</Tap>
        <Tap p={[z.chest[0], 0, z.chest[1]]} hit={1.1} hitP={[0, 0.6, 0]} on={() => { pl.current.target = { x: z.p[0] + z.chest[0], z: z.p[1] + z.chest[1] } }}><Chest open={done.has('c' + z.id)} /></Tap>
        {!done.has('g' + z.id) && <Tap p={[z.gift[0], 0, z.gift[1]]} hit={1} hitP={[0, 0.5, 0]} glow on={() => { pl.current.target = { x: z.p[0] + z.gift[0], z: z.p[1] + z.gift[1] } }}><Item k="gift" s={0.9} c="#ff8fc5" /></Tap>}
        {quest?.id === z.id && !quest.has && <group position={[z.ip[0], 0, z.ip[1]]}><Beam /><Tap spin={1} bob={0.15} p={[0, 0.5, 0]} hit={1.2} on={() => { pl.current.target = { x: z.p[0] + z.ip[0], z: z.p[1] + z.ip[1] } }}><Item k={z.item} s={1.4} c={z.item === 'flower' ? '#ff4f5e' : undefined} /></Tap></group>}
      </Zone>)}
      <Player pl={pl} dir={dir} max={6.2} ok={OK} height={H} obst={OBST} onTick={tick} cam={[0, 3.6, 10.2]}>
        {mv => <><RideCtl riding={riding} g={rider} pl={pl} /><group ref={rider}><Tap on={jump} hit={1} hitP={[0, 1, 0]} snd={null}><Person mood={mood || (mv ? 'walk' : 'idle')} outfit={outfit} s={1.05} hold={quest?.has && zoneItem ? <Item k={zoneItem.item} s={0.6} c={zoneItem.item === 'flower' ? '#ff4f5e' : undefined} /> : undefined} /></Tap></group></>}
      </Player>
    </Stage>
    <Joy dir={dir} />
    <div className="rside"><button className="rb" style={{ height: 76, width: 76 }} aria-label="Քարտեզ" onClick={() => { sfx('tap'); setMap(true) }}>🗺️</button><button className="big" aria-label="Թռնել" style={{ ['--c' as string]: '#8fd3ff' }} onPointerDown={jump}>🦘</button></div>
    {quest && zoneItem && <div className="quest">{quest.has ? <>🎁 ➡️ {zoneItem.icon}</> : <>🔎 {{ honey: '🍯', crown: '👑', flower: '🌺', balloon: '🎈', cookie: '🍪', carrot: '🥕', heart: '💖', pearl: '🤍' }[zoneItem.item]}</>}</div>}
    {map && <div className="map" onClick={() => setMap(false)}><div>{ZONES.map(z => <button key={z.id} className="tb" aria-label={z.id} onClick={() => { const p = pl.current; p.x = z.p[0]; p.z = z.p[1] + (z.id === 'castle' ? 8 : z.id === 'island' ? -8 : 7); if (z.id === 'bridge') p.z = z.p[1] + 3; p.y = 0; p.target = null; zone.current = z.id; cool.current = 2; sfx('magic'); void say(('adv_' + z.id) as Phrase); setMap(false); later(() => burst([p.x, 1.5, p.z], 'star', 30), 150) }}>{z.icon}</button>)}</div></div>}
  </>
}
function RideCtl({ riding, g, pl }: { riding: React.MutableRefObject<'' | 'car' | 'wheel'>; g: React.MutableRefObject<THREE.Group>; pl: React.MutableRefObject<PlayerRef> }) {
  useFrame(s => {
    const o = g.current, k = riding.current; if (!o) return
    if (!k) { o.position.set(0, 0, 0); o.rotation.y = 0; return }
    const t = s.clock.elapsedTime, par = o.parent!, w = k === 'car' ? new THREE.Vector3(38 + Math.cos(-t * 1.6) * 2, 1.2 + Math.sin(t * 2.5) * 0.25, 1 + Math.sin(-t * 1.6) * 2) : new THREE.Vector3(44 + Math.cos(t * 0.9) * 3, 3.6 + Math.sin(t * 0.9) * 3, 10.3)
    void pl; par.updateWorldMatrix(true, false); o.position.copy(par.worldToLocal(w))
  })
  return null
}
function Marker({ p }: { p: V3 }) { const r = useRef<THREE.Group>(null!); useFrame(s => r.current.scale.setScalar(1 + Math.sin(s.clock.elapsedTime * 6) * 0.15)); return <group ref={r} position={p}><T a={[0.6, 0.07]} r={[Math.PI / 2, 0, 0]} c="#ff8fc5" o={{ em: 0.5 }} ns /></group> }
function Chest({ open }: { open: boolean }) {
  const lid = useRef<THREE.Group>(null!)
  useFrame((_, d) => { lid.current.rotation.x += ((open ? -1.5 : 0) - lid.current.rotation.x) * Math.min(1, d * 5) })
  return <group scale={1.5}><B a={[1, 0.55, 0.65]} p={[0, 0.28, 0]} c="#b97a4a" /><group ref={lid} position={[0, 0.55, -0.3]}><C a={[0.32, 0.32, 1]} r={[0, 0, Math.PI / 2]} p={[0, 0, 0.3]} c="#d0925a" /><B a={[0.16, 0.26, 0.1]} p={[0, -0.04, 0.63]} c="#ffd257" /></group>{open && <><S p={[-0.2, 0.55, 0]} s={0.16} c="#ffd257" o={{ em: 0.4 }} /><S p={[0.15, 0.58, 0.05]} s={0.17} c="#ff8fc5" /><Star3 p={[0, 0.75, 0]} s={0.2} c="#ffe27a" o={{ em: 0.6 }} /></>}</group>
}
