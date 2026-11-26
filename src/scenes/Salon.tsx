import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Stage, Tap, S, B, C, T, K, Star3, burst, shower, useLater, useOnce, Float, type Cam } from '../kit/base'
import { Room, Rug } from '../kit/nature'
import { Person, DRESS, HAIRC, SHOES, BOWC, type Mood } from '../kit/people'
import { Animal } from '../kit/animals'
import { say, task } from '../core/voice'
import { sfx, music } from '../core/audio'
import { win, useSave, type Outfit } from '../core/store'
import { Tray, Big, Back, type TI } from '../ui/HUD'

type Cat = keyof Outfit
const CATS: { id: Cat; icon: string }[] = [{ id: 'dress', icon: '👗' }, { id: 'shoes', icon: '👟' }, { id: 'hair', icon: '💇‍♀️' }, { id: 'hairColor', icon: '🎨' }, { id: 'hat', icon: '👒' }, { id: 'bow', icon: '🎀' }, { id: 'jewel', icon: '💎' }]
const sw = (c: string, e = '') => <i className="sw" style={{ background: c, display: 'grid', placeItems: 'center', fontStyle: 'normal', fontSize: 28 }}>{e}</i>
export function Salon() {
  const save = useSave(), [who, setWho] = useState(0), [cat, setCat] = useState<Cat>('dress'), [other, setOther] = useState<Outfit[]>([{ dress: 6, shoes: 2, hair: 1, hairColor: 3, hat: 1, bow: 0, jewel: 1 }, { dress: 9, shoes: 2, hair: 1, hairColor: 2, hat: 5, bow: 0, jewel: 0 }]), [show, setShow] = useState(false), [mood, setMood] = useState<Mood>('idle'), later = useLater(), [spin, setSpin] = useState(0)
  useOnce(() => void task('sl_intro'))
  const fit = who === 0 ? save.outfit : other[who - 1]
  const change = (k: Cat, v: number) => {
    const n = { ...fit, [k]: v }; if (who === 0) save.set({ outfit: n }); else setOther(o => o.map((x, i) => i === who - 1 ? n : x))
    sfx('magic'); burst([0, 1.6, 0.8], 'star', 20); setMood('happy'); setSpin(s => s + 1); later(() => setMood('idle'), 1100)
  }
  const magic = ['dr1', 'dr2', 'dr3', 'dr4', 'dr5'].map((d, i) => save.unlocked.includes(d) ? 6 + i : -1).filter(x => x > 0)
  const opts: TI[] = cat === 'dress' ? [0, 1, 2, 3, 4, 5, ...magic].map(i => ({ id: String(i), icon: sw(`linear-gradient(140deg,${DRESS[i].c},${DRESS[i].c} 55%,${DRESS[i].c2})`, DRESS[i].n) })) : cat === 'shoes' ? SHOES.map((c, i) => ({ id: String(i), icon: sw(c, '👟') })) : cat === 'hair' ? ['👧', '👩‍🦰', '🥯', '🐴', '👩‍🦱'].map((e, i) => ({ id: String(i), icon: e })) : cat === 'hairColor' ? HAIRC.map((c, i) => ({ id: String(i), icon: sw(c) })) : cat === 'hat' ? ['🚫', '👑', '👒', '🧙‍♀️', '🐰', '🌸'].map((e, i) => ({ id: String(i), icon: e })) : cat === 'bow' ? BOWC.map((c, i) => ({ id: String(i), icon: i ? sw(c, '🎀') : '🚫' })) : ['🚫', '📿', '💖', '⭐'].map((e, i) => ({ id: String(i), icon: e }))
  const start = () => { setShow(true); void say('sl_show'); music('party'); sfx('applause'); later(() => sfx('applause'), 4000); for (let i = 0; i < 8; i++) later(() => { shower([0, 5, 0], 4, i % 2 ? 'heart' : 'confetti', 30) }, 2500 + i * 1400); later(() => { void say('sl_done'); win('salon', 3, false); sfx('applause') }, 10500) }
  const stop = () => { setShow(false); music('menu') }
  const cam: Cam = show ? { t: [0, 1.9, 0], dir: [0, 0.3, 1], w: 9, h: 5.4 } : { t: [0.2, 1.5, 0], dir: [0, 0.1, 1], w: 5.6, h: 4, tray: true }
  return <>
    <Stage cam={cam} sky={show ? ['#4a3f8a', '#b58fd8'] : ['#ffe3f2', '#fff3e6']} sun={show ? 0.9 : 1.9} env={show ? 0.35 : 0.5}>
      <Room wall={show ? '#7a68b8' : '#ffe6f2'} floor={show ? '#8f7fc8' : '#f5d6c0'} w={14} d={8} />
      {!show ? <>
        <Rug p={[0, 0.02, 0.4]} r={1.7} /><C a={[1.1, 1.2, 0.2]} p={[0, 0.1, 0]} c="#fff" />
        <group position={[0, 0.2, 0]}><Tap on={() => { setMood('spin'); later(() => setMood('idle'), 1600) }} hit={1.1} hitP={[0, 1, 0]}><Spin n={spin}><Person s={1.35} mood={mood === 'idle' ? 'idle' : mood} outfit={fit} wings={who === 2} skin={who === 1 ? '#f5c9a8' : undefined} /></Spin></Tap></group>
        {/* зеркало с отражением */}
        <group position={[2.5, 0, -1]} rotation={[0, -0.45, 0]}><S p={[0, 1.8, 0]} s={[1.15, 1.75, 0.1]} c="#ffd98a" /><S p={[0, 1.8, 0.04]} s={[1.02, 1.6, 0.1]} c="#d9f2ff" o={{ rough: 0.05, metal: 0.25, em: 0.12 }} /><group position={[0, 0.65, 0.16]} scale={[0.82, 0.82, 0.1]}><Person s={1.1} mood={mood} outfit={fit} wings={who === 2} /></group><B a={[1.6, 0.2, 0.6]} p={[0, 0.1, 0]} c="#ffd98a" />{[0, 1, 2, 3, 4].map(i => <S key={i} p={[Math.cos(0.5 + i * 0.535) * 1.2, 1.8 + Math.sin(0.5 + i * 0.535) * 1.8, 0.1]} s={0.1} c="#fff3b0" o={{ em: 1 }} />)}</group>
        {/* гардероб */}
        <group position={[-3, 0, -1.6]}><B a={[2.6, 3.6, 0.9]} p={[0, 1.8, 0]} c="#ffcfe3" rad={0.15} /><B a={[2.2, 3, 0.2]} p={[0, 1.9, 0.4]} c="#fff6fa" /><C a={[0.05, 0.05, 2.1]} r={[0, 0, 1.57]} p={[0, 3.1, 0.7]} c="#ffd98a" />{[0, 1, 2, 3].map(i => <Tap key={i} p={[-0.78 + i * 0.52, 2.2, 0.7]} on={() => { setCat('dress'); change('dress', i + 1) }}><K a={[0.28, 0.9]} p={[0, 0.1, 0]} c={DRESS[i + 1].c} /><S p={[0, 0.5, 0]} s={[0.17, 0.16, 0.14]} c={DRESS[i + 1].c} /><T a={[0.22, 0.03]} p={[0, -0.32, 0]} r={[1.57, 0, 0]} c={DRESS[i + 1].c2} /></Tap>)}{[0, 1, 2].map(i => <Tap key={i} p={[-0.6 + i * 0.6, 0.55, 0.75]} on={() => { setCat('shoes'); change('shoes', i) }}><S s={[0.18, 0.13, 0.25]} c={SHOES[i]} /></Tap>)}</group>
      </> : <>
        <B a={[3, 0.5, 9]} p={[0, 0.25, 0.4]} c="#ffb9dc" rad={0.1} />{Array.from({ length: 10 }, (_, i) => [-1.5, 1.5].map(x => <S key={i + '' + x} p={[x, 0.5, -3.5 + i * 0.8]} s={0.12} c={['#ffd257', '#7fc4ff', '#ff5a9c'][i % 3]} o={{ em: 0.9 }} ns />))}
        <B a={[4.4, 4.4, 0.2]} p={[0, 2.6, -3.6]} c="#ff8fc5" rad={0.3} /><Star3 p={[0, 3.4, -3.4]} s={0.9} c="#ffd257" o={{ em: 0.5 }} />
        <Walk><Person s={1.15} mood="walk" outfit={fit} wings={who === 2} skin={who === 1 ? '#f5c9a8' : undefined} /></Walk>
        {(['cat', 'dog', 'rabbit', 'bear', 'duck', 'pig'] as const).map((k, i) => <Animal key={k} k={k} p={[(i < 3 ? -1 : 1) * 2.8, 0, -1.4 + (i % 3) * 1.7]} r={[0, (i < 3 ? 1 : -1) * 1.1, 0]} s={0.9} mood="happy" />)}
        <Lights />
      </>}
      <Float p={[0, 9, 0]}><S s={0.01} /></Float>
    </Stage>
    {show ? <><Back on={stop} /></> : <>
      <div className="lside">{['👧🏻', '👸', '🧚'].map((e, i) => <button key={i} className={'tb' + (who === i ? ' on' : '')} onClick={() => { setWho(i); sfx('tap'); void say('sl_who') }}>{e}</button>)}<button className="tb" style={{ ['--c' as string]: '#ffd257' }} aria-label="Ցուցադրություն" onClick={start}>🎬</button></div>
      <div className="tray up" style={{ padding: '0 10px' }}><div className="trayin">{opts.map(o => <button key={cat + o.id} className={'tb' + (String(fit[cat]) === o.id ? ' on' : '')} onClick={() => change(cat, +o.id)}>{o.icon}</button>)}</div></div>
      <Tray small value={cat} items={CATS} on={c => setCat(c as Cat)} />
    </>}
  </>
}
void Big
function Spin({ n, children }: { n: number; children: React.ReactNode }) { const g = useRef<THREE.Group>(null!), t = useRef(0), l = useRef(n); useFrame((_, d) => { if (l.current !== n) { l.current = n; t.current = 1 } t.current = Math.max(0, t.current - d * 1.3); g.current.rotation.y = t.current * t.current * Math.PI * 2 }); return <group ref={g}>{children}</group> }
function Walk({ children }: { children: React.ReactNode }) { const g = useRef<THREE.Group>(null!); useFrame(s => { const t = s.clock.elapsedTime * 0.55, z = Math.sin(t); g.current.position.set(0, 0.5, 0.2 + z * 3); g.current.rotation.y = Math.cos(t) > 0 ? 0 : Math.PI + (z > 0.9 ? (z - 0.9) * 30 : 0) }); return <group ref={g}>{children}</group> }
function Lights() { const g = useRef<THREE.Group>(null!); useFrame(s => g.current.children.forEach((c, i) => { c.position.x = Math.sin(s.clock.elapsedTime * 1.4 + i * 2) * 3; (c as THREE.PointLight).color?.setHSL((s.clock.elapsedTime * 0.12 + i * 0.33) % 1, 0.9, 0.7) })); return <group ref={g}>{[0, 1, 2].map(i => <pointLight key={i} position={[0, 3.6, 2 - i * 1.5]} intensity={18} />)}</group> }
