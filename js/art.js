/* ===== Графика: персонажи и элементы сцены (SVG, «пластилиновый» 3D-стиль) ===== */
window.ART = (function () {
  // общие градиенты один раз на страницу
  const DEFS = `
  <radialGradient id="gSkin" cx=".4" cy=".35" r=".75"><stop offset="0" stop-color="#ffeadb"/><stop offset=".7" stop-color="#fbd3b8"/><stop offset="1" stop-color="#f0b996"/></radialGradient>
  <radialGradient id="gSkin2" cx=".4" cy=".35" r=".75"><stop offset="0" stop-color="#f9dcc6"/><stop offset=".7" stop-color="#ebbd9c"/><stop offset="1" stop-color="#d9a37f"/></radialGradient>
  <radialGradient id="gHair" cx=".4" cy=".3" r=".8"><stop offset="0" stop-color="#7a4a33"/><stop offset=".7" stop-color="#5a3322"/><stop offset="1" stop-color="#3f2216"/></radialGradient>
  <radialGradient id="gHairA" cx=".4" cy=".3" r=".8"><stop offset="0" stop-color="#5e3a2a"/><stop offset=".7" stop-color="#3d2218"/><stop offset="1" stop-color="#26140e"/></radialGradient>
  <radialGradient id="gHairH" cx=".4" cy=".3" r=".8"><stop offset="0" stop-color="#4a4048"/><stop offset=".8" stop-color="#2a2228"/><stop offset="1" stop-color="#1a1418"/></radialGradient>
  <linearGradient id="gDress" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffa6d3"/><stop offset="1" stop-color="#f06aab"/></linearGradient>
  <radialGradient id="gPinkBall" cx=".35" cy=".3"><stop offset="0" stop-color="#ffc2e0"/><stop offset="1" stop-color="#f05a9e"/></radialGradient>
  <radialGradient id="gBow" cx=".35" cy=".3"><stop offset="0" stop-color="#ff9cc9"/><stop offset="1" stop-color="#e83f8a"/></radialGradient>
  <radialGradient id="gShoe" cx=".35" cy=".3"><stop offset="0" stop-color="#ff7fb3"/><stop offset="1" stop-color="#d6266f"/></radialGradient>
  <linearGradient id="gHoodie" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d8c4ff"/><stop offset="1" stop-color="#a989f2"/></linearGradient>
  <linearGradient id="gJeans" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#7f9fe6"/><stop offset=".5" stop-color="#93b1f2"/><stop offset="1" stop-color="#6b88d6"/></linearGradient>
  <linearGradient id="gShirt" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9fd0ff"/><stop offset="1" stop-color="#5ea2ea"/></linearGradient>
  <linearGradient id="gPants" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#c9ab86"/><stop offset=".5" stop-color="#dcc19d"/><stop offset="1" stop-color="#b8976f"/></linearGradient>
  <radialGradient id="gEye" cx=".4" cy=".35"><stop offset="0" stop-color="#6a4330"/><stop offset=".6" stop-color="#3a2318"/><stop offset="1" stop-color="#1f120c"/></radialGradient>
  <radialGradient id="gOrange" cx=".35" cy=".3"><stop offset="0" stop-color="#ffd09a"/><stop offset="1" stop-color="#f0a050"/></radialGradient>
  <radialGradient id="gWhite" cx=".35" cy=".3"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#e6e0ee"/></radialGradient>
  <radialGradient id="gCastle" cx=".4" cy=".3"><stop offset="0" stop-color="#fff2f7"/><stop offset="1" stop-color="#f5cfe0"/></radialGradient>
  <filter id="soft" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="4" stdDeviation="3" flood-color="#7a2d6c" flood-opacity=".18"/></filter>`;
  function init() {
    if (document.getElementById('art-defs')) return;
    const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    s.id = 'art-defs'; s.setAttribute('width', 0); s.setAttribute('height', 0); s.style.position = 'absolute';
    s.innerHTML = '<defs>' + DEFS + '</defs>'; document.body.prepend(s);
  }

  const eye = (x, y, rx = 9, ry = 12) => `<g class="blink"><ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="url(#gEye)"/>
    <circle cx="${x - rx * .3}" cy="${y - ry * .38}" r="${rx * .42}" fill="#fff"/><circle cx="${x + rx * .35}" cy="${y + ry * .3}" r="${rx * .18}" fill="#fff" opacity=".8"/></g>`;
  const cheeks = (y, dx = 30, cx = 100) => `<ellipse cx="${cx - dx}" cy="${y}" rx="9" ry="6" fill="#ff8fb0" opacity=".55"/><ellipse cx="${cx + dx}" cy="${y}" rx="9" ry="6" fill="#ff8fb0" opacity=".55"/>`;

  /* ---------- МАНЕ (сохранён облик: каштановые хвостики, розовый бант, розовое платье в белый горошек) ---------- */
  function mane(o = {}) {
    const wave = o.wave !== false;
    return `
    <ellipse cx="100" cy="292" rx="44" ry="7" fill="#000" opacity=".12"/>
    <rect x="83" y="236" width="11" height="44" rx="5" fill="url(#gSkin)"/><rect x="106" y="236" width="11" height="44" rx="5" fill="url(#gSkin)"/>
    <ellipse cx="86" cy="282" rx="15" ry="9" fill="url(#gShoe)"/><ellipse cx="114" cy="282" rx="15" ry="9" fill="url(#gShoe)"/>
    <ellipse cx="82" cy="279" rx="5" ry="2.5" fill="#fff" opacity=".5"/><ellipse cx="110" cy="279" rx="5" ry="2.5" fill="#fff" opacity=".5"/>
    <path d="M76 168 Q66 190 64 210" stroke="url(#gSkin)" stroke-width="12" stroke-linecap="round" fill="none"/>
    <circle cx="64" cy="213" r="8" fill="url(#gSkin)"/>
    <path d="M80 160 Q100 152 120 160 L146 238 Q100 256 54 238 Z" fill="url(#gDress)" filter="url(#soft)"/>
    <path d="M54 236 Q62 248 70 240 Q78 252 86 242 Q94 254 102 243 Q110 254 118 242 Q126 252 132 240 Q140 248 146 236 Q100 258 54 236Z" fill="#fff"/>
    <rect x="80" y="182" width="40" height="7" rx="3.5" fill="#fff"/>
    <circle cx="82" cy="214" r="4" fill="#fff"/><circle cx="104" cy="206" r="4" fill="#fff"/><circle cx="124" cy="220" r="4" fill="#fff"/><circle cx="96" cy="228" r="4" fill="#fff"/><circle cx="70" cy="230" r="3.5" fill="#fff"/><circle cx="132" cy="232" r="3.5" fill="#fff"/>
    <circle cx="78" cy="166" r="11" fill="url(#gPinkBall)"/><circle cx="122" cy="166" r="11" fill="url(#gPinkBall)"/>
    <path d="M90 156 Q100 164 110 156 L106 152 Q100 156 94 152Z" fill="#fff"/>
    <!-- волосы сзади и хвостики -->
    <circle cx="44" cy="118" r="23" fill="url(#gHair)"/><circle cx="40" cy="146" r="17" fill="url(#gHair)"/>
    <circle cx="156" cy="118" r="23" fill="url(#gHair)"/><circle cx="160" cy="146" r="17" fill="url(#gHair)"/>
    <circle cx="100" cy="100" r="56" fill="url(#gHair)"/>
    <!-- лицо -->
    <ellipse cx="100" cy="112" rx="48" ry="45" fill="url(#gSkin)"/>
    <path d="M52 100 Q56 52 100 50 Q146 52 150 104 Q140 76 118 78 Q120 70 112 66 Q104 82 84 80 Q64 80 52 100Z" fill="url(#gHair)"/>
    <!-- бант -->
    <g transform="translate(126 58) rotate(18)">
      <ellipse cx="-14" cy="0" rx="16" ry="12" fill="url(#gBow)"/><ellipse cx="14" cy="0" rx="16" ry="12" fill="url(#gBow)"/>
      <circle cx="0" cy="0" r="7" fill="#ff6fae"/><ellipse cx="-18" cy="-4" rx="5" ry="3" fill="#fff" opacity=".5"/>
    </g>
    ${eye(82, 114)}${eye(118, 114)}
    <path d="M72 96 Q80 92 88 96" stroke="#5a3322" stroke-width="2.5" fill="none" stroke-linecap="round"/><path d="M112 96 Q120 92 128 96" stroke="#5a3322" stroke-width="2.5" fill="none" stroke-linecap="round"/>
    ${cheeks(132, 32)}
    <path d="M98 126 Q100 129 102 126" stroke="#d9906e" stroke-width="2" fill="none" stroke-linecap="round"/>
    <path d="M90 136 Q100 147 110 136" stroke="#e0405a" stroke-width="3.5" fill="#ff7b8f" stroke-linecap="round"/>
    <g ${wave ? 'class="wave-arm" style="transform-origin:124px 170px"' : ''}>
      <path d="M122 170 Q146 160 160 136" stroke="#ffa6d3" stroke-width="13" stroke-linecap="round" fill="none"/>
      <path d="M150 150 Q158 142 162 132" stroke="url(#gSkin)" stroke-width="12" stroke-linecap="round" fill="none"/>
      <circle cx="164" cy="126" r="9" fill="url(#gSkin)"/>
    </g>`;
  }

  /* ---------- АНУЛИК, 15 лет ---------- */
  function anulik(o = {}) {
    const outfits = [
      { top: 'url(#gHoodie)', trim: '#8a6ad6', leg: 'url(#gJeans)', shoe: '#ffffff', sole: '#f06fb0' },
      { top: '#7fd6c8', trim: '#3fae9e', leg: '#4a4f72', shoe: '#ffffff', sole: '#3fae9e' },
      { top: '#ffb0c8', trim: '#e0608a', leg: '#f3e6d0', shoe: '#ffd45a', sole: '#e0a020' },
      { top: '#ffe08a', trim: '#e8a926', leg: 'url(#gJeans)', shoe: '#ffffff', sole: '#8a6ad6' },
      { top: '#3a3550', trim: '#f06fb0', leg: '#2a2638', shoe: '#ffffff', sole: '#f06fb0' },
    ];
    const f = outfits[(o.outfit != null ? o.outfit : (G.S.wardrobe.anulik || 0)) % outfits.length];
    const wave = !!o.wave;
    return `
    <ellipse cx="100" cy="293" rx="40" ry="6" fill="#000" opacity=".12"/>
    <!-- хвост сзади -->
    <path d="M128 44 Q170 60 160 120 Q156 150 140 166 Q150 128 132 96Z" fill="url(#gHairA)"/>
    <rect x="84" y="196" width="14" height="80" rx="7" fill="${f.leg}"/><rect x="102" y="196" width="14" height="80" rx="7" fill="${f.leg}"/>
    <path d="M76 278 Q78 268 92 268 Q100 270 99 282 L76 284Z" fill="${f.shoe}"/><path d="M124 278 Q122 268 108 268 Q100 270 101 282 L124 284Z" fill="${f.shoe}"/>
    <rect x="74" y="281" width="27" height="5" rx="2.5" fill="${f.sole}"/><rect x="99" y="281" width="27" height="5" rx="2.5" fill="${f.sole}"/>
    <path d="M78 196 L122 196 L124 212 L76 212Z" fill="${f.leg}"/>
    <g ${wave ? 'class="wave-arm" style="transform-origin:124px 124px"' : ''}>
      <path d="M124 124 Q${wave ? '144 104 148 82' : '134 160 132 190'}" stroke="${f.top}" stroke-width="15" stroke-linecap="round" fill="none"/>
      <circle cx="${wave ? 148 : 132}" cy="${wave ? 76 : 196}" r="7.5" fill="url(#gSkin)"/>
    </g>
    <path d="M76 124 Q66 160 68 190" stroke="${f.top}" stroke-width="15" stroke-linecap="round" fill="none"/>
    <circle cx="68" cy="196" r="7.5" fill="url(#gSkin)"/>
    <path d="M78 118 Q100 110 122 118 Q128 160 124 200 Q100 206 76 200 Q72 160 78 118Z" fill="${f.top}" filter="url(#soft)"/>
    <path d="M76 196 Q100 204 124 196 L124 202 Q100 210 76 202Z" fill="${f.trim}"/>
    <path d="M100 150 C96 144 88 146 90 153 C92 158 100 162 100 162 C100 162 108 158 110 153 C112 146 104 144 100 150Z" fill="#fff" opacity=".9"/>
    <path d="M90 116 Q100 126 110 116" stroke="${f.trim}" stroke-width="3" fill="none"/>
    <!-- фотоаппарат на ремешке -->
    <path d="M84 120 Q96 160 112 172" stroke="#3a3550" stroke-width="2.5" fill="none"/>
    <rect x="104" y="166" width="22" height="16" rx="4" fill="#4a4560"/><circle cx="115" cy="174" r="5" fill="#9fd0ff" stroke="#2a2638" stroke-width="2"/>
    <rect x="96" y="100" width="8" height="14" rx="4" fill="url(#gSkin)"/>
    <!-- голова -->
    <path d="M58 70 Q58 26 100 24 Q142 26 142 72 Q146 110 132 120 L68 120 Q54 110 58 70Z" fill="url(#gHairA)"/>
    <ellipse cx="100" cy="72" rx="34" ry="37" fill="url(#gSkin)"/>
    <path d="M64 70 Q62 30 100 30 Q138 30 136 66 Q124 44 100 46 Q84 58 64 70Z" fill="url(#gHairA)"/>
    <path d="M66 66 Q62 100 70 118 L62 118 Q56 92 60 66Z" fill="url(#gHairA)"/><path d="M134 66 Q140 100 130 118 L138 118 Q144 92 140 66Z" fill="url(#gHairA)"/>
    <circle cx="132" cy="38" r="6" fill="#f06fb0"/>
    <circle cx="67" cy="84" r="2.6" fill="#ffd45a"/><circle cx="133" cy="84" r="2.6" fill="#ffd45a"/>
    ${eye(87, 74, 6.5, 8.5)}${eye(113, 74, 6.5, 8.5)}
    <path d="M80 66 L84 63 M117 63 L121 66" stroke="#26140e" stroke-width="1.6" stroke-linecap="round"/>
    <path d="M80 62 Q87 58 94 61" stroke="#3d2218" stroke-width="2.2" fill="none" stroke-linecap="round"/><path d="M106 61 Q113 58 120 62" stroke="#3d2218" stroke-width="2.2" fill="none" stroke-linecap="round"/>
    ${cheeks(88, 22)}
    <path d="M99 82 Q100 85 102 82" stroke="#d9906e" stroke-width="1.8" fill="none" stroke-linecap="round"/>
    <path d="M92 92 Q100 99 108 92" stroke="#d64f78" stroke-width="3" fill="#ff8fa6" stroke-linecap="round"/>`;
  }

  /* ---------- ДЯДЯ ХАРУТЮН ---------- */
  function harut(o = {}) {
    const wave = !!o.wave;
    return `
    <ellipse cx="100" cy="293" rx="46" ry="7" fill="#000" opacity=".12"/>
    <rect x="80" y="196" width="18" height="82" rx="8" fill="url(#gPants)"/><rect x="102" y="196" width="18" height="82" rx="8" fill="url(#gPants)"/>
    <ellipse cx="86" cy="282" rx="16" ry="8" fill="#7a4a2a"/><ellipse cx="114" cy="282" rx="16" ry="8" fill="#7a4a2a"/>
    <g ${wave ? 'class="wave-arm" style="transform-origin:130px 128px"' : ''}>
      <path d="M130 128 Q${wave ? '152 104 154 80' : '142 164 140 192'}" stroke="url(#gShirt)" stroke-width="18" stroke-linecap="round" fill="none"/>
      <circle cx="${wave ? 154 : 140}" cy="${wave ? 74 : 198}" r="9" fill="url(#gSkin2)"/>
    </g>
    <path d="M70 128 Q58 164 60 192" stroke="url(#gShirt)" stroke-width="18" stroke-linecap="round" fill="none"/>
    <circle cx="60" cy="198" r="9" fill="url(#gSkin2)"/>
    <path d="M72 120 Q100 110 128 120 Q138 160 130 204 Q100 212 70 204 Q62 160 72 120Z" fill="url(#gShirt)" filter="url(#soft)"/>
    <path d="M84 132 L116 132 M80 152 L120 152 M78 172 L122 172 M78 192 L122 192" stroke="#ffffff" stroke-width="2" opacity=".35"/>
    <path d="M90 120 L120 120 M96 132 L96 200 M106 132 L106 200 M116 132 L116 200" stroke="#ffffff" stroke-width="2" opacity=".25"/>
    <path d="M88 116 L100 132 L112 116 Q100 112 88 116Z" fill="#fff"/>
    <circle cx="100" cy="146" r="2.4" fill="#fff"/><circle cx="100" cy="166" r="2.4" fill="#fff"/><circle cx="100" cy="186" r="2.4" fill="#fff"/>
    <rect x="70" y="198" width="60" height="8" rx="4" fill="#6a4a2a"/><rect x="95" y="197" width="10" height="10" rx="2" fill="#e8c060"/>
    <rect x="93" y="98" width="14" height="18" rx="6" fill="url(#gSkin2)"/>
    <ellipse cx="100" cy="70" rx="35" ry="38" fill="url(#gSkin2)"/>
    <ellipse cx="65" cy="74" rx="6" ry="9" fill="url(#gSkin2)"/><ellipse cx="135" cy="74" rx="6" ry="9" fill="url(#gSkin2)"/>
    <path d="M65 64 Q62 30 100 28 Q138 30 135 64 Q132 48 120 44 Q100 50 80 44 Q68 48 65 64Z" fill="url(#gHairH)"/>
    <path d="M65 64 Q64 54 68 48 L70 66Z M135 64 Q136 54 132 48 L130 66Z" fill="#9a929a"/>
    ${eye(87, 70, 6, 7.5)}${eye(113, 70, 6, 7.5)}
    <path d="M78 58 Q87 52 95 57" stroke="#2a2228" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M105 57 Q113 52 122 58" stroke="#2a2228" stroke-width="4" fill="none" stroke-linecap="round"/>
    ${cheeks(84, 24)}
    <path d="M96 76 Q100 86 104 76" stroke="#c98a66" stroke-width="2.4" fill="#f0b996" stroke-linecap="round"/>
    <path d="M82 90 Q92 84 100 89 Q108 84 118 90 Q110 96 100 92 Q90 96 82 90Z" fill="#2a2228"/>
    <path d="M90 97 Q100 105 110 97" stroke="#c04050" stroke-width="3" fill="none" stroke-linecap="round"/>`;
  }

  const BODIES = { mane, anulik, harut };
  function hero(who, o = {}) {
    init();
    const vb = o.face ? FACE_VB[who] : '0 0 200 300';
    return `<svg viewBox="${vb}" xmlns="http://www.w3.org/2000/svg" class="hero-svg ${o.cls || ''}" aria-label="${who}"><g class="breathe">${BODIES[who](o)}</g></svg>`;
  }
  const FACE_VB = { mane: '36 42 128 128', anulik: '50 18 100 100', harut: '50 18 100 100' };
  function face(who) { init(); if (!BODIES[who]) who = 'mane'; return `<svg viewBox="${FACE_VB[who]}" xmlns="http://www.w3.org/2000/svg">${BODIES[who]({ wave: false })}</svg>`; }

  /* ---------- друзья Мане ---------- */
  function cat() { init(); return `<svg viewBox="0 0 120 130"><ellipse cx="60" cy="124" rx="34" ry="5" fill="#000" opacity=".12"/>
    <path d="M92 104 Q118 92 108 70" stroke="url(#gOrange)" stroke-width="12" fill="none" stroke-linecap="round"/>
    <ellipse cx="60" cy="98" rx="32" ry="26" fill="url(#gOrange)"/><ellipse cx="60" cy="104" rx="16" ry="14" fill="#fff4e6"/>
    <ellipse cx="44" cy="120" rx="10" ry="6" fill="#fff4e6"/><ellipse cx="76" cy="120" rx="10" ry="6" fill="#fff4e6"/>
    <path d="M28 38 L32 6 L52 26Z M92 38 L88 6 L68 26Z" fill="#f0a050"/><path d="M33 30 L35 14 L46 25Z M87 30 L85 14 L74 25Z" fill="#ffc6c6"/>
    <ellipse cx="60" cy="48" rx="36" ry="30" fill="url(#gOrange)"/><ellipse cx="60" cy="60" rx="16" ry="11" fill="#fff4e6"/>
    ${eye(46, 46, 5.5, 7)}${eye(74, 46, 5.5, 7)}<ellipse cx="60" cy="56" rx="4" ry="3" fill="#ff8fa6"/>
    <path d="M54 61 Q60 66 66 61" stroke="#a05030" stroke-width="2" fill="none"/>${cheeks(58, 22, 60)}
    <path d="M30 56 L12 52 M30 60 L12 62 M90 56 L108 52 M90 60 L108 62" stroke="#fff" stroke-width="1.6"/></svg>`; }
  function bunny() { init(); return `<svg viewBox="0 0 120 150"><ellipse cx="60" cy="144" rx="30" ry="5" fill="#000" opacity=".12"/>
    <ellipse cx="42" cy="34" rx="10" ry="32" fill="url(#gWhite)"/><ellipse cx="78" cy="34" rx="10" ry="32" fill="url(#gWhite)"/>
    <ellipse cx="42" cy="36" rx="5" ry="24" fill="#ffc6da"/><ellipse cx="78" cy="36" rx="5" ry="24" fill="#ffc6da"/>
    <ellipse cx="60" cy="116" rx="30" ry="28" fill="url(#gWhite)"/>
    <ellipse cx="60" cy="78" rx="34" ry="28" fill="url(#gWhite)"/>${eye(47, 76, 5.5, 7)}${eye(73, 76, 5.5, 7)}
    <ellipse cx="60" cy="86" rx="3.5" ry="2.5" fill="#ff8fa6"/><path d="M54 90 Q60 95 66 90" stroke="#d06080" stroke-width="2" fill="none"/>${cheeks(88, 22, 60)}</svg>`; }
  function fairy() { init(); return `<svg viewBox="0 0 120 150">
    <ellipse cx="28" cy="70" rx="24" ry="30" fill="#e6f4ff" opacity=".85" stroke="#b8dcff"/><ellipse cx="92" cy="70" rx="24" ry="30" fill="#e6f4ff" opacity=".85" stroke="#b8dcff"/>
    <path d="M44 86 Q60 80 76 86 L90 132 Q60 144 30 132Z" fill="#7fd6c8"/><circle cx="48" cy="110" r="3" fill="#ffd45a"/><circle cx="70" cy="118" r="3" fill="#ffd45a"/><circle cx="60" cy="100" r="3" fill="#ffd45a"/>
    <path d="M24 50 Q20 8 60 10 Q100 8 96 50 Q104 80 92 92 L28 92 Q16 80 24 50Z" fill="#ffd98a"/>
    <ellipse cx="60" cy="56" rx="28" ry="27" fill="url(#gSkin)"/>
    <path d="M34 48 Q40 24 60 24 Q82 24 86 48 Q70 34 60 40 Q50 34 34 48Z" fill="#ffd98a"/>
    <circle cx="40" cy="28" r="5" fill="#f06fb0"/><circle cx="52" cy="22" r="5" fill="#b48cf0"/><circle cx="66" cy="22" r="5" fill="#ffd45a"/><circle cx="78" cy="28" r="5" fill="#8cc8ff"/>
    ${eye(50, 58, 5, 6.5)}${eye(70, 58, 5, 6.5)}${cheeks(68, 18, 60)}<path d="M54 72 Q60 77 66 72" stroke="#e0405a" stroke-width="2.4" fill="none"/></svg>`; }
  function butterfly(c1 = '#f6a6d8', c2 = '#b48cf0') { return `<svg viewBox="0 0 80 60"><ellipse cx="22" cy="22" rx="20" ry="16" fill="${c1}"/><ellipse cx="58" cy="22" rx="20" ry="16" fill="${c1}"/>
    <ellipse cx="26" cy="44" rx="13" ry="11" fill="${c2}"/><ellipse cx="54" cy="44" rx="13" ry="11" fill="${c2}"/><rect x="37" y="8" width="6" height="46" rx="3" fill="#7a4a6a"/></svg>`; }

  /* ---------- декорации ---------- */
  function rainbow() { const cols = ['#ff8a8a', '#ffb070', '#ffe07a', '#9fe89a', '#8cc8ff', '#c3a2ff'];
    return `<svg viewBox="0 0 1000 520" preserveAspectRatio="xMidYMax meet">${cols.map((c, i) => `<path d="M${80 + i * 34} 520 A${420 - i * 34} ${420 - i * 34} 0 0 1 ${920 - i * 34} 520" stroke="${c}" stroke-width="36" fill="none" stroke-linecap="round"/>`).join('')}
    ${cols.map((c, i) => `<rect x="${80 + i * 34 - 18}" y="440" width="36" height="80" rx="16" fill="${c}"/><rect x="${920 - i * 34 - 18}" y="440" width="36" height="80" rx="16" fill="${c}"/>`).join('')}</svg>`; }
  function castle() { return `<svg viewBox="0 0 600 520" preserveAspectRatio="xMidYMax meet">
    <rect x="150" y="200" width="300" height="320" rx="20" fill="url(#gCastle)"/>
    <rect x="70" y="220" width="110" height="300" rx="16" fill="url(#gCastle)"/><rect x="420" y="220" width="110" height="300" rx="16" fill="url(#gCastle)"/>
    <rect x="230" y="110" width="140" height="200" rx="16" fill="url(#gCastle)"/>
    <path d="M60 230 L125 110 L190 230Z" fill="#f6a3c7"/><path d="M410 230 L475 110 L540 230Z" fill="#f6a3c7"/>
    <path d="M220 120 L300 10 L380 120Z" fill="#c4a2f4"/><path d="M190 210 L230 140 L270 210Z" fill="#9fd0ff"/><path d="M330 210 L370 140 L410 210Z" fill="#9fd0ff"/>
    <ellipse cx="300" cy="190" rx="28" ry="34" fill="#9fd0ff"/><ellipse cx="125" cy="300" rx="16" ry="22" fill="#9fd0ff"/><ellipse cx="475" cy="300" rx="16" ry="22" fill="#9fd0ff"/>
    <ellipse cx="210" cy="300" rx="14" ry="20" fill="#9fd0ff"/><ellipse cx="390" cy="300" rx="14" ry="20" fill="#9fd0ff"/>
    <path d="M250 520 L250 420 Q300 370 350 420 L350 520Z" fill="#f7e3ec"/>
    <line x1="125" y1="110" x2="125" y2="70" stroke="#e8a926" stroke-width="5"/><path d="M125 72 L160 82 L125 92Z" fill="#f06fb0"/>
    <line x1="475" y1="110" x2="475" y2="70" stroke="#e8a926" stroke-width="5"/><path d="M475 72 L510 82 L475 92Z" fill="#f06fb0"/>
    <rect x="60" y="222" width="130" height="14" rx="7" fill="#fff"/><rect x="410" y="222" width="130" height="14" rx="7" fill="#fff"/><rect x="220" y="112" width="160" height="14" rx="7" fill="#fff"/></svg>`; }
  function tree(c = '#8fe07c', d = '#5cbf55') { return `<svg viewBox="0 0 200 260"><rect x="88" y="150" width="24" height="110" rx="10" fill="#c58a5a"/>
    <circle cx="100" cy="90" r="70" fill="${c}"/><circle cx="52" cy="122" r="42" fill="${c}"/><circle cx="148" cy="122" r="42" fill="${c}"/>
    <circle cx="80" cy="66" r="26" fill="#fff" opacity=".22"/><path d="M40 150 Q100 180 160 150" stroke="${d}" stroke-width="10" fill="none" opacity=".4"/></svg>`; }
  function pine() { return `<svg viewBox="0 0 200 280"><rect x="88" y="230" width="24" height="50" rx="8" fill="#c58a5a"/>
    <path d="M100 10 L30 110 L170 110Z M100 60 L20 180 L180 180Z M100 110 L10 240 L190 240Z" fill="#8fe6b8"/><path d="M100 10 L70 54 L100 54Z" fill="#fff" opacity=".25"/></svg>`; }
  function flower(c = '#f06fb0') { return `<svg viewBox="0 0 100 180"><path d="M50 70 L50 180" stroke="#5cbf55" stroke-width="8"/><path d="M50 130 Q80 110 86 124 Q70 140 50 136" fill="#5cbf55"/>
    ${[0, 72, 144, 216, 288].map(a => `<ellipse cx="50" cy="40" rx="18" ry="24" fill="${c}" transform="rotate(${a} 50 62)"/>`).join('')}<circle cx="50" cy="62" r="14" fill="#ffd45a"/></svg>`; }
  function mushroom(c = '#ff7a7a') { return `<svg viewBox="0 0 100 100"><rect x="36" y="50" width="28" height="46" rx="12" fill="#fff4e6"/><path d="M6 56 Q10 6 50 6 Q90 6 94 56Z" fill="${c}"/>
    <circle cx="34" cy="28" r="6" fill="#fff"/><circle cx="64" cy="34" r="5" fill="#fff"/></svg>`; }

  return { init, hero, face, cat, bunny, fairy, butterfly, rainbow, castle, tree, pine, flower, mushroom, mane, anulik, harut };
})();
