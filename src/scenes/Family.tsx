/* ===== Продолжение: выбор героя, хабы Анулик / Харутюна / семьи / вдвоём, игры, приключения, сказки, смартфон ===== */
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Stage, Tap, Float, Sign, burst, shower, Star3, S, C, T, B, Emoji, useLater, type V3 } from '../kit/base'
import { Castle, Clouds, Butterflies, Meadow, Island, Flower, Tree, Rainbow, Mushroom, Room, Rug, Window3, Pine } from '../kit/nature'
import { Person, Uncle, Anulik } from '../kit/people'
import { Animal } from '../kit/animals'
import { Item } from '../kit/items'
import { sayText, hush } from '../core/voice'
import { sfx } from '../core/audio'
import { go, useUI } from '../core/ui'
import { useSave, star } from '../core/store'
import { useFam, playGame, openScene, doneTotal, HUB, type Hero, type Mode } from '../core/family'
import { G, ENG, GAMES, DATA, ADVDATA, PHONE } from '../legacy'

type Mood = 'idle' | 'walk' | 'jump' | 'dance' | 'wave' | 'happy' | 'sleep' | 'spin' | 'sit' | 'fly'
const L = (who: Hero, text: string) => ({ who, text })
/** Озвученные реплики подряд (облачко показывает, кто говорит) */
export const talk = (...ls: { who: Hero; text: string }[]) => sayText(...ls.map(l => l.text))

/** Герой в 3D */
export function HeroM({ who, ...p }: { who: Hero; p?: V3; r?: V3; s?: number; mood?: Mood }) {
  const outfit = useSave(s => s.outfit), look = useFam(s => s.look)
  if (who === 'anulik') return <Anulik {...p} look={look} />
  if (who === 'harut') return <Uncle {...p} />
  return <Person {...p} outfit={outfit} />
}

/* ---------- общий луг-сцена ---------- */
function Meadowland({ children, cam, center }: { children: ReactNode; cam?: { t: V3; dir?: V3; w: number; h: number; tray?: boolean }; center?: V3 }) {
  return <Stage cam={cam ?? { t: [0, 1.6, 0], dir: [0, 0.2, 1], w: 9, h: 6 }} center={center} fog={[22, 60]}>
    <Island r={17} /><Meadow n={200} rad={14} /><Clouds /><Rainbow p={[0, 0, -7]} s={2.2} /><Castle p={[0, 0, -4.5]} s={1.3} />
    <Tree p={[-5, 0, -2]} s={1.2} /><Tree p={[5.2, 0, -2.4]} s={1.3} c="#ffb9dc" /><Pine p={[-6.5, 0, 0.5]} /><Tree p={[6.4, 0, 0.4]} c="#c5b0ff" />
    <Butterflies n={5} c={[0, 1.8, 0]} rad={4.5} />
    {children}
  </Stage>
}

/* ===================== Кто играет? (5 режимов) ===================== */
const MODES: { id: Mode; label: string; heroes: Hero[]; c: string; greet: { who: Hero; text: string }[] }[] = [
  { id: 'mane', label: 'Խաղալ Մանեի հետ', heroes: ['mane'], c: '#ffd3ec', greet: [L('harut', 'Բարև՛, Մանե ջան, իմ արևիկ։ Այսօր մեզ հրաշքներ են սպասում։'), L('mane', 'Ուռա՜։ Հարություն քեռին։ Իսկ Անուլիկն էլ է մեզ հետ։'), L('anulik', 'Իհարկե, քույրիկ։ Ես քեզ հետ եմ։ Ընտրի՛ր, թե ինչ ենք անելու։')] },
  { id: 'anulik', label: 'Խաղալ Անուլիկի հետ', heroes: ['anulik'], c: '#e3d3ff', greet: [L('harut', 'Բարև՛, Անուլիկ ջան։ Ի՞նչ ծրագրեր ունես, ճամփորդուհի։ Ես մի քանի միտք ունեմ։'), L('anulik', 'Բարև, քեռի։ Ես ամեն ինչ եմ ուզում՝ լուսանկարներ, խուզարկություն և ճամփորդություններ։'), L('mane', 'Անուլիկ, ինձ էլ ցույց կտա՞ս։ Ես էլ եմ ուզում։')] },
  { id: 'harut', label: 'Խաղալ Հարությունի հետ', heroes: ['harut'], c: '#cfe6ff', greet: [L('harut', 'Ո՞վ է պատրաստ արկածների։ Մեքենան լցված է, խնջույքի զամբյուղը՝ հավաքված։'), L('mane', 'Ես։ Ես պատրաստ եմ։'), L('anulik', 'Ես էլ։ Քեռի, այսօր դու ղեկին ես, իսկ ես՝ ուղեցույց։')] },
  { id: 'family', label: 'Ընտանեկան արկածներ', heroes: ['harut', 'mane', 'anulik'], c: '#c9f0b0', greet: [L('harut', 'Բարև՛ ձեզ, աղջիկնե՛ր։ Հարություն քեռին պատրաստ է արկածների։'), L('anulik', 'Ընտրի՛ր արկածը, Մանե։'), L('mane', 'Ուռա՜։ Բոլորս միասին։')] },
  { id: 'duo', label: 'Երկուսով մեկ սարքի վրա', heroes: ['mane', 'anulik'], c: '#ffe3b8', greet: [L('harut', 'Խաղացող 1՝ Մանե (փոքրիկ), Խաղացող 2՝ Անուլիկ (դեռահաս)։ Հարությունի առաջադրանքները՝ միասին։')] },
]
export function Who() {
  const later = useLater(), [picked, setPicked] = useState<number | null>(null)
  useEffect(() => { const t = setTimeout(() => void sayText('Ո՞վ է այսօր խաղում։'), 700); return () => clearTimeout(t) }, [])
  const pick = (i: number) => {
    if (picked !== null) return
    const m = MODES[i]; setPicked(i); sfx('magic'); burst([(i - 2) * 2.6, 2, 1], 'star', 24)
    useFam.getState().set({ mode: m.id, hero: m.heroes.length === 1 ? m.heroes[0] : 'mane', adv: null, ret: null })
    G.S.hero = m.heroes.length === 1 ? m.heroes[0] : 'mane'; G.save()
    if (m.id === 'duo') G.flag('duo')
    void talk(...m.greet)
    later(() => go(HUB[m.id]), 1600)
  }
  return <>
    <Meadowland cam={{ t: [0, 1.5, 1.2], dir: [0, 0.16, 1], w: 13.5, h: 5, tray: false }}>
      {MODES.map((m, i) => { const x = (i - 2) * 2.7, z = 1 - Math.abs(i - 2) * 0.5; return <Tap key={m.id} p={[x, 0, z]} on={() => pick(i)} hit={1.3} hitP={[0, 1.2, 0]} fx="heart">
        <C a={[1.15, 1.25, 0.35]} p={[0, 0.17, 0]} c={m.c} /><T a={[1.15, 0.06]} p={[0, 0.35, 0]} r={[Math.PI / 2, 0, 0]} c="#fff" />
        {m.heroes.map((h, k) => <HeroM key={h} who={h} p={[(k - (m.heroes.length - 1) / 2) * 0.72, 0.36, 0]} s={m.heroes.length > 1 ? 0.62 : 0.9} mood={picked === i ? 'happy' : k === 0 ? 'wave' : 'idle'} />)}
        <Sign t={m.label} p={[0, 0.25, 1.35]} w={2.3} h={0.42} r={[-0.25, 0, 0]} />
      </Tap> })}
    </Meadowland>
  </>
}

/* ===================== Хаб-карусель (как у Мане в оригинале) ===================== */
interface Spot { id: string; c: string; e: string; label: string; act: () => void; done?: boolean; icon?: () => ReactNode }
function GRing({ spots, target, onPick, R }: { spots: Spot[]; target: React.MutableRefObject<number>; onPick: (i: number) => void; R: number }) {
  const ref = useRef<THREE.Group>(null!), gs = useRef<(THREE.Group | null)[]>([]), STEP = Math.PI * 2 / spots.length
  useFrame((_, d) => {
    ref.current.rotation.y += (target.current - ref.current.rotation.y) * (1 - Math.exp(-d * 5))
    gs.current.forEach((g, i) => { if (!g) return; const a = ref.current.rotation.y + i * STEP; g.visible = Math.cos(a) > -0.15; const f = Math.max(0, Math.cos(a)); g.scale.setScalar(0.72 + f * f * f * 0.5) })
  })
  return <group ref={ref}>{spots.map((q, i) => <group key={q.id} ref={g => { gs.current[i] = g }} position={[Math.sin(i * STEP) * R, 0, Math.cos(i * STEP) * R]} rotation={[0, i * STEP, 0]}>
    <Tap on={() => onPick(i)} hit={1.5} hitP={[0, 1, 0]}>
      <C a={[1.75, 1.6, 0.45]} p={[0, 0.22, 0]} c={q.c} /><T a={[1.72, 0.08]} p={[0, 0.45, 0]} r={[Math.PI / 2, 0, 0]} c="#fff" />
      <Float p={[0, 0.5, 0]} a={0.07} rot={0.02}>{q.icon ? q.icon() : <Emoji e={q.e} p={[0, 1.15, 0]} s={1.7} />}</Float>
      {q.done && <Star3 p={[1.2, 1.9, 0]} s={0.22} c="#ffd257" o={{ em: 0.6 }} />}
      <Sign t={q.label} p={[0, 0.3, 1.95]} w={2.9} h={0.46} r={[-0.25, 0, 0]} />
    </Tap></group>)}</group>
}
const remember: Record<string, number> = {}
function RingHub({ name, spots, heroes, intro }: { name: string; spots: Spot[]; heroes: Hero[]; intro?: { who: Hero; text: string }[] }) {
  const R = Math.max(11, spots.length * 3.7 / (Math.PI * 2)), STEP = Math.PI * 2 / spots.length
  const idx = useRef(remember[name] ?? 0), target = useRef(-idx.current * STEP), [walk, setWalk] = useState<Mood>('idle'), later = useLater()
  const dragX = useRef<{ x: number; t: number; moved: boolean } | null>(null), lock = useRef(false)
  useEffect(() => { if (intro) { const t = setTimeout(() => void talk(...intro), 900); return () => clearTimeout(t) } }, [])
  const keep = () => { remember[name] = ((idx.current % spots.length) + spots.length) % spots.length }
  const turn = (n: number) => { idx.current += n; target.current = -idx.current * STEP; keep(); sfx('whoosh'); setWalk('walk'); later(() => setWalk('idle'), 700) }
  const pickP = (i: number) => {
    if (lock.current || dragX.current?.moved) return
    lock.current = true
    const n = spots.length, cur = ((idx.current % n) + n) % n; let df = i - cur; if (df > n / 2) df -= n; if (df < -n / 2) df += n
    idx.current += df; target.current = -idx.current * STEP; keep()
    setWalk(df ? 'walk' : 'happy'); later(() => { setWalk('happy'); burst([0, 1.6, R + 2.4], 'star', 22) }, df ? 600 : 0)
    void sayText(spots[i].label); later(() => { lock.current = false; spots[i].act() }, 1300)
  }
  useEffect(() => { const k = (e: KeyboardEvent) => { if (e.code === 'ArrowRight') turn(1); if (e.code === 'ArrowLeft') turn(-1); if (e.code === 'Enter' || e.code === 'Space') pickP(((idx.current % spots.length) + spots.length) % spots.length) }; window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k) }, [spots])
  const pend = (i: number) => { const f = () => { window.removeEventListener('pointerup', f, true); pickP(i) }; window.addEventListener('pointerup', f, true) }
  const deco = useMemo(() => Array.from({ length: 14 }, (_, i) => ({ p: [Math.cos(i * 0.45 + 0.2) * (R - 6 + (i % 3)), 0, Math.sin(i * 0.45 + 0.2) * (R - 6 + (i % 3))] as V3, k: i % 3 })), [R])
  return <div style={{ position: 'absolute', inset: 0 }}
    onPointerDown={e => { dragX.current = { x: e.clientX, t: target.current, moved: false } }}
    onPointerMove={e => { const q = dragX.current; if (!q || !e.buttons) return; const dx = e.clientX - q.x; if (Math.abs(dx) > 14) { q.moved = true; target.current = q.t + dx / window.innerWidth * 1.6 } }}
    onPointerUp={() => { const q = dragX.current; if (q?.moved) { idx.current = Math.round(-target.current / STEP); target.current = -idx.current * STEP; keep() } later(() => { dragX.current = null }, 30) }}>
    <Stage cam={{ t: [0, 2, R], dir: [0, 0.3, 1], w: 6.6, h: 7 }} center={[0, 0, R - 2]} shadow={10} fog={[26, 70]}>
      <Island r={R + 19} /><Meadow n={260} rad={R + 9} /><C a={[R - 1.8, R - 1.8, 0.1]} p={[0, 0, 0]} c="#bff0b4" ns seg={60} /><T a={[R + 1.9, 0.55]} p={[0, -0.42, 0]} r={[Math.PI / 2, 0, 0]} c="#ffe9c9" ns />
      <Castle s={1.7} p={[0, 0, -3]} /><Rainbow p={[0, 0, -8]} s={2.8} /><Clouds y={8} />
      {deco.map((q, i) => q.k === 0 ? <Tree key={i} p={q.p} c={['#8fdc9a', '#ffb9dc', '#c5b0ff'][i % 3]} /> : q.k === 1 ? <Flower key={i} p={q.p} s={1.8} c="#ff8fc5" /> : <Mushroom key={i} p={q.p} s={1.3} />)}
      <GRing spots={spots} target={target} onPick={pend} R={R} />
      {heroes.map((h, k) => <HeroM key={h} who={h} p={[2.1 - k * 4.2, 0, R + 1.9 - k * 0.2]} s={k ? 0.75 : 0.85} r={[0, k ? 0.35 : -0.35, 0]} mood={k ? (walk === 'happy' ? 'happy' : 'idle') : walk} />)}
      <Butterflies n={5} c={[0, 2.9, R - 4]} rad={4} />
    </Stage>
    <button className="arrow l" aria-label="ձախ" onClick={() => turn(-1)}>{'◀︎'}</button><button className="arrow r" aria-label="աջ" onClick={() => turn(1)}>{'▶︎'}</button>
  </div>
}
const COLS = ['#ffd3ec', '#e3d3ff', '#cfe6ff', '#c9f0b0', '#ffe3b8', '#ffcfe8', '#d3f3ef', '#fff0b8']
const gameSpot = (id: string, i: number, ret: string): Spot => { const g = GAMES.byId[id]; return { id, c: COLS[i % COLS.length], e: g.emoji, label: g.title, done: !!G.S.played[id], act: () => launchGame(id, ret) } }
/** Игры Мане из списка, которые есть в оригинале, открываются в оригинальных 3D-сценах */
export const MANE_ORIG: Record<string, string> = { m_cake: 'kitchen', m_icecream: 'kitchen', m_flowers: 'garden', m_aquarium: 'sea', m_music: 'music', m_outfits: 'salon', m_color: 'draw', m_pets: 'pets', m_puzzle: 'puzzles', m_memory: 'puzzles', m_maze: 'puzzles', m_diff: 'puzzles', m_colors: 'puzzles', m_hidden: 'prank', m_cleanup: 'prank', m_studiosing: 'music', loc_studiosing: 'music' }
export function launchGame(id: string, ret: string, extra: Partial<{ who: Hero; cfg: unknown; level: string }> = {}) {
  if (MANE_ORIG[id]) { openScene(MANE_ORIG[id], ret); return }
  playGame({ id, ...extra } as never, ret)
}

/* ---------- хабы ---------- */
export function AHub() {
  const ids = GAMES.list('anulik').map((g: any) => g.id)
  const spots: Spot[] = [...ids.map((id: string, i: number) => gameSpot(id, i, 'ahub')),
    { id: 'phone', c: '#e3d3ff', e: '📱', label: 'Իմ սմարթֆոնը', act: () => openScene('phone', 'ahub') },
    { id: 'city', c: '#cfe6ff', e: '🏙️', label: 'Քաղաք', act: () => openScene('city', 'ahub') },
    { id: 'shub', c: '#ffd3ec', e: '💞', label: 'Քույրերը միասին', act: () => go('shub') },
    { id: 'fhub', c: '#c9f0b0', e: '🧭', label: 'Ընտանեկան արկածներ', act: () => go('fhub') }]
  return <RingHub name="ahub" spots={spots} heroes={['anulik', 'mane']} intro={[L('anulik', 'Ընտրի՛ր խաղը։ Ես պատրաստ եմ ամեն ինչի։')]} />
}
export function HHub() {
  const ids = GAMES.list('harut').map((g: any) => g.id)
  const spots: Spot[] = [
    { id: 'car', c: '#cfe6ff', e: '🚗', label: 'Մեքենա', icon: () => <><Item k="car" s={1.7} r={[0, -0.6, 0]} /></>, act: () => openScene('car', 'hhub') },
    ...ids.map((id: string, i: number) => gameSpot(id, i + 1, 'hhub')),
    { id: 'tales', c: '#fff0b8', e: '📖', label: 'Հարություն քեռու պատմությունները', act: () => openScene('tales', 'hhub') },
    { id: 'garden', c: '#c9f0b0', e: '🌷', label: 'Այգի', act: () => openScene('garden', 'hhub') },
    { id: 'city', c: '#cfe6ff', e: '🏙️', label: 'Քաղաք', act: () => openScene('city', 'hhub') },
    { id: 'fhub', c: '#ffe3b8', e: '🧭', label: 'Ընտանեկան արկածներ', act: () => go('fhub') }]
  return <RingHub name="hhub" spots={spots} heroes={['harut', 'mane']} intro={[L('harut', 'Աղջիկնե՛ր, ընտրեք՝ ինչով զբաղվենք։ Քեռին պատրաստ է։')]} />
}
const advSpots = (sis: boolean): Spot[] => Object.entries(ADVDATA.A as Record<string, any>).filter(([, a]) => !!a.sis === sis).map(([id, a], i) => ({ id, c: COLS[i % COLS.length], e: a.e, label: a.title, done: !!G.S.adventures[id], act: () => startAdv(id) }))
export function FHub() { return <RingHub name="fhub" spots={advSpots(false)} heroes={['harut', 'mane', 'anulik']} intro={[L('harut', 'Ընտրի՛ր արկածը։ Մենք երեքով ենք գնում։')]} /> }
export function SHub() { return <RingHub name="shub" spots={advSpots(true)} heroes={['anulik', 'mane']} intro={[L('anulik', 'Մանե, ի՞նչ անենք միասին այսօր։'), L('mane', 'Ամեն ինչ։ Միայն քեզ հետ։')]} /> }
export function DuoHub() {
  const spots: Spot[] = [gameSpot('duo_race', 0, 'duo'), gameSpot('duo_quiz', 1, 'duo'),
    { id: 'fhub', c: '#c9f0b0', e: '🧭', label: 'Ընտանեկան արկածներ', act: () => go('fhub') },
    { id: 'shub', c: '#ffd3ec', e: '💞', label: 'Քույրերը միասին', act: () => go('shub') }]
  return <RingHub name="duo" spots={spots} heroes={['mane', 'anulik']} intro={[L('harut', 'Խաղացող 1՝ Մանե (փոքրիկ), Խաղացող 2՝ Անուլիկ (դեռահաս)։ Հարությունի առաջադրանքները՝ միասին։')]} />
}
export function MNew() {
  const ids = ['m_count', 'm_toyshop', 'm_fruit', 'm_balloons', 'm_houses', 'm_hidden', 'm_cleanup', 'loc_fountain', 'loc_ducks']
  return <RingHub name="mnew" spots={ids.filter(id => GAMES.byId[id]).map((id, i) => ({ ...gameSpot(id, i, 'mnew'), act: () => playGame({ id, who: 'mane' }, 'mnew') }))} heroes={['mane', 'anulik']} intro={[L('anulik', 'Մանե, սրանք քո նոր խաղերն են։ Ընտրի՛ր։')]} />
}

/* ===================== Хост мини-игры: панель поверх 3D-сцены ===================== */
export function Game() {
  const req = useFam(s => s.game), host = useRef<HTMLDivElement>(null), [run, setRun] = useState(0)
  const def = useMemo(() => req?.def ?? (req?.id ? GAMES.byId[req.id] : null), [req])
  const who: Hero = req?.who ?? (def?.who && def.who !== 'any' ? def.who : useFam.getState().hero)
  useEffect(() => {
    if (!def || !host.current) return
    const root = host.current; root.innerHTML = ''
    const scr = G.el('div', { class: 'lg-screen' }), body = G.el('div', { class: 'body' }); scr.append(body); root.append(scr)
    const cleanups: (() => void)[] = []; let finished = false
    G.S.hero = who
    const api = {
      root: scr, body, game: def, who, cfg: Object.assign({}, def.cfg, req?.cfg || {}), level: req?.level || G.levelFor(def, who),
      ctx: { onCleanup: (f: () => void) => cleanups.push(f) },
      done: async (res: any) => {
        if (finished) return; finished = true
        const f = useFam.getState(), inAdv = f.ret === 'story' && !!f.adv
        if (api.level === 'easy' && who === 'mane') res = { ...res, stars: 3 } // у малышки нет «плохих» оценок
        const choice = await G.finish({ ...def, who }, { noReplay: inAdv, ...res })
        if (inAdv) { useFam.getState().set({ adv: { ...f.adv!, step: f.adv!.step + 1, scene: undefined } }); go('story') }
        else if (choice === 'replay') setRun(r => r + 1)
        else go(f.ret ?? 'who')
      },
    }
    try { ENG[def.engine](api) } catch (e) { console.error(e) }
    return () => { cleanups.forEach(f => { try { f() } catch { /* */ } }); document.querySelectorAll('.lg-dialog,.lg-modal-back').forEach(n => n.remove()); hush(); root.innerHTML = '' }
  }, [def, run])
  if (!def) return null
  const others = (['mane', 'anulik', 'harut'] as Hero[]).filter(h => h !== who).slice(0, 1)
  return <>
    <Meadowland cam={{ t: [2.2, 1.5, 0], dir: [0, 0.16, 1], w: 9, h: 5.5 }}>
      <HeroM who={who} p={[3.4, 0, 1.6]} s={1.05} r={[0, -0.5, 0]} mood="wave" />
      {others.map(h => <HeroM key={h} who={h} p={[5.2, 0, 0.6]} s={0.85} r={[0, -0.6, 0]} />)}
      <Animal k="cat" p={[2.6, 0, 2.6]} s={0.5} r={[0, -0.3, 0]} />
    </Meadowland>
    <div ref={host} className="lg lg-layer side" />
    <div className="title" style={{ top: 'calc(14px + env(safe-area-inset-top))', pointerEvents: 'none' }}><h2 style={{ marginTop: 0 }}>{def.emoji} {def.title}</h2></div>
  </>
}

/* ===================== Приключения и занятия сестёр ===================== */
export function startAdv(id: string) {
  const f = useFam.getState(); f.set({ adv: { id, step: -1, duo: f.mode === 'duo' }, ret: null }); go('story')
}
const NAME: Record<Hero, string> = { mane: 'Մանե', anulik: 'Անուլիկ', harut: 'Հարություն' }
export function Story() {
  const adv = useFam(s => s.adv), set = useFam(s => s.set), later = useLater(), [busy, setBusy] = useState(false), [rewarded, setRewarded] = useState(false)
  const a = adv ? (ADVDATA.A as any)[adv.id] : null
  // вернулись из оригинальной сцены: если там была победа — этап пройден
  useEffect(() => { if (adv?.scene && adv.snap !== undefined && doneTotal() > adv.snap) set({ adv: { ...adv, step: adv.step + 1, scene: undefined, snap: undefined } }) }, [])
  const step = a && adv && adv.step >= 0 && adv.step < a.steps.length ? a.steps[adv.step] : null
  useEffect(() => { if (step) { const t = setTimeout(() => void sayText(adv!.duo ? (step.who === 'mane' ? 'Խաղացող 1 (Մանե)' : step.who === 'anulik' ? 'Խաղացող 2 (Անուլիկ)' : 'Երկու խաղացողները միասին։') : step.task), 700); return () => clearTimeout(t) } }, [adv?.step])
  useEffect(() => {
    if (!a || !adv || adv.step < a.steps.length || rewarded) return
    setRewarded(true)
    G.S.adventures[adv.id] = true; star(5); G.addSouvenir('adv_' + adv.id)
    if (a.countries) a.countries.forEach((c: string) => { if (!G.S.countries.includes(c)) G.S.countries.push(c) })
    if (a.animals) a.animals.forEach((x: string) => G.S.animals.push(x))
    G.emit('adventure', adv.id); shower([0, 4, 0], 4, 'confetti', 80); sfx('win')
    later(() => void talk(...a.outro), 900)
  }, [adv?.step])
  if (!a || !adv) return null
  const begin = async () => { setBusy(true); await talk(...a.intro); setBusy(false); set({ adv: { ...adv, step: 0 } }) }
  const launch = () => {
    const s = a.steps[adv.step]
    const orig = typeof s.game === 'string' ? MANE_ORIG[s.game] : s.game?.engine === 'puzzle' ? 'puzzles' : null
    if (orig) { set({ adv: { ...adv, snap: doneTotal(), scene: orig }, ret: 'story' }); go(orig); return }
    const lvl = G.S.settings.level && G.S.settings.level !== 'auto' ? G.S.settings.level : (s.who === 'mane' ? 'easy' : s.who === 'anulik' ? 'hard' : 'normal')
    const def = typeof s.game === 'string' ? undefined : { id: 'adv_' + adv.id + '_' + adv.step, who: s.who, desc: s.task, ...s.game }
    playGame(typeof s.game === 'string' ? { id: s.game, who: s.who, level: lvl } : { def, who: s.who, level: lvl }, 'story')
  }
  const next = () => set({ adv: { ...adv, step: adv.step + 1, scene: undefined, snap: undefined } })
  const end = adv.step >= a.steps.length
  const speaking: Hero | null = step ? step.who : null
  return <>
    <Meadowland cam={{ t: [0, 1.5, 1], dir: [0, 0.18, 1], w: 8, h: 5.4, tray: true }}>
      {(['harut', 'mane', 'anulik'] as Hero[]).map((h, k) => <HeroM key={h} who={h} p={[(k - 1) * 1.8, 0, 1 + (k === 1 ? 0.4 : 0)]} s={1} r={[0, (1 - k) * 0.25, 0]} mood={end ? 'dance' : speaking === h ? 'wave' : 'idle'} />)}
      <Float p={[0, 3.4, 0]}><Emoji e={a.e} s={1.4} /></Float>
      {end && <Item k="chest" p={[0, 0, 2.6]} s={1.1} />}
    </Meadowland>
    <div className="fcard">
      <div className="chips">{a.steps.map((s: any, i: number) => <div key={i} className={'chip' + (i < adv.step ? ' ok' : i === adv.step ? ' now' : '')}>{G.HEROES[s.who].face}</div>)}</div>
      {adv.step < 0 && <><h3>{a.e} {a.title}</h3><p>{a.steps.map((s: any) => s.task).join(' → ')}</p><div className="acts2"><button className="pbtn2" disabled={busy} onClick={begin}>▶️ Սկսել արկածը</button></div></>}
      {step && <>
        {adv.duo && <p style={{ color: '#d9539b', fontWeight: 900 }}>🤝 Հերթը՝ {step.who === 'mane' ? 'Խաղացող 1 (Մանե)' : step.who === 'anulik' ? 'Խաղացող 2 (Անուլիկ)' : 'Երկու խաղացողները միասին։'}</p>}
        <h3>Փուլ {adv.step + 1} / {a.steps.length}՝ {step.task}</h3>
        <p>{step.who === 'mane' ? 'Պարզ առաջադրանք փոքրիկի համար՝ առանց շտապելու, հուշումներով' : step.who === 'anulik' ? 'Ավելի բարդ առաջադրանք դեռահասի համար' : 'Հարությունն օգնում է ամբողջ ընտանիքին'}</p>
        <div className="acts2"><button className="pbtn2" onClick={launch}>▶️ Կատարել</button>
          {adv.scene ? <button className="pbtn2 purple" onClick={next}>✅ Պատրաստ է</button> : <button className="pbtn2 white" onClick={next}>⏭️ Բաց թողնել փուլը</button>}</div></>}
      {end && <><h3>🏆 Արկածն ավարտված է։</h3><p>Պարգև՝ {a.sv[0]} {a.sv[1]}</p><div className="acts2"><button className="pbtn2 purple" onClick={() => { setRewarded(false); set({ adv: { ...adv, step: -1 } }) }}>🔁 Նորից անցնել</button><button className="pbtn2" onClick={() => go(adv.duo ? 'duo' : a.sis ? 'shub' : 'fhub')}>✅ Պատրաստ է</button></div></>}
    </div>
  </>
}

/* ===================== Сказки дяди Харутюна (озвучены его голосом) ===================== */
export function Tales() {
  const [i, setI] = useState<number | null>(null), [p, setP] = useState(0)
  const st = i === null ? null : DATA.STORIES[i]
  useEffect(() => { if (st) void sayText(st.pages[p][1]); else { const t = setTimeout(() => void sayText('Բարի հեքիաթներ ամբողջ ընտանիքի համար'), 600); return () => clearTimeout(t) } }, [i, p])
  return <>
    <Stage cam={{ t: [0, 1.6, 0], dir: [0, 0.2, 1], w: 8, h: 5.5, tray: true }} sky={G.isNight() ? ['#3a3a7a', '#7a5aa6'] : ['#ffd9ee', '#fff2f9']}>
      <Room wall="#ffe9d6" floor="#e8c9a0" /><Rug p={[0, 0.02, 1]} r={2.4} /><Window3 p={[-3, 3.4, -3.4]} night={G.isNight()} />
      <Uncle p={[-1.6, 0, 0.6]} s={1.1} r={[0, 0.4, 0]} mood={st ? 'wave' : 'idle'} /><Person p={[0.6, 0, 1.4]} s={0.9} mood="sit" outfit={useSave.getState().outfit} /><Anulik p={[2, 0, 0.8]} s={0.95} r={[0, -0.4, 0]} mood="sit" look={useFam.getState().look} />
      <Animal k="cat" p={[1.2, 0, 2.2]} s={0.5} mood="sleep" />
      {st && <Float p={[0.4, 3.2, 0]}><Emoji e={st.pages[p][0]} s={1.6} /></Float>}
    </Stage>
    <div className="tale">
      {!st ? <div className="acts2" style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>{DATA.STORIES.map((s: any, k: number) => <button key={k} className="pbtn2 white" onClick={() => { setI(k); setP(0); sfx('paper') }}>{s.emoji} {s.title}</button>)}</div>
        : <>
          <div style={{ textAlign: 'center', fontWeight: 900, color: '#d9539b' }}>{st.emoji} {st.title} · {p + 1} / {st.pages.length}</div>
          <div style={{ margin: '8px 0 12px' }}>{st.pages[p][1]}</div>
          <div className="acts2" style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
            <button className="pbtn2 white" disabled={p === 0} onClick={() => setP(p - 1)}>⬅️</button>
            <button className="pbtn2 purple" onClick={() => void sayText(st.pages[p][1])}>🔊</button>
            {p < st.pages.length - 1 ? <button className="pbtn2" onClick={() => { setP(p + 1); sfx('paper') }}>➡️</button>
              : <button className="pbtn2" onClick={() => { star(2); G.emit('story'); setI(null) }}>✅ Վերջ</button>}
          </div></>}
    </div>
  </>
}

/* ===================== Смартфон Анулик в её комнате ===================== */
export function PhoneScene() {
  const host = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!host.current) return
    const un = PHONE.mount(host.current, null, {
      map: () => openScene('city', 'phone'), settings: () => go('parents'),
      look: (i: number) => useFam.getState().set({ look: i }), place: (id: string) => { useFam.getState().set({ ret: 'phone' }); (window as any).__cityGo = id; go('city') },
    })
    return () => un()
  }, [])
  const look = useFam(s => s.look)
  return <>
    <Stage cam={{ t: [0, 1.7, 0], dir: [0, 0.18, 1], w: 9, h: 5.8 }}>
      <Room wall="#efe4ff" floor="#d9c8f0" /><Rug p={[0, 0.02, 0.8]} r={2.4} c={['#e3d3ff', '#fff', '#ffd3ec']} /><Window3 p={[3, 3.3, -3.4]} night={G.isNight()} />
      <B a={[2.6, 0.6, 1.4]} p={[-3.6, 0.3, -1.6]} c="#b79bff" rad={0.15} /><Item k="pillow" p={[-4.3, 0.75, -1.6]} s={0.8} c="#fff" />
      <Anulik p={[3.3, 0, 1]} s={1.1} r={[0, -0.5, 0]} mood="wave" look={look} /><Person p={[-2.6, 0, 1.2]} s={0.8} r={[0, 0.5, 0]} outfit={useSave.getState().outfit} />
    </Stage>
    <div ref={host} />
  </>
}
void Tap; void S; void Flower; void useUI
