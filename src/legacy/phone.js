// @ts-nocheck
/* Смартфон Анулик — перенесён из 2D-версии */
/* ===== Игровой смартфон: карта, фотоальбом, гардероб, карта путешествий, задания, достижения, погода ===== */
window.PHONE = (function () {
  const { el } = G;
  const TEEN = [{ top: '#b79bff', leg: '#6d8fd8' }, { top: '#6fd6c4', leg: '#4a4f72' }, { top: '#ffb0c8', leg: '#efe2cc' }, { top: '#ffe08a', leg: '#6d8fd8' }, { top: '#3a3550', leg: '#2a2638' }];
  const PLACES_IDS = ['home', 'city', 'mall', 'market', 'cinema', 'cafe', 'amusement', 'zoo', 'aquapark', 'airport', 'station', 'beach', 'forest', 'mountains', 'studio', 'space'];
  const APPS = [
    { id: 'map', e: '🗺️', n: 'Քարտեզ' }, { id: 'album', e: '🖼️', n: 'Ալբոմ' }, { id: 'camera', e: '📷', n: 'Տեսախցիկ' }, { id: 'wardrobe', e: '👗', n: 'Զգեստապահարան' },
    { id: 'travel', e: '✈️', n: 'Ճամփորդություններ' }, { id: 'daily', e: '📅', n: 'Առաջադրանքներ' }, { id: 'ach', e: '🏆', n: 'Պարգևներ' }, { id: 'gifts', e: '🎁', n: 'Հուշանվերներ' },
    { id: 'weather', e: '🌦️', n: 'Եղանակ' }, { id: 'music', e: '🎧', n: 'Երաժշտություն' }, { id: 'chat', e: '💬', n: 'Ընտանիք' }, { id: 'settings', e: '⚙️', n: 'Ծնողներին' },
  ];


  function mount(host, startApp, nav) {
    const owner = G.S.hero === 'anulik' ? 'Անուլիկ' : G.S.hero === 'mane' ? 'Մանե (Անուլիկի օգնությամբ)' : 'Հարություն';
    const phone = el('div', { class: 'lg-phone' }); const scr = el('div', { class: 'scr' }); phone.append(scr); host.append(phone);
    function home() {
      scr.innerHTML = '';
      const now = String(G.S.clock).padStart(2, '0') + ':00';
      scr.append(el('div', { class: 'status' }, el('span', null, now), el('span', null, '⭐ ' + G.S.stars + '  🪙 ' + G.S.coins)),
        el('div', { style: { textAlign: 'center', color: '#fff', fontWeight: 900, fontSize: '42px', marginTop: '20px', textShadow: '0 2px 6px #0003' } }, now),
        el('div', { style: { textAlign: 'center', color: '#fff', fontWeight: 800, textShadow: '0 1px 4px #0003' } }, (G.isNight() ? '🌙 Գիշեր' : '☀️ Ցերեկ') + ' · ' + ({ sun: 'Արևոտ', cloud: 'Ամպամած', rain: 'Անձրև', snow: 'Ձյուն' }[G.S.weather])));
      const apps = el('div', { class: 'apps' });
      APPS.forEach(a => { const badge = a.id === 'daily' ? G.S.daily.tasks.filter(t => !t.done).length : 0;
        apps.append(el('button', { class: 'app-ic', onclick: () => { G.sfx('click'); open(a.id); } }, el('span', { style: { position: 'relative' } }, a.e, badge ? el('i', { style: { position: 'absolute', top: '-4px', right: '-4px', background: '#ff4d6a', color: '#fff', borderRadius: '99px', fontSize: '12px', fontStyle: 'normal', padding: '1px 6px' } }, badge) : null), a.n)); });
      scr.append(apps);
    }
    function view(title, ...content) {
      scr.innerHTML = '';
      scr.append(el('div', { class: 'status', style: { color: '#8a3f86', background: '#fff' } }, el('span', null, String(G.S.clock).padStart(2, '0') + ':00'), el('span', null, '⭐ ' + G.S.stars)),
        el('div', { class: 'apphead' }, el('button', { style: { background: 'none', fontSize: '22px' }, onclick: home }, '‹'), title), el('div', { class: 'appview' }, ...content));
    }
    function open(id) {
      G.ensureDaily();
      if (id === 'map') { nav.map(); return; }
      if (id === 'settings') { nav.settings(); return; }
      if (id === 'album') return view('🖼️ Ընտանեկան ալբոմ · ' + G.S.album.length, album());
      if (id === 'camera') return view('📷 Տեսախցիկ', camera());
      if (id === 'wardrobe') return view('👗 Անուլիկի զգեստապահարանը', wardrobe());
      if (id === 'travel') return view('✈️ Ճամփորդությունների քարտեզ', travel());
      if (id === 'daily') return view('📅 Օրվա առաջադրանքներ', daily());
      if (id === 'ach') return view('🏆 Նվաճումներ', ach());
      if (id === 'gifts') return view('🎁 Հուշանվերներ', gifts());
      if (id === 'weather') return view('🌦️ Եղանակ և ժամանակ', weather());
      if (id === 'music') return view('🎧 Երաժշտություն', music());
      if (id === 'chat') return view('💬 Ընտանեկան զրույց', chat());
    }

    /* --- фотоальбом --- */
    function thumb(p) {
      if (p.kind === 'svg') return el('div', { class: 'ph', html: p.data });
      if (p.kind === 'comp') return el('div', { class: 'ph', style: { containerType: 'inline-size' }, html: ENG.renderComp(p.data) });
      if (p.kind === 'html') return el('div', { class: 'ph', style: { containerType: 'inline-size' }, html: p.data });
      if (p.kind === 'beat') return el('div', { class: 'ph', style: { display: 'grid', placeItems: 'center', fontSize: '40px', background: '#2a2240' } }, '🎵');
      if (p.kind === 'selfie') return el('div', { class: 'ph', style: { display: 'flex', alignItems: 'flex-end', justifyContent: 'center', background: p.bg } , html: '<div style="font-size:22cqw;line-height:1">' + p.who.map(h => G.HEROES[h].face).join('') + '</div>' });
      return el('div', { class: 'ph' }, '🖼️');
    }
    function album() {
      if (!G.S.album.length) return el('p', { style: { fontWeight: 800 } }, 'Դեռ դատարկ է։ Ներկի՛ր, լուսանկարի՛ր, ստեղծի՛ր՝ աշխատանքները կհայտնվեն այստեղ։');
      const g = el('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '8px' } });
      G.S.album.forEach(p => { const t = el('button', { class: 'photo-thumb', style: { padding: 0 }, onclick: () => big(p) }, thumb(p), el('small', null, p.title)); g.append(t); });
      return g;
    }
    function big(p) {
      const inner = el('div', { class: 'photo-thumb', style: { width: '100%' } }, thumb(p));
      const m = G.modal(el('div', null, el('h3', null, p.title), inner, el('p', null, '📅 ' + p.date + ' · ' + (G.HEROES[p.who] ? G.HEROES[p.who].name : '')),
        el('div', { class: 'row' }, p.kind === 'beat' ? el('button', { class: 'btn', onclick: () => ENG.playBeat(p.data) }, '▶️ Լսել') : null,
          el('button', { class: 'btn white', onclick: async () => { m.close(); if (await G.confirmBox('Ջնջե՞լ լուսանկարը', p.title, 'Ջնջել', 'Թողնել')) { G.S.album = G.S.album.filter(x => x !== p); G.save(); open('album'); } } }, '🗑️ Ջնջել'),
          el('button', { class: 'btn', onclick: () => m.close() }, 'Փակել'))));
    }
    /* --- камера (селфи семьи) --- */
    function camera() {
      const bgs = ['linear-gradient(#ffe6f3,#c3f4b0)', 'linear-gradient(#bfe6ff,#f7e2b0)', 'linear-gradient(#2a2240,#7a5aa6)', 'linear-gradient(#fff7d6,#ffd0e8)'];
      let bg = 0; const who = new Set(['mane', 'anulik', 'harut']);
      const prev = el('div', { class: 'photo-thumb' });
      const draw = () => { prev.innerHTML = ''; prev.append(thumb({ kind: 'selfie', bg: bgs[bg], who: [...who] })); };
      draw();
      return el('div', null, prev, el('p', { style: { fontWeight: 800 } }, 'Ո՞վ է կադրում'),
        el('div', { class: 'row' }, ...['mane', 'anulik', 'harut'].map(h => el('button', { class: 'tab on', onclick: e => { if (who.has(h) && who.size > 1) { who.delete(h); e.currentTarget.classList.remove('on'); } else { who.add(h); e.currentTarget.classList.add('on'); } draw(); } }, G.HEROES[h].name))),
        el('div', { class: 'row', style: { marginTop: '8px' } }, el('button', { class: 'btn white small', onclick: () => { bg = (bg + 1) % bgs.length; draw(); } }, '🎨 Ֆոն'),
          el('button', { class: 'btn small', onclick: () => { G.sfx('camera'); G.addPhoto({ title: 'Ընտանեկան սելֆի', kind: 'selfie', data: null, bg: bgs[bg], who: [...who] }); } }, '📸 Նկարել')));
    }
    /* --- гардероб Анулик --- */
    function wardrobe() {
      const names = ['Հուդի և ջինս', 'Անանուխային սպորտ', 'Վարդագույն ամառ', 'Արևոտ օր', 'Երեկոյան ոճ'];
      const unlocked = Math.max(2, G.S.wardrobe.unlocked || 2);
      const g = el('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '8px' } });
      names.forEach((n, i) => { const lock = i >= unlocked;
        g.append(el('button', { class: 'card', style: { padding: '6px', borderColor: G.S.wardrobe.anulik === i ? 'var(--pink)' : '#fff', opacity: lock ? .5 : 1 }, onclick: () => {
          if (lock) { G.toast('🔒 Բացի՛ր «Նորաձևության ստուդիայում» (3 աստղ պատվերի համար)'); return; } G.S.wardrobe.anulik = i; G.save(); nav.look(i); G.sfx('magic'); open('wardrobe'); } },
          el('div', { style: { height: '110px', display: 'grid', placeItems: 'center' }, html: lock ? '<div style="font-size:56px">🔒</div>' : `<div style="display:flex;flex-direction:column;align-items:center"><div style="font-size:44px">👩🏻</div><div style="width:54px;height:34px;border-radius:14px 14px 6px 6px;background:${TEEN[i].top}"></div><div style="width:44px;height:36px;border-radius:4px 4px 10px 10px;background:${TEEN[i].leg}"></div></div>` }), el('b', null, n))); });
      return el('div', null, el('p', { style: { fontWeight: 800 } }, 'Ընտրի՛ր Անուլիկի կերպարը՝ այն կհայտնվի քաղաքում և արկածներում։'), g);
    }
    /* --- карта путешествий --- */
    function travel() {
      const all = [['Հայաստան', '🇦🇲'], ['Իսպանիա', '🇪🇸'], ['Ֆրանսիա', '🇫🇷'], ['Իտալիա', '🇮🇹'], ['Ճապոնիա', '🇯🇵']];
      const box = el('div');
      box.append(el('b', null, '🌍 Երկրներ'));
      const g = el('div', { class: 'row', style: { margin: '8px 0' } });
      all.forEach(([n, f]) => g.append(el('div', { class: 'card', style: { padding: '6px 10px', opacity: G.S.countries.includes(n) ? 1 : .35 } }, el('span', { style: { fontSize: '30px' } }, f), el('small', null, n))));
      box.append(g, el('small', null, G.S.countries.length ? 'Նշումները դրվում են «Ընտանեկան ճամփորդություն աշխարհով մեկ» արկածից հետո' : 'Անցի՛ր «Ընտանեկան ճամփորդություն աշխարհով մեկ» արկածը օդանավակայանում։'));
      box.append(el('b', { style: { display: 'block', marginTop: '12px' } }, '🏙️ Քաղաքի վայրերը՝ ' + G.S.visited.length + '/16'));
      const gp = el('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '6px', marginTop: '6px' } });
      PLACES_IDS.forEach(id => gp.append(el('button', { class: 'card', style: { padding: '4px', opacity: G.S.visited.includes(id) ? 1 : .35 }, title: PLACES.P[id].name, onclick: () => { nav.place(id); } }, el('span', { style: { fontSize: '26px' } }, PLACES.P[id].e), el('small', { style: { fontSize: '9px' } }, PLACES.P[id].name))));
      box.append(gp);
      return box;
    }
    function daily() {
      const box = el('div', null, el('p', { style: { fontWeight: 800 } }, 'Օրերի շարք՝ 🔥 ' + G.S.daily.streak + '։ Բոլոր 3 առաջադրանքների համար՝ հուշանվեր։'));
      G.S.daily.tasks.forEach(t => { const d = G.DAILY_POOL.find(p => p.id === t.id); box.append(el('div', { class: 'list-item' + (t.done ? ' ok' : '') }, el('span', { class: 'em' }, t.done ? '✅' : '⬜'), el('span', { style: { flex: 1 } }, d.text), el('b', null, Math.min(t.n, d.need) + '/' + d.need))); });
      return box;
    }
    function ach() {
      const box = el('div');
      G.ACH.forEach(a => box.append(el('div', { class: 'list-item' + (G.S.achievements[a.id] ? ' ok' : '') }, el('span', { class: 'em' }, G.S.achievements[a.id] ? a.emoji : '🔒'), el('span', null, a.name))));
      return box;
    }
    function gifts() {
      const g = el('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '6px' } });
      for (const id in DATA.SOUVENIRS) { const s = DATA.SOUVENIRS[id], have = G.S.souvenirs.includes(id); g.append(el('div', { class: 'card', style: { padding: '4px', opacity: have ? 1 : .35 } }, el('span', { style: { fontSize: '30px' } }, have ? s.emoji : '❔'), el('small', { style: { fontSize: '10px' } }, have ? s.name : s.hint))); }
      return el('div', null, el('b', null, 'Հավաքված է ' + G.S.souvenirs.length + ' / ' + Object.keys(DATA.SOUVENIRS).length), g);
    }
    function weather() {
      const box = el('div');
      box.append(el('b', null, '🕐 Ժամը՝ ' + String(G.S.clock).padStart(2, '0') + ':00'),
        el('div', { class: 'row', style: { margin: '8px 0' } }, ...[[8, '🌅 Առավոտ'], [13, '☀️ Ցերեկ'], [19, '🌇 Երեկո'], [22, '🌙 Գիշեր']].map(([h, n]) => el('button', { class: 'btn white small', onclick: () => { G.setTime(h); if (h >= 20) G.flag('night'); open('weather'); } }, n))),
        el('b', null, '🌦️ Եղանակ'),
        el('div', { class: 'row', style: { margin: '8px 0' } }, ...[['sun', '☀️ Արև'], ['cloud', '☁️ Ամպեր'], ['rain', '🌧️ Անձրև'], ['snow', '❄️ Ձյուն']].map(([w, n]) => el('button', { class: 'btn small ' + (G.S.weather === w ? '' : 'white'), onclick: () => { G.setWeather(w); open('weather'); } }, n))),
        el('button', { class: 'list-item', style: { width: '100%' }, onclick: () => { G.S.settings.autoTime = !G.S.settings.autoTime; G.save(); open('weather'); } }, el('span', { class: 'em' }, G.S.settings.autoTime ? '✅' : '⬜'), 'Ժամանակն ու եղանակը փոխվում են ինքնուրույն (1 րոպե = 1 ժամ)'),
        el('small', null, 'Գիշերն ու եղանակը երևում են քաղաքում և փողոցներում։'));
      return box;
    }
    function music() {
      const songs = { 'Աստղիկ': ['C4', 'C4', 'G4', 'G4', 'A4', 'A4', 'G4'], 'Զանգակներ': ['E4', 'E4', 'E4', 'E4', 'E4', 'E4', 'E4', 'G4', 'C4', 'D4', 'E4'], 'Շնորհավոր ծնունդդ': ['G4', 'G4', 'A4', 'G4', 'C5', 'B4'] };
      const box = el('div');
      for (const s in songs) box.append(el('button', { class: 'list-item', style: { width: '100%' }, onclick: () => songs[s].forEach((n, i) => setTimeout(() => G.note(n, .35), i * 320)) }, el('span', { class: 'em' }, '🎵'), s));
      const beats = G.S.album.filter(p => p.kind === 'beat');
      box.append(el('b', { style: { display: 'block', margin: '10px 0 6px' } }, '🎸 Խմբի թրեքերը (' + beats.length + ')'));
      beats.forEach((b, i) => box.append(el('button', { class: 'list-item', style: { width: '100%' }, onclick: () => ENG.playBeat(b.data) }, el('span', { class: 'em' }, '▶️'), 'Թրեք №' + (beats.length - i) + ' · ' + b.date)));
      if (!beats.length) box.append(el('small', null, 'Ստեղծի՛ր թրեք «Իմ երաժշտական խումբը» խաղում։'));
      return box;
    }
    function chat() {
      // безопасный «чат»: только готовые добрые фразы, без открытого ввода
      const box = el('div');
      const log = el('div');
      const msgs = [
        { who: 'harut', text: 'Աղջիկնե՛ր, այսօր գնո՞ւմ ենք լեռներ։ 🏔️' }, { who: 'mane', text: 'Ուռա՜։ 🎀🎀🎀' }, { who: 'anulik', text: 'Տեսախցիկը կվերցնեմ 📸' },
        { who: 'harut', text: 'Մանե՛, ատամներդ մաքրե՞լ ես։ 🪥' }, { who: 'anulik', text: 'Քեռի, դու լավագույնն ես։ ❤️' },
      ];
      const add = m => { const mine = m.who === G.S.hero; log.append(el('div', { style: { display: 'flex', gap: '6px', alignItems: 'flex-end', justifyContent: mine ? 'flex-end' : 'flex-start', margin: '6px 0' } },
        mine ? null : el('div', { style: { width: '34px', height: '34px', borderRadius: '50%', overflow: 'hidden', background: '#ffe6f3', flex: '0 0 auto' }, html: G.HEROES[m.who].face, style2: '' }),
        el('div', { style: { background: mine ? 'var(--pink)' : '#f3e6ff', color: mine ? '#fff' : 'var(--ink2)', padding: '8px 12px', borderRadius: '16px', fontWeight: 800, maxWidth: '75%' } }, m.text))); };
      msgs.forEach(add);
      const quick = ['Սիրում եմ ձեզ։ ❤️', 'Գնա՞նք զբոսնելու։ 🌳', 'Նայե՛ք, թե ինչ գտա։ ✨', 'Բարի գիշեր 🌙', 'Ապրե՛ս! 👏'];
      const replies = { harut: ['Հա-հա, հիանալի է։ 😄', 'Ապրե՛ս, իմ լավիկ։', 'Արդեն վազում եմ։ 🏃‍♂️'], mane: ['Հի՛-հի՛։ 🎀', 'Ես էլ։ 💖', 'Իսկ պաղպաղակ կարելի՞ է։ 🍦'], anulik: ['Սուպեր։ 📸', 'Համաձայն եմ։ ✨', 'Հիմա կգամ 🏃‍♀️'] };
      box.append(log, el('small', null, 'Արագ հաղորդագրություններ (միայն ընտանիքի համար)՝'),
        el('div', { class: 'row' }, ...quick.map(q => el('button', { class: 'tab', onclick: () => { add({ who: G.S.hero, text: q }); G.sfx('pop');
          const other = G.pick(['mane', 'anulik', 'harut'].filter(h => h !== G.S.hero)); setTimeout(() => { add({ who: other, text: G.pick(replies[other]) }); G.sfx('soft'); log.parentNode && (log.parentNode.scrollTop = 1e6); }, 900); } }, q))));
      return box;
    }
    if (startApp) open(startApp); else home();
    return () => phone.remove();
  }
  return { mount };
})();
