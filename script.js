/* ============================================================
   SPARKTO CLEANING CO. — script.js
   ============================================================ */

/* ── 1. Navbar: transparent → solid on scroll ─────────────── */
(function initNavbar() {
  const navbar  = document.getElementById('navbar');
  const toggle  = document.getElementById('navToggle');
  const links   = document.getElementById('navLinks');

  function handleScroll() {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
  }

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll(); // run on load

  // Hamburger toggle
  toggle.addEventListener('click', () => {
    const isOpen = links.classList.toggle('open');
    toggle.classList.toggle('open', isOpen);
    toggle.setAttribute('aria-expanded', String(isOpen));
  });

  // Close mobile menu on link click
  links.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      links.classList.remove('open');
      toggle.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });
})();


/* ── 2. Smooth scroll for nav anchor links ─────────────────── */
(function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const navH = parseInt(getComputedStyle(document.documentElement)
        .getPropertyValue('--nav-h'), 10) || 72;
      const top = target.getBoundingClientRect().top + window.scrollY - navH;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
})();


/* ── 3. Scroll-triggered fade-in ───────────────────────────── */
(function initFadeIn() {
  const els = document.querySelectorAll('.fade-in');
  if (!els.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, i) => {
        if (!entry.isIntersecting) return;
        // Stagger siblings inside the same parent grid/flex container
        const siblings = Array.from(
          entry.target.parentElement.querySelectorAll('.fade-in:not(.visible)')
        );
        const delay = siblings.indexOf(entry.target) * 80;
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, delay);
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  els.forEach(el => observer.observe(el));
})();


/* ── 4. Before / After drag slider ─────────────────────────── */
(function initSliders() {
  const SPARKLE_SVG = `<svg viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M30 5 L32 26 L30 30 L28 26 Z" fill="#fff" opacity=".9"/>
    <path d="M30 55 L32 34 L30 30 L28 34 Z" fill="#fff" opacity=".9"/>
    <path d="M5 30 L26 32 L30 30 L26 28 Z" fill="#fff" opacity=".9"/>
    <path d="M55 30 L34 32 L30 30 L34 28 Z" fill="#fff" opacity=".9"/>
    <path d="M11 11 L26 27 L30 30 L27 26 Z" fill="#a8c9ab" opacity=".7"/>
    <path d="M49 49 L34 33 L30 30 L33 34 Z" fill="#a8c9ab" opacity=".7"/>
    <path d="M49 11 L33 27 L30 30 L34 27 Z" fill="#a8c9ab" opacity=".7"/>
    <path d="M11 49 L27 33 L30 30 L27 34 Z" fill="#a8c9ab" opacity=".7"/>
    <circle cx="30" cy="30" r="4" fill="white" opacity=".95"/>
  </svg>`;

  document.querySelectorAll('[data-slider]').forEach(slider => {
    const after  = slider.querySelector('.ba-after');
    const handle = slider.querySelector('.ba-handle');
    let dragging   = false;
    let lastPct    = 50;
    let sparkledAt = null; // track which side we last sparked on

    function spawnSparkle(x, y) {
      const el = document.createElement('div');
      el.className = 'ba-sparkle';
      el.style.left = `${x}px`;
      el.style.top  = `${y}px`;
      el.innerHTML  = SPARKLE_SVG;
      slider.appendChild(el);
      el.addEventListener('animationend', () => el.remove());
    }

    function setPosition(pct) {
      const clamped = Math.max(2, Math.min(98, pct));
      after.style.clipPath = `inset(0 ${100 - clamped}% 0 0)`;
      handle.style.left    = `${clamped}%`;

      // Sparkle only when crossing into the after (clean) side
      const crossedToAfter = lastPct < 50 && clamped >= 50;
      if (crossedToAfter && sparkledAt !== Math.round(clamped)) {
        sparkledAt = Math.round(clamped);
        const rect = slider.getBoundingClientRect();
        // Place sparkle 40px into the after (right) side so it's always on the clean panel
        const cx   = (clamped / 100) * rect.width + 40;
        const cy   = rect.height * 0.45;
        spawnSparkle(cx, cy);
      }
      lastPct = clamped;
      handle.setAttribute('aria-valuenow', String(Math.round(clamped)));
    }

    function getPercent(clientX) {
      const rect = slider.getBoundingClientRect();
      return ((clientX - rect.left) / rect.width) * 100;
    }

    slider.addEventListener('pointerdown', e => {
      dragging = true;
      slider.setPointerCapture(e.pointerId);
      e.preventDefault();
    });

    slider.addEventListener('pointermove', e => {
      if (!dragging) return;
      setPosition(getPercent(e.clientX));
    });

    slider.addEventListener('pointerup',     () => { dragging = false; });
    slider.addEventListener('pointercancel', () => { dragging = false; });

    // Keyboard accessibility
    handle.setAttribute('role', 'slider');
    handle.setAttribute('aria-valuemin', '0');
    handle.setAttribute('aria-valuemax', '100');
    handle.setAttribute('aria-valuenow', '50');
    handle.setAttribute('tabindex', '0');

    handle.addEventListener('keydown', e => {
      const current = parseFloat(handle.getAttribute('aria-valuenow')) || 50;
      let next = current;
      if (e.key === 'ArrowLeft')  next = current - 5;
      if (e.key === 'ArrowRight') next = current + 5;
      if (next === current) return;
      e.preventDefault();
      setPosition(next);
    });

    setPosition(50);
  });
})();


/* ── 5. Contact form validation ─────────────────────────────── */
(function initForm() {
  const form    = document.getElementById('contactForm');
  if (!form) return;

  const successMsg = document.getElementById('formSuccess');

  const fields = {
    name:    { el: form.name,    err: document.getElementById('nameError')    },
    email:   { el: form.email,   err: document.getElementById('emailError')   },
    phone:   { el: form.phone,   err: document.getElementById('phoneError')   },
    service: { el: form.service, err: document.getElementById('serviceError') },
  };

  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const PHONE_RE = /^[\d\s\-()+]{7,20}$/;

  function clearError(field) {
    field.el.classList.remove('error');
    field.err.textContent = '';
  }

  function setError(field, msg) {
    field.el.classList.add('error');
    field.err.textContent = msg;
    return false;
  }

  function validate() {
    let valid = true;

    // Name
    clearError(fields.name);
    if (!fields.name.el.value.trim()) {
      valid = setError(fields.name, 'Please enter your full name.') && valid;
    } else if (fields.name.el.value.trim().length < 2) {
      valid = setError(fields.name, 'Name must be at least 2 characters.') && valid;
    }

    // Email
    clearError(fields.email);
    if (!fields.email.el.value.trim()) {
      valid = setError(fields.email, 'Please enter your email address.') && valid;
    } else if (!EMAIL_RE.test(fields.email.el.value.trim())) {
      valid = setError(fields.email, 'Please enter a valid email address.') && valid;
    }

    // Phone (optional but must be valid if provided)
    clearError(fields.phone);
    const phone = fields.phone.el.value.trim();
    if (phone && !PHONE_RE.test(phone)) {
      valid = setError(fields.phone, 'Please enter a valid phone number.') && valid;
    }

    // Service
    clearError(fields.service);
    if (!fields.service.el.value) {
      valid = setError(fields.service, 'Please select a service type.') && valid;
    }

    return valid;
  }

  // Clear individual errors on input
  Object.values(fields).forEach(({ el, err }) => {
    el.addEventListener('input', () => {
      el.classList.remove('error');
      err.textContent = '';
    });
  });

  form.addEventListener('submit', e => {
    e.preventDefault();
    successMsg.classList.remove('show');

    if (!validate()) {
      // Scroll to first error
      const firstError = form.querySelector('.error');
      if (firstError) firstError.focus();
      return;
    }

    // Simulate submission
    const submitBtn = form.querySelector('.form-submit');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Sending…';
    submitBtn.disabled = true;

    setTimeout(() => {
      form.reset();
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
      successMsg.classList.add('show');
      successMsg.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 1200);
  });
})();
