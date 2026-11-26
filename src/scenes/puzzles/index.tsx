import type { ComponentType } from 'react'
import type { GP } from './common'
import { Jigsaw, Build, RainbowG, SizeG } from './drag'
import { Pairs, Odd, Kitten, Toy, Count, Seq, Diff } from './tap'
import { Baby, ColorG, Shadow } from './match'
import { Maze } from './maze'
export const GAMES: Record<string, ComponentType<GP>> = { jigsaw: Jigsaw, pairs: Pairs, odd: Odd, rainbow: RainbowG, kitten: Kitten, baby: Baby, color: ColorG, shadow: Shadow, diff: Diff, size: SizeG, build: Build, toy: Toy, count: Count, maze: Maze, seq: Seq }
