/* ============================================================
   GANTABYA — app.js  |  Shared across all pages
   ============================================================ */

const TREKS = {
  ebc: {
    title: 'Everest Base Camp', region: 'Khumbu Region',
    img: 'https://commons.wikimedia.org/wiki/Special:FilePath/Trekkers%20posing%20in%20Everest%20Base%20Camp.jpg',
    pills: ['14 Days', '5,364m Max', 'Hard', 'Oct–Nov / Mar–May'],
    days: 14, maxAlt: '5,364m', difficulty: 'Hard',
    basePrice: 1650,
    itinerary: [
      { day:'D1',  name:'Fly Kathmandu → Lukla → Phakding',                        alt:'2,610m' },
      { day:'D2',  name:'Phakding → Namche Bazaar',                                 alt:'3,440m' },
      { day:'D3',  name:'Acclimatisation Day — Namche Bazaar',                      alt:'Rest', rest:true },
      { day:'D4',  name:'Namche → Tengboche Monastery',                             alt:'3,860m' },
      { day:'D5',  name:'Tengboche → Dingboche',                                    alt:'4,410m' },
      { day:'D6',  name:'Acclimatisation Day — Dingboche',                          alt:'Rest', rest:true },
      { day:'D7',  name:'Dingboche → Lobuche',                                      alt:'4,940m' },
      { day:'D8',  name:'Lobuche → Gorak Shep → Everest Base Camp → Gorak Shep',   alt:'5,364m' },
      { day:'D9',  name:'Gorak Shep → Kala Patthar (5,545m) → Pheriche',           alt:'5,545m' },
      { day:'D10', name:'Pheriche → Namche Bazaar',                                 alt:'3,440m' },
      { day:'D11', name:'Namche Bazaar → Lukla',                                    alt:'2,860m' },
      { day:'D12', name:'Fly Lukla → Kathmandu (buffer day)',                       alt:'1,400m' },
    ],
    permits: ['TIMS Card','Sagarmatha National Park Entry Permit','Khumbu Pasang Lhamu Rural Municipality Fee'],
    highlights: ['Kala Patthar sunrise (5,545m)','Tengboche Monastery','Sherpa culture in Namche','Glacial moraine walk to EBC'],
    pricing: [{ label:'Solo (guide + porter)', price:'USD 1,650' },{ label:'2–4 people', price:'USD 1,250 pp' },{ label:'5+ people', price:'USD 1,050 pp' }],
  },
  abc: {
    title: 'Annapurna Sanctuary', region: 'Annapurna Region',
    img: 'https://commons.wikimedia.org/wiki/Special:FilePath/Annapurna%20Base%20Camp%20Trek%20view.jpg',
    pills: ['10 Days', '4,130m Max', 'Moderate', 'Mar–May / Oct–Nov'],
    days: 10, maxAlt: '4,130m', difficulty: 'Moderate',
    basePrice: 1100,
    itinerary: [
      { day:'D1',  name:'Drive Kathmandu → Pokhara',                     alt:'820m' },
      { day:'D2',  name:'Drive Pokhara → Nayapul → Tikhedhunga',         alt:'1,540m' },
      { day:'D3',  name:'Tikhedhunga → Ghorepani',                       alt:'2,860m' },
      { day:'D4',  name:'Poon Hill Sunrise (3,210m) → Trek to Tadapani', alt:'2,630m' },
      { day:'D5',  name:'Tadapani → Chhomrong',                          alt:'2,170m' },
      { day:'D6',  name:'Chhomrong → Dovan',                             alt:'2,600m' },
      { day:'D7',  name:'Dovan → Annapurna Base Camp',                   alt:'4,130m' },
      { day:'D8',  name:'ABC Sunrise → descend to Bamboo',               alt:'2,310m' },
      { day:'D9',  name:'Bamboo → Jhinu Danda (hot springs)',            alt:'1,780m' },
      { day:'D10', name:'Jhinu → Nayapul → drive Pokhara',              alt:'820m' },
    ],
    permits: ['TIMS Card','Annapurna Conservation Area Project (ACAP) Permit'],
    highlights: ['Poon Hill sunrise over Dhaulagiri & Annapurna','Glacial amphitheatre at ABC','Rhododendron forests in bloom','Gurung village culture'],
    pricing: [{ label:'Solo (guide + porter)', price:'USD 1,100' },{ label:'2–4 people', price:'USD 850 pp' },{ label:'5+ people', price:'USD 720 pp' }],
  },
  gokyo: {
    title: 'Namche & Gokyo Lakes', region: 'Khumbu Region',
    img: 'https://commons.wikimedia.org/wiki/Special:FilePath/Namche%20Bazaar%20Nepal.jpg',
    pills: ['12 Days', '5,357m Max', 'Hard', 'Oct–Nov / Mar–May'],
    days: 12, maxAlt: '5,357m', difficulty: 'Hard',
    basePrice: 1450,
    itinerary: [
      { day:'D1',  name:'Fly Kathmandu → Lukla → Phakding',              alt:'2,610m' },
      { day:'D2',  name:'Phakding → Namche Bazaar',                       alt:'3,440m' },
      { day:'D3',  name:'Acclimatisation Day — Namche',                   alt:'Rest', rest:true },
      { day:'D4',  name:'Namche → Dole',                                  alt:'4,200m' },
      { day:'D5',  name:'Dole → Machermo',                                alt:'4,470m' },
      { day:'D6',  name:'Machermo → Gokyo Village',                       alt:'4,790m' },
      { day:'D7',  name:'Gokyo Ri Summit (5,357m) + Lakes exploration',   alt:'5,357m' },
      { day:'D8',  name:'Rest & acclimatisation at Gokyo',                alt:'Rest', rest:true },
      { day:'D9',  name:'Gokyo → Namche Bazaar',                         alt:'3,440m' },
      { day:'D10', name:'Namche → Lukla',                                 alt:'2,860m' },
      { day:'D11', name:'Fly Lukla → Kathmandu',                         alt:'1,400m' },
    ],
    permits: ['TIMS Card','Sagarmatha National Park Entry Permit','Khumbu Pasang Lhamu Rural Municipality Fee'],
    highlights: ['Six sacred Gokyo Lakes','Gokyo Ri: Everest, Lhotse, Makalu, Cho Oyu views','Far fewer trekkers than EBC','Ngozumpa Glacier'],
    pricing: [{ label:'Solo (guide + porter)', price:'USD 1,450' },{ label:'2–4 people', price:'USD 1,100 pp' },{ label:'5+ people', price:'USD 950 pp' }],
  },
};

/* ── NAV INIT (runs on every page) ──────────────────────── */
(function initNav() {
  const toggle   = document.getElementById('nav-toggle');
  const navLinks = document.getElementById('nav-links');
  const nav      = document.getElementById('main-nav');
  if (!toggle || !navLinks) return;

  toggle.addEventListener('click', () => {
    const open = navLinks.classList.toggle('open');
    toggle.setAttribute('aria-expanded', open);
  });
  navLinks.querySelectorAll('a').forEach(a =>
    a.addEventListener('click', () => navLinks.classList.remove('open'))
  );
  window.addEventListener('scroll', () => {
    nav.style.boxShadow = window.scrollY > 40 ? '0 4px 18px rgba(22,49,63,.1)' : 'none';
  }, { passive: true });
})();
