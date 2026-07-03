/* ============================================================
   GANTABYA — script.js  |  index.html interactions only
   ============================================================ */

/* ── TREK MODAL ────────────────────────────────────────────── */
(function initModal() {
  const overlay      = document.getElementById('trek-modal');
  const closeBtn     = document.getElementById('modal-close');
  const modalImg     = document.getElementById('modal-img');
  const modalRegion  = document.getElementById('modal-region');
  const modalTitle   = document.getElementById('modal-title');
  const modalPills   = document.getElementById('modal-pills');
  const modalItin    = document.getElementById('modal-itinerary');
  const modalPermits = document.getElementById('modal-permits');
  const modalHL      = document.getElementById('modal-highlights');
  const modalPricing = document.getElementById('modal-pricing');
  const modalEnquire = document.getElementById('modal-enquire');
  const modalBook    = document.getElementById('modal-book-btn');

  let currentKey = null;

  function openModal(trekKey) {
    const t = TREKS[trekKey];
    if (!t) return;
    currentKey = trekKey;

    modalImg.src            = t.img;
    modalImg.alt            = t.title;
    modalRegion.textContent = t.region;
    modalTitle.textContent  = t.title;
    modalPills.innerHTML    = t.pills.map(p => `<span class="modal-pill">${p}</span>`).join('');

    modalItin.innerHTML = t.itinerary.map(d => `
      <div class="modal-day${d.rest ? ' is-rest' : ''}">
        <span class="modal-day-num">${d.day}</span>
        <div class="modal-day-info">
          <strong>${d.name}</strong>
          <div class="modal-day-alt">${d.alt}</div>
        </div>
      </div>`).join('');

    modalPermits.innerHTML = t.permits.map(p => `<li>${p}</li>`).join('');
    modalHL.innerHTML      = t.highlights.map(h => `<li>${h}</li>`).join('');
    modalPricing.innerHTML = t.pricing.map(p =>
      `<div class="price-line"><span>${p.label}</span><strong>${p.price}</strong></div>`).join('');

    // Enquire — scroll to contact form & pre-select trek
    modalEnquire.onclick = () => {
      closeModal();
      const sel = document.getElementById('f-trek');
      if (sel) sel.value = trekKey;
      const contactSection = document.getElementById('contact');
      if (contactSection) setTimeout(() => contactSection.scrollIntoView({ behavior: 'smooth' }), 100);
    };

    // Book — go to booking page with trek pre-selected
    modalBook.href = `booking.html?trek=${trekKey}`;

    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    overlay.classList.remove('active');
    document.body.style.overflow = '';
    currentKey = null;
  }

  // Open on card or link click
  document.querySelectorAll('.trek-card, .trek-link').forEach(el => {
    el.addEventListener('click', e => {
      if (el.classList.contains('trek-link')) e.stopPropagation();
      const key = el.dataset.trek;
      if (key) openModal(key);
    });
  });

  closeBtn.addEventListener('click', closeModal);
  overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
})();


/* ── CONTACT QUERY FORM ────────────────────────────────────── */
(function initForm() {
  const form       = document.getElementById('query-form');
  const successBox = document.getElementById('form-success');
  const submitBtn  = document.getElementById('submit-btn');
  const btnText    = document.getElementById('btn-text');
  const btnLoader  = document.getElementById('btn-loader');
  if (!form) return;

  function showError(fieldId, errId, msg) {
    const f = document.getElementById(fieldId);
    const e = document.getElementById(errId);
    if (f) f.classList.add('error');
    if (e) e.textContent = msg;
  }
  function clearError(fieldId, errId) {
    const f = document.getElementById(fieldId);
    const e = document.getElementById(errId);
    if (f) f.classList.remove('error');
    if (e) e.textContent = '';
  }

  [['f-name','err-name'],['f-email','err-email'],['f-trek','err-trek']].forEach(([f,e]) => {
    const el = document.getElementById(f);
    if (el) el.addEventListener('input', () => clearError(f, e));
  });

  function validate() {
    let ok = true;
    const name = document.getElementById('f-name').value.trim();
    if (!name) { showError('f-name','err-name','Please enter your full name.'); ok=false; }
    else clearError('f-name','err-name');

    const email = document.getElementById('f-email').value.trim();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showError('f-email','err-email','Please enter a valid email address.'); ok=false;
    } else clearError('f-email','err-email');

    const trek = document.getElementById('f-trek').value;
    if (!trek) { showError('f-trek','err-trek','Please select a trek.'); ok=false; }
    else clearError('f-trek','err-trek');

    return ok;
  }

  form.addEventListener('submit', e => {
    e.preventDefault();
    if (!validate()) return;
    submitBtn.disabled = true;
    btnText.style.display  = 'none';
    btnLoader.style.display = 'inline';
    setTimeout(() => {
      form.style.display       = 'none';
      successBox.style.display = 'block';
      /* BACKEND HOOK:
         fetch('/api/queries', { method:'POST', body: new FormData(form) }); */
    }, 1400);
  });
})();
