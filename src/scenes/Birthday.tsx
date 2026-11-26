import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Stage, Tap, Glide, S, B, C, T, K, Star3, Heart3, burst, shower, useLater, useOnce, Float, type V3, type Cam, rnd } from '../kit/base'
import { Room, Rug, Window3, RAINBOW, Flower } from '../kit/nature'
import { Person, Uncle, Princess, Bow } from '../kit/people'
import { Animal, type AKind } from '../kit/animals'
import { Item } from '../kit/items'
import { Decorate, CakeLayers, CAKEC, TOPS, usePuts } from '../kit/decorate'
import { say, task } from '../core/voice'
import { sfx } from '../core/audio'
import { star, win, useSave } from '../core/store'
import { Tray, Back, Big } from '../ui/HUD'

type Step = 'party' | 'balloon' | 'decor' | 'cake' | 'candle' | 'wrap' | 'invite' | 'uncle'
const BC = ['#ff8fc5', '#7fc4ff', '#ffd257', '#b79bff', '#8fe3b0', '#ff9a6a']
const DEC: { id: string; icon: string }[] = [{ id: 'garland', icon: '🎏' }, { id: 'stars', icon: '⭐' }, { id: 'hearts', icon: '💖' }, { id: 'flowers', icon: '🌸' }, { id: 'rug', icon: '🌈' }, { id: 'lights', icon: '💡' }]
const GUEST: { k: AKind; icon: string }[] = [{ k: 'cat', icon: '🐱' }, { k: 'dog', icon: '🐶' }, { k: 'rabbit', icon: '🐰' }, { k: 'bear', icon: '🧸' }, { k: 'duck', icon: '🦆' }, { k: 'parrot', icon: '🦜' }]
const PAPER = ['#ff8fc5', '#a78bfa', '#7fc4ff', '#8fdc9a', '#ffd257']
function Decor({ d }: { d: string[] }) {
  return <>
    {d.includes('garland') && Array.from({ length: 13 }, (_, i) => { const t = i / 12; return <K key={i} a={[0.28, 0.5]} seg={3} r={[Math.PI, 0, 0]} p={[-5.6 + t * 11.2, 5.1 - Math.sin(t * Math.PI * 2) ** 2 * 0.6, -3]} c={RAINBOW[i % 7]} /> })}
    {d.includes('stars') && Array.from({ length: 7 }, (_, i) => <Float key={i} p={[-5 + i * 1.65, 4.1 + (i % 2) * 0.4, -2.6]}><Star3 s={0.28} c="#ffd257" o={{ em: 0.5 }} /></Float>)}
    {d.includes('hearts') && [-4.6, -3.6, 3.6, 4.6].map((x, i) => <Heart3 key={x} p={[x, 2.6 + (i % 2) * 0.8, -3]} s={0.4} c={i % 2 ? '#ff5a9c' : '#ff9ecb'} />)}
    {d.includes('flowers') && [-5.2, -4.4, 4.4, 5.2].map((x, i) => <Flower key={x} p={[x, 0, -1.8]} s={2} c={BC[i]} />)}
    {d.includes('rug') && <Rug p={[0, 0.03, 1.4]} r={3} c={RAINBOW} />}
    {d.includes('lights') && Array.from({ length: 16 }, (_, i) => <S key={i} p={[-5.6 + i * 0.75, 5.7 - (i % 2) * 0.2, -2.8]} s={0.14} c={RAINBOW[i % 7]} o={{ em: 1.2 }} ns />)}
  </>
}
function FloatBalloon({ c, i }: { c: string; i: number }) {
  const g = useRef<THREE.Group>(null!), y = useRef(1.2), x = useRef(-5 + (i * 2.3) % 10)
  const [gone, setGone] = useState(false)
  useFrame(s => { y.current += (3.4 + (i % 3) * 0.6 - y.current) * 0.02; g.current.position.set(x.current + Math.sin(s.clock.elapsedTime * 0.7 + i) * 0.3, y.current + Math.sin(s.clock.elapsedTime + i) * 0.15, -1.8 + (i % 3) * 0.3) })
  return <group ref={g}>{!gone && <Tap snd="pop" fx="confetti" hit={0.6} hitP={[0, 0.8, 0]} on={() => { setGone(true); setTimeout(() => setGone(false), 4000) }}><Item k="balloon" c={c} s={1.1} /></Tap>}</group>
}
export function Birthday() {
  const [step, setStep] = useState<Step>('party'), later = useLater(), outfit = useSave(s => s.outfit), [bal, setBal] = useState<string[]>([]), [air, setAir] = useState(0), [dec, setDec] = useState<string[]>([]), [layers, setLayers] = useState<string[]>(['#ff9ecb']), [top, setTop] = useState('cherry'), [cs, setCs] = useState(0), deco = usePuts(), [lit, setLit] = useState<boolean[]>([false, false, false, false, false]), [gifts, setGifts] = useState<string[]>([]), [gs, setGs] = useState(0), [paper, setPaper] = useState(PAPER[0]), [guests, setGuests] = useState<AKind[]>([]), [sur, setSur] = useState(0), [mood, setMood] = useState<'idle' | 'happy' | 'dance'>('idle'), blown = useRef(false), [toy, setToy] = useState('teddy')
  useOnce(() => void task('bd_intro'))
  const joy = (m: 'happy' | 'dance' = 'happy', t = 2000) => { setMood(m); later(() => setMood('idle'), t) }
  const enter = (s: Step) => { setStep(s); if (s === 'wrap') { setGs(0) } if (s === 'candle') { setLit([false, false, false, false, false]); blown.current = false } if (s === 'cake') setCs(0); setAir(0); void task(({ party: 'bd_intro', balloon: 'bd_balloon', decor: 'bd_decor', cake: 'bd_cake', candle: 'bd_light', wrap: 'bd_wrap', invite: 'bd_invite', uncle: 'bd_uncle' } as const)[s]) }
  const pump = () => { const n = air + 1; sfx('blow'); setAir(n); if (n >= 4) { later(() => { sfx('magic'); burst([0, 2.4, 1.6], 'star', 20); setBal(b => [...b.slice(-11), BC[(b.length) % 6]]); setAir(0); joy(); if ((bal.length + 1) % 3 === 0) star(1) }, 400) } }
  const light = (i: number) => { if (lit[i] || blown.current) return; const n = [...lit]; n[i] = true; setLit(n); sfx('star'); if (n.every(Boolean)) later(() => void task('bd_blow'), 500) }
  const blow = () => { if (!lit.every(Boolean)) { void say('bd_light'); return } blown.current = true; sfx('blow'); burst([0, 3, 1.6], 'bubble', 20); later(() => { setLit([false, false, false, false, false]); sfx('applause'); shower([0, 6, 1], 5, 'confetti', 100); win('birthday-candle', 2, false); void say('bd_happy'); joy('dance', 4000) }, 500); later(() => { blown.current = false }, 2000) }
  const wrap = () => { const n = gs + 1; setGs(n); sfx('paper'); burst([0, 1.8, 1.8], 'star', 12); if (n === 3) { win('birthday-gift', 1); joy(); later(() => { setGifts(g => [...g.slice(-5), paper]); setGs(0); setToy(t => t === 'teddy' ? 'car' : t === 'car' ? 'rocket' : 'teddy') }, 2000) } }
  const invite = (k: string) => { if (guests.includes(k as AKind)) return; sfx('ding'); setGuests([...guests, k as AKind]); burst([0, 2, 1], 'heart', 14); if (guests.length === 2) star(1) }
  const surprise = () => { setSur(1); sfx('door'); void say('bd_uncle'); later(() => setSur(2), 3200); later(() => { setSur(3); sfx('applause'); void say('bd_surprise'); shower([0, 6, 1], 5, 'confetti', 130); shower([0, 6, 1], 5, 'heart', 40); setMood('dance'); win('birthday-uncle', 3, false) }, 5200); later(() => void say('card_thanks'), 9800); later(() => { setMood('idle') }, 14000) }
  const dark = step === 'uncle' && (sur === 1 || sur === 2)
  const close = step === 'cake' || step === 'candle' || step === 'wrap' || step === 'balloon'
  const cam: Cam = close ? { t: [0, 2.1, 1.4], dir: [0, 0.22, 1], w: 5.2, h: 4.2, tray: true } : { t: [0, 2.4, 0], dir: [0, 0.2, 1], w: 11.4, h: 5.8, tray: true }
  return <>
    <Stage cam={cam} sky={['#ffd3ec', '#fff0d6']} sun={dark ? 0.25 : 1.9} env={dark ? 0.12 : 0.5}>
      <Room wall={dark ? '#6a5a98' : '#e8e0ff'} floor={dark ? '#7a6a8a' : '#f5d6c0'} w={14} d={8} /><Window3 p={[-3.4, 3.2, -3.7]} night={dark} /><Window3 p={[3.4, 3.2, -3.7]} night={dark} />
      <Decor d={dec} />{bal.map((c, i) => <FloatBalloon key={i} c={c} i={i} />)}
      <group position={[0, 0, 1.2]}><C a={[1.9, 1.9, 0.2]} p={[0, 1.1, 0]} c="#fff" /><C a={[1.95, 1.8, 0.6]} p={[0, 0.85, 0]} c="#ffc2e2" /><C a={[0.4, 0.6, 0.8]} p={[0, 0.4, 0]} c="#c99a6b" />
        {step !== 'wrap' && step !== 'balloon' && <group position={[0, 1.26, 0]} scale={0.85}><Decorate top={top} puts={deco.puts} add={deco.add} off={!(step === 'cake' && cs === 1)}><CakeLayers layers={layers} /></Decorate>
          {lit.map((l, i) => { const a = -0.9 + i * 0.45 + Math.PI / 2, h = layers.length * 0.55, r = Math.max(0.25, 1.2 - (layers.length - 1) * 0.22) * 0.65; return (step === 'candle' || step === 'uncle' || step === 'party') && <Tap key={i} p={[Math.cos(a) * r * 1.15, h, Math.sin(a) * r * 0.7]} snd={null} fx={step === 'candle' ? 'star' : null} on={step === 'candle' ? () => light(i) : undefined} hit={0.24} hitP={[0, 0.35, 0]} glow={false}><C a={[0.07, 0.08, 0.6]} p={[0, 0.3, 0]} c={BC[i]} /><C a={[0.012, 0.012, 0.1]} p={[0, 0.64, 0]} c="#5b4a5c" />{(l || sur === 3) && <Flame />}</Tap> })}</group>}
        {step === 'wrap' && <Tap p={[0, 1.2, 0]} on={gs < 3 ? wrap : undefined} hit={1.1} hitP={[0, 0.6, 0]} glow={gs < 3}>{gs === 0 ? <><B a={[1.5, 0.9, 1.5]} p={[0, 0.45, 0]} c="#e2b98a" /><Item k={toy} p={[0, 0.75, 0]} s={1.1} /></> : <><B a={[1.5, 1.1, 1.5]} p={[0, 0.55, 0]} c={paper} />{[[-0.4, 0.4], [0.4, 0.8], [0, 0.6], [-0.4, 0.9], [0.4, 0.3]].map(([x, y], i) => <Star3 key={i} p={[x, y, 0.77]} s={0.12} c="#fff" />)}{gs >= 2 && <><B a={[0.26, 1.16, 1.58]} p={[0, 0.56, 0]} c="#ffd257" rad={0.03} /><B a={[1.58, 1.16, 0.26]} p={[0, 0.56, 0]} c="#ffd257" rad={0.03} /></>}{gs >= 3 && <Bow c="#ffd257" p={[0, 1.3, 0]} s={2.6} />}</>}</Tap>}
        {step === 'balloon' && <><Tap p={[0, 1.3, 0]} on={pump} hit={1.2} hitP={[0, 1, 0]} snd={null} glow={air === 0}><Inflate air={air} c={BC[bal.length % 6]} /></Tap></>}
      </group>
      {gifts.map((c, i) => <Tap key={i} p={[-4.4 + (i % 3) * 0.95, Math.floor(i / 3) * 0.8, 1.6]} on={() => sfx('squeak')}><Item k="gift" c={c} s={0.95} /></Tap>)}
      {guests.map((k, i) => <Glide key={k} p={[[0, 2.9, -4.4, 4.4, -1.3, 1.4][i], 0, [0, 0, -0.6, -0.6, -1.8, -1.8][i]]} from={[8, 0, 2]} speed={2}><Animal k={k} s={1.05} wear={3} mood={mood === 'dance' || sur === 3 ? 'dance' : 'happy'} /></Glide>)}
      {step !== 'balloon' && <Person p={[close ? -2 : -2.6, 0, close ? 0.2 : 0.6]} s={1.25} mood={mood} outfit={{ ...outfit, hat: outfit.hat || 1 }} />}
      {step === 'balloon' && <Person p={[-1.9, 0, 1.2]} s={1.15} mood={mood} outfit={outfit} />}
      {sur >= 2 && <Glide p={[2.2, 0, 0.6]} from={[9, 0, 0.6]} speed={1.6} r={[0, -0.4, 0]}><Uncle s={1.25} mood={sur === 3 ? 'happy' : 'walk'} /></Glide>}
      {sur === 3 && <Glide p={[3.6, 0, 1]} from={[0, 3, 1]}><Princess s={0.01} /><Item k="gift" c="#ff5a9c" s={1.1} /></Glide>}
    </Stage>
    {step !== 'party' && <Back on={() => { enter('party'); setSur(0) }} />}
    {step === 'decor' && <div className="tray up" style={{ padding: '0 10px' }}><div className="trayin">{DEC.map(d => <button key={d.id} className={'tb' + (dec.includes(d.id) ? ' on' : '')} aria-label={d.id} onClick={() => { const on = dec.includes(d.id); setDec(on ? dec.filter(x => x !== d.id) : [...dec, d.id]); sfx('magic'); if (!on) { burst([0, 4, -1], 'star', 30); joy(); if (dec.length === 3) star(1) } }}>{d.icon}</button>)}</div></div>}
    {step === 'cake' && <div className="tray up" style={{ padding: '0 10px' }}><div className="trayin">{cs === 0 ? <>{CAKEC.map(c => <button key={c} className="tb" aria-label="գույն" onClick={() => { setLayers(l => l.length < 4 ? [...l, c] : [c]); sfx('boing') }}><i className="sw" style={{ background: c }} /></button>)}<button className="tb" aria-label="ok" onClick={() => { setCs(1); void task('kit_decor') }}>✅</button></> : <>{TOPS.filter(t => t.id !== 'candle').map(t => <button key={t.id} className={'tb' + (top === t.id ? ' on' : '')} aria-label={t.id} onClick={() => { setTop(t.id); sfx('tap') }}>{t.icon}</button>)}<button className="tb" aria-label="ok" onClick={() => { win('birthday-cake', 2); joy('dance'); later(() => enter('candle'), 2400) }}>✅</button></>}</div></div>}
    {step === 'candle' && <div className="acts hi"><Big c="#8fd3ff" label="Փչել" on={blow}>💨</Big></div>}
    {step === 'wrap' && <div className="tray up" style={{ padding: '0 10px' }}><div className="trayin">{PAPER.map(c => <button key={c} className={'tb' + (paper === c ? ' on' : '')} aria-label="թուղթ" onClick={() => { setPaper(c); sfx('paper') }}><i className="sw" style={{ background: c }} /></button>)}</div></div>}
    {step === 'invite' && <div className="tray up" style={{ padding: '0 10px' }}><div className="trayin">{GUEST.map(g => <button key={g.k} className={'tb' + (guests.includes(g.k) ? ' on' : '')} aria-label={g.k} onClick={() => invite(g.k)}>{g.icon}</button>)}</div></div>}
    {step === 'uncle' && sur === 0 && <div className="acts hi"><Big c="#ffd257" label="Անակնկալ" on={surprise}>🎉</Big></div>}
    <Tray small value={step} items={[['balloon', '🎈'], ['decor', '🎀'], ['cake', '🎂'], ['candle', '🕯️'], ['wrap', '🎁'], ['invite', '💌'], ['uncle', '👨🏻']].map(([id, icon]) => ({ id, icon }))} on={s => { setSur(0); enter(s as Step) }} />
  </>
}
const Flame = () => { const g = useRef<THREE.Group>(null!); useFrame(s => { g.current.scale.set(1, 1 + Math.sin(s.clock.elapsedTime * 13) * 0.18, 1) }); return <group ref={g} position={[0, 0.78, 0]}><S s={[0.08, 0.15, 0.08]} c="#ffb52e" o={{ em: 1.6 }} ns /><S s={[0.04, 0.08, 0.04]} p={[0, -0.03, 0.05]} c="#fff6c4" o={{ em: 2 }} ns /></group> }
function Inflate({ air, c }: { air: number; c: string }) { const g = useRef<THREE.Group>(null!); useFrame((_, d) => { const s = g.current.scale.x + ((0.45 + air * 0.4) - g.current.scale.x) * Math.min(1, d * 6); g.current.scale.setScalar(s) }); return <group ref={g} scale={0.45}><Item k="balloon" c={c} /></group> }
void T; void rnd
