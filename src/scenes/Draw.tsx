import { useCallback, useEffect, useRef, useState } from 'react'
import { stamp, thumb, download } from '../ui/paint'
import { say, task } from '../core/voice'
import { sfx, tone } from '../core/audio'
import { star, useSave } from '../core/store'
import { useOnce } from '../kit/base'

const COLS = ['#ff3f7f', '#ff8a2e', '#ffd21f', '#4fc95a', '#2fa8ff', '#8f5aff', '#ff9ecb', '#7a4a2a', '#222222', '#ffffff']
type Tool = 'brush' | 'pencil' | 'glitter' | 'rainbow' | 'fill' | 'eraser' | string
const TOOLS: [Tool, string][] = [['brush', '🖌️'], ['pencil', '✏️'], ['glitter', '✨'], ['rainbow', '🌈'], ['fill', '🪣'], ['eraser', '🧽']]
const STAMPS = ['❤️', '⭐', '🌸', '🦋', '🌈', '🐱', '🦄', '🎈', '👑', '🍓', '🐠', '🌞']
const W = 1200, H = 800
// контуры для раскрасок
type G2 = CanvasRenderingContext2D
const el = (g: G2, x: number, y: number, rx: number, ry = rx, rot = 0) => { g.beginPath(); g.ellipse(x, y, rx, ry, rot, 0, 7); g.fill(); g.stroke() }
const pl = (g: G2, ...p: number[]) => { g.beginPath(); g.moveTo(p[0], p[1]); for (let i = 2; i < p.length; i += 2) g.lineTo(p[i], p[i + 1]); g.closePath(); g.fill(); g.stroke() }
const face = (g: G2, x: number, y: number, s: number) => { g.fillStyle = '#3a2a3a'; for (const k of [-1, 1]) { g.beginPath(); g.arc(x + k * 45 * s, y, 13 * s, 0, 7); g.fill() } g.beginPath(); g.arc(x, y + 25 * s, 28 * s, 0.3, 2.84); g.stroke(); g.fillStyle = '#fff' }
const PAGES: [string, ((g: G2) => void) | null][] = [
  ['📄', null],
  ['🐱', g => { pl(g, 450, 230, 470, 70, 580, 160); pl(g, 750, 230, 730, 70, 620, 160); el(g, 600, 570, 170, 170); el(g, 600, 290, 190, 170); face(g, 600, 270, 1.5); el(g, 600, 580, 90, 100); el(g, 510, 720, 60, 36); el(g, 690, 720, 60, 36); g.beginPath(); g.moveTo(765, 620); g.bezierCurveTo(930, 640, 930, 440, 850, 430); g.stroke(); for (const k of [-1, 1]) for (const j of [0, 1]) { g.beginPath(); g.moveTo(600 + k * 110, 320 + j * 24); g.lineTo(600 + k * 240, 300 + j * 50); g.stroke() } }],
  ['🦋', g => { el(g, 440, 290, 180, 150, 0.4); el(g, 760, 290, 180, 150, -0.4); el(g, 470, 540, 130, 120, -0.4); el(g, 730, 540, 130, 120, 0.4); el(g, 440, 290, 80, 66, 0.4); el(g, 760, 290, 80, 66, -0.4); el(g, 470, 540, 50); el(g, 730, 540, 50); el(g, 600, 440, 46, 210); el(g, 600, 210, 66); face(g, 600, 205, 0.6); for (const k of [-1, 1]) { g.beginPath(); g.moveTo(600 + k * 20, 150); g.quadraticCurveTo(600 + k * 40, 80, 600 + k * 90, 70); g.stroke(); el(g, 600 + k * 96, 68, 15) } }],
  ['🏰', g => { g.beginPath(); g.rect(360, 330, 480, 350); g.fill(); g.stroke(); for (const x of [270, 780]) { g.beginPath(); g.rect(x, 270, 150, 410); g.fill(); g.stroke(); pl(g, x - 30, 270, x + 75, 90, x + 180, 270); el(g, x + 75, 380, 32, 46) } g.beginPath(); g.rect(510, 220, 180, 130); g.fill(); g.stroke(); pl(g, 480, 220, 600, 40, 720, 220); g.beginPath(); g.moveTo(530, 680); g.lineTo(530, 560); g.arc(600, 560, 70, Math.PI, 0); g.lineTo(670, 680); g.closePath(); g.fill(); g.stroke(); el(g, 450, 460, 34, 48); el(g, 750, 460, 34, 48); g.beginPath(); g.moveTo(40, 682); g.lineTo(1160, 682); g.stroke(); el(g, 1040, 140, 80) }],
  ['🐠', g => { pl(g, 800, 400, 1000, 240, 1000, 560); pl(g, 500, 240, 640, 110, 700, 270); el(g, 580, 400, 270, 190); g.beginPath(); g.ellipse(560, 400, 60, 186, 0, -1.4, 1.4); g.stroke(); g.beginPath(); g.ellipse(690, 400, 50, 160, 0, -1.3, 1.3); g.stroke(); el(g, 430, 350, 40); g.fillStyle = '#3a2a3a'; g.beginPath(); g.arc(424, 350, 18, 0, 7); g.fill(); g.fillStyle = '#fff'; g.beginPath(); g.arc(400, 430, 50, 0.2, 1.6); g.stroke(); el(g, 200, 250, 34); el(g, 250, 150, 22); el(g, 180, 400, 24) }],
  ['🌸', g => { g.beginPath(); g.rect(588, 420, 24, 340); g.fill(); g.stroke(); el(g, 690, 620, 100, 44, -0.5); el(g, 510, 660, 100, 44, 0.5); for (let i = 0; i < 6; i++) el(g, 600 + Math.cos(i * 1.047) * 150, 290 + Math.sin(i * 1.047) * 150, 98); el(g, 600, 290, 90); face(g, 600, 280, 0.85) }],
  ['👸', g => { pl(g, 600, 380, 330, 760, 870, 760); el(g, 600, 440, 90, 80); el(g, 600, 240, 190, 200); el(g, 600, 260, 140); face(g, 600, 250, 1.1); pl(g, 470, 130, 450, 20, 540, 80, 600, 10, 660, 80, 750, 20, 730, 130); el(g, 440, 500, 100, 32, 0.6); el(g, 760, 500, 100, 32, -0.6); for (let i = 0; i < 5; i++) el(g, 400 + i * 100, 710, 26) }],
]
export function Draw() {
  const cv = useRef<HTMLCanvasElement>(null!), ol = useRef<HTMLCanvasElement>(null!), wrap = useRef<HTMLDivElement>(null!), [tool, setTool] = useState<Tool>('brush'), [col, setCol] = useState(COLS[0]), [size, setSize] = useState(1), [page, setPage] = useState(0), [gal, setGal] = useState(false), drawings = useSave(s => s.drawings), set = useSave(s => s.set), last = useRef<Record<number, { x: number; y: number }>>({}), hue = useRef(0), snd = useRef(0), undo = useRef<ImageData[]>([]), [box, setBox] = useState({ w: 600, h: 400, l: 0, t: 0 })
  useOnce(() => void task('dr_intro'))
  useEffect(() => { const f = () => { const small = window.innerWidth < 560 || window.innerHeight < 460, side = small ? 78 : 104, top = small && window.innerHeight < 460 ? 66 : 98, bot = 122, aw = window.innerWidth - side * 2, ah = window.innerHeight - top - bot, s = Math.min(aw / W, ah / H), narrow = aw / ah < 0.8; const w = narrow ? aw : W * s, h = narrow ? Math.min(ah, aw * 1.15) : H * s; setBox({ w, h, l: side + (aw - w) / 2, t: top + (ah - h) / 2 }) }; f(); window.addEventListener('resize', f); return () => window.removeEventListener('resize', f) }, [])
  const clear = useCallback((p: number) => { const g = cv.current.getContext('2d', { willReadFrequently: true })!; g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1; g.fillStyle = '#fff'; g.fillRect(0, 0, W, H); undo.current = []; const o = ol.current.getContext('2d')!; o.clearRect(0, 0, W, H); const f = PAGES[p][1]; if (f) { o.lineWidth = 9; o.strokeStyle = '#4a3050'; o.lineJoin = o.lineCap = 'round'; o.fillStyle = '#fff'; f(o); /* белая заливка становится прозрачной: остаются только линии */ const d = o.getImageData(0, 0, W, H), a = d.data; for (let i = 0; i < a.length; i += 4) { const l = Math.min(a[i], a[i + 1], a[i + 2]); if (a[i + 3]) { const dark = 1 - (l - 48) / 207; a[i] = 74; a[i + 1] = 48; a[i + 2] = 80; a[i + 3] = a[i + 3] * Math.max(0, Math.min(1, dark)) } } o.putImageData(d, 0, 0) } }, [])
  useEffect(() => clear(page), [page, clear])
  const pt = (e: React.PointerEvent) => { const r = wrap.current.getBoundingClientRect(); return { x: (e.clientX - r.left) / r.width * W, y: (e.clientY - r.top) / r.height * H } }
  const fill = (x0: number, y0: number) => {
    const g = cv.current.getContext('2d', { willReadFrequently: true })!, im = g.getImageData(0, 0, W, H), a = im.data, o = ol.current.getContext('2d')!.getImageData(0, 0, W, H).data, sx = Math.floor(x0), sy = Math.floor(y0); if (sx < 0 || sy < 0 || sx >= W || sy >= H) return
    const si = (sy * W + sx) * 4, t = [a[si], a[si + 1], a[si + 2]], c = [1, 3, 5].map(i => parseInt(col.slice(i, i + 2), 16)), seen = new Uint8Array(W * H), st = [sy * W + sx]
    const ok = (i: number) => !seen[i] && o[i * 4 + 3] < 130 && Math.abs(a[i * 4] - t[0]) + Math.abs(a[i * 4 + 1] - t[1]) + Math.abs(a[i * 4 + 2] - t[2]) < 90
    while (st.length) { let i = st.pop()!; const y = Math.floor(i / W); while (i >= y * W && ok(i)) i--; i++; let up = false, dn = false; while (i < (y + 1) * W && ok(i)) { seen[i] = 1; a[i * 4] = c[0]; a[i * 4 + 1] = c[1]; a[i * 4 + 2] = c[2]; const u = i - W, d = i + W; if (u >= 0 && ok(u)) { if (!up) { st.push(u); up = true } } else up = false; if (d < W * H && ok(d)) { if (!dn) { st.push(d); dn = true } } else dn = false; i++ } }
    // подкрашиваем край под контуром
    for (let i = 0; i < W * H; i++) if (seen[i]) for (const n of [i - 1, i + 1, i - W, i + W, i - 2, i + 2, i - 2 * W, i + 2 * W, i - 4, i + 4, i - 4 * W, i + 4 * W]) if (n >= 0 && n < W * H && !seen[n] && o[n * 4 + 3] > 60) { a[n * 4] = c[0]; a[n * 4 + 1] = c[1]; a[n * 4 + 2] = c[2] }
    g.putImageData(im, 0, 0); sfx('splash')
  }
  const ink = (p: { x: number; y: number }, q: { x: number; y: number }) => {
    const g = cv.current.getContext('2d')!; g.globalAlpha = 1; g.lineCap = g.lineJoin = 'round'
    const line = (c: string, w: number) => { g.strokeStyle = c; g.lineWidth = w; g.beginPath(); g.moveTo(q.x, q.y); g.lineTo(p.x, p.y); g.stroke() }
    if (tool === 'brush') line(col, [14, 30, 56][size]); else if (tool === 'pencil') { g.globalAlpha = 0.85; line(col, [4, 9, 16][size]) } else if (tool === 'eraser') line('#ffffff', [30, 60, 100][size]); else if (tool === 'rainbow') line(`hsl(${hue.current += 5},95%,62%)`, [18, 36, 64][size])
    else if (tool === 'glitter') { line(col + '55', [16, 34, 60][size]); for (let i = 0; i < 9; i++) { const r = [18, 36, 60][size], x = p.x + (Math.random() - 0.5) * r * 2, y = p.y + (Math.random() - 0.5) * r * 2; g.fillStyle = ['#ffe27a', '#ffffff', '#ff9ecb', '#9fe3ff', col][i % 5]; const s = 2 + Math.random() * 7; g.beginPath(); for (let k = 0; k < 8; k++) { const a = k * 0.785, q2 = k % 2 ? s * 0.35 : s; g.lineTo(x + Math.cos(a) * q2, y + Math.sin(a) * q2) } g.fill() } }
    const now = performance.now(); if (now - snd.current > 130) { snd.current = now; tone(420 + (1 - p.y / H) * 700, 0.1, 'sine', 0.07) }
  }
  const down = (e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId); const p = pt(e), g = cv.current.getContext('2d', { willReadFrequently: true })!
    if (!Object.keys(last.current).length) { undo.current.push(g.getImageData(0, 0, W, H)); if (undo.current.length > 6) undo.current.shift() }
    if (tool === 'fill') { fill(p.x, p.y); return }
    if (STAMPS.includes(tool)) { stamp(g, tool, p.x, p.y, [80, 130, 200][size], (Math.random() - 0.5) * 0.5); sfx('pop'); return }
    last.current[e.pointerId] = p; ink(p, { x: p.x - 0.1, y: p.y })
  }
  const mv = (e: React.PointerEvent) => { const q = last.current[e.pointerId]; if (!q) return; const p = pt(e); ink(p, q); last.current[e.pointerId] = p }
  const up = (e: React.PointerEvent) => { delete last.current[e.pointerId] }
  const merged = () => { const c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d')!; g.drawImage(cv.current, 0, 0); g.drawImage(ol.current, 0, 0); return c }
  const save = (dl: boolean) => { const c = merged(); set({ drawings: [thumb(c), ...drawings].slice(0, 12) }); if (dl) void download(c, 'Mane-nkar.png'); void say('card_saved', 'beautiful'); star(1) }
  const back = () => { const d = undo.current.pop(); if (d) { cv.current.getContext('2d')!.putImageData(d, 0, 0); sfx('whoosh') } }
  const b = (id: string, icon: React.ReactNode, f: () => void, on = false) => <button key={id} aria-label={id} className={'tb' + (on ? ' on' : '')} onClick={() => { sfx('tap'); f() }}>{icon}</button>
  return <div className="flat">
    <div className="paper" ref={wrap} style={{ left: box.l, top: box.t, width: box.w, height: box.h }} onPointerDown={down} onPointerMove={mv} onPointerUp={up} onPointerCancel={up}><canvas ref={cv} width={W} height={H} /><canvas ref={ol} width={W} height={H} style={{ pointerEvents: 'none' }} /></div>
    <div className="lside">{TOOLS.map(([t, i]) => b(t, i, () => setTool(t), tool === t))}{[0, 1, 2].map(s => b('size' + s, <i style={{ display: 'block', width: 14 + s * 15, height: 14 + s * 15, borderRadius: '50%', background: '#b04a96' }} />, () => setSize(s), size === s))}{b('undo', '↩️', back)}{b('clear', '🗑️', () => clear(page))}</div>
    <div className="lside right">{PAGES.map(([i], k) => b('page' + k, i, () => setPage(k), page === k))}{b('save', '💾', () => save(true))}{b('gallery', '🖼️', () => setGal(true))}</div>
    <div className="tray small"><div className="trayin">{COLS.map(c => b(c, <i className="sw" style={{ background: c }} />, () => { setCol(c); if (STAMPS.includes(tool) || tool === 'eraser' || tool === 'rainbow') setTool('brush') }, col === c))}{STAMPS.map(s => b(s, s, () => setTool(s), tool === s))}</div></div>
    {gal && <div className="gal" onClick={() => setGal(false)}>{drawings.length ? drawings.map((d, i) => <img key={i} src={d} alt="" />) : <p style={{ color: '#fff', fontSize: 70, textAlign: 'center', gridColumn: '1/-1' }}>🎨</p>}</div>}
  </div>
}
