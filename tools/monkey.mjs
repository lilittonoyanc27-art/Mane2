// Автотест: настоящие клики мышью по всем нажимаемым 3D-объектам и DOM-кнопкам каждой сцены, сбор ошибок
import puppeteer from 'puppeteer-core'
const scenes = process.argv.slice(2).length ? process.argv.slice(2) : 'title hub adventure kitchen pets market prank puzzles salon car garden music birthday draw space sea room card'.split(' ')
const br = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true, args: ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required', '--mute-audio'] })
let bad = 0
for (const sc of scenes) {
  const p = await br.newPage(); await p.setViewport({ width: 1100, height: 760 }); const errs = new Set()
  p.on('console', m => m.type() === 'error' && errs.add(m.text().slice(0, 200))); p.on('pageerror', e => errs.add('EXC ' + e.message.slice(0, 200))); p.on('response', r => r.status() >= 400 && errs.add(r.status() + ' ' + r.url()))
  await p.goto('http://127.0.0.1:5199/'); await p.waitForFunction('window.__mane'); await p.evaluate(s => window.__mane.useUI.setState({ scene: s }), sc); await new Promise(r => setTimeout(r, 2800))
  let clicks = 0, t = Date.now()
  while (Date.now() - t < 45000) {
    const pts = await p.evaluate(sc => {
      if (window.__mane.useUI.getState().reward) { window.__mane.useUI.setState({ reward: null }) }
      const s = window.__mane.useUI.getState().scene; if (s !== sc && !document.querySelector('.curtain.on')) window.__mane.useUI.setState({ scene: sc })
      const out = []; for (const e of window.__taps ?? []) { const g = e.ref.current; if (!g) continue; const v = g.localToWorld(g.position.clone().set(...(e.hitP ?? [0, 0.4, 0]))).project(e.cam); if (Math.abs(v.x) < 0.97 && Math.abs(v.y) < 0.97 && v.z < 1) out.push([(v.x + 1) / 2 * innerWidth, (1 - v.y) / 2 * innerHeight]) }
      for (const b of document.querySelectorAll('.tb,.big,.arrow,.inback,.rside button,.paper')) { const r = b.getBoundingClientRect(); if (r.width && r.x > 0 && r.right < innerWidth && r.top > 0 && r.bottom < innerHeight) out.push([r.x + r.width / 2, r.y + r.height / 2]) }
      return out
    }, sc)
    if (!pts.length) pts.push([550, 400])
    for (let k = 0; k < 4; k++) { const [x, y] = pts[Math.floor(Math.random() * pts.length)]; if (Math.random() < 0.25) { await p.mouse.move(x, y); await p.mouse.down(); await p.mouse.move(200 + Math.random() * 700, 150 + Math.random() * 450, { steps: 8 }); await p.mouse.up() } else await p.mouse.click(x, y); clicks++; await new Promise(r => setTimeout(r, 90)) }
  }
  const st = await p.evaluate(() => ({ stars: window.__mane.useSave.getState().earned, done: Object.keys(window.__mane.useSave.getState().done) }))
  console.log(sc, 'кликов', clicks, 'звёзд', st.stars, st.done.join(','), errs.size ? [...errs] : 'OK'); bad += errs.size; await p.close()
}
await br.close(); process.exit(bad ? 1 : 0)
