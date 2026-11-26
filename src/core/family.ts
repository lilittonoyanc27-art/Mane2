import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { go, useUI } from './ui'
import { useSave } from './store'

export type Hero = 'mane' | 'anulik' | 'harut'
export type Mode = 'mane' | 'anulik' | 'harut' | 'family' | 'duo'
export interface GameReq { id?: string; def?: any; who?: Hero; cfg?: any; level?: string; sub?: string }
interface Fam {
  hero: Hero; mode: Mode; game: GameReq | null; ret: string | null
  adv: { id: string; step: number; duo: boolean; snap?: number; scene?: string } | null
  look: number; tale: number
  set: (p: Partial<Fam>) => void
}
export const useFam = create<Fam>()(persist(set => ({
  hero: 'mane', mode: 'mane', game: null, ret: null, adv: null, look: 0, tale: 0,
  set: p => set(p),
}), { name: 'mane-family-nav', version: 1 }))

export const HUB: Record<Mode, string> = { mane: 'hub', anulik: 'ahub', harut: 'hhub', family: 'fhub', duo: 'duo' }
export const HUBS = ['hub', 'ahub', 'hhub', 'fhub', 'shub', 'duo', 'mnew']
export const hubOf = () => HUB[useFam.getState().mode] ?? 'hub'
/** Сумма всех побед в оригинальных сценах — так приключение узнаёт, что этап пройден */
export const doneTotal = () => Object.values(useSave.getState().done).reduce((a, b) => a + b, 0)

/** Куда ведёт кнопка 🏠 */
export function homeTarget(scene: string) {
  const f = useFam.getState()
  if (scene === 'who') return 'title'
  if (HUBS.includes(scene)) return scene === 'mnew' ? 'hub' : (scene === 'fhub' || scene === 'shub') && f.mode !== 'family' ? hubOf() : 'who'
  if (scene === 'game' || scene === 'tales' || scene === 'phone' || scene === 'city') return f.ret ?? hubOf()
  if (scene === 'story') { const sis = f.adv?.id.startsWith('sis_'); return f.adv?.duo ? 'duo' : sis ? 'shub' : 'fhub' }
  if (f.adv && f.ret === 'story') return 'story'
  return f.ret && f.ret !== scene ? f.ret : hubOf()
}
/** Запустить мини-игру (перенесённый движок) поверх 3D-сцены */
export function playGame(req: GameReq, ret?: string) {
  useFam.getState().set({ game: req, ret: ret ?? useUI.getState().scene })
  go('game')
}
export function openScene(scene: string, ret?: string) { useFam.getState().set({ ret: ret ?? useUI.getState().scene }); go(scene) }
