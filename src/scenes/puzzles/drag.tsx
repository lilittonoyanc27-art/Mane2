import { useMemo, useState } from 'react'
import * as THREE from 'three'
import { B, C, S, T, K, Drag, Glide, Tap, Float, burst, shuffle, pick, type V3, rnd } from '../../kit/base'
import { RAINBOW, Flower } from '../../kit/nature'
import { Item } from '../../kit/items'
import { Person } from '../../kit/people'
import { PStage, usePz, type GP } from './common'
import { sfx, xylo } from '../../core/audio'
import { Tray } from '../../ui/HUD'

// ---------- рисованные картинки для пазлов ----------
function pic(k: number) {
  const c = document.createElement('canvas'); c.width = c.height = 512; const g = c.getContext('2d')!
  const sky = g.createLinearGradient(0, 0, 0, 512); const P = [['#9fdcff', '#ffe3f3'], ['#ffd1e8', '#fff3d0'], ['#7fd8f0', '#4aa8d8'], ['#8f8be8', '#e8b5f0']][k]; sky.addColorStop(0, P[0]); sky.addColorStop(1, P[1]); g.fillStyle = sky; g.fillRect(0, 0, 512, 512)
  const circ = (x: number, y: number, r: number, f: string, ry = r) => { g.fillStyle = f; g.beginPath(); g.ellipse(x, y, r, ry, 0, 0, 7); g.fill() }
  const poly = (f: string, ...p: number[]) => { g.fillStyle = f; g.beginPath(); g.moveTo(p[0], p[1]); for (let i = 2; i < p.length; i += 2) g.lineTo(p[i], p[i + 1]); g.fill() }
  const eye = (x: number, y: number, r: number) => { circ(x, y, r, '#3a2430'); circ(x + r * 0.3, y - r * 0.35, r * 0.32, '#fff') }
  const smile = (x: number, y: number, r: number) => { g.strokeStyle = '#a0405e'; g.lineWidth = 7; g.lineCap = 'round'; g.beginPath(); g.arc(x, y, r, 0.3, Math.PI - 0.3); g.stroke() }
  if (k === 0) { RAINBOW.forEach((q, i) => { g.strokeStyle = q; g.lineWidth = 17; g.beginPath(); g.arc(256, 400, 260 - i * 16, Math.PI, 0); g.stroke() }); circ(256, 560, 400, '#9fdf95', 170); g.fillStyle = '#fff0f8'; g.fillRect(150, 230, 212, 190); [[130, 190], [340, 190]].forEach(([x, y]) => { g.fillStyle = '#ffdcee'; g.fillRect(x, y, 62, 230); poly('#ff8fc5', x - 14, y, x + 31, y - 92, x + 76, y) }); g.fillStyle = '#ffe9f5'; g.fillRect(214, 140, 84, 120); poly('#b79bff', 196, 142, 256, 40, 316, 142); g.fillStyle = '#ffb07a'; g.beginPath(); g.arc(256, 360, 36, Math.PI, 0); g.rect(220, 360, 72, 60); g.fill(); [[161, 270], [371, 270], [256, 190]].forEach(([x, y]) => circ(x, y, 14, '#7fc4ff', 20)); circ(430, 80, 44, '#ffe27a') }
  if (k === 1) { circ(256, 600, 420, '#b5eaa6', 200); circ(256, 400, 120, '#ffb866', 100); circ(256, 235, 135, '#ffc27a'); poly('#ffc27a', 140, 175, 150, 60, 235, 120); poly('#ffc27a', 372, 175, 362, 60, 277, 120); poly('#ffa5b8', 160, 150, 166, 90, 212, 122); poly('#ffa5b8', 352, 150, 346, 90, 300, 122); eye(205, 225, 24); eye(307, 225, 24); circ(256, 272, 14, '#ff7f98', 10); smile(256, 278, 30); circ(165, 280, 24, '#ffa9b5', 16); circ(347, 280, 24, '#ffa9b5', 16); circ(256, 410, 62, '#fff3e0', 66); [[60, 400], [440, 430], [400, 330], [90, 300]].forEach(([x, y], j) => { for (let i = 0; i < 6; i++) circ(x + Math.cos(i * 1.05) * 24, y + Math.sin(i * 1.05) * 24, 18, ['#ff8fc5', '#b79bff', '#7fc4ff', '#ff8f7a'][j]); circ(x, y, 16, '#ffe27a') }) }
  if (k === 2) { poly('#ffe3a8', 0, 440, 160, 420, 330, 450, 512, 425, 512, 512, 0, 512); circ(250, 230, 130, '#ff9a5a', 100); poly('#ffd257', 370, 230, 470, 150, 470, 310); poly('#ffd257', 220, 140, 300, 70, 320, 150); g.fillStyle = '#fff'; g.fillRect(250, 140, 26, 180); eye(180, 205, 24); smile(165, 250, 26); [[60, 100, 22], [100, 50, 14], [420, 80, 18], [450, 380, 14]].forEach(([x, y, r]) => circ(x, y, r, '#ffffff99')); [90, 130, 430].forEach((x, i) => { g.strokeStyle = ['#5fc98a', '#4ab87a', '#ff8f9f'][i]; g.lineWidth = 20; g.lineCap = 'round'; g.beginPath(); g.moveTo(x, 470); g.bezierCurveTo(x - 40, 420, x + 40, 380, x, 320); g.stroke() }); circ(330, 455, 40, '#ffb9d0', 30) }
  if (k === 3) { for (let i = 0; i < 40; i++) circ((i * 97) % 512, (i * 61) % 400, 2 + i % 4, '#fff6c4'); circ(400, 110, 62, '#ffb07a'); g.strokeStyle = '#fff3b0'; g.lineWidth = 14; g.beginPath(); g.ellipse(400, 110, 100, 26, -0.3, 0, 7); g.stroke(); circ(90, 400, 100, '#8fe3b0'); circ(60, 380, 20, '#6fc898'); circ(120, 430, 26, '#6fc898'); g.save(); g.translate(256, 270); g.rotate(0.35); circ(0, 0, 66, '#fff', 150); poly('#ff7fae', -56, -80, 0, -190, 56, -80); poly('#b79bff', -60, 40, -120, 150, -40, 120); poly('#b79bff', 60, 40, 120, 150, 40, 120); circ(0, -30, 36, '#7fc4ff'); circ(0, -30, 24, '#d6f0ff'); poly('#ffb03a', -34, 138, 0, 230, 34, 138); g.restore() }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t
}
export function Jigsaw({ again }: GP) {
  const [n, setN] = useState(4), [rk, setRk] = useState(0)
  return <><JigsawRun key={n + '-' + rk} n={n} again={() => { void again; setN(n === 4 ? 6 : n === 6 ? 9 : 4); setRk(rk + 1) }} /><Tray small value={String(n)} items={[4, 6, 9].map(x => ({ id: String(x), icon: <b>{x}</b> }))} on={x => { setN(+x); setRk(rk + 1) }} /></>
}
function JigsawRun({ n, again }: { n: number; again: () => void }) {
  const z = usePz('jigsaw', again), tex = useMemo(() => pic(Math.floor(Math.random() * 4)), [])
  const cols = n === 4 ? 2 : 3, rows = n === 9 ? 3 : 2, W = 3.6 / cols, H = 3.6 / rows
  const pieces = useMemo(() => shuffle(Array.from({ length: n }, (_, i) => i)).map((id, o) => ({ id, home: [-5 + (o % 2) * 1.15 + (o % 4 > 1 ? 7.75 : 0), 3.4 - Math.floor(o / 4) * 1.35, 0.5] as V3 })), [n])
  const portrait = window.innerWidth < window.innerHeight
  const homes = pieces.map((p, o) => portrait ? [-1.7 + (o % 3) * 1.7, -1.3 - Math.floor(o / 3) * 1.15, 0.5] as V3 : p.home)
  const [ok, setOk] = useState<number[]>([])
  const slot = (id: number): V3 => [-1.8 + W / 2 + (id % cols) * W, 4.2 - H / 2 - Math.floor(id / cols) * H, 0.1]
  const geos = useMemo(() => Array.from({ length: n }, (_, id) => { const g = new THREE.BoxGeometry(W * 0.97, H * 0.97, 0.16), uv = g.attributes.uv; const c = id % cols, r = Math.floor(id / cols); for (let i = 0; i < uv.count; i++) uv.setXY(i, (c + uv.getX(i)) / cols, 1 - (r + 1 - uv.getY(i)) / rows); return g }), [n])
  const s = n === 4 ? 0.62 : 0.78
  return <PStage cam={portrait ? { t: [0, 1.3, 0], dir: [0, 0, 1], w: 5.8, h: 7.8, tray: true } : { t: [0, 2.4, 0], dir: [0, 0.05, 1], w: 11.2, h: 4.8, tray: true }}>
    <B a={[4.1, 4.1, 0.2]} p={[0, 2.4, -0.2]} c="#ffd98a" rad={0.15} /><B a={[3.7, 3.7, 0.1]} p={[0, 2.4, -0.1]} c="#fff8f0" rad={0.04} />
    <mesh position={[0, 2.4, -0.03]}><planeGeometry args={[3.6, 3.6]} /><meshBasicMaterial map={tex} transparent opacity={0.22} toneMapped={false} /></mesh>
    {Array.from({ length: n }, (_, id) => <mesh key={id} position={[slot(id)[0], slot(id)[1], -0.02]}><planeGeometry args={[W * 0.96, H * 0.96]} /><meshBasicMaterial color="#e8d3f0" transparent opacity={0.4} wireframe={false} /></mesh>)}
    {pieces.map((p, o) => { const d = ok.includes(p.id); return <Drag key={p.id} home={d ? slot(p.id) : homes[o]} s={d ? 1 : s} off={d} hit={0.9} goal={slot(p.id)} gr={Math.max(W, H) * 0.7} onDrop={(_, inG) => { const t = slot(p.id); if (inG) { const k = [...ok, p.id]; setOk(k); z.good(); burst([t[0], t[1], 0.6], 'star', 16); if (k.length === n) z.win(); return true } z.bad() }}><mesh geometry={geos[p.id]} castShadow><meshStandardMaterial map={tex} roughness={0.6} /></mesh></Drag> })}
  </PStage>
}
// ---------- собери радугу ----------
export function RainbowG({ again }: GP) {
  const z = usePz('rainbow', again), [n, setN] = useState(0), order = useMemo(() => shuffle(RAINBOW.map((_, i) => i)), []), [shake, setShake] = useState(-1)
  return <PStage cam={{ t: [0, 2.1, 0], dir: [0, 0.15, 1], w: 9, h: 5.8 }}>
    <group position={[0, 0.9, -1]}>{RAINBOW.map((c, i) => <group key={c}><T a={[3 - i * 0.28, 0.14]} arc={Math.PI} c={i < n ? c : '#ffffff'} o={i < n ? { em: 0.3 } : { op: 0.45 }} /></group>)}</group>
    {n < 7 && <Float p={[0, 4.35, 0]}><S s={0.3} c={RAINBOW[n]} o={{ em: 0.4 }} /><K a={[0.16, 0.3]} p={[0, -0.5, 0]} r={[Math.PI, 0, 0]} c="#fff" /></Float>}
    {order.map((i, o) => i >= n && <Tap key={i} p={[-3.6 + o * 1.2, 0.1, 1.4]} s={1} bob={0.05} glow={shake === n && i === n} hit={0.6} hitP={[0, 0.4, 0]} snd={null} on={() => { if (i === n) { xylo(72 + [0, 2, 4, 5, 7, 9, 11][n]); burst([0, 3, 0], 'star', 14); setN(n + 1); setShake(-1); if (n === 6) z.win() } else { z.bad(); setShake(n) } }}><T a={[0.38, 0.14]} arc={Math.PI} p={[0, 0.2, 0]} c={RAINBOW[i]} /><S p={[0, 0.2, 0]} s={0.18} c={RAINBOW[i]} /></Tap>)}
    <S p={[-2.4, 0.9, -0.8]} s={[1, 0.5, 0.6]} c="#fff" /><S p={[2.4, 0.9, -0.8]} s={[1, 0.5, 0.6]} c="#fff" />
  </PStage>
}
// ---------- по размеру ----------
export function SizeG({ again }: GP) {
  const z = usePz('size', again), k = useMemo(() => pick(['teddy', 'star', 'gift', 'apple', 'duck', 'cake']), []), order = useMemo(() => shuffle([0, 1, 2, 3]), []), [ok, setOk] = useState<number[]>([])
  const SZ = [0.55, 0.85, 1.15, 1.5], sx = [-3, -1.3, 0.6, 2.9]
  return <PStage cam={{ t: [0, 1.9, 0], dir: [0, 0.22, 1], w: 9, h: 5.6 }}>
    {SZ.map((s, i) => <group key={i} position={[sx[i], 0, -1]}><C a={[s * 0.7, s * 0.75, 0.5]} p={[0, 1.6, 0]} c={RAINBOW[i + 2]} /><C a={[s * 0.6, s * 0.6, 1.4]} p={[0, 0.7, 0]} c="#fff" />{!ok.includes(i) && <Item k={k} s={s * 0.9} p={[0, 1.85, 0]} shadow />}</group>)}
    {order.map((i, o) => { const d = ok.includes(i); return <Drag key={i} home={d ? [sx[i], 1.85, -1] : [-3.2 + o * 2.1, 0.05, 2]} s={SZ[i] * 0.9} off={d} hit={0.75 / Math.max(0.7, SZ[i])} goal={[sx[i], 1.95, -1]} gr={1} onDrop={(p, inG) => { const t = new THREE.Vector3(sx[i], 1.85, -1); if (inG) { const n = [...ok, i]; setOk(n); z.good(); burst(t, 'star', 16); if (n.length === 4) z.win(); return true } if (p.y > 0.7) z.bad() }}><Item k={k} /></Drag> })}
  </PStage>
}
// ---------- построй картинку ----------
interface Part { id: string; p: V3; el: (sh: boolean) => React.ReactNode }
const G = '#d5cbe6'
const BUILDS: Part[][] = [
  [{ id: 'wall', p: [0, 1, 0], el: s => <B a={[2, 1.6, 0.4]} c={s ? G : '#ffe9d0'} /> }, { id: 'roof', p: [0, 2.35, 0], el: s => <K a={[1.55, 1.1]} seg={4} r={[0, Math.PI / 4, 0]} s={[1, 1, 0.35]} c={s ? G : '#ff8fc5'} /> }, { id: 'door', p: [0, 0.65, 0.25], el: s => <B a={[0.6, 0.9, 0.2]} rad={0.2} c={s ? '#c2b5da' : '#b98a63'} /> }, { id: 'sun', p: [2.2, 3.2, 0], el: s => s ? <S s={0.5} c={G} /> : <group position={[0, -0.5, 0]}><Item k="sun" /></group> }, { id: 'tree', p: [-2.1, 0.2, 0], el: s => <Item k="tree" s={1.6} shadow={s} /> }],
  [{ id: 'body', p: [0, 0.75, 0], el: s => <S s={0.85} c={s ? G : '#ffffff'} /> }, { id: 'mid', p: [0, 1.95, 0], el: s => <S s={0.62} c={s ? G : '#ffffff'} /> }, { id: 'head', p: [0, 2.85, 0], el: s => <><S s={0.45} c={s ? G : '#fff'} />{!s && <>{[-0.14, 0.14].map(x => <S key={x} p={[x, 0.08, 0.42]} s={0.06} c="#3a2430" />)}<K a={[0.07, 0.3]} p={[0, -0.04, 0.55]} r={[1.57, 0, 0]} c="#ff8a3a" /></>}</> }, { id: 'hat', p: [0, 3.35, 0], el: s => <><C a={[0.5, 0.5, 0.08]} c={s ? '#c2b5da' : '#8f6bff'} /><C a={[0.32, 0.34, 0.5]} p={[0, 0.28, 0]} c={s ? '#c2b5da' : '#8f6bff'} /></> }, { id: 'heart', p: [0, 1.95, 0.68], el: s => <Item k="heart" s={0.5} p={[0, -0.25, 0]} shadow={s} /> }],
  [{ id: 'hull', p: [0, 0.6, 0], el: s => <C a={[1.9, 1.1, 0.8]} s={[1, 1, 0.4]} c={s ? G : '#ff8a7a'} /> }, { id: 'mast', p: [0, 2, 0], el: s => <C a={[0.08, 0.08, 2]} c={s ? '#c2b5da' : '#b98a63'} /> }, { id: 'sail', p: [0.75, 2.1, 0.1], el: s => <K a={[0.9, 1.7]} seg={4} s={[0.8, 1, 0.15]} c={s ? G : '#fff3b0'} /> }, { id: 'flag', p: [-0.35, 3, 0.1], el: s => <B a={[0.6, 0.35, 0.1]} c={s ? '#c2b5da' : '#ff8fc5'} /> }, { id: 'fish', p: [-2.5, 0.1, 0.3], el: s => <group rotation={[0, 1.2, 0]}><Item k="fish" shadow={s} s={1.1} /></group> }],
]
export function Build({ again }: GP) {
  const z = usePz('build', again), parts = useMemo(() => pick(BUILDS), []), order = useMemo(() => shuffle(parts.map((_, i) => i)), []), [ok, setOk] = useState<number[]>([])
  const portrait = window.innerWidth < window.innerHeight
  const homes = order.map((_, o) => portrait ? [-2 + (o % 3) * 2, -1.5 - Math.floor(o / 3) * 1.7, 0.6] as V3 : [o % 2 ? 4.6 : -4.6, 3 - Math.floor(o / 2) * 1.5, 0.6] as V3)
  return <PStage cam={portrait ? { t: [0, 0.8, 0], dir: [0, 0, 1], w: 7, h: 8.6 } : { t: [0, 2, 0], dir: [0, 0.08, 1], w: 11, h: 4.8 }}>
    <B a={[6.8, 4.4, 0.2]} p={[0, 2, -0.7]} c="#fff" rad={0.2} /><B a={[6.5, 4.1, 0.2]} p={[0, 2, -0.66]} c="#e6f5ff" rad={0.15} />
    {parts.map((q, i) => !ok.includes(i) && <group key={q.id} position={[q.p[0], q.p[1], q.p[2] - 0.15]}>{q.el(true)}</group>)}
    {order.map((i, o) => { const q = parts[i], d = ok.includes(i); return <Drag key={q.id} home={d ? q.p : homes[o]} s={d ? 1 : 0.6} off={d} hit={1.2} goal={q.p} gr={1.1} onDrop={(_, inG) => { if (inG) { const n = [...ok, i]; setOk(n); z.good(); burst([q.p[0], q.p[1], 0.8], 'star', 16); if (n.length === parts.length) { z.win(); sfx('magic') } return true } z.bad() }}>{q.el(false)}</Drag> })}
  </PStage>
}
void Glide; void Flower; void Person; void rnd
