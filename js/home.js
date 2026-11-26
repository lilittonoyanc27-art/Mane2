/* ===== Главный экран (как в оригинале), выбор режима, хабы героев, коллекция, достижения ===== */
window.HOME = (function () {
  const { el } = G;

  function heroSwitcher(onChange) {
    const wrap = el('div', { class: 'row', style: { gap: '6px' } });
    for (const id of ['mane', 'anulik', 'harut']) {
      const b = el('button', { class: 'icon-btn', title: G.HEROES[id].name, style: { padding: 0, overflow: 'hidden', outline: G.S.hero === id ? '4px solid var(--pink)' : 'none', background: '#ffe6f3' }, html: ART.face(id),
        onclick: () => { setHero(id); onChange ? onChange(id) : G.refresh(); } });
      wrap.append(b);
    }
    return wrap;
  }
  function setHero(id) {
    G.S.hero = id; G.save(); G.sfx('magic');
    const L = DATA.GREET[id]; G.toast(G.HEROES[id].emoji + ' Теперь играет: ' + G.HEROES[id].name); G.speak(L.self.text, id, L.self.hy);
  }

  /* ---------- титульный экран ---------- */
  function title(ctx) {
    ART.init();
    const root = el('div', { class: 'screen' });
    const sky = el('div', { class: 'title-scene' }, el('div', { class: 'hill full' }));
    const sc = el('div', { class: 'title-stage' });
    sky.append(sc);
    const pos = (node, s) => { Object.assign(node.style, { position: 'absolute' }, s); return node; };
    sc.append(
      pos(el('div', { html: ART.rainbow() }), { left: '12%', right: '12%', bottom: '44%', height: '46%' }),
      pos(el('div', { html: ART.castle() }), { left: '24%', right: '24%', bottom: '36%', height: '58%' }),
      el('div', { class: 'hill' }),
      pos(el('div', { html: ART.pine() }), { left: '2%', bottom: '30%', width: '15%', height: '30%' }),
      pos(el('div', { html: ART.tree('#93e38a') }), { left: '13%', bottom: '34%', width: '16%', height: '34%' }),
      pos(el('div', { html: ART.tree('#f7a8cf') }), { right: '17%', bottom: '38%', width: '17%', height: '34%' }),
      pos(el('div', { html: ART.tree('#c7a6f4') }), { right: '2%', bottom: '32%', width: '16%', height: '30%' }),
    );
    // цветы, грибы, конфетти-камушки
    const fl = [['#b48cf0', 16, 22], ['#f06fb0', 26, 20], ['#8cc8ff', 36, 18], ['#ffad66', 58, 20], ['#ffd45a', 66, 22], ['#f45b6a', 76, 24]];
    fl.forEach(([c, l, b]) => sc.append(pos(el('div', { html: ART.flower(c), class: 'float', style: { animationDelay: G.rand(0, 2) + 's' } }), { left: l + '%', bottom: b + '%', width: '6%', height: '14%', zIndex: 7 })));
    sc.append(pos(el('div', { html: ART.mushroom() }), { left: '22%', bottom: '25%', width: '5%', height: '7%' }), pos(el('div', { html: ART.mushroom('#c3a2ff') }), { right: '28%', bottom: '28%', width: '4.5%', height: '6%' }));
    for (let i = 0; i < 26; i++) sc.append(pos(el('i'), { left: G.rand(0, 98) + '%', bottom: G.rand(3, 30) + '%', width: '14px', height: '9px', borderRadius: '50%', background: G.pick(['#f6a3c7', '#ffd45a', '#ffad66', '#fff', '#c3a2ff']) }));
    [['#f6a6d8', '#b48cf0', 20, 52], ['#ffd45a', '#f6a6d8', 30, 70], ['#8cc8ff', '#f6a6d8', 80, 55], ['#ffad66', '#b48cf0', 56, 42]].forEach(([a, b, l, bt]) =>
      sc.append(pos(el('div', { html: ART.butterfly(a, b), class: 'float', style: { animationDuration: G.rand(2, 4) + 's' } }), { left: l + '%', bottom: bt + '%', width: '4%', height: '4%', zIndex: 8 })));

    // герои: Мане в центре (как в оригинале), Анулик и Харутюн рядом
    const chars = [
      { who: 'harut', l: 34, b: 22, w: 13, h: 34 },
      { who: 'mane', l: 50, b: 24, w: 15, h: 34 },
      { who: 'anulik', l: 65, b: 22, w: 12, h: 33 },
    ];
    for (const c of chars) {
      const n = el('div', { class: 'tchar', style: { left: c.l + '%', bottom: c.b + '%', width: c.w + '%', height: c.h + '%', cursor: 'pointer' }, html: ART.hero(c.who, { wave: c.who === 'mane' }) });
      n.onclick = () => { G.sfx('pop'); n.classList.add('wiggle'); setTimeout(() => n.classList.remove('wiggle'), 500); const L = DATA.GREET[c.who]; G.say([L.self], { host: root }); };
      sc.append(n);
    }
    sc.append(pos(el('div', { html: ART.cat(), class: 'float' }), { left: '23%', bottom: '25%', width: '8%', height: '12%', zIndex: 7, cursor: 'pointer' }));
    sc.append(pos(el('div', { html: ART.bunny() }), { left: '74%', bottom: '27%', width: '7%', height: '13%', zIndex: 7 }));
    sc.append(pos(el('div', { html: ART.fairy(), class: 'float' }), { left: '28%', bottom: '58%', width: '7%', height: '13%', zIndex: 7 }));
    sc.lastChild.onclick = () => { G.sfx('magic'); G.say({ who: 'mane', text: 'Это моя подружка-фея! Она прячет секреты по всему городу. Ищи блестящие ✨ места!' }, { host: root }); };

    const logo = el('div', { class: 'title-logo' }, el('h1', null, 'Մանեի աշխարհը'), el('br'), el('div', { class: 'sub' }, 'Волшебный мир Мане'));
    const btns = el('div', { class: 'title-btns' },
      el('button', { class: 'orb purple', 'aria-label': 'Подарки', onclick: () => { G.sfx('tap'); G.go(collection); } }, '🎁'),
      el('button', { class: 'orb main', 'aria-label': 'Играть', onclick: () => { G.sfx('pop'); G.go(modes); } }, el('div', { class: 'play-tri' })),
      el('button', { class: 'orb yellow', 'aria-label': 'Достижения', onclick: () => { G.sfx('tap'); G.go(achievements); } }, '👑'));
    const set = el('button', { class: 'icon-btn settings-fab', 'aria-label': 'Настройки', onclick: () => G.go(settings) }, '⚙️');
    const ph = el('button', { class: 'icon-btn stats-fab', 'aria-label': 'Смартфон', onclick: () => G.go(PHONE.screen) }, '📱');
    root.append(sky, logo, btns, set, ph);
    return root;
  }

  /* ---------- выбор режима ---------- */
  function modes() {
    const { root, body } = G.screen({ title: 'Кто сегодня играет?', sub: 'Ով է այսօր խաղում' });
    const g = el('div', { class: 'grid big' });
    const faces = { mane: ['mane'], anulik: ['anulik'], harut: ['harut'], family: ['mane', 'harut', 'anulik'], duo: ['mane', 'anulik'] };
    const desc = { mane: 'Простые яркие игры с голосом, без спешки', anulik: 'Сложные симуляторы, тайны и творчество', harut: 'Машина, кухня, истории и сюрпризы',
      family: '12 больших приключений втроём', duo: 'Два игрока по очереди и соревнования' };
    for (const id in G.MODES) {
      const m = G.MODES[id];
      g.append(el('button', { class: 'card hero-card', onclick: () => pickMode(id) },
        el('div', { class: 'row', style: { justifyContent: 'center', height: '150px', gap: '0', flexWrap: 'nowrap' }, html: faces[id].map(w => ART.hero(w, { wave: w === 'mane' }).replace('<svg', '<svg style="height:' + (faces[id].length > 2 ? 120 : 150) + 'px;width:auto;flex:0 0 auto"')).join('') }),
        el('b', null, m.emoji + ' ' + m.title), el('small', null, desc[id])));
    }
    body.append(g);
    return root;
  }
  function pickMode(id) {
    G.S.mode = id; G.S.hero = G.MODES[id].hero; G.save(); G.sfx('magic');
    if (id === 'duo') G.flag('duo');
    G.go(hub);
  }

  /* ---------- хаб ---------- */
  function hub() {
    const mode = G.S.mode;
    const { root, body } = G.screen({ title: G.MODES[mode].emoji + ' ' + G.MODES[mode].title, sub: 'Играет: ' + G.HEROES[G.S.hero].name, right: heroSwitcher(() => G.refresh()) });
    const hero = G.S.hero;
    const items = [];
    if (mode === 'family') {
      items.push({ em: '🧭', t: 'Семейные приключения', s: '12 больших историй втроём', fn: () => G.go(ADV.menu, 'family') });
      items.push({ em: '💞', t: 'Сёстры вместе', s: 'Мане + Анулик', fn: () => G.go(ADV.menu, 'sisters') });
    }
    if (mode === 'duo') {
      items.push({ em: '🤝', t: 'Приключения вдвоём', s: 'Игроки ходят по очереди', fn: () => G.go(ADV.menu, 'duo') });
      items.push({ em: '🎈', t: 'Гонка шариков', s: 'Экран делится пополам', fn: () => G.go(ADV.duoRace) });
      items.push({ em: '🧠', t: 'Семейная викторина', s: 'Вопросы для малышки и подростка', fn: () => G.go(ADV.duoQuiz) });
    }
    items.push({ em: '🗺️', t: 'Открытый мир', s: '16 мест, транспорт, секреты', fn: () => G.go(WORLD.map) });
    items.push({ em: '🎮', t: 'Игры: ' + G.HEROES[hero].name, s: GAMES.list(hero).length + ' мини-игр', fn: () => G.go(GAMES.menu, hero) });
    if (mode !== 'family' && mode !== 'duo') items.push({ em: '🧭', t: 'Приключения', s: 'Вместе с семьёй', fn: () => G.go(ADV.menu, 'family') });
    if (hero !== 'harut' && mode !== 'family') items.push({ em: '💞', t: 'Сёстры вместе', s: '10 совместных занятий', fn: () => G.go(ADV.menu, 'sisters') });
    items.push({ em: '📱', t: hero === 'anulik' ? 'Мой смартфон' : 'Смартфон', s: 'Карта, альбом, задания', fn: () => G.go(PHONE.screen) });
    items.push({ em: '📖', t: 'Истории Харутюна', s: 'Добрые сказки на ночь', fn: () => G.go(GAMES.stories) });
    items.push({ em: '🎁', t: 'Коллекция', s: G.S.souvenirs.length + ' сувениров', fn: () => G.go(collection) });
    items.push({ em: '👑', t: 'Достижения', s: Object.keys(G.S.achievements).length + ' из ' + G.ACH.length, fn: () => G.go(achievements) });

    const top = el('div', { class: 'row', style: { alignItems: 'flex-end', gap: '14px', marginBottom: '6px' } },
      el('div', { style: { width: '110px', height: '160px' }, html: ART.hero(hero, { wave: true }) }),
      el('div', { class: 'card', style: { flex: 1, textAlign: 'left' } },
        el('b', null, G.HEROES[hero].hy + ' · ' + G.HEROES[hero].name + ', ' + G.HEROES[hero].age), el('small', null, G.HEROES[hero].about),
        dailyMini()));
    const g = el('div', { class: 'grid' });
    items.forEach(it => g.append(el('button', { class: 'card', onclick: () => { G.sfx('tap'); it.fn(); } }, el('span', { class: 'em' }, it.em), el('b', null, it.t), el('small', null, it.s))));
    body.append(top, g);
    // приветствие Харутюна (персональное)
    if (!hub._greeted || hub._greeted !== hero + mode) {
      hub._greeted = hero + mode;
      const gr = DATA.GREET[hero];
      setTimeout(() => G.say(gr.lines, { host: root }), 400);
    }
    return root;
  }
  function dailyMini() {
    G.ensureDaily();
    const box = el('div', { style: { marginTop: '8px' } }, el('small', null, '📅 Задания дня (серия: ' + G.S.daily.streak + ')'));
    for (const t of G.S.daily.tasks) {
      const d = G.DAILY_POOL.find(p => p.id === t.id);
      box.append(el('div', { style: { fontWeight: 800, fontSize: '14px', color: t.done ? '#3f9a3a' : 'var(--ink2)' } }, (t.done ? '✅ ' : '⬜ ') + d.text + ' (' + Math.min(t.n, d.need) + '/' + d.need + ')'));
    }
    return box;
  }

  /* ---------- коллекция подарков и сувениров ---------- */
  function collection() {
    const { root, body } = G.screen({ title: '🎁 Подарки и сувениры', sub: 'Собрано: ' + G.S.souvenirs.length + ' из ' + Object.keys(DATA.SOUVENIRS).length });
    const g = el('div', { class: 'grid' });
    for (const id in DATA.SOUVENIRS) {
      const s = DATA.SOUVENIRS[id], have = G.S.souvenirs.includes(id);
      g.append(el('button', { class: 'card' + (have ? '' : ' locked'), onclick: () => { if (have) { G.sfx('magic'); G.speak(s.name, G.S.hero); } else G.toast('Ещё не найдено: ' + s.hint); } },
        el('span', { class: 'em' }, have ? s.emoji : '❔'), el('b', null, have ? s.name : '???'), el('small', null, have ? s.from : s.hint)));
    }
    body.append(g);
    return root;
  }

  /* ---------- достижения ---------- */
  function achievements() {
    const { root, body } = G.screen({ title: '👑 Достижения', sub: Object.keys(G.S.achievements).length + ' из ' + G.ACH.length + ' · ⭐ ' + G.S.stars });
    const g = el('div', { class: 'grid' });
    for (const a of G.ACH) {
      const got = G.S.achievements[a.id];
      g.append(el('div', { class: 'card' + (got ? ' done' : ' locked') }, el('span', { class: 'em' }, got ? a.emoji : '🔒'), el('b', null, a.name), el('small', null, got ? 'Получено ' + got : 'Ещё впереди')));
    }
    const st = el('div', { class: 'card', style: { marginTop: '16px', textAlign: 'left' } },
      el('b', null, '📊 Статистика'),
      el('small', null, 'Сыграно игр: ' + Object.keys(G.S.played).length + ' · Мест посещено: ' + G.S.visited.length + '/16 · Секретов: ' + G.S.secrets.length +
        ' · Приключений: ' + Object.keys(G.S.adventures).length + ' · Стран: ' + G.S.countries.length + ' · Спасено животных: ' + G.S.animals.length + ' · Фото: ' + G.S.album.length));
    body.append(g, st);
    return root;
  }

  /* ---------- настройки ---------- */
  function settings() {
    const { root, body } = G.screen({ title: '⚙️ Настройки' });
    const S = G.S.settings;
    const tog = (key, label) => el('button', { class: 'list-item', style: { width: '100%' }, onclick: () => { S[key] = !S[key]; G.save(); G.refresh(); } },
      el('span', { class: 'em' }, S[key] ? '✅' : '⬜'), label);
    const lv = ['auto', 'easy', 'normal', 'hard'], lvN = { auto: 'Авто (по герою)', easy: 'Лёгкий (Мане)', normal: 'Средний', hard: 'Сложный (Анулик)' };
    S.level = S.level || 'auto';
    body.append(
      tog('voice', '🗣️ Голосовые подсказки и диалоги'), tog('sound', '🔊 Звуковые эффекты'), tog('autoTime', '🌗 Смена дня и ночи и погоды'),
      el('div', { class: 'section-title' }, '🎚️ Уровень сложности'),
      el('div', { class: 'tabs' }, ...lv.map(l => el('button', { class: 'tab' + (S.level === l ? ' on' : ''), onclick: () => { S.level = l; G.save(); G.refresh(); } }, lvN[l]))),
      el('div', { class: 'section-title' }, '💾 Прогресс'),
      el('p', { style: { fontWeight: 700 } }, 'Игра сохраняется автоматически на этом устройстве.'),
      el('button', { class: 'btn white', onclick: async () => { if (await G.confirmBox('Начать заново?', 'Весь прогресс, звёзды и фото будут удалены.', 'Удалить', 'Отмена')) { G.resetAll(); G.home(); } } }, '🗑️ Сбросить прогресс'),
      el('div', { class: 'section-title' }, 'ℹ️ Управление'),
      el('p', { style: { fontWeight: 700, lineHeight: 1.5 } }, 'Мышь и касание — нажимайте и перетаскивайте. В городе: стрелки / WASD или джойстик, Пробел/Enter — войти, нажмите на землю — герой пойдёт туда.'));
    return root;
  }

  return { title, modes, hub, collection, achievements, settings, heroSwitcher, setHero };
})();
