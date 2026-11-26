// @ts-nocheck
/* Новые игры Мане (4–6 лет): крупно, с голосом, без штрафов и таймеров */
(function () {
  const { el, rand, pick, shuffle } = G
  const H = ENG.helpers, { setup, pill, hud, instr } = H
  const NUM = ['', 'Մեկ', 'Երկու', 'Երեք', 'Չորս', 'Հինգ', 'Վեց', 'Յոթ', 'Ութ', 'Ինը', 'Տասը'] // как в оригинальной озвучке n1…n10

  /* ---------- Кто так говорит? (звуки животных из оригинала) ---------- */
  const ANIMALS = [
    { k: 'cat', e: '🐱', n: 'Փիսիկն է։' }, { k: 'dog', e: '🐶', n: 'Շնիկն է։' }, { k: 'cow', e: '🐮', n: 'Կովն է։' }, { k: 'duck', e: '🦆', n: 'Բադիկն է։' },
    { k: 'sheep', e: '🐑', n: 'Գառնուկն է։' }, { k: 'pig', e: '🐷', n: 'Խոճկորն է։' }, { k: 'frog', e: '🐸', n: 'Գորտիկն է։' }, { k: 'horse', e: '🐴', n: 'Ձիուկն է։' },
    { k: 'hen', e: '🐔', n: 'Հավիկն է։' }, { k: 'bird', e: '🐦', n: 'Թռչնակն է։' }, { k: 'bee', e: '🐝', n: 'Մեղուն է։' }, { k: 'rabbit', e: '🐰', n: 'Նապաստակն է։' },
  ]
  function sounds(api) {
    const b = setup(api); b.style.background = 'linear-gradient(#dff3ff,#e9ffe0)'
    const rounds = 6; let r = 0
    const cnt = pill('🎵 1 / ' + rounds); hud(api, cnt)
    const box = el('div', { class: 'center', style: { position: 'absolute', inset: '56px 10px 70px' } }); b.append(box)
    function next() {
      if (r >= rounds) return api.done({ stars: 3, text: 'Դու բոլոր կենդանիներին ճանաչեցիր։ Ապրե՛ս։' })
      r++; cnt.textContent = '🎵 ' + r + ' / ' + rounds
      const ans = pick(ANIMALS), opts = shuffle([ans, ...shuffle(ANIMALS.filter(a => a !== ans)).slice(0, 2)])
      box.innerHTML = ''
      const play = el('button', { class: 'orb yellow', style: { '--s': '110px', fontSize: '54px' }, onclick: () => G.animal(ans.k) }, '🔊')
      const row = el('div', { class: 'xrow', style: { justifyContent: 'center', gap: '18px' } })
      opts.forEach(o => row.append(el('button', { class: 'card', style: { fontSize: 'min(22vw,110px)', padding: '10px 18px' }, onclick: e => {
        if (o === ans) { G.sfx('win'); G.confetti(25); e.currentTarget.classList.add('wiggle'); G.speak(ans.n); setTimeout(next, 1800) }
        else { G.sfx('soft'); G.animal(o.k); e.currentTarget.classList.add('wiggle'); setTimeout(() => G.animal(ans.k), 900) }
      } }, o.e)))
      box.append(play, row)
      G.speak('Լսի՛ր։ Ո՞վ է այսպես խոսում։'); setTimeout(() => G.animal(ans.k), 1900)
    }
    next()
  }

  /* ---------- Միացրու կետերը (счёт по точкам → картинка) ---------- */
  const SHAPES = [
    { e: '⭐', n: 'Աստղ', c: '#ffd257', p: [[50, 8], [61, 38], [92, 38], [67, 57], [77, 88], [50, 70], [23, 88], [33, 57], [8, 38], [39, 38]] },
    { e: '🏠', n: 'Տնակ', c: '#ff9ecb', p: [[20, 90], [20, 50], [50, 18], [80, 50], [80, 90]] },
    { e: '❤️', n: 'Սրտիկ', c: '#ff6b8a', p: [[50, 88], [16, 52], [14, 28], [32, 14], [50, 30], [68, 14], [86, 28], [84, 52]] },
    { e: '🐟', n: 'Ձկնիկ', c: '#7fc4ff', p: [[12, 50], [36, 26], [66, 30], [84, 18], [84, 82], [66, 70], [36, 74]] },
    { e: '⛵', n: 'Նավակ', c: '#b79bff', p: [[14, 66], [86, 66], [74, 86], [26, 86], [14, 66], [50, 66], [50, 10], [80, 56]] },
    { e: '🌙', n: 'Լուսին', c: '#fff0a0', p: [[60, 8], [36, 22], [26, 50], [36, 78], [60, 92], [48, 68], [44, 50], [48, 32]] },
  ]
  function dots(api) {
    const b = setup(api); b.style.background = 'linear-gradient(#2a2a6a,#5a4a9a)'
    const order = shuffle(SHAPES).slice(0, 3); let si = 0
    const cnt = pill(''); hud(api, cnt)
    const wrap = el('div', { style: { position: 'absolute', inset: '56px 10px 70px', display: 'grid', placeItems: 'center' } }); b.append(wrap)
    function draw() {
      if (si >= order.length) return api.done({ stars: 3, text: 'Դու բոլոր նկարները գծեցիր։ Իսկական նկարիչ ես։' })
      const s = order[si]; let k = 0
      cnt.textContent = '✏️ ' + (si + 1) + ' / ' + order.length
      wrap.innerHTML = ''
      const NS = 'http://www.w3.org/2000/svg', svg = document.createElementNS(NS, 'svg')
      svg.setAttribute('viewBox', '0 0 100 100'); svg.style.width = 'min(84vw, calc(100vh - 260px), 520px)'; svg.style.height = 'auto'; svg.style.overflow = 'visible'
      const line = document.createElementNS(NS, 'polyline'); line.setAttribute('fill', 'none'); line.setAttribute('stroke', '#fff'); line.setAttribute('stroke-width', '2.2'); line.setAttribute('stroke-linecap', 'round'); line.setAttribute('stroke-linejoin', 'round')
      svg.append(line)
      const pts = []
      s.p.forEach(([x, y], i) => {
        const g = document.createElementNS(NS, 'g'); g.style.cursor = 'pointer'
        const c = document.createElementNS(NS, 'circle'); c.setAttribute('cx', x); c.setAttribute('cy', y); c.setAttribute('r', 6); c.setAttribute('fill', i === 0 ? '#ffd257' : '#ffffffd0')
        const t = document.createElementNS(NS, 'text'); t.setAttribute('x', x); t.setAttribute('y', y + 2.4); t.setAttribute('text-anchor', 'middle'); t.setAttribute('font-size', '7'); t.setAttribute('font-weight', '900'); t.setAttribute('fill', '#5a3a8a'); t.textContent = i + 1
        const hitc = document.createElementNS(NS, 'circle'); hitc.setAttribute('cx', x); hitc.setAttribute('cy', y); hitc.setAttribute('r', 11); hitc.setAttribute('fill', 'transparent')
        g.append(c, t, hitc)
        g.addEventListener('pointerdown', () => {
          if (i !== k) { G.sfx('soft'); svg.children[k + 1].firstChild.setAttribute('r', 8); setTimeout(() => svg.children[k + 1] && svg.children[k + 1].firstChild.setAttribute('r', 6), 400); return }
          pts.push(x + ',' + y); line.setAttribute('points', pts.join(' ')); c.setAttribute('fill', '#ffd257'); G.tone(500 + k * 60, .15, 'sine', .25)
          if (k + 1 <= 10) G.speak(NUM[k + 1]); k++
          if (k < s.p.length) svg.children[k + 1].firstChild.setAttribute('fill', '#ffd257')
          if (k === s.p.length) {
            pts.push(s.p[0].join(',')); line.setAttribute('points', pts.join(' '))
            const poly = document.createElementNS(NS, 'polygon'); poly.setAttribute('points', pts.join(' ')); poly.setAttribute('fill', s.c); poly.setAttribute('opacity', '.85'); svg.insertBefore(poly, line)
            const big = el('div', { style: { position: 'absolute', fontSize: '120px', animation: 'lgpop .9s reverse' } }, s.e)
            wrap.append(big); G.sfx('win'); G.confetti(30)
            setTimeout(() => G.speak(s.n + '։ Ապրե՛ս։'), 700); setTimeout(() => { si++; draw() }, 2600)
          }
        })
        svg.append(g)
      })
      wrap.append(svg)
      instr(api, 'Միացրո՛ւ կետերը հերթով՝ մեկից սկսած։')
    }
    draw()
  }

  /* ---------- Ատամնաբույժ (почистить зубки зверятам) ---------- */
  const PATIENTS = [{ e: '🐊', n: 'Կոկորդիլոսիկ' }, { e: '🦛', n: 'Գետաձիուկ' }, { e: '🦁', n: 'Առյուծիկ' }]
  function teeth(api) {
    const b = setup(api); b.style.background = 'linear-gradient(#e6f7ff,#fff0f7)'
    let pi = 0
    const cnt = pill(''); hud(api, cnt)
    const area = el('div', { style: { position: 'absolute', inset: '56px 10px 70px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '10px' } }); b.append(area)
    function patient() {
      if (pi >= PATIENTS.length) return api.done({ stars: 3, text: 'Բոլորի ատամիկները փայլում են։ Դու լավագույն ատամնաբույժն ես։' })
      const p = PATIENTS[pi]; cnt.textContent = p.e + ' ' + (pi + 1) + ' / ' + PATIENTS.length
      area.innerHTML = ''
      area.append(el('div', { style: { fontSize: 'min(28vw,150px)', lineHeight: 1 } }, p.e))
      const mouth = el('div', { style: { background: '#c0405a', borderRadius: '40px', padding: '16px 18px', display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: '8px', width: 'min(92vw,520px)', boxShadow: 'inset 0 8px 0 #8a2a40' } })
      let dirty = 0
      for (let i = 0; i < 12; i++) {
        const germ = Math.random() < .55 || i === 3
        const tooth = el('button', { style: { aspectRatio: '1/1.2', borderRadius: i < 6 ? '8px 8px 22px 22px' : '22px 22px 8px 8px', background: germ ? '#f3e2b0' : '#ffffff', fontSize: 'min(7vw,34px)', boxShadow: '0 3px 0 #e0d8e8' } }, germ ? '🦠' : '')
        if (germ) { dirty++; let hits = 0
          tooth.onclick = () => { hits++; G.sfx('splash'); tooth.textContent = '🫧'
            if (hits >= 2) { tooth.textContent = '✨'; tooth.style.background = '#fff'; tooth.onclick = null; dirty--; G.sfx('star')
              if (dirty === 0) { G.sfx('win'); G.confetti(25); G.speak(p.n + 'ն ժպտում է։ Շնորհակալություն։'); setTimeout(() => { pi++; patient() }, 2200) } } } }
        mouth.append(tooth)
      }
      area.append(mouth)
      instr(api, 'Մաքրի՛ր ատամիկները։ Ամեն մանրէի վրա սեղմի՛ր երկու անգամ։')
    }
    patient()
  }

  /* ---------- Տառերը (армянские буквы и слова) ---------- */
  const LETTERS = [
    { l: 'Ա', e: '☀️', q: 'Ո՞րն է սկսվում Ա տառով։', a: 'Ա՝ արև։' }, { l: 'Բ', e: '🦆', q: 'Ո՞րն է սկսվում Բ տառով։', a: 'Բ՝ բադ։' },
    { l: 'Գ', e: '⚽', q: 'Ո՞րն է սկսվում Գ տառով։', a: 'Գ՝ գնդակ։' }, { l: 'Դ', e: '🎃', q: 'Ո՞րն է սկսվում Դ տառով։', a: 'Դ՝ դդում։' },
    { l: 'Զ', e: '🔔', q: 'Ո՞րն է սկսվում Զ տառով։', a: 'Զ՝ զանգ։' }, { l: 'Թ', e: '🦋', q: 'Ո՞րն է սկսվում Թ տառով։', a: 'Թ՝ թիթեռ։' },
    { l: 'Լ', e: '🌙', q: 'Ո՞րն է սկսվում Լ տառով։', a: 'Լ՝ լուսին։' }, { l: 'Խ', e: '🍎', q: 'Ո՞րն է սկսվում Խ տառով։', a: 'Խ՝ խնձոր։' },
    { l: 'Ծ', e: '🌸', q: 'Ո՞րն է սկսվում Ծ տառով։', a: 'Ծ՝ ծաղիկ։' }, { l: 'Կ', e: '🐱', q: 'Ո՞րն է սկսվում Կ տառով։', a: 'Կ՝ կատու։' },
    { l: 'Հ', e: '🐔', q: 'Ո՞րն է սկսվում Հ տառով։', a: 'Հ՝ հավ։' }, { l: 'Մ', e: '🚗', q: 'Ո՞րն է սկսվում Մ տառով։', a: 'Մ՝ մեքենա։' },
    { l: 'Ն', e: '🐰', q: 'Ո՞րն է սկսվում Ն տառով։', a: 'Ն՝ նապաստակ։' }, { l: 'Շ', e: '🐶', q: 'Ո՞րն է սկսվում Շ տառով։', a: 'Շ՝ շուն։' },
    { l: 'Ձ', e: '🐟', q: 'Ո՞րն է սկսվում Ձ տառով։', a: 'Ձ՝ ձուկ։' }, { l: 'Տ', e: '🎂', q: 'Ո՞րն է սկսվում Տ տառով։', a: 'Տ՝ տորթ։' },
  ]
  function letters(api) {
    const b = setup(api); b.style.background = 'linear-gradient(#fff7d6,#ffe6f3)'
    const set = shuffle(LETTERS).slice(0, 6); let r = 0
    const cnt = pill(''); hud(api, cnt)
    const box = el('div', { class: 'center', style: { position: 'absolute', inset: '56px 10px 70px' } }); b.append(box)
    function next() {
      if (r >= set.length) return api.done({ stars: 3, text: 'Դու արդեն տառեր գիտես։ Ապրե՛ս, Մանե ջան։' })
      const L = set[r]; r++; cnt.textContent = '🔤 ' + r + ' / ' + set.length
      const opts = shuffle([L, ...shuffle(LETTERS.filter(x => x !== L)).slice(0, 2)])
      box.innerHTML = ''
      box.append(el('button', { class: 'orb purple', style: { '--s': 'min(30vw,140px)', fontSize: 'min(18vw,90px)', color: '#fff', fontWeight: 900, textShadow: '0 4px 0 #7a58c9' }, onclick: () => G.speak(L.q) }, L.l))
      const row = el('div', { class: 'xrow', style: { justifyContent: 'center', gap: '16px' } })
      opts.forEach(o => row.append(el('button', { class: 'card', style: { fontSize: 'min(20vw,96px)', padding: '8px 16px' }, onclick: e => {
        if (o === L) { G.sfx('win'); G.confetti(20); e.currentTarget.classList.add('wiggle'); G.speak(L.a); setTimeout(next, 2000) }
        else { G.sfx('soft'); e.currentTarget.classList.add('wiggle'); G.speak(o.a) }
      } }, o.e)))
      box.append(row); G.speak(L.q)
    }
    next()
  }

  /* ---------- Թաքնված կենդանիներ (выглядывают из кустиков — успей коснуться) ---------- */
  const PEEK = [{ k: 'rabbit', e: '🐰' }, { k: 'cat', e: '🐱' }, { k: 'dog', e: '🐶' }, { k: 'frog', e: '🐸' }, { k: 'duck', e: '🐥' }, { k: 'pig', e: '🐷' }, { k: 'bear', e: '🐻' }]
  function peek(api) {
    const b = setup(api); b.style.background = 'linear-gradient(#cfeeff,#c9f0b0 60%)'
    const target = 10; let got = 0, ended = false
    const cnt = pill('👀 0 / ' + target); hud(api, cnt)
    const grid = el('div', { style: { position: 'absolute', inset: '70px 14px 80px', display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '14px', alignItems: 'end' } })
    const holes = Array.from({ length: 6 }, (_, i) => {
      const cell = el('div', { style: { position: 'relative', height: '100%', minHeight: '110px', overflow: 'hidden', borderRadius: '24px' } })
      const pop = el('button', { style: { position: 'absolute', left: '50%', bottom: '-90px', transform: 'translateX(-50%)', fontSize: 'min(16vw,84px)', background: 'none', transition: 'bottom .25s' } })
      const bush = el('div', { style: { position: 'absolute', left: 0, right: 0, bottom: 0, height: '46%', fontSize: 'min(18vw,96px)', textAlign: 'center', lineHeight: 1, pointerEvents: 'none' } }, i % 3 === 1 ? '🪨' : '🌳')
      cell.append(pop, bush); grid.append(cell)
      const h = { pop, up: false, a: null }
      pop.onclick = () => { if (!h.up || ended) return; h.up = false; G.animal(h.a.k); G.sfx('pop'); pop.textContent = '😄'; got++; cnt.textContent = '👀 ' + got + ' / ' + target
        if (got <= 10) G.speak(NUM[got]); setTimeout(() => { pop.style.bottom = '-90px' }, 350)
        if (got >= target) { ended = true; setTimeout(() => api.done({ stars: 3, text: 'Դու բոլորին գտար։ Պահմտոցի խաղի չեմպիոն ես։' }), 900) } }
      return h
    })
    b.append(grid)
    const speed = api.level === 'easy' ? 1700 : 1100
    const t = setInterval(() => {
      if (ended) return
      const free = holes.filter(h => !h.up); if (!free.length) return
      const h = pick(free); h.a = pick(PEEK); h.up = true; h.pop.textContent = h.a.e; h.pop.style.bottom = '30%'
      setTimeout(() => { if (h.up) { h.up = false; h.pop.style.bottom = '-90px' } }, speed)
    }, api.level === 'easy' ? 1200 : 800)
    api.ctx.onCleanup(() => clearInterval(t))
    instr(api, 'Կենդանիները թաքնվել են։ Սեղմի՛ր նրանց վրա, երբ դուրս նայեն։')
  }

  /* ---------- Գունավոր փուչիկներ (лопни шарики названного цвета) ---------- */
  const PCOL = [{ c: '#ff5a6e', q: 'Պայթեցրո՛ւ կարմիր փուչիկները։' }, { c: '#ffd23f', q: 'Պայթեցրո՛ւ դեղին փուչիկները։' }, { c: '#4d9bff', q: 'Պայթեցրո՛ւ կապույտ փուչիկները։' }, { c: '#5cc96a', q: 'Պայթեցրո՛ւ կանաչ փուչիկները։' }, { c: '#b07cff', q: 'Պայթեցրո՛ւ մանուշակագույն փուչիկները։' }]
  function colorpop(api) {
    const b = setup(api); b.style.background = 'linear-gradient(#cfe9ff,#fbe3f2)'
    const order = shuffle(PCOL).slice(0, 3); let ri_ = 0, need = 5, got = 0, ended = false
    const cnt = pill(''); hud(api, cnt)
    const objs = []
    function round() {
      if (ri_ >= order.length) { ended = true; return api.done({ stars: 3, text: 'Դու գիտես բոլոր գույները։ Ապրե՛ս։' }) }
      got = 0; const R = order[ri_]
      cnt.innerHTML = ''; cnt.append(el('span', { style: { display: 'inline-block', width: '20px', height: '20px', borderRadius: '50%', background: R.c, verticalAlign: 'middle', marginRight: '6px' } }), '0 / ' + need)
      instr(api, R.q)
    }
    const spawn = setInterval(() => {
      if (ended || objs.length > 9) return
      const R = order[ri_]; if (!R) return
      const c = Math.random() < .5 ? R.c : pick(PCOL).c, size = api.level === 'easy' ? 86 : 66
      const n = el('div', { style: { position: 'absolute', width: size + 'px', height: size * 1.18 + 'px', borderRadius: '50% 50% 46% 46%', background: `radial-gradient(circle at 34% 28%,#fff9 0 12%,${c} 40%)`, boxShadow: 'inset -6px -8px 0 #0002', cursor: 'pointer' } })
      const o = { n, c, x: Math.random() * Math.max(10, b.clientWidth - size - 20) + 10, y: b.clientHeight + 10, v: api.level === 'easy' ? 55 + Math.random() * 30 : 90 + Math.random() * 40 }
      n.onpointerdown = e => { e.stopPropagation(); if (o.dead || ended) return
        if (o.c === order[ri_].c) { o.dead = true; G.sfx('pop'); n.style.transition = 'transform .25s,opacity .25s'; n.style.transform = 'scale(1.6)'; n.style.opacity = '0'; got++
          cnt.lastChild.textContent = got + ' / ' + need; if (got <= 10) G.speak(NUM[got])
          if (got >= need) { G.sfx('win'); G.confetti(20); ri_++; setTimeout(round, 1200) } }
        else { G.sfx('soft'); n.animate([{ transform: 'rotate(-12deg)' }, { transform: 'rotate(12deg)' }, { transform: 'none' }], { duration: 400 }) } }
      b.append(n); objs.push(o)
    }, 650)
    let raf, last = performance.now()
    const loop = t => { const dt = Math.min(50, t - last) / 1000; last = t
      for (let i = objs.length - 1; i >= 0; i--) { const o = objs[i]; o.y -= o.v * dt; o.n.style.left = (o.x + Math.sin(o.y / 40) * 10) + 'px'; o.n.style.top = o.y + 'px'
        if (o.y < -130 || o.dead) { setTimeout(() => o.n.remove(), 260); objs.splice(i, 1) } }
      raf = requestAnimationFrame(loop) }
    raf = requestAnimationFrame(loop)
    api.ctx.onCleanup(() => { clearInterval(spawn); cancelAnimationFrame(raf) })
    round()
  }

  Object.assign(ENG, { sounds, dots, teeth, letters, peek, colorpop })
  const NEW = [
    { id: 'm_sounds', who: 'mane', emoji: '🐮', title: 'Ո՞վ է այսպես խոսում', desc: 'Կենդանիների ձայներ', engine: 'sounds', cfg: {} },
    { id: 'm_dots', who: 'mane', emoji: '✏️', title: 'Միացրո՛ւ կետերը', desc: 'Հաշվում ենք և նկարում', engine: 'dots', cfg: {} },
    { id: 'm_teeth', who: 'mane', emoji: '🦷', title: 'Փոքրիկ ատամնաբույժ', desc: 'Մաքրի՛ր ատամիկները', engine: 'teeth', cfg: {} },
    { id: 'm_letters', who: 'mane', emoji: '🔤', title: 'Տառերի խաղ', desc: 'Հայերեն տառեր և բառեր', engine: 'letters', cfg: {} },
    { id: 'm_feed', who: 'mane', emoji: '🥕', title: 'Կերակրի՛ր կենդանիներին', desc: 'Ո՞վ ինչ է ուտում', engine: 'sort', cfg: {
      bins: [{ key: 'r', label: 'Նապաստակ', color: '#ff9ecb', emoji: '🐰' }, { key: 'd', label: 'Շնիկ', color: '#c58a5a', emoji: '🐶' }, { key: 'c', label: 'Փիսիկ', color: '#ffad66', emoji: '🐱' }, { key: 'm', label: 'Կապիկ', color: '#8fe07c', emoji: '🐵' }],
      items: [['🥕', 'r'], ['🥬', 'r'], ['🦴', 'd'], ['🥩', 'd'], ['🐟', 'c'], ['🥛', 'c'], ['🍌', 'm'], ['🍑', 'm']].map(([e, key]) => ({ e, key })),
      count: { easy: 8, normal: 8, hard: 8 }, instr: 'Ամեն կենդանուն տո՛ւր իր սիրելի ուտելիքը։', hintWrong: 'Նա սա չի ուտում։ Փորձի՛ր մյուսին։', win: 'Բոլորը կուշտ են ու ուրախ։', bg: 'linear-gradient(#e9ffe0,#fff7d6)' } },
    { id: 'm_weather', who: 'mane', emoji: '☂️', title: 'Ի՞նչ հագնենք', desc: 'Արև, անձրև, ձյուն', engine: 'sort', cfg: {
      bins: [{ key: 's', label: 'Արև', color: '#f0bf2a', emoji: '☀️' }, { key: 'r', label: 'Անձրև', color: '#4d97e6', emoji: '🌧️' }, { key: 'w', label: 'Ձյուն', color: '#9ab8e8', emoji: '❄️' }],
      items: [['🕶️', 's'], ['👒', 's'], ['🩴', 's'], ['🩳', 's'], ['☂️', 'r'], ['🥾', 'r'], ['🧥', 'r'], ['🧣', 'w'], ['🧤', 'w'], ['🎿', 'w']].map(([e, key]) => ({ e, key })),
      count: { easy: 7, normal: 10, hard: 10 }, instr: 'Ի՞նչ ենք հագնում արևին, անձրևին և ձյունին։', hintWrong: 'Հը՛մ, սա այդ եղանակի համար չէ։', win: 'Հիմա պատրաստ ենք ցանկացած եղանակի։', bg: 'linear-gradient(#dff1ff,#fff7d6)' } },
  ]
  NEW.push(
    { id: 'm_peek', who: 'mane', emoji: '🐰', title: 'Թաքնված կենդանիներ', desc: 'Պահմտոցի', engine: 'peek', cfg: {} },
    { id: 'm_colorpop', who: 'mane', emoji: '🎈', title: 'Գունավոր փուչիկներ', desc: 'Սովորում ենք գույները', engine: 'colorpop', cfg: {} },
    { id: 'm_snowman', who: 'mane', emoji: '⛄', title: 'Ձնեմարդ կառուցենք', desc: 'Գնդեր, գլխարկ, գազար', engine: 'decorate', cfg: { scene: 'snowman', layers: { label: 'Ձնագնդեր (ներքևից վեր)', options: ['#ffffff', '#eef6ff', '#f3f0ff'], max: 3 },
      stickers: ['🥕', '🎩', '🧣', '🧤', '👀', '😊', '⭐', '❄️', '🌲', '🐦', '🧹', '🎀'], min: 6, instr: 'Կառուցի՛ր ձնեմարդը երեք գնդից և զարդարի՛ր։', win: 'Ձնեմարդը ժպտում է քեզ։', photoTitle: 'Մանեի ձնեմարդը' } })
  NEW.forEach(g => { GAMES.L.push(g); GAMES.byId[g.id] = g })
})()
