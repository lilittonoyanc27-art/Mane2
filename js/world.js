/* ===== Открытый мир: город, транспорт, события, 16 локаций и комнаты дома ===== */
window.WORLD = (function () {
  const { el, rand, ri, pick, clamp } = G;
  const W = 2600, H = 1900;
  const COLS = [380, 980, 1600, 2220], ROWS = [430, 830, 1240, 1660];

  // дополнительные игры локаций (настоящие мини-игры на движках)
  const LOCAL = {
    loc_market: { who: 'any', emoji: '🛒', title: 'Продукты для пикника', desc: 'Супермаркет', engine: 'shop', cfg: { items: [{ e: '🍎', n: 'яблоки' }, { e: '🥖', n: 'хлеб' }, { e: '🧀', n: 'сыр' }, { e: '🥛', n: 'молоко' }, { e: '🍉', n: 'арбуз' }, { e: '🥒', n: 'огурцы' }, { e: '🍅', n: 'помидоры' }, { e: '🧃', n: 'сок' }], extra: [{ e: '🍬' }, { e: '🍫' }, { e: '🧁' }, { e: '🍭' }, { e: '🥤' }, { e: '🍟' }] } },
    loc_fruitveg: { who: 'any', emoji: '🥕', title: 'Фрукты или овощи?', desc: 'Разложи по ящикам', engine: 'sort', cfg: { bins: [{ key: 'f', label: 'Фрукты', color: '#ff8a8a', emoji: '🍓' }, { key: 'v', label: 'Овощи', color: '#5cbf55', emoji: '🥦' }],
      items: [['🍎', 'f'], ['🍌', 'f'], ['🍇', 'f'], ['🍐', 'f'], ['🍊', 'f'], ['🍑', 'f'], ['🥕', 'v'], ['🥦', 'v'], ['🥒', 'v'], ['🍆', 'v'], ['🌽', 'v'], ['🥔', 'v']].map(([e, key]) => ({ e, key })), count: { easy: 6, normal: 10, hard: 12 }, instr: 'Фрукты — в красный ящик, овощи — в зелёный!', win: 'Витрина в порядке!' } },
    loc_popcorn: { who: 'any', emoji: '🍿', title: 'Поймай попкорн', desc: 'Кинотеатр', engine: 'collect', cfg: { mode: 'fall', catcher: '🪣', items: ['🍿', '🍿', '🥤', '🍫'], target: { easy: 10, normal: 15, hard: 20 }, icon: '🍿', instr: 'Двигай ведёрко и лови попкорн!', win: 'Полное ведро попкорна — можно смотреть мультик!', bg: 'linear-gradient(#2a2240,#6a3a7a)' } },
    loc_shoot: { who: 'any', emoji: '🎯', title: 'Тир с шариками', desc: 'Парк развлечений', engine: 'collect', cfg: { mode: 'rise', items: ['🎈', '🎯', '🪅'], hue: true, target: { easy: 12, normal: 16, hard: 22 }, icon: '🎯', instr: 'Попади в шарики и мишени!', win: 'Главный приз — огромный плюшевый единорог! 🦄', bg: 'linear-gradient(#ffe6f3,#c8e6ff)' } },
    loc_zoophoto: { who: 'any', emoji: '🦒', title: 'Фотосафари в зоопарке', desc: 'Зоопарк', engine: 'photo', cfg: { place: 'Зоопарк', size: 64, targets: ['🦒', '🐘', '🦁', '🦓', '🐒', '🦩', '🐧'], extras: ['🌴', '🦜'], bg: 'linear-gradient(#cfeaff,#e9dca0 60%)' } },
    loc_zooquiz: { who: 'any', emoji: '🐘', title: 'Кто где живёт?', desc: 'Викторина о животных', engine: 'quiz', cfg: { questions: [{ e: '🐧', q: 'Где живут пингвины?', a: ['Во льдах Антарктиды', 'В пустыне', 'В лесу', 'В городе'] }, { e: '🐪', q: 'Кто живёт в пустыне и долго обходится без воды?', a: ['Верблюд', 'Пингвин', 'Дельфин', 'Лягушка'] }, { e: '🐼', q: 'Что ест панда?', a: ['Бамбук', 'Рыбу', 'Мороженое', 'Камни'] }, { e: '🦒', q: 'У кого самая длинная шея?', a: ['У жирафа', 'У зайца', 'У кота', 'У ежа'] }, { e: '🐘', q: 'Чем слон набирает воду?', a: ['Хоботом', 'Ушами', 'Хвостом', 'Ногой'] }, { e: '🐸', q: 'Кем сначала бывает лягушка?', a: ['Головастиком', 'Гусеницей', 'Птенцом', 'Котёнком'] }, { e: '🦉', q: 'Когда охотится сова?', a: ['Ночью', 'Утром', 'Только в обед', 'Никогда'] }] } },
    loc_ducks: { who: 'any', emoji: '🦆', title: 'Утиные горки', desc: 'Аквапарк', engine: 'collect', cfg: { mode: 'swim', items: ['🦆', '🛟', '🐳', '🐬'], target: { easy: 10, normal: 14, hard: 18 }, icon: '🦆', instr: 'Лови резиновых уточек в бассейне!', win: 'Все уточки пойманы! Брызги-брызги!', bg: 'linear-gradient(#bff3ff,#38b6e8)' } },
    loc_suitcase: { who: 'any', emoji: '🧳', title: 'Собери чемодан', desc: 'Аэропорт', engine: 'sort', cfg: { bins: [{ key: 's', label: 'В чемодан', color: '#b48cf0', emoji: '🧳' }, { key: 'h', label: 'Оставить дома', color: '#9a8a7a', emoji: '🏠' }],
      items: [['👙', 's'], ['🩴', 's'], ['🕶️', 's'], ['🧴', 's'], ['👒', 's'], ['🛂', 's'], ['📷', 's'], ['🪥', 's'], ['🛋️', 'h'], ['🖥️', 'h'], ['🪴', 'h'], ['🐠', 'h'], ['🚲', 'h'], ['🛁', 'h']].map(([e, key]) => ({ e, key })), count: { easy: 6, normal: 10, hard: 14 }, instr: 'Что берём на море? Нужное — в чемодан, тяжёлое — оставим дома!', hintWrong: 'Хм, это не поместится в чемодан!', win: 'Чемодан собран! Летим!' } },
    loc_train: { who: 'any', emoji: '🚂', title: 'Поезд в горы', desc: 'Железнодорожный вокзал', engine: 'drive', cfg: { car: '🚂', dest: '⛰️ Горы', instr: 'Веди поезд: собирай звёзды, объезжай камни!', win: 'Поезд прибыл! Чух-чух, станция «Горы»!' } },
    loc_transport: { who: 'any', emoji: '🚌', title: 'Транспорт: пары', desc: 'Вокзал', engine: 'memory', cfg: { items: ['🚂', '🚌', '✈️', '🚗', '🚲', '🚁', '⛵', '🚀', '🛴', '🚕', '🚜', '🚒', '🚑', '🛳️'] } },
    loc_shells: { who: 'any', emoji: '🐚', title: 'Ракушки в песке', desc: 'Пляж', engine: 'collect', cfg: { mode: 'hidden', covers: ['🏖️', '🪣', '⛱️', '🏰', '🪨', '🌴', '🛟', '🩴', '🧺', '🌊', '🪸', '🥥'], items: ['🐚', '🦀', '⭐', '🦪', '🐢'], target: { easy: 3, normal: 5, hard: 6 }, icon: '🐚', instr: 'Ищи ракушки и крабиков под предметами на пляже!', win: 'Какая красивая коллекция ракушек!', bg: 'linear-gradient(#bfe6ff,#f7e2b0 55%)' } },
    loc_beachphoto: { who: 'any', emoji: '📸', title: 'Пляжная фотосессия', desc: 'Пляж', engine: 'photo', cfg: { place: 'Пляж', targets: ['🦀', '🐬', '🦩', '⛵', '🪁', '🐢'], extras: ['☁️', '🌊'], bg: 'linear-gradient(#9fdcff,#bfe6ff 50%,#f7e2b0 70%)' } },
    loc_berries: { who: 'any', emoji: '🫐', title: 'Ягоды волшебного леса', desc: 'Волшебный лес', engine: 'collect', cfg: { mode: 'tree', items: ['🫐', '🍓', '🍒', '🍄', '🌰'], target: { easy: 8, normal: 10, hard: 13 }, icon: '🫐', instr: 'Собери ягоды и орешки для лесных друзей!', win: 'Лесные друзья говорят спасибо!', bg: 'linear-gradient(#cfeec8,#7fc77a)' } },
    loc_forestmaze: { who: 'any', emoji: '🍄', title: 'Тропинки леса', desc: 'Лабиринт к домику феи', engine: 'maze', cfg: { goal: '🧚', wall: '#5cbf55', floor: '#eaffdf', instr: 'Найди дорогу к домику феи!', win: 'Фея встречает тебя с улыбкой!' } },
    loc_mountphoto: { who: 'any', emoji: '🦅', title: 'Горная фотоохота', desc: 'Горы', engine: 'photo', cfg: { place: 'Горы', fly: true, targets: ['🦅', '🐐', '🦌', '🦋', '🐿️'], extras: ['☁️', '🌲'], bg: 'linear-gradient(#cfe9ff,#e9f0f7 40%,#9fd08a 70%)' } },
    loc_snow: { who: 'any', emoji: '❄️', title: 'Снежинки на вершине', desc: 'Горы', engine: 'collect', cfg: { mode: 'fall', catcher: '🧤', items: ['❄️', '❄️', '⛄', '⭐'], target: { easy: 10, normal: 14, hard: 18 }, icon: '❄️', instr: 'Лови снежинки варежкой!', win: 'Хватит на целого снеговика!', bg: 'linear-gradient(#dfefff,#ffffff)' } },
    loc_planets: { who: 'any', emoji: '🪐', title: 'Звёздный лабиринт', desc: 'Космическая станция', engine: 'maze', cfg: { goal: '🪐', wall: '#8cc8ff', floor: '#24205a', instr: 'Проведи ракету между астероидами к планете!', win: 'Посадка на планету выполнена!' } },
    loc_stardust: { who: 'any', emoji: '⭐', title: 'Звёздная пыль', desc: 'Космос', engine: 'collect', cfg: { mode: 'rise', items: ['⭐', '🌟', '✨', '☄️'], target: { easy: 12, normal: 16, hard: 20 }, icon: '⭐', instr: 'Собери звёздную пыль для топлива ракеты!', win: 'Бак ракеты полон звёздного топлива!', bg: 'linear-gradient(#0c0a2a,#3a2a7a)' } },
    loc_spacequiz: { who: 'any', emoji: '🔭', title: 'Космическая викторина', desc: 'Планеты и звёзды', engine: 'quiz', cfg: { questions: DATA.Q_SPACE } },
    loc_cityphoto: { who: 'any', emoji: '🏙️', title: 'Фотопрогулка по городу', desc: 'Большой город', engine: 'photo', cfg: { place: 'Город', targets: ['🕊️', '🚲', '🐕', '🎈', '🚕', '🛴'], extras: ['🌳'], bg: 'linear-gradient(#e6e0f6,#d9d2e6 60%)' } },
    loc_fountain: { who: 'any', emoji: '⛲', title: 'Монетки в фонтане', desc: 'Загадай желание', engine: 'collect', cfg: { mode: 'swim', items: ['🪙', '🐟', '💎'], target: { easy: 8, normal: 12, hard: 16 }, icon: '🪙', instr: 'Поймай блестящие монетки в фонтане!', win: 'Желание обязательно сбудется!', bg: 'linear-gradient(#cfeaff,#7fc3f0)' } },
    loc_studiosing: { who: 'any', emoji: '🎤', title: 'Песенка в студии', desc: 'Запись на ксилофоне', engine: 'music', cfg: {} },
  };
  Object.entries(LOCAL).forEach(([id, g]) => { g.id = id; GAMES.byId[id] = g; GAMES.L.push(g); });

  /* ---------- 16 локаций ---------- */
  const P = {
    home: { name: 'Семейный дом', e: '🏡', c: 0, r: 0, bg: 'linear-gradient(#fff0f7,#ffe6f3 55%)', ground: '#e8c9a0',
      decor: [['🛋️', 18, 72], ['🖼️', 30, 24], ['🪴', 8, 64], ['🕰️', 58, 22], ['🧸', 44, 78]],
      hot: [{ e: '📺', x: 70, y: 52, say: 'Телевизор! Вечером будет семейный кинотеатр.' }, { e: '🎹', x: 86, y: 62, say: 'Пианино! Плим-плим-плям!', sfx: 'magic' }, { e: '🪟', x: 46, y: 28, say: 'В окно видно радугу над городом.' }],
      npc: { e: '🐱', name: 'Котик Рыжик', x: 56, y: 76, lines: ['Мурр! Я охраняю дом, пока вас нет.', 'Мур-мяу! Мане обещала со мной поиграть!', 'Под диваном самое уютное место. Мурр.'] },
      secret: { x: 92, y: 88, sv: { emoji: '🗝️', name: 'Золотой ключик' } },
      acts: [{ e: '🎀', t: 'Комната Мане', place: 'room_mane' }, { e: '📸', t: 'Комната Анулик', place: 'room_anulik' }, { e: '🍳', t: 'Кухня Харутюна', game: 'h_kitchen' }, { e: '🌷', t: 'Сад: посадка цветов', game: 'm_flowers' }, { e: '🏰', t: 'Волшебный семейный дом', adv: 'magic_house' }, { e: '🍿', t: 'Домашний кинотеатр', adv: 'sis_cinema' }] },
    city: { name: 'Большой город', e: '🏙️', c: 1, r: 0, outdoor: true, bg: 'linear-gradient(#e6e0f6,#f3e6ff 55%)', ground: '#d9d2e6',
      decor: [['🏢', 10, 40], ['🏬', 88, 38], ['🌳', 24, 60], ['🚦', 70, 50], ['🌳', 80, 66]],
      hot: [{ e: '⛲', x: 50, y: 58, say: 'Фонтан! Бросим монетку и загадаем желание.', sfx: 'splash' }, { e: '🕊️', x: 36, y: 72, say: 'Голуби курлычут: курлы-курлы!' }, { e: '🚕', x: 66, y: 80, say: 'Такси би-бип! Поехали кататься!', sfx: 'honk' }],
      npc: { e: '🧑‍🎤', name: 'Уличный музыкант', x: 30, y: 52, lines: ['Привет! Хотите, сыграю на дудуке?', 'Музыка делает город добрее!', 'Анулик, приходи в студию — запишем песню!'] },
      secret: { x: 6, y: 30, sv: { emoji: '🪙', name: 'Старинная монетка' } },
      acts: [{ e: '📸', t: 'Фотопрогулка', game: 'loc_cityphoto' }, { e: '🪙', t: 'Монетки в фонтане', game: 'loc_fountain' }, { e: '🕵️‍♀️', t: 'Детективное приключение', adv: 'detective' }, { e: '🔍', t: 'Найди отличия на улице', game: 'm_diff' }] },
    mall: { name: 'Торговый центр', e: '🏬', c: 2, r: 0, bg: 'linear-gradient(#ffe6f3,#f3e6ff 55%)', ground: '#f2f2f2',
      decor: [['👗', 12, 40], ['👟', 26, 30], ['🛍️', 82, 40], ['💄', 70, 30], ['🪞', 92, 60]],
      hot: [{ e: '🛗', x: 50, y: 40, say: 'Эскалатор едет вверх-вниз, вжух!', sfx: 'whoosh' }, { e: '🧸', x: 36, y: 66, say: 'Витрина с игрушками! Ой, какой мишка!' }, { e: '🎮', x: 64, y: 68, say: 'Зона игр! Но сначала — покупки.' }],
      npc: { e: '👩‍💼', name: 'Продавец Лусине', x: 80, y: 66, lines: ['Добро пожаловать! Сегодня скидки на летнюю коллекцию.', 'Анулик, у тебя отличный вкус!', 'Мане, для тебя есть наклейки с бабочками!'] },
      secret: { x: 96, y: 22, sv: { emoji: '💳', name: 'Карта постоянного клиента' } },
      acts: [{ e: '👗', t: 'Студия моды', game: 'a_fashion' }, { e: '🛍️', t: 'Симулятор покупок', game: 'a_shopping' }, { e: '🎀', t: 'Наряды для куколки', game: 'm_outfits' }, { e: '👭', t: 'Сёстры выбирают одежду', adv: 'sis_clothes' }, { e: '🧸', t: 'Магазин игрушек', game: 'm_toyshop' }] },
    market: { name: 'Супермаркет', e: '🛒', c: 3, r: 0, bg: 'linear-gradient(#e6ffe0,#fff7d6 55%)', ground: '#f2f2f2',
      decor: [['🥫', 12, 34], ['🧃', 24, 30], ['🥖', 80, 34], ['🧀', 90, 44], ['🍉', 70, 30]],
      hot: [{ e: '🛒', x: 40, y: 72, say: 'Тележка! Мане, садись, прокачу!', sfx: 'whoosh' }, { e: '🍎', x: 56, y: 52, say: 'Свежие яблочки из Арарата!' }, { e: '🧾', x: 74, y: 70, say: 'Касса: пик-пик-пик!', sfx: 'coin' }],
      npc: { e: '👨‍🌾', name: 'Фермер Арам', x: 22, y: 64, lines: ['Абрикосы — самые сладкие в мире!', 'Возьмите зелень для толмы!', 'Мане, держи яблочко в подарок!'] },
      secret: { x: 4, y: 82, sv: { emoji: '🍑', name: 'Золотой абрикос' } },
      acts: [{ e: '🧺', t: 'Продукты для пикника', game: 'loc_market' }, { e: '🥕', t: 'Фрукты или овощи?', game: 'loc_fruitveg' }, { e: '🔢', t: 'Считаем покупки', game: 'm_count' }, { e: '👭', t: 'Сёстры за покупками', adv: 'sis_shopping' }] },
    cinema: { name: 'Кинотеатр', e: '🎬', c: 0, r: 1, bg: 'linear-gradient(#2a2240,#5a3a7a 55%)', ground: '#7a2a4a',
      decor: [['🎞️', 14, 30], ['🎟️', 86, 32], ['💺', 30, 78], ['💺', 44, 80], ['💺', 58, 80]],
      hot: [{ e: '📽️', x: 50, y: 30, say: 'Проектор включается… начинается мультик!', sfx: 'magic' }, { e: '🍿', x: 72, y: 66, say: 'Попкорн! Хрум-хрум!' }, { e: '🎟️', x: 22, y: 56, say: 'Три билета: для Мане, Анулик и дяди!' }],
      npc: { e: '🧑‍🦱', name: 'Киномеханик Давид', x: 84, y: 60, lines: ['Сегодня мультфильм о дружбе!', 'Анулик, хочешь научиться монтировать кино?', 'Тсс! Фильм начинается!'] },
      secret: { x: 96, y: 14, sv: { emoji: '🎞️', name: 'Кадр из старого фильма' } },
      acts: [{ e: '🎬', t: 'Студия видеомонтажа', game: 'a_video' }, { e: '🍿', t: 'Поймай попкорн', game: 'loc_popcorn' }, { e: '🃏', t: 'Карточки-герои', game: 'm_memory' }, { e: '🛋️', t: 'Домашний кинотеатр', adv: 'sis_cinema' }] },
    cafe: { name: 'Кафе и ресторан', e: '☕', c: 1, r: 1, bg: 'linear-gradient(#fff4e6,#ffe6d0 55%)', ground: '#c58a5a',
      decor: [['🪑', 16, 72], ['🪑', 84, 72], ['🍰', 30, 40], ['☕', 70, 40], ['🌸', 92, 30]],
      hot: [{ e: '🎂', x: 48, y: 52, say: 'Торт дня — с клубникой!' }, { e: '🔔', x: 62, y: 66, say: 'Динь! Заказ готов!', sfx: 'star' }, { e: '🍦', x: 34, y: 66, say: 'Мороженое — любимое лакомство Мане!' }],
      npc: { e: '🧑‍🍳', name: 'Шеф Ашот', x: 80, y: 52, lines: ['Харутюн, твой хоровац — лучший в городе!', 'Анулик, хочешь открыть своё кафе? Научу!', 'Мане, попробуй мой новый десерт!'] },
      secret: { x: 6, y: 20, sv: { emoji: '📜', name: 'Секретный рецепт гаты' } },
      acts: [{ e: '☕', t: 'Своё кафе Анулик', game: 'a_cafe' }, { e: '🍦', t: 'Приготовление мороженого', game: 'm_icecream' }, { e: '🎂', t: 'Украшение торта', game: 'm_cake' }, { e: '🧁', t: 'Кондитерская', game: 'a_bakery' }, { e: '👨‍👧‍👧', t: 'Семейное кафе', adv: 'family_cafe' }, { e: '👩‍🍳', t: 'Кулинарные соревнования', game: 'a_cookoff' }] },
    amusement: { name: 'Парк развлечений', e: '🎡', c: 2, r: 1, outdoor: true, bg: 'linear-gradient(#ffe6f3,#c8e6ff 55%)', ground: '#b6ee9e',
      decor: [['🎢', 16, 36], ['🎠', 84, 44], ['🎪', 70, 30], ['🍭', 30, 64]],
      hot: [{ e: '🎡', x: 48, y: 36, say: 'Колесо обозрения! Видно весь город!', sfx: 'magic' }, { e: '🎠', x: 30, y: 52, say: 'Карусель с лошадками — иго-го!' }, { e: '🍦', x: 64, y: 70, say: 'Сладкая вата и мороженое!' }],
      npc: { e: '🤡', name: 'Весёлый клоун Бим', x: 80, y: 68, lines: ['Ха-ха! Хотите шарик-собачку?', 'Кто громче всех смеётся — получает приз!', 'Мане, ты лучше всех ловишь шарики!'] },
      secret: { x: 94, y: 86, sv: { emoji: '🎟️', name: 'Золотой билет' } },
      acts: [{ e: '🎯', t: 'Тир с шариками', game: 'loc_shoot' }, { e: '🎈', t: 'Ловля шариков', game: 'm_balloons' }, { e: '🏗️', t: 'Собственный парк развлечений', adv: 'amusement' }, { e: '🧩', t: 'Пазл-аттракцион', game: 'm_puzzle' }] },
    zoo: { name: 'Зоопарк', e: '🦁', c: 3, r: 1, outdoor: true, bg: 'linear-gradient(#e6ffe0,#fff7d6 55%)', ground: '#c9e6a0',
      decor: [['🌴', 10, 40], ['🦓', 26, 54], ['🐘', 86, 40], ['🦒', 72, 34], ['🌴', 94, 60]],
      hot: [{ e: '🦁', x: 44, y: 50, say: 'Лев зевает: р-р-р-ау! Он добрый и сонный.' }, { e: '🐒', x: 60, y: 40, say: 'Обезьянки качаются на лианах!' }, { e: '🐧', x: 34, y: 74, say: 'Пингвины топают: шлёп-шлёп!' }],
      npc: { e: '🧑‍🔬', name: 'Смотритель Нарек', x: 76, y: 70, lines: ['Хотите помочь покормить животных?', 'Знаете, что жирафы спят всего пару часов в сутки?', 'Мы открываем центр помощи животным — нужны волонтёры!'] },
      secret: { x: 4, y: 88, sv: { emoji: '🪶', name: 'Перо павлина' } },
      acts: [{ e: '📸', t: 'Фотосафари', game: 'loc_zoophoto' }, { e: '🐾', t: 'Центр помощи животным', adv: 'animals' }, { e: '🐶', t: 'Уход за животными', game: 'm_pets' }, { e: '❓', t: 'Кто где живёт?', game: 'loc_zooquiz' }, { e: '💞', t: 'Сёстры и питомцы', adv: 'sis_pets' }] },
    aquapark: { name: 'Аквапарк', e: '🌊', c: 0, r: 2, outdoor: true, bg: 'linear-gradient(#bff3ff,#e6faff 55%)', ground: '#7fd6f0',
      decor: [['🛝', 18, 38], ['⛱️', 84, 50], ['🌴', 92, 32], ['🛟', 30, 70]],
      hot: [{ e: '🌊', x: 50, y: 66, say: 'Волна! Плюх!', sfx: 'splash' }, { e: '🦆', x: 64, y: 74, say: 'Резиновая уточка: кря!' }, { e: '🐳', x: 38, y: 52, say: 'Горка-кит брызгает водой из спины!', sfx: 'splash' }],
      npc: { e: '🏊‍♀️', name: 'Спасатель Мариам', x: 76, y: 60, lines: ['Плаваем только в нарукавниках, Мане!', 'Анулик, горка «Торнадо» — для смелых!', 'Харутюн, не забудь солнцезащитный крем!'] },
      secret: { x: 96, y: 90, sv: { emoji: '🧜‍♀️', name: 'Фигурка русалки' } },
      acts: [{ e: '🦆', t: 'Утиные горки', game: 'loc_ducks' }, { e: '🐠', t: 'Мой аквариум', game: 'm_aquarium' }, { e: '🤿', t: 'Подводное путешествие', adv: 'underwater' }] },
    airport: { name: 'Аэропорт', e: '✈️', c: 1, r: 2, bg: 'linear-gradient(#dff1ff,#f3f7ff 55%)', ground: '#cfd6e6',
      decor: [['🛫', 16, 30], ['🛬', 84, 30], ['🧳', 30, 72], ['🗺️', 70, 40]],
      hot: [{ e: '🛂', x: 46, y: 56, say: 'Паспортный контроль. Улыбнитесь!', sfx: 'click' }, { e: '🖥️', x: 62, y: 44, say: 'Табло: Ереван — Мадрид — Париж — Рим — Токио!' }, { e: '🧳', x: 76, y: 70, say: 'Багаж едет по ленте!' }],
      npc: { e: '👩‍✈️', name: 'Пилот Ани', x: 24, y: 56, lines: ['Добро пожаловать на борт! Пристегните ремни.', 'Анулик, хочешь заглянуть в кабину пилота?', 'Сегодня отличная погода для полёта!'] },
      secret: { x: 94, y: 16, sv: { emoji: '🪽', name: 'Значок «Юный пилот»' } },
      acts: [{ e: '🌍', t: 'Семейное путешествие по миру', adv: 'world_trip' }, { e: '🧳', t: 'Собери чемодан', game: 'loc_suitcase' }, { e: '🗺️', t: 'Организация путешествий', game: 'a_trip' }, { e: '🌐', t: 'Симулятор путешественника', game: 'a_traveler' }] },
    station: { name: 'Ж/д вокзал', e: '🚉', c: 2, r: 2, bg: 'linear-gradient(#f3e6ff,#fff7d6 55%)', ground: '#b8a6a0',
      decor: [['🕰️', 50, 20], ['🛤️', 50, 86], ['🎫', 16, 40], ['🪑', 84, 70]],
      hot: [{ e: '🚂', x: 40, y: 62, say: 'Чух-чух! Поезд отправляется!', sfx: 'honk' }, { e: '🔔', x: 66, y: 40, say: 'Внимание! Поезд в горы прибывает на первый путь!', sfx: 'star' }, { e: '🧃', x: 76, y: 66, say: 'В дорогу — сок и бутерброды.' }],
      npc: { e: '👨‍✈️', name: 'Машинист Гагик', x: 20, y: 64, lines: ['Поезд идёт до самых гор!', 'Мане, хочешь подудеть в гудок?', 'Ту-ту! Все по вагонам!'] },
      secret: { x: 6, y: 18, sv: { emoji: '🎫', name: 'Старинный билет' } },
      acts: [{ e: '🚂', t: 'Поезд в горы', game: 'loc_train' }, { e: '🚌', t: 'Транспорт: найди пары', game: 'loc_transport' }, { e: '🚗', t: 'Семейный автосимулятор', adv: 'car_trip' }] },
    beach: { name: 'Пляж', e: '🏖️', c: 3, r: 2, outdoor: true, bg: 'linear-gradient(#9fdcff,#bfe6ff 50%)', ground: '#f7e2b0',
      decor: [['⛱️', 16, 56], ['🏰', 30, 74], ['🌴', 88, 40], ['⛵', 64, 36]],
      hot: [{ e: '🌊', x: 50, y: 50, say: 'Шум моря: ш-ш-ш…', sfx: 'splash' }, { e: '🦀', x: 72, y: 76, say: 'Крабик бегает боком!' }, { e: '🪁', x: 40, y: 30, say: 'Воздушный змей летит высоко-высоко!' }],
      npc: { e: '🧔', name: 'Капитан Ваган', x: 82, y: 64, lines: ['Ахой! Я знаю путь к волшебному острову!', 'Говорят, на острове спрятан сундук с сокровищами.', 'Мой корабль готов — когда отправляемся?'] },
      secret: { x: 96, y: 90, sv: { emoji: '🍾', name: 'Письмо в бутылке' } },
      acts: [{ e: '🏝️', t: 'Тайна волшебного острова', adv: 'island' }, { e: '🐚', t: 'Ракушки в песке', game: 'loc_shells' }, { e: '📸', t: 'Пляжная фотосессия', game: 'loc_beachphoto' }] },
    forest: { name: 'Волшебный лес', e: '🌲', c: 0, r: 3, outdoor: true, bg: 'linear-gradient(#cfeec8,#e6ffe0 55%)', ground: '#8fd07a',
      decor: [['🌲', 8, 40], ['🌳', 24, 30], ['🍄', 36, 74], ['🌲', 90, 36], ['🌸', 70, 76]],
      hot: [{ e: '🦉', x: 74, y: 34, say: 'Сова: у-ху! В лесу спрятан проход к фее…', sfx: 'magic' }, { e: '🦊', x: 58, y: 64, say: 'Лисичка машет хвостиком!' }, { e: '🌈', x: 46, y: 22, say: 'Над лесом — волшебная радуга!' }],
      npc: { e: '🧚', name: 'Лесная фея Лусик', x: 28, y: 56, lines: ['Здравствуй! Я храню лесные секреты.', 'Найди блестящее место — и попадёшь на мою полянку!', 'Добрым детям лес всегда показывает тропинку.'] },
      secret: { x: 94, y: 84, sv: { emoji: '🧚', name: 'Пыльца феи' }, place: 'fairy_glade' },
      acts: [{ e: '🫐', t: 'Ягоды для лесных друзей', game: 'loc_berries' }, { e: '🍄', t: 'Тропинки леса', game: 'loc_forestmaze' }, { e: '🌀', t: 'Волшебный лабиринт', game: 'm_maze' }, { e: '🦔', t: 'Тайна ночного сада', game: 'a_detective', cfg: { caseIndex: 2 } }] },
    mountains: { name: 'Горы', e: '⛰️', c: 1, r: 3, outdoor: true, bg: 'linear-gradient(#cfe9ff,#e9f0f7 55%)', ground: '#9fd08a',
      decor: [['🏔️', 16, 30], ['⛰️', 80, 28], ['🌲', 30, 60], ['⛺', 70, 66], ['🌷', 50, 82]],
      hot: [{ e: '⛪', x: 50, y: 30, say: 'Древний монастырь на скале. Как красиво!' }, { e: '🔥', x: 62, y: 72, say: 'Костёр трещит: треск-треск. Тепло!' }, { e: '🌌', x: 86, y: 14, say: 'Ночью здесь видно тысячи звёзд!' }],
      npc: { e: '🧑‍🌾', name: 'Пастух Гурген', x: 24, y: 70, lines: ['Барашки пасутся на склонах.', 'Тут растут дикие тюльпаны и чабрец.', 'Харутюн, помнишь, как мы ходили в поход в детстве?'] },
      secret: { x: 6, y: 14, sv: { emoji: '💠', name: 'Горный кристалл' } },
      acts: [{ e: '🏕️', t: 'Приключения в горах', adv: 'mountains' }, { e: '🦅', t: 'Горная фотоохота', game: 'loc_mountphoto' }, { e: '❄️', t: 'Снежинки на вершине', game: 'loc_snow' }, { e: '🚙', t: 'Дорога в горы', game: 'h_drive' }] },
    studio: { name: 'Музыкальная студия', e: '🎵', c: 2, r: 3, bg: 'linear-gradient(#2a2240,#4a3a7a 55%)', ground: '#3a2a50',
      decor: [['🎛️', 16, 40], ['🎧', 84, 34], ['🎙️', 30, 60], ['🎹', 70, 64]],
      hot: [{ e: '🥁', x: 46, y: 56, say: 'Бум-бум-тсс!', sfx: 'click' }, { e: '🎸', x: 60, y: 42, say: 'Гитара: трынь-дзынь!', sfx: 'magic' }, { e: '🎺', x: 36, y: 34, say: 'Труба: ту-ру-ру!' }],
      npc: { e: '🧑‍🎤', name: 'Продюсер Мелине', x: 82, y: 64, lines: ['Анулик, у твоей группы есть будущее!', 'Мане, сыграй нам на ксилофоне!', 'Скоро большой музыкальный фестиваль — участвуете?'] },
      secret: { x: 94, y: 88, sv: { emoji: '💿', name: 'Золотая пластинка' } },
      acts: [{ e: '🎸', t: 'Своя группа (битмейкер)', game: 'a_band' }, { e: '🎶', t: 'Музыкальные игры Мане', game: 'm_music' }, { e: '🎪', t: 'Музыкальный фестиваль', adv: 'festival' }, { e: '🎤', t: 'Организация концертов', game: 'a_concert' }] },
    space: { name: 'Космическая станция', e: '🚀', c: 3, r: 3, bg: 'linear-gradient(#0c0a2a,#2a2a6a 55%)', ground: '#4a4a7a',
      decor: [['🪐', 16, 22], ['🌙', 84, 18], ['🛰️', 70, 40], ['⭐', 40, 14], ['✨', 60, 24]],
      hot: [{ e: '🔭', x: 30, y: 56, say: 'В телескоп видно кольца Сатурна!', sfx: 'magic' }, { e: '👩‍🚀', x: 52, y: 60, say: 'Скафандры готовы для всей семьи!' }, { e: '🖲️', x: 70, y: 70, say: 'Кнопка запуска… только по команде!', sfx: 'click' }],
      npc: { e: '🤖', name: 'Робот Бип', x: 82, y: 64, lines: ['Бип-буп! Добро пожаловать на станцию!', 'Для полёта нужна звёздная пыль. Бип!', 'Мане — самый маленький космонавт в истории! Буп!'] },
      secret: { x: 4, y: 88, sv: { emoji: '☄️', name: 'Кусочек метеорита' } },
      acts: [{ e: '🚀', t: 'Космическая экспедиция', adv: 'space' }, { e: '⭐', t: 'Звёздная пыль', game: 'loc_stardust' }, { e: '🪐', t: 'Звёздный лабиринт', game: 'loc_planets' }, { e: '🔭', t: 'Космическая викторина', game: 'loc_spacequiz' }] },

    /* --- комнаты и тайные места (не на карте) --- */
    room_mane: { name: 'Комната Мане', e: '🎀', sub: true, bg: 'linear-gradient(#ffe6f3,#fff0f7 55%)', ground: '#f6c8de',
      decor: [['🛏️', 16, 68], ['🧸', 30, 76], ['🎀', 50, 18], ['🦄', 86, 70], ['🌙', 84, 18]],
      hot: [{ e: '🎨', x: 66, y: 60, say: 'Мои краски! Я нарисую радугу!' }, { e: '🪆', x: 44, y: 66, say: 'Матрёшка, а внутри ещё матрёшка!' }, { e: '🏰', x: 74, y: 40, say: 'Мой кукольный замок!', sfx: 'magic' }],
      npc: { e: '🐰', name: 'Зайка Пушок', x: 58, y: 80, lines: ['Мане, давай играть в прятки!', 'Я спрятал игрушки, найдёшь?', 'Спокойной ночи, Мане!'] },
      secret: { x: 6, y: 30, sv: { emoji: '🧚', name: 'Фея-ночник' } },
      acts: [{ e: '🖍️', t: 'Раскраски', game: 'm_color' }, { e: '🧹', t: 'Уборка комнаты', game: 'm_cleanup' }, { e: '🧸', t: 'Спрятанные игрушки', game: 'm_hidden' }, { e: '🧩', t: 'Пазлы', game: 'm_puzzle' }, { e: '🃏', t: 'Карточки', game: 'm_memory' }, { e: '🧠', t: 'Анулик помогает с головоломкой', adv: 'sis_puzzle' }] },
    room_anulik: { name: 'Комната Анулик', e: '📸', sub: true, bg: 'linear-gradient(#e6d9ff,#f3e6ff 55%)', ground: '#b8a6d9',
      decor: [['🛏️', 14, 68], ['🖥️', 80, 50], ['🎧', 70, 40], ['🗺️', 40, 22], ['🪴', 94, 64]],
      hot: [{ e: '📱', x: 60, y: 66, say: 'Мой смартфон! Тут карта, альбом и задания.', open: 'phone' }, { e: '👗', x: 28, y: 46, say: 'Гардероб! Выберу образ на сегодня.', open: 'wardrobe' }, { e: '📔', x: 46, y: 60, say: 'Фотоальбом семьи.', open: 'album' }, { e: '🗺️', x: 40, y: 22, say: 'Карта путешествий с отметками!', open: 'travel' }, { e: '🏆', x: 86, y: 28, say: 'Полка с наградами.', open: 'ach' }],
      npc: { e: '🐱', name: 'Котик Рыжик', x: 22, y: 82, lines: ['Мурр, Анулик, сфотографируй меня!', 'Мяу! За той картиной что-то скрипит…', 'Мурр… код от тайника знает Харутюн.'] },
      secret: { x: 8, y: 26, sv: { emoji: '🚪', name: 'Тайная дверь' }, place: 'secret_room', e: '🖼️' },
      acts: [{ e: '🛏️', t: 'Дизайн комнаты', game: 'a_room' }, { e: '💍', t: 'Ювелирная мастерская', game: 'a_jewelry' }, { e: '🧠', t: 'Логические головоломки', game: 'a_logic' }, { e: '🔐', t: 'Квест с секретными кодами', game: 'a_codes' }, { e: '🎁', t: 'Подарки друг другу', adv: 'sis_gifts' }, { e: '📔', t: 'Семейный фотоальбом', adv: 'sis_album' }] },
    secret_room: { name: 'Секретная комната', e: '🗝️', sub: true, bg: 'linear-gradient(#3a2a50,#7a5aa6 55%)', ground: '#5a4a70',
      decor: [['🕯️', 14, 40], ['🕯️', 86, 40], ['📜', 30, 70], ['🔮', 70, 34], ['🗺️', 50, 18]],
      hot: [{ e: '🪞', x: 70, y: 60, say: 'Волшебное зеркало меняет погоду в городе!', weather: true }, { e: '⏳', x: 34, y: 52, say: 'Песочные часы меняют день и ночь!', time: true }, { e: '💰', x: 52, y: 70, say: 'Сундук! Внутри — пусто… но рядом записка с шифром.', sfx: 'door' }],
      npc: { e: '👻', name: 'Добрый домовой Тусик', x: 22, y: 76, lines: ['Хи-хи! Я не страшный, я добрый домовой!', 'Сюда приходят только самые любопытные.', 'Разгадай мой шифр — получишь сокровище!'] },
      secret: { x: 94, y: 88, sv: { emoji: '🏺', name: 'Сокровище домового' } },
      acts: [{ e: '🔐', t: 'Шифр домового', game: 'a_codes' }, { e: '🧩', t: 'Пазл старой карты', game: 'm_puzzle' }] },
    fairy_glade: { name: 'Полянка феи', e: '🧚', sub: true, outdoor: true, bg: 'linear-gradient(#ffe6f3,#e6d9ff 55%)', ground: '#c3f4b0',
      decor: [['🍄', 16, 70], ['🌸', 30, 80], ['🦋', 60, 30], ['🌈', 50, 14], ['🍄', 84, 74]],
      hot: [{ e: '🌟', x: 48, y: 50, say: 'Звезда желаний! Загадай что-нибудь доброе!', sfx: 'magic', stars: 3 }, { e: '🦄', x: 72, y: 60, say: 'Единорог кланяется Мане!' }, { e: '🌷', x: 36, y: 64, say: 'Цветы поют тоненькими голосами: ля-ля-ля!', sfx: 'magic' }],
      npc: { e: '🧚', name: 'Фея Лусик', x: 24, y: 52, lines: ['Ты нашла мою полянку! Ты очень внимательная.', 'Каждая улыбка Мане зажигает новую звёздочку.', 'Возвращайся, когда захочешь! Двери всегда открыты.'] },
      secret: { x: 92, y: 20, sv: { emoji: '🪄', name: 'Палочка феи' } },
      acts: [{ e: '🫐', t: 'Ягоды для феи', game: 'loc_berries' }, { e: '🖍️', t: 'Волшебная раскраска', game: 'm_color' }] },
  };
  for (const id in P) { DATA.SOUVENIRS['s_' + id] = { emoji: P[id].secret.sv.emoji, name: P[id].secret.sv.name, from: 'Секрет: ' + P[id].name, hint: 'Ищи ✨ в месте «' + P[id].name + '»' }; }
  const GIFTS = { gift_1: ['🎈', 'Шарик-сердечко'], gift_2: ['🍭', 'Огромный леденец'], gift_3: ['🧩', 'Волшебный пазл'], gift_4: ['🪀', 'Йо-йо'], gift_5: ['📿', 'Браслет дружбы'], gift_6: ['🌟', 'Звезда-подушка'], gift_7: ['🐚', 'Поющая ракушка'], gift_8: ['🪁', 'Воздушный змей'],
    w_secret_1: ['🔮', 'Хрустальный шар'], w_secret_2: ['🧭', 'Компас путешественника'], w_secret_3: ['🏮', 'Фонарик-светлячок'], w_secret_4: ['🍀', 'Четырёхлистный клевер'] };
  for (const k in GIFTS) DATA.SOUVENIRS[k] = { emoji: GIFTS[k][0], name: GIFTS[k][1], from: k.startsWith('w_') ? 'Тайник в городе' : 'Неожиданное приключение', hint: k.startsWith('w_') ? 'Ищи мерцание ✨ на карте города' : 'Гуляй по городу — будут сюрпризы' };

  const placeIds = Object.keys(P).filter(k => !P[k].sub);
  const posOf = id => ({ x: COLS[P[id].c], y: ROWS[P[id].r] });

  /* ================= КАРТА ГОРОДА ================= */
  const VEH = { walk: { e: '', n: 'Пешком', sp: 230 }, scooter: { e: '🛴', n: 'Самокат', sp: 330 }, bike: { e: '🚲', n: 'Велосипед', sp: 400 }, car: { e: '🚙', n: 'Машина Харутюна', sp: 600 } };
  const STOPS = [{ x: 680, y: 520 }, { x: 1900, y: 920 }, { x: 680, y: 1330 }, { x: 1900, y: 1750 }];
  const WSECRETS = [{ x: 140, y: 1050, id: 'w_secret_1' }, { x: 2480, y: 160 }, { x: 1300, y: 1840 }, { x: 2500, y: 1100 }].map((s, i) => Object.assign(s, { id: 'w_secret_' + (i + 1) }));

  function map(ctx) {
    ART.init();
    const S = G.S;
    const root = el('div', { class: 'screen' });
    const view = el('div', { class: 'world-view' });
    const world = el('div', { class: 'world', style: { width: W + 'px', height: H + 'px', background: '#b9ef9f radial-gradient(#a6e48a 3px,transparent 4px) 0 0/46px 46px' } });
    view.append(world);
    // дороги
    ROWS.forEach(y => world.append(el('div', { class: 'road h', style: { left: '60px', top: (y + 40) + 'px', width: (W - 120) + 'px', height: '70px' } })));
    [680, 1290, 1900].forEach(x => world.append(el('div', { class: 'road v', style: { left: (x - 35) + 'px', top: '200px', width: '70px', height: (ROWS[3] - 120) + 'px' } })));
    // вода у пляжа и аквапарка, лес, горы
    world.append(el('div', { style: { position: 'absolute', left: (W - 220) + 'px', top: '1050px', width: '240px', height: '420px', background: 'linear-gradient(90deg,#f7e2b0,#7fc3f0 40%)', borderRadius: '60px 0 0 60px' } }));
    // декор
    const rnd = (seed => () => (seed = (seed * 9301 + 49297) % 233280) / 233280)(7);
    for (let i = 0; i < 150; i++) {
      const x = rnd() * W, y = rnd() * H; const nearRoad = ROWS.some(r => Math.abs(y - r - 75) < 70) || [680, 1290, 1900].some(c => Math.abs(x - c) < 70);
      const nearB = placeIds.some(id => { const p = posOf(id); return Math.abs(p.x - x) < 120 && Math.abs(p.y - y) < 140; });
      if (nearRoad || nearB) continue;
      const zone = y > 1450 && x < 800 ? ['🌲', '🌲', '🍄', '🌳'] : y > 1450 && x < 1400 ? ['⛰️', '🌲', '🪨'] : ['🌳', '🌷', '🌼', '🌳', '🌸', '🪴', '🌻'];
      world.append(el('div', { class: 'deco', style: { left: x + 'px', top: y + 'px', fontSize: (zone[0] === '⛰️' ? 70 : 40) + 'px' } }, zone[Math.floor(rnd() * zone.length)]));
    }
    // здания
    const blds = {};
    placeIds.forEach(id => {
      const p = posOf(id), d = P[id];
      const b = el('div', { class: 'bld', style: { left: (p.x - 80) + 'px', top: (p.y - 130) + 'px', width: '160px', height: '170px' } },
        el('div', { class: 'house' }, d.e), el('div', { class: 'lbl' }, d.name + (S.visited.includes(id) ? ' ✓' : '')));
      b.addEventListener('pointerdown', e => { e.stopPropagation(); target = { x: p.x, y: p.y + 70, enter: id }; G.sfx('tap'); });
      world.append(b); blds[id] = b;
    });
    STOPS.forEach(s => world.append(el('div', { class: 'deco', style: { left: (s.x - 20) + 'px', top: (s.y - 40) + 'px', fontSize: '46px' } }, '🚏')));
    WSECRETS.forEach(s => { if (S.souvenirs.includes(s.id)) return; const n = el('div', { class: 'deco glow', style: { left: s.x + 'px', top: s.y + 'px', fontSize: '30px', opacity: .55, pointerEvents: 'auto', cursor: 'pointer' } }, '✨');
      n.addEventListener('pointerdown', e => { e.stopPropagation(); if (Math.hypot(pos.x - s.x, pos.y - s.y) > 220) { G.toast('Подойди поближе к мерцанию ✨'); target = { x: s.x, y: s.y + 30 }; return; } G.addSouvenir(s.id); G.S.secrets.includes(s.id) || G.S.secrets.push(s.id); G.emit('secret'); n.remove(); });
      world.append(n); });
    // машинки-прохожие
    const cars = ROWS.map((y, i) => { const n = el('div', { class: 'deco', style: { fontSize: '50px', pointerEvents: 'auto', cursor: 'pointer', zIndex: 3 } }, pick(['🚕', '🚌', '🚗', '🚐', '🚓'])); n.addEventListener('pointerdown', e => { e.stopPropagation(); G.sfx('honk'); }); world.append(n); return { n, x: rnd() * W, y: y + 42, v: (i % 2 ? -1 : 1) * rand(90, 150) }; });
    // герой и семья
    const avatar = el('div', { class: 'avatar' }); const veh = el('div', { class: 'veh' });
    const others = ['mane', 'anulik', 'harut'].filter(h => h !== S.hero);
    const fol = others.map(h => { const f = el('div', { class: 'follower', html: ART.hero(h) }); world.append(f); return f; });
    world.append(avatar);
    function drawAvatar() { avatar.innerHTML = S.world.vehicle === 'car' ? '' : ART.hero(S.hero); veh.textContent = VEH[S.world.vehicle].e; avatar.append(veh); if (S.world.vehicle === 'car') { veh.style.fontSize = '90px'; veh.style.bottom = '0'; } else { veh.style.fontSize = '54px'; veh.style.bottom = '-14px'; } fol.forEach(f => f.style.display = S.world.vehicle === 'car' ? 'none' : ''); }
    drawAvatar();
    let pos = { x: S.world.x, y: S.world.y }, target = null, scale = innerWidth < 700 ? .72 : 1, cam = { x: 0, y: 0 };
    const trail = Array.from({ length: 60 }, () => ({ x: pos.x, y: pos.y }));
    let joy = { x: 0, y: 0 }; const keysDown = {};

    // HUD
    const timeP = el('span', { class: 'pill' });
    const bar = el('div', { class: 'topbar', style: { position: 'absolute', left: 0, right: 0, top: 0 } },
      el('button', { class: 'icon-btn', onclick: G.back }, '⬅️'),
      el('h2', null, '🗺️ Город', el('small', null, 'Играет: ' + G.HEROES[S.hero].name)), timeP,
      el('button', { class: 'icon-btn', title: 'Карта', onclick: openMap }, '🧭'),
      el('button', { class: 'icon-btn', title: 'Смартфон', onclick: () => G.go(PHONE.screen) }, '📱'));
    const updTime = () => { timeP.textContent = (G.isNight() ? '🌙 ' : '☀️ ') + String(S.clock).padStart(2, '0') + ':00 ' + ({ sun: '', cloud: '☁️', rain: '🌧️', snow: '❄️' }[S.weather] || ''); };
    updTime(); G.on('clock', updTime);
    const mini = el('div', { class: 'minimap' }); const meDot = el('i', { class: 'me' });
    placeIds.forEach(id => { const p = posOf(id); mini.append(el('i', { style: { left: p.x / W * 100 + '%', top: p.y / H * 100 + '%' }, title: P[id].name })); }); mini.append(meDot);
    const joyEl = el('div', { class: 'joy' }, el('i'));
    const enterBtn = el('button', { class: 'btn', style: { display: 'none', maxWidth: '48vw', fontSize: '16px', lineHeight: 1.15 } });
    const busBtn = el('button', { class: 'btn blue small', style: { display: 'none' }, onclick: rideBus }, '🚌 Автобус');
    const vehBtn = el('button', { class: 'btn purple small', onclick: () => {
      const order = ['walk', 'scooter', 'bike', 'car']; S.world.vehicle = order[(order.indexOf(S.world.vehicle) + 1) % order.length]; G.save(); drawAvatar();
      G.sfx(S.world.vehicle === 'car' ? 'honk' : 'tap'); vehBtn.textContent = (VEH[S.world.vehicle].e || '🚶') + ' ' + VEH[S.world.vehicle].n;
      if (S.world.vehicle === 'car') G.say([{ who: 'harut', text: 'Садитесь, девочки! Пристегнулись? Поехали!' }]); } }, (VEH[S.world.vehicle].e || '🚶') + ' ' + VEH[S.world.vehicle].n);
    const hudEl = el('div', { class: 'world-hud' }, joyEl, el('div', { class: 'center', style: { gap: '8px' } }, enterBtn, busBtn), el('div', { class: 'center', style: { gap: '8px', alignItems: 'flex-end' } }, vehBtn));
    root.append(view, bar, mini, hudEl);

    // управление
    const kd = e => { keysDown[e.key.toLowerCase()] = true; if ((e.key === 'Enter' || e.key === ' ') && near) { e.preventDefault(); enter(near); } };
    const ku = e => { keysDown[e.key.toLowerCase()] = false; };
    window.addEventListener('keydown', kd); window.addEventListener('keyup', ku);
    ctx.onCleanup(() => { window.removeEventListener('keydown', kd); window.removeEventListener('keyup', ku); });
    view.addEventListener('pointerdown', e => {
      const r = view.getBoundingClientRect(); target = { x: (e.clientX - r.left) / scale + cam.x, y: (e.clientY - r.top) / scale + cam.y };
    });
    joyEl.addEventListener('pointerdown', e => { e.stopPropagation(); joyEl.setPointerCapture(e.pointerId); target = null; moveJoy(e); });
    joyEl.addEventListener('pointermove', e => { if (e.buttons || e.pointerType === 'touch') moveJoy(e); });
    const endJoy = () => { joy = { x: 0, y: 0 }; joyEl.firstChild.style.transform = ''; };
    joyEl.addEventListener('pointerup', endJoy); joyEl.addEventListener('pointercancel', endJoy);
    function moveJoy(e) { const r = joyEl.getBoundingClientRect(); let dx = e.clientX - r.left - r.width / 2, dy = e.clientY - r.top - r.height / 2; const m = Math.hypot(dx, dy), mx = r.width / 2 - 20;
      if (m > mx) { dx *= mx / m; dy *= mx / m; } joy = { x: dx / mx, y: dy / mx }; joyEl.firstChild.style.transform = `translate(${dx}px,${dy}px)`; }

    let near = null, nearStop = false, eventT = rand(35, 60), evNode = null, raf, last = performance.now(), moving = false;
    function step(t) {
      const dt = Math.min(50, t - last) / 1000; last = t;
      let vx = joy.x, vy = joy.y;
      if (keysDown.arrowleft || keysDown.a) vx = -1; if (keysDown.arrowright || keysDown.d) vx = 1;
      if (keysDown.arrowup || keysDown.w) vy = -1; if (keysDown.arrowdown || keysDown.s) vy = 1;
      if (vx || vy) target = null;
      if (target) { const dx = target.x - pos.x, dy = target.y - pos.y, d = Math.hypot(dx, dy); if (d < 8) { if (target.enter) { const id = target.enter; target = null; enter(id); return; } target = null; } else { vx = dx / d; vy = dy / d; } }
      const m = Math.hypot(vx, vy); moving = m > 0.05;
      if (moving) {
        const sp = VEH[S.world.vehicle].sp; if (m > 1) { vx /= m; vy /= m; }
        pos.x = clamp(pos.x + vx * sp * dt, 40, W - 40); pos.y = clamp(pos.y + vy * sp * dt, 120, H - 20);
        if (vx) avatar.classList.toggle('flip', vx < 0);
        trail.push({ x: pos.x, y: pos.y }); if (trail.length > 60) trail.shift();
        eventT -= dt; if (eventT <= 0 && !evNode) { eventT = rand(40, 75); surprise(); }
      }
      avatar.style.left = pos.x + 'px'; avatar.style.top = pos.y + 'px'; avatar.style.zIndex = Math.round(pos.y);
      fol.forEach((f, i) => { const p = trail[trail.length - 1 - (i + 1) * 14] || trail[0]; f.style.left = (p.x - 30 * (i ? -1 : 1)) + 'px'; f.style.top = p.y + 'px'; f.style.zIndex = Math.round(p.y); });
      cars.forEach(c => { c.x += c.v * dt; if (c.x > W) c.x = -80; if (c.x < -80) c.x = W; c.n.style.left = c.x + 'px'; c.n.style.top = c.y + 'px'; c.n.style.transform = c.v > 0 ? 'scaleX(-1)' : ''; });
      const vw = view.clientWidth / scale, vh = view.clientHeight / scale;
      cam.x = clamp(pos.x - vw / 2, 0, Math.max(0, W - vw)); cam.y = clamp(pos.y - vh / 2, 0, Math.max(0, H - vh));
      world.style.transform = `scale(${scale}) translate(${-cam.x}px,${-cam.y}px)`;
      meDot.style.left = pos.x / W * 100 + '%'; meDot.style.top = pos.y / H * 100 + '%';
      // рядом со зданием?
      let nn = null; for (const id of placeIds) { const p = posOf(id); if (Math.hypot(p.x - pos.x, p.y + 50 - pos.y) < 130) { nn = id; break; } }
      if (nn !== near) { if (near) blds[near].classList.remove('near'); near = nn; if (near) { blds[near].classList.add('near'); enterBtn.style.display = ''; enterBtn.textContent = '🚪 ' + P[near].name; enterBtn.onclick = () => enter(near); G.sfx('soft'); } else enterBtn.style.display = 'none'; }
      const ns = STOPS.some(s => Math.hypot(s.x - pos.x, s.y - pos.y) < 110); if (ns !== nearStop) { nearStop = ns; busBtn.style.display = ns ? '' : 'none'; }
      raf = requestAnimationFrame(step);
    }
    raf = requestAnimationFrame(step);
    ctx.onCleanup(() => { cancelAnimationFrame(raf); S.world.x = pos.x; S.world.y = pos.y; G.save(); });

    function enter(id) { cancelAnimationFrame(raf); S.world.x = pos.x; S.world.y = pos.y + 30; G.sfx('door'); G.go(place, id); }

    function rideBus() {
      const m = G.modal(el('div', null, el('h3', null, '🚌 Куда едем?'), el('p', null, 'Автобус довезёт всю семью!'),
        el('div', { class: 'grid' }, ...placeIds.map(id => el('button', { class: 'card', onclick: () => { m.close(); busTo(id); } }, el('span', { class: 'em' }, P[id].e), el('b', null, P[id].name))))));
    }
    function busTo(id) {
      G.sfx('honk');
      const bus = el('div', { style: { position: 'fixed', top: '45%', left: '-200px', fontSize: '140px', zIndex: 90 } }, '🚌');
      document.body.append(bus);
      bus.animate([{ left: '-200px' }, { left: '110vw' }], { duration: 1600, easing: 'ease-in-out' }).onfinish = () => bus.remove();
      setTimeout(() => { const p = posOf(id); pos.x = p.x; pos.y = p.y + 80; for (const t of trail) { t.x = pos.x; t.y = pos.y; } G.toast('🚌 Приехали: ' + P[id].name); }, 800);
    }
    function openMap() {
      const m = G.modal(el('div', null, el('h3', null, '🧭 Карта города'), el('p', null, 'Нажми на место — герои пойдут туда'),
        el('div', { style: { position: 'relative', width: '100%', aspectRatio: W / H, background: '#c9f3b4', borderRadius: '16px', border: '3px solid #fff' } },
          ...placeIds.map(id => { const p = posOf(id); return el('button', { style: { position: 'absolute', left: p.x / W * 100 + '%', top: p.y / H * 100 + '%', transform: 'translate(-50%,-50%)', background: 'none', fontSize: '30px', lineHeight: 1 }, title: P[id].name,
            onclick: () => { m.close(); target = { x: p.x, y: p.y + 70, enter: id }; G.toast('Идём: ' + P[id].name); } }, P[id].e, el('div', { style: { fontSize: '9px', fontWeight: 900, color: 'var(--ink)' } }, P[id].name)); }),
          el('i', { style: { position: 'absolute', left: pos.x / W * 100 + '%', top: pos.y / H * 100 + '%', width: '14px', height: '14px', margin: '-7px', borderRadius: '50%', background: 'var(--pink)', border: '2px solid #fff' } }))));
    }
    // неожиданные приключения
    function surprise() {
      const kind = pick(['pet', 'gift', 'fairy', 'harut', 'pet']);
      const p = { x: clamp(pos.x + rand(-180, 180), 60, W - 60), y: clamp(pos.y + rand(-120, 120), 160, H - 40) };
      const em = { pet: pick(['🐈', '🐕', '🐇', '🐥', '🐢']), gift: '🎁', fairy: '🧚', harut: '🍦' }[kind];
      evNode = el('div', { class: 'deco float glow', style: { left: p.x + 'px', top: p.y + 'px', fontSize: '60px', pointerEvents: 'auto', cursor: 'pointer', zIndex: 2000 } }, em, el('div', { style: { position: 'absolute', top: '-24px', right: '-10px', fontSize: '28px' } }, '❗'));
      world.append(evNode);
      G.sfx('magic');
      const lines = { pet: { who: 'mane', text: 'Ой! Там кто-то потерялся! Давайте поможем!' }, gift: { who: 'anulik', text: 'Смотрите, подарок! Кто-то оставил его для нас?' }, fairy: { who: 'mane', text: 'Фея! Настоящая фея прилетела!' }, harut: { who: 'harut', text: 'Сюрприз, девочки! Тут продают мороженое — кому какое?' } }[kind];
      G.toast('❗ Неожиданное приключение!'); G.speak(lines.text, lines.who);
      evNode.addEventListener('pointerdown', async e => {
        e.stopPropagation(); const n = evNode; evNode = null; n.remove();
        await G.say([lines]);
        if (kind === 'pet') {
          GAMES.play({ id: 'rescue_' + em, who: 'any', emoji: em, title: 'Спасаем малыша', desc: 'Неожиданное приключение', engine: 'care', cfg: { pet: em, win: 'Малыш спасён! Мы отвезём его в центр помощи животным.' } },
            { onDone: () => { G.S.animals.push(em); G.emit('animal'); G.toast('🐾 Спасено животных: ' + G.S.animals.length); } });
        } else if (kind === 'gift') {
          const left = Object.keys(GIFTS).filter(k => k.startsWith('gift_') && !G.S.souvenirs.includes(k));
          if (left.length) G.addSouvenir(pick(left)); else { G.addStars(3); G.toast('⭐ +3'); }
        } else if (kind === 'fairy') { G.addStars(3); G.sfx('magic'); G.confetti(40); G.setWeather('sun'); G.toast('🧚 Фея подарила 3 звезды и солнышко!'); }
        else { G.addStars(2); await G.say([{ who: 'mane', text: 'Мне клубничное!' }, { who: 'anulik', text: 'А мне фисташковое, спасибо, дядя!' }]); }
      });
      setTimeout(() => { if (evNode) { evNode.remove(); evNode = null; } }, 30000);
    }
    if (!S.visited.length) setTimeout(() => G.say([{ who: 'harut', text: 'Это наш город! Иди куда хочешь: стрелками, джойстиком или просто нажми на место.' }, { who: 'anulik', text: 'Подойди к зданию и нажми «Войти». А ещё ищите мерцающие ✨ — там тайники!' }]), 500);
    return root;
  }

  /* ================= СЦЕНА ЛОКАЦИИ ================= */
  function place(ctx, id) {
    const d = P[id], S = G.S;
    if (!d.sub && !S.visited.includes(id)) { S.visited.push(id); G.emit('visit', id); }
    else if (d.sub) G.emit('visit-sub', id);
    const { root, body } = G.screen({ title: d.e + ' ' + d.name, sub: d.sub ? 'Дом' : 'Город · ' + (S.visited.length) + '/16 мест', right: HOME.heroSwitcher(() => G.refresh()) });
    body.classList.add('noscroll');
    const sc = el('div', { class: 'scene' + (d.outdoor ? ' outdoor' : ''), style: { background: d.bg } });
    sc.append(el('div', { class: 'ground', style: { background: d.ground, borderRadius: '50% 50% 0 0 / 30px 30px 0 0' } }));
    d.decor.forEach(([e, x, y]) => sc.append(el('div', { class: 'hot', style: { left: x + '%', top: y + '%', pointerEvents: 'none', opacity: .9 } }, e)));
    d.hot.forEach(h => {
      const n = el('button', { class: 'hot', style: { left: h.x + '%', top: h.y + '%', background: 'none' } }, h.e);
      n.onclick = () => {
        G.sfx(h.sfx || 'pop'); n.classList.add('wiggle'); setTimeout(() => n.classList.remove('wiggle'), 500);
        G.say([{ who: S.hero, text: h.say }], { host: sc });
        if (h.stars && !sessionStorage['st_' + id]) { try { sessionStorage['st_' + id] = 1; } catch (e) {} G.addStars(h.stars); G.toast('⭐ +' + h.stars); }
        if (h.weather) { const w = ['sun', 'cloud', 'rain', 'snow']; G.setWeather(w[(w.indexOf(S.weather) + 1) % 4]); G.toast('Погода: ' + ({ sun: '☀️', cloud: '☁️', rain: '🌧️', snow: '❄️' }[S.weather])); }
        if (h.time) { G.setTime(G.isNight() ? 10 : 21); G.toast(G.isNight() ? '🌙 Наступила ночь' : '☀️ Наступил день'); }
        if (h.open) setTimeout(() => PHONE.openApp(h.open), 700);
      };
      sc.append(n);
    });
    // житель
    if (d.npc) {
      let k = 0; const n = el('button', { class: 'hot npc float', style: { left: d.npc.x + '%', top: d.npc.y + '%', background: 'none' } }, d.npc.e);
      n.onclick = () => { G.sfx('pop'); G.emit('talk'); G.say([{ name: d.npc.name, text: d.npc.lines[k++ % d.npc.lines.length] }, reply(id)], { host: sc }); };
      sc.append(n);
    }
    // секрет
    const sid = 's_' + id, sec = d.secret;
    if (!S.secrets.includes(sid) || sec.place) {
      const n = el('button', { class: 'hot secret glow', style: { left: sec.x + '%', top: sec.y + '%', background: 'none', fontSize: sec.e ? '44px' : '' }, title: '?' }, sec.e || '✨');
      n.onclick = async () => {
        if (!S.secrets.includes(sid)) { S.secrets.push(sid); G.addSouvenir(sid); G.emit('secret'); G.confetti(30); }
        if (sec.place) {
          if (id === 'room_anulik' && !S.flags?.secretCode) {
            await G.say([{ who: 'anulik', text: 'За картиной — дверца с кодовым замком! Нужно разгадать шифр.' }], { host: sc });
            GAMES.play({ id: 'secret_door', who: 'anulik', emoji: '🔐', title: 'Кодовый замок', desc: 'Тайная дверь', engine: 'cipher', cfg: { puzzles: [DATA.CIPHERS[2]], win: 'Щёлк! Дверь открылась!' } },
              { level: 'easy', onDone: () => { G.flag('secretCode'); G.go(place, 'secret_room'); } });
            return;
          }
          G.sfx('door'); G.go(place, sec.place);
        } else n.remove();
      };
      sc.append(n);
    }
    // герои
    const heroes = el('div', { class: 'scene-heroes' });
    [S.hero, ...['mane', 'anulik', 'harut'].filter(h => h !== S.hero)].forEach((h, i) => heroes.append(el('div', { html: ART.hero(h, { wave: i === 0 }), style: { transform: i ? 'scale(.82)' : '', transformOrigin: 'bottom', marginLeft: i ? '-24px' : 0 } })));
    sc.append(heroes);
    // задания
    const qb = el('div', { class: 'quest-bar' });
    d.acts.forEach(a => {
      const g = a.game && GAMES.byId[a.game];
      const done = (g && S.played[a.game]) || (a.adv && S.adventures[a.adv]);
      qb.append(el('button', { class: 'btn small ' + (a.adv ? 'purple' : a.place ? 'yellow' : ''), onclick: () => {
        G.sfx('pop');
        if (a.place) G.go(place, a.place);
        else if (a.adv) ADV.start(a.adv);
        else if (g) GAMES.play(g, a.cfg ? { cfg: a.cfg } : {});
      } }, a.e + ' ' + a.t + (done ? ' ⭐' : '')));
    });
    sc.append(qb);
    body.append(sc);
    G.updateWeather(true);
    // приветствие
    if (!place._seen || place._seen !== id) { place._seen = id; setTimeout(() => G.say([intro(id)], { host: sc }), 350); }
    return root;
  }
  function intro(id) {
    const h = G.S.hero, n = P[id].name;
    const t = { mane: ['Ура, мы в месте «' + n + '»! Тут столько всего интересного!', 'Ой, как красиво! Давайте всё потрогаем!'], anulik: ['«' + n + '» — отличное место для фото и заданий!', 'Так, что тут у нас? Справа — список дел.'], harut: ['Добро пожаловать, девочки! Это «' + n + '». Справа — чем можно заняться.', 'Ну что, приключение начинается!'] }[h];
    return { who: h, text: pick(t) };
  }
  function reply(id) {
    const h = G.S.hero;
    return { who: h, text: pick({ mane: ['Здравствуйте! Я Мане!', 'Ура! Спасибо!', 'А можно с вами дружить?'], anulik: ['Спасибо, очень интересно!', 'Круто! Запишу в заметки.', 'Обязательно заглянем ещё!'], harut: ['Спасибо, дорогой! Ապրե՛ս!', 'Отлично! Девочки, слышали?', 'Ха-ха, договорились!'] }[h]) };
  }

  return { map, place, P, placeIds, posOf, LOCAL };
})();
