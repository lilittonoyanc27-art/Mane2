import { useRef, type ReactNode } from 'react'
import { Stage, shower, useLater, useOnce, type Cam } from '../../kit/base'
import { Clouds, Meadow, Island } from '../../kit/nature'
import { say, task, type Phrase } from '../../core/voice'
import { sfx } from '../../core/audio'
import { win } from '../../core/store'

export interface GP { again: () => void }
export const PStage = ({ children, cam, sky }: { children: ReactNode; cam: Cam; sky?: [string, string] }) => <Stage cam={cam} sky={sky ?? ['#a8d8ff', '#ffe6f5']} fog={[20, 60]} shadow={8}><Island r={22} c="#b8eaa8" /><Meadow n={150} rad={14} hole={2} /><Clouds y={7} r={20} />{children}</Stage>
/** Общая логика мини-игры: задание голосом, победа, мягкая ошибка */
export function usePz(id: string, again: () => void) {
  const later = useLater(), over = useRef(false), miss = useRef(0)
  const ph = ('pz_' + id) as Phrase
  useOnce(() => void task(ph))
  return {
    later,
    win: () => { if (over.current) return; over.current = true; later(() => { win('pz-' + id, 2); shower([0, 5, 1.5], 4, 'confetti', 80) }, 350); later(again, 4200) },
    good: () => sfx('star'),
    bad: () => { sfx('soft'); miss.current++; if (miss.current % 2 === 1) { void say('retry') } return miss.current },
    isOver: () => over.current,
  }
}
