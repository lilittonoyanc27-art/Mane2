import { useEffect, useRef, useState } from 'react'
import { go, useUI } from '../core/ui'
import { useSave } from '../core/store'
import { say } from '../core/voice'
import { Stage } from '../kit/base'
import { Animal } from '../kit/animals'
import { Cloud, Meadow, Island } from '../kit/nature'
import { Item } from '../kit/items'

function Gate({ ok, cancel }: { ok: () => void; cancel?: () => void }) {
  const [q] = useState(() => { const a = 6 + Math.floor(Math.random() * 4), b = 3 + Math.floor(Math.random() * 6); return { a, b, o: [a * b, a * b + 2, a * b - 3, a * b + 7].sort(() => Math.random() - 0.5) } })
  return <div className="pcard"><h2>Ծնողների համար</h2><p className="ru">Вход для взрослых: сколько будет {q.a} × {q.b}?</p>
    <div className="row">{q.o.map(o => <button key={o} className="pbtn" onClick={() => o === q.a * q.b ? ok() : cancel?.()}>{o}</button>)}</div>
    {cancel && <button className="pbtn ghost" onClick={cancel}>⬅️ Հետ</button>}</div>
}
async function shrink(f: File) {
  const im = await createImageBitmap(f), s = Math.min(im.width, im.height), c = document.createElement('canvas'); c.width = c.height = 320
  c.getContext('2d')!.drawImage(im, (im.width - s) / 2, (im.height - s) / 2, s, s, 0, 0, 320, 320); return c.toDataURL('image/jpeg', 0.85)
}
export function Parents() {
  const [open, setOpen] = useState(false), [sure, setSure] = useState(false), s = useSave(), file = useRef<HTMLInputElement>(null)
  if (!open) return <div className="parents"><Gate ok={() => setOpen(true)} cancel={() => go('title')} /></div>
  const Vol = ({ k, t, ru }: { k: 'music' | 'sfx' | 'voice'; t: string; ru: string }) => <label className="vol"><span>{t}<em>{ru}</em></span><input type="range" min={0} max={1} step={0.05} value={s.vol[k]} onChange={e => s.set({ vol: { ...s.vol, [k]: +e.target.value } })} onPointerUp={() => k === 'voice' && void say('bravo')} /></label>
  return <div className="parents"><div className="pcard wide">
    <h2>Ծնողների բաժին</h2><p className="ru">Родительский раздел</p>
    <h3>Ձայն <em>Громкость</em></h3>
    {Vol({ k: 'voice', t: 'Խոսք', ru: 'Голос' })}{Vol({ k: 'music', t: 'Երաժշտություն', ru: 'Музыка' })}{Vol({ k: 'sfx', t: 'Էֆեկտներ', ru: 'Звуки' })}
    <h3>Խաղի ժամանակը օրական <em>Время игры в день</em></h3>
    <div className="row">{[0, 10, 15, 20, 30, 45, 60].map(m => <button key={m} className={'pbtn' + (s.limitMin === m ? ' on' : '')} onClick={() => s.set({ limitMin: m })}>{m ? `${m} րոպե` : '∞'}</button>)}</div>
    <p className="ru">Сегодня сыграно: {Math.floor(s.used / 60)} мин. <button className="link" onClick={() => s.set({ used: 0 })}>Обнулить</button></p>
    <h3>Հարությունի լուսանկարը <em>Фото дяди (хранится только на этом устройстве)</em></h3>
    <div className="row">{s.photo && <img className="ph" src={s.photo} alt="" />}<button className="pbtn" onClick={() => file.current?.click()}>📷 Ընտրել</button>{s.photo && <button className="pbtn ghost" onClick={() => s.set({ photo: null })}>🗑</button>}
      <input ref={file} type="file" accept="image/*" hidden onChange={async e => { const f = e.target.files?.[0]; if (f) s.set({ photo: await shrink(f) }) }} /></div>
    <h3>Գրաֆիկա <em>Графика</em></h3>
    <div className="row"><button className={'pbtn' + (!s.lowGfx ? ' on' : '')} onClick={() => s.set({ lowGfx: false })}>Գեղեցիկ · Красивая</button><button className={'pbtn' + (s.lowGfx ? ' on' : '')} onClick={() => s.set({ lowGfx: true })}>Արագ · Быстрая</button></div>
    <h3>Առաջընթաց <em>Прогресс</em></h3>
    <p className="ru">Звёзды: {s.stars} · подарки: {s.unlocked.length} · рисунки: {s.drawings.length}</p>
    <div className="row">{sure ? <><button className="pbtn warn" onClick={() => { s.reset(); setSure(false) }}>Այո, ջնջել · Да, стереть</button><button className="pbtn" onClick={() => setSure(false)}>Ոչ · Нет</button></> : <button className="pbtn ghost" onClick={() => setSure(true)}>Սկսել նորից · Начать заново</button>}</div>
    <p className="ru tiny">В игре нет рекламы, покупок, чатов и регистрации. Прогресс, рисунки и фото хранятся только в браузере этого устройства.</p>
    <button className="pbtn on full" onClick={() => go('title')}>Պատրաստ է · Готово</button>
  </div></div>
}
export function Rest() {
  const [gate, setGate] = useState(false), s = useSave()
  useEffect(() => { const t = setTimeout(() => void say('rest'), 900); return () => clearTimeout(t) }, [])
  return <><Stage sky={['#3f4a9a', '#e7b7e8']} sun={0.9} cam={{ t: [0, 1, 0], w: 7, h: 5 }}>
    <Island r={4.5} c="#8fc9a0" /><Meadow n={50} rad={4} c="#78b98a" /><Cloud p={[-3, 4, -4]} /><Cloud p={[3.4, 4.6, -5]} s={0.8} />
    <Animal k="cat" p={[-1.2, 0, 0.6]} mood="sleep" /><Animal k="dog" p={[0.2, 0, 0.2]} mood="sleep" /><Animal k="rabbit" p={[1.5, 0, 0.7]} mood="sleep" /><Item k="moon" p={[1.6, 3, -2]} s={1.6} />
  </Stage><button className="rb restp" onClick={() => setGate(true)} aria-label="Ծնողներին">⚙️</button>
    {gate && <div className="parents"><Gate cancel={() => setGate(false)} ok={() => { s.set({ used: 0 }); useUI.setState({ scene: 'hub' }) }} /></div>}</>
}
