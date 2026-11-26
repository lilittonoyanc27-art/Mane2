/* ===== Ядро игры: состояние, экраны, звук, голос, достижения ===== */
window.G = (function () {
  const SAVE_KEY = 'mane-world-save-v1';
  const today = () => new Date().toISOString().slice(0, 10);

  const DEFAULT = {
    stars: 0, coins: 120, hero: 'mane', mode: 'mane',
    played: {},            // id -> {times, best}
    achievements: {},      // id -> date
    souvenirs: [],         // ids
    album: [],             // {id, title, kind, data, who, date}
    visited: [],           // location ids
    secrets: [],           // secret ids
    adventures: {},        // id -> true
    countries: [],         // travel stamps
    animals: [],           // rescued animals
    daily: { date: '', tasks: [], streak: 0, last: '' },
    wardrobe: { anulik: 0, maneDoll: 0 },
    room: { anulik: [], mane: [] },
    settings: { voice: true, sound: true, autoTime: true },
    world: { x: 380, y: 560, vehicle: 'walk' },
    clock: 10,             // игровой час 0..24
    weather: 'sun',
  };

  let S = load();
  function load() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (raw) return deepMerge(JSON.parse(JSON.stringify(DEFAULT)), JSON.parse(raw));
    } catch (e) { /* приватный режим */ }
    return JSON.parse(JSON.stringify(DEFAULT));
  }
  function deepMerge(a, b) {
    for (const k in b) {
      if (b[k] && typeof b[k] === 'object' && !Array.isArray(b[k]) && a[k] && typeof a[k] === 'object' && !Array.isArray(a[k])) deepMerge(a[k], b[k]);
      else a[k] = b[k];
    }
    return a;
  }
  let saveTimer = null;
  function save() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => { try { localStorage.setItem(SAVE_KEY, JSON.stringify(S)); } catch (e) {} }, 150);
  }
  window.addEventListener('beforeunload', () => { try { localStorage.setItem(SAVE_KEY, JSON.stringify(S)); } catch (e) {} });
  document.addEventListener('visibilitychange', () => { if (document.hidden) try { localStorage.setItem(SAVE_KEY, JSON.stringify(S)); } catch (e) {} });

  /* ---------- helpers ---------- */
  function el(tag, attrs, ...kids) {
    const e = document.createElement(tag);
    if (attrs) for (const k in attrs) {
      const v = attrs[k];
      if (k === 'class') e.className = v;
      else if (k === 'html') e.innerHTML = v;
      else if (k === 'style' && typeof v === 'object') Object.assign(e.style, v);
      else if (k.startsWith('on') && typeof v === 'function') e.addEventListener(k.slice(2), v);
      else if (v !== undefined && v !== null && v !== false) e.setAttribute(k, v);
    }
    for (const kid of kids.flat()) if (kid !== null && kid !== undefined && kid !== false) e.append(kid.nodeType ? kid : document.createTextNode(kid));
    return e;
  }
  const rand = (a, b) => a + Math.random() * (b - a);
  const ri = (a, b) => Math.floor(rand(a, b + 1));
  const pick = arr => arr[Math.floor(Math.random() * arr.length)];
  const shuffle = arr => { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  /* ---------- герои ---------- */
  const HEROES = {
    mane:   { id: 'mane',   name: 'Мане',          hy: 'Մանե',            age: '5 лет',  color: 'pink',   emoji: '🎀',
              about: 'Любит играть, животных, раскраски и приключения', voice: { pitch: 1.6, rate: 0.95 } },
    anulik: { id: 'anulik', name: 'Анулик',        hy: 'Անուլիկ',          age: '15 лет', color: 'purple', emoji: '📸',
              about: 'Старшая сестра: путешествия, мода, фото и детективы', voice: { pitch: 1.25, rate: 1.02 } },
    harut:  { id: 'harut',  name: 'Дядя Харутюн',  hy: 'Հարություն քեռի', age: 'дядя',   color: 'blue',   emoji: '🚗',
              about: 'Добрый и весёлый: водит машину, готовит и рассказывает истории', voice: { pitch: 0.75, rate: 0.95 } },
  };
  const MODES = {
    mane:   { title: 'Игра за Мане',      emoji: '🎀', hero: 'mane' },
    anulik: { title: 'Игра за Анулик',    emoji: '📸', hero: 'anulik' },
    harut:  { title: 'Игра за Харутюна',  emoji: '🚗', hero: 'harut' },
    family: { title: 'Семейные приключения', emoji: '👨‍👧‍👧', hero: 'mane' },
    duo:    { title: 'Вдвоём на одном устройстве', emoji: '🤝', hero: 'mane' },
  };

  /* ---------- звук (WebAudio, без файлов) ---------- */
  let AC = null;
  function ac() { if (!AC) { try { AC = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) {} } if (AC && AC.state === 'suspended') AC.resume(); return AC; }
  function tone(freq, dur = 0.15, type = 'sine', vol = 0.18, when = 0) {
    if (!S.settings.sound) return; const c = ac(); if (!c) return;
    const t = c.currentTime + when, o = c.createOscillator(), g = c.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(c.destination); o.start(t); o.stop(t + dur + 0.05);
  }
  function noise(dur = 0.12, vol = 0.12, when = 0, hp = 2000) {
    if (!S.settings.sound) return; const c = ac(); if (!c) return;
    const t = c.currentTime + when, len = Math.floor(c.sampleRate * dur), buf = c.createBuffer(1, len, c.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain();
    f.type = 'highpass'; f.frequency.value = hp; g.gain.value = vol; s.buffer = buf; s.connect(f).connect(g).connect(c.destination); s.start(t);
  }
  const NOTES = { C4: 261.6, D4: 293.7, E4: 329.6, F4: 349.2, G4: 392, A4: 440, B4: 493.9, C5: 523.3, D5: 587.3, E5: 659.3, F5: 698.5, G5: 784 };
  const SFX = {
    tap: () => tone(660, 0.08, 'triangle', 0.12),
    pop: () => { tone(880, 0.06, 'sine', 0.2); tone(1320, 0.08, 'sine', 0.12, 0.04); },
    good: () => { tone(660, 0.1, 'triangle'); tone(880, 0.12, 'triangle', 0.18, 0.08); },
    soft: () => tone(440, 0.12, 'sine', 0.1),
    oops: () => { tone(330, 0.12, 'sine', 0.1); tone(294, 0.16, 'sine', 0.1, 0.1); },
    win: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.22, 'triangle', 0.18, i * 0.11)),
    star: () => [988, 1319].forEach((f, i) => tone(f, 0.15, 'sine', 0.15, i * 0.07)),
    whoosh: () => noise(0.25, 0.08, 0, 800),
    splash: () => noise(0.35, 0.12, 0, 400),
    click: () => noise(0.04, 0.15, 0, 3000),
    camera: () => { noise(0.06, 0.25, 0, 2500); tone(1800, 0.04, 'square', 0.05, 0.05); },
    coin: () => { tone(988, 0.07, 'square', 0.08); tone(1319, 0.2, 'square', 0.08, 0.07); },
    honk: () => { tone(392, 0.25, 'sawtooth', 0.08); tone(494, 0.25, 'sawtooth', 0.06); },
    door: () => { tone(220, 0.1, 'triangle', 0.15); tone(330, 0.15, 'triangle', 0.12, 0.1); },
    magic: () => [784, 988, 1175, 1568, 1976].forEach((f, i) => tone(f, 0.25, 'sine', 0.1, i * 0.06)),
  };
  function sfx(name) { try { (SFX[name] || SFX.tap)(); } catch (e) {} }
  function note(n, dur = 0.4, type = 'triangle') { tone(NOTES[n] || n, dur, type, 0.22); }
  function drum(kind, when = 0) {
    if (kind === 'kick') { const c = ac(); if (!c || !S.settings.sound) return; const t = c.currentTime + when, o = c.createOscillator(), g = c.createGain();
      o.frequency.setValueAtTime(150, t); o.frequency.exponentialRampToValueAtTime(40, t + 0.15); g.gain.setValueAtTime(0.5, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
      o.connect(g).connect(c.destination); o.start(t); o.stop(t + 0.25); }
    else if (kind === 'snare') noise(0.15, 0.2, when, 1200);
    else if (kind === 'hat') noise(0.05, 0.1, when, 6000);
  }

  /* ---------- голос ---------- */
  let voices = [];
  function loadVoices() { try { voices = speechSynthesis.getVoices(); } catch (e) {} }
  if ('speechSynthesis' in window) { loadVoices(); speechSynthesis.onvoiceschanged = loadVoices; }
  function speak(text, who, hy) {
    if (!S.settings.voice || !('speechSynthesis' in window) || !text) return;
    try {
      speechSynthesis.cancel();
      const hyVoice = hy && voices.find(v => /^hy/i.test(v.lang));
      const u = new SpeechSynthesisUtterance(hyVoice ? hy : String(text).replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, ''));
      const v = hyVoice || voices.find(v => /^ru/i.test(v.lang) && /Milena|Katya|Google|Yuri|Irina/i.test(v.name)) || voices.find(v => /^ru/i.test(v.lang));
      if (v) u.voice = v; u.lang = hyVoice ? 'hy-AM' : 'ru-RU';
      const p = (HEROES[who] && HEROES[who].voice) || { pitch: 1.2, rate: 1 };
      u.pitch = p.pitch; u.rate = p.rate;
      speechSynthesis.speak(u);
    } catch (e) {}
  }
  function stopSpeak() { try { speechSynthesis.cancel(); } catch (e) {} }

  /* ---------- экраны ---------- */
  const app = () => document.getElementById('app');
  const stack = [];
  let current = null;
  function render(entry) {
    if (current && current.cleanup) try { current.cleanup(); } catch (e) {}
    stopSpeak();
    app().innerHTML = '';
    document.querySelectorAll('.dialog').forEach(d => d.remove());
    const ctx = { cleanup: null, onCleanup(fn) { const prev = ctx.cleanup; ctx.cleanup = () => { prev && prev(); fn(); }; } };
    current = ctx;
    const node = entry.fn(ctx, ...(entry.args || []));
    if (node) app().append(node);
    updateWeather();
  }
  function go(fn, ...args) { stack.push({ fn, args }); render(stack[stack.length - 1]); }
  function replace(fn, ...args) { stack.pop(); go(fn, ...args); }
  function back() { sfx('tap'); if (stack.length > 1) { stack.pop(); render(stack[stack.length - 1]); } }
  function home() { stack.length = 1; render(stack[0]); }
  function refresh() { render(stack[stack.length - 1]); }

  function screen({ title, sub, bg, back: showBack = true, right, onBack }) {
    const root = el('div', { class: 'screen', style: { background: bg || '' } });
    const bar = el('div', { class: 'topbar' },
      showBack ? el('button', { class: 'icon-btn', 'aria-label': 'Назад', onclick: onBack || back }, '⬅️') : null,
      el('h2', null, title || '', sub ? el('small', null, sub) : null),
      right || null,
      el('span', { class: 'pill', id: 'star-pill' }, '⭐ ' + S.stars),
    );
    const body = el('div', { class: 'body' });
    root.append(bar, body);
    return { root, body, bar };
  }
  function updatePills() { document.querySelectorAll('#star-pill').forEach(p => p.textContent = '⭐ ' + S.stars); }

  /* ---------- UI: toast, modal, диалоги ---------- */
  function toast(msg) { const t = el('div', { class: 'toast' }, msg); document.getElementById('toast-layer').append(t); setTimeout(() => t.remove(), 2700); }
  function modal(content, opts = {}) {
    const back = el('div', { class: 'modal-back' });
    const box = el('div', { class: 'modal' }, content);
    back.append(box);
    if (opts.dismiss !== false) back.addEventListener('click', e => { if (e.target === back) close(); });
    document.body.append(back);
    function close() { back.remove(); opts.onClose && opts.onClose(); }
    return { close, box };
  }
  function confirmBox(title, text, yes = 'Да', no = 'Нет') {
    return new Promise(res => {
      const m = modal(el('div', null, el('h3', null, title), el('p', null, text),
        el('div', { class: 'row' }, el('button', { class: 'btn', onclick: () => { m.close(); res(true); } }, yes),
          el('button', { class: 'btn white', onclick: () => { m.close(); res(false); } }, no))), { dismiss: false });
    });
  }
  function confetti(n = 60) {
    const cols = ['#f06fb0', '#b48cf0', '#ffd45a', '#8fe07c', '#8cc8ff', '#ffad66'];
    for (let i = 0; i < n; i++) {
      const c = el('i', { class: 'confetti', style: { left: rand(0, 100) + 'vw', background: pick(cols), animationDuration: rand(1.6, 3.2) + 's', animationDelay: rand(0, .5) + 's' } });
      document.body.append(c); setTimeout(() => c.remove(), 4000);
    }
  }
  /**
   * Показать реплики по очереди. lines: [{who, text, hy}] или строки.
   * Возвращает Promise, который завершится после последней реплики.
   */
  function say(lines, opts = {}) {
    if (!Array.isArray(lines)) lines = [lines];
    return new Promise(res => {
      let i = 0; let box = null;
      const host = opts.host || document.body;
      function next() {
        if (box) box.remove();
        if (i >= lines.length) { stopSpeak(); res(); return; }
        let L = lines[i++]; if (typeof L === 'string') L = { who: opts.who || 'harut', text: L };
        const h = HEROES[L.who];
        const face = el('div', { class: 'face', html: window.ART ? ART.face(L.who) : '' });
        const choices = L.choices;
        box = el('div', { class: 'dialog', style: host === document.body ? { position: 'fixed' } : {} },
          face,
          el('div', { class: 'who' }, h ? h.name : (L.name || '')),
          el('div', { class: 'txt' }, L.hy ? el('span', { class: 'hy' }, L.hy) : null, L.text),
          el('div', { class: 'row' }, ...(choices ? choices.map(c => el('button', { class: 'btn small ' + (c.cls || ''), onclick: () => { sfx('tap'); c.fn && c.fn(); next(); } }, c.label))
            : [el('button', { class: 'btn small', onclick: () => { sfx('tap'); next(); } }, i >= lines.length ? (opts.last || 'Хорошо! 👍') : 'Дальше ➡️')])));
        host.append(box);
        speak(L.text, L.who, L.hy);
      }
      next();
    });
  }

  /* ---------- события, награды, достижения ---------- */
  const listeners = {};
  function on(evt, fn) { (listeners[evt] = listeners[evt] || []).push(fn); }
  function emit(evt, data) { (listeners[evt] || []).forEach(f => { try { f(data); } catch (e) { console.error(e); } }); checkDaily(evt, data); checkAchievements(); save(); }

  function addStars(n) { if (n <= 0) return; S.stars += n; updatePills(); save(); }
  function addCoins(n) { S.coins = Math.max(0, S.coins + n); save(); }
  function addSouvenir(id) {
    if (S.souvenirs.includes(id)) return false;
    S.souvenirs.push(id); save();
    const s = (window.DATA && DATA.SOUVENIRS[id]) || { emoji: '🎁', name: id };
    toast('🎁 Новый сувенир: ' + s.emoji + ' ' + s.name); sfx('magic');
    emit('souvenir', id); return true;
  }
  function addPhoto(p) {
    S.album.unshift(Object.assign({ id: Date.now() + '' + ri(0, 999), date: today(), who: S.hero }, p));
    if (S.album.length > 120) S.album.length = 120;
    save(); emit('photo', p); toast('📷 Фото добавлено в альбом');
  }

  const ACH = [
    { id: 'first', emoji: '🌟', name: 'Первая игра', test: () => Object.keys(S.played).length >= 1 },
    { id: 'ten', emoji: '🏅', name: '10 разных игр', test: () => Object.keys(S.played).length >= 10 },
    { id: 'thirty', emoji: '🏆', name: '30 разных игр', test: () => Object.keys(S.played).length >= 30 },
    { id: 'mane_all', emoji: '🎀', name: 'Все игры Мане', test: () => window.GAMES && GAMES.list('mane').every(g => S.played[g.id]) },
    { id: 'anulik_all', emoji: '📸', name: 'Все игры Анулик', test: () => window.GAMES && GAMES.list('anulik').every(g => S.played[g.id]) },
    { id: 'harut_all', emoji: '🚗', name: 'Все игры Харутюна', test: () => window.GAMES && GAMES.list('harut').every(g => S.played[g.id]) },
    { id: 'stars50', emoji: '✨', name: '50 звёзд', test: () => S.stars >= 50 },
    { id: 'stars200', emoji: '💫', name: '200 звёзд', test: () => S.stars >= 200 },
    { id: 'explorer', emoji: '🗺️', name: 'Посетить 8 мест', test: () => S.visited.length >= 8 },
    { id: 'globetrotter', emoji: '🌍', name: 'Посетить все 16 мест', test: () => S.visited.length >= 16 },
    { id: 'secret1', emoji: '🔍', name: 'Первый секрет', test: () => S.secrets.length >= 1 },
    { id: 'secret8', emoji: '🗝️', name: '8 секретов', test: () => S.secrets.length >= 8 },
    { id: 'photo5', emoji: '📷', name: '5 фото в альбоме', test: () => S.album.length >= 5 },
    { id: 'photo20', emoji: '🖼️', name: '20 фото в альбоме', test: () => S.album.length >= 20 },
    { id: 'souv10', emoji: '🎁', name: '10 сувениров', test: () => S.souvenirs.length >= 10 },
    { id: 'adv1', emoji: '🧭', name: 'Первое приключение', test: () => Object.keys(S.adventures).length >= 1 },
    { id: 'adv12', emoji: '👑', name: 'Все 12 приключений', test: () => Object.keys(S.adventures).length >= 12 },
    { id: 'sisters', emoji: '💞', name: 'Сестрёнки-подружки (5 занятий)', test: () => Object.keys(S.adventures).filter(k => k.startsWith('sis_')).length >= 5 },
    { id: 'animals5', emoji: '🐾', name: 'Спасти 5 животных', test: () => S.animals.length >= 5 },
    { id: 'countries5', emoji: '✈️', name: 'Побывать в 5 странах', test: () => S.countries.length >= 5 },
    { id: 'daily3', emoji: '📅', name: '3 дня заданий подряд', test: () => S.daily.streak >= 3 },
    { id: 'night', emoji: '🌙', name: 'Ночная прогулка', test: () => S.flags && S.flags.night },
    { id: 'duo', emoji: '🤝', name: 'Игра вдвоём', test: () => S.flags && S.flags.duo },
  ];
  function checkAchievements() {
    for (const a of ACH) if (!S.achievements[a.id] && a.test()) {
      S.achievements[a.id] = today(); setTimeout(() => { toast('🏆 Достижение: ' + a.emoji + ' ' + a.name); sfx('win'); }, 600);
    }
  }
  function flag(name) { S.flags = S.flags || {}; if (!S.flags[name]) { S.flags[name] = true; checkAchievements(); save(); } }

  /* ---------- ежедневные задания ---------- */
  const DAILY_POOL = [
    { id: 'play3', text: 'Сыграть в 3 мини-игры', evt: 'play', need: 3 },
    { id: 'photo', text: 'Сделать фото для альбома', evt: 'photo', need: 1 },
    { id: 'visit2', text: 'Побывать в 2 местах города', evt: 'visit', need: 2 },
    { id: 'adv', text: 'Пройти одно приключение', evt: 'adventure', need: 1 },
    { id: 'animal', text: 'Позаботиться о животном', evt: 'animal', need: 1 },
    { id: 'stars10', text: 'Собрать 10 звёзд', evt: 'stars', need: 10 },
    { id: 'secret', text: 'Найти секрет', evt: 'secret', need: 1 },
    { id: 'talk', text: 'Поговорить с жителями 3 раза', evt: 'talk', need: 3 },
  ];
  function ensureDaily() {
    const d = today();
    if (S.daily.date !== d) {
      const y = new Date(Date.now() - 864e5).toISOString().slice(0, 10);
      if (S.daily.last !== y && S.daily.last !== d) S.daily.streak = S.daily.last ? 0 : S.daily.streak;
      S.daily.date = d; S.daily.tasks = shuffle(DAILY_POOL).slice(0, 3).map(t => ({ id: t.id, n: 0, done: false }));
      save();
    }
  }
  function checkDaily(evt, data) {
    ensureDaily();
    let changed = false;
    for (const t of S.daily.tasks) {
      const def = DAILY_POOL.find(p => p.id === t.id); if (!def || t.done) continue;
      if (def.evt === evt) { t.n += (evt === 'stars' ? (data || 0) : 1); changed = true;
        if (t.n >= def.need) { t.done = true; S.stars += 5; setTimeout(() => toast('📅 Задание дня выполнено! +5 ⭐'), 300); } }
    }
    if (changed && S.daily.tasks.every(t => t.done) && S.daily.last !== S.daily.date) {
      S.daily.last = S.daily.date; S.daily.streak++; addSouvenir('daily_' + Math.min(S.daily.streak, 7));
    }
  }

  /* ---------- завершение мини-игры ---------- */
  function finish(game, result = {}) {
    const stars = clamp(result.stars == null ? 3 : result.stars, 1, 3);
    const rec = S.played[game.id] || { times: 0, best: 0 };
    rec.times++; rec.best = Math.max(rec.best, stars); S.played[game.id] = rec;
    addStars(stars); emit('play', game.id); emit('stars', stars);
    if (result.coins) addCoins(result.coins);
    if (result.photo) addPhoto(result.photo);
    sfx('win'); confetti();
    const who = game.who === 'any' ? S.hero : (game.who || S.hero);
    const praise = window.DATA ? pick(DATA.PRAISE[who] || DATA.PRAISE.mane) : { text: 'Молодец!' };
    const harutLine = window.DATA ? pick(DATA.PRAISE.harut) : null;
    return new Promise(res => {
      const m = modal(el('div', null,
        el('div', { class: 'stars-big' }, '⭐'.repeat(stars) + '☆'.repeat(3 - stars)),
        el('h3', null, result.title || 'Ура! Получилось!'),
        el('div', { style: { width: '120px', height: '120px', margin: '0 auto' }, html: ART.face(who === 'any' ? 'mane' : who) }),
        el('p', null, result.text || praise.text),
        result.coins ? el('p', null, '🪙 +' + result.coins + ' монет') : null,
        el('div', { class: 'row' },
          result.noReplay ? null : el('button', { class: 'btn purple', onclick: () => { m.close(); res('replay'); } }, '🔁 Ещё раз'),
          el('button', { class: 'btn', onclick: () => { m.close(); res('next'); } }, 'Дальше ➡️'))), { dismiss: false });
      speak(result.text || praise.text, who);
      if (harutLine && Math.random() < 0.4) setTimeout(() => toast('👨 Харутюн: ' + harutLine.text), 1200);
    });
  }

  /* ---------- перетаскивание (мышь + тач) ---------- */
  function draggable(node, { onDrop, onMove, onStart, bounds, keep } = {}) {
    node.classList.add('drag');
    let sx, sy, ox, oy, moved = false;
    node.addEventListener('pointerdown', e => {
      e.preventDefault(); node.setPointerCapture(e.pointerId);
      sx = e.clientX; sy = e.clientY; ox = node.offsetLeft; oy = node.offsetTop; moved = false;
      node.classList.add('dragging'); onStart && onStart(e);
      const move = ev => {
        const dx = ev.clientX - sx, dy = ev.clientY - sy; if (Math.abs(dx) + Math.abs(dy) > 4) moved = true;
        let nx = ox + dx, ny = oy + dy;
        if (bounds) { nx = clamp(nx, 0, bounds.clientWidth - node.offsetWidth); ny = clamp(ny, 0, bounds.clientHeight - node.offsetHeight); }
        node.style.left = nx + 'px'; node.style.top = ny + 'px'; onMove && onMove(ev);
      };
      const up = ev => {
        node.removeEventListener('pointermove', move); node.removeEventListener('pointerup', up); node.removeEventListener('pointercancel', up);
        node.classList.remove('dragging');
        const ok = onDrop ? onDrop(ev, moved) : true;
        if (ok === false && !keep) { node.style.left = ox + 'px'; node.style.top = oy + 'px'; }
      };
      node.addEventListener('pointermove', move); node.addEventListener('pointerup', up); node.addEventListener('pointercancel', up);
    });
  }
  function hit(x, y, elem) { const r = elem.getBoundingClientRect(); return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom; }

  /* ---------- день/ночь и погода ---------- */
  let wxKey = '';
  function isNight() { return S.clock >= 20 || S.clock < 6; }
  function updateWeather(force) {
    const layer = document.getElementById('weather-layer'); if (!layer) return;
    const inWorld = !!document.querySelector('.world-view, .scene.outdoor');
    const key = [inWorld, isNight(), S.weather].join('|');
    if (key === wxKey && !force) return; wxKey = key;
    layer.innerHTML = '';
    if (!inWorld) return;
    if (isNight()) layer.append(el('div', { class: 'night-tint' }));
    if (S.weather === 'rain') for (let i = 0; i < 70; i++) layer.append(el('i', { class: 'drop', style: { left: rand(0, 110) + '%', animationDelay: rand(0, 1) + 's', animationDuration: rand(.5, .9) + 's' } }));
    if (S.weather === 'snow') for (let i = 0; i < 45; i++) layer.append(el('i', { class: 'flake', style: { left: rand(-5, 100) + '%', animationDelay: rand(0, 6) + 's', animationDuration: rand(5, 10) + 's' } }, '❄'));
    if (S.weather === 'cloud') for (let i = 0; i < 4; i++) layer.append(el('i', { class: 'cloud-drift', style: { top: rand(0, 30) + '%', animationDuration: rand(30, 60) + 's', animationDelay: -rand(0, 40) + 's' } }, '☁️'));
  }
  setInterval(() => {   // игровые часы: 1 реальная минута = 1 игровой час
    if (!S.settings.autoTime) return;
    S.clock = (S.clock + 1) % 24;
    if (S.clock === 0 || S.clock === 12) S.weather = pick(['sun', 'sun', 'cloud', 'rain', 'snow', 'sun']);
    if (isNight() && document.querySelector('.world-view')) flag('night');
    save(); updateWeather(); emit('clock', S.clock);
  }, 60000);
  function setTime(h) { S.clock = h; save(); updateWeather(true); }
  function setWeather(w) { S.weather = w; save(); updateWeather(true); }

  function boot() {
    ensureDaily();
    document.addEventListener('pointerdown', () => ac(), { once: true });
    go(HOME.title);
  }

  return {
    get S() { return S; }, save, el, rand, ri, pick, shuffle, clamp, HEROES, MODES, ACH, DAILY_POOL,
    sfx, note, drum, tone, speak, stopSpeak, go, back, replace, home, refresh, screen, toast, modal, confirmBox, confetti, say,
    on, emit, addStars, addCoins, addSouvenir, addPhoto, finish, draggable, hit, flag, isNight, setTime, setWeather, updateWeather, ensureDaily, boot,
    resetAll() { localStorage.removeItem(SAVE_KEY); S = JSON.parse(JSON.stringify(DEFAULT)); },
  };
})();
