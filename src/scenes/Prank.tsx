import { useEffect, useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Stage, Tap, Glide, S, B, C, T, K, burst, shower, useLater, useOnce, type V3, rnd } from '../kit/base'
import { Room, Rug, RAINBOW } from '../kit/nature'
import { Person } from '../kit/people'
import { Animal, type AMood } from '../kit/animals'
import { Item } from '../kit/items'
import { say, task } from '../core/voice'
import { sfx, animal, tone } from '../core/audio'
import { star, useSave } from '../core/store'
import { Tray } from '../ui/HUD'

const BALL = ['#ff8fc5', '#7fc4ff', '#ffd257', '#b79bff', '#8fe3b0', '#ff9a6a']
function Balloon({ i, pop }: { i: number; pop: (p: THREE.Vector3) => void }) {
  const [on, setOn] = useState(true), g = useRef<THREE.Group>(null!), later = useLater(), x = -5 + i * 1.15, o = useMemo(() => rnd(0, 6), [])
  useFrame(s => { const t = s.clock.elapsedTime + o; g.current.position.set(x + Math.sin(t * 0.7) * 0.3, 3.6 + Math.sin(t) * 0.3 + (i % 2) * 0.7, -1.6 + Math.cos(t * 0.5) * 0.2) })
  return <group ref={g}>{on && <Tap snd="pop" fx="confetti" hit={0.6} hitP={[0, 0.8, 0]} on={p => { setOn(false); burst(p, 'confetti', 26, 1.1); pop(p); later(() => setOn(true), 2600) }}><Item k="balloon" c={BALL[i % 6]} s={1.1} /></Tap>}</group>
}
function Pillow({ home, c }: { home: V3; c: string }) {
  const g = useRef<THREE.Group>(null!), v = useRef(new THREE.Vector3()), p = useRef(new THREE.Vector3(...home)), w = useRef(0)
  useFrame((_, d0) => { const d = Math.min(d0, 0.05), q = p.current; v.current.y -= 9 * d; q.addScaledVector(v.current, d); if (q.y < home[1]) { q.y = home[1]; if (Math.abs(v.current.y) > 1) { v.current.y *= -0.45; sfx('tap') } else { v.current.y = 0 } v.current.x *= 0.7; w.current *= 0.6; q.x += (home[0] - q.x) * 0.02 } if (Math.abs(q.x) > 6) v.current.x *= -1; g.current.position.copy(q); g.current.rotation.z += w.current * d })
  return <group ref={g}><Tap on={() => { v.current.set(rnd(-2, 2), rnd(5.5, 8), 0); w.current = rnd(-9, 9); sfx('boing'); const q = p.current; burst([q.x, q.y + 0.5, q.z], 'confetti', 10) }} snd={null} hit={0.75} hitP={[0, 0.3, 0]}><Item k="pillow" c={c} s={1.1} /></Tap></group>
}
function Wall({ color }: { color: string }) {
  const { tex, g, cv } = useMemo(() => { const cv = document.createElement('canvas'); cv.width = 768; cv.height = 512; const g = cv.getContext('2d')!; g.fillStyle = '#fffdf8'; g.fillRect(0, 0, 768, 512); const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace; return { tex, g, cv } }, [])
  const last = useRef<[number, number] | null>(null), hue = useRef(0), told = useRef(0)
  useEffect(() => { if (color === 'clear') { g.fillStyle = '#fffdf8'; g.fillRect(0, 0, 768, 512); tex.needsUpdate = true } }, [color])
  const dot = (uv?: THREE.Vector2) => {
    if (!uv || color === 'clear') return
    const x = uv.x * cv.width, y = (1 - uv.y) * cv.height
    g.strokeStyle = color === 'rainbow' ? `hsl(${hue.current += 6},90%,65%)` : color; g.lineWidth = 26; g.lineCap = 'round'; g.beginPath(); g.moveTo(...(last.current ?? [x, y] as [number, number])); g.lineTo(x, y); g.stroke(); last.current = [x, y]; tex.needsUpdate = true
    if (performance.now() - told.current > 160) { told.current = performance.now(); tone(400 + uv.y * 600, 0.12, 'sine', 0.12) }
  }
  return <group position={[-3.7, 2, -2.6]}><B a={[3.7, 2.7, 0.14]} c="#ffd98a" /><mesh position={[0, 0, 0.09]} onPointerDown={e => { e.stopPropagation(); last.current = null; dot(e.uv) }} onPointerMove={e => { if (e.nativeEvent.buttons) { e.stopPropagation(); dot(e.uv) } else last.current = null }} onPointerUp={() => { last.current = null }} onPointerOut={() => { last.current = null }}><planeGeometry args={[3.4, 2.4]} /><meshBasicMaterial map={tex} toneMapped={false} /></mesh></group>
}
const TOYS = [['ball', '#ff4f5e'], ['car', '#7fc4ff'], ['cube', '#ffd257']] as const
export function Prank() {
  const outfit = useSave(s => s.outfit), later = useLater(), [bear, setBear] = useState<AMood>('idle'), [hid, setHid] = useState<boolean[]>([false, false, false]), [color, setColor] = useState('#ff5a9c'), [fxm, setFx] = useState(''), [mood, setMood] = useState<'idle' | 'happy' | 'dance'>('idle'), cnt = useRef(0), big = useRef<THREE.Group>(null!), disco = useRef<THREE.Group>(null!), [ducks, setDucks] = useState(0)
  useOnce(() => void task('pr_intro'))
  const score = () => { if (++cnt.current % 6 === 0) { star(1); void say('pr_wow'); setMood('happy'); later(() => setMood('idle'), 1800) } }
  const tickle = () => { setBear('tickle'); sfx('giggle'); void say('pr_tickle'); burst([1.5, 1.8, 0], 'heart', 12); later(() => setBear('idle'), 1500); score() }
  const hide = (i: number) => { const n = [...hid]; n[i] = !n[i]; setHid(n); sfx('whoosh'); score(); if (n.every(Boolean)) { setBear('walk'); void say('pr_hidden'); later(() => { setBear('happy'); setHid([false, false, false]); sfx('giggle'); shower([4, 4, 0], 2, 'heart', 20); later(() => setBear('idle'), 1500) }, 3600) } else if (n.filter(Boolean).length === 1) void say('pr_hide') }
  const BTN: [string, string, () => void][] = [['#ff5a8f', '🎉', () => { shower([0, 6, 0], 5, 'confetti', 120); sfx('applause') }], ['#7fc4ff', '🦆', () => { setDucks(d => d + 1); animal('duck') }], ['#ffd257', '🪩', () => { setFx('disco'); setMood('dance'); setBear('dance'); sfx('magic'); later(() => { setFx(''); setMood('idle'); setBear('idle') }, 5000) }], ['#8fe3b0', '🧸', () => { setFx('giant'); sfx('boing'); later(() => { setFx(''); sfx('pop') }, 3500) }], ['#b79bff', '🫧', () => { for (let i = 0; i < 20; i++) later(() => { burst([rnd(-5, 5), 0.3, rnd(-1, 2)], 'bubble', 5); sfx('bubble') }, i * 120) }], ['#ff9a6a', '🙃', () => { setFx('flip'); sfx('fart'); later(() => setFx(''), 3000) }]]
  return <>
    <Stage cam={{ t: [0, 2.3, 0], dir: [0, 0.16, 1], w: 12, h: 5.8, tray: true }} sky={['#ffd3ec', '#fff3d9']} shadow={8} sun={fxm === 'disco' ? 0.7 : 1.9}>
      <Room wall="#ffe3f0" floor="#e6d2ff" w={14} h={7.5} /><Rug p={[0, 0.02, 1]} r={2.4} c={RAINBOW.slice(0, 5)} />
      <Wall color={color} />
      {BALL.concat(BALL.slice(0, 4)).map((_, i) => <Balloon key={i} i={i} pop={score} />)}
      {/* волшебные кнопки */}
      <B a={[4.4, 2.2, 0.2]} p={[3.8, 2.6, -2.7]} c="#a78bfa" rad={0.2} />{BTN.map(([c, e, f], i) => <Tap key={i} p={[2.5 + (i % 3) * 1.3, 3.15 - Math.floor(i / 3) * 1.1, -2.5]} on={() => { f(); score() }} hit={0.5}><C a={[0.5, 0.55, 0.3]} r={[Math.PI / 2, 0, 0]} c={c} /><group position={[0, 0, 0.2]}><Em e={e} /></group></Tap>)}
      <Giant g={big} on={fxm === 'giant'}><group position={[0, 0, 0]}><Tap p={[1.5, 0, 0.2]} on={tickle} snd={null} fx="heart" hit={1.1} hitP={[0, 1, 0]}><Animal k="bear" s={1.45} mood={bear} wear={1} /></Tap></group></Giant>
      <Person p={[-1, 0, 0.2]} s={1.2} r={fxm === 'flip' ? [0, 0, Math.PI] : undefined} mood={mood} outfit={outfit} />
      {(['#b79bff', '#ff9ecb', '#8fd3ff', '#ffd98a'] as const).map((c, i) => <Pillow key={c} home={[-5 + i * 1.15, 0, 1.9]} c={c} />)}
      {/* машинка для пузырей */}
      <Tap p={[-5.6, 0, 0.2]} on={() => { for (let i = 0; i < 8; i++) later(() => { burst([-5.3, 1.6, 0.4], 'bubble', 5, 0.8); sfx('bubble') }, i * 110); score() }} hit={0.9} hitP={[0, 0.7, 0]}><B a={[1, 1, 0.8]} p={[0, 0.5, 0]} c="#7fc4ff" rad={0.2} /><T a={[0.35, 0.09]} p={[0.2, 1.4, 0]} c="#ff8fc5" /><S p={[0, 0.5, 0.42]} s={[0.25, 0.25, 0.05]} c="#fff" /></Tap>
      {/* пушка конфетти */}
      <Tap p={[0.1, 0, 2.1]} on={() => { sfx('pop'); sfx('whoosh'); burst([0.1, 1.2, 2.1], 'confetti', 60, 1.6); shower([0, 5.5, 0], 4, 'confetti', 50); score() }} hit={0.8} hitP={[0, 0.5, 0]}><C a={[0.45, 0.28, 1]} p={[0, 0.55, 0]} r={[0.2, 0, 0.2]} c="#ff8fc5" /><T a={[0.45, 0.08]} p={[-0.1, 1.05, 0.1]} r={[1.4, 0.2, 0]} c="#ffd257" /></Tap>
      {/* коробка и игрушки */}
      <Tap p={[5.4, 0, 0.6]} on={() => { if (hid.some(Boolean)) { setHid([false, false, false]); sfx('pop'); burst([5.4, 1.4, 0.6], 'star', 20) } else void say('pr_hide') }} hit={0.9} hitP={[0, 0.5, 0]}><B a={[1.5, 0.9, 1.2]} p={[0, 0.45, 0]} c="#ffb07a" /><B a={[1.3, 0.1, 1]} p={[0, 0.88, 0]} c="#a5693f" /></Tap>
      {TOYS.map(([k, c], i) => <Glide key={k} p={hid[i] ? [5.4, 0.3, 0.6] : [3.2 + i * 1.1, 0, 2]} s={hid[i] ? 0.25 : 0.85} arc={1.6}><Tap on={hid[i] ? undefined : () => hide(i)} hit={0.6} hitP={[0, 0.4, 0]}><Item k={k} c={c} /></Tap></Glide>)}
      {Array.from({ length: Math.min(ducks, 8) * 5 }, (_, i) => <Duck key={i} i={i} />)}
      <group visible={fxm === 'disco'}><Disco g={disco} /></group>
    </Stage>
    <Tray small value={color} items={['#ff5a9c', '#ff9a2e', '#ffd93b', '#5fcf6a', '#4aa8ff', '#9a6bff', 'rainbow', 'clear'].map(c => ({ id: c, icon: c === 'rainbow' ? '🌈' : c === 'clear' ? '🧽' : <i className="sw" style={{ background: c }} /> }))} on={c => { setColor(c); if (c !== 'clear') void say('pr_paint') }} />
  </>
}
import { Emoji } from '../kit/base'
const Em = ({ e }: { e: string }) => <Emoji e={e} s={0.62} />
function Giant({ on, g, children }: { on: boolean; g: React.MutableRefObject<THREE.Group>; children: React.ReactNode }) { useFrame((_, d) => { const s = g.current.scale.x + ((on ? 1.9 : 1) - g.current.scale.x) * Math.min(1, d * 5); g.current.scale.setScalar(s) }); return <group ref={g}>{children}</group> }
function Duck({ i }: { i: number }) {
  const g = useRef<THREE.Group>(null!), y = useRef(6 + (i % 5) * 1.2), v = useRef(0), x = useMemo(() => rnd(-5, 5), []), z = useMemo(() => rnd(0.6, 2.6), [])
  useFrame((_, d0) => { const d = Math.min(d0, 0.05); v.current -= 9 * d; y.current += v.current * d; if (y.current < 0) { y.current = 0; if (v.current < -1.2) { v.current *= -0.5 } else v.current = 0 } g.current.position.set(x, y.current, z) })
  return <group ref={g}><Tap on={() => { v.current = 6; y.current += 0.1; animal('duck') }} snd={null}><C a={[0.01, 0.01, 0.01]} /><S p={[0, 0.2, 0]} s={[0.26, 0.22, 0.32]} c="#ffe06a" /><S p={[0, 0.48, 0.14]} s={0.18} c="#ffe06a" /><K a={[0.08, 0.16]} p={[0, 0.45, 0.36]} r={[1.57, 0, 0]} c="#ff9a4a" />{[-0.08, 0.08].map(q => <S key={q} p={[q, 0.54, 0.29]} s={0.03} c="#3a2430" ns />)}</Tap></group>
}
function Disco({ g }: { g: React.MutableRefObject<THREE.Group> }) {
  useFrame(s => { g.current.rotation.y = s.clock.elapsedTime * 2; g.current.children.forEach((c, i) => { const l = c as THREE.PointLight; if (l.isPointLight) l.color.setHSL((s.clock.elapsedTime * 0.3 + i * 0.33) % 1, 1, 0.6) }) })
  return <group ref={g} position={[0, 5, 0]}><S s={0.6} c="#fff" o={{ metal: 1, rough: 0.12 }} />{[0, 1, 2].map(i => <pointLight key={i} position={[Math.cos(i * 2.1) * 3, -1.5, Math.sin(i * 2.1) * 3]} intensity={30} />)}</group>
}
