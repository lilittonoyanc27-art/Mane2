import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Stage, Tap, Glide, S, B, C, T, K, burst, shower, useLater, useOnce, Float, type V3, type Cam } from '../kit/base'
import { Clouds, Meadow, Island, Flower, Tree, House, Butterflies, Rainbow } from '../kit/nature'
import { Person, Uncle, Granny, Bow } from '../kit/people'
import { Animal } from '../kit/animals'
import { Item } from '../kit/items'
import { say, task, praise, type Phrase } from '../core/voice'
import { sfx } from '../core/audio'
import { star, win, useSave } from '../core/store'
import { Tray, Back, Big } from '../ui/HUD'

const SEEDS: { id: string; icon: string; kind: 'flower' | 'berry' | 'tree'; c: string; k?: string }[] = [{ id: 'pink', icon: '🌸', kind: 'flower', c: '#ff8fc5' }, { id: 'sun', icon: '🌻', kind: 'flower', c: '#ffc93a' }, { id: 'tulip', icon: '🌷', kind: 'flower', c: '#b079ff' }, { id: 'straw', icon: '🍓', kind: 'berry', c: '#ff3f5f', k: 'strawberry' }, { id: 'apple', icon: '🍎', kind: 'tree', c: '#ff4f5e', k: 'apple' }, { id: 'orange', icon: '🍊', kind: 'tree', c: '#ff9a2e', k: 'orange' }, { id: 'grape', icon: '🍇', kind: 'berry', c: '#9a6bd8', k: 'grapes' }]
const POS: V3[] = [[-2.5, 0, -0.9], [0, 0, -0.9], [2.5, 0, -0.9], [-2.5, 0, 1.3], [0, 0, 1.3], [2.5, 0, 1.3]]
function Plant({ seed, stage }: { seed: number; stage: number }) {
  const g = useRef<THREE.Group>(null!), q = SEEDS[seed]
  useFrame((s, d) => { const t = [0, 0.25, 0.5, 0.78, 1][stage] ?? 1; const k = g.current.scale.x + (t - g.current.scale.x) * Math.min(1, d * 2.6); g.current.scale.setScalar(Math.max(0.01, k)); g.current.rotation.z = Math.sin(s.clock.elapsedTime * 1.6 + seed) * 0.05 })
  if (seed < 0) return <group ref={g} />
  const ripe = stage >= 4
  return <group ref={g} scale={0.01} position={[0, 0.3, 0]}>{stage < 2 ? <><C a={[0.08, 0.1, 0.8]} p={[0, 0.4, 0]} c="#6fcf6a" /><S p={[0.35, 0.8, 0]} s={[0.4, 0.12, 0.24]} r={[0, 0, 0.5]} c="#8fe07a" /><S p={[-0.35, 0.8, 0]} s={[0.4, 0.12, 0.24]} r={[0, 0, -0.5]} c="#8fe07a" /></>
    : q.kind === 'flower' ? (ripe ? <>{[[-0.4, 1.6], [0, 2.2], [0.4, 1.7]].map(([x, s], i) => <Flower key={i} p={[x, 0, (i % 2) * 0.2]} s={s} c={q.c} />)}</> : <>{[-0.35, 0, 0.35].map(x => <group key={x}><C a={[0.06, 0.08, 1.1]} p={[x, 0.55, 0]} c="#67b96c" /><S p={[x, 1.2, 0]} s={[0.17, 0.26, 0.17]} c="#9fdc7a" /></group>)}</>)
      : q.kind === 'berry' ? <>{[0, 1, 2, 3, 4].map(i => <S key={i} p={[Math.cos(i * 1.257) * 0.45, 0.4, Math.sin(i * 1.257) * 0.45]} s={[0.4, 0.4, 0.4]} c="#7fcf7a" />)}{ripe && [0, 1, 2, 3].map(i => <Item key={i} k={q.k!} s={0.5} p={[Math.cos(i * 1.57 + 0.6) * 0.62, 0.25, Math.sin(i * 1.57 + 0.6) * 0.62]} />)}</>
        : <><Tree s={0.85} />{ripe && [[-0.45, 1.25, 0.5], [0.4, 1.4, 0.55], [0, 1.7, 0.6], [0.55, 1, 0.2], [-0.6, 1.55, 0.2]].map((p, i) => <Item key={i} k={q.k!} s={0.36} p={p as V3} />)}</>}</group>
}
const WHO: { id: string; icon: string; v: Phrase }[] = [{ id: 'mom', icon: '👩', v: 'gd_mom' }, { id: 'dad', icon: '👨', v: 'gd_dad' }, { id: 'gran', icon: '👵', v: 'gd_gran' }, { id: 'uncle', icon: '🎁', v: 'gd_uncle' }]
const BF = [{ id: 'pink', c: '#ff8fc5', icon: '🌸' }, { id: 'yellow', c: '#ffc93a', icon: '🌻' }, { id: 'violet', c: '#b079ff', icon: '🪻' }, { id: 'red', c: '#ff5a6a', icon: '🌹' }, { id: 'white', c: '#ffffff', icon: '🤍' }, { id: 'blue', c: '#7fc4ff', icon: '💙' }]
export function Garden() {
  const { garden, basket, set, outfit } = useSave(), [seed, setSeed] = useState(0), later = useLater(), [can, setCan] = useState<V3 | null>(null), [fly, setFly] = useState<{ id: number; seed: number; from: V3 }[]>([]), [mode, setMode] = useState<'plot' | 'bouquet' | 'give'>('plot'), [bq, setBq] = useState<string[]>([]), [who, setWho] = useState(''), [mood, setMood] = useState<'idle' | 'happy'>('idle'), lock = useRef(false), told = useRef(new Set<string>())
  useOnce(() => void task('gd_intro'))
  const once = (v: Phrase) => { if (!told.current.has(v)) { told.current.add(v); void task(v) } }
  const upd = (i: number, v: { seed: number; stage: number }) => set({ garden: useSave.getState().garden.map((g, j) => j === i ? v : g) })
  const tap = (i: number) => {
    const g = garden[i], p = POS[i]; if (lock.current) return
    if (g.seed < 0) { upd(i, { seed, stage: 0 }); sfx('pop'); burst([p[0], 0.6, p[2]], 'star', 10); later(() => once('gd_water'), 500); return }
    if (g.stage < 4) { lock.current = true; setCan([p[0] + 0.9, 2.5, p[2]]); sfx('water'); later(() => burst([p[0], 1.8, p[2]], 'drop', 26, 0.4), 350); later(() => { upd(i, { ...g, stage: g.stage + 1 }); sfx('magic'); burst([p[0], 0.8, p[2]], 'star', 14); if (g.stage === 0) once('gd_grow'); if (g.stage === 3) once('gd_pick') }, 850); later(() => { setCan(null); lock.current = false }, 1150); return }
    const q = SEEDS[g.seed]; sfx('pop'); burst([p[0], 1.6, p[2]], 'heart', 24); setFly(f => [...f.slice(-8), { id: Date.now(), seed: g.seed, from: [p[0], 1.4, p[2]] }]); set({ basket: { ...basket, [q.id]: (basket[q.id] || 0) + 3 } }); upd(i, { seed: -1, stage: 0 }); star(1); void say(praise()); setMood('happy'); later(() => setMood('idle'), 1600)
  }
  const cam: Cam = mode === 'plot' ? { t: [0, 1.1, 0.2], dir: [0, 0.62, 1], w: 9.4, h: 6, tray: true } : { t: [0, 1.8, 2.4], dir: [0, 0.15, 1], w: 5.6, h: 4.4, tray: true }
  const Rec = who === 'uncle' ? Uncle : who === 'gran' ? Granny : Person
  const give = (id: string) => { if (!bq.length) { setBq(['#ff8fc5', '#ffc93a', '#b079ff']) } setWho(id); setMode('give'); sfx('magic'); void task(WHO.find(w => w.id === id)!.v); later(() => { shower([0, 5, 2], 3, 'heart', 50); win('bouquet', 2, false) }, 1800); later(() => { if (id === 'uncle') void say('card_thanks') }, 5500) }
  return <>
    <Stage cam={cam} fog={[22, 60]}>
      <Island r={20} /><Meadow n={260} rad={13} hole={4.2} /><Clouds /><Rainbow p={[0, 0, -10]} s={2.6} /><Butterflies n={6} rad={4} />
      <House p={[-5.4, 0, -4]} s={1.3} r={[0, 0.4, 0]} /><Tree p={[5.6, 0, -4]} s={1.4} c="#ffb9dc" /><Tree p={[-7.6, 0, -2]} /><Tree p={[7.6, 0, -1.6]} c="#c5b0ff" />
      {Array.from({ length: 13 }, (_, i) => <B key={i} a={[0.5, 0.9, 0.14]} p={[-4.2 + i * 0.7, 0.45, -2.7]} c="#fff" rad={0.07} />)}
      <group visible={mode === 'plot'}>
        {POS.map((p, i) => <Tap key={i} p={p} on={mode === 'plot' ? () => tap(i) : undefined} snd={null} hit={1} hitP={[0, 0.7, 0]} fx={null} glow={garden[i].seed >= 0 && garden[i].stage >= 4}><C a={[1, 1.05, 0.34]} p={[0, 0.12, 0]} c="#a8714a" o={{ rough: 1 }} /><T a={[1, 0.12]} p={[0, 0.26, 0]} r={[Math.PI / 2, 0, 0]} c="#e2b07f" /><Plant seed={garden[i].seed} stage={garden[i].stage} key={garden[i].seed} />{garden[i].seed >= 0 && garden[i].stage === 0 && <S p={[0, 0.34, 0]} s={[0.3, 0.12, 0.3]} c="#7a4a2a" />}</Tap>)}
        {can && <Glide p={can} r={[0, 0, 0.8]} from={[can[0] + 1, can[1] + 1, can[2]]} speed={9}><C a={[0.42, 0.48, 0.75]} c="#7fc4ff" /><C a={[0.07, 0.12, 0.9]} p={[-0.65, 0.1, 0]} r={[0, 0, 0.9]} c="#7fc4ff" /><T a={[0.32, 0.07]} p={[0.45, 0, 0]} c="#ff8fc5" /></Glide>}
        <group position={[4.5, 0, 1]}><C a={[0.75, 0.55, 0.6]} p={[0, 0.3, 0]} c="#e2b06f" /><T a={[0.75, 0.08]} p={[0, 0.6, 0]} r={[Math.PI / 2, 0, 0]} c="#f3cf98" />{SEEDS.filter(s => basket[s.id]).slice(0, 7).map((s, i) => <group key={s.id} position={[Math.cos(i * 1.1) * 0.4, 0.55, Math.sin(i * 1.1) * 0.4]}>{s.k ? <Item k={s.k} s={0.4} /> : <Flower s={0.9} c={s.c} />}</group>)}</group>
        {fly.map(f => <Glide key={f.id} p={[4.5, 0.7, 1]} from={f.from} arc={2} s={0.01} speed={1.8}><group scale={60}><group scale={0.016}>{SEEDS[f.seed].k ? <Item k={SEEDS[f.seed].k!} /> : <Flower s={1.5} c={SEEDS[f.seed].c} />}</group></group></Glide>)}
        <Person p={[-4.5, 0, 1]} r={[0, 0.4, 0]} s={1} mood={mood} outfit={outfit} /><Animal k="rabbit" p={[-4, 0, 2.6]} s={0.55} />
      </group>
      {mode !== 'plot' && <>
        <Glide p={mode === 'give' ? [0.9, 1, 2.6] : [0, 0.9, 3]} s={mode === 'give' ? 0.75 : 1.2}><Float a={0.04}><K a={[0.62, 1.3]} r={[Math.PI, 0, 0]} p={[0, 0.1, 0]} c="#fff0f8" /><K a={[0.64, 0.7]} r={[Math.PI, 0, 0]} p={[0, 0.42, 0]} c="#ffd3ec" /><Bow c="#ff5a9c" p={[0, 0.05, 0.45]} s={1.3} />{bq.map((c, i) => { const a = i * 2.4, r = i ? 0.2 + Math.sqrt(i) * 0.13 : 0; return <Glide key={i} p={[Math.cos(a) * r, 1 - r * 0.25, Math.sin(a) * r]} from={[Math.cos(a) * 2, 2.4, 1]}><Flower s={1.15} c={c} stem={false} /><C a={[0.03, 0.03, 0.8]} p={[0, -0.4, 0]} c="#67b96c" /></Glide> })}</Float></Glide>
        {mode === 'bouquet' ? <Person p={[-1.7, 0, 2.2]} r={[0, 0.4, 0]} s={1.15} mood="wave" outfit={outfit} /> : <><Person p={[-0.6, 0, 2.2]} r={[0, 0.6, 0]} s={1.1} mood="happy" outfit={outfit} /><Glide p={[2.1, 0, 2.2]} from={[6, 0, 2]} speed={3} r={[0, -0.5, 0]}>{who === 'dad' ? <Person kind="man" s={1.25} mood="happy" outfit={{ shoes: 3 }} /> : who === 'mom' ? <Person s={1.3} mood="happy" outfit={{ dress: 3, hair: 1, hairColor: 1, bow: 0, jewel: 1 }} /> : <Rec s={1.15} mood="happy" />}</Glide></>}
      </>}
    </Stage>
    {mode === 'plot' ? <><Tray value={String(seed)} items={SEEDS.map((s, i) => ({ id: String(i), icon: s.icon }))} on={i => setSeed(+i)} /><div className="rside" style={{ bottom: 'calc(130px + env(safe-area-inset-bottom))' }}><Big c="#ffc2e2" label="Փունջ" on={() => { setMode('bouquet'); setBq([]); void task('gd_bouquet') }}>💐</Big></div></>
      : <><Back on={() => { setMode('plot'); void task('gd_intro') }} />{mode === 'bouquet' ? <><div className="tray up" style={{ padding: '0 10px' }}><div className="trayin">{WHO.map(w => <button key={w.id} className="tb" aria-label={w.id} style={{ ['--c' as string]: '#d9f0c0' }} onClick={() => give(w.id)}>{w.icon}</button>)}</div></div><Tray small items={[...BF.map(b => ({ id: b.c, icon: b.icon })), { id: 'x', icon: '🧺' }]} on={c => { if (c === 'x') setBq([]); else if (bq.length < 12) { setBq([...bq, c]); sfx('pop'); burst([0, 2.4, 3.4], 'star', 8) } }} /></> : <div className="acts"><Big c="#8fe3b0" label="Նորից" on={() => { setMode('bouquet'); setBq([]); void task('gd_bouquet') }}>🔁</Big></div>}</>}
  </>
}
