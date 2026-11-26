import { useEffect, useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Stage, Tap, Float, Orbit, Sign, burst, Star3, S, C, K, B, T, useLater, Disc, Heart3, type V3 } from '../kit/base'
import { Castle, Clouds, Butterflies, Meadow, Island, Flower, Tree, Rainbow, Mushroom, House, Cloud, Pine } from '../kit/nature'
import { Person, Fairy, Uncle, Bow, Anulik } from '../kit/people'
import { useFam } from '../core/family'
import { Animal } from '../kit/animals'
import { Item } from '../kit/items'
import { say, task, text, type Phrase } from '../core/voice'
import { go, useUI } from '../core/ui'
import { useSave } from '../core/store'
import { Big } from '../ui/HUD'
import { sfx, unlockAudio } from '../core/audio'

export function Title() {
  const outfit = useSave(s => s.outfit), photo = useSave(s => s.photo)
  const [started, setStarted] = useState(false), later = useLater(), [m, setM] = useState<'wave' | 'happy'>('wave')
  const hello = () => { unlockAudio(); void say('hello') }
  // браузеры разрешают звук только после касания — здороваемся при первом же
  useEffect(() => { const f = () => { if (!started) { setStarted(true); hello() } }; window.addEventListener('pointerdown', f, { once: true }); return () => window.removeEventListener('pointerdown', f) }, [])
  return <>
    <Stage cam={{ t: [0, 2.1, 0], dir: [0, 0.16, 1], w: 9.5, h: 7.4, tray: true }} fog={[22, 60]} onMiss={() => burst([0, 2, 2], 'heart', 8)}>
      <Island r={17} /><Meadow n={230} rad={14} /><Clouds /><Rainbow p={[0, 0, -6]} s={2.3} />
      <Castle p={[0, 0, -3]} s={1.5} /><Tree p={[-4.6, 0, -2]} s={1.2} /><Tree p={[4.8, 0, -2.4]} s={1.3} c="#ffb9dc" /><Pine p={[-6, 0, 0.5]} /><Tree p={[6, 0, 0.4]} c="#c5b0ff" /><Mushroom p={[-3.2, 0, 1.6]} /><Mushroom p={[3.4, 0, 1.4]} c="#b79bff" s={0.8} />
      {[[-2.6, 2.6], [2.5, 2.7], [-4, 2.2], [4.2, 2.1], [-1.2, 3.3], [1.6, 3.4]].map(([x, z], i) => <Tap key={i} p={[x, 0, z]} on={() => sfx('magic')} fx="heart"><Flower s={1.2} c={['#ff8fc5', '#ffd257', '#b79bff', '#ff7a8a', '#8fd3ff', '#ffb07a'][i]} /></Tap>)}
      <Tap p={[0, 0, 1]} on={() => { setM('happy'); later(() => setM('wave'), 1800); hello(); burst([0, 2, 1.4], 'heart', 16) }}><Person s={1.35} mood={m} outfit={outfit} /></Tap>
      <Tap p={[-3.4, 0, 1.4]} on={() => sfx('squeak')}><Animal k="cat" s={0.85} r={[0, 0.4, 0]} /></Tap><Tap p={[3.4, 0, 1.4]} on={() => sfx('giggle')}><Animal k="rabbit" s={0.85} r={[0, -0.4, 0]} /></Tap>
      <Tap p={[-1.75, 0, 0.7]} on={() => { void say('h_hi_title' as Phrase) }}><Uncle s={1.5} r={[0, 0.35, 0]} mood="wave" /></Tap>
      <Tap p={[1.75, 0, 0.7]} on={() => { void say('a_hi_title' as Phrase) }}><Anulik s={1.38} r={[0, -0.35, 0]} mood="idle" look={useFam.getState().look} /></Tap>
      <Float p={[-2.6, 2.6, 0.4]}><Fairy s={0.6} mood="fly" /></Float>
      <Butterflies n={7} c={[0, 1.6, 0.5]} rad={4.5} />
      {[0, 1, 2, 3].map(i => <Orbit key={i} rad={5} c={[0, 5, -3]} sp={0.2} ph={i * 1.57}><Star3 s={0.2} c="#ffe27a" o={{ em: 0.8 }} /></Orbit>)}
    </Stage>
    <div className="title"><h1>Մանեի աշխարհը</h1><br /><h2>Волшебный мир Мане</h2></div>
    <div className="acts">
      <button className="uncle" aria-label="Հարություն" onClick={() => { sfx('magic'); go('card') }}>{photo ? <img src={photo} alt="" /> : '🎁'}</button>
      <Big c="#ff7fbf" label="Խաղալ" on={() => { unlockAudio(); go('who') }}><span className="play">{'▶\uFE0E'}</span></Big>
      <button className="uncle" style={{ background: 'radial-gradient(circle at 34% 20%,#fff,#ffd257 70%)', boxShadow: '0 7px 0 #d9a032,0 14px 24px #8a6a1f44' }} aria-label="Մանեի սենյակը" onClick={() => { sfx('magic'); go('room') }}>👑</button>
    </div>
  </>
}

const PLACES: { id: string; icon: () => React.ReactNode; c: string }[] = [
  { id: 'adventure', c: '#a8e6b0', icon: () => <><Castle s={0.6} /><Pine p={[-1.2, 0, 0.5]} s={0.5} /><Pine p={[1.2, 0, 0.5]} s={0.5} /></> },
  { id: 'kitchen', c: '#ffd9a8', icon: () => <><Item k="cake" s={1.6} /><Item k="strawberry" p={[-1, 0, 0.4]} s={0.6} /><Item k="icecream" p={[1.05, 0.1, 0.3]} s={0.8} /></> },
  { id: 'pets', c: '#ffe6b8', icon: () => <><House s={0.75} p={[0, 0, -0.6]} /><Animal k="cat" p={[-0.6, 0, 0.6]} s={0.65} /><Animal k="dog" p={[0.65, 0, 0.6]} s={0.65} /></> },
  { id: 'market', c: '#c8f0d0', icon: () => <><B a={[2, 0.7, 1]} p={[0, 0.35, 0]} c="#d9a06b" />{[-0.6, 0, 0.6].map((x, i) => <Item key={i} k={['apple', 'banana', 'orange'][i]} p={[x, 0.7, 0.1]} s={0.6} />)}{[0, 1, 2, 3, 4].map(i => <B key={i} a={[0.45, 0.14, 1.2]} p={[-0.9 + i * 0.45, 1.85, 0]} r={[0.2, 0, 0]} c={i % 2 ? '#fff' : '#ff8fa8'} />)}<C a={[0.05, 0.05, 1.9]} p={[-1, 0.95, 0.4]} c="#fff" /><C a={[0.05, 0.05, 1.9]} p={[1, 0.95, 0.4]} c="#fff" /></> },
  { id: 'prank', c: '#ffc9dd', icon: () => <><Animal k="bear" s={0.95} mood="dance" /><Item k="balloon" p={[-0.95, 0.7, 0]} /><Item k="balloon" c="#7fc4ff" p={[0.95, 0.9, 0]} /></> },
  { id: 'puzzles', c: '#d3cbff', icon: () => <>{[['#ff8fc5', -0.45, 0], ['#7fc4ff', 0.45, 0], ['#ffd257', -0.45, 0.9], ['#8fdc9a', 0.45, 0.9]].map(([c, x, y]) => <group key={c as string}><B a={[0.86, 0.86, 0.5]} p={[x as number, 0.45 + (y as number), 0]} c={c as string} /><S s={0.17} p={[x as number, 0.45 + (y as number), 0.2]} c="#fff" /></group>)}</> },
  { id: 'salon', c: '#ffd3ec', icon: () => <><T a={[0.75, 0.12]} p={[0, 1.2, -0.3]} c="#ffd257" /><S s={[0.72, 0.72, 0.04]} p={[0, 1.2, -0.3]} c="#d6f0ff" o={{ rough: 0.05, metal: 0.4 }} /><Bow c="#ff5a9c" s={2} p={[0, 2, -0.2]} /><Item k="crown" p={[0, 0.02, 0.5]} s={0.8} /></> },
  { id: 'car', c: '#bfe6ff', icon: () => <><Disc a={1.5} p={[0, 0.03, 0]} c="#9a94b8" /><Item k="car" s={1.7} r={[0, -0.6, 0]} /></> },
  { id: 'garden', c: '#c9f0b0', icon: () => <>{[-0.8, 0, 0.8].map((x, i) => <Flower key={i} p={[x, 0, i % 2 ? 0.3 : 0]} s={2} c={['#ff8fc5', '#ffd257', '#b79bff'][i]} />)}</> },
  { id: 'music', c: '#ffe0c0', icon: () => <><B a={[2.2, 0.35, 0.9]} p={[0, 0.3, 0]} c="#8f6bff" />{Array.from({ length: 7 }, (_, i) => <B key={i} a={[0.26, 0.12, 0.7]} p={[-0.85 + i * 0.285, 0.52, 0.1]} c={['#ff7a8a', '#ffb07a', '#ffe27a', '#8fe3a0', '#7fc4ff', '#8f9bff', '#c79bff'][i]} rad={0.04} />)}<Float p={[0, 1.4, 0]}><S s={0.22} c="#ff5a9c" /><C a={[0.04, 0.04, 0.7]} p={[0.2, 0.35, 0]} c="#ff5a9c" /><S s={0.1} p={[0.3, 0.65, 0]} c="#ff5a9c" /></Float></> },
  { id: 'birthday', c: '#ffcfe8', icon: () => <><Item k="cake" s={1.4} c="#8fd3ff" /><Item k="candle" p={[0, 1.2, 0]} s={0.6} /><Item k="gift" p={[-1.1, 0, 0.3]} s={0.7} /><Item k="gift" p={[1.1, 0, 0.3]} s={0.7} c="#ff8fa8" /></> },
  { id: 'draw', c: '#fff0b8', icon: () => <><B a={[1.8, 1.5, 0.12]} p={[0, 1.1, -0.2]} r={[-0.15, 0, 0]} c="#fff" /><Heart3 p={[0, 1.15, -0.08]} s={0.4} c="#ff7fae" />{[-0.6, 0, 0.6].map((x, i) => <K key={i} a={[0.12, 0.9]} p={[x, 0.3, 0.5]} r={[1.2, 0, 0]} c={['#ff7a8a', '#7fc4ff', '#8fdc9a'][i]} />)}</> },
  { id: 'space', c: '#b8b5ff', icon: () => <><Item k="rocket" s={1.9} /><Float p={[-1, 1.6, 0]}><S s={0.28} c="#ffb07a" /><T a={[0.42, 0.04]} r={[1.3, 0.3, 0]} c="#fff3b0" /></Float><Star3 p={[1, 1.9, 0]} s={0.2} c="#ffe27a" o={{ em: 0.7 }} /></> },
  { id: 'sea', c: '#a8e6f0', icon: () => <><S s={[1.4, 0.2, 1]} c="#5fc8e8" /><Animal k="fish" p={[0, 0.5, 0]} r={[0, 1.2, 0]} s={1.3} /><Item k="shell" p={[-1, 0.1, 0.5]} s={0.7} /><Item k="starfish" p={[1, 0.1, 0.5]} s={0.7} /></> },
  { id: 'room', c: '#ffdfe8', icon: () => <><B a={[1.7, 0.4, 1.2]} p={[0, 0.3, 0]} c="#b79bff" rad={0.15} /><Item k="pillow" p={[-0.5, 0.4, 0]} s={0.7} c="#fff" /><B a={[0.15, 1.2, 1.2]} p={[-0.9, 0.6, 0]} c="#ff9ecb" rad={0.07} /><Item k="crown" p={[0.4, 0.55, 0]} s={0.7} /></> },
  { id: 'card', c: '#e6d3ff', icon: () => <><Uncle s={0.85} mood="wave" p={[0.3, 0, 0]} /><Item k="gift" p={[-0.8, 0, 0.5]} s={0.8} c="#ff7fae" /></> },
  // --- продолжение ---
  { id: 'shub', c: '#ffd3ec', icon: () => <><Anulik s={0.75} p={[0.45, 0, 0]} /><Person s={0.62} p={[-0.45, 0, 0.3]} /></> },
  { id: 'fhub', c: '#c9f0b0', icon: () => <><Uncle s={0.6} p={[-0.75, 0, 0]} /><Person s={0.5} p={[0, 0, 0.3]} /><Anulik s={0.55} p={[0.75, 0, 0]} /></> },
  { id: 'city', c: '#cfe6ff', icon: () => <><House s={0.6} p={[-0.6, 0, -0.3]} c="#e6dcff" roof="#b79bff" /><House s={0.75} p={[0.55, 0, -0.4]} /><Item k="car" s={0.9} p={[0, 0, 0.7]} r={[0, -0.6, 0]} /></> },
  { id: 'mnew', c: '#fff0b8', icon: () => <><Item k="balloon" p={[-0.8, 0.6, 0]} /><Item k="teddy" s={1.1} /><Item k="balloon" c="#7fc4ff" p={[0.85, 0.8, 0]} /></> },
  { id: 'tales', c: '#ffe0c0', icon: () => <><Uncle s={0.75} mood="wave" p={[0.4, 0, 0]} /><B a={[0.8, 0.12, 0.6]} p={[-0.6, 0.5, 0.4]} r={[0.4, 0.3, 0]} c="#ff8fc5" /></> },
]
const R = 11, STEP = Math.PI * 2 / PLACES.length
function Ring({ target, onPick }: { target: React.MutableRefObject<number>; onPick: (i: number) => void }) {
  const ref = useRef<THREE.Group>(null!), gs = useRef<(THREE.Group | null)[]>([])
  useFrame((_, d) => {
    ref.current.rotation.y += (target.current - ref.current.rotation.y) * (1 - Math.exp(-d * 5))
    gs.current.forEach((g, i) => { if (!g) return; const a = ref.current.rotation.y + i * STEP; g.visible = Math.cos(a) > -0.15; const f = Math.max(0, Math.cos(a)); g.scale.setScalar(0.72 + f * f * f * 0.5) })
  })
  return <group ref={ref}>{PLACES.map((q, i) => <group key={q.id} ref={g => { gs.current[i] = g }} position={[Math.sin(i * STEP) * R, 0, Math.cos(i * STEP) * R]} rotation={[0, i * STEP, 0]}>
    <Tap on={() => onPick(i)} hit={1.5} hitP={[0, 1, 0]}>
      <C a={[1.75, 1.6, 0.45]} p={[0, 0.22, 0]} c={q.c} /><T a={[1.72, 0.08]} p={[0, 0.45, 0]} r={[Math.PI / 2, 0, 0]} c="#fff" />
      <Float p={[0, 0.5, 0]} a={0.07} rot={0.02}>{q.icon()}</Float>
      <Sign t={text(('s_' + q.id) as Phrase)} p={[0, 0.3, 1.95]} w={2.7} h={0.46} r={[-0.25, 0, 0]} />
    </Tap></group>)}</group>
}
let remembered = 0
export function Hub() {
  const target = useRef(-remembered * STEP), idx = useRef(remembered), [walk, setWalk] = useState<'idle' | 'walk' | 'happy'>('idle'), later = useLater(), outfit = useSave(s => s.outfit)
  const dragX = useRef<{ x: number; t: number; moved: boolean } | null>(null), lock = useRef(false)
  useEffect(() => { const t = setTimeout(() => void task('hub'), 900); return () => clearTimeout(t) }, [])
  const turn = (n: number) => { idx.current += n; target.current = -idx.current * STEP; sfx('whoosh'); setWalk('walk'); later(() => setWalk('idle'), 700) }
  const name = () => { remembered = ((idx.current % PLACES.length) + PLACES.length) % PLACES.length }
  const pickP = (i: number) => {
    if (lock.current || dragX.current?.moved) return
    lock.current = true
    const n = PLACES.length, cur = ((idx.current % n) + n) % n; let df = i - cur; if (df > n / 2) df -= n; if (df < -n / 2) df += n
    idx.current += df; target.current = -idx.current * STEP; name()
    setWalk(df ? 'walk' : 'happy'); later(() => { setWalk('happy'); burst([0, 1.6, R + 2.4], 'star', 22) }, df ? 600 : 0)
    void say(('s_' + PLACES[i].id) as Phrase); later(() => { useFam.getState().set({ ret: 'hub', adv: null }); go(PLACES[i].id) }, 1300)
  }
  useEffect(() => { const k = (e: KeyboardEvent) => { if (e.code === 'ArrowRight') turn(1); if (e.code === 'ArrowLeft') turn(-1); if (e.code === 'Enter' || e.code === 'Space') pickP(((idx.current % PLACES.length) + PLACES.length) % PLACES.length) }; window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k) }, [])
  return <div style={{ position: 'absolute', inset: 0 }}
    onPointerDown={e => { dragX.current = { x: e.clientX, t: target.current, moved: false } }}
    onPointerMove={e => { const q = dragX.current; if (!q || !e.buttons) return; const dx = e.clientX - q.x; if (Math.abs(dx) > 14) { q.moved = true; target.current = q.t + dx / window.innerWidth * 1.6 } }}
    onPointerUp={() => { const q = dragX.current; if (q?.moved) { idx.current = Math.round(-target.current / STEP); target.current = -idx.current * STEP; name() } later(() => { dragX.current = null }, 30) }}>
    <HubStage target={target} pickP={pickP} walk={walk} outfit={outfit} />
    <button className="arrow l" aria-label="ձախ" onClick={() => turn(-1)}>{'◀\uFE0E'}</button><button className="arrow r" aria-label="աջ" onClick={() => turn(1)}>{'▶\uFE0E'}</button>
  </div>
}
function HubStage({ target, pickP, walk, outfit }: { target: React.MutableRefObject<number>; pickP: (i: number) => void; walk: 'idle' | 'walk' | 'happy'; outfit: any }) {
  const deco = useMemo(() => Array.from({ length: 14 }, (_, i) => ({ p: [Math.cos(i * 0.45 + 0.2) * (5 + (i % 3)), 0, Math.sin(i * 0.45 + 0.2) * (5 + (i % 3))] as V3, k: i % 3 })), [])
  // нажатие отложено: сначала проверяем, не был ли это жест прокрутки
  const pend = (i: number) => { const f = () => { window.removeEventListener('pointerup', f, true); pickP(i) }; window.addEventListener('pointerup', f, true) }
  return <Stage cam={{ t: [0, 2, R], dir: [0, 0.3, 1], w: 6.6, h: 7 }} center={[0, 0, R - 2]} shadow={10} fog={[26, 60]}>
    <Island r={30} /><Meadow n={260} rad={20} /><C a={[9.2, 9.2, 0.1]} p={[0, 0.0, 0]} c="#bff0b4" ns seg={60} /><T a={[12.9, 0.55]} p={[0, -0.42, 0]} r={[Math.PI / 2, 0, 0]} c="#ffe9c9" ns />
    <Castle s={1.7} p={[0, 0, -3]} /><Rainbow p={[0, 0, -8]} s={2.8} /><Clouds y={8} />
    {deco.map((q, i) => q.k === 0 ? <Tree key={i} p={q.p} c={['#8fdc9a', '#ffb9dc', '#c5b0ff'][i % 3]} /> : q.k === 1 ? <Flower key={i} p={q.p} s={1.8} c="#ff8fc5" /> : <Mushroom key={i} p={q.p} s={1.3} />)}
    <Ring target={target} onPick={pend} />
    <Person p={[2.1, 0, R + 1.9]} s={0.85} r={[0, -0.35, 0]} mood={walk} outfit={outfit} /><Animal k="cat" p={[-2.1, 0, R + 1.9]} s={0.55} r={[0, 0.4, 0]} mood={walk === 'happy' ? 'happy' : 'idle'} />
    <Butterflies n={5} c={[0, 2.9, R - 4]} rad={4} /><Float p={[-4, 6, 2]}><Cloud s={0.8} /></Float>
  </Stage>
}
void useUI
