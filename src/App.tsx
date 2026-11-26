import { lazy, Suspense, useEffect } from 'react'
import { useUI, go } from './core/ui'
import { useSave, applyVolume } from './core/store'
import { music, unlockAudio, type Mood } from './core/audio'
import { hush } from './core/voice'
import { HUD, RewardPop } from './ui/HUD'

type Mod = Record<string, React.ComponentType>
const L = (f: () => Promise<Mod>, n: string) => lazy(() => f().then(m => ({ default: m[n] })))
export const SCENES: Record<string, { C: React.ComponentType; m: Mood }> = {
  title: { C: L(() => import('./scenes/Home'), 'Title'), m: 'menu' },
  hub: { C: L(() => import('./scenes/Home'), 'Hub'), m: 'menu' },
  adventure: { C: L(() => import('./scenes/Adventure'), 'Adventure'), m: 'happy' },
  kitchen: { C: L(() => import('./scenes/Kitchen'), 'Kitchen'), m: 'happy' },
  pets: { C: L(() => import('./scenes/Pets'), 'Pets'), m: 'calm' },
  market: { C: L(() => import('./scenes/Market'), 'Market'), m: 'happy' },
  prank: { C: L(() => import('./scenes/Prank'), 'Prank'), m: 'party' },
  puzzles: { C: L(() => import('./scenes/Puzzles'), 'Puzzles'), m: 'calm' },
  salon: { C: L(() => import('./scenes/Salon'), 'Salon'), m: 'menu' },
  car: { C: L(() => import('./scenes/CarCity'), 'CarCity'), m: 'happy' },
  garden: { C: L(() => import('./scenes/Garden'), 'Garden'), m: 'calm' },
  music: { C: L(() => import('./scenes/Music'), 'Music'), m: 'none' },
  birthday: { C: L(() => import('./scenes/Birthday'), 'Birthday'), m: 'party' },
  draw: { C: L(() => import('./scenes/Draw'), 'Draw'), m: 'calm' },
  space: { C: L(() => import('./scenes/Space'), 'Space'), m: 'space' },
  sea: { C: L(() => import('./scenes/Sea'), 'Sea'), m: 'sea' },
  room: { C: L(() => import('./scenes/Room'), 'MyRoom'), m: 'calm' },
  card: { C: L(() => import('./scenes/Card'), 'Card'), m: 'menu' },
  parents: { C: L(() => import('./ui/Parents'), 'Parents'), m: 'none' },
  rest: { C: L(() => import('./ui/Parents'), 'Rest'), m: 'calm' },
}

const day = () => new Date().toDateString()
function useSession() {
  useEffect(() => {
    const id = setInterval(() => {
      if (document.hidden) return
      const s = useSave.getState(), sc = useUI.getState().scene
      if (s.usedDay !== day()) s.set({ used: 0, usedDay: day() })
      if (['title', 'parents', 'rest'].includes(sc)) return
      const used = useSave.getState().used + 5
      s.set({ used })
      if (s.limitMin && used >= s.limitMin * 60) go('rest')
    }, 5000)
    return () => clearInterval(id)
  }, [])
}

export function App() {
  const scene = useUI(s => s.scene), curtain = useUI(s => s.curtain)
  const { C, m } = SCENES[scene] ?? SCENES.hub
  useSession()
  useEffect(() => { applyVolume(); const f = () => unlockAudio(); window.addEventListener('pointerdown', f); window.addEventListener('keydown', f); return () => { window.removeEventListener('pointerdown', f); window.removeEventListener('keydown', f) } }, [])
  useEffect(() => { hush(); music(m); document.body.style.cursor = '' }, [scene, m])
  useEffect(() => { const f = () => { if (document.hidden) hush() }; document.addEventListener('visibilitychange', f); return () => document.removeEventListener('visibilitychange', f) }, [])
  return <div className="app" onContextMenu={e => e.preventDefault()}>
    <Suspense fallback={<div className="loading"><span>⭐</span></div>}><C key={scene} /></Suspense>
    <HUD />
    <RewardPop />
    <div className={'curtain' + (curtain ? ' on' : '')}><i>⭐</i><i>💖</i><i>🦋</i></div>
  </div>
}
if (import.meta.env.DEV) (window as any).__mane = { go, useUI, useSave }
