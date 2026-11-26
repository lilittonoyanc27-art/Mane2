import { useEffect, useState } from 'react'
import { Stage, Tap, Float, S, B, C, Star3, useOnce } from '../kit/base'
import { Clouds, Meadow, Island, RAINBOW, Rainbow, Butterflies } from '../kit/nature'
import { Person } from '../kit/people'
import { Animal } from '../kit/animals'
import { Item } from '../kit/items'
import { say, task, type Phrase } from '../core/voice'
import { useSave } from '../core/store'
import { Back } from '../ui/HUD'
import { GAMES } from './puzzles/index'

const ICON: Record<string, React.ReactNode> = {
  jigsaw: <>{[['#ff8fc5', -0.2, 0], ['#7fc4ff', 0.2, 0], ['#ffd257', -0.2, 0.4], ['#8fdc9a', 0.2, 0.4]].map(([c, x, y]) => <B key={c as string} a={[0.37, 0.37, 0.2]} p={[x as number, 0.3 + (y as number), 0]} c={c as string} />)}</>,
  pairs: <><Item k="heart" p={[-0.28, 0.1, 0]} s={0.65} /><Item k="heart" p={[0.28, 0.1, 0]} s={0.65} /></>, odd: <><Item k="apple" p={[-0.28, 0.4, 0]} s={0.5} /><Item k="apple" p={[0.28, 0.4, 0]} s={0.5} /><Item k="car" p={[0, 0, 0.1]} s={0.5} /></>, rainbow: <Rainbow p={[0, 0.1, 0]} s={0.22} />, kitten: <Animal k="cat" s={0.65} />,
  baby: <><Animal k="hen" p={[-0.2, 0, 0]} s={0.6} /><Animal k="duck" p={[0.35, 0, 0.2]} s={0.3} baby /></>, color: <><Item k="ball" p={[-0.28, 0.1, 0]} s={0.6} /><Item k="ball" c="#4aa8ff" p={[0.28, 0.1, 0]} s={0.6} /></>, shadow: <><Item k="star" p={[0.12, 0.15, -0.2]} s={0.85} shadow /><Item k="star" s={0.85} p={[-0.08, 0.1, 0]} /></>, diff: <><Item k="flower" p={[-0.25, 0.1, 0]} s={0.7} /><Item k="flower" c="#7fc4ff" p={[0.25, 0.1, 0]} s={0.7} /></>, size: <>{[0.25, 0.4, 0.6].map((s, i) => <Item key={i} k="teddy" p={[-0.45 + i * 0.42, 0.05, 0]} s={s} />)}</>,
  build: <Item k="house" s={0.9} p={[0, 0.1, 0]} />, toy: <><Item k="gift" s={0.8} p={[0, 0.1, 0]} /><Item k="teddy" s={0.35} p={[0, 0.8, 0]} /></>, count: <Item k="butterfly" />, maze: <>{[[0, 0], [0.3, 0], [0.3, 0.3], [0, 0.6], [-0.3, 0.3], [-0.3, 0.6]].map(([x, y], i) => <B key={i} a={[0.28, 0.28, 0.2]} p={[x, 0.2 + y, 0]} c={RAINBOW[i]} />)}</>, seq: <>{['#ff5a6a', '#4aa8ff', '#ffd93b', '#5fcf6a'].map((c, i) => <S key={c} s={0.22} p={[(i % 2 ? 0.24 : -0.24), 0.28 + Math.floor(i / 2) * 0.46, 0]} c={c} />)}</>,
}
const IDS = Object.keys(ICON)
export function Puzzles() {
  const [g, setG] = useState<string | null>(null), [n, setN] = useState(0), done = useSave(s => s.done), outfit = useSave(s => s.outfit)
  useOnce(() => void task('pz_intro'))
  useEffect(() => { if (import.meta.env.DEV) (window as any).__pz = setG }, [])
  if (g) { const G = GAMES[g]; return <><G key={g + n} again={() => setN(n + 1)} /><Back on={() => { setG(null); void task('pz_intro') }} /></> }
  return <Stage cam={{ t: [0, 2.2, 0], dir: [0, 0.12, 1], w: 9, h: 7.6 }} fog={[18, 60]}>
    <Island r={20} /><Meadow n={160} rad={14} /><Clouds /><Rainbow p={[0, 0, -9]} s={2.8} /><Butterflies n={4} c={[0, 5, -3]} rad={4} />
    {IDS.map((id, i) => <Float key={id} p={[-3.4 + (i % 5) * 1.7, 4.75 - Math.floor(i / 5) * 1.85, 0]} a={0.07} rot={0.04}><Tap on={() => { void say(('pz_' + id) as Phrase); setTimeout(() => setG(id), 350) }} hit={0.82} hitP={[0, 0.35, 0]}><group position={[0, 0.35, 0]}><S s={[0.8, 0.8, 0.32]} p={[0, 0, -0.35]} c={['#ffd3ec', '#d6ecff', '#e5d9ff', '#fff0c4', '#d5f5d8'][i % 5]} /></group><group scale={0.9}>{ICON[id]}</group>{done['pz-' + id] > 0 && <Star3 p={[0.6, 0.95, 0.15]} s={0.17} c="#ffd257" o={{ em: 0.4 }} />}</Tap></Float>)}
    <Person p={[-4.9, 0, -0.4]} s={0.85} mood="wave" outfit={outfit} /><Animal k="rabbit" p={[4.9, 0, -0.4]} s={0.8} /><C a={[0.01, 0.01, 0.01]} />
  </Stage>
}
