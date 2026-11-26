import { memo, useEffect, useMemo, useRef, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { Stage, Tap, Float, Glide, S, B, C, T, K, Cap, Star3, Heart3, Dome, burst, shower, useLater, useOnce, type V3 } from '../kit/base'
import { Mushroom, Flower, RAINBOW } from '../kit/nature'
import { Person } from '../kit/people'
import { Animal } from '../kit/animals'
import { Item } from '../kit/items'
import { Flyer, TapPlane, newFly, type FlyRef } from '../kit/world'
import { say, task, type Phrase } from '../core/voice'
import { sfx, animal } from '../core/audio'
import { star, win, useSave } from '../core/store'
import { Joy, Back } from '../ui/HUD'

const PL: { p: [number, number]; r: number; c: string; c2: string; ring?: boolean; al: string; v: Phrase; sky: [string, string] }[] = [
  { p: [-7.6, 4.2], r: 2.4, c: '#ff9ecb', c2: '#ffd3ec', ring: true, al: '#ffb0dc', v: 'sp_p1', sky: ['#8f5ac8', '#ffb9dc'] }, { p: [7.4, 5], r: 2.1, c: '#8fe3a0', c2: '#d9ffd0', al: '#7fdc9a', v: 'sp_p2', sky: ['#3f7a9a', '#c9f5b0'] }, { p: [0, 9.6], r: 2, c: '#b79bff', c2: '#e6dcff', ring: true, al: '#c9b5ff', v: 'sp_p3', sky: ['#4a3fa8', '#d9c4ff'] }, { p: [8.4, -4.2], r: 2.3, c: '#ffc27a', c2: '#fff0c4', al: '#ffd98a', v: 'sp_p4', sky: ['#c86a8a', '#ffe3a8'] }, { p: [-8.4, -4.4], r: 2.2, c: '#8fdcff', c2: '#fff', al: '#9fe3ff', v: 'sp_p5', sky: ['#3f6ac8', '#d6f2ff'] }]
const StarField = memo(function StarField() {
  const g = useMemo(() => { const n = 900, a = new Float32Array(n * 3); for (let i = 0; i < n; i++) { const t = Math.random() * 6.28, u = Math.acos(2 * Math.random() - 1), r = 60 + Math.random() * 60; a[i * 3] = r * Math.sin(u) * Math.cos(t); a[i * 3 + 1] = r * Math.sin(u) * Math.sin(t); a[i * 3 + 2] = -Math.abs(r * Math.cos(u)) - 6 } const b = new THREE.BufferGeometry(); b.setAttribute('position', new THREE.BufferAttribute(a, 3)); return b }, [])
  return <points geometry={g} raycast={() => null}><pointsMaterial color="#fff6d6" size={0.55} sizeAttenuation transparent opacity={0.9} /></points>
})
function Rocket({ outfit }: { outfit: any }) {
  const f = useRef<THREE.Group>(null!)
  useFrame(s => f.current.scale.set(1, 0.8 + Math.sin(s.clock.elapsedTime * 20) * 0.25, 1))
  return <group><Cap a={[0.75, 1.1]} c="#fff" o={{ rough: 0.25 }} /><K a={[0.72, 1]} p={[0, 1.5, 0]} c="#ff7fbf" /><T a={[0.75, 0.1]} r={[Math.PI / 2, 0, 0]} p={[0, -0.6, 0]} c="#ffd257" />
    <S p={[0, 0.25, 0.3]} s={[0.6, 0.6, 0.5]} c="#bfe0ff" /><S p={[0, 0.25, 0.6]} s={[0.62, 0.62, 0.5]} c="#d6f2ff" o={{ op: 0.25, rough: 0.05 }} /><T a={[0.52, 0.09]} p={[0, 0.25, 0.66]} s={1.1} c="#b79bff" /><group position={[0, -0.36, 0.82]} scale={0.4}><Person outfit={outfit} mood="wave" /></group>
    {[0, 1, 2].map(i => <group key={i} rotation={[0, i * 2.094 + 0.52, 0]}><B a={[0.16, 0.9, 0.6]} p={[0, -0.85, 0.75]} r={[-0.3, 0, 0]} c="#b79bff" /></group>)}
    <group ref={f} position={[0, -1.35, 0]}><K a={[0.42, 1.2]} r={[Math.PI, 0, 0]} p={[0, -0.5, 0]} c="#ffb52e" o={{ em: 1 }} ns /><K a={[0.24, 0.8]} r={[Math.PI, 0, 0]} p={[0, -0.35, 0]} c="#fff6c4" o={{ em: 1.4 }} ns /></group></group>
}
const Planet = ({ q }: { q: (typeof PL)[0] }) => <><S s={q.r} c={q.c} o={{ rough: 0.8, em: 0.1 }} />{[[0.5, 0.5, 0.75], [-0.6, 0.2, 0.75], [0.1, -0.6, 0.75], [-0.3, 0.75, 0.55], [0.75, -0.2, 0.6]].map((v, i) => { const l = Math.hypot(...v); return <S key={i} p={v.map(x => x / l * q.r * 0.93) as V3} s={q.r * (0.13 + (i % 3) * 0.06)} c={q.c2} /> })}{q.ring && <T a={[q.r * 1.55, 0.16]} r={[1.25, 0.3, 0]} c="#fff3b0" o={{ em: 0.3 }} />}</>
const ST: [number, number][] = Array.from({ length: 18 }, (_, i) => [Math.cos(i * 2.4) * (4 + (i % 5) * 2.4), 3 + Math.sin(i * 2.4) * (4 + (i % 4) * 1.7)])
export function Space() {
  const fl = useRef<FlyRef>(newFly(0, 0)), dir = useRef({ x: 0, y: 0 }), later = useLater(), outfit = useSave(s => s.outfit), [got, setGot] = useState<Set<number>>(new Set()), gotR = useRef(got), [land, setLand] = useState(-1), goal = useRef(-1), [gems, setGems] = useState<number[]>([]), [visited, setV] = useState<Set<number>>(new Set()), [am, setAm] = useState<'idle' | 'happy' | 'dance'>('idle'), away = useRef(0)
  useOnce(() => { void task('sp_go', 'sp_intro'); sfx('rocket') })
  const tick = (f: FlyRef, d: number) => {
    away.current -= d
    ST.forEach(([x, y], i) => { if (!gotR.current.has(i) && Math.hypot(f.x - x, f.y - y) < 1.3) { const n = new Set(gotR.current).add(i); gotR.current = n; setGot(n); star(1); burst([x, y, 0.5], 'star', 22); if (n.size === ST.length) later(() => { gotR.current = new Set(); setGot(new Set()) }, 3000) } })
    if (away.current < 0) PL.forEach((q, i) => { const l = Math.hypot(f.x - q.p[0], f.y - q.p[1]); if (l < q.r + 1.2 && land < 0) { away.current = 99; goal.current = -1; sfx('magic'); f.lock = true; later(() => { setLand(i); setGems([]); setAm('idle'); void task(PL[i].v, 'sp_collect') }, 350) } })
  }
  const leave = () => { const q = PL[land], f = fl.current; setLand(-1); sfx('rocket'); f.lock = false; f.tx = null; const l = Math.hypot(q.p[0], q.p[1]); f.x = q.p[0] - q.p[0] / l * (q.r + 2.6); f.y = q.p[1] - q.p[1] / l * (q.r + 2.6); f.vx = f.vy = 0; away.current = 1.5 }
  const gem = (i: number, p: THREE.Vector3) => { const n = [...gems, i]; setGems(n); sfx('star'); burst(p, 'star', 22); if (n.length === 6) { setAm('dance'); win('space-' + land, 2); shower([0, 5, 0], 4, 'star', 50); setV(new Set(visited).add(land)) } }
  if (land >= 0) {
    const q = PL[land]
    return <><Stage key={'l' + land} cam={{ t: [0, 1.9, 0], dir: [0, 0.18, 1], w: 9, h: 5.6 }} sky={q.sky} sun={1.6} fog={[24, 60]}>
      <StarField /><S p={[0, -14, -2]} s={14.2} c={q.c} o={{ rough: 0.95 }} />{Array.from({ length: 12 }, (_, i) => <S key={i} p={[Math.cos(i * 2.1) * (3 + i * 0.35), 0.02 - Math.hypot(Math.cos(i * 2.1), Math.sin(i * 2.1)) * 0.2 - i * 0.04, Math.sin(i * 2.1) * (2 + i * 0.2) - 1]} s={[0.6 + (i % 3) * 0.3, 0.12, 0.5]} c={q.c2} ns />)}
      <Float p={[-5.6, 5.4, -8]}><S s={1.2} c="#ffe9c4" o={{ em: 0.3 }} /><T a={[1.9, 0.12]} r={[1.2, 0.4, 0]} c="#fff" /></Float><Float p={[6, 6, -9]}><S s={0.8} c="#c9b5ff" o={{ em: 0.3 }} /></Float>
      {land === 3 ? [[-4, -1.6], [4, -1.6], [-5.4, 0], [5.4, 0]].map(([x, z], i) => <group key={i} position={[x, -0.6, z]}><Item k={['icecream', 'cupcake', 'cake', 'cookie'][i]} s={2} /></group>) : land === 4 ? [-4.4, -3, 3.4, 4.6].map((x, i) => <K key={x} a={[0.6, 2 + i * 0.4]} seg={6} p={[x, 0.3, -2]} c="#d6f6ff" o={{ rough: 0.1 }} />) : land === 2 ? [-4.2, 4.2].map(x => <group key={x} position={[x, -0.4, -2]}>{[0, 1, 2].map(i => <S key={i} p={[0, i * 0.9, 0]} s={0.75 - i * 0.16} c={RAINBOW[i + 4]} />)}</group>) : [-4.4, -3.2, 3.6, 4.8].map((x, i) => i % 2 ? <Mushroom key={x} p={[x, -0.5, -1.4]} s={2.4} c={q.al} /> : <Flower key={x} p={[x, -0.5, -1]} s={2.8} c={land ? '#ffe27a' : '#b79bff'} />)}
      <Tap p={[0, 0.1, -0.4]} snd={null} fx="heart" hit={1.2} hitP={[0, 1, 0]} on={() => { animal('alien'); setAm('happy'); later(() => setAm('idle'), 1600) }}><Animal k="alien" c={q.al} s={1.6} mood={am} /></Tap>
      <Tap p={[-2.6, -0.05, 0]} snd={null} fx="heart" on={() => animal('alien')}><Animal k="alien" c={q.c2} s={0.75} mood={am === 'idle' ? 'happy' : am} /></Tap><Person p={[2.3, -0.1, 0.4]} r={[0, -0.4, 0]} s={1.1} mood={am === 'dance' ? 'dance' : am === 'happy' ? 'happy' : 'wave'} outfit={outfit} />
      {[0, 1, 2, 3, 4, 5].map(i => !gems.includes(i) && <Tap key={i} p={[-3.8 + i * 1.5, 1.2 + (i % 2) * 2.2 + (i === 2 || i === 3 ? 1.5 : 0), 1]} bob={0.2} spin={1.4} hit={0.65} snd={null} on={p => gem(i, p)}>{i % 2 ? <Heart3 s={0.36} c="#ff6fae" o={{ em: 0.5, rough: 0.2 }} /> : <Star3 s={0.4} c="#ffe04a" o={{ em: 0.5, rough: 0.2 }} />}</Tap>)}
      <Tap p={[5, 0.9, -2.4]} hit={1.4} on={leave} glow={gems.length === 6}><group scale={0.8}><Rocket outfit={{}} /></group></Tap>
    </Stage><Back on={leave} /></>
  }
  return <>
    <Stage key="fly" sky={['#1f1f5c', '#7a4fb0']} sun={1.6} env={0.4} shadow={4}>
      <StarField /><TapPlane fl={fl} w={90} h={70} y={3} />
      {PL.map((q, i) => <group key={i} position={[q.p[0], q.p[1], -1.5]}><Tap spin={0.25} hit={q.r * 1.15} on={() => { goal.current = i; fl.current.tx = q.p[0]; fl.current.ty = q.p[1]; sfx('rocket') }}><Planet q={q} /></Tap>{visited.has(i) && <Star3 p={[0, q.r + 0.8, 1]} s={0.5} c="#ffd94f" o={{ em: 0.6 }} />}</group>)}
      {ST.map(([x, y], i) => !got.has(i) && <Tap key={i} p={[x, y, 0]} spin={1.5} bob={0.15} hit={0.8} on={() => { fl.current.tx = x; fl.current.ty = y }}><Star3 s={0.42} c="#ffe04a" o={{ em: 0.6 }} /></Tap>)}
      <Float p={[-6, 9.5, -3]} a={0.4}><Animal k="alien" c="#ffd257" s={0.8} mood="dance" /><Dome p={[0, 0.2, 0]} s={[1.2, 1.2, 1.2]} c="#d6f2ff" o={{ op: 0.25 }} /><S p={[0, 0, 0]} s={[1.7, 0.35, 1.7]} c="#b9c4e8" /></Float>
      <Float p={[7, -7, -6]} a={0.5}><S s={1.2} c="#9a94c8" /><S p={[0.5, 0.5, 0.8]} s={0.3} c="#8480b0" /></Float><Comet />
      <Flyer fl={fl} dir={dir} bx={17} by={[-9, 16]} z={21} max={8.5} rocket onTick={tick}><Tap on={() => { sfx('rocket'); burst([fl.current.x, fl.current.y - 1.6, 0], 'star', 20) }} hit={1.2} snd={null}><group scale={0.85}><Rocket outfit={outfit} /></group></Tap></Flyer>
    </Stage>
    <Joy dir={dir} /><div className="quest" style={{ fontSize: 28 }}>⭐ {got.size} · 🪐 {visited.size}/5</div>
  </>
}
function Comet() { const g = useRef<THREE.Group>(null!); useFrame(s => { const t = (s.clock.elapsedTime * 0.12) % 1; g.current.position.set(-40 + t * 80, 22 - t * 18, -14) }); return <group ref={g} rotation={[0, 0, -0.22]}><S s={0.5} c="#fff6c4" o={{ em: 1 }} ns /><K a={[0.45, 5]} r={[0, 0, Math.PI / 2]} p={[-2.6, 0, 0]} c="#ffe27a" o={{ op: 0.5, em: 0.8 }} /></group> }
void C; void Glide; void useEffect; void useThree
