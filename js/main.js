
// main.js — navigation, reveal on scroll, lightbox, form validation
// Modular, no libraries. Each section is commented for clarity.

// --- Utilities ---
const $ = selector => document.querySelector(selector);
const $$ = selector => Array.from(document.querySelectorAll(selector));

// --- Set year in footer if present ---
['#year','#year-2','#year-3','#year-4'].forEach(id => {
  const el = document.querySelector(id);
  if (el) el.textContent = new Date().getFullYear();
});

// --- Mobile nav toggle (re-usable for multiple toggles) ---
function wireNav(toggleId, navId) {
  const btn = document.getElementById(toggleId);
  const nav = document.getElementById(navId);
  if (!btn || !nav) return;
  btn.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    btn.setAttribute('aria-expanded', String(open));
  });
}
wireNav('nav-toggle','main-nav');
wireNav('nav-toggle-2','main-nav-2');
wireNav('nav-toggle-3','main-nav-3');
wireNav('nav-toggle-4','main-nav-4');

// --- Reveal on scroll using IntersectionObserver ---
const revealElems = $$('.reveal');
if ('IntersectionObserver' in window) {
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.15 });
  revealElems.forEach(el => obs.observe(el));
} else {
  // fallback
  revealElems.forEach(el => el.classList.add('visible'));
}

// --- Lightbox logic ---
const lightbox = $('#lightbox');
const lightboxImg = $('#lightbox-img');
const lightboxClose = $('#lightbox-close');

$$('.open-lightbox').forEach(btn => {
  btn.addEventListener('click', (ev) => {
    const src = btn.getAttribute('data-img');
    lightboxImg.src = src;
    lightbox.setAttribute('aria-hidden','false');
    document.body.style.overflow = 'hidden';
  });
});
if (lightboxClose) {
  lightboxClose.addEventListener('click', () => {
    lightbox.setAttribute('aria-hidden','true');
    lightboxImg.src = '';
    document.body.style.overflow = '';
  });
}
lightbox && lightbox.addEventListener('click', (e) => {
  if (e.target === lightbox) {
    lightbox.setAttribute('aria-hidden','true');
    lightboxImg.src = '';
    document.body.style.overflow = '';
  }
});

// --- Project filter (basic) ---
const projectList = $('#project-list');
if (projectList) {
  const radios = document.querySelectorAll('input[name="filter"]');
  radios.forEach(r => r.addEventListener('change', applyFilter));
  function applyFilter() {
    const selected = Array.from(radios).find(r => r.checked);
    const type = selected?.id === 'filter-all' ? 'all' : (selected?.id === 'filter-ux' ? 'ux' : 'fe');
    $$('.project-card').forEach(card => {
      const t = card.dataset.type;
      if (type === 'all' || t === type) card.style.display = '';
      else card.style.display = 'none';
    });
  }
}

// --- Contact form validation (client-side only demo) ---
const form = $('#contact-form');
if (form) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    // simple validation
    let ok = true;
    const name = $('#name'); const email = $('#email'); const message = $('#message');
    const errName = $('#error-name'); const errEmail = $('#error-email'); const errMsg = $('#error-message');
    errName.textContent = ''; errEmail.textContent = ''; errMsg.textContent = '';

    if (!name.value || name.value.trim().length < 2) { errName.textContent = 'Enter your name (2+ chars)'; ok = false; }
    if (!email.value || !/^\S+@\S+\.\S+$/.test(email.value)) { errEmail.textContent = 'Enter a valid email'; ok = false; }
    if (!message.value || message.value.trim().length < 10) { errMsg.textContent = 'Message must be at least 10 characters'; ok = false; }

    if (!ok) {
      // scroll to first error for UX
      const firstErr = document.querySelector('.error:not(:empty)');
      if (firstErr) firstErr.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    // Demo: store locally (since no backend). Replace with fetch() to your API when ready.
    const payload = {
      name: name.value.trim(),
      email: email.value.trim(),
      message: message.value.trim(),
      ts: new Date().toISOString()
    };
    // WARNING: storing personal data locally is only for demos. Don't do this for production.
    const store = JSON.parse(localStorage.getItem('portfolio_contacts') || '[]');
    store.push(payload);
    localStorage.setItem('portfolio_contacts', JSON.stringify(store));
    $('#form-success').hidden = false;
    form.reset();
  });
}

// --- Dark mode toggle logic (supports multiple toggles per page) ---
function setDarkMode(on) {
  document.body.classList.toggle('dark', on);
  $$('.dark-toggle').forEach(btn => {
    const icon = btn.querySelector('#dark-toggle-icon');
    if (icon) icon.textContent = on ? '☀️' : '🌙';
  });
  localStorage.setItem('darkMode', on ? '1' : '0');
}
$$('.dark-toggle').forEach(btn => {
  btn.addEventListener('click', () => {
    const isDark = document.body.classList.contains('dark');
    setDarkMode(!isDark);
  });
});
// On load, set dark mode from localStorage or system preference
const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
const darkPref = localStorage.getItem('darkMode');
if (darkPref === '1' || (darkPref === null && prefersDark)) {
  setDarkMode(true);
} else {
  setDarkMode(false);
}
