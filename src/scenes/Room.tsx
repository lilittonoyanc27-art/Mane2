import { useState } from 'react'
import { useTexture2 } from '../ui/useTex'
import { Stage, Tap, S, B, C, T, K, Star3, Emoji, Float, burst, useLater, useOnce, Heart3, type V3 } from '../kit/base'
import { Room as R, Window3, Rug, RAINBOW, Flower, Rainbow } from '../kit/nature'
import { Person, Crown, DRESS, type Mood } from '../kit/people'
import { Animal } from '../kit/animals'
import { Item } from '../kit/items'
import { COLLECT } from '../core/rewards'
import { say, task } from '../core/voice'
import { sfx } from '../core/audio'
import { useSave } from '../core/store'
import { Tray } from '../ui/HUD'

const WALLS = ['#ffe3f0', '#e6dcff', '#dcf0ff', '#fff0d6', '#e0f5e0'], RUGS = [['#ffd3ec', '#fff', '#c8b5ff'], ['#d6efff', '#fff', '#8fd3ff'], ['#fff0c4', '#fff', '#ffb9d0'], RAINBOW.slice(0, 5)], BEDS = ['#b79bff', '#ff9ecb', '#7fc4ff', '#8fdc9a']
const Toy = ({ i }: { i: number }) => [<Item key={0} k="teddy" />, <Item key={1} k="ball" c="#6fc8ff" />, <Item key={2} k="car" c="#ff8a7a" />, <Animal key={3} k="pig" s={0.75} c="#a9bfe8" />, <Item key={4} k="duckling" />, <Item key={5} k="rocket" />][i]
function Picture({ src, p }: { src: string; p: V3 }) { const t = useTexture2(src); return <group position={p}><B a={[1.5, 1.1, 0.1]} c="#ffd98a" />{t && <mesh position={[0, 0, 0.07]}><planeGeometry args={[1.35, 0.95]} /><meshBasicMaterial map={t} toneMapped={false} /></mesh>}</group> }
export function MyRoom() {
  const { unlocked, stars, room, set, outfit, drawings } = useSave(), later = useLater(), [mood, setMood] = useState<Mood>('idle'), [bed, setBed] = useState(false)
  useOnce(() => void task(...(unlocked.length ? ['rm_intro'] as const : ['rm_intro', 'rm_empty'] as const)))
  const has = (id: string) => unlocked.includes(id), of = (k: string) => COLLECT.filter(c => c.kind === k)
  const cyc = (k: string, n: number) => { set({ room: { ...room, [k]: ((room[k] || 0) + 1) % n } }); sfx('magic'); burst([0, 2, 1], 'star', 24); setMood('happy'); later(() => setMood('idle'), 1400) }
  const wear = (i: number) => { set({ outfit: { ...outfit, dress: 6 + i } }); sfx('magic'); setMood('spin'); burst([0, 1.6, 1.6], 'star', 24); later(() => setMood('idle'), 1500) }
  const w = room.wall || 0
  return <>
    <Stage cam={{ t: [0, 2.5, 0], dir: [0, 0.18, 1], w: 12.4, h: 6.2, tray: true }} sky={['#ffd9ec', '#fff3e0']} shadow={8}>
      <R wall={WALLS[w]} floor="#f5d6b8" w={14} d={7.5} h={7} /><Window3 p={[0, 4.4, -3.5]} /><Rug p={[0, 0.02, 1]} r={2.3} c={RUGS[room.rug || 0]} />
      {/* кровать */}
      <Tap p={[4.4, 0, -1.4]} on={() => { setBed(!bed); sfx(bed ? 'squeak' : 'snore') }} hit={1}><B a={[2.6, 0.6, 3.4]} p={[0, 0.45, 0]} c="#fff" rad={0.15} /><B a={[2.5, 0.35, 2.4]} p={[0, 0.82, 0.45]} c={BEDS[room.bed || 0]} rad={0.15} /><B a={[2.8, 2, 0.25]} p={[0, 1, -1.65]} c={BEDS[room.bed || 0]} rad={0.2} /><Item k="pillow" c="#fff" p={[0, 0.65, -1]} s={1.2} /><Heart3 p={[0, 1.5, -1.48]} s={0.35} c="#fff" /></Tap>
      {/* полка корон */}
      <B a={[4.2, 0.14, 0.8]} p={[-4.1, 3.5, -3]} c="#fff" />{of('crown').map((c, i) => <Tap key={c.id} p={[-5.7 + i * 0.8, 3.65, -2.9]} s={1.05} on={has(c.id) ? () => { set({ outfit: { ...outfit, hat: 1 } }); sfx('magic'); setMood('happy'); later(() => setMood('idle'), 1500) } : undefined}>{has(c.id) ? <Crown c={c.color} p={[0, 0.1, 0]} /> : <S p={[0, 0.14, 0]} s={[0.26, 0.14, 0.26]} c="#e9e0f0" />}</Tap>)}
      {/* полки игрушек */}
      <B a={[4.2, 0.14, 0.9]} p={[-4.1, 2.1, -2.95]} c="#ffd3ec" /><B a={[4.2, 0.14, 0.9]} p={[-4.1, 0.75, -2.95]} c="#ffd3ec" />{of('toy').map((c, i) => <Tap key={c.id} p={[-5.4 + (i % 3) * 1.3, i < 3 ? 2.18 : 0.83, -2.8]} hit={0.6} hitP={[0, 0.5, 0]} on={has(c.id) ? () => { sfx('squeak'); sfx('boing') } : undefined}>{has(c.id) ? <Toy i={i} /> : <group scale={0.8}><Item k="gift" shadow /></group>}</Tap>)}
      {/* вешалка с платьями */}
      <C a={[0.06, 0.06, 2.6]} p={[-2.1 + 3.2, 3, -2.8]} r={[0, 0, Math.PI / 2]} c="#ffd98a" />{[-0.2, 2.4].map(x => <C key={x} a={[0.06, 0.08, 3]} p={[x, 1.5, -2.8]} c="#ffd98a" />)}{of('dress').map((c, i) => <Tap key={c.id} p={[0.15 + i * 0.48, 2.2, -2.7]} on={has(c.id) ? () => wear(i) : undefined}><K a={[0.28, 0.9]} p={[0, 0.1, 0]} c={has(c.id) ? DRESS[6 + i].c : '#eee6f2'} /><S p={[0, 0.5, 0]} s={[0.17, 0.16, 0.14]} c={has(c.id) ? DRESS[6 + i].c : '#eee6f2'} />{has(c.id) && <Star3 p={[0, 0, 0.26]} s={0.09} c="#fff3b0" o={{ em: 0.6 }} />}</Tap>)}
      {/* наклейки на стене */}
      {of('sticker').map((c, i) => has(c.id) && <Float key={c.id} p={[-2 + (i % 3) * 0.1 + (i < 3 ? -0 : 0) + (i % 2) * 0.1 + [0, 1, 4, 5, -0.2, 4.6][i], [5.9, 6.2, 6, 5.6, 4.9, 4.7][i], -3.2]} a={0.04}><Emoji e={c.icon} s={0.75} /></Float>)}
      {/* украшения */}
      {has('dc1') && <Rainbow p={[4.4, 3.2, -3.2]} s={0.6} />}{has('dc2') && <Tap p={[6, 0, -2.6]} on={() => sfx('ding')}><C a={[0.08, 0.2, 2]} p={[0, 1, 0]} c="#ffd98a" /><K a={[0.5, 0.6]} p={[0, 2.2, 0]} c="#fff0b8" o={{ em: 0.8 }} /></Tap>}{has('dc3') && [0, 1, 2].map(i => <Float key={i} p={[-6.2 + i * 0.5, 4.4 + (i % 2) * 0.5, -1]}><Item k="balloon" c={['#ff8fc5', '#7fc4ff', '#ffd257'][i]} /></Float>)}{has('dc4') && <group position={[2.9, 0, -2.4]}><C a={[0.35, 0.28, 0.5]} p={[0, 0.25, 0]} c="#ffb07a" />{[-0.15, 0.15].map(x => <Flower key={x} p={[x, 0.4, 0]} s={1.4} c={x > 0 ? '#ff8fc5' : '#b79bff'} />)}</group>}
      {has('dc5') && [0, 1, 2, 3, 4].map(i => <Float key={i} p={[-4 + i * 2, 6.3, -2]}><Star3 s={0.22} c="#ffd257" o={{ em: 0.9 }} /></Float>)}{has('dc6') && <Float p={[4.4, 5.4, -2.6]}><Item k="moon" s={1.1} /></Float>}
      {drawings.slice(0, 2).map((d, i) => <Picture key={d.length + '' + i} src={d} p={[i ? 6 : 4.2, 2.75 + i * 0.2, -3.25]} />)}
      {/* банка со звёздочками */}
      <Tap p={[-5.6, 0, 1]} on={() => { sfx('star'); burst([-5.6, 1.4, 1.3], 'star', 30) }} hit={0.8} hitP={[0, 0.6, 0]}><C a={[0.7, 0.7, 1.3]} p={[0, 0.65, 0]} c="#e6f6ff" o={{ op: 0.4, rough: 0.05 }} /><C a={[0.5, 0.5, 0.18]} p={[0, 1.38, 0]} c="#ff9ecb" />{Array.from({ length: Math.min(16, Math.ceil(stars / 2)) }, (_, i) => <Star3 key={i} p={[Math.cos(i * 2.4) * 0.36, 0.18 + Math.floor(i / 4) * 0.26, Math.sin(i * 2.4) * 0.36]} r={[i, i, 0]} s={0.14} c="#ffd257" o={{ em: 0.3 }} />)}</Tap>
      {bed ? <group position={[4.4, 0.95, -1.9]} rotation={[-Math.PI / 2, 0, 0]}><Person s={1} mood="sleep" outfit={{ ...outfit, hat: 0 }} /></group> : <Tap p={[0, 0, 1.2]} on={() => { setMood('dance'); sfx('giggle'); later(() => setMood('idle'), 2400) }} fx="heart" hit={1.1} hitP={[0, 1, 0]}><Person s={1.35} mood={mood} outfit={outfit} /></Tap>}
      <Tap p={[2.2, 0, 1.6]} on={() => sfx('squeak')} fx="heart"><Animal k="cat" s={0.75} /></Tap><T a={[0.01, 0.005]} />
    </Stage>
    <Tray items={[{ id: 'wall', icon: '🎨' }, { id: 'rug', icon: '🌈' }, { id: 'bed', icon: '🛏️' }]} on={k => cyc(k, k === 'wall' ? 5 : 4)} />
  </>
}
void say
