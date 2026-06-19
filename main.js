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
      const ENDPOINT = 'https://formspree.io/f/YOUR_FORM_ID';

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
        setFeedback('error', `Something went wrong: ${err.message}. Please try again or email hello@devopshub.io`);
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

/* ═══════════════════════════════════════════════════════════
   SHARED NAVBAR — behaviour
═══════════════════════════════════════════════════════════ */
(function initNav() {
  const nav      = document.getElementById('dh-nav');
  const progress = document.getElementById('dh-progress');
  const burger   = document.getElementById('dh-burger');
  const drawer   = document.getElementById('dh-drawer');
  const themeBtn = document.getElementById('dh-theme-btn');

  if (!nav) return; // safety guard

  /* ── Scroll progress + hide/show ── */
  let lastY = 0, ticking = false;

  window.addEventListener('scroll', () => {
    if (ticking) return;
    requestAnimationFrame(() => {
      const y = window.scrollY;
      const { scrollHeight, clientHeight } = document.documentElement;
      const pct = scrollHeight > clientHeight
        ? (y / (scrollHeight - clientHeight)) * 100 : 0;

      if (progress) progress.style.width = pct + '%';

      /* Hide going down past 100px, show going up */
      if (y > lastY && y > 100) {
        nav.classList.add('dh-hidden');
        closeMobile();
      } else {
        nav.classList.remove('dh-hidden');
      }

      nav.classList.toggle('dh-scrolled', y > 40);
      lastY   = y;
      ticking = false;
    });
    ticking = true;
  }, { passive: true });

  /* ── Mobile drawer ── */
  function openMobile() {
    burger.classList.add('dh-open');
    drawer.classList.add('dh-open');
    burger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  function closeMobile() {
    if (!burger || !drawer) return;
    burger.classList.remove('dh-open');
    drawer.classList.remove('dh-open');
    burger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  if (burger) {
    burger.addEventListener('click', () =>
      drawer.classList.contains('dh-open') ? closeMobile() : openMobile()
    );
  }

  /* Close drawer on link click or outside tap */
  if (drawer) {
    drawer.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMobile));
  }
  document.addEventListener('click', e => {
    if (nav && drawer && !nav.contains(e.target) && !drawer.contains(e.target)) closeMobile();
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMobile(); });

  /* ── Theme toggle ── */
  const THEME_KEY = 'devopshub_theme';

  function applyTheme(light) {
    document.body.classList.toggle('light-mode', light);
    if (themeBtn) themeBtn.textContent = light ? '☀️' : '🌙';
  }

  /* Apply saved on load */
  applyTheme(localStorage.getItem(THEME_KEY) === 'light');

  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      const isLight = document.body.classList.toggle('light-mode');
      themeBtn.textContent = isLight ? '☀️' : '🌙';
      localStorage.setItem(THEME_KEY, isLight ? 'light' : 'dark');
      /* Spin effect */
      themeBtn.style.transition = 'transform 0.4s ease';
      themeBtn.style.transform  = 'rotate(360deg)';
      setTimeout(() => {
        themeBtn.style.transform  = '';
        themeBtn.style.transition = '';
      }, 420);
    });
  }
})();

/* ═══════════════════════════════════════════════════════════
   MEGA-MENU NAVIGATION — single source of truth
   Structure: Home | DevOps▾ | AIOps▾ | Resources▾ | Contact
   Add a new page = add one object below. Nothing else to touch.
═══════════════════════════════════════════════════════════ */
(function syncNav() {

  const NAV_GROUPS = [
    { type: 'link', href: 'index.html', label: 'Home', icon: '⌂' },

    { type: 'group', label: 'DevOps', icon: '⚙', items: [
      { href: 'about.html',    icon: '◎', label: 'About',    desc: 'What is DevOps' },
      { href: 'tools.html',    icon: '🛠', label: 'Tools',    desc: 'Docker, K8s, Jenkins…' },
      { href: 'concepts.html', icon: '◈', label: 'Concepts', desc: 'CI/CD, IaC, Monitoring' },
      { href: 'workflow.html', icon: '↺', label: 'Workflow', desc: '7-stage lifecycle' },
      { href: 'roadmap.html',  icon: '◉', label: 'Roadmap',  desc: 'Skill tracker' },
      { href: 'quiz.html',     icon: '◆', label: 'Quiz',     desc: 'Test your knowledge' },
      { href: 'blog.html',     icon: '✎', label: 'Blog',     desc: 'Tutorials & guides' },
    ]},

    { type: 'group', label: 'AIOps', icon: '🤖', items: [
      { href: 'aiops.html',               icon: '🧠', label: 'AIOps Overview',         desc: 'AI-powered operations' },
      { href: 'aiops.html#research',      icon: '📄', label: 'Research Paper',         desc: 'IEEE TNSM 2026' },
      { href: 'aiops.html#architecture',  icon: '⚡', label: 'Multi-Agent Architecture', desc: 'LLM agent pipeline' },
    ]},

    { type: 'group', label: 'Resources', icon: '📚', items: [
      { href: 'search.html',      icon: '🔍', label: 'Search',      desc: 'Find anything instantly' },
      { href: 'cheatsheets.html', icon: '📋', label: 'Cheatsheets', desc: '120+ copy-paste commands' },
      { href: 'glossary.html',    icon: '📖', label: 'Glossary',    desc: '100+ DevOps terms A–Z' },
    ]},

    { type: 'link', href: 'contact.html', label: 'Contact', icon: '✉' },
  ];

  const desktopNav = document.getElementById('dh-links');
  const drawerNav  = document.querySelector('#dh-drawer ul');
  if (!desktopNav || !drawerNav) return;

  const current = (window.location.pathname.split('/').pop() || 'index.html').toLowerCase();
  const stripHash = h => h.split('#')[0];
  const isActiveHref = href => stripHash(href) === current ||
    (stripHash(href) === 'index.html' && current === '');

  /* ── Inject CSS once ── */
  if (!document.getElementById('dh-dropdown-css')) {
    const css = document.createElement('style');
    css.id = 'dh-dropdown-css';
    css.textContent = `
      #dh-links { gap:.15rem; }
      .dh-item { position:relative; list-style:none; }
      .dh-item > a, .dh-group-label {
        display:flex; align-items:center; gap:.3rem;
        padding:.38rem .6rem; font-family:'Courier New',monospace;
        font-size:.7rem; letter-spacing:.07em; text-transform:uppercase;
        color:#7a9e92; text-decoration:none; border-radius:5px;
        border:1px solid transparent; white-space:nowrap; cursor:pointer;
        transition:color .2s,background .2s,border-color .2s,transform .18s;
        user-select:none;
      }
      .dh-item > a:hover, .dh-item:hover > a,
      .dh-item:hover .dh-group-label, .dh-item.dh-force-open .dh-group-label,
      .dh-group-label.dh-active, .dh-item > a.dh-active {
        color:#2dff7a; background:rgba(45,255,122,.09);
        border-color:rgba(45,255,122,.22); transform:translateY(-1px);
      }
      .dh-caret { font-size:.55rem; opacity:.65; transition:transform .25s ease; }
      .dh-item:hover .dh-caret, .dh-item.dh-force-open .dh-caret { transform:rotate(180deg); }

      .dh-panel {
        position:absolute; top:100%; left:50%;
        transform:translateX(-50%);
        padding-top:12px; /* invisible hover-bridge, no gap so hover never breaks */
        opacity:0; pointer-events:none;
        transition:opacity .2s ease;
        z-index:60;
      }
      .dh-item:hover .dh-panel, .dh-item:focus-within .dh-panel,
      .dh-item.dh-force-open .dh-panel {
        opacity:1; pointer-events:auto;
      }
      .dh-panel-inner {
        display:grid;
        grid-template-columns:repeat(2, minmax(190px, 1fr));
        gap:.5rem;
        min-width:420px; max-width:580px;
        max-height:min(60vh, 420px);
        overflow-y:auto;
        background:rgba(8,14,16,.98); border:1px solid rgba(45,255,122,.18);
        border-radius:10px; padding:.6rem;
        backdrop-filter:blur(18px); -webkit-backdrop-filter:blur(18px);
        box-shadow:0 24px 60px rgba(0,0,0,.55);
        scrollbar-width:thin; scrollbar-color:rgba(45,255,122,.35) transparent;
      }
      .dh-panel-inner::-webkit-scrollbar { width:6px; }
      .dh-panel-inner::-webkit-scrollbar-track { background:transparent; }
      .dh-panel-inner::-webkit-scrollbar-thumb {
        background:rgba(45,255,122,.35); border-radius:3px;
      }
      .dh-panel-inner::-webkit-scrollbar-thumb:hover { background:rgba(45,255,122,.6); }

      /* Full button-style items */
      .dh-panel-inner a {
        display:flex; gap:.6rem; align-items:flex-start;
        padding:.7rem .75rem;
        border-radius:8px;
        border:1px solid rgba(255,255,255,.07);
        background:rgba(255,255,255,.025);
        text-decoration:none; color:#cfe6dd;
        transition:background .18s,border-color .18s,color .18s,transform .15s;
      }
      .dh-panel-inner a:hover {
        background:rgba(45,255,122,.13);
        border-color:rgba(45,255,122,.4);
        color:#2dff7a;
        transform:translateY(-2px);
      }
      .dh-panel-inner a.dh-active {
        background:rgba(45,255,122,.1);
        border-color:rgba(45,255,122,.32);
        color:#2dff7a;
      }
      .dh-panel-icon { font-size:1.05rem; margin-top:1px; flex-shrink:0; }
      .dh-panel-title { display:block; font-family:'Courier New',monospace; font-size:.74rem; }
      .dh-panel-desc  { display:block; font-size:.64rem; color:#5f8478; margin-top:2px; }

      /* Mobile drawer accordion */
      .dh-drawer-group-toggle {
        display:flex; justify-content:space-between; align-items:center;
        width:100%; background:none; border:1px solid transparent; cursor:pointer;
        padding:.65rem .9rem; font-family:'Courier New',monospace; font-size:.82rem;
        letter-spacing:.08em; text-transform:uppercase; color:#7a9e92;
        border-radius:6px; transition:all .2s;
      }
      .dh-drawer-group-toggle:hover { color:#2dff7a; background:rgba(45,255,122,.07); }
      .dh-drawer-caret { font-size:.65rem; transition:transform .3s ease; }
      .dh-drawer-group-toggle.dh-open .dh-drawer-caret { transform:rotate(180deg); }
      .dh-drawer-sub {
        max-height:0; overflow:hidden; transition:max-height .35s ease;
        padding-left:.5rem;
      }
      .dh-drawer-sub.dh-open { max-height:500px; }
      .dh-drawer-sub a {
        display:block; padding:.5rem .9rem; font-size:.78rem; color:#7a9e92;
        text-decoration:none; border-radius:6px; transition:all .2s;
      }
      .dh-drawer-sub a:hover, .dh-drawer-sub a.dh-active {
        color:#2dff7a; background:rgba(45,255,122,.08); padding-left:1.1rem;
      }

      body.light-mode .dh-item > a, body.light-mode .dh-group-label { color:#3d5266; }
      body.light-mode .dh-item:hover > a, body.light-mode .dh-item:hover .dh-group-label,
      body.light-mode .dh-group-label.dh-active, body.light-mode .dh-item > a.dh-active {
        color:#16a34a; background:rgba(22,163,74,.08); border-color:rgba(22,163,74,.25);
      }
      body.light-mode .dh-panel-inner { background:rgba(245,248,250,.98); border-color:rgba(0,0,0,.1); }
      body.light-mode .dh-panel-inner a { color:#3d5266; background:rgba(0,0,0,.02); border-color:rgba(0,0,0,.06); }
      body.light-mode .dh-panel-inner a:hover, body.light-mode .dh-panel-inner a.dh-active {
        color:#16a34a; background:rgba(22,163,74,.1); border-color:rgba(22,163,74,.3);
      }
      body.light-mode .dh-drawer-group-toggle { color:#3d5266; }
      body.light-mode .dh-drawer-sub a { color:#3d5266; }
      body.light-mode .dh-drawer-sub a:hover, body.light-mode .dh-drawer-sub a.dh-active { color:#16a34a; background:rgba(22,163,74,.08); }
    `;
    document.head.appendChild(css);
  }

  /* ── Build desktop nav ── */
  desktopNav.innerHTML = NAV_GROUPS.map(entry => {
    if (entry.type === 'link') {
      const active = isActiveHref(entry.href) ? ' dh-active' : '';
      return `<li class="dh-item"><a href="${entry.href}" class="${active.trim()}">${entry.label}</a></li>`;
    }
    /* group with dropdown panel */
    const groupActive = entry.items.some(i => isActiveHref(i.href)) ? ' dh-active' : '';
    const panelLinks = entry.items.map(i => {
      const active = isActiveHref(i.href) ? ' dh-active' : '';
      return `<a href="${i.href}" class="${active.trim()}">
        <span class="dh-panel-icon">${i.icon}</span>
        <span>
          <span class="dh-panel-title">${i.label}</span>
          <span class="dh-panel-desc">${i.desc}</span>
        </span>
      </a>`;
    }).join('');
    return `<li class="dh-item">
      <span class="dh-group-label${groupActive}" tabindex="0">${entry.icon} ${entry.label} <span class="dh-caret">▾</span></span>
      <div class="dh-panel"><div class="dh-panel-inner">${panelLinks}</div></div>
    </li>`;
  }).join('');

  /* Click-to-toggle fallback for touch devices (hover doesn't exist) */
  desktopNav.querySelectorAll('.dh-group-label').forEach(label => {
    label.addEventListener('click', (e) => {
      const item = label.closest('.dh-item');
      const wasOpen = item.classList.contains('dh-force-open');
      desktopNav.querySelectorAll('.dh-item.dh-force-open').forEach(i => i.classList.remove('dh-force-open'));
      if (!wasOpen) item.classList.add('dh-force-open');
      e.stopPropagation();
    });
  });
  document.addEventListener('click', () => {
    desktopNav.querySelectorAll('.dh-item.dh-force-open').forEach(i => i.classList.remove('dh-force-open'));
  });

  /* ── Build mobile drawer (accordion) ── */
  drawerNav.innerHTML = NAV_GROUPS.map((entry, gi) => {
    if (entry.type === 'link') {
      const active = isActiveHref(entry.href) ? ' dh-active' : '';
      return `<li><a href="${entry.href}" class="${active.trim()}">${entry.icon} ${entry.label}</a></li>`;
    }
    const subId = `dh-grp-${gi}`;
    const groupActive = entry.items.some(i => isActiveHref(i.href));
    const subLinks = entry.items.map(i => {
      const active = isActiveHref(i.href) ? ' dh-active' : '';
      return `<a href="${i.href}" class="${active.trim()}">${i.icon} ${i.label}</a>`;
    }).join('');
    return `<li class="dh-drawer-group">
      <button type="button" class="dh-drawer-group-toggle${groupActive ? ' dh-active' : ''}" data-target="${subId}">
        ${entry.icon} ${entry.label} <span class="dh-drawer-caret">▾</span>
      </button>
      <div class="dh-drawer-sub${groupActive ? ' dh-open' : ''}" id="${subId}">${subLinks}</div>
    </li>`;
  }).join('');

  /* Accordion toggle behaviour */
  drawerNav.querySelectorAll('.dh-drawer-group-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const sub = document.getElementById(btn.dataset.target);
      const isOpen = sub.classList.contains('dh-open');
      btn.classList.toggle('dh-open', !isOpen);
      sub.classList.toggle('dh-open', !isOpen);
    });
  });

})();