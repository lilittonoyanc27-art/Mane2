# Մանեի աշխարհը — Волшебный мир Мане

Детская 3D-игра для Мане (3–4 года): React 19 + TypeScript + Vite + Three.js (React Three Fiber).
Интерфейс и голос — на армянском. Нет рекламы, покупок, чата, регистрации и отправки данных: всё хранится в браузере устройства.

## Запуск

```bash
npm install
npm run dev
```

Проверка и сборка (папка `dist/`): `npm run build`, просмотр сборки: `npm run preview`.

## Публикация: GitHub → Vercel

Важно: сначала `git init` именно в этой папке.

```bash
git init -b main
git add .
git commit -m "Мир Мане"
git remote add origin https://github.com/<логин>/<репозиторий>.git
git push -u origin main
```

Дальше на vercel.com: **Add New → Project → Import**, настройки подхватятся из `vercel.json`. Или из папки: `npx vercel --prod`.

## Управление

Касание/мышь — всё нажимается и перетаскивается. В прогулке, машине, космосе и море: джойстик, касание места или стрелки.
🏠 — главное меню, 🔊 — повторить задание, ⭐ — комната наград, 🎵 — музыка, ⚙️ — раздел для родителей (на титульном экране и в меню).

## Структура

```
src/
  App.tsx               переходы между сценами, таймер сессии
  core/                 audio (синтез звуков и музыки), voice, store (сохранение), rewards, phrases.json
  kit/                  base (сцена, камера, частицы, Tap/Drag), people, animals, items, nature, world (ходьба/полёт), decorate
  scenes/               Home, Adventure, Kitchen, Pets, Market, Prank, Puzzles + puzzles/ (15 игр), Salon, CarCity,
                        Garden, Music, Birthday, Draw, Space, Sea, Room, Card
  ui/                   HUD, Parents (настройки, лимит времени, экран отдыха), paint
public/voice/           192 армянские фразы (.m4a)
tools/                  make_voice.py — озвучка; *.mjs — автотесты (нужны Chrome и `npx vite --port 5199 --host 127.0.0.1`)
```

## Голос

Фразы записаны локальным синтезатором Piper (голос `hy_AM-gor-medium`, данные GPL-2.0), повышен тон.
Чтобы вставить живой голос, замените `public/voice/<id>.m4a` записью с тем же именем; тексты — в `src/core/phrases.json`.
Если файл не загрузился, используется системный армянский голос, а без него — мелодия и визуальная подсказка.
