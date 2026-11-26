import { useEffect, useState, type ReactNode } from 'react'
import { useUI, go } from '../core/ui'
import { useSave } from '../core/store'
import { repeat, say, speakerOf } from '../core/voice'
import { sfx } from '../core/audio'
import { COLLECT } from '../core/rewards'
import { shower } from '../kit/base'
import { homeTarget, HUBS } from '../core/family'

export function HUD() {
  const { scene, line, lineId, taskId } = useUI()
  const { stars, muted, set } = useSave()
  if (['parents', 'rest'].includes(scene)) return null
  const title = scene === 'title'
  return <>
    <div className="hud">
      {!title && <button className="rb home" aria-label="Գլխավոր էջ" onClick={() => { sfx('tap'); go(homeTarget(scene)) }}>🏠</button>}
      {taskId && <button className="rb replay" aria-label="Նորից լսել" onClick={() => { sfx('tap'); repeat() }}>🔊</button>}
      <div className="sp" />
      {!title && <button className="stars" aria-label="Աստղեր" onClick={() => { sfx('tap'); go('room') }}><b key={stars}>⭐</b>{stars}</button>}
      <button className="rb" aria-label="Երաժշտություն" onClick={() => set({ muted: !muted })}>{muted ? '🔇' : '🎵'}</button>
      {(title || scene === 'who' || HUBS.includes(scene)) && <button className="rb" aria-label="Ծնողներին" onClick={() => go('parents')}>⚙️</button>}
    </div>
    {['kitchen', 'pets', 'market', 'prank', 'music', 'birthday', 'room', 'puzzles', 'draw'].includes(scene) && <div className="rot" key={'r' + scene}><i>📱</i></div>}
    {line && <div className="bubble" key={lineId}><span>{({ mane: '👧🏻', anulik: '👩🏻', harut: '👨🏻' } as Record<string, string>)[speakerOf(lineId)]}</span><p>{line}</p></div>}
  </>
}

export function RewardPop() {
  const id = useUI(s => s.reward), it = COLLECT.find(c => c.id === id)
  useEffect(() => { if (it) { shower([0, 4, 0], 4, 'confetti', 50); void say('newgift') } }, [it])
  if (!it) return null
  return <div className="reward" onClick={() => { useUI.setState({ reward: null }); sfx('pop') }}>
    <div className="rays" /><div className="prize" style={{ background: `radial-gradient(circle at 35% 28%, #fff, ${it.color})` }}>{it.icon}</div><button className="big">👍</button>
  </div>
}

export interface TI { id: string; icon: ReactNode; color?: string; label?: string }
/** Нижний поднос с крупными кнопками */
export function Tray({ items, value, on, small }: { items: TI[]; value?: string; on: (id: string) => void; small?: boolean }) {
  return <div className={'tray' + (small ? ' small' : '')}><div className="trayin">
    {items.map(t => <button key={t.id} aria-label={t.label ?? t.id} className={'tb' + (value === t.id ? ' on' : '')} style={t.color ? { ['--c' as string]: t.color } : undefined} onClick={() => { sfx('tap'); on(t.id) }}>{t.icon}</button>)}
  </div></div>
}
export const Big = ({ children, on, c, label }: { children: ReactNode; on: () => void; c?: string; label?: string }) => <button className="big" aria-label={label} style={c ? { ['--c' as string]: c } : undefined} onClick={() => { sfx('tap'); on() }}>{children}</button>
/** Кнопка «назад» внутри локации */
export const Back = ({ on }: { on: () => void }) => <button className="rb inback" aria-label="Հետ" onClick={() => { sfx('whoosh'); on() }}>{'◀\uFE0E'}</button>

/** Виртуальный джойстик + стрелки. Пишет направление в dir. */
export function Joy({ dir }: { dir: React.MutableRefObject<{ x: number; y: number }> }) {
  const [k, setK] = useState({ x: 0, y: 0 })
  useEffect(() => {
    const keys = new Set<string>()
    const upd = () => { const h = (...a: string[]) => a.some(x => keys.has(x)); dir.current = { x: (h('ArrowRight', 'KeyD') ? 1 : 0) - (h('ArrowLeft', 'KeyA') ? 1 : 0), y: (h('ArrowUp', 'KeyW') ? 1 : 0) - (h('ArrowDown', 'KeyS') ? 1 : 0) } }
    const d = (e: KeyboardEvent) => { if (/Arrow|Space/.test(e.code)) e.preventDefault(); keys.add(e.code); upd() }, u = (e: KeyboardEvent) => { keys.delete(e.code); upd() }, b = () => { keys.clear(); upd() }
    window.addEventListener('keydown', d); window.addEventListener('keyup', u); window.addEventListener('blur', b)
    return () => { window.removeEventListener('keydown', d); window.removeEventListener('keyup', u); window.removeEventListener('blur', b); dir.current = { x: 0, y: 0 } }
  }, [])
  const mv = (e: React.PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect(); let x = (e.clientX - r.left) / r.width * 2 - 1, y = 1 - (e.clientY - r.top) / r.height * 2
    const l = Math.hypot(x, y); if (l > 1) { x /= l; y /= l }
    dir.current = { x, y }; setK({ x, y })
  }
  const end = () => { dir.current = { x: 0, y: 0 }; setK({ x: 0, y: 0 }) }
  return <div className="joy" onPointerDown={e => { e.currentTarget.setPointerCapture(e.pointerId); mv(e) }} onPointerMove={e => { if (e.currentTarget.hasPointerCapture(e.pointerId)) mv(e) }} onPointerUp={end} onPointerCancel={end}><i style={{ transform: `translate(${k.x * 38}px,${-k.y * 38}px)` }}>🌟</i></div>
}
