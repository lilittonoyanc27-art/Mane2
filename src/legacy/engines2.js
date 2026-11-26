// @ts-nocheck
/* Перенесено из 2D-версии (ветка 2d-version), тексты — на армянском. */
/* ===== Движки мини-игр (часть 2): симуляторы и головоломки — в основном для Анулик ===== */
(function () {
  const { el, rand, ri, pick, shuffle, clamp } = G;
  const H = ENG.helpers, { setup, pill, hud, instr, loop, every, keys, floatText, lv } = H;

  /* ===================== PHOTO: симулятор фотографа ===================== */
  function photo(api) {
    const b = setup(api), cfg = api.cfg;
    const targets = shuffle(cfg.targets).slice(0, lv(api, { easy: 3, normal: 4, hard: 5 }));
    const shotsLeft = { n: targets.length + lv(api, { easy: 6, normal: 4, hard: 2 }) };
    const done = new Set(); let quality = 0;
    b.style.background = cfg.bg || 'linear-gradient(#bfe6ff,#c3f4b0 65%)';
    const subjects = [];
    const all = shuffle([...targets, ...targets, ...(cfg.extras || [])]);
    all.forEach(e => {
      const n = el('div', { style: { position: 'absolute', fontSize: (cfg.size || 54) + 'px', pointerEvents: 'none', transition: 'none' } }, e);
      b.append(n); subjects.push({ n, e, x: rand(40, 600), y: rand(120, 500), vx: rand(-60, 60), vy: rand(-30, 30) * (cfg.fly ? 1.5 : .6) });
    });
    let fw = lv(api, { easy: 220, normal: 180, hard: 150 });
    const frame = el('div', { style: { position: 'absolute', width: fw + 'px', height: fw * .75 + 'px', border: '4px solid #fff', borderRadius: '14px', boxShadow: '0 0 0 2000px #0003', zIndex: 10, pointerEvents: 'none', transform: 'translate(-50%,-50%)', left: '50%', top: '50%' } },
      el('div', { style: { position: 'absolute', left: '50%', top: '50%', width: '20px', height: '20px', margin: '-10px', border: '2px solid #fff', borderRadius: '50%' } }));
    b.append(frame);
    let fx = 0, fy = 0; const setF = (x, y) => { fx = clamp(x, fw / 2, b.clientWidth - fw / 2); fy = clamp(y, fw * .375 + 50, b.clientHeight - fw * .375 - 60); frame.style.left = fx + 'px'; frame.style.top = fy + 'px'; };
    requestAnimationFrame(() => setF(b.clientWidth / 2, b.clientHeight / 2));
    b.addEventListener('pointermove', e => { const r = b.getBoundingClientRect(); setF(e.clientX - r.left, e.clientY - r.top); });
    b.addEventListener('pointerdown', e => { if (e.target.closest('button')) return; const r = b.getBoundingClientRect(); setF(e.clientX - r.left, e.clientY - r.top); });
    keys(api, e => { const s = 24; if (e.key === 'ArrowLeft') setF(fx - s, fy); if (e.key === 'ArrowRight') setF(fx + s, fy); if (e.key === 'ArrowUp') setF(fx, fy - s); if (e.key === 'ArrowDown') setF(fx, fy + s); if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); shoot(); } });
    const list = pill(''); const shotsPill = pill(''); hud(api, list, shotsPill);
    const upd = () => { list.textContent = 'Նպատակներ՝ ' + targets.map(t => (done.has(t) ? '✅' : '') + t).join(' '); shotsPill.textContent = '🎞️ ' + shotsLeft.n; };
    upd();
    const zoom = d => { fw = clamp(fw + d, 110, 280); frame.style.width = fw + 'px'; frame.style.height = fw * .75 + 'px'; setF(fx, fy); G.sfx('click'); };
    b.append(el('div', { style: { position: 'absolute', right: '10px', bottom: '80px', display: 'flex', flexDirection: 'column', gap: '8px', zIndex: 22 } },
      el('button', { class: 'icon-btn', onclick: () => zoom(-30) }, '🔍'), el('button', { class: 'icon-btn', onclick: () => zoom(30) }, '🔭'),
      el('button', { class: 'orb', style: { '--s': '84px' }, onclick: e => { e.stopPropagation(); shoot(); } }, '📸')));
    loop(api, dt => {
      const W = b.clientWidth, Hh = b.clientHeight;
      subjects.forEach(s => { s.x += s.vx * dt * (api.level === 'easy' ? .6 : 1); s.y += s.vy * dt;
        if (s.x < 0 || s.x > W - 60) { s.vx *= -1; s.x = clamp(s.x, 0, W - 60); s.n.style.transform = s.vx < 0 ? '' : 'scaleX(-1)'; }
        if (s.y < 90 || s.y > Hh - 140) { s.vy *= -1; s.y = clamp(s.y, 90, Hh - 140); }
        if (Math.random() < .005) s.vx = rand(-70, 70);
        s.n.style.left = s.x + 'px'; s.n.style.top = s.y + 'px'; });
    });
    function shoot() {
      if (shotsLeft.n <= 0) return;
      shotsLeft.n--; G.sfx('camera');
      const flash = el('div', { style: { position: 'absolute', inset: 0, background: '#fff', zIndex: 30, pointerEvents: 'none' } }); b.append(flash); flash.animate([{ opacity: .9 }, { opacity: 0 }], { duration: 350 }).onfinish = () => flash.remove();
      const fs = cfg.size || 54;
      const inFrame = subjects.map(s => ({ s, cx: s.x + fs / 2, cy: s.y + fs / 2 })).filter(o => Math.abs(o.cx - fx) < fw / 2 - 10 && Math.abs(o.cy - fy) < fw * .375 - 10);
      const best = inFrame.filter(o => targets.includes(o.s.e) && !done.has(o.s.e)).sort((a, b) => Math.hypot(a.cx - fx, a.cy - fy) - Math.hypot(b.cx - fx, b.cy - fy))[0];
      const compo = inFrame.map(o => `<span style="position:absolute;left:${(o.cx - (fx - fw / 2)) / fw * 100}%;top:${(o.cy - (fy - fw * .375)) / (fw * .75) * 100}%;transform:translate(-50%,-50%);font-size:${fs / fw * 100 * 1.2}cqw">${o.s.e}</span>`).join('');
      const photoHtml = `<div style="position:relative;width:100%;height:100%;container-type:inline-size;background:${(cfg.bg || 'linear-gradient(#bfe6ff,#c3f4b0 65%)').replace(/"/g, "'")};overflow:hidden">${compo}</div>`;
      if (best) {
        const dist = Math.hypot(best.cx - fx, best.cy - fy) / (fw / 2);
        const q = Math.round((1 - dist) * 70 + (280 - fw) / 170 * 30);
        quality += q; done.add(best.s.e); G.sfx('good');
        G.toast(q > 70 ? '🌟 Գլուխգործոց։ Հիանալի կոմպոզիցիա' : q > 45 ? '👍 Լավ կադր' : '🙂 Վատ չէ՝ կենտրոնում ավելի լավ կլիներ');
        G.addPhoto({ title: (cfg.place || 'Լուսանկար') + ': ' + best.s.e, kind: 'html', data: photoHtml });
      } else G.toast(inFrame.length ? 'Սա նպատակը չէ, բայց լուսանկարը սիրուն է։' : 'Կադրը դատարկ է՝ շրջանակը ուղղի՛ր նպատակին');
      upd();
      if (done.size === targets.length) return setTimeout(() => api.done({ stars: quality / targets.length > 60 ? 3 : quality / targets.length > 35 ? 2 : 1, text: 'Ֆոտոշարքը հաջողվեց։ Կադրերի միջին գնահատականը՝ ' + Math.round(quality / targets.length) + '/100' }), 500);
      if (shotsLeft.n <= 0) setTimeout(() => api.done({ stars: 1, text: 'Ժապավենը վերջացավ։ Նկարված նպատակներ՝ ' + done.size + ' / ' + targets.length + '։ Էլի փորձի՛ր։' }), 500);
    }
    instr(api, 'Շրջանակը ուղղի՛ր նպատակներին (մկնիկ/մատ/սլաքներ) և սեղմի՛ր 📸 (կամ Բացատ)։ 🔍՝ մոտեցնել');
  }

  /* ===================== DETECTIVE: добрые расследования ===================== */
  function detective(api) {
    const b = setup(api);
    const cases = api.cfg.cases || DATA.CASES;
    const cs = api.cfg.caseIndex != null ? cases[api.cfg.caseIndex] : pick(cases);
    const found = new Set(); let wrong = 0;
    b.style.background = cs.bg || 'linear-gradient(#f3e6ff,#e8c9a0 65%)';
    const scene = el('div', { style: { position: 'absolute', inset: '56px 0 70px', } });
    const note = el('div', { class: 'panel', style: { position: 'absolute', right: '8px', top: '8px', width: 'min(300px,48vw)', maxHeight: 'calc(100% - 150px)', zIndex: 21, padding: '10px' } });
    cs.spots.forEach(s => {
      const n = el('button', { class: 'hot', style: { left: s.x + '%', top: s.y + '%', background: 'none' } }, s.e);
      n.onclick = () => {
        G.sfx(found.has(s) ? 'tap' : 'magic'); n.classList.add('wiggle'); setTimeout(() => n.classList.remove('wiggle'), 500);
        if (!found.has(s)) { found.add(s); drawNote(); }
        G.say([{ who: 'anulik', text: '🔍 ' + s.clue }], { host: b });
      };
      scene.append(n);
    });
    function drawNote() {
      note.innerHTML = '';
      note.append(el('b', null, '🗒️ Խուզարկուի տետր'), el('div', { style: { fontSize: '13px', fontWeight: 700, margin: '4px 0' } }, cs.intro));
      cs.spots.forEach(s => note.append(el('div', { style: { fontSize: '13px', fontWeight: 800, margin: '3px 0', color: found.has(s) ? 'var(--ink2)' : '#bbb' } }, found.has(s) ? '✔ ' + s.short : '… հետքը գտնված չէ')));
      const need = Math.min(cs.spots.length, lv(api, { easy: 2, normal: 3, hard: cs.spots.length }));
      const btn = el('button', { class: 'btn purple small', style: { width: '100%', marginTop: '8px' }, onclick: accuse }, '⚖️ Անվանել մեղավորին (' + found.size + '/' + need + ')');
      btn.disabled = found.size < need; note.append(btn);
    }
    function accuse() {
      const m = G.modal(el('div', null, el('h3', null, 'Ո՞վ արեց սա։'), el('p', null, cs.question),
        el('div', { class: 'grid' }, ...cs.suspects.map((s, i) => el('button', { class: 'card', onclick: () => { m.close(); judge(i); } }, el('span', { class: 'em' }, s.e), el('b', null, s.name), el('small', null, s.desc))))));
    }
    function judge(i) {
      if (i === cs.culprit) { G.say([{ who: 'anulik', text: cs.solution }, { who: 'harut', text: 'Բրավո, խուզարկու Անուլիկ։ Գործը բացահայտված է։' }], { host: b }).then(() => api.done({ stars: wrong === 0 ? 3 : wrong === 1 ? 2 : 1, text: '«' + cs.title + '» գործը բացահայտված է։' })); G.sfx('win'); }
      else { wrong++; G.sfx('oops'); G.say([{ who: 'mane', text: pick(['Ոչ-ոչ, ' + cs.suspects[i].name + ' ալիբի ունի։', 'Հը՛մ, սա չի համապատասխանում հետքերին։ Նայի՛ր տետրը։']) }], { host: b }); }
    }
    b.append(scene, note); drawNote();
    hud(api, pill('🕵️‍♀️ ' + cs.title));
    G.say([{ who: 'anulik', text: cs.intro }], { host: b });
  }

  /* ===================== MANAGE: кафе, кондитерская, магазин, кухня ===================== */
  function manage(api) {
    const b = setup(api), cfg = api.cfg;
    const goal = lv(api, { easy: 5, normal: 7, hard: 10 });
    const patienceSec = lv(api, { easy: 999, normal: 40, hard: 24 });
    let served = 0, coins = 0, lost = 0, plate = [];
    b.style.background = cfg.bg || 'linear-gradient(#ffe9f3,#ffd6b0)';
    const counterRow = el('div', { style: { position: 'absolute', left: '8px', right: '8px', top: '58px', height: '38%', display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '8px' } });
    const seats = [null, null, null];
    const seatEls = seats.map((_, i) => { const s = el('button', { class: 'card', style: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '6px' }, onclick: () => serve(i) }); counterRow.append(s); return s; });
    const plateEl = el('div', { class: 'xtray', style: { position: 'absolute', left: '8px', right: '8px', top: 'calc(38% + 66px)', minHeight: '70px', alignItems: 'center', justifyContent: 'center' } });
    const ingEl = el('div', { style: { position: 'absolute', left: '8px', right: '8px', bottom: '66px', top: 'calc(38% + 146px)', display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(70px,1fr))', gap: '6px', alignContent: 'start', overflow: 'auto' } });
    b.append(counterRow, plateEl, ingEl);
    cfg.ingredients.forEach(i => ingEl.append(el('button', { class: 'card', style: { padding: '4px', fontSize: '38px' }, onclick: () => { if (plate.length >= 5) return; plate.push(i); G.sfx('click'); drawPlate(); } }, i)));
    function drawPlate() { plateEl.innerHTML = ''; plateEl.append(el('span', { style: { fontSize: '34px' } }, cfg.plate || '🍽️'), ...plate.map(p => el('span', { style: { fontSize: '36px' } }, p)),
      el('button', { class: 'btn white small', style: { marginLeft: 'auto' }, onclick: () => { plate = []; drawPlate(); G.sfx('whoosh'); } }, '🗑️'),
      el('button', { class: 'btn yellow small', onclick: book }, '📖 Բաղադրատոմսեր')); }
    function book() {
      G.modal(el('div', null, el('h3', null, '📖 Բաղադրատոմսերի գիրք'), ...cfg.menu.map(m => el('div', { class: 'list-item' }, el('span', { class: 'em' }, m.e), el('span', null, m.name + ': ' + m.recipe.join(' + '))))));
    }
    const hudCoins = pill('🪙 0'), hudServed = pill('😊 0 / ' + goal); hud(api, hudServed, hudCoins);
    function spawn() {
      const i = seats.findIndex(s => !s); if (i < 0) return;
      const dish = pick(cfg.menu);
      seats[i] = { who: pick(cfg.customers), dish, t: patienceSec };
      drawSeat(i);
    }
    function drawSeat(i) {
      const s = seats[i], e = seatEls[i]; e.innerHTML = '';
      if (!s) { e.append(el('span', { style: { fontSize: '30px', opacity: .3 } }, '🪑')); return; }
      e.append(el('span', { style: { fontSize: 'clamp(40px,7vw,64px)' } }, s.who),
        el('div', { style: { background: '#fff', borderRadius: '14px', padding: '2px 8px', fontWeight: 900, boxShadow: '0 2px 0 #eee' } }, s.dish.e + ' ' + s.dish.name),
        api.level === 'easy' ? el('small', null, s.dish.recipe.join('')) : null,
        patienceSec < 999 ? el('div', { class: 'meter', style: { width: '80%', marginTop: '4px' } }, el('i', { style: { width: (s.t / patienceSec * 100) + '%', background: s.t / patienceSec < .3 ? '#ff6b8a' : '' } })) : null);
    }
    function serve(i) {
      const s = seats[i]; if (!s || !plate.length) { if (s) G.toast('Նախ պատվերը հավաքի՛ր ափսեի մեջ'); return; }
      const ok = plate.length === s.dish.recipe.length && [...plate].sort().join() === [...s.dish.recipe].sort().join();
      if (ok) {
        const tip = patienceSec < 999 ? Math.round(s.t / patienceSec * 5) : 3; const earn = (s.dish.price || 10) + tip;
        coins += earn; served++; G.sfx('coin'); floatText(b, seatEls[i].offsetLeft + 30, 80, '+' + earn + '🪙'); seatEls[i].animate([{ transform: 'scale(1.1)' }, { transform: 'none' }], { duration: 300 });
        hudCoins.textContent = '🪙 ' + coins; hudServed.textContent = '😊 ' + served + ' / ' + goal; seats[i] = null; plate = []; drawPlate(); drawSeat(i);
        if (served >= goal) { finish(); return; }
      } else { G.sfx('oops'); G.toast(s.who + ' ՝ «Սա այն չէ, ինչ պատվիրել էի…»'); plate = []; drawPlate(); }
    }
    function finish() { api.done({ stars: lost === 0 ? 3 : lost <= 2 ? 2 : 1, coins, text: cfg.win || ('Աշխատանքային օրն ավարտվեց։ Գոհ հյուրեր՝ ' + served + ', վաստակված՝ ' + coins + ' 🪙') }); stop(); }
    const stop = every(api, 1000, () => {
      if (Math.random() < .55) spawn();
      seats.forEach((s, i) => { if (!s) return; if (patienceSec < 999) { s.t--; if (s.t <= 0) { seats[i] = null; lost++; G.sfx('soft'); G.toast('Հյուրը չսպասեց 😕'); } } drawSeat(i); });
    });
    seats.forEach((_, i) => drawSeat(i)); spawn(); drawPlate();
    instr(api, 'Հավաքի՛ր պատվերը բաղադրիչներից և սեղմի՛ր հյուրի վրա, որ մատուցես');
  }

  /* ===================== PLANNER: путешествия, концерт, праздник, бюджет ===================== */
  function planner(api) {
    const b = setup(api), cfg = api.cfg; b.classList.remove('noscroll'); b.style.overflow = 'auto'; b.style.padding = '8px 12px 90px';
    const choice = {};
    const head = el('div', { class: 'list-item', style: { background: '#fff7d6', position: 'sticky', top: 0, zIndex: 5 } });
    b.append(el('div', { class: 'list-item', style: { background: '#f3e6ff' } }, el('span', { class: 'em' }, cfg.emoji || '📋'), el('span', null, cfg.brief)), head);
    cfg.categories.forEach((c, ci) => {
      b.append(el('div', { class: 'section-title' }, c.emoji + ' ' + c.name));
      const g = el('div', { class: 'grid' });
      c.options.forEach(o => {
        const card = el('button', { class: 'card', style: { padding: '10px' } }, el('span', { class: 'em', style: { fontSize: '36px' } }, o.e), el('b', null, o.name), el('small', null, '💰 ' + o.cost + ' · ' + '⭐'.repeat(o.fun)), o.note ? el('small', null, o.note) : null);
        card.onclick = () => { choice[ci] = o; G.sfx('tap'); [...g.children].forEach(x => x.style.borderColor = '#fff'); card.style.borderColor = 'var(--pink)'; upd(); };
        g.append(card);
      });
      b.append(g);
    });
    const go = el('button', { class: 'btn green', style: { margin: '18px auto', display: 'block' }, onclick: check }, '✅ Հաստատել ծրագիրը');
    b.append(go);
    function totals() { const v = Object.values(choice); return { cost: v.reduce((a, o) => a + o.cost, 0), fun: v.reduce((a, o) => a + o.fun, 0), tags: v.flatMap(o => o.tags || []) }; }
    function upd() { const t = totals(); head.innerHTML = ''; head.append(el('span', { class: 'em' }, '💳'), el('span', null, 'Ծախսված՝ ' + t.cost + ' / ' + cfg.budget + '   ·   Տպավորություններ՝ ' + t.fun + ' (պետք է ≥ ' + cfg.minFun + ')'));
      head.style.background = t.cost > cfg.budget ? '#ffe6ea' : '#e6ffe0'; }
    upd();
    function check() {
      if (Object.keys(choice).length < cfg.categories.length) { G.toast('Ընտրի՛ր տարբերակ յուրաքանչյուր բաժնում'); G.sfx('soft'); return; }
      const t = totals(); const problems = [];
      if (t.cost > cfg.budget) problems.push('բյուջեն գերազանցված է ' + (t.cost - cfg.budget));
      if (t.fun < cfg.minFun) problems.push('քիչ տպավորություններ՝ հյուրերը կձանձրանան');
      (cfg.must || []).forEach(m => { if (!t.tags.includes(m.tag)) problems.push(m.text); });
      if (problems.length) { G.sfx('oops'); G.say([{ who: 'harut', text: 'Հը՛մ, Անուլիկ, նայի՛ր՝ ' + problems.join('; ') + '.' }], { host: b }); return; }
      const left = cfg.budget - t.cost;
      api.done({ stars: t.fun >= cfg.minFun + 3 ? 3 : 2, coins: Math.round(left / 10), text: (cfg.win || 'Ծրագիրը հաստատված է։') + ' Մնաց ' + left + ' ՝ հիանալի խնայողություն։' });
    }
    G.speak(cfg.brief, api.who);
  }

  /* ===================== ALLOCATE: управление бюджетом ===================== */
  function allocate(api) {
    const b = setup(api), cfg = api.cfg; b.classList.remove('noscroll'); b.style.overflow = 'auto'; b.style.padding = '8px 14px 90px';
    const income = cfg.income, step = cfg.step || 50;
    const val = cfg.items.map(() => 0);
    const head = el('div', { class: 'list-item', style: { position: 'sticky', top: 0, zIndex: 5 } });
    b.append(el('div', { class: 'list-item', style: { background: '#f3e6ff' } }, el('span', { class: 'em' }, '💼'), el('span', null, cfg.brief)), head);
    const rows = cfg.items.map((it, i) => {
      const v = el('b', { style: { minWidth: '70px', textAlign: 'right' } }, '0');
      const r = el('div', { class: 'list-item' }, el('span', { class: 'em' }, it.e), el('div', { style: { flex: 1 } }, el('div', null, it.name), el('small', { style: { color: 'var(--muted)' } }, it.min ? 'առնվազն ' + it.min : it.goal ? 'նպատակ ' + it.goal : 'ցանկությամբ')),
        el('button', { class: 'icon-btn', onclick: () => ch(i, -step) }, '➖'), v, el('button', { class: 'icon-btn', onclick: () => ch(i, step) }, '➕'));
      r._v = v; b.append(r); return r;
    });
    function ch(i, d) { const sum = val.reduce((a, c) => a + c, 0); if (d > 0 && sum + d > income) { G.sfx('soft'); G.toast('Փող այլևս չկա։'); return; } val[i] = Math.max(0, val[i] + d); G.sfx('coin'); upd(); }
    function upd() { const sum = val.reduce((a, c) => a + c, 0); head.innerHTML = ''; head.append(el('span', { class: 'em' }, '💳'), el('span', null, 'Բաշխված է ' + sum + ' / ' + income + ' ֏'));
      rows.forEach((r, i) => { r._v.textContent = val[i]; const it = cfg.items[i]; r.classList.toggle('ok', (it.min && val[i] >= it.min) || (it.goal && val[i] >= it.goal)); }); }
    upd();
    b.append(el('button', { class: 'btn green', style: { display: 'block', margin: '14px auto' }, onclick: () => {
      const miss = cfg.items.filter((it, i) => it.min && val[i] < it.min);
      if (miss.length) { G.say([{ who: 'harut', text: 'Փողը չի բավականացնում՝ ' + miss.map(m => m.name).join(', ') + '։ Պարտադիր ծախսերը՝ առաջին հերթին։' }], { host: b }); return; }
      const goalOk = cfg.items.every((it, i) => !it.goal || val[i] >= it.goal);
      const unspent = income - val.reduce((a, c) => a + c, 0);
      api.done({ stars: goalOk ? 3 : 2, text: goalOk ? 'Հիանալի ֆինանսական ծրագիր։ Խնայատուփը մեծանում է, ամեն ինչ վճարված է։' + (unspent ? ' Եվս ' + unspent + ' պահուստում։' : '') : 'Ծախսերը ծածկված են, բայց խնայողության նպատակը դեռ չի հասել։' });
    } }, '✅ Պահպանել բյուջեն'));
    G.speak(cfg.brief, api.who);
  }

  /* ===================== SEQUENCE: видеомонтаж, рецепты, сборка ракеты ===================== */
  function sequence(api) {
    const b = setup(api), cfg = api.cfg; b.classList.remove('noscroll'); b.style.overflow = 'auto'; b.style.padding = '8px 14px 90px';
    const set = cfg.sets ? pick(cfg.sets) : cfg;
    let order = shuffle(set.steps.map((s, i) => i)); if (order.every((v, i) => v === i)) order.reverse();
    let tries = 0, sel = null, t = cfg.timer ? lv(api, cfg.timer) : 0;
    b.append(el('div', { class: 'list-item', style: { background: '#f3e6ff' } }, el('span', { class: 'em' }, set.emoji || '🎬'), el('span', null, set.title)));
    const timerPill = t ? pill('⏱️ ' + t) : null; if (timerPill) hud(api, timerPill);
    const listEl = el('div'); b.append(listEl);
    function draw(marks) {
      listEl.innerHTML = '';
      order.forEach((si, pos) => {
        const s = set.steps[si];
        const row = el('div', { class: 'list-item' + (marks ? (si === pos ? ' ok' : ' bad') : ''), style: { outline: sel === pos ? '4px solid var(--pink)' : 'none', cursor: 'pointer' } },
          el('b', { style: { width: '26px' } }, (pos + 1) + '.'), el('span', { class: 'em' }, s.e), el('span', { style: { flex: 1 } }, s.text),
          el('button', { class: 'icon-btn', style: { width: '42px', height: '42px', fontSize: '18px' }, onclick: ev => { ev.stopPropagation(); mv(pos, -1); } }, '⬆️'),
          el('button', { class: 'icon-btn', style: { width: '42px', height: '42px', fontSize: '18px' }, onclick: ev => { ev.stopPropagation(); mv(pos, 1); } }, '⬇️'));
        row.onclick = () => { if (sel === null) { sel = pos; } else { [order[sel], order[pos]] = [order[pos], order[sel]]; sel = null; G.sfx('click'); } draw(); };
        listEl.append(row);
      });
    }
    function mv(p, d) { const q = p + d; if (q < 0 || q >= order.length) return; [order[p], order[q]] = [order[q], order[p]]; G.sfx('click'); sel = null; draw(); }
    b.append(el('button', { class: 'btn green', style: { display: 'block', margin: '14px auto' }, onclick: () => {
      tries++; const ok = order.every((v, i) => v === i); draw(true);
      if (ok) { G.sfx('win'); api.done({ stars: tries === 1 ? 3 : tries <= 3 ? 2 : 1, text: set.win || 'Ամեն ինչ իր հերթով՝ կատարյալ։', photo: cfg.photoTitle ? { title: cfg.photoTitle + ': ' + set.title, kind: 'html', data: `<div style="display:flex;flex-wrap:wrap;gap:4px;padding:6px;font-size:28px;background:#2a2240;height:100%;align-content:center;justify-content:center">${set.steps.map(s => `<span style="background:#fff;border-radius:8px;padding:4px">${s.e}</span>`).join('')}</div>` } : null }); }
      else { G.sfx('oops'); const right = order.filter((v, i) => v === i).length; G.toast('Իրենց տեղերում են՝ ' + right + ' / ' + order.length); }
    } }, '✅ Ստուգել'));
    if (t) every(api, 1000, () => { t--; if (timerPill) timerPill.textContent = '⏱️ ' + Math.max(0, t); if (t === 0) { G.toast('⏰ Ժամանակը։ Բայց կարելի է հանգիստ ավարտել'); } });
    draw();
    G.speak(cfg.instr || 'Դասավորի՛ր քայլերը ճիշտ հերթականությամբ', api.who);
  }

  /* ===================== LOGIC: фонарики и мини-судоку ===================== */
  function logic(api) {
    const b = setup(api);
    const tabs = el('div', { class: 'tabs', style: { position: 'absolute', top: '6px', left: 0, right: 0, justifyContent: 'center', zIndex: 21 } });
    const area = el('div', { style: { position: 'absolute', inset: '64px 8px 70px', display: 'grid', placeItems: 'center' } });
    b.append(tabs, area);
    const solved = new Set();
    const games = { lights: '💡 Լապտերիկներ', sudoku: '🧩 Սուդոկու', bridges: '🔢 Կախարդական քառակուսի' };
    for (const k in games) tabs.append(el('button', { class: 'tab', onclick: e => { tabs.querySelectorAll('.tab').forEach(t => t.classList.remove('on')); e.currentTarget.classList.add('on'); start(k); } }, games[k]));
    function win(k) { if (solved.has(k)) return; solved.add(k); G.sfx('win'); G.confetti(30); G.toast('Լուծված է։ (' + solved.size + '/3)'); if (solved.size >= (api.level === 'easy' ? 1 : 2)) setTimeout(() => api.done({ stars: solved.size === 3 ? 3 : 2, text: 'Գլուխկոտրուկները լուծված են։ Սուր միտք։' }), 700); }
    function start(k) {
      area.innerHTML = '';
      if (k === 'lights') {
        const n = lv(api, { easy: 3, normal: 4, hard: 5 }); const g = Array(n * n).fill(1);
        const flip = (i, rec) => { const x = i % n, y = Math.floor(i / n); [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dx, dy]) => { const X = x + dx, Y = y + dy; if (X >= 0 && Y >= 0 && X < n && Y < n) g[Y * n + X] ^= 1; }); };
        for (let i = 0; i < n * 2; i++) flip(ri(0, n * n - 1));
        if (g.every(v => v)) flip(0);
        const grid = el('div', { class: 'cell-grid', style: { gridTemplateColumns: `repeat(${n},1fr)`, width: 'min(80vw,calc(100vh - 260px),420px)' } });
        const draw = () => { grid.innerHTML = ''; g.forEach((v, i) => grid.append(el('button', { style: { aspectRatio: 1, borderRadius: '18px', fontSize: '34px', background: v ? '#ffe58f' : '#3a3550', boxShadow: v ? '0 0 20px #ffd45a' : 'none' }, onclick: () => { flip(i); G.sfx('click'); draw(); if (g.every(Boolean)) win(k); } }, v ? '💡' : ''))); };
        draw(); area.append(el('div', { class: 'center' }, el('b', null, 'Վառի՛ր բոլոր լապտերիկները։ Սեղմելը փոխում է լամպը և հարևաններին։'), grid));
      }
      if (k === 'sudoku') {
        const sym = ['🍓', '🍋', '🫐', '🍏'];
        const base = [[0, 1, 2, 3], [2, 3, 0, 1], [1, 0, 3, 2], [3, 2, 1, 0]];
        const perm = shuffle([0, 1, 2, 3]); const sol = base.map(r => r.map(v => perm[v]));
        if (Math.random() < .5) sol.reverse();
        const holes = new Set(shuffle([...Array(16).keys()]).slice(0, lv(api, { easy: 5, normal: 8, hard: 10 })));
        const cur = sol.flat().map((v, i) => holes.has(i) ? -1 : v);
        const grid = el('div', { class: 'cell-grid', style: { gridTemplateColumns: 'repeat(4,1fr)', width: 'min(80vw,calc(100vh - 260px),380px)', gap: '4px' } });
        const draw = () => { grid.innerHTML = ''; cur.forEach((v, i) => { const x = i % 4, y = Math.floor(i / 4);
          grid.append(el('button', { style: { aspectRatio: 1, borderRadius: '12px', fontSize: '34px', background: holes.has(i) ? '#fff' : '#f3e6ff', marginRight: x === 1 ? '6px' : 0, marginBottom: y === 1 ? '6px' : 0 },
            onclick: () => { if (!holes.has(i)) return; cur[i] = (cur[i] + 1) % 5 === 4 ? -1 : cur[i] + 1; G.sfx('tap'); draw(); if (cur.every((v, j) => v === sol.flat()[j])) win(k); } }, v >= 0 ? sym[v] : '')); }); };
        draw(); area.append(el('div', { class: 'center' }, el('b', null, 'Ամեն տողում, սյունակում և 2×2 քառակուսում՝ բոլոր 4 մրգերը։ Սեղմի՛ր դատարկ վանդակներին։'), grid));
      }
      if (k === 'bridges') {
        // магический квадрат 3×3: суммы строк/столбцов = 15
        const sol = pick([[2, 7, 6, 9, 5, 1, 4, 3, 8], [4, 9, 2, 3, 5, 7, 8, 1, 6], [6, 1, 8, 7, 5, 3, 2, 9, 4], [8, 3, 4, 1, 5, 9, 6, 7, 2]]);
        const holes = new Set(shuffle([0, 1, 2, 3, 5, 6, 7, 8]).slice(0, lv(api, { easy: 2, normal: 4, hard: 6 })));
        const cur = sol.map((v, i) => holes.has(i) ? 0 : v);
        const grid = el('div', { class: 'cell-grid', style: { gridTemplateColumns: 'repeat(3,1fr)', width: 'min(70vw,calc(100vh - 280px),320px)' } });
        const draw = () => { grid.innerHTML = ''; cur.forEach((v, i) => grid.append(el('button', { style: { aspectRatio: 1, borderRadius: '16px', fontSize: '40px', fontWeight: 900, background: holes.has(i) ? '#fff' : '#ffe6f3', color: 'var(--ink)' },
          onclick: () => { if (!holes.has(i)) return; cur[i] = cur[i] % 9 + 1; G.sfx('tap'); draw(); const rows = [0, 1, 2].every(r => cur[r * 3] + cur[r * 3 + 1] + cur[r * 3 + 2] === 15), cols = [0, 1, 2].every(c => cur[c] + cur[c + 3] + cur[c + 6] === 15);
            if (rows && cols && new Set(cur).size === 9) win(k); } }, v || ''))); };
        draw(); area.append(el('div', { class: 'center' }, el('b', null, '1–9 թվերը՝ առանց կրկնության։ Ամեն տողի և սյունակի գումարը = 15։ Սեղմի՛ր, որ թիվը փոխես։'), grid));
      }
    }
    tabs.firstChild.click();
    G.speak('Վերևից ընտրի՛ր գլուխկոտրուկը', api.who);
  }

  /* ===================== CIPHER: квесты с секретными кодами ===================== */
  function cipher(api) {
    const b = setup(api), cfg = api.cfg;
    const rounds = shuffle(cfg.puzzles || DATA.CIPHERS).slice(0, lv(api, { easy: 1, normal: 2, hard: 3 }));
    let r = 0, hints = 0;
    const box = el('div', { style: { position: 'absolute', inset: '60px 10px 70px', overflow: 'auto' } }); b.append(box);
    const cnt = pill(''); hud(api, cnt);
    function next() {
      if (r >= rounds.length) return api.done({ stars: hints === 0 ? 3 : hints <= 2 ? 2 : 1, text: cfg.win || 'Բոլոր ծածկագրերը լուծված են։ Գաղտնիքը բացահայտված է։' });
      const p = rounds[r]; cnt.textContent = '🔐 ' + (r + 1) + ' / ' + rounds.length; box.innerHTML = '';
      const word = p.answer.toUpperCase();
      let typed = '';
      if (p.type === 'symbol') {
        const letters = [...new Set(word.replace(/ /g, ''))];
        const syms = shuffle(['🌙', '⭐', '🍀', '🔺', '🔷', '❤️', '🌸', '⚡', '🍄', '🐚', '🎈', '🔔', '🍭', '☂️', '🦋', '🧩']);
        const map = {}; letters.forEach((l, i) => map[l] = syms[i]);
        const shown = shuffle(letters).slice(0, Math.max(1, letters.length - lv(api, { easy: 0, normal: 1, hard: 2 })));
        box.append(el('div', { class: 'card' }, el('b', null, p.title), el('div', { style: { fontSize: '34px', letterSpacing: '6px', margin: '10px 0' } }, [...word].map(c => c === ' ' ? '   ' : map[c]).join('')),
          el('small', null, 'Բանալի՝ ' + shown.map(l => map[l] + '=' + l).join('  ') + (shown.length < letters.length ? '  … մնացածը գուշակի՛ր։' : ''))));
      } else if (p.type === 'caesar') {
        const A = 'ԱԲԳԴԵԶԷԸԹԺԻԼԽԾԿՀՁՂՃՄՅՆՇՈՉՊՋՌՍՎՏՐՑՒՓՔՕՖ'; const k = p.shift || 1;
        const enc = [...word].map(c => A.includes(c) ? A[(A.indexOf(c) + k) % A.length] : c).join('');
        box.append(el('div', { class: 'card' }, el('b', null, p.title), el('div', { style: { fontSize: '30px', fontWeight: 900, letterSpacing: '4px', margin: '10px 0', color: 'var(--purple-d)' } }, enc),
          el('small', null, 'Կեսարի ծածկագիր՝ յուրաքանչյուր տառ այբուբենով առաջ է տեղաշարժված ' + (api.level === 'hard' ? '? (հուշում՝ ' + p.hintShift + ')' : k) + ' -ով։ Տեղաշարժի՛ր հետ։')));
      } else if (p.type === 'riddle') {
        box.append(el('div', { class: 'card' }, el('b', null, p.title), el('p', { style: { fontWeight: 800, fontSize: '18px' } }, p.text)));
      }
      const out = el('div', { style: { fontSize: '30px', fontWeight: 900, letterSpacing: '6px', textAlign: 'center', minHeight: '50px', margin: '10px', color: 'var(--ink)', background: '#fff', borderRadius: '16px', padding: '6px' } }, '_'.repeat(word.length));
      const pad = el('div', { style: { display: 'flex', flexWrap: 'wrap', gap: '6px', justifyContent: 'center' } });
      const pool = p.type === 'riddle' && /^\d+$/.test(word) ? '0123456789'.split('') : shuffle([...new Set([...word.replace(/ /g, ''), ...shuffle('ԱԲԳԴԵԻԿԼՄՆՈՊՌՍՏՐ'.split('')).slice(0, 6)])]);
      const render = () => out.textContent = [...word].map((c, i) => i < typed.length ? typed[i] : c === ' ' ? ' ' : '_').join('');
      const add = ch => { typed += ch; while (word[typed.length] === ' ') typed += ' '; G.sfx('click'); render(); if (typed.length >= word.length) { if (typed === word) { G.sfx('win'); G.toast('🔓 Ճիշտ է՝ ' + word); r++; setTimeout(next, 900); } else { G.sfx('oops'); out.animate([{ transform: 'translateX(-8px)' }, { transform: 'translateX(8px)' }, { transform: 'none' }], { duration: 300 }); typed = ''; setTimeout(render, 400); } } };
      pool.forEach(ch => pad.append(el('button', { class: 'btn white small', style: { fontSize: '22px', minWidth: '52px' }, onclick: () => add(ch) }, ch)));
      box.append(out, pad, el('div', { class: 'xrow', style: { justifyContent: 'center', marginTop: '10px' } },
        el('button', { class: 'btn white small', onclick: () => { typed = typed.slice(0, -1); while (typed.endsWith(' ')) typed = typed.slice(0, -1); render(); } }, '⌫ Ջնջել'),
        el('button', { class: 'btn yellow small', onclick: () => { hints++; G.say([{ who: 'harut', text: 'Հուշում՝ ' + (p.hint || ('առաջին տառը՝ ' + word[0])) }], { host: b }); } }, '💡 Հարությունի հուշումը')));
      keys(api, e => { const ch = e.key.toUpperCase(); if (pool.includes(ch)) add(ch); if (e.key === 'Backspace') { typed = typed.slice(0, -1); render(); } });
      G.speak(p.title, api.who);
    }
    next();
  }

  /* ===================== QUIZ: путешественник, космос, семейная викторина ===================== */
  function quiz(api) {
    const b = setup(api), cfg = api.cfg;
    const qs = shuffle(cfg.questions).slice(0, lv(api, { easy: 5, normal: 6, hard: 8 }));
    let i = 0, ok = 0;
    const box = el('div', { style: { position: 'absolute', inset: '60px 12px 70px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '14px' } }); b.append(box);
    const cnt = pill(''); hud(api, cnt);
    function next() {
      if (i >= qs.length) return api.done({ stars: ok >= qs.length - 1 ? 3 : ok >= qs.length / 2 ? 2 : 1, text: 'Ճիշտ պատասխաններ՝ ' + ok + ' / ' + qs.length + '!' });
      const q = qs[i]; cnt.textContent = '❓ ' + (i + 1) + ' / ' + qs.length + '  ✅ ' + ok; box.innerHTML = '';
      box.append(el('div', { style: { fontSize: '72px' } }, q.e || '❓'), el('div', { class: 'card', style: { fontSize: '20px', fontWeight: 900, maxWidth: '640px' } }, q.q));
      const opts = el('div', { class: 'grid', style: { width: 'min(640px,100%)' } });
      shuffle(q.a.map((a, k) => ({ a, k }))).forEach(o => opts.append(el('button', { class: 'card', style: { fontSize: '18px', fontWeight: 900 }, onclick: e => {
        const right = o.k === (q.ok || 0); e.currentTarget.style.background = right ? '#c3f4b0' : '#ffd0da';
        if (right) { ok++; G.sfx('good'); } else G.sfx('oops');
        G.speak(right ? 'Ճիշտ է։' : 'Ճիշտ պատասխանը՝ ' + q.a[q.ok || 0], api.who);
        if (q.fact) G.toast('💡 ' + q.fact);
        opts.style.pointerEvents = 'none'; i++; setTimeout(next, right ? 1100 : 2000);
      } }, o.a)));
      box.append(opts); G.speak(q.q, api.who);
    }
    next();
  }

  /* ===================== BEATMAKER: своя музыкальная группа ===================== */
  function beatmaker(api) {
    const b = setup(api);
    const rows = [{ n: '🥁 Մեծ թմբուկ', k: 'kick' }, { n: '🪘 Փոքր թմբուկ', k: 'snare' }, { n: '🎩 Ծնծղա', k: 'hat' }, { n: '🎹 Մեղեդի', k: 'mel' }, { n: '🎸 Բաս', k: 'bass' }];
    const steps = 8; const grid = rows.map(() => Array(steps).fill(0));
    const melNotes = ['C5', 'E5', 'G5', 'E5', 'D5', 'F5', 'A4', 'G4'], bassN = [130.8, 130.8, 164.8, 164.8, 174.6, 174.6, 146.8, 196];
    let playing = false, pos = 0, bpm = 110, loops = 0, timer = null;
    const lesson = [[1, 0, 0, 0, 1, 0, 0, 0], [0, 0, 1, 0, 0, 0, 1, 0], [1, 1, 1, 1, 1, 1, 1, 1]];
    const wrap = el('div', { style: { position: 'absolute', inset: '60px 8px 70px', overflow: 'auto' } });
    const band = el('div', { class: 'xrow', style: { justifyContent: 'center', fontSize: '42px', marginBottom: '6px' } }, el('div', { style: { width: '60px', height: '60px' }, html: ART.face('anulik') }), '🎤', el('div', { style: { width: '52px', height: '52px' }, html: ART.face('mane') }), '🥁', el('div', { style: { width: '56px', height: '56px' }, html: ART.face('harut') }), '🎸');
    const tbl = el('div', { style: { display: 'grid', gridTemplateColumns: `110px repeat(${steps},1fr)`, gap: '5px', maxWidth: '760px', margin: '0 auto' } });
    const cells = rows.map((r, ri_) => { tbl.append(el('b', { style: { fontSize: '14px', alignSelf: 'center' } }, r.n)); return Array.from({ length: steps }, (_, s) => {
      const c = el('button', { style: { aspectRatio: 1, borderRadius: '12px', background: '#fff', boxShadow: '0 3px 0 #e3c7ee', minHeight: '38px', outline: ri_ < 3 && lesson[ri_][s] ? '2px dashed #b48cf0' : 'none' }, onclick: () => { grid[ri_][s] ^= 1; draw(); if (grid[ri_][s]) sound(ri_, s); } });
      tbl.append(c); return c; }); });
    function draw() { cells.forEach((row, r) => row.forEach((c, s) => { c.style.background = grid[r][s] ? ['#ff6b8a', '#ffad66', '#ffd45a', '#b48cf0', '#6fd6c4'][r] : (s === pos && playing ? '#f3e6ff' : '#fff'); })); }
    function sound(r, s) { if (r === 0) G.drum('kick'); if (r === 1) G.drum('snare'); if (r === 2) G.drum('hat'); if (r === 3) G.note(melNotes[s], .25); if (r === 4) G.tone(bassN[s], .3, 'sawtooth', .1); }
    function tick() { rows.forEach((_, r) => { if (grid[r][pos]) sound(r, pos); }); draw(); band.animate([{ transform: 'scale(1.04)' }, { transform: 'none' }], { duration: 120 }); pos = (pos + 1) % steps; if (pos === 0) loops++; }
    const playBtn = el('button', { class: 'btn', onclick: () => { playing = !playing; playBtn.textContent = playing ? '⏹️ Կանգ' : '▶️ Նվագել'; clearInterval(timer); if (playing) timer = setInterval(tick, 60000 / bpm / 2); } }, '▶️ Նվագել');
    api.ctx.onCleanup(() => clearInterval(timer));
    const tempo = el('input', { type: 'range', min: 70, max: 160, value: bpm, oninput: e => { bpm = +e.target.value; if (playing) { clearInterval(timer); timer = setInterval(tick, 60000 / bpm / 2); } } });
    const rec = el('button', { class: 'btn green', onclick: () => {
      const notes = grid.flat().filter(Boolean).length;
      if (notes < 10) { G.toast('Ավելացրո՛ւ առնվազն 10 նոտա (հիմա՝ ' + notes + ')'); return; }
      if (loops < 1) { G.toast('Նախ լսի՛ր ամբողջ թրեքը ▶️'); return; }
      const lessonOk = lesson.every((row, r) => row.every((v, s) => !v || grid[r][s]));
      api.done({ stars: lessonOk ? 3 : 2, text: lessonOk ? 'Հիթը պատրաստ է։ Ռիթմը պրոֆեսիոնալի պես է։ «Քույրերն ու քեռին» խումբը չարթերի գագաթին է։' : 'Թրեքը ձայնագրված է։ Հուշում՝ կետագիծը դասական ռիթմն է։', photo: { title: 'Խմբի թրեքը', kind: 'beat', data: { grid, bpm } } });
    } }, '⏺️ Ձայնագրել թրեքը');
    wrap.append(band, tbl, el('div', { class: 'xrow', style: { justifyContent: 'center', marginTop: '12px' } }, playBtn, el('span', { class: 'pill' }, '🎚️ Տեմպ'), tempo, rec));
    b.append(wrap); draw();
    instr(api, 'Սեղմի՛ր վանդակները՝ բիթ ստեղծելու համար։ Կետագիծը դասական ռիթմի հուշումն է');
  }
  // проигрывание сохранённого трека в фотоальбоме
  ENG.playBeat = function (data) {
    const g = data.grid, melNotes = ['C5', 'E5', 'G5', 'E5', 'D5', 'F5', 'A4', 'G4'], bassN = [130.8, 130.8, 164.8, 164.8, 174.6, 174.6, 146.8, 196];
    let pos = 0; const id = setInterval(() => { if (g[0][pos % 8]) G.drum('kick'); if (g[1][pos % 8]) G.drum('snare'); if (g[2][pos % 8]) G.drum('hat'); if (g[3][pos % 8]) G.note(melNotes[pos % 8], .25); if (g[4] && g[4][pos % 8]) G.tone(bassN[pos % 8], .3, 'sawtooth', .1); pos++; if (pos >= 32) clearInterval(id); }, 60000 / data.bpm / 2);
  };

  /* ===================== STORY CHOICE: короткие мини-сюжеты (для приключений) ===================== */
  function choice(api) {
    const b = setup(api), cfg = api.cfg;
    const box = el('div', { style: { position: 'absolute', inset: '60px 12px 70px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '14px' } });
    box.append(el('div', { style: { fontSize: '80px' } }, cfg.e || '🤔'), el('div', { class: 'card', style: { fontSize: '20px', fontWeight: 900, maxWidth: '640px' } }, cfg.q));
    const g = el('div', { class: 'grid', style: { width: 'min(640px,100%)' } });
    cfg.options.forEach(o => g.append(el('button', { class: 'card', onclick: () => { G.sfx('good'); G.say([{ who: o.who || 'harut', text: o.reply }], { host: b }).then(() => api.done({ stars: o.stars || 3, text: o.result || 'Հիանալի ընտրություն։' })); } },
      el('span', { class: 'em' }, o.e), el('b', null, o.text))));
    box.append(g); b.append(box);
    G.speak(cfg.q, api.who);
  }

  Object.assign(ENG, { photo, detective, manage, planner, allocate, sequence, logic, cipher, quiz, beatmaker, choice });
})();
