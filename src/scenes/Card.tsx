import { useEffect, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Stage, Glide, Tap, B, K, Heart3, Float, burst, shower, useLater, useOnce } from '../kit/base'
import { Meadow, Island, Clouds, Flower, Tree, House, Butterflies, Rainbow } from '../kit/nature'
import { Person, Uncle } from '../kit/people'
import { stamp, download, thumb } from '../ui/paint'
import { say, task } from '../core/voice'
import { sfx } from '../core/audio'
import { win, useSave } from '../core/store'
import { Tray } from '../ui/HUD'

const STK = ['❤️', '💖', '🌸', '🌷', '🌻', '🎈', '🎁', '⭐', '🦋', '🌈', '🐱', '🐰', '🎂', '🍓', '👑', '😘']
const BG: [string, string][] = [['#ffd3ec', '#ffe9c4'], ['#cfe9ff', '#e6d9ff'], ['#d9f5d0', '#fff6c4'], ['#ffe0c4', '#ffc2d6'], ['#e3d3ff', '#ffd3f0']]
interface St { e: string; x: number; y: number; s: number }
const W = 900, H = 640
export function Card() {
  const { photo, outfit, set } = useSave(), later = useLater(), [sent, setSent] = useState(0), cv = useRef<HTMLCanvasElement>(null!), [list, setList] = useState<St[]>([{ e: '❤️', x: 130, y: 130, s: 110 }]), [bg, setBg] = useState(0), drag = useRef(-1), img = useRef<HTMLImageElement | null>(null), [ready, setReady] = useState(0)
  useOnce(() => void task('card_intro'))
  useEffect(() => { if (photo) { const i = new Image(); i.onload = () => { img.current = i; setReady(r => r + 1) }; i.src = photo } }, [photo])
  useEffect(() => {
    const c = cv.current; if (!c) return; const g = c.getContext('2d')!, gr = g.createLinearGradient(0, 0, W, H); gr.addColorStop(0, BG[bg][0]); gr.addColorStop(1, BG[bg][1]); g.fillStyle = gr; g.fillRect(0, 0, W, H)
    g.strokeStyle = '#ffffff'; g.lineWidth = 16; g.beginPath(); g.roundRect(26, 26, W - 52, H - 52, 44); g.stroke(); g.setLineDash([4, 22]); g.lineCap = 'round'; g.strokeStyle = '#ff8fc5'; g.lineWidth = 9; g.beginPath(); g.roundRect(44, 44, W - 88, H - 88, 34); g.stroke(); g.setLineDash([])
    g.fillStyle = '#ffffffaa'; g.beginPath(); g.arc(W / 2, 270, 130, 0, 7); g.fill()
    if (img.current) { g.save(); g.beginPath(); g.arc(W / 2, 270, 116, 0, 7); g.clip(); g.drawImage(img.current, W / 2 - 116, 154, 232, 232); g.restore() } else stamp(g, '🎁', W / 2, 270, 150)
    g.fillStyle = '#c0408f'; g.textAlign = 'center'; g.font = '900 50px "Noto Sans Armenian",sans-serif'; g.fillText('Հարություն', W / 2, 470); g.font = '700 34px "Noto Sans Armenian",sans-serif'; g.fillText('Ես քեզ շատ եմ սիրում', W / 2, 526); g.fillText('Մանե', W / 2, 576)
    list.forEach(s => stamp(g, s.e, s.x, s.y, s.s))
  }, [list, bg, sent, ready])
  const pt = (e: React.PointerEvent) => { const r = cv.current.getBoundingClientRect(); return { x: (e.clientX - r.left) / r.width * W, y: (e.clientY - r.top) / r.height * H } }
  const send = () => { sfx('whoosh'); if (cv.current) set({ drawings: [thumb(cv.current), ...useSave.getState().drawings].slice(0, 12) }); setSent(1); void say('card_send'); later(() => { setSent(2); sfx('magic'); burst([1.8, 1.8, 1], 'heart', 40); shower([0, 5, 1], 4, 'heart', 70); win('card', 2, false) }, 5600); later(() => void say('card_thanks'), 6400) }
  const act = (id: string) => { if (id === 'bg') setBg((bg + 1) % BG.length); else if (id === 'undo') setList(list.slice(0, -1)); else if (id === 'save') { void download(cv.current, 'Harutyun-bacik.png'); void say('card_saved') } else if (id === 'send') send(); else { setList([...list, { e: id, x: 120 + Math.random() * (W - 240), y: 110 + Math.random() * (H - 220), s: 80 + Math.random() * 50 }]); sfx('pop') } }
  return <>
    <Stage cam={{ t: [0, 1.6, 0], dir: [0, 0.16, 1], w: sent ? 7.4 : 11, h: 5 }} fog={[20, 60]}>
      <Island r={20} /><Meadow n={150} rad={12} /><Clouds /><Rainbow p={[0, 0, -7]} s={2} /><House p={[4, 0, -3]} s={1.5} /><Tree p={[-5, 0, -3]} s={1.4} c="#ffb9dc" /><Butterflies n={5} rad={4} />{[-3.4, -2.6, 3, 3.8].map((x, i) => <Flower key={x} p={[x, 0, 1.5]} s={1.4} c={['#ff8fc5', '#ffd257', '#b79bff', '#ff7a8a'][i]} />)}
      <Person p={[sent ? -1.7 : -4.4, 0, 0.6]} r={[0, 0.5, 0]} s={1.25} mood={sent === 2 ? 'happy' : 'wave'} outfit={outfit} />
      <Tap p={[sent ? 1.9 : 4.4, 0, 0.6]} r={[0, -0.5, 0]} on={() => void say('card_thanks')} fx="heart"><Uncle s={1.3} mood={sent === 2 ? 'happy' : 'wave'} /></Tap>
      {sent === 1 && <Letter />}{sent === 2 && <Float p={[1.9, 3.4, 0.8]}><Heart3 s={0.45} c="#ff5a8f" o={{ em: 0.4 }} /></Float>}
      <Glide p={[0, 9, 0]}><B a={[0.01, 0.01, 0.01]} /></Glide>
    </Stage>
    {sent === 0 && <><div className="paper" style={{ left: '50%', top: 'calc(50% - 14px)', translate: '-50% -50%', width: 'min(calc(100vw - 48px), calc((100dvh - 300px) * 1.406), 860px)', aspectRatio: `${W}/${H}` }}>
      <canvas ref={cv} width={W} height={H} onPointerDown={e => { e.currentTarget.setPointerCapture(e.pointerId); const p = pt(e); for (let i = list.length - 1; i >= 0; i--) if (Math.hypot(list[i].x - p.x, list[i].y - p.y) < list[i].s * 0.65) { drag.current = i; sfx('tap'); return } }} onPointerMove={e => { const i = drag.current; if (i < 0) return; const p = pt(e); setList(l => l.map((s, j) => j === i ? { ...s, ...p } : s)) }} onPointerUp={() => { drag.current = -1 }} /></div>
      <Tray items={[{ id: 'send', icon: '💌', color: '#ff9ecb' }, { id: 'save', icon: '💾', color: '#8fe3b0' }, { id: 'bg', icon: '🎨', color: '#ffd257' }, { id: 'undo', icon: '↩️' }, ...STK.map(e => ({ id: e, icon: e }))]} on={act} /></>}
    {sent === 2 && <div className="acts"><button className="big" aria-label="Նորից" onClick={() => { setSent(0); setList([]) }}>💌</button></div>}
  </>
}
function Letter() { const g = useRef<THREE.Group>(null!), t = useRef(0); useFrame((_, d) => { t.current = Math.min(1, t.current + d / 5.2); const k = t.current; g.current.position.set(-1.4 + k * 3.2, 1.6 + Math.sin(k * Math.PI) * 2, 1.2); g.current.rotation.set(0, k * 12.56, Math.sin(k * 20) * 0.2) }); return <group ref={g}><B a={[1, 0.66, 0.08]} c="#fff" /><K a={[0.42, 0.4]} seg={3} r={[Math.PI, 0, 0]} s={[1.1, 0.8, 0.12]} p={[0, 0.14, 0.05]} c="#ffd3ec" /><Heart3 s={0.12} p={[0, 0, 0.12]} c="#ff5a8f" /></group> }
