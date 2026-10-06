/* ==========================================================================
   Kishore V — Portfolio scripts
   --------------------------------------------------------------------------
   EDIT HERE FIRST:
     • CONFIG   — WhatsApp number, prefilled message, form endpoint, timing
     • SKILLS   — the pills in the Skills marquee
     • PROJECTS — the 8 cards in the Projects carousel (placeholders for now)

   Sections below:
     1. Helpers
     2. WhatsApp links
     3. Navigation
     4. Swirling name ring (hero)
     5. Scroll reveal
     6. Skills marquee
     7. Projects carousel
     8. Book-a-call form
     9. Boot
   ========================================================================== */

const CONFIG = {
  // International format, digits only (no +, spaces or dashes)
  whatsappNumber: '919952944283',
  whatsappMessage: "Hi Kishore, I came across your portfolio and I'd like to discuss an AI agent / automation for my business.",

  // Optional: paste a form-backend URL here (e.g. https://formspree.io/f/xxxxxx)
  // to receive form submissions by email. While empty, the form opens
  // WhatsApp with the visitor's details prefilled instead.
  formEndpoint: '',

  // Projects carousel auto-advance interval (ms)
  autoplayMs: 10000,
};

const SKILLS = [
  'Agentic AI Workflow Development',
  'Agentic AI Systems',
  'RAG Agents / Applications',
  'WhatsApp Automations',
  'CRM Dashboards',
  'Custom Internal AI Tools',
  'Claude Code',
  'Codex',
  'Python Development',
  'Quality Assurance',
];

/* Project placeholders — replace each entry with a real project when ready.
   `hues` = [main, shadow] colour (0–360) for the animated orb graphic.
   Keep descriptions to ~30 words so the card layout stays balanced.       */
const PLACEHOLDER_DESC =
  "Case study coming soon. This space will describe the business problem, the AI agent built to solve it, and how it fits into the team's daily workflow from start to finish.";
const PLACEHOLDER_STACK = ['Tech stack 1', 'Tech stack 2', 'Tech stack 3', 'Tech stack 4'];

const PROJECTS = [
  { title: 'Project Title — Coming Soon', industry: 'Industry to be added', description: PLACEHOLDER_DESC, stack: PLACEHOLDER_STACK, hues: [26, 8] },
  { title: 'Project Title — Coming Soon', industry: 'Industry to be added', description: PLACEHOLDER_DESC, stack: PLACEHOLDER_STACK, hues: [268, 290] },
  { title: 'Project Title — Coming Soon', industry: 'Industry to be added', description: PLACEHOLDER_DESC, stack: PLACEHOLDER_STACK, hues: [312, 335] },
  { title: 'Project Title — Coming Soon', industry: 'Industry to be added', description: PLACEHOLDER_DESC, stack: PLACEHOLDER_STACK, hues: [42, 18] },
  { title: 'Project Title — Coming Soon', industry: 'Industry to be added', description: PLACEHOLDER_DESC, stack: PLACEHOLDER_STACK, hues: [172, 200] },
  { title: 'Project Title — Coming Soon', industry: 'Industry to be added', description: PLACEHOLDER_DESC, stack: PLACEHOLDER_STACK, hues: [214, 240] },
  { title: 'Project Title — Coming Soon', industry: 'Industry to be added', description: PLACEHOLDER_DESC, stack: PLACEHOLDER_STACK, hues: [346, 12] },
  { title: 'Project Title — Coming Soon', industry: 'Industry to be added', description: PLACEHOLDER_DESC, stack: PLACEHOLDER_STACK, hues: [86, 130] },
];


/* 1. HELPERS ============================================================== */
const $  = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const pad2 = (n) => String(n).padStart(2, '0');

const escapeHTML = (str) =>
  String(str).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const debounce = (fn, ms = 150) => {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
};

const whatsappURL = (message = CONFIG.whatsappMessage) =>
  `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(message)}`;


/* 2. WHATSAPP LINKS =======================================================
   Every element with .js-whatsapp gets the same wa.me link.               */
function initWhatsAppLinks() {
  $$('.js-whatsapp').forEach((a) => { a.href = whatsappURL(); });
}


/* 3. NAVIGATION =========================================================== */
function initNav() {
  const nav = $('#nav');
  const toggle = $('#navToggle');
  const links = $$('.nav__link');

  // Darker background once the page is scrolled
  const onScroll = () => nav.classList.toggle('is-scrolled', window.scrollY > 24);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // Mobile menu
  const setOpen = (open) => {
    nav.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  };
  toggle.addEventListener('click', () => setOpen(!nav.classList.contains('is-open')));
  links.forEach((l) => l.addEventListener('click', () => setOpen(false)));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setOpen(false); });
  document.addEventListener('click', (e) => { if (!nav.contains(e.target)) setOpen(false); });

  // Highlight the link of the section currently in view
  const sections = ['about', 'skills', 'projects', 'contact'].map((id) => document.getElementById(id)).filter(Boolean);
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      links.forEach((l) => l.classList.toggle('is-active', l.getAttribute('href') === `#${entry.target.id}` && !l.classList.contains('nav__link--mobile-cta')));
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  sections.forEach((s) => observer.observe(s));
}


/* 4. SWIRLING NAME RING ===================================================
   Builds the 3D letter ring. Each glyph is measured so spacing around the
   ring is proportional, then placed with rotateY(angle) translateZ(radius).
   The spin + wobble themselves are pure CSS (see .swirl__ring/.swirl__tilt). */
function initSwirl() {
  const ring = $('#swirlRing');
  if (!ring) return;
  const swirl = ring.closest('.swirl');
  const phrase = ring.dataset.text || 'KISHORE V ✦ ';
  const chars = [...phrase.repeat(3)];          // three copies: one full name fits the readable front arc
  const nameLength = phrase.trim().replace(/\s*✦$/, '').length; // "KISHORE V" → 9
  const ctx = document.createElement('canvas').getContext('2d');
  let lastSize = 0;

  function build() {
    const fs = parseFloat(getComputedStyle(swirl).fontSize);
    if (!fs || fs === lastSize) return;
    lastSize = fs;

    ctx.font = `900 ${fs}px Unbounded, "Arial Black", sans-serif`;
    const tracking = fs * 0.06;
    const widths = chars.map((c) => ctx.measureText(c === ' ' ? ' ' : c).width + tracking);
    const circumference = widths.reduce((a, b) => a + b, 0);
    const radius = circumference / (2 * Math.PI);

    // Angle (deg) of each glyph's centre
    let run = 0;
    const angles = widths.map((w) => {
      const a = ((run + w / 2) / circumference) * 360;
      run += w;
      return a;
    });

    // Rotate so the first "KISHORE V" is centred at the front on load
    const offset = (angles[0] + angles[nameLength - 1]) / 2;

    ring.innerHTML = chars.map((c, i) => {
      const angle = angles[i] - offset;
      const wave = Math.sin((angle * 2 * Math.PI) / 180) * fs * 0.1; // ribbon twist
      const glyph = c === ' ' ? '&nbsp;' : escapeHTML(c);
      return `<span class="swirl__char" style="--cw:${widths[i].toFixed(2)}px;transform:rotateY(${angle.toFixed(2)}deg) translateZ(${radius.toFixed(1)}px) translateY(${wave.toFixed(1)}px)">` +
               `<span class="swirl__face swirl__face--front">${glyph}</span>` +
               `<span class="swirl__face swirl__face--back">${glyph}</span>` +
             `</span>`;
    }).join('');
  }

  build();
  // Re-measure once the web font is ready (first pass may use the fallback)
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => { lastSize = 0; build(); });
  }
  window.addEventListener('resize', debounce(build, 200));
}


/* 5. SCROLL REVEAL ======================================================== */
function initReveal() {
  const items = $$('.reveal');
  if (!('IntersectionObserver' in window)) {
    items.forEach((el) => el.classList.add('is-visible'));
    return;
  }
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
  items.forEach((el) => observer.observe(el));
}


/* 6. SKILLS MARQUEE =======================================================
   Renders the SKILLS pills (twice, for a seamless loop). Pills cycle
   through four styles. They stagger in from the left when scrolled into
   view, then the whole track drifts slowly to the right (CSS).            */
function initSkills() {
  const track = $('#skillsTrack');
  if (!track) return;
  const variants = ['light', 'orange', 'dark', 'muted'];

  const pill = (skill, i, hidden) => {
    const v = variants[i % variants.length];
    const arrow = v === 'dark'
      ? '<span class="pill__arrow"><svg class="icon" aria-hidden="true"><use href="#i-arrow"/></svg></span>'
      : '';
    return `<li class="pill pill--${v}" style="--i:${i}"${hidden ? ' aria-hidden="true"' : ''}>${escapeHTML(skill)}${arrow}</li>`;
  };

  const set = (hidden) => SKILLS.map((s, i) => pill(s, i, hidden)).join('');
  // With reduced motion the track doesn't move, so one copy is enough
  track.innerHTML = prefersReducedMotion ? set(false) : set(false) + set(true);

  const marquee = track.parentElement;
  const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      marquee.classList.add('is-visible');
      observer.disconnect();
    }
  }, { threshold: 0.3 });
  observer.observe(marquee);
}


/* 7. PROJECTS CAROUSEL ====================================================
   Cards share one grid cell; data-pos (active | prev | next | hidden)
   drives their CSS transform. A rAF timer advances every CONFIG.autoplayMs
   and fills the active dot as a progress bar. Pauses on hover, while the
   tab is hidden, and while the carousel is off-screen.                    */
function initCarousel() {
  const carousel = $('#carousel');
  const stage = $('#carouselStage');
  const dotsWrap = $('#carouselDots');
  if (!carousel || !stage || !PROJECTS.length) return;

  const total = PROJECTS.length;

  // ---- Render cards ----
  stage.innerHTML = PROJECTS.map((p, i) => `
    <article class="pcard" data-index="${i}" aria-roledescription="slide" aria-label="Project ${i + 1} of ${total}" style="--h1:${p.hues[0]};--h2:${p.hues[1]}">
      <div class="pgfx" aria-hidden="true">
        <span class="pgfx__orbit pgfx__orbit--b"></span>
        <span class="pgfx__shadow"></span>
        <span class="pgfx__orb"></span>
        <span class="pgfx__orbit pgfx__orbit--a"></span>
        <span class="pgfx__badge">AI Agent</span>
        <span class="pgfx__num">${pad2(i + 1)}</span>
      </div>
      <div class="pinfo">
        <div class="pinfo__top">
          <span>Case study</span>
          <span class="pinfo__count"><b>${pad2(i + 1)}</b> / ${pad2(total)}</span>
        </div>
        <h3 class="pinfo__title">${escapeHTML(p.title)}</h3>
        <span class="pinfo__industry">${escapeHTML(p.industry)}</span>
        <p class="pinfo__desc">${escapeHTML(p.description)}</p>
        <div class="pinfo__stack">
          <span class="pinfo__stack-label">Tech stack</span>
          <ul>${p.stack.map((t) => `<li>${escapeHTML(t)}</li>`).join('')}</ul>
        </div>
      </div>
    </article>`).join('');

  // ---- Render dots ----
  dotsWrap.innerHTML = PROJECTS.map((_, i) =>
    `<button class="carousel__dot" role="tab" aria-label="Go to project ${i + 1}"><span class="carousel__dot-fill"></span></button>`
  ).join('');

  const cards = $$('.pcard', stage);
  const dots = $$('.carousel__dot', dotsWrap);

  let current = 0;
  let elapsed = 0;
  let lastTime = null;
  let hovering = false;
  let inView = false;

  function layout() {
    cards.forEach((card, i) => {
      const d = (i - current + total) % total;
      const pos = d === 0 ? 'active' : d === 1 ? 'next' : d === total - 1 ? 'prev' : 'hidden';
      card.dataset.pos = pos;
      card.classList.toggle('is-active', d === 0);
      card.setAttribute('aria-hidden', String(d !== 0));
    });
    dots.forEach((dot, i) => {
      const on = i === current;
      dot.classList.toggle('is-active', on);
      dot.setAttribute('aria-selected', String(on));
      if (!on) dot.firstElementChild.style.transform = 'scaleX(0)';
    });
    positionArrows();
  }

  function go(index) {
    current = (index + total) % total;
    elapsed = 0;
    layout();
  }

  // On small screens the arrows sit at the middle of the graphic
  function positionArrows() {
    const gfx = $('.pgfx', cards[current]);
    if (!gfx) return;
    const top = gfx.getBoundingClientRect().top - carousel.getBoundingClientRect().top + gfx.offsetHeight / 2;
    carousel.style.setProperty('--gfx-mid', `${top}px`);
  }

  // ---- Controls ----
  $('#prevBtn').addEventListener('click', () => go(current - 1));
  $('#nextBtn').addEventListener('click', () => go(current + 1));
  dots.forEach((dot, i) => dot.addEventListener('click', () => go(i)));

  // Click a peeking side card to bring it forward
  let suppressClick = false;
  cards.forEach((card, i) => card.addEventListener('click', () => {
    if (suppressClick) return;
    if (card.dataset.pos === 'prev' || card.dataset.pos === 'next') go(i);
  }));

  // Keyboard
  carousel.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft')  { e.preventDefault(); go(current - 1); }
    if (e.key === 'ArrowRight') { e.preventDefault(); go(current + 1); }
  });

  // Swipe
  let startX = null;
  stage.addEventListener('pointerdown', (e) => { startX = e.clientX; suppressClick = false; });
  stage.addEventListener('pointerup', (e) => {
    if (startX === null) return;
    const dx = e.clientX - startX;
    startX = null;
    if (Math.abs(dx) > 50) {
      suppressClick = true;
      go(dx < 0 ? current + 1 : current - 1);
    }
  });
  stage.addEventListener('pointercancel', () => { startX = null; });

  // Pause on hover (mouse devices only)
  if (window.matchMedia('(hover: hover)').matches) {
    carousel.addEventListener('mouseenter', () => { hovering = true; });
    carousel.addEventListener('mouseleave', () => { hovering = false; });
  }

  // Only count time while the carousel is on screen
  new IntersectionObserver((entries) => { inView = entries[0].isIntersecting; }, { threshold: 0.35 })
    .observe(carousel);

  // ---- Autoplay timer ----
  function tick(time) {
    if (lastTime !== null && inView && !hovering && !document.hidden) {
      elapsed += time - lastTime;
    }
    lastTime = time;

    if (elapsed >= CONFIG.autoplayMs) go(current + 1);
    dots[current].firstElementChild.style.transform = `scaleX(${Math.min(elapsed / CONFIG.autoplayMs, 1)})`;

    requestAnimationFrame(tick);
  }

  layout();
  requestAnimationFrame(tick);
  window.addEventListener('resize', debounce(positionArrows, 150));
}


/* 8. BOOK-A-CALL FORM =====================================================
   Validates Name / Phone / Requirement. If CONFIG.formEndpoint is set the
   details are POSTed there (e.g. Formspree); otherwise WhatsApp opens with
   the details prefilled so no enquiry is ever lost on a static host.      */
function initForm() {
  const form = $('#bookForm');
  if (!form) return;
  const status = $('#formStatus');

  const setStatus = (msg, type) => {
    status.textContent = msg;
    status.className = `form__status${type ? ` is-${type}` : ''}`;
  };

  // Clear the error state as soon as a field is edited
  $$('input, textarea', form).forEach((field) => {
    field.addEventListener('input', () => field.parentElement.classList.remove('is-invalid'));
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const fields = $$('input, textarea', form);
    let firstInvalid = null;
    fields.forEach((field) => {
      field.value = field.value.trim();
      const ok = field.checkValidity();
      field.parentElement.classList.toggle('is-invalid', !ok);
      if (!ok && !firstInvalid) firstInvalid = field;
    });
    if (firstInvalid) {
      setStatus('Please fill in your name, a valid phone number and a short requirement.', 'error');
      firstInvalid.focus();
      return;
    }

    const data = Object.fromEntries(new FormData(form));
    const button = $('button[type="submit"]', form);

    // Option A: form backend configured
    if (CONFIG.formEndpoint) {
      button.disabled = true;
      setStatus('Sending…');
      try {
        const res = await fetch(CONFIG.formEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error(res.statusText);
        form.reset();
        setStatus("Thanks! Your request is in — I'll get back to you shortly.", 'success');
      } catch {
        setStatus('Something went wrong. Please message me on WhatsApp instead.', 'error');
      } finally {
        button.disabled = false;
      }
      return;
    }

    // Option B (default): hand the details over to WhatsApp
    const message =
      `Hi Kishore, I'd like to book a call.\n\n` +
      `Name: ${data.name}\n` +
      `Phone: ${data.phone}\n` +
      `Requirement: ${data.requirement}`;
    window.open(whatsappURL(message), '_blank', 'noopener');
    form.reset();
    setStatus('Opening WhatsApp with your details — just hit send.', 'success');
  });
}


/* 9. BOOT ================================================================= */
document.addEventListener('DOMContentLoaded', () => {
  initWhatsAppLinks();
  initNav();
  initSwirl();
  initSkills();
  initCarousel();
  initForm();
  initReveal();

  const year = $('#year');
  if (year) year.textContent = new Date().getFullYear();
});
