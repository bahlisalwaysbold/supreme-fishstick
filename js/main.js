/* ===================== LTE HOUSE — main.js ===================== */

/* ===================== PAGE LOADER =====================
   An Instagram-style splash: the roofline glow loops toward
   the peak and the bulb pulses in sync, for as long as the
   page is actually loading. Shows on every page load (not
   just once) and disappears the moment the page is ready —
   with a small minimum so it never flashes. Tune the loop
   timing in the .l-roof-glow / .l-bulb-glow rules in style.css. */
(function pageLoader(){
  const loaderEl = document.querySelector('.page-loader');
  if(!loaderEl) return;

  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){
    loaderEl.classList.add('no-motion');
  }

  function dismiss(){
    document.body.classList.remove('loading');
    loaderEl.classList.add('hide');
    setTimeout(() => loaderEl.remove(), 450);
  }

  document.body.classList.add('loading');
  const minDisplay = new Promise(r => setTimeout(r, 350)); // avoid a flash on instant loads
  const pageReady = new Promise(r => {
    if(document.readyState === 'complete') r();
    else window.addEventListener('load', r, { once:true });
  });
  Promise.all([minDisplay, pageReady]).then(dismiss);
})();

/* ---- mobile nav ---- */
(function navToggle(){
  const btn = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');
  if(!btn || !links) return;
  function setMenu(open){
    links.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', String(open));
    document.body.classList.toggle('menu-open', open);
  }
  btn.addEventListener('click', () => setMenu(!links.classList.contains('open')));
  links.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', e => {
    if(e.key === 'Escape') setMenu(false);
  });
})();

/* ---- scroll reveal ---- */
(function reveal(){
  const items = document.querySelectorAll('.reveal');
  if(!items.length) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => { if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold:0.15 });
  items.forEach(el => io.observe(el));
})();

/* ===================== QUOTE CART (Shop) =====================
   Stored client-side in localStorage under 'lte_quote'.
   Each item: { id, name, price } — no payment is processed;
   this builds a request that gets submitted on the Bookings/
   Contact page. Wire this to a real backend/payment provider
   when you're ready to take orders. */
const QUOTE_KEY = 'lte_quote';

function getQuote(){
  try { return JSON.parse(localStorage.getItem(QUOTE_KEY)) || []; }
  catch(e){ return []; }
}
function saveQuote(items){ localStorage.setItem(QUOTE_KEY, JSON.stringify(items)); }

function addToQuote(id, name, price){
  const items = getQuote();
  if(!items.find(i => i.id === id)) items.push({ id, name, price });
  saveQuote(items);
  updateQuoteUI();
}
function removeFromQuote(id){
  saveQuote(getQuote().filter(i => i.id !== id));
  updateQuoteUI();
}

function updateQuoteUI(){
  const items = getQuote();
  const bar = document.querySelector('.quote-bar');
  const count = document.querySelector('.quote-bar .count');
  if(bar && count){
    count.textContent = items.length;
    bar.classList.toggle('show', items.length > 0);
  }
  document.querySelectorAll('.qty-btn').forEach(btn => {
    const id = btn.dataset.id;
    const inList = items.some(i => i.id === id);
    btn.classList.toggle('added', inList);
    btn.textContent = inList ? 'Added to quote ✓' : (btn.dataset.label || 'Add to quote');
  });
  const listEl = document.querySelector('[data-quote-list]');
  if(listEl){
    if(items.length === 0){
      listEl.innerHTML = '<p style="color:var(--grey);font-size:0.92rem;">No products selected yet. Visit the <a href="shop.html" style="color:var(--gold);">shop</a> to add items to your quote request.</p>';
    } else {
      listEl.innerHTML = items.map(i => `
        <div class="summary-row">
          <span>${i.name}</span>
          <b>${i.price} <button type="button" data-remove="${i.id}" style="background:none;border:none;color:var(--grey);margin-left:12px;cursor:pointer;font-family:var(--body);">remove</button></b>
        </div>`).join('');
      listEl.querySelectorAll('[data-remove]').forEach(b => b.addEventListener('click', () => removeFromQuote(b.dataset.remove)));
    }
  }
  const hiddenField = document.querySelector('#quote-items-field');
  if(hiddenField) hiddenField.value = items.map(i => `${i.name} (${i.price})`).join(', ');
}

document.addEventListener('click', (e) => {
  const btn = e.target.closest('.qty-btn');
  if(!btn) return;
  const { id, name, price } = btn.dataset;
  if(btn.classList.contains('added')){ removeFromQuote(id); }
  else { addToQuote(id, name, price); }
});
updateQuoteUI();

/* shop filter chips */
(function shopFilters(){
  const chips = document.querySelectorAll('.filter-chip');
  const cards = document.querySelectorAll('[data-category]');
  if(!chips.length) return;
  chips.forEach(chip => chip.addEventListener('click', () => {
    chips.forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
    const cat = chip.dataset.filter;
    cards.forEach(card => {
      card.style.display = (cat === 'all' || card.dataset.category === cat) ? '' : 'none';
    });
  }));
})();
  /* ---- direct contact links ---- */
  (function contactLinks(){
    document.querySelectorAll('[aria-label="Message LTE House on WhatsApp"]').forEach(link => {
      link.href = 'https://wa.me/2349051722541';
      link.target = '_blank';
      link.rel = 'noopener';
    });
    document.querySelectorAll('[aria-label="LTE House on X (Twitter)"]').forEach(link => {
      link.href = 'https://x.com/lte_house';
      link.target = '_blank';
      link.rel = 'noopener';
    });
  })();


/* ===================== BOOKINGS CALENDAR =====================
   Pure front-end date + time-slot picker. On submit it only
   shows a confirmation — connect the form to your booking
   backend / email service to actually receive requests. */
(function bookingCalendar(){
  const grid = document.querySelector('.cal-grid');
  if(!grid) return;

  const monthLabel = document.querySelector('.cal-head b');
  const prevBtn = document.querySelector('[data-cal-prev]');
  const nextBtn = document.querySelector('[data-cal-next]');
  const slotGrid = document.querySelector('.slot-grid');
  const dateSummary = document.querySelector('[data-summary-date]');
  const timeSummary = document.querySelector('[data-summary-time]');
  const hiddenDate = document.querySelector('#booking-date-field');
  const hiddenTime = document.querySelector('#booking-time-field');
  const confirmBtn = document.querySelector('[data-booking-submit]');

  const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const today = new Date();
  let viewYear = today.getFullYear();
  let viewMonth = today.getMonth();
  let selectedDate = null;
  let selectedTime = null;

  const slots = ['9:00 AM','10:30 AM','12:00 PM','1:30 PM','3:00 PM','4:30 PM'];
  // Demo: pretend a couple of slots are already booked, per weekday number
  const unavailableByDay = { 1:['12:00 PM'], 3:['9:00 AM','3:00 PM'], 5:['4:30 PM'] };

  function render(){
    monthLabel.textContent = `${monthNames[viewMonth]} ${viewYear}`;
    grid.querySelectorAll('.cal-day, .empty').forEach(n => n.remove());

    const firstDay = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const frag = document.createDocumentFragment();

    for(let i=0;i<firstDay;i++){
      const empty = document.createElement('div');
      empty.className = 'cal-day empty';
      frag.appendChild(empty);
    }
    for(let d=1; d<=daysInMonth; d++){
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'cal-day';
      btn.textContent = d;
      const thisDate = new Date(viewYear, viewMonth, d);
      const isPast = thisDate < new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const isSunday = thisDate.getDay() === 0;
      if(isPast || isSunday){ btn.disabled = true; }
      if(selectedDate && thisDate.toDateString() === selectedDate.toDateString()){ btn.classList.add('selected'); }
      btn.addEventListener('click', () => {
        selectedDate = thisDate;
        selectedTime = null;
        render();
        renderSlots();
      });
      frag.appendChild(btn);
    }
    grid.appendChild(frag);
  }

  function renderSlots(){
    if(!slotGrid) return;
    slotGrid.innerHTML = '';
    if(!selectedDate){
      slotGrid.innerHTML = '<p style="color:var(--grey);font-size:0.88rem;grid-column:1/-1;">Pick a date to see available times.</p>';
      updateSummary();
      return;
    }
    const dow = selectedDate.getDay();
    const unavailable = unavailableByDay[dow] || [];
    slots.forEach(time => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'slot';
      btn.textContent = time;
      if(unavailable.includes(time)){ btn.disabled = true; }
      if(selectedTime === time){ btn.classList.add('selected'); }
      btn.addEventListener('click', () => {
        selectedTime = time;
        renderSlots();
        updateSummary();
      });
      slotGrid.appendChild(btn);
    });
    updateSummary();
  }

  function updateSummary(){
    const dateStr = selectedDate ? selectedDate.toLocaleDateString(undefined, { weekday:'long', month:'long', day:'numeric', year:'numeric' }) : '—';
    const timeStr = selectedTime || '—';
    if(dateSummary) dateSummary.textContent = dateStr;
    if(timeSummary) timeSummary.textContent = timeStr;
    if(hiddenDate) hiddenDate.value = dateStr;
    if(hiddenTime) hiddenTime.value = timeStr;
    if(confirmBtn) confirmBtn.disabled = !(selectedDate && selectedTime);
  }

  prevBtn && prevBtn.addEventListener('click', () => {
    viewMonth--; if(viewMonth < 0){ viewMonth = 11; viewYear--; }
    render();
  });
  nextBtn && nextBtn.addEventListener('click', () => {
    viewMonth++; if(viewMonth > 11){ viewMonth = 0; viewYear++; }
    render();
  });

  render();
  renderSlots();
})();

/* ===================== DEMO FORMS =====================
  Keep quote forms local until a backend is connected. */
document.querySelectorAll('form[data-fake-submit]').forEach(form => {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const success = form.parentElement.querySelector('.form-success') || document.querySelector(form.dataset.successTarget || '');
    form.style.display = 'none';
    if(success) success.classList.add('show');
    if(form.id === 'shop-quote-form'){ saveQuote([]); }
  });
});
