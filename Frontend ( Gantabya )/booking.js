/* ============================================================
   GANTABYA — booking.js
   3-step booking flow: Trek → Traveller Info → Payment
   ============================================================ */

const ADDONS = [
  { id:'insurance',  label:'Travel Insurance',      desc:'Covers medical evacuation & trip cancellation', price:120 },
  { id:'porter',     label:'Personal Porter',       desc:'Dedicated porter for your gear (18kg max)',      price:180 },
  { id:'transfer',   label:'Airport Transfer',      desc:'Private pickup/drop Kathmandu airport',          price:45  },
  { id:'gear',       label:'Gear Rental Package',   desc:'Sleeping bag, down jacket, trekking poles',      price:60  },
];

const GROUP_MULTIPLIERS = { '1':1, '2':0.9, '3':0.85, '4':0.82, '5+':0.78 };

let state = {
  step: 1,
  trekKey: null,
  groupSize: '1',
  startDate: '',
  addons: [],
  travellers: [],
  payMethod: 'esewa',
  txnRef: '',
  totalUSD: 0,
  totalNPR: 0,
  bookingRef: '',
};

/* ── UTILS ───────────────────────────────────────────────── */
const qs  = (s, ctx = document) => ctx.querySelector(s);
const qsa = (s, ctx = document) => [...ctx.querySelectorAll(s)];
const USD_TO_NPR = 134; // approximate; replace with live rate from backend later

function calcTotal() {
  if (!state.trekKey) return 0;
  const base  = TREKS[state.trekKey].basePrice;
  const mult  = GROUP_MULTIPLIERS[state.groupSize] || 1;
  const pax   = state.groupSize === '5+' ? 5 : parseInt(state.groupSize);
  let total   = base * mult * pax;
  ADDONS.forEach(a => { if (state.addons.includes(a.id)) total += a.price * pax; });
  return Math.round(total);
}

function renderSidebar() {
  const trek = state.trekKey ? TREKS[state.trekKey] : null;

  // trek summary
  qs('#sb-trek-name').textContent   = trek ? trek.title   : '— not selected —';
  qs('#sb-trek-region').textContent = trek ? trek.region  : '';
  qs('#sb-days').textContent        = trek ? `${trek.days} days` : '—';
  qs('#sb-altitude').textContent    = trek ? trek.maxAlt  : '—';
  qs('#sb-difficulty').textContent  = trek ? trek.difficulty : '—';
  qs('#sb-date').textContent        = state.startDate || '—';
  qs('#sb-group').textContent       = state.groupSize === '5+' ? '5+ people' : `${state.groupSize} ${state.groupSize === '1' ? 'person' : 'people'}`;

  // price breakdown
  const breakdownEl = qs('#sb-breakdown');
  if (!trek) { breakdownEl.innerHTML = '<p style="color:var(--muted);font-size:.85rem;">Select a trek to see pricing.</p>'; qs('#sb-total').textContent='—'; return; }

  const pax  = state.groupSize === '5+' ? 5 : parseInt(state.groupSize);
  const mult = GROUP_MULTIPLIERS[state.groupSize] || 1;
  const base = trek.basePrice * mult;
  let lines  = `<div class="price-line"><span>Trek (${pax}× USD ${base.toFixed(0)} pp)</span><span>USD ${(base*pax).toFixed(0)}</span></div>`;
  ADDONS.forEach(a => {
    if (state.addons.includes(a.id))
      lines += `<div class="price-line"><span>${a.label} (${pax}×)</span><span>USD ${a.price * pax}</span></div>`;
  });
  breakdownEl.innerHTML = lines;
  state.totalUSD = calcTotal();
  state.totalNPR = Math.round(state.totalUSD * USD_TO_NPR);
  qs('#sb-total').textContent    = `USD ${state.totalUSD.toLocaleString()}`;
  qs('#sb-total-npr').textContent= `≈ NPR ${state.totalNPR.toLocaleString()}`;
  // update payment amount display
  qs('#pay-amount-usd') && (qs('#pay-amount-usd').textContent = `USD ${state.totalUSD.toLocaleString()}`);
  qs('#pay-amount-npr') && (qs('#pay-amount-npr').textContent = `NPR ${state.totalNPR.toLocaleString()}`);
}

/* ── STEP INDICATOR ──────────────────────────────────────── */
function updateSteps() {
  qsa('.step-item').forEach(el => {
    const n = parseInt(el.dataset.step);
    el.classList.toggle('active', n === state.step);
    el.classList.toggle('done',   n < state.step);
  });
  qsa('.booking-panel').forEach(el => el.classList.remove('active'));
  const panel = qs(`#panel-${state.step}`);
  if (panel) panel.classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function goStep(n) { state.step = n; updateSteps(); renderSidebar(); }

/* ── STEP 1 — TREK SELECTION ─────────────────────────────── */
function initStep1() {
  // Trek options
  qsa('.trek-option').forEach(opt => {
    opt.addEventListener('click', () => {
      qsa('.trek-option').forEach(o => o.classList.remove('selected'));
      opt.classList.add('selected');
      opt.querySelector('input[type="radio"]').checked = true;
      state.trekKey = opt.dataset.trek;
      renderSidebar();
    });
  });

  // Preselect from URL param ?trek=ebc
  const urlTrek = new URLSearchParams(window.location.search).get('trek');
  if (urlTrek && TREKS[urlTrek]) {
    const opt = qs(`.trek-option[data-trek="${urlTrek}"]`);
    if (opt) opt.click();
  }

  // Group size
  qs('#b-group').addEventListener('change', e => {
    state.groupSize = e.target.value;
    renderSidebar();
    buildTravellers();
  });

  // Date
  qs('#b-date').addEventListener('change', e => {
    state.startDate = e.target.value;
    renderSidebar();
    // set min date to today
  });
  // Set min date to today
  qs('#b-date').min = new Date().toISOString().split('T')[0];

  // Add-ons
  qsa('.addon-item').forEach(item => {
    item.addEventListener('click', () => {
      const id  = item.dataset.addon;
      const chk = item.querySelector('input[type="checkbox"]');
      if (state.addons.includes(id)) {
        state.addons = state.addons.filter(a => a !== id);
        item.classList.remove('selected');
        chk.checked = false;
      } else {
        state.addons.push(id);
        item.classList.add('selected');
        chk.checked = true;
      }
      renderSidebar();
    });
  });

  // Next
  qs('#step1-next').addEventListener('click', () => {
    if (!state.trekKey)       { alert('Please select a trek to continue.'); return; }
    if (!state.startDate)     { alert('Please choose a preferred start date.'); return; }
    buildTravellers();
    goStep(2);
  });
}

/* ── STEP 2 — TRAVELLER INFO ─────────────────────────────── */
function buildTravellers() {
  const count = state.groupSize === '5+' ? 5 : parseInt(state.groupSize);
  const wrap  = qs('#travellers-wrap');
  wrap.innerHTML = '';
  for (let i = 1; i <= count; i++) {
    wrap.innerHTML += `
    <div class="traveller-block">
      <div class="traveller-block-title">Traveller ${i}${i===1?' (Lead)':''}</div>
      <div class="bform-row">
        <div class="bform-group">
          <label>First Name <span class="req">*</span></label>
          <input type="text" class="t-fname" data-idx="${i}" placeholder="Ram">
        </div>
        <div class="bform-group">
          <label>Last Name <span class="req">*</span></label>
          <input type="text" class="t-lname" data-idx="${i}" placeholder="Shrestha">
        </div>
      </div>
      <div class="bform-row">
        <div class="bform-group">
          <label>Nationality <span class="req">*</span></label>
          <input type="text" class="t-nationality" data-idx="${i}" placeholder="Nepali, British…">
        </div>
        <div class="bform-group">
          <label>Passport / ID Number <span class="req">*</span></label>
          <input type="text" class="t-passport" data-idx="${i}" placeholder="PA1234567">
        </div>
      </div>
      ${i===1 ? `
      <div class="bform-row">
        <div class="bform-group">
          <label>Email <span class="req">*</span></label>
          <input type="email" class="t-email" data-idx="1" placeholder="you@email.com">
        </div>
        <div class="bform-group">
          <label>Phone / WhatsApp <span class="req">*</span></label>
          <input type="tel" class="t-phone" data-idx="1" placeholder="+977 98XXXXXXXX">
        </div>
      </div>
      <div class="bform-row">
        <div class="bform-group">
          <label>Fitness Level</label>
          <select class="t-fitness" data-idx="1">
            <option value="">— Select —</option>
            <option>Beginner (occasional walks)</option>
            <option>Intermediate (regular hiking)</option>
            <option>Experienced (high-altitude hikes)</option>
            <option>Expert (mountaineering background)</option>
          </select>
        </div>
        <div class="bform-group">
          <label>Dietary / Medical Notes</label>
          <input type="text" class="t-notes" data-idx="1" placeholder="Vegetarian, no nuts…">
        </div>
      </div>` : ''}
    </div>`;
  }
}

function validateStep2() {
  let ok = true;
  qsa('.t-fname').forEach(el  => { if (!el.value.trim()) { el.classList.add('error'); ok=false; } else el.classList.remove('error'); });
  qsa('.t-lname').forEach(el  => { if (!el.value.trim()) { el.classList.add('error'); ok=false; } else el.classList.remove('error'); });
  qsa('.t-nationality').forEach(el => { if (!el.value.trim()) { el.classList.add('error'); ok=false; } else el.classList.remove('error'); });
  qsa('.t-passport').forEach(el => { if (!el.value.trim()) { el.classList.add('error'); ok=false; } else el.classList.remove('error'); });
  const emailEl = qs('.t-email');
  if (emailEl) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailEl.value.trim() || !re.test(emailEl.value)) { emailEl.classList.add('error'); ok=false; } else emailEl.classList.remove('error');
  }
  const phoneEl = qs('.t-phone');
  if (phoneEl && !phoneEl.value.trim()) { phoneEl.classList.add('error'); ok=false; } else if(phoneEl) phoneEl.classList.remove('error');
  return ok;
}

function collectTravellers() {
  const count = state.groupSize === '5+' ? 5 : parseInt(state.groupSize);
  state.travellers = [];
  for (let i = 1; i <= count; i++) {
    state.travellers.push({
      firstName:   qs(`.t-fname[data-idx="${i}"]`)?.value.trim() || '',
      lastName:    qs(`.t-lname[data-idx="${i}"]`)?.value.trim() || '',
      nationality: qs(`.t-nationality[data-idx="${i}"]`)?.value.trim() || '',
      passport:    qs(`.t-passport[data-idx="${i}"]`)?.value.trim() || '',
      email:       i===1 ? qs('.t-email')?.value.trim() : '',
      phone:       i===1 ? qs('.t-phone')?.value.trim() : '',
    });
  }
}

function initStep2() {
  qs('#step2-back').addEventListener('click', () => goStep(1));
  qs('#step2-next').addEventListener('click', () => {
    if (!validateStep2()) { alert('Please fill in all required traveller details.'); return; }
    collectTravellers();
    goStep(3);
    renderPaymentSummary();
  });
}

/* ── STEP 3 — PAYMENT ────────────────────────────────────── */
function renderPaymentSummary() {
  renderSidebar();
  const trek = TREKS[state.trekKey];
  qs('#pay-summary-trek').textContent  = trek.title;
  qs('#pay-summary-pax').textContent   = state.groupSize === '5+' ? '5+ travellers' : `${state.groupSize} traveller${state.groupSize > 1 ? 's':''}`;
  qs('#pay-summary-date').textContent  = state.startDate;
  qs('#pay-summary-total').textContent = `USD ${state.totalUSD.toLocaleString()} / NPR ${state.totalNPR.toLocaleString()}`;
  const depositUSD = Math.round(state.totalUSD * 0.3);
  const depositNPR = Math.round(depositUSD * USD_TO_NPR);
  qs('#pay-deposit-usd').textContent = `USD ${depositUSD.toLocaleString()}`;
  qs('#pay-deposit-npr').textContent = `NPR ${depositNPR.toLocaleString()}`;
  // Set esewa/bank amounts
  qs('#esewa-amt-npr').textContent = `NPR ${depositNPR.toLocaleString()}`;
  qs('#esewa-amt-usd').textContent = `(USD ${depositUSD.toLocaleString()})`;
}

function showPayPanel(method) {
  state.payMethod = method;
  qs('#esewa-panel').classList.toggle('active', method === 'esewa');
  qs('#bank-panel').classList.toggle('active',  method === 'bank');
  qsa('.pay-method').forEach(m => m.classList.toggle('selected', m.dataset.method === method));
}

function generateRef() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return 'GTB-' + Array.from({length:8}, () => chars[Math.floor(Math.random()*chars.length)]).join('');
}

function initStep3() {
  qs('#step3-back').addEventListener('click', () => goStep(2));

  // Payment method toggle
  qsa('.pay-method').forEach(m => {
    m.addEventListener('click', () => showPayPanel(m.dataset.method));
  });
  showPayPanel('esewa'); // default

  // Confirm booking
  qs('#confirm-booking').addEventListener('click', () => {
    const txn = qs('#txn-ref').value.trim();
    if (!txn) { qs('#txn-ref').classList.add('error'); alert('Please enter your payment / transaction reference number.'); return; }
    qs('#txn-ref').classList.remove('error');
    state.txnRef     = txn;
    state.bookingRef = generateRef();

    // Show confirmation
    qs('#panel-3').classList.remove('active');
    const conf = qs('#panel-confirm');
    conf.classList.add('active');

    // Fill confirmation
    const trek = TREKS[state.trekKey];
    qs('#conf-ref').textContent    = state.bookingRef;
    qs('#conf-trek').textContent   = trek.title;
    qs('#conf-date').textContent   = state.startDate;
    qs('#conf-pax').textContent    = state.groupSize === '5+' ? '5+ people' : `${state.groupSize} ${parseInt(state.groupSize)===1?'person':'people'}`;
    qs('#conf-total').textContent  = `USD ${state.totalUSD.toLocaleString()}`;
    qs('#conf-txn').textContent    = state.txnRef;
    qs('#conf-name').textContent   = `${state.travellers[0]?.firstName} ${state.travellers[0]?.lastName}`;
    qs('#conf-email').textContent  = state.travellers[0]?.email || '—';

    window.scrollTo({ top: 0, behavior: 'smooth' });

    /* ----------------------------------------------------------
       BACKEND HOOK (Node.js + PostgreSQL)
       When backend is ready, replace the block below:

       fetch('/api/bookings', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({
           bookingRef:   state.bookingRef,
           trekKey:      state.trekKey,
           startDate:    state.startDate,
           groupSize:    state.groupSize,
           addons:       state.addons,
           travellers:   state.travellers,
           payMethod:    state.payMethod,
           txnRef:       state.txnRef,
           totalUSD:     state.totalUSD,
           totalNPR:     state.totalNPR,
         })
       });
    ---------------------------------------------------------- */
  });
}

/* ── INIT ────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  renderSidebar();
  initStep1();
  initStep2();
  initStep3();
});
