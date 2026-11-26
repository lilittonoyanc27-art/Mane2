import { create } from 'zustand'
// Непостоянное состояние интерфейса
interface UI {
  line: string; lineId: string | null; taskId: string | null; curtain: boolean; scene: string; reward: string | null
  setLine: (id: string | null, t: string) => void; setTask: (id: string | null) => void
  go: (s: string) => void
}
let busy = false
export const useUI = create<UI>((set, get) => ({
  line: '', lineId: null, taskId: null, curtain: false, scene: 'title', reward: null,
  setLine: (lineId, line) => set({ lineId, line }),
  setTask: taskId => set({ taskId }),
  go: s => {
    if (busy || get().scene === s) return
    busy = true; set({ curtain: true })
    setTimeout(() => { set({ scene: s, taskId: null, line: '' }); setTimeout(() => { set({ curtain: false }); busy = false }, 450) }, 520)
  },
}))
export const go = (s: string) => useUI.getState().go(s)
