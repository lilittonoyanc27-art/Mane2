// @ts-nocheck
/* Перенесено из 2D-версии (ветка 2d-version), тексты — на армянском. */
/* ===== Движки мини-игр (часть 1): простые и творческие — в основном для Мане ===== */
window.ENG = (function () {
  const { el, rand, ri, pick, shuffle, clamp } = G;
  const NUM = ['զրո', 'մեկ', 'երկու', 'երեք', 'չորս', 'հինգ', 'վեց', 'յոթ', 'ութ', 'ինը', 'տասը', 'տասնմեկ', 'տասներկու', 'տասներեք', 'տասնչորս', 'տասնհինգ', 'տասնվեց', 'տասնյոթ', 'տասնութ', 'տասնինը', 'քսան'];
  const COLORS = ['#ff6b8a', '#ffad66', '#ffd45a', '#8fe07c', '#6fd6c4', '#8cc8ff', '#b48cf0', '#f6a6d8', '#c58a5a', '#ffffff', '#5a5a6a', '#ff4d4d'];
  const lv = (api, v) => (v && typeof v === 'object' && !Array.isArray(v)) ? (v[api.level] != null ? v[api.level] : v.normal) : v;

  /* ---------- общие помощники ---------- */
  function setup(api) {
    const b = api.body; b.classList.add('noscroll'); b.style.position = 'relative';
    if (api.cfg.bg) b.style.background = api.cfg.bg;
    return b;
  }
  function pill(text) { return el('span', { class: 'pill' }, text); }
  function hud(api, ...nodes) { const h = el('div', { class: 'xhud' }, ...nodes); api.body.append(h); return h; }
  function instr(api, text, who) {
    let i = api.body.querySelector('.instr');
    if (!i) { i = el('div', { class: 'instr' }); api.body.append(i); }
    i.innerHTML = ''; i.append(el('span', null, text), ' ', el('button', { style: { background: 'none', fontSize: '20px' }, 'aria-label': 'Կրկնել', onclick: () => G.speak(text, who || api.who) }, '🔊'));
    G.speak(text, who || api.who);
    return i;
  }
  function loop(api, fn) {
    let raf, last = performance.now(), stop = false;
    const step = t => { if (stop) return; const dt = Math.min(50, t - last) / 1000; last = t; fn(dt); raf = requestAnimationFrame(step); };
    raf = requestAnimationFrame(step);
    api.ctx.onCleanup(() => { stop = true; cancelAnimationFrame(raf); });
    return () => { stop = true; };
  }
  function every(api, ms, fn) { const id = setInterval(fn, ms); api.ctx.onCleanup(() => clearInterval(id)); return () => clearInterval(id); }
  function keys(api, fn) { const h = e => fn(e); window.addEventListener('keydown', h); api.ctx.onCleanup(() => window.removeEventListener('keydown', h)); }
  function floatText(parent, x, y, text) {
    const t = el('div', { style: { position: 'absolute', left: x + 'px', top: y + 'px', fontWeight: 900, fontSize: '28px', color: '#fff', textShadow: '0 2px 0 #c9468b', pointerEvents: 'none', zIndex: 30 } }, text);
    parent.append(t); t.animate([{ transform: 'translateY(0)', opacity: 1 }, { transform: 'translateY(-60px)', opacity: 0 }], { duration: 900 }).onfinish = () => t.remove();
  }
  const say = (api, text) => G.speak(text, api.who);

  /* ===================== COLLECT: шарики, фрукты, игрушки, рыбки ===================== */
  function collect(api) {
    const b = setup(api), cfg = api.cfg;
    const target = lv(api, cfg.target) || 10; let got = 0, misses = 0, ended = false;
    const counter = pill(cfg.icon + ' 0 / ' + target); hud(api, counter);
    const big = api.level === 'easy';
    function gotOne(node, x, y) {
      if (ended) return; got++; G.sfx('pop'); counter.textContent = cfg.icon + ' ' + got + ' / ' + target;
      if (node) { node.style.pointerEvents = 'none'; node.classList.add('pop-out'); setTimeout(() => node.remove(), 350); }
      if (x != null) floatText(b, x, y, '+1');
      if (api.who === 'mane' && got <= 20) G.speak(NUM[got] + '!', 'mane');
      if (got >= target) { ended = true; setTimeout(() => api.done({ stars: misses > target / 2 ? 2 : 3, text: cfg.win }), 600); }
    }
    instr(api, cfg.instr);

    if (cfg.mode === 'rise' || cfg.mode === 'swim') {
      const objs = [];
      const size = big ? 84 : 62;
      every(api, big ? 900 : 650, () => {
        if (ended || objs.length > 14) return;
        const W = b.clientWidth, H = b.clientHeight;
        const isBad = cfg.bad && api.level === 'hard' && Math.random() < 0.2;
        const e = isBad ? pick(cfg.bad) : pick(cfg.items);
        const n = el('div', { class: 'sprite', style: { fontSize: size + 'px' } }, e);
        const o = { n, x: cfg.mode === 'rise' ? rand(10, W - size - 10) : (Math.random() < .5 ? -size : W + 10), y: cfg.mode === 'rise' ? H + 10 : rand(80, H - size - 60), t: rand(0, 6), bad: isBad };
        o.vx = cfg.mode === 'swim' ? (o.x < 0 ? 1 : -1) * rand(50, 110) * (big ? .7 : 1) : 0;
        o.vy = cfg.mode === 'rise' ? -rand(70, 130) * (big ? .65 : 1) : 0;
        if (o.vx < 0) n.style.transform = 'scaleX(-1)';
        n.addEventListener('pointerdown', ev => { ev.stopPropagation(); if (o.bad) { misses++; G.sfx('oops'); n.classList.add('wiggle'); return; } o.dead = true; gotOne(n, o.x, o.y); });
        b.append(n); objs.push(o);
      });
      loop(api, dt => {
        for (let i = objs.length - 1; i >= 0; i--) {
          const o = objs[i]; o.t += dt; o.x += o.vx * dt; o.y += o.vy * dt;
          const sway = Math.sin(o.t * 2) * (cfg.mode === 'rise' ? 14 : 8);
          o.n.style.left = (o.x + (cfg.mode === 'rise' ? sway : 0)) + 'px'; o.n.style.top = (o.y + (cfg.mode === 'swim' ? sway : 0)) + 'px';
          if (o.dead || o.y < -120 || o.x < -150 || o.x > b.clientWidth + 150) { if (!o.dead) o.n.remove(); objs.splice(i, 1); }
        }
      });
      if (cfg.mode === 'swim') b.append(el('div', { style: { position: 'absolute', left: 0, right: 0, bottom: 0, height: '60px', background: 'linear-gradient(#f7e2b0,#ecc98a)' } }));
    }

    else if (cfg.mode === 'tree') {
      const tree = el('div', { html: ART.tree('#93e38a'), style: { position: 'absolute', left: '50%', top: '6%', width: 'min(80vw,520px)', height: '72%', transform: 'translateX(-50%)' } });
      const basket = el('div', { style: { position: 'absolute', left: '50%', bottom: '70px', transform: 'translateX(-50%)', fontSize: '84px', zIndex: 5 } }, '🧺');
      b.append(tree, basket);
      const spots = [[30, 22], [45, 14], [60, 20], [70, 32], [26, 38], [40, 32], [55, 34], [66, 46], [34, 50], [50, 48], [22, 52], [74, 54], [44, 26], [58, 10], [36, 12]];
      const n = Math.min(target, spots.length);
      shuffle(spots).slice(0, n).forEach(([x, y], i) => {
        const f = el('div', { class: 'sprite float', style: { left: x + '%', top: y + '%', fontSize: (big ? 64 : 52) + 'px', animationDelay: rand(0, 2) + 's', zIndex: 6 } }, cfg.items[i % cfg.items.length]);
        f.onpointerdown = () => {
          if (f.dataset.done) return; f.dataset.done = 1; G.sfx('whoosh');
          const fr = f.getBoundingClientRect(), br = basket.getBoundingClientRect();
          f.animate([{ transform: 'translate(0,0)' }, { transform: `translate(${br.left - fr.left + 10}px,${br.top - fr.top}px) scale(.6)` }], { duration: 600, easing: 'ease-in', fill: 'forwards' })
            .onfinish = () => { f.remove(); basket.classList.add('wiggle'); setTimeout(() => basket.classList.remove('wiggle'), 500); gotOne(null); };
        };
        b.append(f);
      });
    }

    else if (cfg.mode === 'hidden') {
      const covers = shuffle(cfg.covers);
      const n = Math.min(target, covers.length - 1);
      const toys = shuffle(cfg.items);
      const grid = el('div', { style: { position: 'absolute', inset: '70px 10px 80px', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '10px', alignItems: 'center', justifyItems: 'center' } });
      covers.slice(0, Math.max(8, n + 3)).forEach((c, i) => {
        const cell = el('div', { style: { position: 'relative', width: '100%', height: '100%', display: 'grid', placeItems: 'center', minHeight: '80px' } });
        const toy = i < n ? el('div', { style: { position: 'absolute', fontSize: big ? '56px' : '44px' } }, toys[i % toys.length]) : null;
        const cov = el('button', { style: { position: 'relative', fontSize: big ? '76px' : '62px', background: 'none', transition: 'transform .4s', zIndex: 2 } }, c);
        cov.onclick = () => {
          if (cov.dataset.open) return; cov.dataset.open = 1; G.sfx('whoosh');
          cov.style.transform = 'translate(' + (i % 2 ? '' : '-') + '55%,-30%) rotate(' + (i % 2 ? 20 : -20) + 'deg)'; cov.style.opacity = '.55';
          if (toy) { setTimeout(() => { toy.classList.add('glow'); toy.onclick = null; gotOne(toy, cell.offsetLeft + 30, cell.offsetTop + 70); }, 350); }
          else { misses++; G.sfx('soft'); if (api.who === 'mane') G.speak(pick(['Այստեղ դատարկ է, փնտրում ենք հետո։', 'Այստեղ չէ։ Էլ որտե՞ղ կարող է լինել։']), 'mane'); }
        };
        if (toy) cell.append(toy); cell.append(cov); grid.append(cell);
      });
      // перемешиваем ячейки
      shuffle([...grid.children]).forEach(c => grid.append(c));
      b.append(grid);
    }

    else if (cfg.mode === 'fall') {
      const basket = el('div', { style: { position: 'absolute', bottom: '70px', fontSize: big ? '90px' : '72px', zIndex: 5 } }, cfg.catcher || '🧺');
      b.append(basket);
      let bx = b.clientWidth / 2;
      const setX = x => { bx = clamp(x, 40, b.clientWidth - 40); basket.style.left = (bx - 45) + 'px'; };
      setX(bx);
      b.addEventListener('pointermove', e => setX(e.clientX - b.getBoundingClientRect().left));
      b.addEventListener('pointerdown', e => setX(e.clientX - b.getBoundingClientRect().left));
      keys(api, e => { if (e.key === 'ArrowLeft' || e.key === 'a') setX(bx - 40); if (e.key === 'ArrowRight' || e.key === 'd') setX(bx + 40); });
      const objs = [];
      every(api, big ? 1100 : 750, () => { if (ended) return; const n = el('div', { class: 'sprite', style: { fontSize: '52px', pointerEvents: 'none' } }, pick(cfg.items)); b.append(n); objs.push({ n, x: rand(20, b.clientWidth - 60), y: -60, vy: big ? 110 : 170 }); });
      loop(api, dt => {
        const by = b.clientHeight - 70 - 60;
        for (let i = objs.length - 1; i >= 0; i--) { const o = objs[i]; o.y += o.vy * dt; o.n.style.left = o.x + 'px'; o.n.style.top = o.y + 'px';
          if (o.y > by - 30 && o.y < by + 30 && Math.abs(o.x + 26 - bx) < (big ? 70 : 55)) { objs.splice(i, 1); gotOne(o.n, o.x, o.y); continue; }
          if (o.y > b.clientHeight) { o.n.remove(); objs.splice(i, 1); misses++; } }
      });
    }
  }

  /* ===================== SORT: по цветам, уборка, чемодан ===================== */
  function sort(api) {
    const b = setup(api), cfg = api.cfg;
    const count = lv(api, cfg.count) || cfg.items.length;
    const items = shuffle(cfg.items).slice(0, count);
    let left = items.length, mistakes = 0, selected = null;
    const area = el('div', { style: { position: 'absolute', left: '8px', right: '8px', top: '60px', bottom: '230px' } });
    const bins = el('div', { style: { position: 'absolute', left: '8px', right: '8px', bottom: '96px', height: '120px', display: 'grid', gridTemplateColumns: `repeat(${cfg.bins.length},1fr)`, gap: '8px' } });
    b.append(area, bins);
    const counter = pill('📦 ' + left); hud(api, counter);
    const binEls = cfg.bins.map(bn => {
      const d = el('button', { class: 'bin', style: { background: bn.color } }, el('span', { style: { fontSize: '34px' } }, bn.emoji || ''), bn.label, el('div', { class: 'xrow', style: { fontSize: '18px', gap: '0', justifyContent: 'center' } }));
      d.dataset.key = bn.key; d.onclick = () => { if (selected) tryPut(selected, d); };
      bins.append(d); return d;
    });
    function tryPut(node, bin) {
      if (node.dataset.key === bin.dataset.key) {
        G.sfx('good'); left--; counter.textContent = '📦 ' + left;
        bin.lastChild.append(el('span', null, node.textContent)); node.remove(); selected = null;
        bin.classList.add('lit'); setTimeout(() => bin.classList.remove('lit'), 250);
        if (api.who === 'mane' && cfg.sayRight) G.speak(cfg.sayRight(bin.dataset.key), 'mane');
        if (left === 0) setTimeout(() => api.done({ stars: mistakes === 0 ? 3 : mistakes < 4 ? 2 : 1, text: cfg.win }), 500);
        return true;
      }
      mistakes++; G.sfx('oops'); node.classList.add('wiggle'); setTimeout(() => node.classList.remove('wiggle'), 500);
      if (api.who === 'mane') G.speak(cfg.hintWrong || 'Փորձի՛ր մյուս տուփը։', 'mane');
      return false;
    }
    requestAnimationFrame(() => {
      const W = area.clientWidth, H = area.clientHeight, cols = Math.ceil(Math.sqrt(items.length * W / Math.max(H, 1)));
      const rows = Math.ceil(items.length / cols);
      items.forEach((it, i) => {
        const c = i % cols, r = Math.floor(i / cols);
        const n = el('div', { class: 'sprite', style: { left: (c + .5) * W / cols - 32 + rand(-10, 10) + 'px', top: (r + .5) * H / rows - 32 + rand(-8, 8) + 'px', fontSize: api.level === 'easy' ? '60px' : '50px' } }, it.e);
        n.dataset.key = it.key;
        G.draggable(n, {
          onDrop: (ev, moved) => {
            if (!moved) { area.querySelectorAll('.glow').forEach(x => x.classList.remove('glow')); selected = n; n.classList.add('glow'); G.sfx('tap'); return true; }
            const bin = binEls.find(x => G.hit(ev.clientX, ev.clientY, x));
            if (!bin) return false;
            return tryPut(n, bin);
          },
        });
        area.append(n);
      });
    });
    instr(api, cfg.instr);
  }

  /* ===================== COUNT: счёт 1–20 ===================== */
  function count(api) {
    const b = setup(api), cfg = api.cfg;
    const rounds = lv(api, { easy: 6, normal: 8, hard: 10 });
    let round = 0, errors = 0;
    const counter = pill('🔢 1 / ' + rounds); hud(api, counter);
    const field = el('div', { style: { position: 'absolute', inset: '64px 10px 210px', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignContent: 'center', gap: '6px' } });
    const answers = el('div', { style: { position: 'absolute', left: 0, right: 0, bottom: '70px', display: 'flex', justifyContent: 'center', gap: '16px' } });
    b.append(field, answers);
    function next() {
      if (round >= rounds) return api.done({ stars: errors === 0 ? 3 : errors < 4 ? 2 : 1, text: 'Դու կարողանում ես հաշվել մինչև քսան։ Խելոքիկ ես։' });
      round++; counter.textContent = '🔢 ' + round + ' / ' + rounds;
      const max = round <= 3 ? 10 : 20;
      const n = ri(round <= 2 ? 1 : 3, max);
      const e = pick(cfg.items);
      field.innerHTML = '';
      for (let i = 0; i < n; i++) field.append(el('div', { style: { fontSize: n > 12 ? '42px' : '54px', animation: 'fadeIn .3s ' + (i * .04) + 's both' } }, e));
      const opts = shuffle([n, ...shuffle([n - 2, n - 1, n + 1, n + 2, n + 3].filter(x => x > 0 && x <= 22 && x !== n)).slice(0, 2)]);
      answers.innerHTML = '';
      opts.forEach(o => answers.append(el('button', { class: 'orb ' + pick(['', 'purple', 'yellow', 'green', 'blue']), style: { '--s': '96px', fontSize: '44px', fontWeight: 900, color: '#fff', textShadow: '0 3px 0 #0003' }, onclick: () => choose(o, n) }, String(o))));
      instr(api, 'Քանի՞սն են այստեղ։ Հաշվի՛ր և սեղմի՛ր թվի վրա։');
    }
    async function choose(o, n) {
      if (o === n) { G.sfx('win'); G.speak('Ճիշտ է։ ' + NUM[n] + '!', api.who); G.confetti(20); setTimeout(next, 1400); return; }
      errors++; G.sfx('soft');
      G.speak('Արի՛ միասին հաշվենք։', api.who);
      answers.style.pointerEvents = 'none';
      const kids = [...field.children];
      for (let i = 0; i < kids.length; i++) {
        await new Promise(r => setTimeout(r, 600));
        kids[i].classList.add('glow'); kids[i].style.transform = 'scale(1.25)'; G.speak(NUM[i + 1], api.who); G.tone(400 + i * 30, .1);
      }
      setTimeout(() => { answers.style.pointerEvents = ''; kids.forEach(k => { k.classList.remove('glow'); k.style.transform = ''; }); }, 700);
    }
    next();
  }

  /* ===================== MEMORY: карточки ===================== */
  function memory(api) {
    const b = setup(api), cfg = api.cfg;
    const pairs = lv(api, { easy: 4, normal: 6, hard: 8 });
    const set = shuffle(cfg.items).slice(0, pairs);
    const deck = shuffle([...set, ...set]);
    const cols = pairs <= 4 ? 4 : pairs <= 6 ? 4 : 4;
    let open = [], found = 0, moves = 0, lock = false;
    const counter = pill('🔁 Քայլեր՝ 0'); hud(api, counter);
    const grid = el('div', { class: 'cell-grid', style: { gridTemplateColumns: `repeat(${cols},1fr)`, width: 'min(94vw, calc((100vh - 260px) * .75 * ' + cols / Math.ceil(deck.length / cols) + '), 560px)', marginTop: '64px' } });
    deck.forEach(e => {
      const c = el('button', { class: 'mcard' }, el('div', { class: 'f back' }), el('div', { class: 'f front', style: { fontSize: 'clamp(28px,7vw,52px)' } }, e));
      c.onclick = () => {
        if (lock || c.classList.contains('open')) return;
        c.classList.add('open'); G.sfx('click'); open.push({ c, e });
        if (open.length === 2) {
          moves++; counter.textContent = '🔁 Քայլեր՝ ' + moves; lock = true;
          const [a, d] = open;
          if (a.e === d.e) { setTimeout(() => { a.c.classList.add('matched'); d.c.classList.add('matched'); G.sfx('good'); found++; open = []; lock = false;
            if (found === pairs) api.done({ stars: moves <= pairs + 2 ? 3 : moves <= pairs * 2 ? 2 : 1, text: 'Ի՜նչ հիանալի հիշողություն։' }); }, 400); }
          else setTimeout(() => { a.c.classList.remove('open'); d.c.classList.remove('open'); open = []; lock = false; }, 900);
        }
      };
      grid.append(c);
    });
    b.append(el('div', { style: { height: '100%', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', overflow: 'auto' } }, grid));
    instr(api, 'Բացի՛ր երկու քարտ և գտի՛ր նույնները։');
  }

  /* ===================== PUZZLE: картинка из кусочков ===================== */
  const PICTURES = {
    castle: () => `<rect width="300" height="300" fill="#efd9f6"/><g transform="translate(20 20) scale(.44)">${ART.rainbow().replace(/<\/?svg[^>]*>/g, '')}</g>
      <g transform="translate(55 40) scale(.32)">${ART.castle().replace(/<\/?svg[^>]*>/g, '')}</g><ellipse cx="150" cy="320" rx="220" ry="90" fill="#b6ee9e"/>
      <g transform="translate(95 120) scale(.55)">${ART.mane()}</g>`,
    sisters: () => `<rect width="300" height="300" fill="#ffe3f1"/><circle cx="250" cy="50" r="30" fill="#ffd45a"/><ellipse cx="150" cy="310" rx="220" ry="80" fill="#b6ee9e"/>
      <g transform="translate(150 40) scale(.85)">${ART.anulik()}</g><g transform="translate(20 110) scale(.6)">${ART.mane()}</g>`,
    family: () => `<rect width="300" height="300" fill="#dff1ff"/><ellipse cx="150" cy="310" rx="220" ry="80" fill="#b6ee9e"/>
      <g transform="translate(0 50) scale(.8)">${ART.harut({ wave: true })}</g><g transform="translate(110 90) scale(.6)">${ART.mane()}</g><g transform="translate(180 60) scale(.75)">${ART.anulik()}</g>`,
    friends: () => `<rect width="300" height="300" fill="#fff3d6"/><ellipse cx="150" cy="310" rx="220" ry="80" fill="#b6ee9e"/>
      <g transform="translate(20 150) scale(1)">${ART.cat().replace(/<\/?svg[^>]*>/g, '')}</g><g transform="translate(170 140) scale(.95)">${ART.bunny().replace(/<\/?svg[^>]*>/g, '')}</g>
      <g transform="translate(105 20) scale(.9)">${ART.fairy().replace(/<\/?svg[^>]*>/g, '')}</g>`,
  };
  function puzzle(api) {
    ART.init();
    const b = setup(api);
    const n = lv(api, { easy: 2, normal: 3, hard: 4 });
    const picKey = api.cfg.picture || pick(Object.keys(PICTURES));
    const inner = PICTURES[picKey]();
    const s = 300 / n;
    let order = shuffle([...Array(n * n).keys()]);
    if (order.every((v, i) => v === i)) order.reverse();
    let sel = null, moves = 0;
    const size = 'min(86vw, calc(100vh - 230px), 520px)';
    const grid = el('div', { style: { display: 'grid', gridTemplateColumns: `repeat(${n},1fr)`, gap: '3px', width: size, height: size, margin: '70px auto 0', background: '#fff', padding: '3px', borderRadius: '16px', boxShadow: 'var(--shadow)' } });
    const preview = el('div', { style: { position: 'absolute', right: '10px', top: '60px', width: '86px', height: '86px', borderRadius: '12px', overflow: 'hidden', border: '3px solid #fff', boxShadow: 'var(--shadow)' }, html: `<svg viewBox="0 0 300 300" width="100%" height="100%">${inner}</svg>` });
    function draw() {
      grid.innerHTML = '';
      order.forEach((p, i) => {
        const r = Math.floor(p / n), c = p % n;
        const t = el('button', { style: { padding: 0, borderRadius: '6px', overflow: 'hidden', outline: sel === i ? '4px solid var(--pink)' : 'none', zIndex: sel === i ? 2 : 1, background: '#fff' },
          html: `<svg viewBox="${c * s} ${r * s} ${s} ${s}" width="100%" height="100%" style="display:block">${inner}</svg>` });
        t.onclick = () => {
          if (sel === null) { sel = i; G.sfx('tap'); draw(); return; }
          if (sel !== i) { [order[sel], order[i]] = [order[i], order[sel]]; moves++; G.sfx('click'); }
          sel = null; draw();
          if (order.every((v, k) => v === k)) { G.sfx('win'); grid.style.gap = '0'; setTimeout(() => api.done({ stars: moves <= n * n ? 3 : moves <= n * n * 2 ? 2 : 1, text: 'Նկարը հավաքված է։' }), 600); }
        };
        grid.append(t);
      });
    }
    draw(); b.append(grid, preview);
    instr(api, 'Սեղմի՛ր երկու կտորի վրա, որ տեղերը փոխվեն');
  }

  /* ===================== COLORING: раскраски ===================== */
  const COLOR_PICS = {
    house: { name: 'Տնակ', shapes: [['rect', { x: 0, y: 230, width: 300, height: 70 }], ['circle', { cx: 250, cy: 50, r: 30 }], ['rect', { x: 60, y: 130, width: 150, height: 110 }],
      ['path', { d: 'M45 135 L135 60 L225 135Z' }], ['rect', { x: 115, y: 180, width: 40, height: 60 }], ['rect', { x: 75, y: 150, width: 30, height: 30 }], ['rect', { x: 165, y: 150, width: 30, height: 30 }],
      ['rect', { x: 180, y: 70, width: 20, height: 40 }], ['circle', { cx: 255, cy: 175, r: 32 }], ['rect', { x: 248, y: 200, width: 14, height: 35 }]] },
    flower: { name: 'Ծաղիկ', shapes: [['rect', { x: 0, y: 250, width: 300, height: 50 }], ['rect', { x: 143, y: 140, width: 14, height: 110 }], ['ellipse', { cx: 110, cy: 210, rx: 32, ry: 14, transform: 'rotate(-25 110 210)' }],
      ['ellipse', { cx: 190, cy: 190, rx: 32, ry: 14, transform: 'rotate(25 190 190)' }], ...[0, 72, 144, 216, 288].map(a => ['ellipse', { cx: 150, cy: 60, rx: 26, ry: 38, transform: `rotate(${a} 150 100)` }]),
      ['circle', { cx: 150, cy: 100, r: 24 }], ['circle', { cx: 50, cy: 50, r: 22 }]] },
    fish: { name: 'Ձկնիկ', shapes: [['rect', { x: 0, y: 0, width: 300, height: 300 }], ['rect', { x: 0, y: 250, width: 300, height: 50 }], ['ellipse', { cx: 140, cy: 150, rx: 80, ry: 50 }],
      ['path', { d: 'M210 150 L270 105 L270 195Z' }], ['path', { d: 'M120 105 Q140 60 170 108Z' }], ['circle', { cx: 100, cy: 140, r: 12 }], ['circle', { cx: 60, cy: 70, r: 10 }], ['circle', { cx: 80, cy: 40, r: 7 }],
      ['path', { d: 'M30 250 Q20 210 35 180 Q50 210 40 250Z' }], ['path', { d: 'M250 250 Q240 200 260 170 Q275 210 262 250Z' }]] },
    icecream: { name: 'Պաղպաղակ', shapes: [['path', { d: 'M100 170 L150 290 L200 170Z' }], ['circle', { cx: 150, cy: 150, r: 48 }], ['circle', { cx: 120, cy: 110, r: 38 }], ['circle', { cx: 180, cy: 110, r: 38 }],
      ['circle', { cx: 150, cy: 70, r: 36 }], ['circle', { cx: 150, cy: 28, r: 14 }], ['circle', { cx: 40, cy: 60, r: 20 }], ['circle', { cx: 260, cy: 220, r: 20 }]] },
    butterfly: { name: 'Թիթեռ', shapes: [['ellipse', { cx: 95, cy: 110, rx: 60, ry: 50 }], ['ellipse', { cx: 205, cy: 110, rx: 60, ry: 50 }], ['ellipse', { cx: 105, cy: 195, rx: 42, ry: 36 }],
      ['ellipse', { cx: 195, cy: 195, rx: 42, ry: 36 }], ['circle', { cx: 85, cy: 105, r: 16 }], ['circle', { cx: 215, cy: 105, r: 16 }], ['rect', { x: 140, y: 80, width: 20, height: 150, rx: 10 }], ['circle', { cx: 150, cy: 70, r: 16 }]] },
    castle: { name: 'Դղյակ', shapes: [['rect', { x: 0, y: 260, width: 300, height: 40 }], ['rect', { x: 90, y: 130, width: 120, height: 130 }], ['rect', { x: 40, y: 110, width: 50, height: 150 }], ['rect', { x: 210, y: 110, width: 50, height: 150 }],
      ['path', { d: 'M35 112 L65 50 L95 112Z' }], ['path', { d: 'M205 112 L235 50 L265 112Z' }], ['path', { d: 'M85 132 L150 70 L215 132Z' }], ['path', { d: 'M130 260 L130 210 Q150 190 170 210 L170 260Z' }],
      ['circle', { cx: 150, cy: 160, r: 14 }], ['path', { d: 'M65 50 L65 25 L85 32 L65 40' }]] },
  };
  function compSvg(shapes, fills) {
    return `<svg viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg">` + shapes.map(([t, a], i) => `<${t} ${Object.entries(a).map(([k, v]) => `${k}="${v}"`).join(' ')} fill="${fills[i] || '#fff'}" stroke="#7a4a6a" stroke-width="3" stroke-linejoin="round"/>`).join('') + '</svg>';
  }
  function coloring(api) {
    const b = setup(api);
    let picKey = api.cfg.picture || 'house';
    let color = COLORS[0];
    const wrap = el('div', { style: { position: 'absolute', inset: '60px 0 150px', display: 'grid', placeItems: 'center' } });
    const pal = el('div', { class: 'palette', style: { position: 'absolute', left: 0, right: 0, bottom: '62px' } });
    const picks = el('div', { class: 'tabs', style: { position: 'absolute', top: '8px', left: '8px', right: '8px', justifyContent: 'center', zIndex: 21 } });
    let fills = [];
    function drawPicks() { picks.innerHTML = ''; for (const k in COLOR_PICS) picks.append(el('button', { class: 'tab' + (k === picKey ? ' on' : ''), onclick: () => { picKey = k; load(); drawPicks(); } }, COLOR_PICS[k].name)); }
    function load() {
      fills = COLOR_PICS[picKey].shapes.map(() => null);
      wrap.innerHTML = compSvg(COLOR_PICS[picKey].shapes, fills.map(() => '#fff'));
      const svg = wrap.firstChild; svg.style.width = 'min(92vw, calc(100vh - 290px), 560px)'; svg.style.height = 'auto'; svg.style.background = '#fff'; svg.style.borderRadius = '20px'; svg.style.boxShadow = 'var(--shadow)';
      [...svg.children].forEach((sh, i) => { sh.style.cursor = 'pointer'; sh.addEventListener('pointerdown', () => {
        const c = color === 'rainbow' ? pick(COLORS) : color;
        sh.setAttribute('fill', c); fills[i] = c; G.sfx('pop');
        sh.animate([{ opacity: .4 }, { opacity: 1 }], { duration: 250 });
        const filled = fills.filter(Boolean).length;
        doneBtn.disabled = filled < Math.ceil(fills.length * .6);
      }); });
      doneBtn.disabled = true;
    }
    COLORS.forEach(c => pal.append(el('button', { class: 'swatch' + (c === color ? ' on' : ''), style: { background: c }, onclick: e => { color = c; pal.querySelectorAll('.swatch').forEach(s => s.classList.remove('on')); e.currentTarget.classList.add('on'); G.sfx('tap'); } })));
    pal.append(el('button', { class: 'swatch', style: { background: 'conic-gradient(red,orange,yellow,lime,cyan,blue,magenta,red)' }, title: 'Ծիածանի գույն', onclick: e => { color = 'rainbow'; pal.querySelectorAll('.swatch').forEach(s => s.classList.remove('on')); e.currentTarget.classList.add('on'); G.sfx('magic'); } }));
    const doneBtn = el('button', { class: 'btn green small', style: { position: 'absolute', right: '12px', bottom: '130px', zIndex: 22 }, onclick: () => {
      api.done({ stars: fills.every(Boolean) ? 3 : 2, text: 'Ի՜նչ գեղեցիկ նկար է։ Պատից կկախենք։', photo: { title: 'Ներկում՝ ' + COLOR_PICS[picKey].name, kind: 'svg', data: compSvg(COLOR_PICS[picKey].shapes, fills) } }); } }, '✅ Պատրաստ է');
    b.append(picks, wrap, pal, doneBtn);
    drawPicks(); load();
    instr(api, 'Ընտրի՛ր գույնը և սեղմի՛ր նկարի մասի վրա');
  }

  /* ===================== DIFFERENCES: найди отличия ===================== */
  function differences(api) {
    const b = setup(api), cfg = api.cfg;
    const k = lv(api, { easy: 3, normal: 5, hard: 7 });
    const cols = 4, rows = 3, N = cols * rows;
    const base = Array.from({ length: N }, () => pick(cfg.items));
    const diffIdx = shuffle([...Array(N).keys()]).slice(0, k);
    const right = base.slice(); const style = {};
    diffIdx.forEach(i => { const r = Math.random(); if (r < .45) { let e; do e = pick(cfg.items); while (e === base[i]); right[i] = e; } else if (r < .75) right[i] = ''; else style[i] = 'scale(1.6) rotate(15deg)'; });
    let found = 0, misses = 0;
    const counter = pill('🔍 0 / ' + k); hud(api, counter);
    const wrap = el('div', { style: { position: 'absolute', inset: '60px 8px 70px', display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center', alignContent: 'center' } });
    const jit = Array.from({ length: N }, () => [rand(-12, 12), rand(-10, 10)]);
    const panels = [base, right].map((arr, pi) => {
      const p = el('div', { style: { width: 'min(46vw, 440px)', minWidth: '260px', aspectRatio: '4/3', background: cfg.panelBg || 'linear-gradient(#cfeaff,#c3f4b0 60%)', borderRadius: '20px', position: 'relative', display: 'grid', gridTemplateColumns: `repeat(${cols},1fr)`, boxShadow: 'var(--shadow)', border: '4px solid #fff' } });
      arr.forEach((e, i) => {
        const c = el('button', { style: { background: 'none', fontSize: 'clamp(26px,4.5vw,46px)', position: 'relative', transform: `translate(${jit[i][0]}%,${jit[i][1]}%) ${pi === 1 && style[i] ? style[i] : ''}` } }, e || ' ');
        c.onclick = () => tap(i);
        p.append(c);
      });
      return p;
    });
    function tap(i) {
      if (diffIdx.includes(i)) {
        if (panels[0].children[i].dataset.f) return;
        panels.forEach(p => { const c = p.children[i]; c.dataset.f = 1; c.style.outline = '5px solid #ff4d8a'; c.style.borderRadius = '50%'; c.style.outlineOffset = '-2px'; });
        found++; counter.textContent = '🔍 ' + found + ' / ' + k; G.sfx('good');
        if (api.who === 'mane') G.speak(pick(['Գտա՜։', 'Ուռա՜, տարբերություն։', 'Հրաշալի է։']), 'mane');
        if (found === k) setTimeout(() => api.done({ stars: misses < 2 ? 3 : misses < 6 ? 2 : 1, text: 'Բոլոր տարբերությունները գտնված են։ Սուր աչք։' }), 600);
      } else { misses++; G.sfx('soft'); }
    }
    wrap.append(...panels); b.append(wrap);
    const hint = el('button', { class: 'btn yellow small', style: { position: 'absolute', left: '10px', top: '60px', zIndex: 22 }, onclick: () => {
      const i = diffIdx.find(i => !panels[0].children[i].dataset.f); if (i == null) return; misses++;
      panels.forEach(p => { p.children[i].classList.add('glow'); setTimeout(() => p.children[i].classList.remove('glow'), 2400); }); } }, '💡 Հուշում');
    b.append(hint);
    instr(api, 'Գտի՛ր ' + k + ' տարբերություն նկարների միջև։');
  }

  /* ===================== MAZE: волшебный лабиринт ===================== */
  function maze(api) {
    const b = setup(api), cfg = api.cfg;
    const W = lv(api, { easy: 5, normal: 8, hard: 12 }), H = lv(api, { easy: 5, normal: 7, hard: 10 });
    // генерация (DFS)
    const cells = Array.from({ length: W * H }, () => ({ n: 1, e: 1, s: 1, w: 1, v: 0 }));
    const at = (x, y) => cells[y * W + x];
    const st = [[0, 0]]; at(0, 0).v = 1;
    while (st.length) {
      const [x, y] = st[st.length - 1];
      const nb = [[0, -1, 'n', 's'], [1, 0, 'e', 'w'], [0, 1, 's', 'n'], [-1, 0, 'w', 'e']].map(([dx, dy, a, o]) => [x + dx, y + dy, a, o]).filter(([nx, ny]) => nx >= 0 && ny >= 0 && nx < W && ny < H && !at(nx, ny).v);
      if (!nb.length) { st.pop(); continue; }
      const [nx, ny, a, o] = pick(nb); at(x, y)[a] = 0; at(nx, ny)[o] = 0; at(nx, ny).v = 1; st.push([nx, ny]);
    }
    let px = 0, py = 0, moves = 0; const gx = W - 1, gy = H - 1;
    const gems = new Set(shuffle([...Array(W * H).keys()].filter(i => i !== 0 && i !== W * H - 1)).slice(0, lv(api, { easy: 3, normal: 5, hard: 8 })));
    let gemGot = 0;
    const counter = pill('💎 0 / ' + gems.size); hud(api, counter);
    const size = `min(92vw, calc(100vh - 300px) * ${W / H}, 640px)`;
    const grid = el('div', { style: { display: 'grid', gridTemplateColumns: `repeat(${W},1fr)`, width: size, aspectRatio: `${W}/${H}`, margin: '64px auto 0', background: cfg.floor || '#fff6fb', borderRadius: '14px', boxShadow: 'var(--shadow)', overflow: 'hidden' } });
    const wall = cfg.wall || '#b48cf0';
    cells.forEach((c, i) => {
      const d = el('div', { style: { borderTop: c.n ? `4px solid ${wall}` : '4px solid transparent', borderRight: c.e ? `4px solid ${wall}` : '4px solid transparent', borderBottom: c.s ? `4px solid ${wall}` : '4px solid transparent', borderLeft: c.w ? `4px solid ${wall}` : '4px solid transparent', display: 'grid', placeItems: 'center', fontSize: `calc(${size} / ${W} * .55)`, position: 'relative' } });
      d.onclick = () => { const x = i % W, y = Math.floor(i / W); if (Math.abs(x - px) + Math.abs(y - py) === 1) move(x - px, y - py); };
      grid.append(d);
    });
    function draw() {
      [...grid.children].forEach((d, i) => { d.textContent = gems.has(i) ? '💎' : ''; });
      grid.children[gy * W + gx].textContent = cfg.goal || '🏰';
      const me = grid.children[py * W + px]; me.textContent = ''; me.append(el('div', { style: { width: '90%', height: '90%' }, html: ART.face(api.who === 'any' ? G.S.hero : api.who) }));
    }
    function move(dx, dy) {
      const c = at(px, py);
      if ((dx === 1 && c.e) || (dx === -1 && c.w) || (dy === 1 && c.s) || (dy === -1 && c.n)) { G.sfx('soft'); grid.children[py * W + px].classList.add('wiggle'); setTimeout(() => grid.children[py * W + px].classList.remove('wiggle'), 400); return; }
      px += dx; py += dy; moves++; G.sfx('tap');
      const i = py * W + px; if (gems.has(i)) { gems.delete(i); gemGot++; G.sfx('coin'); counter.textContent = '💎 ' + gemGot + ' / ' + (gems.size + gemGot); }
      draw();
      if (px === gx && py === gy) { G.sfx('magic'); setTimeout(() => api.done({ stars: gems.size === 0 ? 3 : 2, text: cfg.win || 'Դու անցար լաբիրինթոսը։' }), 400); }
    }
    keys(api, e => { const m = { ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0], w: [0, -1], s: [0, 1], a: [-1, 0], d: [1, 0] }[e.key]; if (m) { e.preventDefault(); move(...m); } });
    let sx, sy; grid.addEventListener('pointerdown', e => { sx = e.clientX; sy = e.clientY; });
    grid.addEventListener('pointerup', e => { const dx = e.clientX - sx, dy = e.clientY - sy; if (Math.max(Math.abs(dx), Math.abs(dy)) > 30) { if (Math.abs(dx) > Math.abs(dy)) move(Math.sign(dx), 0); else move(0, Math.sign(dy)); } });
    const pad = el('div', { style: { position: 'absolute', right: '12px', bottom: '70px', display: 'grid', gridTemplateColumns: 'repeat(3,56px)', gap: '4px', zIndex: 22 } },
      el('span'), el('button', { class: 'icon-btn', onclick: () => move(0, -1) }, '⬆️'), el('span'),
      el('button', { class: 'icon-btn', onclick: () => move(-1, 0) }, '⬅️'), el('span'), el('button', { class: 'icon-btn', onclick: () => move(1, 0) }, '➡️'),
      el('span'), el('button', { class: 'icon-btn', onclick: () => move(0, 1) }, '⬇️'), el('span'));
    b.append(grid, pad); draw();
    instr(api, cfg.instr || 'Հերոսին հասցրո՛ւ դղյակ և հավաքի՛ր բյուրեղները։');
  }

  /* ===================== DECORATE: торт, мороженое, домик, аквариум, комната, сцена, ожерелье ===================== */
  function baseSvg(scene, st) {
    const L = st.layers || [], P = st.pal || {};
    let s = '';
    if (scene === 'cake') {
      s = `<rect width="300" height="300" fill="${P.bg || '#fff0f7'}"/><ellipse cx="150" cy="262" rx="130" ry="20" fill="#e6e0ee"/><ellipse cx="150" cy="256" rx="124" ry="16" fill="#fff"/>`;
      L.forEach((c, i) => { const w = 210 - i * 44, h = 48, x = 150 - w / 2, y = 250 - (i + 1) * h; s += `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="12" fill="${c}"/><path d="M${x} ${y + 12} ${Array.from({ length: 6 }, (_, k) => `Q${x + w / 6 * (k + .5)} ${y + 26} ${x + w / 6 * (k + 1)} ${y + 12}`).join(' ')} L${x + w} ${y + 6} Q${x + w} ${y} ${x + w - 10} ${y} L${x + 10} ${y} Q${x} ${y} ${x} ${y + 6}Z" fill="#fff" opacity=".85"/>`; });
      if (!L.length) s += `<rect x="45" y="202" width="210" height="48" rx="12" fill="none" stroke="#d9b9ea" stroke-width="3" stroke-dasharray="8 6"/>`;
    } else if (scene === 'icecream') {
      s = `<rect width="300" height="300" fill="${P.bg || '#e9f7ff'}"/><path d="M115 190 L150 292 L185 190Z" fill="#f0c27a"/><path d="M122 205 L178 205 M128 225 L172 225 M135 248 L165 248 M130 192 L160 280 M170 192 L140 280" stroke="#d99a4a" stroke-width="3"/>`;
      L.forEach((c, i) => { const y = 180 - i * 46; s += `<circle cx="150" cy="${y}" r="44" fill="${c}"/><path d="M108 ${y + 10} Q120 ${y + 28} 132 ${y + 14} Q144 ${y + 30} 156 ${y + 14} Q170 ${y + 30} 192 ${y + 10}" fill="${c}"/><circle cx="135" cy="${y - 14}" r="8" fill="#fff" opacity=".4"/>`; });
      if (!L.length) s += `<circle cx="150" cy="180" r="44" fill="none" stroke="#9fc6e6" stroke-width="3" stroke-dasharray="8 6"/>`;
    } else if (scene === 'house') {
      s = `<rect width="300" height="300" fill="#dff1ff"/><circle cx="260" cy="40" r="24" fill="#ffd45a"/><rect y="236" width="300" height="64" fill="${P.ground || '#a9ea93'}"/>
        <rect x="70" y="130" width="160" height="112" rx="8" fill="${P.wall || '#fff2f7'}" stroke="#d9b9ea" stroke-width="3"/><path d="M52 136 L150 58 L248 136Z" fill="${P.roof || '#f6a3c7'}"/>
        <rect x="132" y="180" width="38" height="62" rx="10" fill="${P.door || '#c58a5a'}"/><circle cx="162" cy="212" r="3" fill="#ffd45a"/>`;
    } else if (scene === 'aquarium') {
      s = `<defs><linearGradient id="aq" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${P.water || '#9fdcff'}"/><stop offset="1" stop-color="#3f8fd6"/></linearGradient></defs>
        <rect x="10" y="20" width="280" height="260" rx="20" fill="url(#aq)" stroke="#fff" stroke-width="8"/><path d="M14 250 Q80 230 150 248 Q220 232 286 250 L286 274 L14 274Z" fill="${P.sand || '#f7e2b0'}"/>
        <circle cx="60" cy="200" r="6" fill="#fff" opacity=".6"/><circle cx="70" cy="170" r="4" fill="#fff" opacity=".6"/><circle cx="64" cy="140" r="3" fill="#fff" opacity=".6"/>`;
    } else if (scene === 'room' || scene === 'interior') {
      s = `<rect width="300" height="200" fill="${P.wall || '#f3e6ff'}"/><rect y="200" width="300" height="100" fill="${P.floor || '#e8c9a0'}"/>
        <path d="M0 200 L300 200" stroke="#fff" stroke-width="6"/><rect x="${scene === 'room' ? 190 : 30}" y="40" width="80" height="70" rx="6" fill="#bfe6ff" stroke="#fff" stroke-width="6"/>
        <path d="M${scene === 'room' ? 230 : 70} 40 L${scene === 'room' ? 230 : 70} 110" stroke="#fff" stroke-width="4"/>`;
    } else if (scene === 'stage') {
      s = `<rect width="300" height="300" fill="#2a2240"/><path d="M0 0 L60 0 Q50 120 70 200 L0 200Z M300 0 L240 0 Q250 120 230 200 L300 200Z" fill="${P.curtain || '#c03a6a'}"/>
        <rect y="200" width="300" height="100" fill="${P.floor || '#7a4a2a'}"/><ellipse cx="150" cy="220" rx="110" ry="22" fill="#ffe9a0" opacity=".35"/>
        <path d="M100 0 L60 200 L140 200Z M200 0 L160 200 L240 200Z" fill="#fff8c0" opacity=".12"/>`;
    } else if (scene === 'necklace') {
      s = `<rect width="300" height="300" fill="${P.bg || '#fdf2ff'}"/><path d="M40 40 Q150 300 260 40" stroke="#c9a24a" stroke-width="3" fill="none"/>`;
      const n = 13; L.forEach((c, i) => { const t = (i + 1) / (n + 1); const x = (1 - t) * (1 - t) * 40 + 2 * (1 - t) * t * 150 + t * t * 260, y = (1 - t) * (1 - t) * 40 + 2 * (1 - t) * t * 300 + t * t * 40;
        s += `<circle cx="${x}" cy="${y}" r="11" fill="${c}" stroke="#fff" stroke-width="2"/><circle cx="${x - 3}" cy="${y - 4}" r="3" fill="#fff" opacity=".6"/>`; });
    } else if (scene === 'snowman') {
      s = `<rect width="300" height="300" fill="${P.bg || '#cfe6ff'}"/><path d="M0 240 Q150 215 300 240 L300 300 L0 300Z" fill="#ffffff"/>`;
      L.forEach((c, i) => { const r = [62, 46, 34][i] || 30, y = [205, 125, 64][i] || 40; s += `<circle cx="150" cy="${y}" r="${r}" fill="${c}" stroke="#d9e8f7" stroke-width="3"/><circle cx="${150 - r * .35}" cy="${y - r * .35}" r="${r * .22}" fill="#fff" opacity=".7"/>`; });
      if (!L.length) s += `<circle cx="150" cy="205" r="62" fill="none" stroke="#9fc6e6" stroke-width="3" stroke-dasharray="8 6"/>`;
    } else if (scene === 'garden') {
      s = `<rect width="300" height="300" fill="#dff1ff"/><rect y="170" width="300" height="130" fill="#a9ea93"/><path d="M0 170 Q150 150 300 170" fill="#bff3a8"/>`;
    }
    return `<svg viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%;display:block">${s}</svg>`;
  }
  function renderComp(c) {
    return `<div style="position:relative;width:100%;height:100%">${baseSvg(c.scene, c)}${(c.items || []).map(it => `<span style="position:absolute;left:${it.x}%;top:${it.y}%;font-size:${it.s * 0.33}cqw;transform:translate(-50%,-50%)">${it.e}</span>`).join('')}</div>`;
  }
  function decorate(api) {
    const b = setup(api), cfg = api.cfg;
    const st = { scene: cfg.scene, layers: [], pal: {}, items: [] };
    for (const k in (cfg.palettes || {})) st.pal[k] = cfg.palettes[k][0];
    const min = lv(api, cfg.min) || 4;
    const layout = el('div', { class: 'split', style: { position: 'absolute', inset: '56px 0 60px' } });
    const canvasWrap = el('div', { style: { flex: '1 1 60%', display: 'grid', placeItems: 'center', minHeight: 0 } });
    const canvas = el('div', { style: { position: 'relative', width: 'min(100%, calc(100vh - 200px))', aspectRatio: '1', borderRadius: '22px', overflow: 'hidden', boxShadow: 'var(--shadow)', background: '#fff', containerType: 'inline-size', maxHeight: '100%' } });
    const base = el('div', { style: { position: 'absolute', inset: 0 } });
    canvas.append(base); canvasWrap.append(canvas);
    const side = el('div', { class: 'panel', style: { flex: '1 1 40%', minWidth: '260px', display: 'flex', flexDirection: 'column', gap: '8px' } });
    layout.append(canvasWrap, side); b.append(layout);
    const drawBase = () => { base.innerHTML = baseSvg(cfg.scene, st); };
    drawBase();

    if (cfg.brief) side.append(el('div', { class: 'list-item', style: { background: '#fff7d6' } }, el('span', { class: 'em' }, '📝'), el('span', null, cfg.brief.text)));
    if (cfg.layers) {
      side.append(el('b', null, cfg.layers.label));
      const pal = el('div', { class: 'palette', style: { justifyContent: 'flex-start' } });
      cfg.layers.options.forEach(c => pal.append(el('button', { class: 'swatch', style: { background: c }, onclick: () => {
        if (st.layers.length >= cfg.layers.max) { G.sfx('soft'); G.toast('Այլևս չի տեղավորվում։ Կարելի է հանել ↩️'); return; }
        st.layers.push(c); G.sfx('pop'); drawBase(); check(); } })));
      pal.append(el('button', { class: 'btn white small', onclick: () => { st.layers.pop(); drawBase(); check(); } }, '↩️'));
      side.append(pal);
    }
    for (const k in (cfg.palettes || {})) {
      side.append(el('b', null, cfg.paletteNames[k]));
      const pal = el('div', { class: 'palette', style: { justifyContent: 'flex-start' } });
      cfg.palettes[k].forEach(c => pal.append(el('button', { class: 'swatch', style: { background: c }, onclick: () => { st.pal[k] = c; G.sfx('pop'); drawBase(); } })));
      side.append(pal);
    }
    if (cfg.stickers) {
      side.append(el('b', null, cfg.stickerLabel || 'Զարդեր՝ սեղմի՛ր, հետո տեղաշարժի՛ր։ Քաշի՛ր եզրից դուրս, որ հանես'));
      const tray = el('div', { class: 'xtray', style: { flexWrap: 'wrap', overflow: 'visible', boxShadow: 'none', background: 'none', padding: 0 } });
      cfg.stickers.forEach(e => tray.append(el('button', { onclick: () => addSticker(e) }, e)));
      side.append(tray);
    }
    const counter = el('small', { style: { fontWeight: 800 } });
    const done = el('button', { class: 'btn green', onclick: finish }, '✅ Պատրաստ է։');
    side.append(counter, done);
    function addSticker(e, x = rand(30, 70), y = rand(25, 70), s = cfg.stickerSize || 24) {
      const it = { e, x, y, s }; st.items.push(it);
      const n = el('div', { class: 'sprite' + (cfg.scene === 'aquarium' && /[🐠🐟🐡🐙🦀🐢🦈🐬🐳🦑🪼]/u.test(e) ? ' float' : ''), style: { left: x + '%', top: y + '%', fontSize: s * .33 + 'cqw', transform: 'translate(-50%,-50%)', margin: 0 } }, e);
      // позиционирование через центр
      G.draggable(n, { keep: true, onDrop: (ev, moved) => {
        const r = canvas.getBoundingClientRect();
        const cx = ev.clientX - r.left, cy = ev.clientY - r.top;
        if (!moved) { it.s = it.s >= 36 ? 16 : it.s + 5; n.style.fontSize = it.s * .33 + 'cqw'; G.sfx('tap'); return true; }
        if (cx < -10 || cy < -10 || cx > r.width + 10 || cy > r.height + 10) { st.items.splice(st.items.indexOf(it), 1); n.remove(); G.sfx('whoosh'); check(); return true; }
        it.x = clamp(n.offsetLeft / canvas.clientWidth * 100, 3, 97); it.y = clamp(n.offsetTop / canvas.clientHeight * 100, 3, 97); n.style.left = it.x + '%'; n.style.top = it.y + '%'; return true;
      } });
      canvas.append(n); G.sfx('pop'); check();
    }
    function total() { return st.items.length + st.layers.length; }
    function check() { counter.textContent = 'Տարրեր՝ ' + total() + ' (պետք է առնվազն ' + min + ')'; done.disabled = total() < min; }
    check();
    function finish() {
      let stars = 3, text = cfg.win || 'Հրաշալի ստացվեց։';
      if (cfg.brief && cfg.brief.need) {
        const have = cfg.brief.need.filter(group => st.items.some(i => group.includes(i.e)) || (group.includes('layers') && st.layers.length));
        stars = have.length === cfg.brief.need.length ? 3 : have.length >= cfg.brief.need.length / 2 ? 2 : 1;
        text = stars === 3 ? 'Պատվերը կատարված է կատարյալ։ Հաճախորդը հիացած է։' : 'Լավ է։ Բայց առաջադրանքում ուրիշ բան էլ էր խնդրված։';
      }
      if (cfg.symmetric) { const L = st.layers; const sym = L.length > 2 && L.every((c, i) => c === L[L.length - 1 - i]); stars = sym ? 3 : 2; text = sym ? 'Կատարյալ համաչափություն։ Իսկական ոսկերչի պես։' : 'Գեղեցիկ է։ Հաջորդ անգամ փորձի՛ր համաչափ սարքել։'; }
      api.done({ stars, text, photo: { title: cfg.photoTitle || api.game.title, kind: 'comp', data: JSON.parse(JSON.stringify(st)) } });
    }
    instr(api, cfg.instr);
    // внутренняя функция переноса стикеров: draggable двигает left/top в px; переводим их обратно в % после отпускания (сделано в onDrop)
  }

  /* ===================== DRESSUP: наряды (кукла Мане) и студия моды (Анулик) ===================== */
  function doll(o) {
    const bottom = o.bottom === 'skirt' ? `<path d="M76 196 L124 196 L140 246 L60 246Z" fill="${o.bc}"/>` :
      o.bottom === 'shorts' ? `<path d="M78 194 L122 194 L124 226 L102 226 L100 210 L98 226 L76 226Z" fill="${o.bc}"/><rect x="82" y="226" width="14" height="50" rx="7" fill="url(#gSkin)"/><rect x="104" y="226" width="14" height="50" rx="7" fill="url(#gSkin)"/>` :
      o.bottom === 'dress' ? '' : `<rect x="82" y="194" width="16" height="84" rx="7" fill="${o.bc}"/><rect x="102" y="194" width="16" height="84" rx="7" fill="${o.bc}"/>`;
    const legs = (o.bottom === 'skirt' || o.bottom === 'dress') ? `<rect x="84" y="230" width="12" height="48" rx="6" fill="url(#gSkin)"/><rect x="104" y="230" width="12" height="48" rx="6" fill="url(#gSkin)"/>` : '';
    const top = o.bottom === 'dress' ? `<path d="M80 118 Q100 110 120 118 L146 250 Q100 262 54 250Z" fill="${o.tc}"/>` : `<path d="M78 118 Q100 110 122 118 Q128 160 124 200 L76 200 Q72 160 78 118Z" fill="${o.tc}"/>`;
    const acc = { hat: `<ellipse cx="100" cy="36" rx="54" ry="12" fill="${o.ac}"/><path d="M70 36 Q72 6 100 6 Q128 6 130 36Z" fill="${o.ac}"/>`, crown: `<path d="M74 34 L80 10 L92 26 L100 6 L108 26 L120 10 L126 34Z" fill="#ffd45a" stroke="#e8a926" stroke-width="2"/>`,
      glasses: `<circle cx="87" cy="74" r="11" fill="#2a2638" opacity=".8"/><circle cx="113" cy="74" r="11" fill="#2a2638" opacity=".8"/><path d="M98 74 L102 74" stroke="#2a2638" stroke-width="3"/>`,
      scarf: `<path d="M80 112 Q100 124 120 112 L122 124 Q100 136 78 124Z M112 122 L118 160 L106 160Z" fill="${o.ac}"/>`, bow: `<g transform="translate(128 34)"><ellipse cx="-10" cy="0" rx="12" ry="9" fill="${o.ac}"/><ellipse cx="10" cy="0" rx="12" ry="9" fill="${o.ac}"/><circle r="5" fill="#fff"/></g>`,
      cap: `<path d="M66 44 Q70 12 100 12 Q130 12 134 44Z" fill="${o.ac}"/><path d="M128 40 L160 46 L130 48Z" fill="${o.ac}"/>`, bag: `<path d="M134 150 Q140 130 148 150" stroke="#7a4a2a" stroke-width="3" fill="none"/><rect x="128" y="150" width="28" height="24" rx="6" fill="${o.ac}"/>`, none: '' }[o.acc] || '';
    const hair = o.hair === 'long' ? `<path d="M58 70 Q58 26 100 24 Q142 26 142 72 Q146 130 132 140 L68 140 Q54 130 58 70Z" fill="${o.hc}"/>` :
      o.hair === 'buns' ? `<circle cx="62" cy="44" r="18" fill="${o.hc}"/><circle cx="138" cy="44" r="18" fill="${o.hc}"/>` : o.hair === 'pony' ? `<path d="M128 44 Q170 60 160 120 Q156 150 140 166 Q150 128 132 96Z" fill="${o.hc}"/>` : '';
    return `<svg viewBox="0 0 200 300" style="height:100%;width:auto">${hair}${legs}${bottom}
      <ellipse cx="86" cy="282" rx="15" ry="8" fill="${o.sc}"/><ellipse cx="114" cy="282" rx="15" ry="8" fill="${o.sc}"/>
      <path d="M76 124 Q66 160 68 190" stroke="${o.tc}" stroke-width="14" stroke-linecap="round" fill="none"/><path d="M124 124 Q134 160 132 190" stroke="${o.tc}" stroke-width="14" stroke-linecap="round" fill="none"/>
      <circle cx="68" cy="196" r="7" fill="url(#gSkin)"/><circle cx="132" cy="196" r="7" fill="url(#gSkin)"/>${top}
      <rect x="94" y="100" width="12" height="14" rx="5" fill="url(#gSkin)"/><ellipse cx="100" cy="72" rx="34" ry="37" fill="url(#gSkin)"/>
      <path d="M64 70 Q62 30 100 30 Q138 30 136 66 Q124 44 100 46 Q84 58 64 70Z" fill="${o.hc}"/>
      ${'<g class="blink"><ellipse cx="87" cy="74" rx="6.5" ry="8.5" fill="url(#gEye)"/><circle cx="85" cy="71" r="2.6" fill="#fff"/></g><g class="blink"><ellipse cx="113" cy="74" rx="6.5" ry="8.5" fill="url(#gEye)"/><circle cx="111" cy="71" r="2.6" fill="#fff"/></g>'}
      <ellipse cx="78" cy="88" rx="8" ry="5" fill="#ff8fb0" opacity=".55"/><ellipse cx="122" cy="88" rx="8" ry="5" fill="#ff8fb0" opacity=".55"/>
      <path d="M92 92 Q100 99 108 92" stroke="#d64f78" stroke-width="3" fill="none" stroke-linecap="round"/>${acc}</svg>`;
  }
  function dressup(api) {
    ART.init();
    const b = setup(api), cfg = api.cfg;
    const o = { hair: 'long', hc: '#5a3322', tc: '#f6a6d8', bottom: 'skirt', bc: '#b48cf0', sc: '#f06fb0', acc: 'none', ac: '#ffd45a' };
    const brief = cfg.briefs ? pick(cfg.briefs) : null;
    const layout = el('div', { class: 'split', style: { position: 'absolute', inset: '56px 0 60px' } });
    const view = el('div', { style: { flex: '1 1 45%', display: 'grid', placeItems: 'center', minHeight: '220px', background: cfg.stageBg || 'radial-gradient(#fff,#ffe3f1)', borderRadius: '22px' } });
    const side = el('div', { class: 'panel', style: { flex: '1 1 55%', minWidth: '260px' } });
    layout.append(view, side); b.append(layout);
    const draw = () => { view.innerHTML = `<div style="height:min(60vh,440px)">${doll(o)}</div>`; };
    if (brief) side.append(el('div', { class: 'list-item', style: { background: '#fff7d6' } }, el('span', { class: 'em' }, brief.emoji), el('span', null, 'Պատվեր՝ ' + brief.text)));
    const row = (label, key, opts, render) => {
      side.append(el('b', null, label));
      const r = el('div', { class: 'palette', style: { justifyContent: 'flex-start' } });
      opts.forEach(v => r.append(render(v, () => { o[key] = v; G.sfx('pop'); draw(); }))); side.append(r);
    };
    const sw = (v, fn) => el('button', { class: 'swatch', style: { background: v }, onclick: fn });
    const tb = labels => (v, fn) => el('button', { class: 'tab', onclick: fn }, labels[v] || v);
    row('Սանրվածք', 'hair', ['long', 'pony', 'buns', 'short'], tb({ long: 'Երկար', pony: 'Պոչիկ', buns: 'Կոկոններ', short: 'Կարե' }));
    row('Մազերի գույնը', 'hc', ['#5a3322', '#26140e', '#c58a5a', '#f0c27a', '#b48cf0', '#f06fb0'], sw);
    row('Վերնաշապիկ / զգեստ', 'tc', COLORS.slice(0, 10), sw);
    row('Ներքև', 'bottom', ['skirt', 'pants', 'shorts', 'dress'], tb({ skirt: 'Կիսաշրջազգեստ', pants: 'Տաբատ', shorts: 'Շորտեր', dress: 'Զգեստ' }));
    row('Ներքևի գույնը', 'bc', COLORS.slice(0, 10), sw);
    row('Կոշիկներ', 'sc', ['#f06fb0', '#ffffff', '#2a2638', '#c58a5a', '#ffd45a', '#8cc8ff'], sw);
    row('Աքսեսուար', 'acc', ['none', 'hat', 'crown', 'glasses', 'scarf', 'bow', 'cap', 'bag'], tb({ none: '—', hat: '👒 Գլխարկ', crown: '👑 Թագ', glasses: '🕶️ Ակնոց', scarf: '🧣 Շարֆ', bow: '🎀 Ժապավեն', cap: '🧢 Կեպի', bag: '👜 Պայուսակ' }));
    row('Աքսեսուարի գույնը', 'ac', ['#ffd45a', '#f06fb0', '#8cc8ff', '#ff6b8a', '#8fe07c', '#ffffff'], sw);
    side.append(el('button', { class: 'btn green', style: { marginTop: '10px', width: '100%' }, onclick: () => {
      let stars = 3, text = cfg.win || 'Ի՜նչ գեղեցիկ զգեստ է։';
      if (brief) { const ok = [brief.bottom.includes(o.bottom), brief.acc.includes(o.acc)].filter(Boolean).length; stars = ok + 1; text = ok === 2 ? 'Հաճախորդը հիացած է։ Կերպարը ճիշտ պատվերով է։' : 'Ոճային է, բայց պատվիրատուն մի քիչ ուրիշ բան էր ուզում։ ' + brief.tip; }
      if (cfg.unlock && stars === 3) { G.S.wardrobe.unlocked = Math.min(5, Math.max(G.S.wardrobe.unlocked || 2, 2) + 1); G.toast('👗 Անուլիկի զգեստապահարանում նոր կերպար կա։'); }
      api.done({ stars, text, photo: { title: (brief ? 'Նորաձևություն՝ ' + brief.text : 'Զգեստ'), kind: 'html', data: `<div style="height:100%;display:grid;place-items:center;background:#fff0f7">${doll(o)}</div>` } });
    } }, '📸 Պատրաստ է՝ լուսանկարել։'));
    draw();
    instr(api, brief ? 'Ընտրի՛ր կերպարը հաճախորդի պատվերով' : 'Հագցրո՛ւ տիկնիկին, ինչպես ուզում ես։');
  }

  /* ===================== MUSIC: ксилофон и песенки ===================== */
  const SONGS = {
    'Աստղիկ': ['C4', 'C4', 'G4', 'G4', 'A4', 'A4', 'G4', 'F4', 'F4', 'E4', 'E4', 'D4', 'D4', 'C4'],
    'Զանգակներ': ['E4', 'E4', 'E4', 'E4', 'E4', 'E4', 'E4', 'G4', 'C4', 'D4', 'E4'],
    'Շնորհավոր ծնունդդ': ['G4', 'G4', 'A4', 'G4', 'C5', 'B4', 'G4', 'G4', 'A4', 'G4', 'D5', 'C5'],
    'Գամմա-սանդուղք': ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5', 'B4', 'A4', 'G4', 'F4', 'E4', 'D4', 'C4'],
  };
  function music(api) {
    const b = setup(api);
    const keysN = ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5', 'D5'];
    const cols = ['#ff6b8a', '#ffad66', '#ffd45a', '#8fe07c', '#6fd6c4', '#8cc8ff', '#b48cf0', '#f6a6d8', '#ff8fb0'];
    let song = null, pos = 0, played = 0;
    const tabs = el('div', { class: 'tabs', style: { position: 'absolute', top: '6px', left: 0, right: 0, justifyContent: 'center', zIndex: 21 } });
    const xylo = el('div', { style: { position: 'absolute', left: '4%', right: '4%', top: '70px', bottom: '80px', display: 'flex', gap: '1.2%', alignItems: 'center', justifyContent: 'center' } });
    const dancer = el('div', { style: { position: 'absolute', left: '50%', top: '58px', transform: 'translateX(-50%)', width: '70px', height: '70px', zIndex: 1 }, html: ART.face(api.who === 'any' ? 'mane' : api.who) });
    const btns = keysN.map((k, i) => {
      const n = el('button', { style: { flex: 1, height: (92 - i * 6) + '%', background: `linear-gradient(90deg,${cols[i]},#fff8 50%,${cols[i]})`, borderRadius: '18px', boxShadow: `0 6px 0 #0002`, position: 'relative', fontWeight: 900, color: '#fff', fontSize: '20px', textShadow: '0 2px 0 #0003' } }, '♪');
      n.addEventListener('pointerdown', () => hitKey(i)); return n;
    });
    xylo.append(...btns);
    function hitKey(i) {
      G.note(keysN[i], .5); played++;
      btns[i].animate([{ transform: 'translateY(6px) scale(.97)' }, { transform: 'none' }], { duration: 200 });
      dancer.animate([{ transform: 'translateX(-50%) rotate(-10deg)' }, { transform: 'translateX(-50%) rotate(10deg)' }, { transform: 'translateX(-50%)' }], { duration: 300 });
      if (song) {
        if (keysN[i] === SONGS[song][pos]) { pos++; if (pos >= SONGS[song].length) { G.confetti(40); const s = song; song = null; highlight(); setTimeout(() => api.done({ stars: 3, text: 'Դու նվագեցիր «' + s + '» երգը։ Բրավո։' }), 600); return; } }
        highlight();
      } else if (played >= 25) { played = -1000; api.done({ stars: 2, text: 'Ի՜նչ գեղեցիկ երաժշտություն։ Դու իսկական երաժիշտ ես։' }); }
    }
    function highlight() { btns.forEach((n, i) => { n.style.outline = song && keysN[i] === SONGS[song][pos] ? '6px solid #fff' : 'none'; n.classList.toggle('glow', !!(song && keysN[i] === SONGS[song][pos])); }); }
    tabs.append(el('button', { class: 'tab on', onclick: e => { song = null; mark(e); highlight(); instr(api, 'Նվագի՛ր ազատ։ Սեղմի՛ր գունավոր ստեղները'); } }, '🎶 Ազատ'));
    for (const s in SONGS) tabs.append(el('button', { class: 'tab', onclick: e => { song = s; pos = 0; mark(e); highlight(); instr(api, 'Սեղմի՛ր լուսավոր ստեղնը՝ նվագենք «' + s + '»'); } }, '🎵 ' + s));
    function mark(e) { tabs.querySelectorAll('.tab').forEach(t => t.classList.remove('on')); e.currentTarget.classList.add('on'); }
    keys(api, e => { const i = '123456789'.indexOf(e.key); if (i >= 0) hitKey(i); });
    b.append(tabs, dancer, xylo);
    instr(api, 'Նվագի՛ր քսիլոֆոնով կամ վերևից երգ ընտրի՛ր');
  }

  /* ===================== CARE: уход за питомцем ===================== */
  function care(api) {
    const b = setup(api), cfg = api.cfg;
    const pets = cfg.pets || ['🐶', '🐱', '🐰', '🐹', '🐼', '🦜'];
    let pet = cfg.pet || null;
    const needs = [{ k: 'food', n: 'Ուտելիք', tool: '🥣', fx: '😋', v: 20 }, { k: 'water', n: 'Ջուր', tool: '💧', fx: '💦', v: 30 }, { k: 'wash', n: 'Լողանալ', tool: '🧽', fx: '🫧', v: 10 },
      { k: 'play', n: 'Խաղ', tool: '🎾', fx: '💖', v: 25 }, { k: 'sleep', n: 'Քուն', tool: '🛏️', fx: '💤', v: 40 }];
    const val = {}; needs.forEach(n => val[n.k] = n.v + ri(0, 15));
    function choose() {
      b.innerHTML = '';
      b.append(el('div', { class: 'center', style: { height: '100%' } }, el('h2', { style: { color: 'var(--ink)' } }, 'Ո՞ւմ ենք բուժելու և երես տալու։'),
        el('div', { class: 'xrow', style: { justifyContent: 'center' } }, ...pets.map(p => el('button', { class: 'card', style: { fontSize: '64px' }, onclick: () => { pet = p; start(); } }, p)))));
      G.speak('Ընտրի՛ր ընտանի կենդանուն։', api.who);
    }
    function start() {
      b.innerHTML = '';
      const room = el('div', { style: { position: 'absolute', inset: '56px 0 150px', display: 'grid', placeItems: 'center' } });
      const petEl = el('div', { style: { fontSize: 'min(34vh,200px)', transition: 'transform .2s', filter: 'drop-shadow(0 10px 8px #0002)' } }, pet);
      room.append(petEl);
      const bars = el('div', { class: 'panel', style: { position: 'absolute', top: '6px', left: '8px', width: 'min(260px,46vw)', zIndex: 21, padding: '8px' } });
      const tools = el('div', { class: 'xtray', style: { position: 'absolute', left: '50%', bottom: '70px', transform: 'translateX(-50%)', maxWidth: '96%' } });
      function drawBars() { bars.innerHTML = ''; needs.forEach(n => bars.append(el('div', { style: { fontSize: '13px', fontWeight: 800 } }, n.tool + ' ' + n.n, el('div', { class: 'meter' }, el('i', { style: { width: val[n.k] + '%' } }))))); }
      needs.forEach(n => tools.append(el('button', { onclick: () => use(n) }, n.tool)));
      function use(n) {
        if (val[n.k] >= 100) { G.speak('Արդեն բավական է։ ' + n.n + ' ՝ լիքն է։', api.who); petEl.classList.add('wiggle'); setTimeout(() => petEl.classList.remove('wiggle'), 500); return; }
        val[n.k] = Math.min(100, val[n.k] + 34); G.sfx(n.k === 'wash' || n.k === 'water' ? 'splash' : 'good');
        petEl.style.transform = 'scale(1.1) rotate(-6deg)'; setTimeout(() => petEl.style.transform = '', 250);
        for (let i = 0; i < 5; i++) floatText(room, room.clientWidth / 2 + rand(-80, 80), room.clientHeight / 2 + rand(-60, 40), n.fx);
        if (n.k === 'sleep') { room.style.transition = 'background .5s'; room.style.background = '#2a2a5a66'; setTimeout(() => room.style.background = '', 900); }
        drawBars();
        if (needs.every(x => val[x.k] >= 100)) { G.emit('animal'); setTimeout(() => api.done({ stars: 3, text: cfg.win || 'Կենդանին կուշտ է, մաքուր և երջանիկ։ Դու լավագույն տանտիրուհին ես։' }), 700); }
      }
      petEl.onclick = () => { G.sfx('pop'); floatText(room, room.clientWidth / 2, room.clientHeight / 2 - 60, '❤️'); };
      b.append(room, bars, tools); drawBars();
      instr(api, 'Կերակրի՛ր, ջուր տո՛ւր, լողացրո՛ւ, խաղա՛ և քնեցրո՛ւ։');
    }
    pet ? start() : choose();
  }

  /* ===================== SHOP: магазин игрушек / супермаркет (для Анулик — с бюджетом) ===================== */
  function shop(api) {
    const b = setup(api), cfg = api.cfg;
    const teen = api.level === 'hard' || !!cfg.budget;
    const listN = lv(api, { easy: 3, normal: 4, hard: 5 });
    const wanted = shuffle(cfg.items).slice(0, listN);
    const wantedKeys = wanted.map(w => w.e);
    let shelfItems = [], budget = 0;
    if (!teen) {
      shelfItems = shuffle([...wanted, ...shuffle(cfg.items.filter(i => !wantedKeys.includes(i.e))).slice(0, 4), ...shuffle(cfg.extra || []).slice(0, 4)]).map(i => ({ e: i.e, n: '', key: i.e }));
    } else {
      wanted.forEach(w => { const p = ri(3, 9); shelfItems.push({ e: w.e, n: (w.n || '') + ' · էկոնոմ', p, key: w.e }, { e: w.e, n: (w.n || '') + ' · պրեմիում', p: p + ri(2, 5), key: w.e }); });
      shuffle(cfg.extra || []).slice(0, 4).forEach(x => shelfItems.push({ e: x.e, n: '🔥 զեղչ', p: ri(2, 6), key: '_' + x.e }));
      budget = shelfItems.filter(s => wantedKeys.includes(s.key)).reduce((m, s) => (m[s.key] = Math.min(m[s.key] || 99, s.p), m), {});
      budget = Object.values(budget).reduce((a, c) => a + c, 0) + ri(2, 4);
      shelfItems = shuffle(shelfItems);
    }
    const cart = []; let spent = 0;
    const list = el('div', { class: 'panel', style: { position: 'absolute', left: '8px', top: '6px', width: 'min(240px,40vw)', zIndex: 21, padding: '8px' } });
    const shelfEl = el('div', { style: { position: 'absolute', inset: '60px 8px 150px calc(min(240px,40vw) + 16px)', display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(92px,1fr))', gap: '8px', alignContent: 'start', overflow: 'auto', background: 'linear-gradient(#fff6,#fff9)', borderRadius: '20px', padding: '8px' } });
    const cartEl = el('div', { class: 'xtray', style: { position: 'absolute', left: '8px', right: '8px', bottom: '66px', minHeight: '74px', alignItems: 'center' } }, el('span', { style: { fontSize: '40px' } }, '🛒'));
    function drawList() {
      list.innerHTML = ''; list.append(el('b', null, '📝 Ցուցակ'));
      wanted.forEach(w => list.append(el('div', { style: { fontWeight: 800, fontSize: '17px' } }, (cart.find(c => c.key === w.e) ? '✅ ' : '⬜ ') + w.e + (teen ? ' ' + (w.n || '') : ''))));
      if (teen) list.append(el('div', { style: { fontWeight: 900, marginTop: '6px', color: spent > budget ? '#d6266f' : '#3f9a3a' } }, '💳 ' + spent + ' / ' + budget + ' ֏'));
    }
    shelfItems.forEach(it => {
      const c = el('button', { class: 'card', style: { padding: '6px' } }, el('span', { class: 'em', style: { fontSize: '42px' } }, it.e), teen ? el('small', null, it.p + ' ֏') : null, teen ? el('small', null, it.n) : null);
      c.onclick = () => {
        if (c.dataset.in) return;
        if (!wantedKeys.includes(it.key)) { G.sfx('soft'); c.classList.add('wiggle'); setTimeout(() => c.classList.remove('wiggle'), 500); G.speak(teen ? 'Սա ցուցակում չկա՝ ավելորդ մի ծախսիր։' : 'Սա ցուցակում չկա։ Էլի նայի՛ր։', api.who); return; }
        if (cart.find(x => x.key === it.key)) { G.toast('Սա արդեն զամբյուղում է'); return; }
        const entry = { key: it.key, p: it.p || 0 }; cart.push(entry); spent += entry.p; G.sfx('coin'); c.style.opacity = '.35'; c.dataset.in = 1;
        if (teen && spent > budget) G.toast('⚠️ Բյուջեն գերազանցված է։ Սեղմի՛ր զամբյուղի ապրանքի վրա, որ հանես');
        const ce = el('button', { style: { fontSize: '40px', background: 'none' }, onclick: () => { if (!teen) return; cart.splice(cart.indexOf(entry), 1); spent -= entry.p; ce.remove(); c.style.opacity = '1'; delete c.dataset.in; drawList(); } }, it.e);
        cartEl.append(ce); drawList();
        if (cart.length === wanted.length) setTimeout(checkout, 300);
      };
      shelfEl.append(c);
    });
    function checkout() {
      if (!teen) {
        const need = wanted.length; let paid = 0;
        const m = G.modal(el('div', null, el('h3', null, '🧾 Դրամարկղ'), el('p', null, 'Դի՛ր ' + need + ' մետաղադրամ՝ մեկական ամեն գնման համար։'),
          el('div', { class: 'xrow', style: { justifyContent: 'center' } }, ...Array.from({ length: need + 2 }, () => el('button', { style: { fontSize: '52px', background: 'none' }, onclick: e => {
            e.currentTarget.style.visibility = 'hidden'; paid++; G.sfx('coin'); G.speak(NUM[paid], api.who);
            if (paid === need) { m.close(); api.done({ stars: 3, text: 'Բոլոր գնումներն արված են։ Շնորհակալություն գնման համար։' }); } } }, '🪙')))), { dismiss: false });
        G.speak('Դի՛ր ' + need + ' մետաղադրամ։', api.who);
      } else {
        const left = budget - spent;
        if (left < 0) { G.toast('Բյուջեն գերազանցված է ' + (-left) + ' ֏-ով՝ ինչ-որ բան փոխարինի՛ր էկոնոմ տարբերակով'); return; }
        api.done({ stars: left >= 2 ? 3 : 2, text: 'Բոլոր գնումները բյուջեի սահմաններում են։ Մնաց ' + left + ' ֏՝ դրանք կգնան խնայատուփ։', coins: left * 5 });
      }
    }
    b.append(list, shelfEl, cartEl); drawList();
    instr(api, teen ? 'Գնի՛ր ամեն ինչ ցուցակով և տեղավորվի՛ր բյուջեում՝ համեմատի՛ր գները։' : 'Գտի՛ր դարակներում ցուցակի իրերը։');
  }

  /* ===================== GARDEN: посадка цветов ===================== */
  function garden(api) {
    const b = setup(api);
    const n = lv(api, { easy: 4, normal: 6, hard: 8 });
    const stages = ['🕳️', '🌰', '🌱', '🌿', null];
    const flowers = ['🌷', '🌻', '🌹', '🌼', '🌸', '🪻', '🌺', '💐'];
    const need = ['🌰', '💧', '☀️', '💧'];
    let tool = '🌰'; const st = Array(n).fill(0); const fl = shuffle(flowers);
    const bed = el('div', { style: { position: 'absolute', inset: '70px 8px 160px', display: 'grid', gridTemplateColumns: `repeat(${Math.ceil(n / 2)},1fr)`, gap: '10px', alignItems: 'center', background: 'linear-gradient(#a9ea93,#8fd07a)', borderRadius: '26px', padding: '10px' } });
    const cells = st.map((_, i) => { const c = el('button', { style: { fontSize: 'clamp(44px,8vw,80px)', background: '#9a6a44', borderRadius: '50%', aspectRatio: '1', display: 'grid', placeItems: 'center', boxShadow: 'inset 0 6px 0 #7a4a2a' } }); c.onclick = () => act(i); bed.append(c); return c; });
    const tools = el('div', { class: 'xtray', style: { position: 'absolute', left: '50%', bottom: '70px', transform: 'translateX(-50%)' } });
    ['🌰', '💧', '☀️'].forEach(t => tools.append(el('button', { class: t === tool ? 'on' : '', onclick: e => { tool = t; tools.querySelectorAll('button').forEach(x => x.classList.remove('on')); e.currentTarget.classList.add('on'); G.sfx('tap');
      G.speak({ '🌰': 'Սերմ', '💧': 'Ջրիկ', '☀️': 'Արևիկ' }[t], api.who); } }, t)));
    function draw() { cells.forEach((c, i) => { c.textContent = st[i] >= 4 ? fl[i % fl.length] : stages[st[i]]; c.style.background = st[i] >= 4 ? '#c3f4b0' : '#9a6a44'; }); }
    function act(i) {
      if (st[i] >= 4) { G.sfx('pop'); cells[i].classList.add('wiggle'); setTimeout(() => cells[i].classList.remove('wiggle'), 500); return; }
      if (need[st[i]] === tool) { st[i]++; G.sfx(tool === '💧' ? 'splash' : 'good'); draw(); cells[i].animate([{ transform: 'scale(.7)' }, { transform: 'scale(1)' }], { duration: 300 });
        if (st[i] >= 4) G.sfx('magic');
        if (st.every(s => s >= 4)) setTimeout(() => api.done({ stars: 3, text: 'Ի՜նչ հրաշալի ծաղկանոց աճեց։' }), 600);
      } else { G.sfx('soft'); G.speak({ 0: 'Նախ սերմը տնկի՛ր։', 1: 'Հիմա ջրի՛ր։', 2: 'Արևիկ է պետք։', 3: 'Էլի մի քիչ ջրիկ։' }[st[i]], api.who); }
    }
    b.append(bed, tools); draw();
    instr(api, 'Տնկի՛ր սերմը 🌰, ջրի՛ր 💧, արև տո՛ւր ☀️ և նորից ջրի՛ր։');
  }

  /* ===================== DRIVE: семейный автомобиль ===================== */
  function drive(api) {
    const b = setup(api), cfg = api.cfg;
    b.style.background = G.isNight() ? '#2c3a5a' : '#a9ea93';
    const goal = lv(api, { easy: 600, normal: 900, hard: 1300 });
    const road = el('div', { style: { position: 'absolute', top: 0, bottom: 0, left: '50%', width: 'min(90vw,420px)', transform: 'translateX(-50%)', background: '#6a6478', overflow: 'hidden', borderLeft: '8px solid #fff', borderRight: '8px solid #fff' } });
    const lines = el('div', { style: { position: 'absolute', inset: '-100px 0 0', background: 'repeating-linear-gradient(transparent 0 40px,#fff 40px 80px) 33% 0/6px 100% no-repeat, repeating-linear-gradient(transparent 0 40px,#fff 40px 80px) 66% 0/6px 100% no-repeat' } });
    road.append(lines);
    const car = el('div', { style: { position: 'absolute', bottom: '90px', fontSize: '68px', transform: 'translateX(-50%) rotate(-90deg)', transition: 'left .15s', zIndex: 5 } }, cfg.car || '🚙');
    road.append(car);
    const side = [];
    for (let i = 0; i < 8; i++) { const t = el('div', { style: { position: 'absolute', fontSize: '44px', left: i % 2 ? '2%' : '88%' } }, pick(['🌳', '🌲', '🏠', '🌻', '🐄', '🐑'])); b.append(t); side.push({ n: t, y: i * 120 }); }
    let lane = 1, dist = 0, starsGot = 0, speed = lv(api, { easy: 160, normal: 220, hard: 290 }), slow = 0;
    const prog = el('div', { class: 'meter', style: { width: '200px' } }, el('i', { style: { width: '0%' } }));
    const cnt = pill('⭐ 0'); hud(api, prog, cnt, pill(cfg.dest || '🏁'));
    const setLane = l => { lane = clamp(l, 0, 2); car.style.left = (lane * 33.3 + 16.6) + '%'; };
    setLane(1);
    keys(api, e => { if (e.key === 'ArrowLeft' || e.key === 'a') setLane(lane - 1); if (e.key === 'ArrowRight' || e.key === 'd') setLane(lane + 1); if (e.key === ' ' || e.key === 'h') G.sfx('honk'); });
    b.addEventListener('pointerdown', e => { if (e.target.closest('button')) return; const r = b.getBoundingClientRect(); setLane(lane + (e.clientX - r.left < r.width / 2 ? -1 : 1)); });
    b.append(road, el('button', { class: 'icon-btn', style: { position: 'absolute', left: '10px', bottom: '80px', zIndex: 22 }, onclick: () => setLane(lane - 1) }, '⬅️'),
      el('button', { class: 'icon-btn', style: { position: 'absolute', right: '10px', bottom: '80px', zIndex: 22 }, onclick: () => setLane(lane + 1) }, '➡️'),
      el('button', { class: 'icon-btn', style: { position: 'absolute', right: '10px', bottom: '140px', zIndex: 22 }, onclick: () => G.sfx('honk') }, '📯'));
    const objs = []; let spawn = 0, ended = false;
    loop(api, dt => {
      if (ended) return;
      const v = speed * (slow > 0 ? .45 : 1); slow -= dt;
      dist += v * dt / 10; prog.firstChild.style.width = Math.min(100, dist / goal * 100) + '%';
      lines.style.transform = `translateY(${(dist * 10) % 80}px)`;
      side.forEach(s => { s.y += v * dt; if (s.y > b.clientHeight) { s.y = -60; s.n.textContent = pick(['🌳', '🌲', '🏠', '🌻', '🐄', '🐑', '⛪', '🏔️']); } s.n.style.top = s.y + 'px'; });
      spawn -= dt;
      if (spawn <= 0) { spawn = rand(.6, 1.2) * (api.level === 'easy' ? 1.3 : 1);
        const good = Math.random() < (api.level === 'easy' ? .65 : .5); const l = ri(0, 2);
        const n = el('div', { style: { position: 'absolute', fontSize: '46px', left: (l * 33.3 + 16.6) + '%', transform: 'translateX(-50%)', top: '-60px' } }, good ? pick(['⭐', '⭐', '⛽', '🍎']) : pick(['🚧', '🪨', '🦆']));
        road.append(n); objs.push({ n, l, y: -60, good }); }
      for (let i = objs.length - 1; i >= 0; i--) { const o = objs[i]; o.y += v * dt; o.n.style.top = o.y + 'px';
        const cy = road.clientHeight - 90 - 50;
        if (o.l === lane && o.y > cy - 40 && o.y < cy + 30) { o.n.remove(); objs.splice(i, 1);
          if (o.good) { starsGot++; cnt.textContent = '⭐ ' + starsGot; G.sfx('coin'); } else { slow = 1; G.sfx('oops'); car.animate([{ transform: 'translateX(-50%) rotate(-80deg)' }, { transform: 'translateX(-50%) rotate(-100deg)' }, { transform: 'translateX(-50%) rotate(-90deg)' }], { duration: 400 });
            if (o.n.textContent === '🦆') G.speak('Օ՜յ, բադիկ։ Թող անցնի։', 'harut'); } continue; }
        if (o.y > road.clientHeight) { o.n.remove(); objs.splice(i, 1); } }
      if (dist >= goal) { ended = true; G.sfx('honk'); api.done({ stars: starsGot >= 10 ? 3 : starsGot >= 5 ? 2 : 1, text: cfg.win || 'Հասանք։ Հարությունը լավագույն վարորդն է։', coins: starsGot }); }
    });
    instr(api, cfg.instr || 'Ձախ-աջ՝ հավաքի՛ր աստղերը և շրջանցի՛ր խոչընդոտները։', 'harut');
  }

  return { collect, sort, count, memory, puzzle, coloring, differences, maze, decorate, dressup, music, care, shop, garden, drive,
    renderComp, baseSvg, doll, helpers: { setup, pill, hud, instr, loop, every, keys, floatText, lv, COLORS, NUM, say } };
})();
