/* ===== Игровой смартфон: карта, фотоальбом, гардероб, карта путешествий, задания, достижения, погода ===== */
window.PHONE = (function () {
  const { el } = G;
  const APPS = [
    { id: 'map', e: '🗺️', n: 'Карта' }, { id: 'album', e: '🖼️', n: 'Альбом' }, { id: 'camera', e: '📷', n: 'Камера' }, { id: 'wardrobe', e: '👗', n: 'Гардероб' },
    { id: 'travel', e: '✈️', n: 'Путешествия' }, { id: 'daily', e: '📅', n: 'Задания' }, { id: 'ach', e: '🏆', n: 'Награды' }, { id: 'gifts', e: '🎁', n: 'Сувениры' },
    { id: 'weather', e: '🌦️', n: 'Погода' }, { id: 'music', e: '🎧', n: 'Музыка' }, { id: 'chat', e: '💬', n: 'Семья' }, { id: 'settings', e: '⚙️', n: 'Настройки' },
  ];

  function openApp(id) { G.go(screen, id); }

  function screen(ctx, startApp) {
    const owner = G.S.hero === 'anulik' ? 'Анулик' : G.S.hero === 'mane' ? 'Мане (с помощью Анулик)' : 'Харутюн';
    const { root, body } = G.screen({ title: '📱 Смартфон', sub: 'Владелец: ' + owner });
    const phone = el('div', { class: 'phone' }); const scr = el('div', { class: 'scr' }); phone.append(el('div', { class: 'notch' }), scr); body.append(phone);
    function home() {
      scr.innerHTML = '';
      const now = String(G.S.clock).padStart(2, '0') + ':00';
      scr.append(el('div', { class: 'status' }, el('span', null, now), el('span', null, '⭐ ' + G.S.stars + '  🪙 ' + G.S.coins)),
        el('div', { style: { textAlign: 'center', color: '#fff', fontWeight: 900, fontSize: '42px', marginTop: '20px', textShadow: '0 2px 6px #0003' } }, now),
        el('div', { style: { textAlign: 'center', color: '#fff', fontWeight: 800, textShadow: '0 1px 4px #0003' } }, (G.isNight() ? '🌙 Ночь' : '☀️ День') + ' · ' + ({ sun: 'Солнечно', cloud: 'Облачно', rain: 'Дождь', snow: 'Снег' }[G.S.weather])));
      const apps = el('div', { class: 'apps' });
      APPS.forEach(a => { const badge = a.id === 'daily' ? G.S.daily.tasks.filter(t => !t.done).length : 0;
        apps.append(el('button', { class: 'app-ic', onclick: () => { G.sfx('click'); open(a.id); } }, el('span', { style: { position: 'relative' } }, a.e, badge ? el('i', { style: { position: 'absolute', top: '-4px', right: '-4px', background: '#ff4d6a', color: '#fff', borderRadius: '99px', fontSize: '12px', fontStyle: 'normal', padding: '1px 6px' } }, badge) : null), a.n)); });
      scr.append(apps);
    }
    function view(title, ...content) {
      scr.innerHTML = '';
      scr.append(el('div', { class: 'status', style: { color: 'var(--ink)', background: '#fff' } }, el('span', null, String(G.S.clock).padStart(2, '0') + ':00'), el('span', null, '⭐ ' + G.S.stars)),
        el('div', { class: 'apphead' }, el('button', { style: { background: 'none', fontSize: '22px' }, onclick: home }, '‹'), title), el('div', { class: 'appview' }, ...content));
    }
    function open(id) {
      G.ensureDaily();
      if (id === 'map') { G.go(WORLD.map); return; }
      if (id === 'settings') { G.go(HOME.settings); return; }
      if (id === 'album') return view('🖼️ Семейный фотоальбом · ' + G.S.album.length, album());
      if (id === 'camera') return view('📷 Камера', camera());
      if (id === 'wardrobe') return view('👗 Гардероб Анулик', wardrobe());
      if (id === 'travel') return view('✈️ Карта путешествий', travel());
      if (id === 'daily') return view('📅 Задания дня', daily());
      if (id === 'ach') return view('🏆 Достижения', ach());
      if (id === 'gifts') return view('🎁 Сувениры', gifts());
      if (id === 'weather') return view('🌦️ Погода и время', weather());
      if (id === 'music') return view('🎧 Музыка', music());
      if (id === 'chat') return view('💬 Семейный чат', chat());
    }

    /* --- фотоальбом --- */
    function thumb(p) {
      if (p.kind === 'svg') return el('div', { class: 'ph', html: p.data });
      if (p.kind === 'comp') return el('div', { class: 'ph', style: { containerType: 'inline-size' }, html: ENG.renderComp(p.data) });
      if (p.kind === 'html') return el('div', { class: 'ph', style: { containerType: 'inline-size' }, html: p.data });
      if (p.kind === 'beat') return el('div', { class: 'ph', style: { display: 'grid', placeItems: 'center', fontSize: '40px', background: '#2a2240' } }, '🎵');
      if (p.kind === 'selfie') return el('div', { class: 'ph', style: { display: 'flex', alignItems: 'flex-end', justifyContent: 'center', background: p.bg } , html: p.who.map(h => ART.hero(h).replace('<svg', '<svg style="height:90%;width:auto"')).join('') });
      return el('div', { class: 'ph' }, '🖼️');
    }
    function album() {
      if (!G.S.album.length) return el('p', { style: { fontWeight: 800 } }, 'Пока пусто. Раскрашивай, фотографируй, создавай — работы появятся здесь!');
      const g = el('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '8px' } });
      G.S.album.forEach(p => { const t = el('button', { class: 'photo-thumb', style: { padding: 0 }, onclick: () => big(p) }, thumb(p), el('small', null, p.title)); g.append(t); });
      return g;
    }
    function big(p) {
      const inner = el('div', { class: 'photo-thumb', style: { width: '100%' } }, thumb(p));
      const m = G.modal(el('div', null, el('h3', null, p.title), inner, el('p', null, '📅 ' + p.date + ' · ' + (G.HEROES[p.who] ? G.HEROES[p.who].name : '')),
        el('div', { class: 'row' }, p.kind === 'beat' ? el('button', { class: 'btn', onclick: () => ENG.playBeat(p.data) }, '▶️ Слушать') : null,
          el('button', { class: 'btn white', onclick: async () => { m.close(); if (await G.confirmBox('Удалить фото?', p.title, 'Удалить', 'Оставить')) { G.S.album = G.S.album.filter(x => x !== p); G.save(); open('album'); } } }, '🗑️ Удалить'),
          el('button', { class: 'btn', onclick: () => m.close() }, 'Закрыть'))));
    }
    /* --- камера (селфи семьи) --- */
    function camera() {
      const bgs = ['linear-gradient(#ffe6f3,#c3f4b0)', 'linear-gradient(#bfe6ff,#f7e2b0)', 'linear-gradient(#2a2240,#7a5aa6)', 'linear-gradient(#fff7d6,#ffd0e8)'];
      let bg = 0; const who = new Set(['mane', 'anulik', 'harut']);
      const prev = el('div', { class: 'photo-thumb' });
      const draw = () => { prev.innerHTML = ''; prev.append(thumb({ kind: 'selfie', bg: bgs[bg], who: [...who] })); };
      draw();
      return el('div', null, prev, el('p', { style: { fontWeight: 800 } }, 'Кто в кадре?'),
        el('div', { class: 'row' }, ...['mane', 'anulik', 'harut'].map(h => el('button', { class: 'tab on', onclick: e => { if (who.has(h) && who.size > 1) { who.delete(h); e.currentTarget.classList.remove('on'); } else { who.add(h); e.currentTarget.classList.add('on'); } draw(); } }, G.HEROES[h].name))),
        el('div', { class: 'row', style: { marginTop: '8px' } }, el('button', { class: 'btn white small', onclick: () => { bg = (bg + 1) % bgs.length; draw(); } }, '🎨 Фон'),
          el('button', { class: 'btn small', onclick: () => { G.sfx('camera'); G.addPhoto({ title: 'Семейное селфи', kind: 'selfie', data: null, bg: bgs[bg], who: [...who] }); } }, '📸 Снять')));
    }
    /* --- гардероб Анулик --- */
    function wardrobe() {
      const names = ['Худи и джинсы', 'Мятный спорт', 'Розовое лето', 'Солнечный денёк', 'Вечерний стиль'];
      const unlocked = Math.max(2, G.S.wardrobe.unlocked || 2);
      const g = el('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '8px' } });
      names.forEach((n, i) => { const lock = i >= unlocked;
        g.append(el('button', { class: 'card', style: { padding: '6px', borderColor: G.S.wardrobe.anulik === i ? 'var(--pink)' : '#fff', opacity: lock ? .5 : 1 }, onclick: () => {
          if (lock) { G.toast('🔒 Открой в «Студии моды» (3 звезды за заказ)'); return; } G.S.wardrobe.anulik = i; G.save(); G.sfx('magic'); open('wardrobe'); } },
          el('div', { style: { height: '150px' }, html: lock ? '<div style="font-size:60px;padding-top:40px">🔒</div>' : ART.hero('anulik', { outfit: i }).replace('<svg', '<svg style="height:150px;width:auto"') }), el('b', null, n))); });
      return el('div', null, el('p', { style: { fontWeight: 800 } }, 'Выбери образ Анулик — он появится в городе и в приключениях.'), g);
    }
    /* --- карта путешествий --- */
    function travel() {
      const all = [['Армения', '🇦🇲'], ['Испания', '🇪🇸'], ['Франция', '🇫🇷'], ['Италия', '🇮🇹'], ['Япония', '🇯🇵']];
      const box = el('div');
      box.append(el('b', null, '🌍 Страны'));
      const g = el('div', { class: 'row', style: { margin: '8px 0' } });
      all.forEach(([n, f]) => g.append(el('div', { class: 'card', style: { padding: '6px 10px', opacity: G.S.countries.includes(n) ? 1 : .35 } }, el('span', { style: { fontSize: '30px' } }, f), el('small', null, n))));
      box.append(g, el('small', null, G.S.countries.length ? 'Отметки ставятся после «Семейного путешествия по миру»' : 'Пройди приключение «Семейное путешествие по миру» в аэропорту!'));
      box.append(el('b', { style: { display: 'block', marginTop: '12px' } }, '🏙️ Места города: ' + G.S.visited.length + '/16'));
      const gp = el('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '6px', marginTop: '6px' } });
      WORLD.placeIds.forEach(id => gp.append(el('button', { class: 'card', style: { padding: '4px', opacity: G.S.visited.includes(id) ? 1 : .35 }, title: WORLD.P[id].name, onclick: () => { G.go(WORLD.place, id); } }, el('span', { style: { fontSize: '26px' } }, WORLD.P[id].e), el('small', { style: { fontSize: '9px' } }, WORLD.P[id].name))));
      box.append(gp);
      return box;
    }
    function daily() {
      const box = el('div', null, el('p', { style: { fontWeight: 800 } }, 'Серия дней: 🔥 ' + G.S.daily.streak + '. За все 3 задания — сувенир!'));
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
      return el('div', null, el('b', null, 'Собрано ' + G.S.souvenirs.length + ' из ' + Object.keys(DATA.SOUVENIRS).length), g);
    }
    function weather() {
      const box = el('div');
      box.append(el('b', null, '🕐 Время: ' + String(G.S.clock).padStart(2, '0') + ':00'),
        el('div', { class: 'row', style: { margin: '8px 0' } }, ...[[8, '🌅 Утро'], [13, '☀️ День'], [19, '🌇 Вечер'], [22, '🌙 Ночь']].map(([h, n]) => el('button', { class: 'btn white small', onclick: () => { G.setTime(h); if (h >= 20) G.flag('night'); open('weather'); } }, n))),
        el('b', null, '🌦️ Погода'),
        el('div', { class: 'row', style: { margin: '8px 0' } }, ...[['sun', '☀️ Солнце'], ['cloud', '☁️ Облака'], ['rain', '🌧️ Дождь'], ['snow', '❄️ Снег']].map(([w, n]) => el('button', { class: 'btn small ' + (G.S.weather === w ? '' : 'white'), onclick: () => { G.setWeather(w); open('weather'); } }, n))),
        el('button', { class: 'list-item', style: { width: '100%' }, onclick: () => { G.S.settings.autoTime = !G.S.settings.autoTime; G.save(); open('weather'); } }, el('span', { class: 'em' }, G.S.settings.autoTime ? '✅' : '⬜'), 'Время и погода меняются сами (1 мин = 1 час)'),
        el('small', null, 'Ночь и погода видны в городе и на улицах.'));
      return box;
    }
    function music() {
      const songs = { 'Звёздочка': ['C4', 'C4', 'G4', 'G4', 'A4', 'A4', 'G4'], 'Бубенцы': ['E4', 'E4', 'E4', 'E4', 'E4', 'E4', 'E4', 'G4', 'C4', 'D4', 'E4'], 'С днём рождения': ['G4', 'G4', 'A4', 'G4', 'C5', 'B4'] };
      const box = el('div');
      for (const s in songs) box.append(el('button', { class: 'list-item', style: { width: '100%' }, onclick: () => songs[s].forEach((n, i) => setTimeout(() => G.note(n, .35), i * 320)) }, el('span', { class: 'em' }, '🎵'), s));
      const beats = G.S.album.filter(p => p.kind === 'beat');
      box.append(el('b', { style: { display: 'block', margin: '10px 0 6px' } }, '🎸 Треки группы (' + beats.length + ')'));
      beats.forEach((b, i) => box.append(el('button', { class: 'list-item', style: { width: '100%' }, onclick: () => ENG.playBeat(b.data) }, el('span', { class: 'em' }, '▶️'), 'Трек №' + (beats.length - i) + ' · ' + b.date)));
      if (!beats.length) box.append(el('small', null, 'Создай трек в игре «Своя музыкальная группа»!'));
      return box;
    }
    function chat() {
      // безопасный «чат»: только готовые добрые фразы, без открытого ввода
      const box = el('div');
      const log = el('div');
      const msgs = [
        { who: 'harut', text: 'Девочки, сегодня едем в горы? 🏔️' }, { who: 'mane', text: 'Ура!!! 🎀🎀🎀' }, { who: 'anulik', text: 'Возьму камеру 📸' },
        { who: 'harut', text: 'Мане, ты почистила зубки? 🪥' }, { who: 'anulik', text: 'Дядя, ты лучший! ❤️' },
      ];
      const add = m => { const mine = m.who === G.S.hero; log.append(el('div', { style: { display: 'flex', gap: '6px', alignItems: 'flex-end', justifyContent: mine ? 'flex-end' : 'flex-start', margin: '6px 0' } },
        mine ? null : el('div', { style: { width: '34px', height: '34px', borderRadius: '50%', overflow: 'hidden', background: '#ffe6f3', flex: '0 0 auto' }, html: ART.face(m.who) }),
        el('div', { style: { background: mine ? 'var(--pink)' : '#f3e6ff', color: mine ? '#fff' : 'var(--ink2)', padding: '8px 12px', borderRadius: '16px', fontWeight: 800, maxWidth: '75%' } }, m.text))); };
      msgs.forEach(add);
      const quick = ['Люблю вас! ❤️', 'Пойдём гулять? 🌳', 'Смотрите, что я нашла! ✨', 'Спокойной ночи 🌙', 'Ապրե՛ս! 👏'];
      const replies = { harut: ['Ха-ха, отлично! 😄', 'Ապրե՛ս, моя хорошая!', 'Уже бегу! 🏃‍♂️'], mane: ['Хи-хи! 🎀', 'Я тоже! 💖', 'А можно мороженку? 🍦'], anulik: ['Супер! 📸', 'Согласна! ✨', 'Сейчас приду 🏃‍♀️'] };
      box.append(log, el('small', null, 'Быстрые сообщения (только для семьи):'),
        el('div', { class: 'row' }, ...quick.map(q => el('button', { class: 'tab', onclick: () => { add({ who: G.S.hero, text: q }); G.sfx('pop');
          const other = G.pick(['mane', 'anulik', 'harut'].filter(h => h !== G.S.hero)); setTimeout(() => { add({ who: other, text: G.pick(replies[other]) }); G.sfx('soft'); log.parentNode && (log.parentNode.scrollTop = 1e6); }, 900); } }, q))));
      return box;
    }
    if (startApp) open(startApp); else home();
    return root;
  }
  return { screen, openApp };
})();
