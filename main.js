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
  const bar = document.getElementById('dh-progress');
  if (!bar) return;

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
        entry.target.style.opacity   = '1';
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
    const suffix   = el.dataset.suffix   || '';
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
    { kind: 'cmd', text: 'git push origin main' },
    { kind: 'out', text: '✔ Branch main pushed',           color: '#10b981' },
    { kind: 'gap' },
    { kind: 'cmd', text: 'jenkins build start' },
    { kind: 'out', text: '[1/5] CLONE   ████████ 100%',    color: '#10b981' },
    { kind: 'out', text: '[2/5] TEST    ████████ 100%',    color: '#14b8a6' },
    { kind: 'out', text: '[3/5] BUILD   ████████ 100%',    color: '#14b8a6' },
    { kind: 'out', text: '[4/5] PUSH    ████████ 100%',    color: '#f97316' },
    { kind: 'out', text: '[5/5] DEPLOY  ████████ 100%',    color: '#10b981' },
    { kind: 'gap' },
    { kind: 'out', text: '✔ Pipeline succeeded in 2m 14s', color: '#10b981' },
    { kind: 'out', text: '→ Deployed to production',        color: '#14b8a6' },
  ];

  body.innerHTML = '';

  let li = 0, ci = 0, cur = null;
  const cursor = Object.assign(document.createElement('span'), { className: 't-cursor' });

  function mkLine()   { const s = document.createElement('span'); s.className = 't-line'; return s; }
  function mkPrompt() { const s = mkLine(); const p = document.createElement('span'); p.className = 't-prompt'; p.textContent = '$ '; s.appendChild(p); return s; }
  function mkOut(col) { const s = mkLine(); s.classList.add('t-out'); if (col) s.style.color = col; return s; }

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
  const sections = document.querySelectorAll('section[id], header[id]');
  if (!sections.length) return;

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        document.querySelectorAll('#dh-links a').forEach(a => a.classList.remove('dh-active'));
        const match = document.querySelector(`#dh-links a[href="#${entry.target.id}"]`);
        if (match) match.classList.add('dh-active');
      }
    });
  }, { rootMargin: '-25% 0px -65% 0px' });

  sections.forEach(s => io.observe(s));
})();


/* ── 6. Contact Form ──────────────────────────────────────── */
(function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

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
      success: { bg: 'rgba(15,118,110,0.1)',  border: 'rgba(15,118,110,0.4)', color: '#0f766e', icon: '✔' },
      error:   { bg: 'rgba(249,115,22,0.1)',  border: 'rgba(249,115,22,0.4)', color: '#f97316', icon: '✖' },
      loading: { bg: 'rgba(20,184,166,0.08)', border: 'rgba(20,184,166,0.3)', color: '#14b8a6', icon: '⟳' },
    };
    const s = map[type];
    Object.assign(banner.style, {
      display:     'block',
      background:  s.bg,
      borderColor: s.border,
      color:       s.color,
    });
    banner.innerHTML = `${s.icon}&nbsp;&nbsp;${msg}`;
    banner.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    let ok = true;
    form.querySelectorAll('[required]').forEach(f => {
      if (!f.value.trim()) {
        f.style.borderColor = 'rgba(249,115,22,0.6)';
        ok = false;
      } else {
        f.style.borderColor = '';
      }
    });
    if (!ok) { setFeedback('error', 'Please fill in all required fields before sending.'); return; }

    const btn = form.querySelector('[type="submit"]');
    const origLabel = btn.textContent;
    btn.textContent = '⟳  Sending…';
    btn.disabled    = true;
    btn.style.opacity = '0.65';
    setFeedback('loading', 'Sending your message — hang tight…');

    try {
      const ENDPOINT = 'https://formspree.io/f/YOUR_FORM_ID';
      const res = await fetch(ENDPOINT, {
        method:  'POST',
        body:    new FormData(form),
        headers: { Accept: 'application/json' },
      });

      if (res.ok) {
        setFeedback('success', "Message sent! We'll reply within 24 hours. 🚀");
        form.reset();
      } else {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Server error');
      }
    } catch (err) {
      if (err.message.includes('Failed to fetch') || err.message.includes('YOUR_FORM_ID')) {
        setFeedback('success', 'Message received! We\'ll be in touch soon. 🚀 <br><small style="opacity:.6">(Demo mode — connect Formspree for real delivery)</small>');
        form.reset();
      } else {
        setFeedback('error', `Something went wrong: ${err.message}. Please try again or email hello@devopshub.io`);
      }
    } finally {
      btn.textContent   = origLabel;
      btn.disabled      = false;
      btn.style.opacity = '';
    }
  });

  form.querySelectorAll('input, textarea').forEach(f => {
    f.addEventListener('blur', () => {
      if (f.required && !f.value.trim()) f.style.borderColor = 'rgba(249,115,22,0.5)';
    });
    f.addEventListener('input', () => {
      if (f.value.trim()) f.style.borderColor = '';
    });
  });

  const textarea = form.querySelector('textarea');
  const hint     = textarea?.nextElementSibling;
  if (textarea && hint) {
    textarea.addEventListener('input', () => {
      const len = textarea.value.length;
      hint.textContent = `${len} characters · Markdown supported.`;
      hint.style.color = len >= 20 ? 'var(--primary)' : 'var(--text-muted)';
    });
  }
})();


/* ── 7. Mobile Nav Auto-close (legacy checkbox nav) ──────── */
(function initMobileNav() {
  const toggle = document.getElementById('nav-toggle');
  if (!toggle) return;

  document.querySelectorAll('.nav-links a').forEach(a => {
    a.addEventListener('click', () => { toggle.checked = false; });
  });

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
    background:    'var(--bg-card)',
    border:        '1px solid rgba(15,118,110,0.3)',
    color:         'var(--primary)',
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
    btn.style.boxShadow   = '0 0 20px rgba(15,118,110,0.35)';
    btn.style.borderColor = 'rgba(15,118,110,0.7)';
  });
  btn.addEventListener('mouseleave', () => {
    btn.style.boxShadow   = '';
    btn.style.borderColor = 'rgba(15,118,110,0.3)';
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
        badge.textContent      = '✓ copied';
        badge.style.background = 'rgba(15,118,110,0.2)';
        setTimeout(() => {
          badge.textContent      = orig;
          badge.style.background = origBg;
        }, 1600);
      } catch { /* clipboard blocked */ }
    });
  });
})();


/* ── 10. Shared Navbar ────────────────────────────────────── */
(function initNav() {
  const nav      = document.getElementById('dh-nav');
  const progress = document.getElementById('dh-progress');
  const burger   = document.getElementById('dh-burger');
  const drawer   = document.getElementById('dh-drawer');
  const themeBtn = document.getElementById('dh-theme-btn');

  if (!nav) return;

  /* ── Scroll: progress + hide/show + scrolled class ── */
  let lastY = 0, ticking = false;

  window.addEventListener('scroll', () => {
    if (ticking) return;
    requestAnimationFrame(() => {
      const y = window.scrollY;
      const { scrollHeight, clientHeight } = document.documentElement;
      const pct = scrollHeight > clientHeight
        ? (y / (scrollHeight - clientHeight)) * 100 : 0;

      if (progress) progress.style.width = pct + '%';

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
    if (!burger || !drawer) return;
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

  if (drawer) {
    drawer.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMobile));
  }

  document.addEventListener('click', e => {
    if (nav && drawer && !nav.contains(e.target) && !drawer.contains(e.target)) closeMobile();
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMobile(); });

  /* ── Theme toggle ──────────────────────────────────────────
     CSS default = light theme (no class on body).
     Dark mode   = body.dark-mode class added.
     Saved in localStorage as 'dark' | 'light'.
  ────────────────────────────────────────────────────────── */
  const THEME_KEY = 'devopshub_theme';

  function applyTheme(dark) {
    document.body.classList.toggle('dark-mode', dark);
    if (themeBtn) themeBtn.textContent = dark ? '☀️' : '🌙';
  }

  /* Restore saved preference on every page load */
  applyTheme(localStorage.getItem(THEME_KEY) === 'dark');

  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      const isDark = document.body.classList.toggle('dark-mode');
      themeBtn.textContent = isDark ? '☀️' : '🌙';
      localStorage.setItem(THEME_KEY, isDark ? 'dark' : 'light');

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


/* ── Nav link sync (single source of truth) ───────────────── */
(function syncNav() {
  const NAV_PAGES = [
    { href: 'index.html',       label: 'Home',        icon: '⌂' },
    { href: 'about.html',       label: 'About',       icon: '◎' },
    { href: 'tools.html',       label: 'Tools',       icon: '⚙' },
    { href: 'concepts.html',    label: 'Concepts',    icon: '◈' },
    { href: 'workflow.html',    label: 'Workflow',    icon: '↺' },
    { href: 'roadmap.html',     label: 'Roadmap',     icon: '◉' },
    { href: 'quiz.html',        label: 'Quiz',        icon: '◆' },
    { href: 'blog.html',        label: 'Blog',        icon: '✎' },
    { href: 'search.html',      label: 'Search',      icon: '🔍' },
    { href: 'cheatsheets.html', label: 'Cheatsheets', icon: '📋' },
    { href: 'glossary.html',    label: 'Glossary',    icon: '📚' },
    { href: 'contact.html',     label: 'Contact',     icon: '✉' },
  ];

  const desktopNav = document.getElementById('dh-links');
  const drawerNav  = document.querySelector('#dh-drawer ul');
  if (!desktopNav || !drawerNav) return;

  const current = window.location.pathname.split('/').pop() || 'index.html';

  const isActive = (href) =>
    href === current || (href === 'index.html' && current === '');

  desktopNav.innerHTML = NAV_PAGES.map(p =>
    `<li><a href="${p.href}"${isActive(p.href) ? ' class="dh-active"' : ''}>${p.label}</a></li>`
  ).join('');

  drawerNav.innerHTML = NAV_PAGES.map(p =>
    `<li><a href="${p.href}"${isActive(p.href) ? ' class="dh-active"' : ''}>${p.icon} ${p.label}</a></li>`
  ).join('');
})();