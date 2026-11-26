// @ts-nocheck
/* Режим «вдвоём на одном устройстве»: гонка шариков (экран пополам) и семейная викторина по очереди */
(function () {
  const { el, rand, ri, pick, shuffle } = G
  const face = w => G.HEROES[w].face

  function race(api) {
    const b = api.body; b.classList.add('noscroll'); b.style.position = 'relative'
    G.flag('duo')
    const goal = { mane: 12, anulik: 20 }, score = { mane: 0, anulik: 0 }; let over = false
    const halves = ['mane', 'anulik'].map((who, i) => {
      const h = el('div', { style: { position: 'absolute', top: 0, bottom: 0, left: i ? '50%' : 0, width: '50%', background: i ? 'linear-gradient(#e6d9ff,#f3e6ff)' : 'linear-gradient(#ffe6f3,#fff0f7)', borderLeft: i ? '4px dashed #fff' : 0, overflow: 'hidden', touchAction: 'none' } })
      const sc = el('div', { class: 'pill', style: { position: 'absolute', top: '8px', left: '50%', transform: 'translateX(-50%)', zIndex: 3 } }, face(who) + ' 0 / ' + goal[who])
      h.append(sc); b.append(h); return { who, h, sc, objs: [] }
    })
    b.append(el('div', { class: 'instr' }, 'Մանեին պետք է ' + goal.mane + ' փուչիկ (դրանք մեծ են ու դանդաղ), Անուլիկին՝ ' + goal.anulik + '։'))
    G.speak('Ձախից՝ Մանեն, աջից՝ Անուլիկը։ Ո՞վ առաջինը կպայթեցնի իր փուչիկները։')
    const spawn = setInterval(() => halves.forEach(H => {
      if (over) return; const kid = H.who === 'mane'
      const n = el('div', { class: 'sprite', style: { fontSize: (kid ? 76 : 50) + 'px', filter: `hue-rotate(${ri(0, 360)}deg)` } }, '🎈')
      const o = { n, x: rand(5, Math.max(10, H.h.clientWidth - 70)), y: H.h.clientHeight + 10, v: kid ? rand(60, 90) : rand(110, 170) }
      n.addEventListener('pointerdown', e => { e.stopPropagation(); if (o.dead || over) return; o.dead = true; G.sfx('pop'); n.classList.add('pop-out'); setTimeout(() => n.remove(), 300)
        score[H.who]++; H.sc.textContent = face(H.who) + ' ' + score[H.who] + ' / ' + goal[H.who]; if (score[H.who] >= goal[H.who]) win(H.who) })
      H.h.append(n); H.objs.push(o)
    }), 700)
    let raf, last = performance.now()
    const loop = t => { const dt = Math.min(50, t - last) / 1000; last = t; halves.forEach(H => { for (let i = H.objs.length - 1; i >= 0; i--) { const o = H.objs[i]; o.y -= o.v * dt; o.n.style.left = o.x + 'px'; o.n.style.top = o.y + 'px'; if (o.y < -100 || o.dead) { if (!o.dead) o.n.remove(); H.objs.splice(i, 1) } } }); raf = requestAnimationFrame(loop) }
    raf = requestAnimationFrame(loop)
    api.ctx.onCleanup(() => { clearInterval(spawn); cancelAnimationFrame(raf) })
    function win(who) { over = true; api.done({ stars: 3, title: '🏆 Հաղթեց ' + G.HEROES[who].name + '։', text: 'Հարություն՝ «Երկուսդ էլ կեցցե՛ք։ Գրկախառնություններով՝ ոչ-ոքի։»' }) }
  }

  function dquiz(api) {
    const b = api.body; b.classList.remove('noscroll'); G.flag('duo')
    const qs = { mane: shuffle(DATA.Q_EASY).slice(0, 5), anulik: shuffle(DATA.Q_HARD).slice(0, 5) }
    const score = { mane: 0, anulik: 0 }; let turn = 0
    const box = el('div', { class: 'center', style: { minHeight: '100%', padding: '10px' } }); b.append(box)
    function next() {
      box.innerHTML = ''
      if (turn >= 10) {
        const w = score.mane === score.anulik ? null : score.mane > score.anulik ? 'mane' : 'anulik'
        api.done({ stars: 3, title: w ? '🏆 Հաղթեց ' + G.HEROES[w].name + '։' : 'Ոչ-ոքի։', text: (w ? 'Բրավո, աղջիկնե՛ր։' : 'Ոչ-ոքի։ Երկուսդ էլ խելոքիկ եք։') + ' Մանե՝ ' + score.mane + ' · Անուլիկ՝ ' + score.anulik }); return
      }
      const who = turn % 2 ? 'anulik' : 'mane', q = qs[who][Math.floor(turn / 2)]
      box.append(el('div', { class: 'xrow', style: { justifyContent: 'center' } }, ...['mane', 'anulik'].map(h => el('div', { class: 'pill', style: { outline: h === who ? '4px solid #ff8fc5' : 'none' } }, G.HEROES[h].name + '՝ ' + score[h]))),
        el('div', { style: { fontSize: '64px' } }, face(who)), el('b', null, 'Պատասխանում է ' + (who === 'mane' ? 'Խաղացող 1՝ Մանե' : 'Խաղացող 2՝ Անուլիկ')),
        el('div', { style: { fontSize: '60px' } }, q.e), el('div', { class: 'card', style: { fontSize: '19px', fontWeight: 900 } }, q.q))
      const opts = el('div', { class: 'grid', style: { width: 'min(600px,100%)' } })
      shuffle(q.a.map((a, k) => ({ a, k }))).forEach(o => opts.append(el('button', { class: 'card', style: { fontSize: '17px', fontWeight: 900 }, onclick: e => {
        opts.style.pointerEvents = 'none'; const ok = o.k === 0; e.currentTarget.style.background = ok ? '#c3f4b0' : '#ffd0da'
        if (ok) { score[who]++; G.sfx('good') } else G.sfx('soft')
        G.speak(ok ? 'Ճիշտ է։' : 'Ճիշտ պատասխանը՝ ' + q.a[0]); turn++; setTimeout(next, 1500) } }, o.a)))
      box.append(opts); G.speak(q.q)
    }
    next()
  }
  Object.assign(ENG, { race, dquiz })
  GAMES.L.push(
    { id: 'duo_race', who: 'any', emoji: '🎈', title: 'Փուչիկների մրցավազք երկուսով', desc: 'Էկրանը կիսվում է', engine: 'race', cfg: {} },
    { id: 'duo_quiz', who: 'harut', emoji: '🧠', title: 'Ընտանեկան վիկտորինա', desc: 'Հարցեր փոքրիկի և դեռահասի համար', engine: 'dquiz', cfg: {} })
  GAMES.byId.duo_race = GAMES.L[GAMES.L.length - 2]; GAMES.byId.duo_quiz = GAMES.L[GAMES.L.length - 1]
})()
