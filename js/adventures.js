/* ===== Совместные приключения (12), занятия сестёр (10) и режим «вдвоём» ===== */
window.ADV = (function () {
  const { el, pick, shuffle } = G;
  const g = (engine, title, emoji, cfg) => ({ engine, title, emoji, cfg: cfg || {} });
  const C = DATA.CIPHERS;

  const A = {
    /* ---------------- 12 семейных приключений ---------------- */
    island: { e: '🏝️', title: 'Тайна волшебного острова', place: 'beach', sv: ['💰', 'Пиратский сундучок'],
      intro: [{ who: 'harut', text: 'Капитан Ваган рассказал мне про волшебный остров. Говорят, там спрятан сундук!' }, { who: 'anulik', text: 'Карта сокровищ? Я в деле!' }, { who: 'mane', text: 'А там есть пираты? Добрые?' }, { who: 'harut', text: 'Только добрые, Мане-джан. Полный вперёд!' }],
      steps: [
        { who: 'harut', task: 'Харутюн ведёт лодку к острову', game: g('drive', 'Плывём к острову', '⛵', { car: '⛵', dest: '🏝️ Остров', instr: 'Веди лодку, собирай звёзды и обходи камни!', win: 'Земля! Мы на острове!' }) },
        { who: 'mane', task: 'Мане ищет кусочки карты на пляже', game: g('collect', 'Кусочки карты', '🗺️', { mode: 'hidden', covers: ['🌴', '🪨', '🐚', '🥥', '🌺', '🪵', '🦀', '⛱️', '🪣', '🌊'], items: ['🗺️', '📜'], target: { easy: 3, normal: 4, hard: 5 }, icon: '🗺️', instr: 'Найди кусочки карты под пальмами и камнями!', win: 'Все кусочки карты нашлись!', bg: 'linear-gradient(#bfe6ff,#f7e2b0 55%)' }) },
        { who: 'anulik', task: 'Анулик расшифровывает надпись на карте', game: g('cipher', 'Надпись на карте', '📜', { puzzles: [C[4], C[3]], win: 'Карта ведёт в пещеру у старого дуба!' }) },
        { who: 'mane', task: 'Мане проходит по пещере', game: g('maze', 'Тёмная пещера', '🕳️', { goal: '💰', wall: '#8a5a3a', floor: '#f2e0c0', instr: 'Найди путь к сундуку в пещере!', win: 'Сундук найден!' }) },
        { who: 'harut', task: 'Харутюн подбирает код сундука', game: g('cipher', 'Код сундука', '🔐', { puzzles: [{ type: 'riddle', title: 'Надпись на сундуке', text: 'У краба 10 ног, у осьминога 8. Сколько ног у двух крабов и одного осьминога?', answer: '28', hint: '10 + 10 + 8' }], win: 'Щёлк! Сундук открыт!' }) },
      ],
      outro: [{ who: 'mane', text: 'Ура! Там ракушки, жемчуг и… записка!' }, { who: 'anulik', text: '«Самое главное сокровище — семья». Как мило!' }, { who: 'harut', text: 'Абсолютная правда, девочки. Ապրե՛ք!' }] },
    world_trip: { e: '🌍', title: 'Семейное путешествие по миру', place: 'airport', sv: ['🌍', 'Глобус с наклейками'], countries: ['Армения', 'Испания', 'Франция', 'Италия', 'Япония'],
      intro: [{ who: 'anulik', text: 'Я составила маршрут: Ереван, Мадрид, Париж, Рим и Токио!' }, { who: 'harut', text: 'Кругосветка! Но сначала — чемоданы и билеты.' }, { who: 'mane', text: 'Я возьму своего мишку!' }],
      steps: [
        { who: 'mane', task: 'Мане собирает чемодан', game: 'loc_suitcase' },
        { who: 'anulik', task: 'Анулик покупает билеты по маршруту', game: g('planner', 'Билеты по маршруту', '🎫', { emoji: '🎫', budget: 1300, minFun: 10, brief: 'Купи билеты на весь маршрут. Бюджет 1300.', categories: [
          { name: 'Ереван → Мадрид', emoji: '🇪🇸', options: [{ e: '✈️', name: 'Прямой рейс', cost: 400, fun: 3 }, { e: '🛫', name: 'С пересадкой', cost: 280, fun: 1 }] },
          { name: 'Мадрид → Париж', emoji: '🇫🇷', options: [{ e: '🚄', name: 'Скоростной поезд', cost: 150, fun: 3 }, { e: '🚌', name: 'Автобус', cost: 60, fun: 1 }, { e: '✈️', name: 'Самолёт', cost: 120, fun: 2 }] },
          { name: 'Париж → Рим', emoji: '🇮🇹', options: [{ e: '🚆', name: 'Ночной поезд', cost: 130, fun: 3 }, { e: '✈️', name: 'Самолёт', cost: 110, fun: 2 }] },
          { name: 'Рим → Токио', emoji: '🇯🇵', options: [{ e: '✈️', name: 'Прямой рейс', cost: 520, fun: 3 }, { e: '🛫', name: 'Две пересадки', cost: 360, fun: 1 }] }], win: 'Билеты куплены!' }) },
        { who: 'anulik', task: 'Анулик фотографирует достопримечательности', game: g('photo', 'Фото достопримечательностей', '📸', { place: 'Путешествие', size: 66, targets: ['🗼', '🏛️', '⛩️', '🗻', '🏰', '⛪'], extras: ['🌳', '🚌'], bg: 'linear-gradient(#bfe6ff,#e9dcf7 60%)' }) },
        { who: 'mane', task: 'Мане запоминает флаги и блюда стран', game: g('memory', 'Флаги и угощения', '🇦🇲', { items: ['🇦🇲', '🇪🇸', '🇫🇷', '🇮🇹', '🇯🇵', '🥘', '🍕', '🥐', '🍣', '🫓'] }) },
        { who: 'harut', task: 'Харутюн устраивает викторину в самолёте', game: g('quiz', 'Викторина путешественников', '✈️', { questions: DATA.Q_COUNTRIES }) },
      ],
      outro: [{ who: 'harut', text: 'Пять стран, тысячи фото и ни одного потерянного чемодана!' }, { who: 'anulik', text: 'На карте путешествий теперь пять отметок!' }, { who: 'mane', text: 'А больше всего мне понравилось лететь на самолёте!' }] },
    family_cafe: { e: '☕', title: 'Семейное кафе', place: 'cafe', sv: ['🧑‍🍳', 'Фартук семейного кафе'],
      intro: [{ who: 'anulik', text: 'Сегодня мы открываем своё кафе! Я — управляющая.' }, { who: 'harut', text: 'А я на кухне! Хоровац и гата — мои коронные блюда.' }, { who: 'mane', text: 'А я буду украшать десерты!' }],
      steps: [
        { who: 'mane', task: 'Мане украшает торт для витрины', game: 'm_cake' },
        { who: 'harut', task: 'Харутюн готовит армянские блюда', game: 'h_kitchen' },
        { who: 'anulik', task: 'Анулик обслуживает гостей', game: 'a_cafe' },
        { who: 'mane', task: 'Мане делает мороженое для детей', game: 'm_icecream' },
      ],
      outro: [{ who: 'anulik', text: 'Первый день — и столько довольных гостей!' }, { who: 'harut', text: 'Лучшая команда в городе!' }, { who: 'mane', text: 'Можно я съем последнее мороженое?' }] },
    animals: { e: '🐾', title: 'Спасение животных', place: 'zoo', sv: ['🏥', 'Значок «Друг животных»'],
      intro: [{ who: 'harut', text: 'Смотритель Нарек просит помощи: в городе потерялись питомцы!' }, { who: 'mane', text: 'Бедненькие! Мы их найдём!' }, { who: 'anulik', text: 'Откроем центр помощи животным. План такой…' }],
      steps: [
        { who: 'mane', task: 'Мане ищет потерявшихся малышей', game: g('collect', 'Где малыши?', '🐾', { mode: 'hidden', covers: ['🌳', '🌲', '🪨', '📦', '🚗', '🪴', '🧺', '🛝', '🌻', '🪵'], items: ['🐶', '🐱', '🐰', '🐹', '🐥'], target: { easy: 3, normal: 4, hard: 5 }, icon: '🐾', instr: 'Загляни под кустики и коробки — там прячутся малыши!', win: 'Все малыши найдены!' }) },
        { who: 'mane', task: 'Мане кормит и купает щенка', game: g('care', 'Уход за щенком', '🐶', { pet: '🐶' }) },
        { who: 'anulik', task: 'Анулик расселяет животных по домикам', game: g('sort', 'Домики для животных', '🏠', { bins: [{ key: 'c', label: 'Кошкин дом', color: '#ffad66', emoji: '🐱' }, { key: 'd', label: 'Будка', color: '#c58a5a', emoji: '🐶' }, { key: 'r', label: 'Крольчатник', color: '#8fe07c', emoji: '🐰' }],
          items: [['🐈', 'c'], ['🐱', 'c'], ['🐈‍⬛', 'c'], ['🐕', 'd'], ['🐶', 'd'], ['🐩', 'd'], ['🦮', 'd'], ['🐇', 'r'], ['🐰', 'r']].map(([e, key]) => ({ e, key })), instr: 'Каждого — в свой домик!', win: 'Всем тепло и уютно!' }) },
        { who: 'harut', task: 'Харутюн строит скворечник для птиц', game: g('sequence', 'Скворечник', '🪚', { sets: [GAMES.byId.h_birdhouse.cfg.sets[0]] }) },
      ],
      outro: [{ who: 'anulik', text: 'Центр помощи животным открыт! Все малыши в безопасности.' }, { who: 'mane', text: 'Щенок лизнул меня в щёку! Хи-хи!' }, { who: 'harut', text: 'Доброе сердце — самое главное, девочки.' }], animals: ['🐶', '🐱', '🐰'] },
    detective: { e: '🕵️‍♀️', title: 'Детективное приключение', place: 'city', sv: ['🔎', 'Лупа детектива'],
      intro: [{ who: 'anulik', text: 'Объявляю: детективное агентство «Две сестры и дядя» открыто!' }, { who: 'mane', text: 'Я буду искать улики! У меня зоркие глазки!' }, { who: 'harut', text: 'А я помогу с шифрами. В молодости я был лучшим разгадчиком кроссвордов!' }],
      steps: [
        { who: 'mane', task: 'Мане ищет спрятанные улики', game: g('collect', 'Спрятанные улики', '🔍', { mode: 'hidden', covers: ['🛋️', '📦', '🪴', '🧺', '🗄️', '🪑', '📚', '🧥', '🎒', '🛏️'], items: ['🔑', '🧦', '🐾', '📝'], target: { easy: 3, normal: 4, hard: 4 }, icon: '🔍', instr: 'Найди улики: ключ, следы и записку!', win: 'Все улики собраны!' }) },
        { who: 'harut', task: 'Харутюн расшифровывает записку', game: g('cipher', 'Таинственная записка', '📝', { puzzles: [C[0], C[7]], win: 'Записка расшифрована!' }) },
        { who: 'anulik', task: 'Анулик раскрывает дело', game: 'a_detective' },
      ],
      outro: [{ who: 'harut', text: 'Дело закрыто! Агентство работает безупречно.' }, { who: 'mane', text: 'Можно мне тоже значок детектива?' }, { who: 'anulik', text: 'Конечно! Ты — мой лучший помощник.' }] },
    amusement: { e: '🎡', title: 'Свой парк развлечений', place: 'amusement', sv: ['🎠', 'Мини-карусель'],
      intro: [{ who: 'harut', text: 'Девочки, мэр разрешил нам построить свой парк развлечений!' }, { who: 'mane', text: 'С каруселью и сладкой ватой?!' }, { who: 'anulik', text: 'Я займусь планом и бюджетом.' }],
      steps: [
        { who: 'anulik', task: 'Анулик выбирает аттракционы в рамках бюджета', game: g('planner', 'План парка', '🗺️', { emoji: '🎡', budget: 900, minFun: 12, brief: 'Выбери аттракционы на 900. Нужно что-то для малышей!', must: [{ tag: 'kids', text: 'Для Мане и малышей нужен детский аттракцион' }], categories: [
          { name: 'Главный аттракцион', emoji: '🎢', options: [{ e: '🎢', name: 'Американские горки', cost: 450, fun: 5 }, { e: '🎡', name: 'Колесо обозрения', cost: 350, fun: 4 }, { e: '🛶', name: 'Водный сплав', cost: 300, fun: 4 }] },
          { name: 'Для малышей', emoji: '🧸', options: [{ e: '🎠', name: 'Карусель с лошадками', cost: 150, fun: 3, tags: ['kids'] }, { e: '🚂', name: 'Паровозик', cost: 120, fun: 3, tags: ['kids'] }, { e: '🪀', name: 'Батут', cost: 80, fun: 2, tags: ['kids'] }] },
          { name: 'Еда', emoji: '🍭', options: [{ e: '🍭', name: 'Сладкая вата', cost: 50, fun: 2 }, { e: '🍦', name: 'Кафе-мороженое', cost: 120, fun: 3 }, { e: '🌭', name: 'Фуд-корт', cost: 200, fun: 3 }] },
          { name: 'Шоу', emoji: '🎪', options: [{ e: '🤡', name: 'Клоун Бим', cost: 60, fun: 2 }, { e: '🎆', name: 'Фейерверк', cost: 150, fun: 4 }, { e: '🎶', name: 'Живая музыка', cost: 100, fun: 3 }] }], win: 'План парка утверждён!' }) },
        { who: 'harut', task: 'Харутюн собирает карусель', game: g('sequence', 'Сборка карусели', '🎠', { sets: [{ title: 'Карусель', emoji: '🎠', steps: [{ e: '🧱', text: 'Залить основание' }, { e: '🔩', text: 'Установить центральную ось' }, { e: '⚙️', text: 'Подключить мотор' }, { e: '🐴', text: 'Закрепить лошадок' }, { e: '⛱️', text: 'Поставить купол' }, { e: '💡', text: 'Повесить гирлянды и проверить' }] }] }) },
        { who: 'mane', task: 'Мане украшает территорию', game: g('decorate', 'Украшаем парк', '🎈', { scene: 'garden', stickers: ['🎠', '🎡', '🎪', '🎈', '🌸', '🍭', '🌳', '🏮', '⭐', '🦄', '🎀', '🌈'], min: 6, instr: 'Укрась парк: поставь карусели, шарики и цветы!', win: 'Самый красивый парк в мире!' }) },
        { who: 'mane', task: 'Мане открывает праздник — ловит шарики', game: 'm_balloons' },
      ],
      outro: [{ who: 'harut', text: 'Торжественно объявляю парк открытым!' }, { who: 'mane', text: 'Ура-а-а! Я первая на карусель!' }, { who: 'anulik', text: 'А я сниму это для семейного альбома.' }] },
    space: { e: '🚀', title: 'Космическая экспедиция', place: 'space', sv: ['🧑‍🚀', 'Нашивка космонавта'],
      intro: [{ who: 'anulik', text: 'Робот Бип сказал, что ракета почти готова. Нужна наша помощь!' }, { who: 'harut', text: 'Я всегда мечтал увидеть Землю из космоса!' }, { who: 'mane', text: 'А на Луне можно прыгать высоко-высоко?' }],
      steps: [
        { who: 'harut', task: 'Харутюн и Анулик собирают ракету', game: g('sequence', 'Сборка ракеты', '🔧', { sets: [{ title: 'Ракета «Семья-1»', emoji: '🚀', steps: [{ e: '🔥', text: 'Установить двигатели' }, { e: '⛽', text: 'Поставить топливный бак' }, { e: '🛰️', text: 'Собрать отсек с приборами' }, { e: '🪟', text: 'Кабина с иллюминатором' }, { e: '🔺', text: 'Надеть носовой обтекатель' }, { e: '✅', text: 'Финальная проверка систем' }] }] }) },
        { who: 'mane', task: 'Мане собирает звёздную пыль для топлива', game: 'loc_stardust' },
        { who: 'anulik', task: 'Анулик прокладывает курс между астероидами', game: 'loc_planets' },
        { who: 'anulik', task: 'Научные задания на орбите', game: 'loc_spacequiz' },
      ],
      outro: [{ who: 'mane', text: 'Земля такая маленькая и голубая!' }, { who: 'anulik', text: 'Это лучшее фото в моей жизни!' }, { who: 'harut', text: 'Экспедиция завершена. Возвращаемся домой — к ужину!' }] },
    car_trip: { e: '🚗', title: 'Семейный автомобильный симулятор', place: 'station', sv: ['🧭', 'Компас штурмана'],
      intro: [{ who: 'harut', text: 'Садитесь! Сегодня едем на озеро Севан!' }, { who: 'anulik', text: 'Я штурман. Дядя, у меня три маршрута на выбор.' }, { who: 'mane', text: 'А я буду считать коровок за окном!' }],
      steps: [
        { who: 'anulik', task: 'Анулик выбирает маршрут', game: g('choice', 'Выбор маршрута', '🗺️', { e: '🗺️', q: 'Какой маршрут выберем до Севана?', options: [
          { e: '🏞️', text: 'Через горы — красиво, но дольше', reply: 'Отличный выбор! По пути увидим монастырь.', who: 'harut' },
          { e: '🛣️', text: 'По трассе — быстро и удобно', reply: 'Быстро доедем — больше времени на пляж!', who: 'harut' },
          { e: '🍑', text: 'Через сады — купим абрикосы', reply: 'Ммм, абрикосы! Мане будет счастлива.', who: 'mane' }] }) },
        { who: 'harut', task: 'Харутюн ведёт машину', game: g('drive', 'В путь!', '🚙', { car: '🚙', dest: '🏞️ Севан', win: 'Первая часть пути позади!' }) },
        { who: 'mane', task: 'Мане считает коровок и барашков', game: g('count', 'Кто за окном?', '🐄', { items: ['🐄', '🐑', '🐐', '🐴', '🌻'] }) },
        { who: 'harut', task: 'Последний отрезок до озера', game: g('drive', 'К озеру!', '🚙', { car: '🚙', dest: '🌊 Севан', win: 'Приехали! Вот оно — синее озеро Севан!' }) },
      ],
      outro: [{ who: 'anulik', text: 'Маршрут построен идеально!' }, { who: 'mane', text: 'Я насчитала сто коровок! Ну, почти.' }, { who: 'harut', text: 'Лучшие пассажиры на свете!' }] },
    festival: { e: '🎪', title: 'Музыкальный фестиваль', place: 'studio', sv: ['🎫', 'Браслет фестиваля'],
      intro: [{ who: 'anulik', text: 'Я организую фестиваль! Будет сцена, свет и наша группа.' }, { who: 'mane', text: 'Я буду танцевать и играть на ксилофоне!' }, { who: 'harut', text: 'А я помогу со сценой и звуком.' }],
      steps: [
        { who: 'anulik', task: 'Анулик оформляет сцену', game: g('decorate', 'Оформление сцены', '🎤', { scene: 'stage', palettes: { curtain: ['#c03a6a', '#6a3ac0', '#2a8a8a', '#e8a926'], floor: ['#7a4a2a', '#2a2240', '#5a5a6a'] }, paletteNames: { curtain: '🎭 Занавес', floor: '🪵 Сцена' }, stickers: ['🎤', '🎸', '🥁', '🎹', '💡', '✨', '🎈', '🌟', '🪩', '🔊', '🎺', '🎻'], min: 6, instr: 'Оформи сцену: инструменты, свет и декор', win: 'Сцена — огонь!' }) },
        { who: 'harut', task: 'Харутюн готовит выступление', game: g('sequence', 'Подготовка к концерту', '🔊', { sets: [{ title: 'Чек-лист перед концертом', emoji: '📋', steps: [{ e: '🔌', text: 'Подключить аппаратуру' }, { e: '🎚️', text: 'Саундчек: проверка звука' }, { e: '💡', text: 'Настроить свет' }, { e: '👗', text: 'Переодеться в костюмы' }, { e: '🎤', text: 'Выход на сцену' }, { e: '🙇', text: 'Поклон публике' }] }] }) },
        { who: 'mane', task: 'Мане играет на ксилофоне', game: 'm_music' },
        { who: 'anulik', task: 'Анулик выпускает хит группы', game: 'a_band' },
      ],
      outro: [{ who: 'harut', text: 'Публика аплодирует стоя!' }, { who: 'mane', text: 'Мне хлопали! Мне! Ура!' }, { who: 'anulik', text: 'Это был лучший фестиваль в истории города!' }] },
    magic_house: { e: '🏰', title: 'Волшебный семейный дом', place: 'home', sv: ['🏡', 'Ключ от дома мечты'],
      intro: [{ who: 'harut', text: 'Девочки, давайте построим дом мечты — с садом, бассейном и комнатами для творчества!' }, { who: 'anulik', text: 'Я займусь интерьером.' }, { who: 'mane', text: 'А я посажу цветы и найду домик для котика!' }],
      steps: [
        { who: 'harut', task: 'Харутюн строит дом', game: 'm_houses' },
        { who: 'anulik', task: 'Анулик оформляет гостиную', game: 'a_interior' },
        { who: 'mane', task: 'Мане сажает сад', game: 'm_flowers' },
        { who: 'mane', task: 'Мане обустраивает аквариум у бассейна', game: 'm_aquarium' },
        { who: 'anulik', task: 'Анулик делает комнату для творчества', game: 'a_room' },
      ],
      outro: [{ who: 'mane', text: 'Это самый волшебный дом на свете!' }, { who: 'anulik', text: 'И у каждого есть своё место для мечты.' }, { who: 'harut', text: 'Главное, что в нём живёт любовь. Добро пожаловать домой!' }] },
    underwater: { e: '🤿', title: 'Подводное путешествие', place: 'aquapark', sv: ['🔱', 'Жемчужина океана'],
      intro: [{ who: 'harut', text: 'Наша жёлтая подводная лодка готова к погружению!' }, { who: 'anulik', text: 'Я взяла подводную камеру!' }, { who: 'mane', text: 'Я хочу увидеть черепашку!' }],
      steps: [
        { who: 'harut', task: 'Харутюн ведёт подлодку в глубину', game: g('drive', 'Погружение', '🛥️', { car: '🚤', dest: '🌊 Глубина', instr: 'Веди лодку, собирай звёзды, объезжай рифы!', win: 'Мы на дне океана!' }) },
        { who: 'anulik', task: 'Анулик фотографирует морских жителей', game: g('photo', 'Подводная фотосессия', '📷', { place: 'Океан', targets: ['🐙', '🐢', '🐠', '🦈', '🐬', '🪼', '🦑'], extras: ['🫧', '🪸'], bg: 'linear-gradient(#3a9ad9,#0a3a6a)' }) },
        { who: 'mane', task: 'Мане собирает затонувшие сокровища', game: g('collect', 'Затонувшие сокровища', '💎', { mode: 'swim', items: ['💎', '🪙', '👑', '🐚', '📿'], target: { easy: 8, normal: 12, hard: 15 }, icon: '💎', instr: 'Лови сокровища, которые плавают вокруг!', win: 'Сундук полон сокровищ!', bg: 'linear-gradient(#3a9ad9,#0a3a6a)' }) },
      ],
      outro: [{ who: 'mane', text: 'Черепашка помахала мне ластой!' }, { who: 'anulik', text: 'Мои подводные фото — настоящий журнал National… ну, наш семейный!' }, { who: 'harut', text: 'Всплываем! Впереди — горячий чай и рассказы.' }] },
    mountains: { e: '🏕️', title: 'Приключения в горах', place: 'mountains', sv: ['⛺', 'Значок туриста'],
      intro: [{ who: 'harut', text: 'Поход в горы! Палатки, пикник и звёзды.' }, { who: 'anulik', text: 'Я хочу найти редкие горные цветы для гербария.' }, { who: 'mane', text: 'А мы будем жарить зефирки?' }],
      steps: [
        { who: 'mane', task: 'Мане собирает рюкзак', game: g('sort', 'Собираем рюкзак', '🎒', { bins: [{ key: 'y', label: 'В рюкзак', color: '#5cbf55', emoji: '🎒' }, { key: 'n', label: 'Не нужно', color: '#9a8a7a', emoji: '🏠' }],
          items: [['🔦', 'y'], ['🧥', 'y'], ['🥾', 'y'], ['🍫', 'y'], ['💧', 'y'], ['🗺️', 'y'], ['🧢', 'y'], ['📺', 'n'], ['🛁', 'n'], ['🎹', 'n'], ['🪴', 'n'], ['🖥️', 'n']].map(([e, key]) => ({ e, key })), count: { easy: 6, normal: 10, hard: 12 }, instr: 'Что пригодится в походе?', win: 'Рюкзак собран!' }) },
        { who: 'harut', task: 'Харутюн ставит палатку', game: g('sequence', 'Ставим палатку', '⛺', { sets: [{ title: 'Палатка', emoji: '⛺', steps: [{ e: '🧹', text: 'Расчистить ровное место' }, { e: '🟩', text: 'Расстелить дно палатки' }, { e: '🦯', text: 'Собрать дуги' }, { e: '⛺', text: 'Поднять каркас' }, { e: '📌', text: 'Закрепить колышками' }, { e: '🛏️', text: 'Разложить спальники' }] }] }) },
        { who: 'anulik', task: 'Анулик ищет редкие растения', game: g('collect', 'Редкие растения', '🌿', { mode: 'hidden', covers: ['🪨', '🌲', '🪵', '⛰️', '🌳', '🍂', '🪨', '🌾', '🪵', '🌲'], items: ['🌷', '🪻', '🌼', '🍀'], target: { easy: 3, normal: 4, hard: 4 }, icon: '🌿', instr: 'Ищи редкие цветы под камнями и корнями', win: 'Гербарий пополнился!', bg: 'linear-gradient(#cfe9ff,#9fd08a 55%)' }) },
        { who: 'mane', task: 'Звёздная ночь: Мане ловит падающие звёзды', game: g('collect', 'Звездопад', '🌠', { mode: 'rise', items: ['⭐', '🌟', '🌠'], target: { easy: 10, normal: 14, hard: 18 }, icon: '🌠', instr: 'Лови звёздочки и загадывай желания!', win: 'Сколько желаний сбудется!', bg: 'linear-gradient(#0c0a3a,#3a2a7a)' }) },
      ],
      outro: [{ who: 'harut', text: 'Посмотрите: это Большая Медведица.' }, { who: 'anulik', text: 'Я сфотографировала Млечный Путь!' }, { who: 'mane', text: 'Спокойной ночи, звёздочки… *зевает*' }] },

    /* ---------------- 10 занятий сестёр ---------------- */
    sis_cook: { sis: true, e: '🍪', title: 'Анулик учит Мане готовить', sv: ['🥄', 'Детская поварёшка'],
      intro: [{ who: 'anulik', text: 'Мане, сегодня я научу тебя печь печенье!' }, { who: 'mane', text: 'Ура! Я буду главным поварёнком!' }],
      steps: [
        { who: 'anulik', task: 'Анулик объясняет рецепт по шагам', game: g('sequence', 'Рецепт печенья', '📖', { sets: [{ title: 'Печенье-сердечки', emoji: '🍪', steps: [{ e: '🧼', text: 'Вымыть руки' }, { e: '🥚', text: 'Смешать масло, сахар и яйцо' }, { e: '🌾', text: 'Добавить муку и замесить' }, { e: '❤️', text: 'Вырезать сердечки' }, { e: '🔥', text: 'Выпекать (это делает взрослый!)' }] }] }) },
        { who: 'mane', task: 'Мане украшает угощение', game: 'm_cake' },
      ],
      outro: [{ who: 'mane', text: 'Анулик, ты лучшая учительница!' }, { who: 'anulik', text: 'А ты — лучшая ученица! Несём печенье дяде!' }] },
    sis_clothes: { sis: true, e: '👗', title: 'Сёстры вместе выбирают одежду', sv: ['👛', 'Сумочка-сердечко'],
      intro: [{ who: 'mane', text: 'Анулик, а помоги мне выбрать наряд для праздника!' }, { who: 'anulik', text: 'С радостью! А ты поможешь мне?' }],
      steps: [
        { who: 'mane', task: 'Мане наряжает куколку', game: 'm_outfits' },
        { who: 'anulik', task: 'Анулик собирает образ по заказу', game: 'a_fashion' },
      ],
      outro: [{ who: 'anulik', text: 'У тебя отличное чувство стиля, сестрёнка!' }, { who: 'mane', text: 'Мы как модели из журнала!' }] },
    sis_puzzle: { sis: true, e: '🧩', title: 'Анулик помогает Мане с головоломками', sv: ['🧠', 'Медаль умников'],
      intro: [{ who: 'mane', text: 'У меня не получается пазл…' }, { who: 'anulik', text: 'Давай вместе! Начни с уголков, а я подскажу.' }],
      steps: [
        { who: 'mane', task: 'Мане собирает пазл с подсказками сестры', game: g('puzzle', 'Пазл с сестрой', '🧩', { picture: 'sisters' }) },
        { who: 'anulik', task: 'Анулик решает головоломку', game: 'a_logic' },
        { who: 'mane', task: 'Мане проходит лабиринт', game: 'm_maze' },
      ],
      outro: [{ who: 'mane', text: 'Получилось! Это мы с тобой на картинке!' }, { who: 'anulik', text: 'Вместе любые головоломки решаются быстрее.' }] },
    sis_pets: { sis: true, e: '🐱', title: 'Вместе ухаживаем за питомцами', sv: ['🦴', 'Косточка-брелок'],
      intro: [{ who: 'anulik', text: 'Рыжик и Пушок проголодались! Займёмся ими?' }, { who: 'mane', text: 'Я покормлю! А ты сфотографируешь!' }],
      steps: [
        { who: 'mane', task: 'Мане ухаживает за котиком', game: g('care', 'Уход за Рыжиком', '🐱', { pet: '🐱' }) },
        { who: 'anulik', task: 'Анулик делает фото питомцев', game: g('photo', 'Фотосессия питомцев', '📷', { place: 'Дом', targets: ['🐱', '🐰', '🐶', '🐹', '🦜'], extras: ['🧶', '🦴'], bg: 'linear-gradient(#fff0f7,#e8c9a0 70%)' }) },
      ],
      outro: [{ who: 'mane', text: 'Рыжик мурчит громко-громко!' }, { who: 'anulik', text: 'Эти фото — в рамочку!' }] },
    sis_cinema: { sis: true, e: '🍿', title: 'Домашний кинотеатр', sv: ['📽️', 'Мини-проектор'],
      intro: [{ who: 'anulik', text: 'Устроим домашний кинотеатр! Пледы, подушки, попкорн!' }, { who: 'mane', text: 'А можно мультик?' }],
      steps: [
        { who: 'anulik', task: 'Анулик выбирает фильм', game: g('choice', 'Что смотрим?', '🎬', { e: '🎬', q: 'Какой фильм выберем на вечер?', options: [
          { e: '🦄', text: 'Мультик про единорогов', reply: 'Ура! Мой любимый!', who: 'mane' }, { e: '🌌', text: 'Фильм про космос', reply: 'Интересно! А там есть роботы?', who: 'mane' }, { e: '🐾', text: 'Добрая история про щенка', reply: 'Ой, я уже его люблю!', who: 'mane' }] }) },
        { who: 'mane', task: 'Мане готовит попкорн', game: 'loc_popcorn' },
      ],
      outro: [{ who: 'harut', text: 'О, а меня возьмёте? Я принёс ещё пледов!' }, { who: 'mane', text: 'Садись между нами, дядя!' }, { who: 'anulik', text: 'Свет гаснет… Фильм начинается!' }] },
    sis_surprise: { sis: true, e: '🎁', title: 'Сюрприз для Харутюна', sv: ['💌', 'Открытка для дяди'],
      intro: [{ who: 'anulik', text: 'Тсс, Мане! У дяди Харутюна скоро день рождения. Устроим сюрприз?' }, { who: 'mane', text: 'Да! Только тихо-тихо!' }],
      steps: [
        { who: 'anulik', task: 'Анулик планирует праздник', game: 'a_party' },
        { who: 'mane', task: 'Мане рисует открытку', game: 'm_color' },
        { who: 'mane', task: 'Мане украшает торт для дяди', game: 'm_cake' },
      ],
      outro: [{ who: 'mane', text: 'Сюрпри-и-из!' }, { who: 'harut', text: 'Девочки… я самый счастливый дядя на свете! Ապրե՛ք, мои хорошие!' }, { who: 'anulik', text: 'С днём рождения, дядя! Мы тебя любим!' }] },
    sis_gifts: { sis: true, e: '💝', title: 'Подарки друг другу', sv: ['📿', 'Браслет сестёр'],
      intro: [{ who: 'mane', text: 'Анулик, я нарисую тебе картину!' }, { who: 'anulik', text: 'А я сделаю тебе бусы. Только не подглядывай!' }],
      steps: [
        { who: 'mane', task: 'Мане рисует подарок для сестры', game: 'm_color' },
        { who: 'anulik', task: 'Анулик делает бусы для Мане', game: 'a_jewelry' },
      ],
      outro: [{ who: 'anulik', text: 'Это самый красивый рисунок! Повешу над кроватью.' }, { who: 'mane', text: 'А бусы — как у принцессы! Спасибо, сестрёнка!' }] },
    sis_album: { sis: true, e: '📔', title: 'Семейный фотоальбом', sv: ['🖼️', 'Рамка «Семья»'],
      intro: [{ who: 'anulik', text: 'Давай соберём наш семейный фотоальбом!' }, { who: 'mane', text: 'Я хочу фото, где мы все вместе!' }],
      steps: [
        { who: 'anulik', task: 'Анулик делает фотографии в парке', game: 'a_photo' },
        { who: 'mane', task: 'Мане собирает семейный пазл', game: g('puzzle', 'Семейное фото', '🧩', { picture: 'family' }) },
      ],
      outro: [{ who: 'harut', text: 'Покажите! Ох, какие мы тут смешные!' }, { who: 'anulik', text: 'Альбом пополнился! Загляни в смартфон → Фотоальбом.' }] },
    sis_holiday: { sis: true, e: '🎄', title: 'Украшаем дом к празднику', sv: ['🎄', 'Ёлочная игрушка'],
      intro: [{ who: 'mane', text: 'Скоро праздник! Давай украсим дом!' }, { who: 'anulik', text: 'Ты — снаружи, я — гостиную. Договорились?' }],
      steps: [
        { who: 'mane', task: 'Мане украшает домик снаружи', game: g('decorate', 'Праздничный домик', '🏡', { scene: 'house', palettes: { wall: ['#fff2f7', '#fff4c2', '#d9f2ff'], roof: ['#ff8a8a', '#ffffff', '#8cc8ff'], door: ['#c03a3a', '#5cbf55', '#c58a5a'], ground: ['#ffffff', '#a9ea93'] }, paletteNames: { wall: '🧱 Стены', roof: '🔺 Крыша', door: '🚪 Дверь', ground: '❄️ Земля' }, stickers: ['🎄', '⛄', '⭐', '🎁', '🔔', '🕯️', '❄️', '🎀', '🦌', '🏮'], min: 5, instr: 'Укрась дом к празднику!', win: 'Дом сияет огоньками!' }) },
        { who: 'anulik', task: 'Анулик украшает гостиную', game: g('decorate', 'Праздничная гостиная', '🎄', { scene: 'interior', palettes: { wall: ['#fff4d6', '#ffe6e6', '#e6f7ff'], floor: ['#c58a5a', '#e8c9a0'] }, paletteNames: { wall: '🎨 Стены', floor: '🪵 Пол' }, stickers: ['🎄', '🎁', '🕯️', '🎀', '✨', '🎈', '🧦', '🔔', '⭐', '🛋️', '🫖', '🍪'], stickerSize: 26, min: 6,
          brief: { text: 'Праздничная гостиная: ёлка, подарки, свечи и угощение', need: [['🎄'], ['🎁'], ['🕯️'], ['🍪', '🫖']] }, instr: 'Создай праздничную атмосферу' }) },
      ],
      outro: [{ who: 'harut', text: 'Вот это красота! С праздником, мои дорогие!' }, { who: 'mane', text: 'А подарки уже можно открывать?' }] },
    sis_shopping: { sis: true, e: '🛍️', title: 'Сёстры за покупками', sv: ['🛒', 'Мини-тележка'],
      intro: [{ who: 'anulik', text: 'Пойдём по магазинам! У меня есть список и бюджет.' }, { who: 'mane', text: 'А мне можно выбрать игрушку?' }],
      steps: [
        { who: 'mane', task: 'Мане покупает игрушки по списку', game: 'm_toyshop' },
        { who: 'anulik', task: 'Анулик покупает вещи в рамках бюджета', game: 'a_shopping' },
      ],
      outro: [{ who: 'anulik', text: 'И всё в рамках бюджета!' }, { who: 'mane', text: 'А теперь — в путешествие с покупками!' }, { who: 'harut', text: 'Машина у входа, дамы!' }] },
  };
  for (const id in A) DATA.SOUVENIRS['adv_' + id] = { emoji: A[id].sv[0], name: A[id].sv[1], from: (A[id].sis ? 'Сёстры: ' : 'Приключение: ') + A[id].title, hint: 'Пройди «' + A[id].title + '»' };

  /* ---------- меню приключений ---------- */
  function menu(ctx, kind) {
    const isSis = kind === 'sisters', duo = kind === 'duo';
    const ids = Object.keys(A).filter(id => duo ? true : isSis ? A[id].sis : !A[id].sis);
    const { root, body } = G.screen({ title: duo ? '🤝 Приключения вдвоём' : isSis ? '💞 Сёстры вместе' : '🧭 Семейные приключения',
      sub: duo ? 'Игрок 1 — Мане (малыш), Игрок 2 — Анулик (подросток). Задания Харутюна — вместе!' : isSis ? 'Мане и Анулик: дружба и помощь' : 'Мане, Анулик и Харутюн — втроём' });
    const gr = el('div', { class: 'grid' });
    ids.forEach(id => { const a = A[id];
      gr.append(el('button', { class: 'card' + (G.S.adventures[id] ? ' done' : ''), onclick: () => start(id, duo) },
        el('span', { class: 'em' }, a.e), el('b', null, a.title), el('small', null, a.steps.length + ' этапа · ' + [...new Set(a.steps.map(s => G.HEROES[s.who].name.replace('Дядя ', '')))].join(', ')))); });
    body.append(gr);
    return root;
  }

  function start(id, duo) { G.go(runner, id, { step: -1, duo: duo || G.S.mode === 'duo' }); }

  function runner(ctx, id, st) {
    const a = A[id];
    const { root, body } = G.screen({ title: a.e + ' ' + a.title, sub: st.duo ? 'Режим вдвоём · ходы по очереди' : (a.sis ? 'Занятие сестёр' : 'Семейное приключение') });
    const prog = el('div', { class: 'row', style: { justifyContent: 'center', margin: '4px 0 12px' } });
    a.steps.forEach((s, i) => prog.append(el('div', { style: { width: '54px', height: '54px', borderRadius: '50%', overflow: 'hidden', background: i < st.step ? '#c3f4b0' : i === st.step ? '#ffd0e8' : '#fff', border: '3px solid ' + (i === st.step ? 'var(--pink)' : '#fff'), boxShadow: 'var(--shadow)', opacity: i > st.step ? .5 : 1 }, html: ART.face(s.who) })));
    body.append(prog);
    const card = el('div', { class: 'card center', style: { maxWidth: '640px', margin: '0 auto' } });
    body.append(card);
    if (st.step === -1) {
      card.append(el('div', { class: 'row', style: { justifyContent: 'center', height: '180px', gap: 0 }, html: ['harut', 'mane', 'anulik'].map(h => ART.hero(h, { wave: h === 'mane' }).replace('<svg', '<svg style="height:180px;width:auto"')).join('') }),
        el('b', { style: { fontSize: '22px' } }, a.title), el('small', null, 'Этапы: ' + a.steps.map(s => s.task).join(' → ')),
        el('button', { class: 'btn', onclick: async () => { await G.say(a.intro, { host: root }); st.step = 0; G.refresh(); } }, '▶️ Начать приключение'));
      return root;
    }
    if (st.step >= a.steps.length) {
      card.append(el('div', { class: 'stars-big' }, '🏆'), el('b', { style: { fontSize: '22px' } }, 'Приключение пройдено!'), el('p', null, 'Награда: ' + a.sv[0] + ' ' + a.sv[1]),
        el('button', { class: 'btn purple', onclick: () => { st.step = -1; G.refresh(); } }, '🔁 Пройти ещё раз'), el('button', { class: 'btn', onclick: G.back }, '✅ Готово'));
      if (!st.rewarded) { st.rewarded = true; reward(id); G.say(a.outro, { host: root }); }
      return root;
    }
    const s = a.steps[st.step];
    const player = st.duo ? (s.who === 'mane' ? 'Игрок 1 (Мане)' : s.who === 'anulik' ? 'Игрок 2 (Анулик)' : 'Оба игрока вместе!') : null;
    card.append(el('div', { style: { width: '130px', height: '180px' }, html: ART.hero(s.who, { wave: true }) }),
      player ? el('div', { class: 'pill', style: { background: 'var(--yellow)' } }, '🤝 Ходит: ' + player) : null,
      el('b', { style: { fontSize: '20px' } }, 'Этап ' + (st.step + 1) + ' из ' + a.steps.length + ': ' + s.task),
      el('small', null, s.who === 'mane' ? 'Простое задание для малышки — без спешки, с подсказками' : s.who === 'anulik' ? 'Задание посложнее для подростка' : 'Харутюн помогает всей семье'),
      el('button', { class: 'btn', onclick: () => launch(s, st) }, '▶️ Выполнить'),
      el('button', { class: 'btn white small', onclick: () => { st.step++; G.refresh(); } }, '⏭️ Пропустить этап'));
    if (st.duo) G.speak('Ход: ' + player, s.who);
    else G.speak(s.task, s.who);
    return root;
  }
  function launch(s, st) {
    const game = typeof s.game === 'string' ? GAMES.byId[s.game] : Object.assign({ id: 'adv_' + s.game.engine + '_' + s.task.length, who: s.who, desc: 'Приключение' }, s.game);
    const lvl = G.S.settings.level && G.S.settings.level !== 'auto' ? G.S.settings.level : (s.who === 'mane' ? 'easy' : s.who === 'anulik' ? 'hard' : 'normal');
    GAMES.play(game, { who: s.who, level: lvl, sub: s.task, onDone: () => { st.step++; G.refresh(); } });
  }
  function reward(id) {
    const a = A[id];
    G.S.adventures[id] = true; G.addStars(5);
    G.addSouvenir('adv_' + id);
    if (a.countries) a.countries.forEach(c => { if (!G.S.countries.includes(c)) G.S.countries.push(c); });
    if (a.animals) a.animals.forEach(x => G.S.animals.push(x));
    G.emit('adventure', id); G.confetti(80); G.sfx('win');
  }

  /* ---------- режим вдвоём: гонка шариков (экран пополам) ---------- */
  function duoRace(ctx) {
    G.flag('duo');
    const { root, body } = G.screen({ title: '🎈 Гонка шариков вдвоём', sub: 'Слева — Мане, справа — Анулик. Кто первый лопнет свои шарики?' });
    body.classList.add('noscroll'); body.style.position = 'relative';
    const goal = { mane: 12, anulik: 20 };
    const score = { mane: 0, anulik: 0 }; let over = false;
    const halves = ['mane', 'anulik'].map((who, i) => {
      const h = el('div', { style: { position: 'absolute', top: 0, bottom: 0, left: i ? '50%' : 0, width: '50%', background: i ? 'linear-gradient(#e6d9ff,#f3e6ff)' : 'linear-gradient(#ffe6f3,#fff0f7)', borderLeft: i ? '4px dashed #fff' : 0, overflow: 'hidden', touchAction: 'none' } });
      const sc = el('div', { class: 'pill', style: { position: 'absolute', top: '8px', left: '50%', transform: 'translateX(-50%)', zIndex: 3, display: 'flex', alignItems: 'center', gap: '6px' } }, el('span', { style: { width: '34px', height: '34px', display: 'inline-block' }, html: ART.face(who) }), '0 / ' + goal[who]);
      h.append(sc); body.append(h);
      return { who, h, sc, objs: [] };
    });
    body.append(el('div', { class: 'instr' }, 'Мане нужно ' + goal.mane + ' шариков (они больше и медленнее), Анулик — ' + goal.anulik + '!'));
    const spawn = setInterval(() => halves.forEach(H => {
      if (over) return; const kid = H.who === 'mane';
      const n = el('div', { class: 'sprite', style: { fontSize: (kid ? 76 : 50) + 'px', filter: `hue-rotate(${G.ri(0, 360)}deg)` } }, '🎈');
      const o = { n, x: G.rand(5, H.h.clientWidth - 70), y: H.h.clientHeight + 10, v: kid ? G.rand(60, 90) : G.rand(110, 170) };
      n.addEventListener('pointerdown', e => { e.stopPropagation(); if (o.dead || over) return; o.dead = true; G.sfx('pop'); n.classList.add('pop-out'); setTimeout(() => n.remove(), 300);
        score[H.who]++; H.sc.lastChild.textContent = score[H.who] + ' / ' + goal[H.who]; if (score[H.who] >= goal[H.who]) win(H.who); });
      H.h.append(n); H.objs.push(o);
    }), 700);
    let raf, last = performance.now();
    const loop = t => { const dt = Math.min(50, t - last) / 1000; last = t; halves.forEach(H => { for (let i = H.objs.length - 1; i >= 0; i--) { const o = H.objs[i]; o.y -= o.v * dt; o.n.style.left = o.x + 'px'; o.n.style.top = o.y + 'px'; if (o.y < -100 || o.dead) { if (!o.dead) o.n.remove(); H.objs.splice(i, 1); } } }); raf = requestAnimationFrame(loop); };
    raf = requestAnimationFrame(loop);
    ctx.onCleanup(() => { clearInterval(spawn); cancelAnimationFrame(raf); });
    function win(who) {
      over = true; G.sfx('win'); G.confetti(80); G.addStars(3); G.emit('play', 'duo_race');
      const m = G.modal(el('div', null, el('div', { style: { width: '120px', height: '120px', margin: 'auto' }, html: ART.face(who) }), el('h3', null, '🏆 Победила ' + G.HEROES[who].name + '!'),
        el('p', null, 'Харутюн: «Обе молодцы! Ничья по объятиям!»'), el('div', { class: 'row' }, el('button', { class: 'btn purple', onclick: () => { m.close(); G.refresh(); } }, '🔁 Реванш'), el('button', { class: 'btn', onclick: () => { m.close(); G.back(); } }, 'Выход'))), { dismiss: false });
      G.speak('Победила ' + G.HEROES[who].name + '! Обе молодцы!', 'harut');
    }
    return root;
  }

  /* ---------- режим вдвоём: семейная викторина по очереди ---------- */
  function duoQuiz(ctx) {
    G.flag('duo');
    const { root, body } = G.screen({ title: '🧠 Семейная викторина', sub: 'По очереди: Мане — лёгкие вопросы, Анулик — сложные. Ведущий — Харутюн' });
    const qs = { mane: shuffle(DATA.Q_EASY).slice(0, 5), anulik: shuffle(DATA.Q_HARD).slice(0, 5) };
    const score = { mane: 0, anulik: 0 }; let turn = 0;
    const box = el('div', { class: 'center' }); body.append(box);
    function next() {
      box.innerHTML = '';
      if (turn >= 10) {
        const w = score.mane === score.anulik ? null : score.mane > score.anulik ? 'mane' : 'anulik';
        G.addStars(3); G.emit('play', 'duo_quiz'); G.sfx('win'); G.confetti(60);
        box.append(el('div', { class: 'stars-big' }, '🏆'), el('h2', null, w ? 'Победила ' + G.HEROES[w].name + '!' : 'Ничья!'), el('p', { style: { fontWeight: 800 } }, 'Мане: ' + score.mane + ' · Анулик: ' + score.anulik),
          el('button', { class: 'btn', onclick: G.back }, 'Готово'));
        G.speak(w ? 'Победила ' + G.HEROES[w].name + '! Браво, девочки!' : 'Ничья! Обе умницы!', 'harut'); return;
      }
      const who = turn % 2 ? 'anulik' : 'mane'; const q = qs[who][Math.floor(turn / 2)];
      box.append(el('div', { class: 'row', style: { justifyContent: 'center' } }, ...['mane', 'anulik'].map(h => el('div', { class: 'pill', style: { outline: h === who ? '4px solid var(--pink)' : 'none' } }, G.HEROES[h].name + ': ' + score[h]))),
        el('div', { style: { width: '100px', height: '100px' }, html: ART.face(who) }), el('b', null, 'Отвечает ' + (who === 'mane' ? 'Игрок 1 — Мане' : 'Игрок 2 — Анулик')),
        el('div', { style: { fontSize: '64px' } }, q.e), el('div', { class: 'card', style: { fontSize: '20px', fontWeight: 900 } }, q.q));
      const opts = el('div', { class: 'grid', style: { width: 'min(600px,100%)' } });
      shuffle(q.a.map((a, k) => ({ a, k }))).forEach(o => opts.append(el('button', { class: 'card', style: { fontSize: '18px', fontWeight: 900 }, onclick: e => {
        opts.style.pointerEvents = 'none'; const ok = o.k === 0; e.currentTarget.style.background = ok ? '#c3f4b0' : '#ffd0da';
        if (ok) { score[who]++; G.sfx('good'); } else G.sfx('soft');
        G.speak(ok ? pick(['Верно!', 'Правильно, браво!']) : 'Ответ: ' + q.a[0], 'harut'); turn++; setTimeout(next, 1500); } }, o.a)));
      box.append(opts);
      G.speak(q.q, 'harut');
    }
    next();
    return root;
  }

  return { A, menu, start, runner, duoRace, duoQuiz };
})();
