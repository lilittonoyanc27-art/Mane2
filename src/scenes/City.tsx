/* ===== Открытый 3D-город: 16 мест, транспорт, день/ночь, погода, секреты, неожиданные события ===== */
import { useEffect, useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Stage, Tap, Float, Sign, burst, Star3, S, C, B, K, Emoji, Disc, type V3 } from '../kit/base'
import { Meadow, Island, Flower, Tree, Pine, House, Mushroom, Clouds, Rainbow, Butterflies } from '../kit/nature'
import { Fairy } from '../kit/people'
import { Animal, type AKind } from '../kit/animals'
import { Item } from '../kit/items'
import { Player, TapGround, Zone, Beam, newPlayer, type PlayerRef } from '../kit/world'
import { Joy } from '../ui/HUD'
import { sayText, sayAs } from '../core/voice'
import { sfx } from '../core/audio'
import { star } from '../core/store'
import { useFam, playGame, openScene, type Hero } from '../core/family'
import { G, PLACES } from '../legacy'
import { HeroM, launchGame, startAdv, talk } from './Family'

const GRID = [-30, -10, 10, 30]
const IDS = ['home', 'city', 'mall', 'market', 'cinema', 'cafe', 'amusement', 'zoo', 'aquapark', 'airport', 'station', 'beach', 'forest', 'mountains', 'studio', 'space']
const LOOK: Record<string, { c: string; roof: string; pad: string }> = {
  home: { c: '#fff0f7', roof: '#ff9ecb', pad: '#ffe3f1' }, city: { c: '#efe8ff', roof: '#b79bff', pad: '#e9e3f5' }, mall: { c: '#ffe6f3', roof: '#ff8fc5', pad: '#f6eef8' }, market: { c: '#eaffe0', roof: '#8fdc9a', pad: '#f1f8e9' },
  cinema: { c: '#3a3058', roof: '#c03a6a', pad: '#ecdff4' }, cafe: { c: '#fff4e6', roof: '#ffb07a', pad: '#fff0dc' }, amusement: { c: '#fff6d8', roof: '#ff7a9a', pad: '#ffe9f2' }, zoo: { c: '#f4f0d8', roof: '#8fcf6a', pad: '#e6f4c8' },
  aquapark: { c: '#e2f8ff', roof: '#56c3f0', pad: '#cdeffc' }, airport: { c: '#eef4ff', roof: '#7fa8e8', pad: '#e3ebf7' }, station: { c: '#f3ece4', roof: '#a87a5a', pad: '#ece3da' }, beach: { c: '#fff3d0', roof: '#ffcf6a', pad: '#ffeec4' },
  forest: { c: '#e4f7dc', roof: '#5cbf6a', pad: '#cfeec0' }, mountains: { c: '#f0f2f8', roof: '#9aa4c8', pad: '#e1e8f0' }, studio: { c: '#2f2a48', roof: '#8f6bff', pad: '#e6dcff' }, space: { c: '#24224a', roof: '#3a3a8a', pad: '#d6d8ff' },
}
const posOf = (id: string): V3 => { const p = PLACES.P[id]; return [GRID[p.c], 0, GRID[p.r] - 4] }
const OK = (x: number, z: number) => Math.hypot(x, z + 4) < 47
const OBST: [number, number, number][] = IDS.map(id => { const p = posOf(id); return [p[0], p[2] - 1, 2.6] })
const SECRETS: { id: string; p: V3 }[] = [{ id: 'w_secret_1', p: [-41, 0, -6] }, { id: 'w_secret_2', p: [38, 0, -30] }, { id: 'w_secret_3', p: [0, 0, 38] }, { id: 'w_secret_4', p: [41, 0, 14] }]
G.on('play', (id: string) => { if (id === 'secret_door') G.flag('secretCode') })

function useClock() {
  const [, setT] = useState(0)
  useEffect(() => { const f = () => setT(t => t + 1); G.on('clock', f); G.on('weather', f); return () => { /* слушатели живут вместе с модулем */ } }, [])
  return { night: G.isNight(), eve: G.S.clock >= 18 && G.S.clock < 20, weather: G.S.weather as string }
}
/** Семья идёт следом за героем */
function Followers({ pl, who }: { pl: React.MutableRefObject<PlayerRef>; who: Hero[] }) {
  const refs = useRef<(THREE.Group | null)[]>([]), trail = useRef<THREE.Vector3[]>([])
  useFrame(() => {
    const p = pl.current, last = trail.current[trail.current.length - 1]
    if (!last || last.distanceTo(new THREE.Vector3(p.x, 0, p.z)) > 0.25) { trail.current.push(new THREE.Vector3(p.x, 0, p.z)); if (trail.current.length > 40) trail.current.shift() }
    refs.current.forEach((g, i) => { if (!g) return; const q = trail.current[Math.max(0, trail.current.length - 1 - (i + 1) * 7)] ?? new THREE.Vector3(p.x, 0, p.z)
      const off = (i ? -1 : 1) * 0.9; g.position.lerp(new THREE.Vector3(q.x + off, 0, q.z + 0.6), 0.12); g.lookAt(p.x, 0, p.z) })
  })
  return <>{who.map((h, i) => <group key={h} ref={g => { refs.current[i] = g }}><HeroM who={h} s={0.85} /></group>)}</>
}
function Building({ id, onTap }: { id: string; onTap: () => void }) {
  const d = PLACES.P[id], L = LOOK[id], p = posOf(id), seen = G.S.visited.includes(id)
  return <group position={p}>
    <Disc a={5.2} p={[0, 0.02, 0]} c={L.pad} o={{ rough: 1 }} />
    <Tap on={onTap} hit={2.6} hitP={[0, 2, 0]} fx="star"><House s={1.7} c={L.c} roof={L.roof} p={[0, 0, -1]} /></Tap>
    <Float p={[0, 5.4, -1]} a={0.2}><Emoji e={d.e} s={1.8} /></Float>
    <Sign t={d.name} p={[0, 0.5, 2.1]} w={3.6} h={0.55} r={[-0.3, 0, 0]} />
    {!seen && <Beam c="#fff3a0" h={7} />}
  </group>
}
/** Неожиданное событие рядом с героем */
type Ev = { kind: 'pet' | 'gift' | 'fairy' | 'ice'; p: V3; a?: AKind } | null

export function City() {
  const pl = useRef(newPlayer(GRID[0], GRID[0] + 1.5)), dir = useRef({ x: 0, y: 0 }), hero = useFam(s => s.hero), look = useFam(s => s.look)
  const [near, setNear] = useState<string | null>(null), [open, setOpen] = useState<string | null>(null), [car, setCar] = useState(false), [map, setMap] = useState(false), [ev, setEv] = useState<Ev>(null)
  const { night, eve, weather } = useClock(), nearR = useRef<string | null>(null), evT = useRef(40 + Math.random() * 30)
  useEffect(() => {
    const target = (window as any).__cityGo; if (target) { (window as any).__cityGo = null; const p = posOf(target); pl.current.x = p[0]; pl.current.z = p[2] + 4; setOpen(target) }
    if (!G.S.visited.length) setTimeout(() => void talk({ who: 'harut', text: 'Սա մեր քաղաքն է։ Գնա՛ ուր ուզում ես՝ սլաքներով, ջոյստիկով կամ պարզապես սեղմի՛ր վայրի վրա։' }, { who: 'anulik', text: 'Մոտեցի՛ր շենքին և սեղմի՛ր «Մտնել»։ Իսկ դեռ փնտրե՛ք առկայծող ✨՝ այնտեղ թաքստոցներ են։' }), 900)
  }, [])
  useEffect(() => { if (night) G.flag('night') }, [night])
  const tick = (p: PlayerRef, d: number) => {
    let nn: string | null = null
    for (const id of IDS) { const q = posOf(id); if (Math.hypot(q[0] - p.x, q[2] + 2.6 - p.z) < 3.4) { nn = id; break } }
    if (nn !== nearR.current) { nearR.current = nn; setNear(nn); if (nn) sfx('tap') }
    if (p.speed > 0.5 && !ev) { evT.current -= d; if (evT.current <= 0) { evT.current = 45 + Math.random() * 35; spawnEv(p) } }
  }
  const spawnEv = (p: PlayerRef) => {
    const kind = (['pet', 'gift', 'fairy', 'ice', 'pet'] as const)[Math.floor(Math.random() * 5)]
    const a = (['cat', 'dog', 'rabbit', 'duck', 'turtle'] as AKind[])[Math.floor(Math.random() * 5)]
    const x = Math.max(-40, Math.min(40, p.x + (Math.random() - 0.5) * 8)), z = Math.max(-40, Math.min(36, p.z + (Math.random() - 0.5) * 8))
    setEv({ kind, p: [x, 0, z], a }); sfx('magic')
    const line = { pet: { who: 'mane' as Hero, text: 'Օ՜յ։ Այնտեղ ինչ-որ մեկը կորել է։ Արի՛ օգնենք։' }, gift: { who: 'anulik' as Hero, text: 'Նայե՛ք, նվեր։ Ինչ-որ մեկը մեզ համար է թողե՞լ։' }, fairy: { who: 'mane' as Hero, text: 'Փերի։ Իսկական փերի է եկել։' }, ice: { who: 'harut' as Hero, text: 'Անակնկալ, աղջիկնե՛ր։ Այստեղ պաղպաղակ են վաճառում՝ ո՞վ ինչ է ուզում։' } }[kind]
    G.toast('❗ Անսպասելի արկած։'); void talk(line)
  }
  const takeEv = async () => {
    if (!ev) return; const e = ev; setEv(null); burst(e.p, 'heart', 20)
    if (e.kind === 'pet') { const emo = { cat: '🐈', dog: '🐕', rabbit: '🐇', duck: '🐥', turtle: '🐢' }[e.a as string] ?? '🐈'
      G.on('play', function once(id: string) { if (id === 'rescue') { G.S.animals.push(emo); G.emit('animal'); G.toast('🐾 Փրկված կենդանիներ՝ ' + G.S.animals.length) } })
      playGame({ def: { id: 'rescue', who: 'any', emoji: emo, title: 'Փրկում ենք փոքրիկին', desc: 'Անսպասելի արկած', engine: 'care', cfg: { pet: emo, win: 'Փոքրիկը փրկված է։ Նրան կտանենք կենդանիների օգնության կենտրոն։' } }, who: hero }, 'city') }
    else if (e.kind === 'gift') { const left = Object.keys(PLACES.GIFTS).filter(k => k.startsWith('gift_') && !G.S.souvenirs.includes(k)); if (left.length) G.addSouvenir(left[Math.floor(Math.random() * left.length)]); else star(3) }
    else if (e.kind === 'fairy') { star(3); G.setWeather('sun'); G.toast('🧚 Փերին նվիրեց 3 աստղ և արևիկ։') }
    else { star(2); void talk({ who: 'mane', text: 'Ինձ՝ ելակով։' }, { who: 'anulik', text: 'Իսկ ինձ՝ պիստակով, շնորհակալություն, քեռի։' }) }
  }
  const enter = (id: string) => {
    setOpen(id); sfx('door')
    if (!G.S.visited.includes(id)) { G.S.visited.push(id); G.emit('visit', id) }
    const h = useFam.getState().hero, n = PLACES.P[id].name
    void sayAs(h, ({ mane: 'Ուռա՜, մենք «' + n + '»-ում ենք։ Այստեղ այնքան հետաքրքիր բաներ կան։', anulik: '«' + n + '»՝ հիանալի վայր է լուսանկարների և առաջադրանքների համար։', harut: 'Բարի գալուստ, աղջիկնե՛ր։ Սա «' + n + '»-ն է։ Աջ կողմում՝ ինչով կարելի է զբաղվել։' } as Record<string, string>)[h])
  }
  const walkTo = (id: string) => { const p = posOf(id); pl.current.target = { x: p[0], z: p[2] + 2.6 } }
  const others = (['mane', 'anulik', 'harut'] as Hero[]).filter(h => h !== hero)
  const sky: [string, string] = night ? ['#141448', '#4a3a7a'] : eve ? ['#ff9f7a', '#ffd6e6'] : weather === 'rain' || weather === 'cloud' ? ['#a9b8d8', '#e6e2f0'] : weather === 'snow' ? ['#cfe0f5', '#ffffff'] : ['#8ed0ff', '#ffe1f2']
  const drops = useMemo(() => Array.from({ length: 60 }, () => ({ l: Math.random() * 110, d: Math.random(), s: 0.5 + Math.random() * 0.4, f: 5 + Math.random() * 5 })), [])
  return <>
    <Stage sky={sky} fog={[30, 90]} sun={night ? 0.45 : eve ? 1.2 : 1.9} sunColor={night ? '#9fb0ff' : eve ? '#ffc79a' : '#fff2dc'} env={night ? 0.25 : 0.5} shadow={14}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.6, 0]} receiveShadow raycast={() => null}><circleGeometry args={[160, 40]} /><meshStandardMaterial color="#7fd6ee" roughness={0.15} /></mesh>
      <Island r={50} p={[0, 0, -4]} /><Meadow n={700} rad={46} center={[0, 0, -4]} />
      <TapGround pl={pl} r={60} />
      {[-20, 0, 20].map(z => <B key={'h' + z} a={[84, 0.05, 3]} p={[0, 0.03, z - 4]} c="#f1e8f6" rad={0.02} ns />)}
      {[-20, 0, 20].map(x => <B key={'v' + x} a={[3, 0.051, 84]} p={[x, 0.031, -4]} c="#f1e8f6" rad={0.02} ns />)}
      {IDS.map(id => <Building key={id} id={id} onTap={() => walkTo(id)} />)}
      {/* декор */}
      {Array.from({ length: 40 }, (_, i) => { const a = i * 0.157, r = 42 + (i % 3) * 1.6; return <Zone key={i} p={[Math.cos(a) * r, 0, Math.sin(a) * r - 4]} pl={pl} far={50}>{i % 3 === 0 ? <Pine s={1.8} /> : i % 3 === 1 ? <Tree s={1.6} c={['#8fdc9a', '#ffb9dc', '#c5b0ff'][i % 3]} /> : <Flower s={2.2} c="#ff8fc5" />}</Zone> })}
      {[[-20, -24], [0, -14], [20, -24], [-20, 16], [0, 6], [20, 16], [-38, 4], [38, -14]].map(([x, z], i) => <Zone key={'m' + i} p={[x + 3, 0, z]} pl={pl}><Tap on={() => sfx('boing')}><Mushroom s={1.4} c={['#ff7a8a', '#b79bff', '#ffb07a'][i % 3]} /></Tap></Zone>)}
      <Zone p={[0, 0, -4]} pl={pl}><Tap on={() => { sfx('splash'); burst([0, 2, -4], 'drop', 30) }} fx={null}><C a={[1.6, 1.7, 0.5]} p={[0, 0.25, 0]} c="#fff" /><C a={[1.4, 1.4, 0.1]} p={[0, 0.5, 0]} c="#7fd6ee" /><C a={[0.2, 0.3, 1.4]} p={[0, 1, 0]} c="#fff" /><S p={[0, 1.9, 0]} s={0.4} c="#ffc2e2" /></Tap></Zone>
      <Rainbow p={[0, 0, -48]} s={4} /><Clouds y={14} /><Butterflies n={6} c={[0, 2, -4]} rad={20} />
      {night && IDS.map(id => { const p = posOf(id); return <group key={'l' + id} position={[p[0] + 2.8, 0, p[2] + 2.8]}><C a={[0.06, 0.08, 2.4]} p={[0, 1.2, 0]} c="#6a5a7a" /><S p={[0, 2.5, 0]} s={0.22} c="#fff3a0" o={{ em: 1.6 }} /></group> })}
      {SECRETS.filter(s => !G.S.souvenirs.includes(s.id)).map(s => <Tap key={s.id} p={s.p} hit={1} hitP={[0, 0.8, 0]} glow on={() => {
        if (Math.hypot(pl.current.x - s.p[0], pl.current.z - s.p[2]) > 8) { G.toast('Մոտեցի՛ր ✨ առկայծմանը'); pl.current.target = { x: s.p[0], z: s.p[2] + 1.5 }; return }
        if (!G.S.secrets.includes(s.id)) G.S.secrets.push(s.id); G.addSouvenir(s.id); G.emit('secret'); star(2); burst(s.p, 'star', 30)
      }}><Float p={[0, 0.8, 0]}><Star3 s={0.3} c="#fff3a0" o={{ em: 1 }} /></Float></Tap>)}
      {ev && <group position={ev.p}><Beam c="#ffb9dc" h={4} /><Tap on={takeEv} hit={1.2} hitP={[0, 0.8, 0]} fx="heart">
        {ev.kind === 'pet' ? <Animal k={ev.a!} s={0.8} mood="happy" /> : ev.kind === 'gift' ? <Item k="gift" s={1.1} /> : ev.kind === 'fairy' ? <Float p={[0, 0.6, 0]}><Fairy s={0.7} mood="fly" /></Float> : <Item k="icecream" s={1.2} />}
        <Float p={[0, 2.2, 0]}><Emoji e="❗" s={0.9} /></Float></Tap></group>}
      <Player pl={pl} dir={dir} max={car ? 15 : 7} ok={OK} obst={OBST} car={car} cam={[0, 8, 12]} onTick={tick}>
        {m => car ? <group><Item k="car" s={2.2} /><group position={[0, 0.9, -0.2]} scale={0.55}><HeroM who="harut" /></group></group> : <HeroM who={hero} mood={m ? 'walk' : 'idle'} />}
      </Player>
      {!car && <Followers pl={pl} who={others} />}
    </Stage>
    {(weather === 'rain' || weather === 'snow') && <div className="wx">{drops.map((q, i) => weather === 'rain' ? <i key={i} className="drop" style={{ left: q.l + '%', animationDelay: q.d + 's', animationDuration: q.s + 's' }} /> : <i key={i} className="flake" style={{ left: q.l + '%', animationDelay: q.d * 6 + 's', animationDuration: q.f + 's' }}>❄</i>)}</div>}
    <Joy dir={dir} />
    <div className="cityhud">
      {near && !open && <button className="big" style={{ fontSize: 22, height: 70 }} onClick={() => enter(near)}>🚪 {PLACES.P[near].name}</button>}
      <div style={{ display: 'flex', gap: 10 }}>
        <button className="rb" aria-label="քարտեզ" onClick={() => { setMap(true); sfx('paper') }}>🗺️</button>
        <button className="rb" aria-label="մեքենա" onClick={() => { const c = !car; setCar(c); sfx(c ? 'horn' : 'tap'); if (c) void talk({ who: 'harut', text: 'Նստե՛ք, աղջիկնե՛ր։ Գոտիները կապեցի՞ք։ Գնացինք։' }) }}>{car ? '🚶' : '🚙'}</button>
        <button className="rb" aria-label="սմարթֆոն" onClick={() => openScene('phone', 'city')}>📱</button>
      </div>
      <div className="stars" style={{ fontSize: 18, height: 44 }}>{night ? '🌙' : '☀️'} {String(G.S.clock).padStart(2, '0')}:00 {({ sun: '', cloud: '☁️', rain: '🌧️', snow: '❄️' } as Record<string, string>)[weather]}</div>
    </div>
    {map && <div className="map" onClick={() => setMap(false)}><div onClick={e => e.stopPropagation()}>
      {IDS.map(id => <button key={id} className="tb" aria-label={PLACES.P[id].name} title={PLACES.P[id].name} onClick={() => { setMap(false); sfx('horn'); const p = posOf(id); pl.current.x = p[0]; pl.current.z = p[2] + 3.5; pl.current.target = null; G.toast('🚌 Հասանք՝ ' + PLACES.P[id].name) }}>{PLACES.P[id].e}</button>)}
    </div></div>}
    {open && <PlaceCard id={open} onClose={() => setOpen(null)} onOpen={setOpen} />}
  </>
}

/* ---------- карточка места: жители, интерактивные предметы, секрет, занятия ---------- */
function PlaceCard({ id, onClose, onOpen }: { id: string; onClose: () => void; onOpen: (id: string) => void }) {
  const d = PLACES.P[id], [k, setK] = useState(0), sid = 's_' + id, [, upd] = useState(0)
  const hero = useFam(s => s.hero)
  const act = (a: any) => {
    sfx('pop')
    if (a.place) { onOpen(a.place); return }
    if (a.adv) { startAdv(a.adv); return }
    if (a.game) launchGame(a.game, 'city', a.cfg ? { cfg: a.cfg } : {})
  }
  const secret = async () => {
    const sec = d.secret
    if (!G.S.secrets.includes(sid)) { G.S.secrets.push(sid); G.addSouvenir(sid); G.emit('secret'); star(1) }
    if (sec.place === 'secret_room' && !G.S.flags.secretCode) {
      await sayText('Նկարի հետևում կոդային կողպեքով դռնակ է։ Պետք է ծածկագիրը լուծել։')
      playGame({ def: { id: 'secret_door', who: 'anulik', emoji: '🔐', title: 'Կոդային կողպեք', desc: 'Գաղտնի դուռ', engine: 'cipher', cfg: { puzzles: [window.DATA.CIPHERS[2]], win: 'Չը՛խկ։ Դուռը բացվեց։' } }, who: 'anulik', level: 'easy' }, 'city'); return
    }
    if (sec.place) onOpen(sec.place); else upd(x => x + 1)
  }
  const found = G.S.secrets.includes(sid)
  return <div className="citycard" onPointerDown={e => e.stopPropagation()}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><span style={{ fontSize: 44 }}>{d.e}</span><h3 style={{ flex: 1 }}>{d.name}</h3><button className="rb" style={{ height: 48, minWidth: 48, fontSize: 22 }} onClick={onClose}>✖</button></div>
    {d.npc && <button className="act" onClick={() => { G.emit('talk'); const line = d.npc.lines[k % d.npc.lines.length]; setK(k + 1); void sayText(line) }}><b>{d.npc.e}</b><span><i style={{ fontStyle: 'normal', color: '#d9539b' }}>{d.npc.name}</i><br />💬 {d.npc.lines[k % d.npc.lines.length]}</span></button>}
    <div className="hots">{d.hot.map((h: any, i: number) => <button key={i} title={h.say} onClick={() => {
      sfx('pop'); void sayText(h.say)
      if (h.weather) { const w = ['sun', 'cloud', 'rain', 'snow']; G.setWeather(w[(w.indexOf(G.S.weather) + 1) % 4]) }
      if (h.time) G.setTime(G.isNight() ? 10 : 21)
      if (h.stars && !sessionStorage['st_' + id]) { try { sessionStorage['st_' + id] = '1' } catch { /* */ } star(h.stars) }
      if (h.open) openScene('phone', 'city')
    }}>{h.e}</button>)}
      <button style={{ opacity: found && !d.secret.place ? 1 : 0.35 }} title="✨" onClick={secret}>{found && !d.secret.place ? d.secret.sv.emoji : (d.secret.e || '✨')}</button>
    </div>
    {d.acts.map((a: any, i: number) => {
      const g = a.game && window.GAMES.byId[a.game], done = (g && G.S.played[a.game]) || (a.adv && G.S.adventures[a.adv])
      return <button key={i} className={'act' + (a.adv ? ' adv' : '')} onClick={() => act(a)}><b>{a.e}</b><span style={{ flex: 1 }}>{a.t}</span>{done ? '⭐' : a.place ? '🚪' : '▶️'}</button>
    })}
    {id === 'room_anulik' && G.S.flags.secretCode && <button className="act adv" onClick={() => onOpen('secret_room')}><b>🗝️</b><span style={{ flex: 1 }}>{PLACES.P.secret_room.name}</span>🚪</button>}
    {PLACES.P[id].sub && <button className="act" onClick={() => onOpen(id.startsWith('room_') || id === 'secret_room' ? 'home' : 'forest')}><b>⬅️</b><span>{id.startsWith('room_') || id === 'secret_room' ? PLACES.P.home.name : PLACES.P.forest.name}</span></button>}
    <div style={{ textAlign: 'center', fontSize: 13, opacity: 0.6, marginTop: 6 }}>{G.HEROES[hero].face} {G.HEROES[hero].name}</div>
  </div>
}
void K; void useMemo
declare global { interface Window { DATA: any; GAMES: any } }
