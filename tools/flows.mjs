// Проходимость головоломок: тащим детали мышью в нужные места / кликаем объекты, пока не засчитана победа
import puppeteer from 'puppeteer-core'
import { mkdirSync } from 'fs'
mkdirSync('shots', { recursive: true })
const [vw, vh] = (process.argv[2] || '1100x760').split('x').map(Number)
const games = process.argv.slice(3).length ? process.argv.slice(3) : 'jigsaw rainbow size build baby color shadow pairs odd kitten toy count seq diff maze'.split(' ')
const br = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true, args: ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist', '--mute-audio'] })
for (const g of games) {
  const p = await br.newPage(); await p.setViewport({ width: vw, height: vh }); const errs = []; p.on('pageerror', e => errs.push(e.message))
  await p.goto('http://127.0.0.1:5199/'); await p.waitForFunction('window.__mane'); await p.evaluate(() => window.__mane.useUI.setState({ scene: 'puzzles' })); await p.waitForFunction('window.__pz'); await p.evaluate(g => window.__pz(g), g); await new Promise(r => setTimeout(r, 2500))
  const t = Date.now(); let won = false
  while (!won && Date.now() - t < 100000) {
    const s = await p.evaluate(() => { const px = (v, c) => { v.project(c); return [(v.x + 1) / 2 * innerWidth, (1 - v.y) / 2 * innerHeight] }; const d = [...(window.__drags ?? [])].filter(e => e.goal && e.ref.current).map(e => { const q = e.ref.current.position; return [px(q.clone().add(q.clone().set(0, 0.25, 0)), e.cam), px(q.clone().set(...e.goal), e.cam)] }); const tp = [...(window.__taps ?? [])].filter(e => e.ref.current).map(e => px(e.ref.current.localToWorld(e.ref.current.position.clone().set(...(e.hitP ?? [0, 0.4, 0]))), e.cam)); const b = [...document.querySelectorAll('.tray .tb')].map(x => { const r = x.getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2] }); return { d, tp, b } })
    if (s.d.length) { const [a, z] = s.d[0]; await p.mouse.move(...a); await p.mouse.down(); await p.mouse.move((a[0] + z[0]) / 2, (a[1] + z[1]) / 2, { steps: 5 }); await p.mouse.move(...z, { steps: 5 }); await new Promise(r => setTimeout(r, 80)); await p.mouse.up(); await new Promise(r => setTimeout(r, 500)) }
    else { const all = s.tp.concat(g === 'count' ? s.b : []); if (all.length) await p.mouse.click(...all[Math.floor(Math.random() * all.length)]); await new Promise(r => setTimeout(r, g === 'seq' ? 700 : 160)) }
    won = await p.evaluate(g => !!window.__mane.useSave.getState().done['pz-' + g], g)
  }
  console.log(g, won ? 'ПРОЙДЕНО за ' + Math.round((Date.now() - t) / 1000) + 'с' : 'НЕ ПРОЙДЕНО', errs.join('|')); if (!won) await p.screenshot({ path: 'shots/' + g + '.png' }); await p.close()
}
await br.close()
