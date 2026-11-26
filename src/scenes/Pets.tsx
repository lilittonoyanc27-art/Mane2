import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Stage, Tap, Glide, Drag, S, B, C, T, K, Star3, Heart3, burst, useLater, useOnce, Float, type V3, type Cam } from '../kit/base'
import { Room, Window3, Rug, Flower } from '../kit/nature'
import { Person } from '../kit/people'
import { Animal, type AKind, type AMood } from '../kit/animals'
import { Item } from '../kit/items'
import { say, task, type Phrase } from '../core/voice'
import { sfx, animal } from '../core/audio'
import { star, useSave } from '../core/store'
import { Tray, Back } from '../ui/HUD'

const PETS: { k: AKind; p: V3; c: string; food: string }[] = [{ k: 'cat', p: [-4.4, 0, -0.6], c: '#ffb9dc', food: 'milk' }, { k: 'dog', p: [-2.2, 0, -1], c: '#7fc4ff', food: 'bone' }, { k: 'rabbit', p: [0, 0, -1.2], c: '#c9b5ff', food: 'carrot' }, { k: 'turtle', p: [2.2, 0, -1], c: '#8fdc9a', food: 'lettuce' }, { k: 'parrot', p: [4.4, 0, -0.6], c: '#ffd98a', food: 'seeds' }]
type Act = '' | 'feed' | 'bath' | 'brush' | 'wear' | 'play' | 'sleep' | 'house'
const ACTS: { id: Act; icon: string }[] = [{ id: 'feed', icon: '🍽️' }, { id: 'bath', icon: '🛁' }, { id: 'brush', icon: '🪮' }, { id: 'wear', icon: '🎀' }, { id: 'play', icon: '⚽' }, { id: 'sleep', icon: '🌙' }, { id: 'house', icon: '🏠' }]
const voice = (k: AKind) => animal(k)

function PetHouse({ c, deco }: { c: string; deco: number }) {
  return <group position={[0, 0, -1.4]}><B a={[2, 1.5, 1.2]} p={[0, 0.75, 0]} c={c} rad={0.15} /><K a={[1.5, 1.3]} r={[0, 0, 0]} p={[0, 2.1, 0]} c="#ff9ecb" /><C a={[0.5, 0.5, 0.1]} r={[Math.PI / 2, 0, 0]} p={[0, 0.7, 0.6]} c="#8a5a6c" /><B a={[1, 0.6, 0.1]} p={[0, 0.35, 0.6]} c="#8a5a6c" rad={0.02} />
    {deco >= 1 && deco % 4 === 1 && [-0.75, 0.75].map(x => <Flower key={x} p={[x, 0, 0.8]} s={1.3} />)}
    {deco % 4 === 2 && [0, 1, 2, 3, 4].map(i => <Star3 key={i} p={[-0.8 + i * 0.4, 1.4 + Math.sin(i) * 0.1, 0.65]} s={0.16} c={['#ffd257', '#ff8fc5', '#7fc4ff'][i % 3]} o={{ em: 0.4 }} />)}
    {deco % 4 === 3 && [0, 1, 2].map(i => <Heart3 key={i} p={[-0.6 + i * 0.6, 1.35, 0.65]} s={0.2} c="#ff5a9c" />)}
    {deco > 3 && deco % 4 === 0 && [-1, 1].map(x => <Float key={x} p={[x, 2.2, 0.3]}><Item k="balloon" c={x > 0 ? '#b79bff' : '#ff8fc5'} s={0.8} /></Float>)}</group>
}
export function Pets() {
  const pets = useSave(s => s.pets), set = useSave(s => s.set), outfit = useSave(s => s.outfit)
  const [sel, setSel] = useState<number | null>(null), [act, setAct] = useState<Act>(''), [mood, setMood] = useState<AMood>('idle'), [hop, setHop] = useState(-1), later = useLater(), [prog, setProg] = useState(0), pr = useRef(0), [foam, setFoam] = useState<V3[]>([]), [ball, setBall] = useState<V3>([1.6, 0, 1.6]), [fed, setFed] = useState(false), lastFx = useRef(0)
  useOnce(() => void task('pets_intro'))
  const P = sel === null ? null : PETS[sel], st = (k: string) => pets[k] ?? { wear: 0, house: 0, happy: 0 }
  const upd = (k: string, o: Partial<{ wear: number; house: number; happy: number }>) => set({ pets: { ...useSave.getState().pets, [k]: { ...st(k), ...o } } })
  const glad = (m: AMood = 'happy', t = 1900) => { setMood(m); later(() => setMood('idle'), t) }
  const done = () => { if (!P) return; glad(); voice(P.k); if (P.k === 'cat') later(() => animal('purr'), 600); burst([0, 2, 0.6], 'heart', 26); star(1); void say('pet_thanks'); upd(P.k, { happy: st(P.k).happy + 1 }) }
  const choose = (i: number) => { setSel(i); setAct(''); setMood('happy'); later(() => setMood('idle'), 1500); voice(PETS[i].k); void say(('pet_' + PETS[i].k) as Phrase) }
  const doAct = (a: Act) => {
    setAct(a); pr.current = 0; setProg(0); setFoam([]); setFed(false); setMood('idle')
    void task(('pet_' + a) as Phrase)
    if (a === 'sleep') { setMood('sleep'); sfx('snore'); later(() => sfx('snore'), 2000) }
    if (a === 'house' && P) { upd(P.k, { house: st(P.k).house + 1 }); sfx('magic'); burst([0, 2.2, -0.6], 'star', 24); glad('dance', 1500) }
    if (a === 'wear' && P) { upd(P.k, { wear: (st(P.k).wear + 1) % 6 }); sfx('magic'); burst([0, 2, 0.4], 'star', 20); glad('dance', 1500) }
  }
  const rub = (p: THREE.Vector3) => {
    const t = performance.now(); if (t - lastFx.current < 90) return; lastFx.current = t
    if (act === 'bath') { sfx('bubble'); burst(p, 'bubble', 4, 0.4); pr.current++; setProg(pr.current); if (foam.length < 22) setFoam(f => [...f, [p.x, p.y, p.z]]); setMood('tickle'); if (pr.current === 26) { setFoam([]); sfx('splash'); burst([0, 2.4, 0.4], 'drop', 60, 1.2); pr.current = 999; done() } }
    else if (act === 'brush') { sfx('stir'); burst(p, 'star', 3, 0.4); pr.current++; setProg(pr.current); setMood('tickle'); if (pr.current === 20) { pr.current = 999; done() } }
    else if (act === 'sleep') return
  }
  const tapPet = () => { if (!P) return; if (act === 'sleep') { setMood('happy'); setAct(''); void say('pet_wake'); voice(P.k); later(() => setMood('idle'), 1500) } else if (act !== 'bath' && act !== 'brush') { voice(P.k); glad(); burst([0, 2, 0.6], 'heart', 10) } }
  const night = act === 'sleep'
  const cam: Cam = P ? { t: [0, 1.25, 0], dir: [0, 0.22, 1], w: 5.4, h: 4, tray: true } : { t: [0, 1.6, -0.5], dir: [0, 0.3, 1], w: 11.6, h: 5 }
  return <>
    <Stage cam={cam} sky={night ? ['#4a4f9a', '#b9a0d8'] : ['#bfe6ff', '#ffeedd']} sun={night ? 0.5 : 1.9} env={night ? 0.2 : 0.5}>
      <Room wall={night ? '#8a7fc0' : '#e3f0d0'} floor="#f0cda0" w={14} d={7.5} /><Window3 p={[-3, 3.8, -3.5]} night={night} /><Window3 p={[3, 3.8, -3.5]} night={night} /><Rug p={[0, 0.02, 0.6]} r={2.4} c={['#d9f0ff', '#fff', '#ffd3ec']} />
      {!P ? <>{PETS.map((q, i) => <Tap key={q.k} p={q.p} hit={1.05} hitP={[0, 0.9, 0]} snd={null} fx="heart" on={() => { setHop(i); voice(q.k); later(() => { setHop(-1); choose(i) }, 650) }}><PetHouse c={q.c} deco={st(q.k).house} /><Animal k={q.k} s={1.1} wear={st(q.k).wear} mood={hop === i ? 'happy' : 'idle'} /></Tap>)}<Person p={[-1.2, 0, 1.7]} r={[0, 0.2, 0]} s={0.85} mood="wave" outfit={outfit} /></> : <>
        <PetHouse c={P.c} deco={st(P.k).house} />
        {act === 'bath' && <group position={[0, 0, 0.3]}><C a={[1.35, 1.1, 0.75]} p={[0, 0.38, 0]} c="#fff" /><C a={[1.2, 1.2, 0.08]} p={[0, 0.74, 0]} c="#8fdcff" /><T a={[1.34, 0.09]} p={[0, 0.76, 0]} r={[Math.PI / 2, 0, 0]} c="#ffb9dc" /></group>}
        {night && <group position={[0, 0, 0.3]}><C a={[1.2, 1.3, 0.3]} p={[0, 0.15, 0]} c="#b79bff" /><T a={[1.15, 0.22]} p={[0, 0.3, 0]} r={[Math.PI / 2, 0, 0]} c="#ffd3ec" /><Float p={[0.9, 2.3, 0]}><Item k="moon" s={0.8} /></Float></group>}
        <group position={[0, act === 'bath' ? 0.5 : night ? 0.25 : 0, 0.3]} onPointerMove={e => { if (e.nativeEvent.buttons) { e.stopPropagation(); rub(e.point) } }} onPointerDown={e => { e.stopPropagation(); (act === 'bath' || act === 'brush') ? rub(e.point) : tapPet() }}>
          <Animal k={P.k} s={1.45} mood={mood} wear={st(P.k).wear} /><mesh position={[0, 1, 0]}><sphereGeometry args={[1.2, 12, 10]} /><meshBasicMaterial transparent opacity={0} depthWrite={false} /></mesh>
        </group>
        {foam.map((f, i) => <S key={i} p={f} s={0.16 + (i % 3) * 0.06} c="#fff" o={{ rough: 0.2, op: 0.95 }} ns />)}
        {act === 'brush' && <Float p={[1.6, 1.4, 1]} a={0.1}><B a={[0.3, 0.9, 0.16]} c="#ff8fc5" rad={0.1} /><B a={[0.2, 0.7, 0.2]} p={[-0.2, 0, 0]} c="#fff" /></Float>}
        {act === 'feed' && <><group position={[0, 0, 1.6]}><C a={[0.55, 0.45, 0.25]} p={[0, 0.13, 0]} c="#ff9ecb" /></group>{!fed && <Drag home={[1.7, 0.3, 1.4]} s={0.85} hit={0.8} onDrop={() => { setFed(true); setMood('eat'); sfx('crunch'); later(() => sfx('crunch'), 700); later(() => sfx('crunch'), 1400); later(done, 2100); return true }}><Tap bob={0.06} glow hitP={[0, 0.5, 0]}><Item k={P.food} /></Tap></Drag>}{fed && mood === 'eat' && <Glide p={[0, 0.2, 1.6]} from={[1.7, 0.3, 1.4]} s={0.6} arc={1}><Item k={P.food} /></Glide>}</>}
        {act === 'play' && <Ball p={ball} on={() => { sfx('boing'); setBall([(Math.random() - 0.5) * 4, 0, 0.8 + Math.random() * 1.2]); glad('happy', 1200); voice(P.k); pr.current++; setProg(pr.current); if (pr.current === 4) done() }} />}
        {(act === 'bath' || act === 'brush') && prog < 30 && Array.from({ length: 5 }, (_, i) => <Heart3 key={i} p={[-1 + i * 0.5, 3.3, 0]} s={0.18} c={prog > i * (act === 'bath' ? 5 : 4) ? '#ff5a9c' : '#f5dcea'} />)}
      </>}
    </Stage>
    {P && <><Back on={() => { setSel(null); setAct(''); setMood('idle'); void task('pets_intro') }} /><Tray value={act} items={ACTS.map(a => ({ id: a.id, icon: a.icon }))} on={a => doAct(a as Act)} /></>}
  </>
}
function Ball({ p, on }: { p: V3; on: () => void }) {
  const g = useRef<THREE.Group>(null!), q = useRef(new THREE.Vector3(...p)), t = useRef(1), last = useRef('')
  useFrame((_, d) => { const key = p.join(); if (key !== last.current) { last.current = key; t.current = 0 } t.current = Math.min(1, t.current + d * 1.4); q.current.lerp(new THREE.Vector3(...p), d * 4); g.current.position.set(q.current.x, Math.abs(Math.sin(t.current * Math.PI * 2.5)) * 1.4 * (1 - t.current), q.current.z); g.current.rotation.z -= d * (1 - t.current) * 9 })
  return <group ref={g}><Tap on={on} snd={null} hit={0.8} hitP={[0, 0.4, 0]}><Item k="ball" /></Tap></group>
}
