import { useMemo, useRef, useState } from 'react'
import { Stage, Tap, Glide, S, B, C, T, Sign, burst, shower, useLater, useOnce, shuffle, type V3, type Cam } from '../kit/base'
import { Room, Rug } from '../kit/nature'
import { Person } from '../kit/people'
import { Animal } from '../kit/animals'
import { Item } from '../kit/items'
import { say, task, praise, type Phrase } from '../core/voice'
import { sfx } from '../core/audio'
import { win, useSave } from '../core/store'
import { Big } from '../ui/HUD'

const TASKS: { v: Phrase; k: string; n: number }[] = [{ v: 'mk_apple3', k: 'apple', n: 3 }, { v: 'mk_banana', k: 'banana', n: 1 }, { v: 'mk_milk', k: 'milk', n: 1 }, { v: 'mk_straw2', k: 'strawberry', n: 2 }, { v: 'mk_carrot', k: 'carrot', n: 1 }, { v: 'mk_bread', k: 'bread', n: 1 }, { v: 'mk_cheese', k: 'cheese', n: 1 }, { v: 'mk_orange2', k: 'orange', n: 2 }, { v: 'mk_tomato', k: 'tomato', n: 1 }, { v: 'mk_water', k: 'watermelon', n: 1 }, { v: 'mk_grapes', k: 'grapes', n: 1 }, { v: 'mk_ice', k: 'icecream', n: 1 }]
const GOODS = ['apple', 'banana', 'orange', 'strawberry', 'grapes', 'pear', 'milk', 'cheese', 'bread', 'carrot', 'tomato', 'cucumber', 'watermelon', 'icecream', 'egg', 'juice', 'lemon', 'honey']
const NUM: Phrase[] = ['n1', 'n2', 'n3', 'n4', 'n5']
export function Market() {
  const first = useRef(true)
  const mk = () => { const a = first.current ? TASKS.slice(0, 3) : shuffle(TASKS).slice(0, 3); first.current = false; return a }
  const [list, setList] = useState(mk), [ti, setTi] = useState(0), [got, setGot] = useState(0), [cart, setCart] = useState<{ k: string; from: V3 }[]>([]), [hint, setHint] = useState(''), [phase, setPhase] = useState<'shop' | 'pay' | 'done'>('shop'), [paid, setPaid] = useState(0), later = useLater(), outfit = useSave(s => s.outfit), [mood, setMood] = useState<'idle' | 'happy' | 'dance'>('idle'), busy = useRef(false)
  const goods = useMemo(() => GOODS.slice(0, 18), []), miss = useRef(0)
  const t = list[ti]
  useOnce(() => void task(list[0].v))
  const pos = (i: number): V3 => [-3.75 + (i % 6) * 1.5, 2.02 + (2 - Math.floor(i / 6)) * 1.45, -1.5]
  const take = (k: string, i: number) => {
    if (phase !== 'shop' || busy.current) return
    if (k !== t.k) { sfx('soft'); setHint(t.k); miss.current++; void say(miss.current % 2 ? 'retry' : 'almost'); later(() => setHint(''), 4000); later(() => { void task(t.v) }, 2600); return }
    const n = got + 1; setGot(n); setHint(''); setCart(c => [...c, { k, from: pos(i) }]); sfx('whoosh'); later(() => { sfx('pop'); burst([0.5, 1, 2], 'star', 12) }, 500)
    if (t.n > 1 && n < t.n) void say(NUM[n - 1])
    if (n >= t.n) {
      busy.current = true; setMood('happy'); void say(...(t.n > 1 ? [NUM[n - 1], praise()] : [praise()])); later(() => setMood('idle'), 1800)
      later(() => { busy.current = false; setGot(0); if (ti < 2) { setTi(ti + 1); void task(list[ti + 1].v) } else { setPhase('pay'); void task('mk_pay') } }, 2900)
    }
  }
  const need = cart.length
  const pay = () => { if (paid >= need) return; const n = paid + 1; setPaid(n); sfx('coin'); burst([2.9, 2.2, 1.6], 'star', 10); if (n <= 5) void say(NUM[n - 1]); if (n >= need) later(() => { setPhase('done'); sfx('ding'); win('market', 3, false); void say('mk_done'); setMood('dance'); shower([0, 5, 1], 4) }, 900) }
  const again = () => { const l = mk(); setList(l); setTi(0); setGot(0); setCart([]); setPaid(0); setPhase('shop'); setMood('idle'); void task(l[0].v) }
  const cam: Cam = phase === 'shop' ? { t: [0, 3.2, 0], dir: [0, 0.1, 1], w: 9.6, h: 8.1 } : { t: [1, 1.6, 1.4], dir: [0, 0.25, 1], w: 7, h: 4.6 }
  return <>
    <Stage cam={cam} sky={['#d9f0ff', '#fff0e0']} shadow={8}>
      <Room wall="#e2f4e6" floor="#f2e2cf" w={16} h={8} /><Rug p={[0, 0.02, 2.6]} r={2.2} c={['#ffe6a8', '#fff', '#ffd3ec']} />
      <Sign t="ԽԱՆՈՒԹ" p={[0, 7, -1.6]} w={2.6} h={0.6} />
      <group position={[0, 1, 0]}>{[0, 1, 2].map(r => <group key={r}><B a={[9.6, 0.16, 1.3]} p={[0, 0.95 + r * 1.45, -1.6]} c={['#ffb9dc', '#c9b5ff', '#a8dcff'][r]} /><B a={[9.6, 1.4, 0.1]} p={[0, 1.6 + r * 1.45, -2.25]} c="#fff8f0" ns /></group>)}<B a={[0.2, 5.2, 1.4]} p={[-4.9, 2.6, -1.6]} c="#fff" /><B a={[0.2, 5.2, 1.4]} p={[4.9, 2.6, -1.6]} c="#fff" /><B a={[10, 1.9, 1.4]} p={[0, -0.05, -1.6]} c="#ffe0ec" />
        {Array.from({ length: 11 }, (_, i) => <B key={i} a={[0.92, 0.16, 1.4]} p={[-4.6 + i * 0.92, 5.35, -1.2]} r={[0.25, 0, 0]} c={i % 2 ? '#fff' : '#ff9eb5'} rad={0.07} />)}</group>
      {goods.map((k, i) => <group key={k}>{[0.28, -0.28].map(x => <group key={x} position={[pos(i)[0] + x, pos(i)[1], pos(i)[2] - 0.45]}><Item k={k} s={0.55} /></group>)}<Tap p={pos(i)} s={0.85} hit={0.72} hitP={[0, 0.5, 0]} glow={hint === k} on={() => take(k, i)}><Item k={k} /></Tap></group>)}
      {/* корзинка */}
      <group position={[0.5, 0, 2]} scale={0.8}><C a={[1.25, 0.95, 0.8]} p={[0, 0.4, 0]} c="#e2b06f" /><C a={[1.1, 0.9, 0.1]} p={[0, 0.72, 0]} c="#b97a4a" /><T a={[1.24, 0.1]} p={[0, 0.8, 0]} r={[Math.PI / 2, 0, 0]} c="#f3cf98" />{Array.from({ length: 12 }, (_, i) => <S key={i} p={[Math.cos(i * 0.524) * 1.13, 0.4, Math.sin(i * 0.524) * 1.13]} s={[0.12, 0.34, 0.12]} c="#f0c98c" ns />)}</group>
      {cart.map((c, i) => <Glide key={i} from={c.from} p={[0.5 + Math.cos(i * 2.2) * 0.45, 0.6 + Math.floor(i / 4) * 0.25, 2 + Math.sin(i * 2.2) * 0.4]} s={0.55} arc={2} speed={4}><Item k={c.k} /></Glide>)}
      <Person p={[-3.1, 0, 2]} r={[0, 0.35, 0]} s={0.78} mood={mood} outfit={outfit} />
      {/* касса */}
      <group position={[3.2, 0, 1.4]} scale={0.85}><B a={[2, 1.2, 1.2]} p={[0, 0.6, 0]} c="#c9b5ff" /><B a={[2.2, 0.14, 1.4]} p={[0, 1.24, 0]} c="#fff" /><Tap p={[-0.3, 1.3, 0]} on={phase === 'pay' ? pay : () => sfx('ding')} hit={0.9} hitP={[0, 0.5, 0]} glow={phase === 'pay'}><B a={[0.9, 0.45, 0.8]} p={[0, 0.23, 0]} c="#ff8fc5" /><B a={[0.8, 0.4, 0.1]} p={[0, 0.65, -0.2]} r={[-0.3, 0, 0]} c="#8fe3b0" o={{ em: 0.4 }} />{[0, 1, 2, 3, 4, 5].map(i => <S key={i} p={[-0.25 + (i % 3) * 0.25, 0.48, 0.08 + Math.floor(i / 3) * 0.2]} s={[0.08, 0.04, 0.08]} c="#fff" />)}</Tap><Animal k="bear" p={[0.2, 0.55, -1.3]} s={1.2} wear={1} mood={phase === 'done' ? 'happy' : 'idle'} /></group>
      {phase !== 'shop' && Array.from({ length: need }, (_, i) => <Glide key={i} p={i < paid ? [2.9, 1.8, 1.2] : [0.6 + (i % 4) * 0.62 - 1, 0.5 + Math.floor(i / 4) * 0.7 + 1.5, 2.9]} s={i < paid ? 0.01 : 1} arc={1}><Tap on={i < paid ? undefined : pay} spin={1.4} hit={0.4} snd={null}><C a={[0.28, 0.28, 0.08]} r={[Math.PI / 2, 0, 0]} c="#ffd257" o={{ metal: 0.5, rough: 0.2 }} /><S s={[0.14, 0.14, 0.06]} c="#fff0a0" /></Tap></Glide>)}
      {/* подсказка: что ищем */}
      {phase === 'shop' && <group position={[-1.5, 1.15, 2.2]} scale={0.8}><S s={[1, 0.75, 0.2]} c="#fff" o={{ op: 0.94 }} ns /><S p={[-1.2, -0.1, 0]} s={0.12} c="#fff" ns />{Array.from({ length: t.n }, (_, i) => <group key={i} visible={true} position={[(i - (t.n - 1) / 2) * 0.58, -0.35, 0.3]}><Item k={t.k} s={0.55} shadow={i < got} /></group>)}</group>}
    </Stage>
    {phase === 'done' && <div className="acts"><Big c="#8fe3b0" label="Նորից" on={again}>🔁</Big></div>}
  </>
}
