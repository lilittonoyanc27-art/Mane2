import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Stage, Tap, Glide, S, B, C, T, K, burst, shower, useLater, useOnce, Float, type V3, type Cam } from '../kit/base'
import { Room, Window3, Rug } from '../kit/nature'
import { Person, Uncle } from '../kit/people'
import { Item } from '../kit/items'
import { Decorate, CakeLayers, CAKEC, TOPS, usePuts } from '../kit/decorate'
import { say, task } from '../core/voice'
import { sfx } from '../core/audio'
import { win, useSave } from '../core/store'
import { Tray, Back, Big } from '../ui/HUD'

type Mode = 'home' | 'salad' | 'cake' | 'ice' | 'cup' | 'table'
const FR = ['apple', 'banana', 'strawberry', 'orange', 'tomato', 'cucumber', 'carrot', 'pear', 'grapes', 'milk', 'cheese', 'egg']
const FC: Record<string, string> = { apple: '#ff4f5e', banana: '#ffe27a', strawberry: '#ff3f5f', orange: '#ff9a2e', tomato: '#ff5040', cucumber: '#8fdc8a', carrot: '#ff8a3a', pear: '#d5e87a', grapes: '#9a6bd8', cheese: '#ffd257', milk: '#fff', egg: '#fff3b0' }
const Y = 1.25
const SCOOP = ['#ff9ecb', '#fff3c4', '#8a5a3a', '#a8e6b0', '#8fd3ff', '#b79bff', '#ffb07a', '#ff7a8a']

function Fridge({ open, on, items, pickF }: { open: boolean; on: () => void; items: string[]; pickF: (k: string) => void }) {
  const d1 = useRef<THREE.Group>(null!)
  useFrame((_, d) => { d1.current.rotation.y += ((open ? -2 : 0) - d1.current.rotation.y) * Math.min(1, d * 5) })
  return <group position={[-4.2, 0, -0.8]}>
    <B a={[2.6, 4.4, 1.2]} p={[0, 2.2, -0.2]} c="#bfe6ff" rad={0.2} />
    <B a={[2.2, 4, 0.2]} p={[0, 2.2, 0.36]} c="#f2fbff" o={{ em: 0.25 }} rad={0.08} ns />
    {[0.35, 1.35, 2.35, 3.35].map(y => <B key={y} a={[2.2, 0.08, 0.7]} p={[0, y, 0.65]} c="#d6efff" rad={0.03} />)}
    {FR.map((k, i) => <Tap key={k} p={[-0.68 + (i % 3) * 0.68, 0.42 + Math.floor(i / 3) * 1, 0.75]} s={0.6} hit={0.5} hitP={[0, 0.45, 0]} on={open ? () => pickF(k) : undefined}><group visible={!items.includes(k)}><Item k={k} /></group></Tap>)}
    <group ref={d1} position={[-1.3, 0, 1]}><Tap on={on} snd="door"><B a={[2.6, 4.4, 0.22]} p={[1.3, 2.2, 0.15]} c="#cfeeff" rad={0.1} /><B a={[0.14, 1, 0.16]} p={[2.35, 2.4, 0.36]} c="#fff" rad={0.06} /><S p={[0.8, 3.4, 0.3]} s={[0.2, 0.2, 0.05]} c="#ff8fc5" /><Item k="star" p={[1.4, 2.6, 0.3]} s={0.5} /><Item k="heart" p={[0.7, 1.6, 0.3]} s={0.5} /></Tap></group>
  </group>
}
function Bowl({ c, n = 0, spin }: { c?: string; n?: number; spin: boolean }) {
  const sp = useRef<THREE.Group>(null!)
  useFrame((_, d) => { if (spin) sp.current.rotation.y += d * 7 })
  return <group><C a={[0.9, 0.5, 0.65]} p={[0, 0.33, 0]} c="#ffb9dc" /><T a={[0.9, 0.06]} p={[0, 0.66, 0]} r={[Math.PI / 2, 0, 0]} c="#fff" />{n > 0 && <S p={[0, 0.5, 0]} s={[0.82, 0.2, 0.82]} c={c ?? '#fff3c4'} />}<group ref={sp}><C a={[0.06, 0.06, 1.5]} p={[0.35, 1.05, 0]} r={[0, 0, -0.35]} c="#c99a6b" /><S p={[0.1, 0.5, 0]} s={[0.16, 0.22, 0.1]} c="#c99a6b" /></group></group>
}
function Oven({ on, hot }: { on: () => void; hot: boolean }) {
  const g = useRef<THREE.Group>(null!)
  useFrame(s => { g.current.position.x = 4.2 + (hot ? Math.sin(s.clock.elapsedTime * 30) * 0.03 : 0) })
  return <group ref={g} position={[4.2, 0, -0.6]}><Tap on={on} snd="door"><B a={[2.2, 2.2, 1.6]} p={[0, 1.1, 0]} c="#ffcfb0" rad={0.14} /><B a={[1.6, 1.1, 0.1]} p={[0, 0.85, 0.8]} c={hot ? '#ffb03a' : '#7a5a6c'} o={{ em: hot ? 0.8 : 0 }} />{[-0.6, -0.2, 0.2, 0.6].map((x, i) => <S key={x} p={[x, 1.8, 0.82]} s={0.13} c={['#ff8fc5', '#7fc4ff', '#ffd257', '#8fdc9a'][i]} />)}<C a={[0.4, 0.4, 0.08]} p={[-0.5, 2.22, 0]} c="#7a5a6c" /><C a={[0.4, 0.4, 0.08]} p={[0.5, 2.22, 0]} c="#7a5a6c" /></Tap></group>
}
export function Kitchen() {
  const [mode, setMode] = useState<Mode>('home'), [step, setStep] = useState(0), [open, setOpen] = useState(false), [food, setFood] = useState<string[]>([]), [k, setK] = useState(0), [inBowl, setInBowl] = useState(0), [spin, setSpin] = useState(false), [hot, setHot] = useState(false)
  const [layers, setLayers] = useState<string[]>([]), [top, setTop] = useState('cherry'), deco = usePuts(), [mood, setMood] = useState<'idle' | 'happy' | 'dance'>('idle'), [placed, setPlaced] = useState<string[]>([]), later = useLater(), outfit = useSave(s => s.outfit)
  const [cream, setCream] = useState('#ff9ecb'), busy = useRef(false), ingr = useRef<string[]>([]), [used, setUsed] = useState<string[]>([]), [sx, setSx] = useState(false)
  useOnce(() => void task('kit_intro'))
  const joy = (m: 'happy' | 'dance' = 'happy', t = 2200) => { setMood(m); later(() => setMood('idle'), t) }
  const start = (m: Mode) => {
    setMode(m); setStep(0); setFood([]); setK(0); setInBowl(0); setLayers([]); deco.clear(); setPlaced([]); setOpen(false); setUsed([]); ingr.current = []; setHot(false); setTop('cherry'); busy.current = false; setSx(false)
    void task(({ home: 'kit_intro', salad: 'kit_fridge', cake: 'kit_cake1', ice: 'kit_ice', cup: 'kit_cup', table: 'kit_table' } as const)[m])
  }
  const finish = (id: string) => { win('kitchen-' + id, 3); joy('dance', 4000); shower([0, 5, 1], 4); setStep(99); later(() => void say('kit_yum'), 2500) }
  const fridgeTap = () => { setOpen(o => !o); if (mode === 'salad' && step === 0) { setStep(1); later(() => void task('kit_choose'), 500) } }
  const pickF = (f: string) => {
    if (mode === 'salad' && step === 1) {
      if (food.includes(f) || food.length >= 3) return
      const n = [...food, f]; setFood(n)
      if (n.length === 3) later(() => { setOpen(false); setStep(2); setK(0); void task('kit_wash') }, 900)
    } else if (mode === 'home') { sfx('crunch'); joy(); void say('kit_yum') }
  }
  const wash = () => {
    sfx('water'); burst([-1.8, Y + 1, 1], 'drop', 22, 0.7); burst([-1.8, Y + 0.6, 1.2], 'bubble', 12, 0.6)
    if (mode !== 'salad' || step !== 2) return
    const n = k + 1; setK(n); if (n >= 3) { sfx('star'); later(() => { setStep(3); setK(0); void task('kit_chop') }, 900) }
  }
  const chop = () => {
    sfx('chop'); burst([0, Y + 0.6, 1.4], 'confetti', 8, 0.5); if (mode !== 'salad' || step !== 3) return
    const n = k + 1; setK(n); if (n % 3 === 0) setInBowl(n / 3); if (n >= 9) later(() => { setStep(4); setK(0); void task('kit_stir') }, 900)
  }
  const stir = () => {
    sfx('stir'); setSpin(true); later(() => setSpin(false), 500); burst([1.9, Y + 1, 1.2], 'star', 6, 0.5)
    const isS = mode === 'salad' && step === 4, isC = mode === 'cake' && step === 1; if (!isS && !isC) return
    const n = k + 1; setK(n); if (n < 6) return
    if (isS) { finish('salad'); void say('kit_salad_done') } else { setStep(2); setK(0); void task('kit_cake2') }
  }
  const bake = () => { if (mode !== 'cake' || step !== 2 || busy.current) return; busy.current = true; setHot(true); sfx('magic'); later(() => { setHot(false); sfx('ding'); busy.current = false; burst([4.2, 3, 0.5], 'heart', 20); void say('kit_oven'); later(() => { setLayers([CAKEC[0]]); setStep(3); void task('kit_cake3') }, 1500) }, 2600) }
  const addIngr = (x: string) => { if (ingr.current.includes(x)) return; ingr.current.push(x); setUsed([...ingr.current]); sfx('whoosh'); later(() => { sfx('splash'); burst([1.9, Y + 1, 1], 'drop', 10, 0.5); setInBowl(b => b + 1) }, 600); if (ingr.current.length === 3) later(() => { setStep(1); setK(0); void task('kit_stir') }, 1500) }
  const sit = mode === 'table', big = (mode === 'cake' && step >= 3) || mode === 'ice' || mode === 'cup'
  const cam: Cam = big ? { t: [0, Y + 1.2, 1.2], dir: [0, 0.3, 1], w: 5, h: 4.4, tray: step !== 99 } : mode === 'salad' && step === 1 ? { t: [-4.2, 2.4, 0], dir: [0.1, 0.1, 1], w: 4.2, h: 5 } : sit ? { t: [0, 1.6, 0.6], dir: [0, 0.4, 1], w: 7.5, h: 5, tray: true } : mode === 'home' ? { t: [0, 2, 0], dir: [0, 0.2, 1], w: 11, h: 5.4 } : mode === 'salad' && step === 2 ? { t: [-1.8, 2, 1], dir: [0, 0.3, 1], w: 5, h: 3.8 } : mode === 'salad' && step === 3 ? { t: [0.8, 1.9, 1], dir: [0, 0.4, 1], w: 5.4, h: 3.6 } : mode === 'salad' && step === 4 || mode === 'cake' && step < 2 ? { t: [1.6, 2, 1], dir: [0, 0.4, 1], w: 5.4, h: 3.8 } : mode === 'cake' && step === 2 ? { t: [3.6, 1.8, 0], dir: [0, 0.2, 1], w: 5, h: 4.4 } : { t: [0, 2, 0], dir: [0, 0.2, 1], w: 10.5, h: 5.4 }
  const SLOTS: V3[] = [[-1.2, 0, 0.35], [1.2, 0, 0.35], [0, 0, 0], [-2, 0, -0.4], [2, 0, -0.4], [-0.75, 0, -0.5], [0.75, 0, -0.5], [0, 0, 0.75], [-1.9, 0, 0.6], [1.9, 0, 0.6]]
  return <>
    <Stage cam={cam} sky={['#ffd9ec', '#fff0dc']} shadow={8}>
      <Room wall="#fff0d9" floor="#f3cfa8" w={14} d={7} /><Window3 p={[-0.2, 3.9, -3.2]} /><Rug p={[0, 0.02, 2.2]} r={2} />
      {/* полки */}
      <B a={[3, 0.14, 0.7]} p={[3.4, 3.7, -3]} c="#ff9ecb" />{['honey', 'teapot', 'juice'].map((x, i) => <Tap key={x} p={[2.5 + i * 0.9, 3.77, -2.9]} s={0.8} on={() => sfx('ding')}><Item k={x} /></Tap>)}
      {!sit && <>
        <Fridge open={open} on={fridgeTap} items={food} pickF={pickF} /><Oven on={bake} hot={hot} />
        <B a={[5.6, Y - 0.15, 1.6]} p={[0, (Y - 0.15) / 2, 1]} c="#ffd3e6" rad={0.1} /><B a={[6, 0.16, 1.9]} p={[0, Y - 0.08, 1]} c="#fff" rad={0.06} />{[-1.8, 0, 1.8].map(x => <group key={x} position={[x, 0.6, 1.82]}><B a={[1.5, 0.8, 0.06]} c="#ffb9d8" /><S p={[0.5, 0.1, 0.07]} s={0.08} c="#ffd257" /></group>)}
        <Person p={[big ? 2.4 : mode === 'home' ? 0 : 0.2, 0.35, -0.9]} s={1.35} mood={mood} outfit={{ ...outfit, hat: 0 }} />
      </>}
      {/* раковина */}
      {!sit && !big && mode !== 'home' && <><Tap p={[-1.8, Y, 1]} on={mode === 'cake' ? undefined : wash} snd={null} fx={null} glow={mode === 'salad' && step === 2} hit={mode === 'salad' && step === 2 ? 0.9 : undefined} hitP={[0, 0.7, 0]}><B a={[1.5, 0.12, 1.2]} p={[0, 0.02, 0]} c="#cfe6f5" /><S p={[0, 0.06, 0.1]} s={[0.6, 0.05, 0.45]} c="#7fd6ee" o={{ rough: 0.1 }} /><C a={[0.09, 0.09, 1]} p={[0, 0.5, -0.5]} c="#b9c4d6" o={{ metal: 0.6, rough: 0.2 }} /><T a={[0.3, 0.09]} arc={Math.PI} p={[0, 1, -0.2]} r={[0, Math.PI / 2, 0]} c="#b9c4d6" o={{ metal: 0.6, rough: 0.2 }} /><S p={[0.3, 0.55, -0.5]} s={0.14} c="#ff7a8a" /><S p={[-0.3, 0.55, -0.5]} s={0.14} c="#7fc4ff" /></Tap>
        {/* доска */}
        <Tap p={[0, Y, 1.1]} on={mode === 'salad' && step === 3 ? chop : undefined} snd={null} fx={null} glow={mode === 'salad' && step === 3} hit={mode === 'salad' && step === 3 ? 0.7 : undefined} hitP={[0, 0.5, 0]}><B a={[1.4, 0.12, 0.95]} p={[0, 0.06, 0]} c="#d9a06b" /><Knife n={k} on={mode === 'salad' && step === 3} /></Tap>
        <Tap p={[1.9, Y, 1]} on={stir} snd={null} fx={null} glow={(mode === 'salad' && step === 4) || (mode === 'cake' && step === 1)} hit={(mode === 'salad' && step === 4) || (mode === 'cake' && step === 1) ? 1 : undefined} hitP={[0, 0.6, 0]}><Bowl n={mode === 'salad' ? 0 : inBowl} spin={spin} c="#ffe6c4" />{mode === 'salad' && food.slice(0, inBowl).flatMap((f, i) => [0, 1, 2, 3].map(j => <B key={f + j} a={[0.26, 0.26, 0.26]} rad={0.08} p={[Math.cos(j * 1.57 + i) * 0.45, 0.62 + i * 0.06, Math.sin(j * 1.57 + i) * 0.45]} r={[j, i, j]} c={FC[f]} />))}</Tap></>}
      {mode === 'salad' && food.map((f, i) => {
        const p: V3 = step <= 1 ? [-5 + i * 0.8, 0.25, 1.9] : step === 2 ? [-2.3 + i * 0.5, Y + 0.12, 1.3] : step === 3 ? (Math.floor(k / 3) === i ? [0, Y + 0.12, 1.15] : i < Math.floor(k / 3) ? [1.9, Y + 0.5, 1] : [-0.5 - i * 0.5, Y, 1.6]) : [1.9, Y + 0.3, 1]
        return <Glide key={f} p={p} s={step === 3 && i < Math.floor(k / 3) || step > 3 ? 0.001 : step <= 1 ? 0.9 : 0.75} from={[-4.2, 2, 0.4]} arc={1}><Item k={f} /></Glide>
      })}
      {mode === 'cake' && step === 0 && ['egg', 'flour', 'milk'].map((x, i) => <Glide key={x} p={used.includes(x) ? [1.9, Y + 1, 1] : [0.1 + (i - 1) * 0.85, Y, 1.3]} s={used.includes(x) ? 0.01 : 0.85} arc={1.4}><Tap on={used.includes(x) ? undefined : () => addIngr(x)} hit={0.55} hitP={[0, 0.4, 0]} glow={!used.includes(x)}><Item k={x} /></Tap></Glide>)}
      {mode === 'cake' && step === 2 && <Glide p={hot ? [4.2, 1, 0.4] : [2.6, Y, 1.2]} s={hot ? 0.2 : 0.9}><Tap on={bake} hit={0.9}><C a={[0.8, 0.7, 0.4]} p={[0, 0.2, 0]} c="#b9c4d6" /><S p={[0, 0.38, 0]} s={[0.75, 0.15, 0.75]} c="#ffe6c4" /></Tap></Glide>}
      {mode === 'cake' && step >= 3 && <group position={[0, Y + 0.05, 1.1]}><Decorate top={top} puts={deco.puts} add={deco.add} off={step !== 4}><CakeLayers layers={layers} /></Decorate></group>}
      {mode === 'ice' && <group position={[0, Y, 1.1]}><Decorate top={top} puts={deco.puts} add={deco.add} off={step !== 1}>{sx ? <C a={[0.75, 0.4, 0.8]} p={[0, 0.4, 0]} c="#d6f2ff" o={{ rough: 0.1 }} /> : <K a={[0.62, 1.3]} r={[Math.PI, 0, 0]} p={[0, 0.65, 0]} c="#e2a55f" />}{layers.map((c, i) => <Pop key={i} p={[(i % 2 ? 0.12 : -0.08), (sx ? 0.95 : 1.4) + i * 0.48, 0]}><S s={0.58 - i * 0.04} c={c} o={{ rough: 0.75 }} /></Pop>)}</Decorate></group>}
      {mode === 'cup' && <group position={[0, Y, 1.1]}><Decorate top={top} puts={deco.puts} add={deco.add} off={step !== 1}><C a={[0.95, 0.65, 0.95]} p={[0, 0.48, 0]} c="#ffd98a" />{Array.from({ length: 14 }, (_, i) => <B key={i} a={[0.1, 0.9, 0.06]} rad={0.03} p={[Math.cos(i * 0.449) * 0.83, 0.48, Math.sin(i * 0.449) * 0.83]} r={[0, -i * 0.449 + 1.57, 0]} c="#fff0c4" ns />)}{layers.length > 0 && <>{[[1, 0.98, 0.22], [0.8, 1.28, 0.24], [0.56, 1.58, 0.24], [0.3, 1.84, 0.24]].map(([r, y, h], i) => <S key={i} p={[0, y, 0]} s={[r, h, r]} c={cream} o={{ rough: 0.4 }} />)}</>}</Decorate></group>}
      {mode === 'home' && ([['cake', 'cake'], ['salad', 'salad'], ['ice', 'icecream'], ['cup', 'cupcake'], ['table', 'plate']] as const).map(([m, it], i) => <Tap key={m} p={[-2.2 + i * 1.1, Y, 1.35]} s={0.95} bob={0.06} hit={0.62} hitP={[0, 0.5, 0]} on={() => start(m)}>{m === 'table' ? <><Item k="plate" /><Item k="teapot" p={[0, 0.1, 0]} s={0.7} /><Item k="heart" p={[0, 0.75, 0]} s={0.5} /></> : <Item k={it} />}</Tap>)}
      {sit && <group position={[0, 0, 0.8]}><C a={[3, 3, 0.2]} p={[0, 1.15, 0]} c="#fff" /><C a={[3.05, 2.9, 0.5]} p={[0, 0.95, 0]} c="#ffd3ec" /><C a={[0.5, 0.8, 1]} p={[0, 0.5, 0]} c="#d9a06b" />
        {placed.map((x, i) => <Glide key={i} p={[SLOTS[i][0], 1.26, SLOTS[i][2]]} from={[0, 4, 2]} s={0.85} arc={0.5}><Tap on={() => sfx('ding')}><Item k={x} /></Tap></Glide>)}
        <Person p={[-1.5, 0.6, -2]} s={1.2} mood={step === 99 ? 'happy' : 'wave'} outfit={outfit} />{placed.length >= 6 && <Glide p={[1.5, 0.5, -2.2]} from={[7, 0.5, -2.2]} speed={2}><Uncle mood={step === 99 ? 'happy' : 'wave'} s={1.1} /></Glide>}</group>}
      <Float p={[-6, 5, -2]}><S s={0.01} /></Float>
    </Stage>
    {mode !== 'home' && <Back on={() => start('home')} />}
    {mode === 'cake' && step === 3 && <Tray items={[...CAKEC.map(c => ({ id: c, icon: <i className="sw" style={{ background: c }} /> })), { id: 'ok', icon: '✅' }]} on={c => { if (c === 'ok') { setStep(4); void task('kit_decor') } else if (layers.length < 4) { setLayers([...layers, c]); sfx('boing'); burst([0, 3, 1.4], 'star', 14) } else setLayers([...layers.slice(0, 3), c]) }} />}
    {(mode === 'cake' && step === 4 || (mode === 'ice' || mode === 'cup') && step === 1) && <Tray value={top} items={[...TOPS.map(t => ({ id: t.id, icon: t.icon })), { id: 'ok', icon: '✅' }]} on={t => t === 'ok' ? finish(mode) : setTop(t)} />}
    {mode === 'ice' && step === 0 && <Tray items={[{ id: 'cone', icon: sx ? '🍦' : '🍨' }, ...SCOOP.map(c => ({ id: c, icon: <i className="sw" style={{ background: c }} /> })), { id: 'ok', icon: '✅' }]} on={c => { if (c === 'cone') setSx(!sx); else if (c === 'ok') { if (layers.length) { setStep(1); void task('kit_decor') } } else if (layers.length < 4) { setLayers([...layers, c]); sfx('boing') } }} />}
    {mode === 'cup' && step === 0 && <Tray value={cream} items={[...SCOOP.map(c => ({ id: c, icon: <i className="sw" style={{ background: c }} /> })), { id: 'ok', icon: '✅' }]} on={c => { if (c === 'ok') { if (!layers.length) setLayers(['x']); setStep(1); void task('kit_decor') } else { setCream(c); setLayers(['x']); sfx('pop'); burst([0, 3, 1.4], 'star', 12) } }} />}
    {sit && step !== 99 && <Tray items={[['plate', '🍽️'], ['cup', '☕'], ['teapot', '🫖'], ['cake', '🎂'], ['cupcake', '🧁'], ['vase', '💐'], ['salad', '🥗'], ['candle', '🕯️'], ['cookie', '🍪'], ['apple', '🍎']].map(([id, icon]) => ({ id, icon })).concat([{ id: 'ok', icon: '✅' }])} on={x => { if (x === 'ok') { if (placed.length >= 3) { finish('table'); void say('kit_table_done'); if (placed.length < 6) setPlaced(p => [...p, ...['cup', 'cupcake', 'vase', 'cookie'].slice(0, 6 - p.length)]) } } else if (placed.length < 10) { setPlaced([...placed, x]); sfx('pop') } }} />}
    {step === 99 && <div className="acts"><Big c="#8fe3b0" label="Նորից" on={() => start(mode)}>🔁</Big><Big label="Ուրիշ" on={() => start('home')}>🍳</Big></div>}
  </>
}
const Pop = ({ p, children }: { p: V3; children: React.ReactNode }) => <Glide p={p} from={[p[0], p[1] + 1.4, p[2]]}>{children}</Glide>
function Knife({ n, on }: { n: number; on: boolean }) {
  const g = useRef<THREE.Group>(null!), a = useRef(0), l = useRef(n)
  useFrame((_, d) => { if (l.current !== n) { l.current = n; a.current = 1 } a.current = Math.max(0, a.current - d * 5); g.current.position.y = 1.15 - Math.sin(a.current * Math.PI) * 0.7 })
  return <group ref={g} visible={on} position={[0.1, 1.1, 0]}><B a={[0.7, 0.28, 0.05]} p={[-0.1, 0, 0]} c="#e6eef5" o={{ metal: 0.4, rough: 0.2 }} rad={0.02} /><B a={[0.4, 0.15, 0.12]} p={[0.42, 0.06, 0]} c="#ff8fc5" rad={0.06} /></group>
}
