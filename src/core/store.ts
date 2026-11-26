import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { setVolumes, sfx } from './audio'
import { useUI } from './ui'
import { say, praise } from './voice'
import { COLLECT } from './rewards'

export interface Outfit { dress: number; shoes: number; hair: number; hairColor: number; hat: number; bow: number; jewel: number }
export interface PetState { wear: number; house: number; happy: number }
interface Save {
  stars: number; earned: number; unlocked: string[]; found: string[]; done: Record<string, number>
  outfit: Outfit; pets: Record<string, PetState>; garden: { seed: number; stage: number }[]; basket: Record<string, number>
  aquarium: { k: string; x: number; y: number }[]; room: Record<string, number>; drawings: string[]; carColor: number
  melody: number[]; photo: string | null
  vol: { music: number; sfx: number; voice: number }; muted: boolean; limitMin: number; used: number; usedDay: string
  lowGfx: boolean
  set: (p: Partial<Save>) => void
  reset: () => void
}
const fresh = {
  stars: 0, earned: 0, unlocked: [] as string[], found: [] as string[], done: {} as Record<string, number>,
  outfit: { dress: 0, shoes: 0, hair: 0, hairColor: 0, hat: 0, bow: 1, jewel: 0 },
  pets: {}, garden: Array.from({ length: 6 }, () => ({ seed: -1, stage: 0 })), basket: {}, aquarium: [], room: {}, drawings: [], carColor: 0, melody: [], photo: null,
}
export const useSave = create<Save>()(persist((set) => ({
  ...fresh,
  vol: { music: 0.5, sfx: 0.8, voice: 1 }, muted: false, limitMin: 0, used: 0, usedDay: '', lowGfx: false,
  set: p => set(p),
  reset: () => set({ ...fresh }),
}), { name: 'mane-magic-world', version: 1 }))

export function applyVolume() { const s = useSave.getState(); setVolumes(s.muted ? { ...s.vol, music: 0 } : s.vol) }
useSave.subscribe(applyVolume)

/** Звёздочки + каждые 4 звезды — новый подарок в комнату. Никаких штрафов. */
export function star(n = 1) {
  const s = useSave.getState(), earned = s.earned + n
  sfx('star')
  s.set({ stars: s.stars + n, earned })
  const need = Math.floor(earned / 4), have = s.unlocked.length
  if (have < Math.min(need, COLLECT.length)) {
    const it = COLLECT[have]
    s.set({ unlocked: [...s.unlocked, it.id] })
    setTimeout(() => { useUI.setState({ reward: it.id }); sfx('magic') }, 1500)
  }
}
/** Игра завершена: победа, похвала, звёзды. */
export function win(id: string, n = 2, speak = true) {
  const s = useSave.getState()
  s.set({ done: { ...s.done, [id]: (s.done[id] || 0) + 1 } })
  sfx('win'); if (speak) void say(praise())
  star(n)
}
