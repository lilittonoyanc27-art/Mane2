// node tools/shot.mjs <outdir> scene[:WxH] ... — снимки сцен для проверки
import puppeteer from 'puppeteer-core'
const [out, ...list] = process.argv.slice(2)
const br = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true, args: ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required', '--mute-audio'] })
for (const it of list) {
  const [sc, wh = '1180x820'] = it.split(':'); const [width, height] = wh.split('x').map(Number)
  const p = await br.newPage(); await p.setViewport({ width, height })
  p.on('console', m => ['error'].includes(m.type()) && console.log(sc, m.type(), m.text().slice(0, 300))); p.on('pageerror', e => console.log(sc, 'PAGEERR', e.message.slice(0, 300)))
  await p.goto('http://127.0.0.1:5199/'); await p.waitForFunction('window.__mane')
  await p.evaluate(s => window.__mane.useUI.setState({ scene: s }), sc); await new Promise(r => setTimeout(r, 4200))
  await p.screenshot({ path: `${out}/${sc}-${wh}.png` }); await p.close()
}
await br.close()
