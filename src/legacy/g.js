// @ts-nocheck
/* Мост между перенесёнными мини-играми и оригинальной игрой:
   звуки — оригинальный синтезатор (core/audio), голос — оригинальный механизм озвучки (core/voice),
   звёзды и подарки — оригинальная система (core/store: star). */
import { sfx as osfx, tone as otone, drum as odrum, xylo, midi } from '../core/audio'
import { sayText, hush } from '../core/voice'
import { star, useSave } from '../core/store'

const SAVE_KEY = 'mane-family-world-v1'
const today = () => new Date().toISOString().slice(0, 10)
const DEFAULT = {
  coins: 120, played: {}, achievements: {}, souvenirs: [], album: [], visited: [], secrets: [], adventures: {}, countries: [], animals: [],
  daily: { date: '', tasks: [], streak: 0, last: '' }, wardrobe: { anulik: 0, unlocked: 2 }, settings: { level: 'auto', autoTime: true },
  clock: 10, weather: 'sun', flags: {}, hero: 'mane',
}
function deepMerge(a, b) { for (const k in b) { if (b[k] && typeof b[k] === 'object' && !Array.isArray(b[k]) && a[k] && typeof a[k] === 'object' && !Array.isArray(a[k])) deepMerge(a[k], b[k]); else a[k] = b[k] } return a }
let S = (() => { try { const r = localStorage.getItem(SAVE_KEY); if (r) return deepMerge(JSON.parse(JSON.stringify(DEFAULT)), JSON.parse(r)) } catch (e) { } return JSON.parse(JSON.stringify(DEFAULT)) })()
// звёзды общие с оригинальной игрой
Object.defineProperty(S, 'stars', { get: () => useSave.getState().stars, enumerable: false, configurable: true })
let saveT = 0
function save() { clearTimeout(saveT); saveT = setTimeout(() => { try { localStorage.setItem(SAVE_KEY, JSON.stringify(S)) } catch (e) { } }, 150) }

const nativeAppend = Element.prototype.append
/** append без «null»: в мини-играх часто передаются необязательные элементы */
function safeAppend(...xs) { return nativeAppend.apply(this, xs.flat().filter(x => x !== null && x !== undefined && x !== false)) }
function el(tag, attrs, ...kids) {
  const e = document.createElement(tag)
  e.append = safeAppend
  if (attrs) for (const k in attrs) {
    const v = attrs[k]
    if (k === 'class') e.className = v
    else if (k === 'html') e.innerHTML = v
    else if (k === 'style' && typeof v === 'object') Object.assign(e.style, v)
    else if (k.startsWith('on') && typeof v === 'function') e.addEventListener(k.slice(2), v)
    else if (v !== undefined && v !== null && v !== false) e.setAttribute(k, v)
  }
  for (const kid of kids.flat()) if (kid !== null && kid !== undefined && kid !== false) e.append(kid.nodeType ? kid : document.createTextNode(kid))
  return e
}
const rand = (a, b) => a + Math.random() * (b - a)
const ri = (a, b) => Math.floor(rand(a, b + 1))
const pick = arr => arr[Math.floor(Math.random() * arr.length)]
const shuffle = arr => { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[a[i], a[j]] = [a[j], a[i]] } return a }
const clamp = (v, a, b) => Math.max(a, Math.min(b, v))

const HEROES = {
  mane: { id: 'mane', name: 'Մանե', age: '5 տարեկան', emoji: '🎀', face: '👧🏻' },
  anulik: { id: 'anulik', name: 'Անուլիկ', age: '15 տարեկան', emoji: '📸', face: '👩🏻' },
  harut: { id: 'harut', name: 'Հարություն քեռի', age: 'քեռի', emoji: '🚗', face: '👨🏻' },
}

/* ---------- звук: оригинальный синтезатор ---------- */
const MAP = { tap: 'tap', pop: 'pop', good: 'star', soft: 'soft', oops: 'soft', win: 'win', star: 'star', whoosh: 'whoosh', splash: 'splash', click: 'tap', camera: 'paper', coin: 'coin', honk: 'horn', door: 'door', magic: 'magic' }
function sfx(n) { try { osfx(MAP[n] || 'tap') } catch (e) { } }
const NN = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 }
function note(n) { try { const m = typeof n === 'string' ? 12 * (parseInt(n.slice(1)) + 1) + NN[n[0]] : Math.round(69 + 12 * Math.log2(n / 440)); xylo(m) } catch (e) { } }
function tone(f, dur = 0.15, type = 'sine', vol = 0.18, when = 0) { try { otone(f, dur, type, vol, when) } catch (e) { } }
function drum(kind) { try { odrum({ kick: 0, snare: 1, tom: 2, hat: 3 }[kind] ?? 0) } catch (e) { } }

/* ---------- голос: оригинальный механизм ---------- */
function speak(text) { if (text) void sayText(String(text)) }
function stopSpeak() { hush() }

/* ---------- окна ---------- */
function layer() { return document.querySelector('.lg-layer') || document.body }
function toast(msg) { let L = document.querySelector('.lg-toasts'); if (!L) { L = el('div', { class: 'lg-toasts' }); document.body.append(L) } const t = el('div', { class: 'lg-toast' }, msg); L.append(t); setTimeout(() => t.remove(), 2700) }
function modal(content, opts = {}) {
  const back = el('div', { class: 'lg-modal-back' }), box = el('div', { class: 'lg-modal' }, content)
  back.append(box); if (opts.dismiss !== false) back.addEventListener('click', e => { if (e.target === back) close() })
  document.body.append(back)
  function close() { back.remove(); opts.onClose && opts.onClose() }
  return { close, box }
}
function confirmBox(title, text, yes = 'Այո', no = 'Ոչ') {
  return new Promise(res => { const m = modal(el('div', null, el('h3', null, title), el('p', null, text), el('div', { class: 'xrow' }, el('button', { class: 'btn', onclick: () => { m.close(); res(true) } }, yes), el('button', { class: 'btn white', onclick: () => { m.close(); res(false) } }, no))), { dismiss: false }) })
}
function confetti(n = 60) {
  const cols = ['#ff8fc5', '#ffd257', '#8fd3ff', '#b79bff', '#8fe3b0', '#ffb07a']
  for (let i = 0; i < n; i++) { const c = el('i', { class: 'lg-confetti', style: { left: rand(0, 100) + 'vw', background: pick(cols), animationDuration: rand(1.6, 3.2) + 's', animationDelay: rand(0, .5) + 's' } }); document.body.append(c); setTimeout(() => c.remove(), 4000) }
}
/** Реплики по очереди с озвучкой. lines: [{who, text, choices?}] */
function say(lines, opts = {}) {
  if (!Array.isArray(lines)) lines = [lines]
  return new Promise(res => {
    let i = 0, box = null
    const host = opts.host || layer()
    function next() {
      if (box) box.remove()
      if (i >= lines.length) { res(); return }
      let L = lines[i++]; if (typeof L === 'string') L = { who: opts.who || 'harut', text: L }
      const h = HEROES[L.who]
      box = el('div', { class: 'lg-dialog' }, el('div', { class: 'face' }, h ? h.face : '🙂'), el('div', { class: 'who' }, h ? h.name : (L.name || '')), el('div', { class: 'txt' }, L.text),
        el('div', { class: 'xrow', style: { justifyContent: 'flex-end' } }, ...(L.choices ? L.choices.map(c => el('button', { class: 'btn small ' + (c.cls || ''), onclick: () => { sfx('tap'); c.fn && c.fn(); next() } }, c.label))
          : [el('button', { class: 'btn small', onclick: () => { sfx('tap'); next() } }, i >= lines.length ? (opts.last || 'Լավ։ 👍') : 'Առաջ ➡️')])))
      host.append(box); speak(L.text)
    }
    next()
  })
}

/* ---------- события, награды, достижения, задания дня ---------- */
const listeners = {}
function on(evt, fn) { (listeners[evt] = listeners[evt] || []).push(fn) }
function emit(evt, data) { (listeners[evt] || []).forEach(f => { try { f(data) } catch (e) { console.error(e) } }); checkDaily(evt, data); checkAchievements(); save() }
function addStars(n) { if (n > 0) star(n) }
function addCoins(n) { S.coins = Math.max(0, S.coins + n); save() }
function addSouvenir(id) {
  if (S.souvenirs.includes(id)) return false
  S.souvenirs.push(id); save()
  const s = (window.DATA && DATA.SOUVENIRS[id]) || { emoji: '🎁', name: id }
  toast('🎁 Նոր հուշանվեր՝ ' + s.emoji + ' ' + s.name); sfx('magic'); emit('souvenir', id); return true
}
function addPhoto(p) { S.album.unshift(Object.assign({ id: Date.now() + '' + ri(0, 999), date: today(), who: S.hero }, p)); if (S.album.length > 120) S.album.length = 120; save(); emit('photo', p); toast('📷 Լուսանկարն ավելացվեց ալբոմում') }
const ACH = [
  { id: 'first', emoji: '🌟', name: 'Առաջին խաղը', test: () => Object.keys(S.played).length >= 1 },
  { id: 'ten', emoji: '🏅', name: '10 տարբեր խաղ', test: () => Object.keys(S.played).length >= 10 },
  { id: 'thirty', emoji: '🏆', name: '30 տարբեր խաղ', test: () => Object.keys(S.played).length >= 30 },
  { id: 'anulik_all', emoji: '📸', name: 'Անուլիկի բոլոր խաղերը', test: () => window.GAMES && GAMES.list('anulik').every(g => S.played[g.id]) },
  { id: 'harut_all', emoji: '🚗', name: 'Հարությունի բոլոր խաղերը', test: () => window.GAMES && GAMES.list('harut').every(g => S.played[g.id]) },
  { id: 'stars50', emoji: '✨', name: '50 աստղ', test: () => S.stars >= 50 },
  { id: 'stars200', emoji: '💫', name: '200 աստղ', test: () => S.stars >= 200 },
  { id: 'explorer', emoji: '🗺️', name: 'Այցելել 8 վայր', test: () => S.visited.length >= 8 },
  { id: 'globetrotter', emoji: '🌍', name: 'Այցելել բոլոր 16 վայրերը', test: () => S.visited.length >= 16 },
  { id: 'secret1', emoji: '🔍', name: 'Առաջին գաղտնիքը', test: () => S.secrets.length >= 1 },
  { id: 'secret8', emoji: '🗝️', name: '8 գաղտնիք', test: () => S.secrets.length >= 8 },
  { id: 'photo5', emoji: '📷', name: '5 լուսանկար ալբոմում', test: () => S.album.length >= 5 },
  { id: 'photo20', emoji: '🖼️', name: '20 լուսանկար ալբոմում', test: () => S.album.length >= 20 },
  { id: 'souv10', emoji: '🎁', name: '10 հուշանվեր', test: () => S.souvenirs.length >= 10 },
  { id: 'adv1', emoji: '🧭', name: 'Առաջին արկածը', test: () => Object.keys(S.adventures).length >= 1 },
  { id: 'adv12', emoji: '👑', name: 'Բոլոր 12 արկածները', test: () => Object.keys(S.adventures).filter(k => !k.startsWith('sis_')).length >= 12 },
  { id: 'sisters', emoji: '💞', name: 'Քույրիկ-ընկերուհիներ (5 զբաղմունք)', test: () => Object.keys(S.adventures).filter(k => k.startsWith('sis_')).length >= 5 },
  { id: 'animals5', emoji: '🐾', name: 'Փրկել 5 կենդանու', test: () => S.animals.length >= 5 },
  { id: 'countries5', emoji: '✈️', name: 'Լինել 5 երկրում', test: () => S.countries.length >= 5 },
  { id: 'daily3', emoji: '📅', name: '3 օր անընդմեջ առաջադրանքներ', test: () => S.daily.streak >= 3 },
  { id: 'night', emoji: '🌙', name: 'Գիշերային զբոսանք', test: () => S.flags.night },
  { id: 'duo', emoji: '🤝', name: 'Խաղ երկուսով', test: () => S.flags.duo },
]
function checkAchievements() { for (const a of ACH) if (!S.achievements[a.id] && a.test()) { S.achievements[a.id] = today(); setTimeout(() => { toast('🏆 Նվաճում՝ ' + a.emoji + ' ' + a.name); sfx('win') }, 600) } }
function flag(name) { if (!S.flags[name]) { S.flags[name] = true; checkAchievements(); save() } }
const DAILY_POOL = [
  { id: 'play3', text: 'Խաղալ 3 մինի-խաղ', evt: 'play', need: 3 }, { id: 'photo', text: 'Լուսանկար անել ալբոմի համար', evt: 'photo', need: 1 },
  { id: 'visit2', text: 'Լինել քաղաքի 2 վայրում', evt: 'visit', need: 2 }, { id: 'adv', text: 'Անցնել մեկ արկած', evt: 'adventure', need: 1 },
  { id: 'animal', text: 'Խնամել կենդանուն', evt: 'animal', need: 1 }, { id: 'stars10', text: 'Հավաքել 10 աստղ', evt: 'stars', need: 10 },
  { id: 'secret', text: 'Գտնել գաղտնիք', evt: 'secret', need: 1 }, { id: 'talk', text: 'Զրուցել բնակիչների հետ 3 անգամ', evt: 'talk', need: 3 },
]
function ensureDaily() {
  const d = today()
  if (S.daily.date !== d) {
    const y = new Date(Date.now() - 864e5).toISOString().slice(0, 10)
    if (S.daily.last !== y && S.daily.last !== d) S.daily.streak = 0
    S.daily.date = d; S.daily.tasks = shuffle(DAILY_POOL).slice(0, 3).map(t => ({ id: t.id, n: 0, done: false })); save()
  }
}
function checkDaily(evt, data) {
  ensureDaily(); let changed = false
  for (const t of S.daily.tasks) { const def = DAILY_POOL.find(p => p.id === t.id); if (!def || t.done || def.evt !== evt) continue
    t.n += evt === 'stars' ? (data || 0) : 1; changed = true
    if (t.n >= def.need) { t.done = true; star(2); setTimeout(() => toast('📅 Օրվա առաջադրանքը կատարված է։ +2 ⭐'), 300) } }
  if (changed && S.daily.tasks.every(t => t.done) && S.daily.last !== S.daily.date) { S.daily.last = S.daily.date; S.daily.streak++; addSouvenir('daily_' + Math.min(S.daily.streak, 7)) }
}

/* ---------- завершение мини-игры ---------- */
function finish(game, result = {}) {
  const stars = clamp(result.stars == null ? 3 : result.stars, 1, 3)
  const rec = S.played[game.id] || { times: 0, best: 0 }
  rec.times++; rec.best = Math.max(rec.best, stars); S.played[game.id] = rec
  addStars(stars); emit('play', game.id); emit('stars', stars)
  if (result.coins) addCoins(result.coins)
  if (result.photo) addPhoto(result.photo)
  sfx('win'); confetti()
  const who = game.who === 'any' ? S.hero : (game.who || S.hero)
  const praise = window.DATA ? pick(DATA.PRAISE[who] || DATA.PRAISE.mane) : { text: 'Ապրե՛ս։' }
  const line = result.text || praise.text
  return new Promise(res => {
    const m = modal(el('div', null,
      el('div', { class: 'stars-big' }, '⭐'.repeat(stars) + '☆'.repeat(3 - stars)),
      el('h3', null, result.title || 'Ուռա՜։ Ստացվեց։'),
      el('div', { style: { fontSize: '80px', lineHeight: 1 } }, HEROES[who] ? HEROES[who].face : '🙂'),
      el('p', null, line), result.coins ? el('p', null, '🪙 +' + result.coins) : null,
      el('div', { class: 'xrow', style: { justifyContent: 'center' } },
        result.noReplay ? null : el('button', { class: 'btn purple', onclick: () => { m.close(); res('replay') } }, '🔁 Նորից'),
        el('button', { class: 'btn', onclick: () => { m.close(); res('next') } }, 'Առաջ ➡️'))), { dismiss: false })
    speak(line)
  })
}

/* ---------- перетаскивание ---------- */
function draggable(node, { onDrop, onMove, onStart, bounds, keep } = {}) {
  node.classList.add('drag'); let sx, sy, ox, oy, moved = false
  node.addEventListener('pointerdown', e => {
    e.preventDefault(); e.stopPropagation(); node.setPointerCapture(e.pointerId); sx = e.clientX; sy = e.clientY; ox = node.offsetLeft; oy = node.offsetTop; moved = false
    node.classList.add('dragging'); onStart && onStart(e)
    const move = ev => { const dx = ev.clientX - sx, dy = ev.clientY - sy; if (Math.abs(dx) + Math.abs(dy) > 4) moved = true; let nx = ox + dx, ny = oy + dy
      if (bounds) { nx = clamp(nx, 0, bounds.clientWidth - node.offsetWidth); ny = clamp(ny, 0, bounds.clientHeight - node.offsetHeight) } node.style.left = nx + 'px'; node.style.top = ny + 'px'; onMove && onMove(ev) }
    const up = ev => { node.removeEventListener('pointermove', move); node.removeEventListener('pointerup', up); node.removeEventListener('pointercancel', up); node.classList.remove('dragging')
      const ok = onDrop ? onDrop(ev, moved) : true; if (ok === false && !keep) { node.style.left = ox + 'px'; node.style.top = oy + 'px' } }
    node.addEventListener('pointermove', move); node.addEventListener('pointerup', up); node.addEventListener('pointercancel', up)
  })
}
function hit(x, y, elem) { const r = elem.getBoundingClientRect(); return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom }

/* ---------- день/ночь и погода (видны в 3D-городе) ---------- */
const isNight = () => S.clock >= 20 || S.clock < 6
function setTime(h) { S.clock = h; save(); emit('clock', h) }
function setWeather(w) { S.weather = w; save(); emit('weather', w) }
setInterval(() => { if (!S.settings.autoTime || document.hidden) return; S.clock = (S.clock + 1) % 24; if (S.clock === 0 || S.clock === 12) S.weather = pick(['sun', 'sun', 'cloud', 'rain', 'snow', 'sun']); save(); emit('clock', S.clock) }, 60000)

window.G = {
  get S() { return S }, save, el, rand, ri, pick, shuffle, clamp, HEROES, ACH, DAILY_POOL,
  sfx, note, drum, tone, speak, stopSpeak, toast, modal, confirmBox, confetti, say,
  on, emit, addStars, addCoins, addSouvenir, addPhoto, finish, draggable, hit, flag, isNight, setTime, setWeather, ensureDaily,
  levelFor(game, who) { const s = S.settings.level || 'auto'; if (s !== 'auto') return s; const w = game.who === 'any' ? (who || S.hero) : game.who; return w === 'mane' ? 'easy' : w === 'anulik' ? 'hard' : 'normal' },
  midi,
}
export default window.G
