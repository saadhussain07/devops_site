'use strict';
/* ============================================================
   DevOps Hub — main.js
   Features:
   1.  Scroll progress bar
   2.  Scroll-reveal (Intersection Observer)
   3.  Hero stat counter animation
   4.  Terminal typewriter effect
   5.  Active nav link on scroll-spy
   6.  Contact form async submission + validation
   7.  Mobile nav auto-close
   8.  Back-to-top button
   9.  Code-badge click-to-copy
   10. Nav hide/show on scroll direction
   ============================================================ */

/* ── 1. Scroll Progress Bar ───────────────────────────────── */
(function initScrollProgress() {
  const bar = document.createElement('div');
  bar.id = 'scroll-progress';
  Object.assign(bar.style, {
    position:       'fixed',
    top:            '0',
    left:           '0',
    height:         '2px',
    width:          '0%',
    background:     'linear-gradient(90deg,#8b5cf6,#2dff7a,#00e5ff)',
    zIndex:         '10001',
    transition:     'width 0.12s linear',
    pointerEvents:  'none',
  });
  document.body.appendChild(bar);

  window.addEventListener('scroll', () => {
    const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
    const pct = scrollHeight - clientHeight > 0
      ? (scrollTop / (scrollHeight - clientHeight)) * 100
      : 0;
    bar.style.width = pct + '%';
  }, { passive: true });
})();


/* ── 2. Scroll Reveal ─────────────────────────────────────── */
(function initScrollReveal() {
  const selectors = [
    '.card', '.section-header', '.tl-item', '.benefit-card',
    '.concept-chip', '.wf-card', '.dora-card', '.cta-banner',
    '.lc-content', '.sidebar-block', '.faq-item',
    '.hero-stats', '.hero-cta', '.page-header h1',
    '.page-header p', '.pipeline-visual', '.code-panel',
    '.monitor-dash', '.ms-topology', '.auto-table',
    '.loop-banner', '.tools-section-label',
  ];

  const els = document.querySelectorAll(selectors.join(','));

  els.forEach((el, i) => {
    const delay = ((i % 5) * 0.08).toFixed(2);
    el.style.cssText += `
      opacity: 0;
      transform: translateY(24px);
      transition: opacity 0.55s ease ${delay}s,
                  transform 0.55s ease ${delay}s;
    `;
  });

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity  = '1';
        entry.target.style.transform = 'translateY(0)';
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });

  els.forEach(el => io.observe(el));
})();


/* ── 3. Counter Animation ─────────────────────────────────── */
(function initCounters() {
  const counters = document.querySelectorAll('[data-counter]');
  if (!counters.length) return;

  const easeOut = t => 1 - Math.pow(1 - t, 3);

  const animate = (el) => {
    const target   = parseFloat(el.dataset.counter);
    const suffix   = el.dataset.suffix  || '';
    const decimals = parseInt(el.dataset.decimals || '0', 10);
    const duration = 2200;
    const start    = performance.now();

    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1);
      el.textContent = (easeOut(p) * target).toFixed(decimals) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animate(entry.target);
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.6 });

  counters.forEach(el => io.observe(el));
})();


/* ── 4. Terminal Typewriter ───────────────────────────────── */
(function initTypewriter() {
  const body = document.getElementById('terminal-body');
  if (!body) return;

  const lines = [
    { kind: 'cmd',  text: 'git push origin main' },
    { kind: 'out',  text: '✔ Branch main pushed',            color: '#2dff7a' },
    { kind: 'gap' },
    { kind: 'cmd',  text: 'jenkins build start' },
    { kind: 'out',  text: '[1/5] CLONE   ████████ 100%',     color: '#2dff7a' },
    { kind: 'out',  text: '[2/5] TEST    ████████ 100%',     color: '#00e5ff' },
    { kind: 'out',  text: '[3/5] BUILD   ████████ 100%',     color: '#00e5ff' },
    { kind: 'out',  text: '[4/5] PUSH    ████████ 100%',     color: '#ff5c1a' },
    { kind: 'out',  text: '[5/5] DEPLOY  ████████ 100%',     color: '#2dff7a' },
    { kind: 'gap' },
    { kind: 'out',  text: '✔ Pipeline succeeded in 2m 14s',  color: '#2dff7a' },
    { kind: 'out',  text: '→ Deployed to production',         color: '#00e5ff' },
  ];

  body.innerHTML = '';

  let li = 0, ci = 0, cur = null;

  const cursor = Object.assign(document.createElement('span'), { className: 't-cursor' });

  function mkLine()    { const s = document.createElement('span'); s.className = 't-line'; return s; }
  function mkPrompt()  { const s = mkLine(); const p = document.createElement('span'); p.className = 't-prompt'; p.textContent = '$ '; s.appendChild(p); return s; }
  function mkOut(col)  { const s = mkLine(); s.classList.add('t-out'); if (col) s.style.color = col; return s; }

  function type() {
    if (li >= lines.length) {
      const fin = mkPrompt(); fin.appendChild(cursor); body.appendChild(fin); return;
    }
    const line = lines[li];

    if (line.kind === 'gap') {
      const g = mkLine(); g.innerHTML = '&nbsp;'; body.appendChild(g);
      li++; setTimeout(type, 70); return;
    }

    if (line.kind === 'cmd') {
      if (ci === 0) { cur = mkPrompt(); body.appendChild(cur); }
      if (ci < line.text.length) {
        cur.appendChild(document.createTextNode(line.text[ci++]));
        setTimeout(type, 42);
      } else {
        ci = 0; li++; setTimeout(type, 220);
      }
      return;
    }

    if (line.kind === 'out') {
      const o = mkOut(line.color); o.textContent = line.text;
      body.appendChild(o); li++; setTimeout(type, 90);
    }
  }

  setTimeout(type, 900);
})();


/* ── 5. Nav Scroll-Spy ────────────────────────────────────── */
(function initNavSpy() {
  const navLinks = document.querySelectorAll('.nav-links a');
  const sections = document.querySelectorAll('section[id], header[id]');
  if (!sections.length) return;

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(a => a.classList.remove('active'));
        const match = document.querySelector(`.nav-links a[href="#${entry.target.id}"]`);
        if (match) match.classList.add('active');
      }
    });
  }, { rootMargin: '-25% 0px -65% 0px' });

  sections.forEach(s => io.observe(s));
})();


/* ── 6. Contact Form ──────────────────────────────────────── */
(function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  /* ── Feedback banner ── */
  const banner = document.createElement('div');
  banner.id = 'form-feedback';
  Object.assign(banner.style, {
    display:      'none',
    padding:      '0.9rem 1.25rem',
    borderRadius: '6px',
    fontFamily:   '"Courier New", monospace',
    fontSize:     '0.85rem',
    marginBottom: '1.25rem',
    border:       '1px solid',
    lineHeight:   '1.5',
  });
  form.prepend(banner);

  const setFeedback = (type, msg) => {
    const map = {
      success: { bg: 'rgba(45,255,122,0.09)',  border: 'rgba(45,255,122,0.4)', color: '#2dff7a',  icon: '✔' },
      error:   { bg: 'rgba(255,92,26,0.09)',   border: 'rgba(255,92,26,0.4)',  color: '#ff5c1a',  icon: '✖' },
      loading: { bg: 'rgba(0,229,255,0.07)',   border: 'rgba(0,229,255,0.3)',  color: '#00e5ff',  icon: '⟳' },
    };
    const s = map[type];
    Object.assign(banner.style, {
      display:         'block',
      background:      s.bg,
      borderColor:     s.border,
      color:           s.color,
    });
    banner.innerHTML = `${s.icon}&nbsp;&nbsp;${msg}`;
    banner.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };

  /* ── Submit ── */
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    /* Validate required fields */
    let ok = true;
    form.querySelectorAll('[required]').forEach(f => {
      if (!f.value.trim()) {
        f.style.borderColor = 'rgba(255,92,26,0.6)';
        ok = false;
      } else {
        f.style.borderColor = '';
      }
    });
    if (!ok) { setFeedback('error', 'Please fill in all required fields before sending.'); return; }

    const btn = form.querySelector('[type="submit"]');
    const origLabel = btn.textContent;
    btn.textContent = '⟳  Sending…';
    btn.disabled = true;
    btn.style.opacity = '0.65';
    setFeedback('loading', 'Sending your message — hang tight…');

    try {
      /* ── Replace the URL below with your own Formspree endpoint ──
         1. Go to https://formspree.io/
         2. Create a free form → copy the endpoint
         3. Replace 'YOUR_FORM_ID' below                           */
      const ENDPOINT = 'https://formspree.io/f/xgordqkb';

      const res = await fetch(ENDPOINT, {
        method:  'POST',
        body:    new FormData(form),
        headers: { Accept: 'application/json' },
      });

      if (res.ok) {
        setFeedback('success', 'Message sent! We\'ll reply within 24 hours. 🚀');
        form.reset();
      } else {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Server error');
      }
    } catch (err) {
      /* In demo mode (no real endpoint) we still show success.
         In production remove the demo block and show the real error. */
      if (err.message.includes('Failed to fetch') || err.message.includes('YOUR_FORM_ID')) {
        setFeedback('success', 'Message received! We\'ll be in touch soon. 🚀 <br><small style="opacity:.6">(Demo mode — connect Formspree for real delivery)</small>');
        form.reset();
      } else {
        setFeedback('error', `Something went wrong: ${err.message}. Please try again or email muhammadsaadhussain49@gmail.com`);
      }
    } finally {
      btn.textContent = origLabel;
      btn.disabled    = false;
      btn.style.opacity = '';
    }
  });

  /* ── Live field validation ── */
  form.querySelectorAll('input, textarea').forEach(f => {
    f.addEventListener('blur', () => {
      if (f.required && !f.value.trim()) f.style.borderColor = 'rgba(255,92,26,0.5)';
    });
    f.addEventListener('input', () => {
      if (f.value.trim()) f.style.borderColor = '';
    });
  });

  /* ── Character counter for message ── */
  const textarea = form.querySelector('textarea');
  const hint     = textarea?.nextElementSibling;
  if (textarea && hint) {
    textarea.addEventListener('input', () => {
      const len = textarea.value.length;
      hint.textContent = `${len} characters · Markdown supported.`;
      hint.style.color = len >= 20 ? '#2dff7a' : 'var(--text-muted)';
    });
  }
})();


/* ── 7. Mobile Nav Auto-close ─────────────────────────────── */
(function initMobileNav() {
  const toggle = document.getElementById('nav-toggle');
  if (!toggle) return;

  /* Close on link click */
  document.querySelectorAll('.nav-links a').forEach(a => {
    a.addEventListener('click', () => { toggle.checked = false; });
  });

  /* Close on outside tap */
  document.addEventListener('click', (e) => {
    const inner = document.querySelector('.nav-inner');
    if (inner && !inner.contains(e.target)) toggle.checked = false;
  });
})();


/* ── 8. Back-to-Top Button ────────────────────────────────── */
(function initBackToTop() {
  const btn = document.createElement('button');
  btn.id = 'back-to-top';
  btn.setAttribute('aria-label', 'Back to top');
  btn.textContent = '↑';
  Object.assign(btn.style, {
    position:      'fixed',
    bottom:        '2rem',
    right:         '2rem',
    width:         '44px',
    height:        '44px',
    borderRadius:  '50%',
    background:    'var(--bg-card, #111c21)',
    border:        '1px solid rgba(45,255,122,0.3)',
    color:         '#2dff7a',
    fontSize:      '1.1rem',
    cursor:        'pointer',
    zIndex:        '500',
    opacity:       '0',
    transform:     'translateY(12px)',
    transition:    'opacity 0.3s ease, transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease',
    pointerEvents: 'none',
    fontFamily:    'monospace',
    lineHeight:    '1',
  });
  document.body.appendChild(btn);

  window.addEventListener('scroll', () => {
    const show = window.scrollY > 420;
    btn.style.opacity       = show ? '1' : '0';
    btn.style.transform     = show ? 'translateY(0)' : 'translateY(12px)';
    btn.style.pointerEvents = show ? 'auto' : 'none';
  }, { passive: true });

  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  btn.addEventListener('mouseenter', () => {
    btn.style.boxShadow  = '0 0 20px rgba(45,255,122,0.45)';
    btn.style.borderColor = 'rgba(45,255,122,0.7)';
  });
  btn.addEventListener('mouseleave', () => {
    btn.style.boxShadow  = '';
    btn.style.borderColor = 'rgba(45,255,122,0.3)';
  });
})();


/* ── 9. Click-to-Copy Code Badges ────────────────────────── */
(function initCopyBadges() {
  document.querySelectorAll('.code-badge').forEach(badge => {
    badge.style.cursor = 'pointer';
    badge.title = 'Click to copy';

    badge.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(badge.textContent.trim());
        const orig   = badge.textContent;
        const origBg = badge.style.background;
        badge.textContent    = '✓ copied';
        badge.style.background = 'rgba(45,255,122,0.22)';
        setTimeout(() => {
          badge.textContent    = orig;
          badge.style.background = origBg;
        }, 1600);
      } catch { /* clipboard blocked */ }
    });
  });
})();


/* ── 10. Nav hide/show on scroll direction ────────────────── */
(function initNavHide() {
  const nav = document.querySelector('.nav');
  if (!nav) return;

  let lastY = 0;
  let ticking = false;

  window.addEventListener('scroll', () => {
    if (ticking) return;
    requestAnimationFrame(() => {
      const y    = window.scrollY;
      const down = y > lastY && y > 120;
      nav.style.transform  = down ? 'translateY(-100%)' : 'translateY(0)';
      nav.style.transition = 'transform 0.35s cubic-bezier(0.4,0,0.2,1)';
      lastY   = y;
      ticking = false;
    });
    ticking = true;
  }, { passive: true });
})();