'use strict';
/* ============================================================
   DevOps Hub — nav.js
   Single shared navbar injected into every page automatically.
   Features:
   - Auto-detects active page
   - Scroll progress bar
   - Hide on scroll down / show on scroll up
   - Animated mobile hamburger
   - Dark / Light theme toggle (persists via localStorage)
   - Glowing active link indicator
   - Smooth entrance animation
   ============================================================ */

(function () {

  /* ── 1. Inject CSS ────────────────────────────────────── */
  const style = document.createElement('style');
  style.textContent = `
    /* ── Nav reset & base ─────────────────────────────── */
    #dh-nav {
      position: fixed;
      top: 0; left: 0; right: 0;
      z-index: 1000;
      height: 62px;
      background: rgba(4, 8, 10, 0.82);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border-bottom: 1px solid rgba(45,255,122,0.1);
      transform: translateY(0);
      transition: transform 0.38s cubic-bezier(0.4,0,0.2,1),
                  background 0.3s ease,
                  box-shadow 0.3s ease;
    }

    #dh-nav.hidden {
      transform: translateY(-100%);
    }

    #dh-nav.scrolled {
      background: rgba(4, 8, 10, 0.97);
      box-shadow: 0 4px 30px rgba(0,0,0,0.5);
      border-bottom-color: rgba(45,255,122,0.18);
    }

    body.light-mode #dh-nav {
      background: rgba(245,248,250,0.88);
      border-bottom-color: rgba(0,0,0,0.1);
    }

    body.light-mode #dh-nav.scrolled {
      background: rgba(245,248,250,0.98);
      box-shadow: 0 4px 30px rgba(0,0,0,0.12);
    }

    /* Scroll progress bar */
    #dh-nav-progress {
      position: absolute;
      bottom: -1px;
      left: 0;
      height: 2px;
      width: 0%;
      background: linear-gradient(90deg, #8b5cf6, #2dff7a, #00e5ff);
      transition: width 0.1s linear;
      border-radius: 0 2px 2px 0;
    }

    /* Inner layout */
    #dh-nav-inner {
      max-width: 1220px;
      margin: 0 auto;
      padding: 0 1.5rem;
      height: 100%;
      display: flex;
      align-items: center;
      gap: 1.5rem;
      position: relative;
    }

    /* ── Logo ─────────────────────────────────────────── */
    #dh-logo {
      font-family: 'Courier New', Courier, monospace;
      font-size: 1.05rem;
      font-weight: 700;
      color: #2dff7a;
      letter-spacing: 0.04em;
      text-decoration: none;
      display: flex;
      align-items: center;
      gap: 0.45rem;
      white-space: nowrap;
      transition: opacity 0.2s;
      flex-shrink: 0;
    }

    #dh-logo:hover { opacity: 0.82; }

    #dh-logo-prompt {
      color: #ff5c1a;
      animation: dh-blink 1s step-end infinite;
    }

    @keyframes dh-blink {
      0%,100% { opacity: 1; }
      50%      { opacity: 0; }
    }

    /* ── Links ────────────────────────────────────────── */
    #dh-links {
      display: flex;
      align-items: center;
      gap: 0.1rem;
      list-style: none;
      margin: 0;
      padding: 0;
      flex: 1;
      justify-content: center;
    }

    #dh-links li { position: relative; }

    #dh-links a {
      display: flex;
      align-items: center;
      gap: 0.3rem;
      padding: 0.38rem 0.6rem;
      font-family: 'Courier New', Courier, monospace;
      font-size: 0.7rem;
      letter-spacing: 0.07em;
      text-transform: uppercase;
      color: #7a9e92;
      text-decoration: none;
      border-radius: 5px;
      border: 1px solid transparent;
      transition: color 0.22s ease,
                  background 0.22s ease,
                  border-color 0.22s ease,
                  transform 0.18s ease;
      white-space: nowrap;
      position: relative;
    }

    /* Icon dot per link */
    #dh-links a .dh-link-dot {
      width: 5px; height: 5px;
      border-radius: 50%;
      background: currentColor;
      opacity: 0;
      transform: scale(0);
      transition: opacity 0.2s, transform 0.2s;
      flex-shrink: 0;
    }

    #dh-links a:hover {
      color: #2dff7a;
      background: rgba(45,255,122,0.07);
      border-color: rgba(45,255,122,0.18);
      transform: translateY(-1px);
    }

    #dh-links a:hover .dh-link-dot {
      opacity: 1;
      transform: scale(1);
    }

    /* Active state */
    #dh-links a.dh-active {
      color: #2dff7a;
      background: rgba(45,255,122,0.10);
      border-color: rgba(45,255,122,0.28);
      box-shadow: 0 0 12px rgba(45,255,122,0.15);
    }

    #dh-links a.dh-active .dh-link-dot {
      opacity: 1;
      transform: scale(1);
      background: #2dff7a;
      box-shadow: 0 0 6px #2dff7a;
      animation: dh-pulse-dot 2s ease-in-out infinite;
    }

    @keyframes dh-pulse-dot {
      0%,100% { box-shadow: 0 0 0 0 rgba(45,255,122,0.7); }
      50%      { box-shadow: 0 0 0 4px rgba(45,255,122,0); }
    }

    body.light-mode #dh-links a         { color: #3d5266; }
    body.light-mode #dh-links a:hover   { color: #16a34a; background: rgba(22,163,74,0.07); border-color: rgba(22,163,74,0.2); }
    body.light-mode #dh-links a.dh-active { color: #16a34a; background: rgba(22,163,74,0.1); border-color: rgba(22,163,74,0.28); }

    /* ── Right controls ───────────────────────────────── */
    #dh-controls {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      flex-shrink: 0;
    }

    /* Theme toggle */
    #dh-theme-btn {
      width: 34px; height: 34px;
      border-radius: 50%;
      border: 1px solid rgba(45,255,122,0.2);
      background: rgba(45,255,122,0.05);
      color: #7a9e92;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.9rem;
      transition: all 0.25s ease;
      position: relative;
      overflow: hidden;
    }

    #dh-theme-btn:hover {
      border-color: rgba(45,255,122,0.5);
      color: #2dff7a;
      background: rgba(45,255,122,0.1);
      transform: rotate(15deg) scale(1.1);
    }

    #dh-theme-btn.spinning {
      animation: dh-spin 0.5s cubic-bezier(0.4,0,0.2,1);
    }

    @keyframes dh-spin {
      from { transform: rotate(0deg) scale(1); }
      50%  { transform: rotate(180deg) scale(1.2); }
      to   { transform: rotate(360deg) scale(1); }
    }

    body.light-mode #dh-theme-btn {
      border-color: rgba(0,0,0,0.12);
      background: rgba(0,0,0,0.04);
      color: #3d5266;
    }

    /* ── Mobile hamburger ─────────────────────────────── */
    #dh-burger {
      display: none;
      flex-direction: column;
      gap: 5px;
      cursor: pointer;
      padding: 0.4rem;
      background: none;
      border: none;
      border-radius: 5px;
      transition: background 0.2s;
    }

    #dh-burger:hover { background: rgba(45,255,122,0.07); }

    #dh-burger span {
      display: block;
      width: 22px; height: 2px;
      background: #2dff7a;
      border-radius: 2px;
      transition: transform 0.35s cubic-bezier(0.4,0,0.2,1),
                  opacity 0.25s ease,
                  width 0.25s ease;
      transform-origin: center;
    }

    /* Burger → X animation */
    #dh-burger.open span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
    #dh-burger.open span:nth-child(2) { opacity: 0; width: 0; }
    #dh-burger.open span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }

    /* ── Mobile drawer ────────────────────────────────── */
    #dh-drawer {
      position: fixed;
      top: 62px;
      left: 0; right: 0;
      background: rgba(4,8,10,0.98);
      border-bottom: 1px solid rgba(45,255,122,0.12);
      padding: 0;
      max-height: 0;
      overflow: hidden;
      transition: max-height 0.4s cubic-bezier(0.4,0,0.2,1),
                  padding 0.3s ease;
      z-index: 999;
      backdrop-filter: blur(20px);
    }

    #dh-drawer.open {
      max-height: 520px;
      padding: 0.75rem 1.5rem 1.25rem;
    }

    body.light-mode #dh-drawer {
      background: rgba(245,248,250,0.98);
      border-bottom-color: rgba(0,0,0,0.1);
    }

    #dh-drawer-links {
      list-style: none;
      margin: 0; padding: 0;
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    #dh-drawer-links a {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      padding: 0.65rem 0.85rem;
      font-family: 'Courier New', Courier, monospace;
      font-size: 0.82rem;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: #7a9e92;
      text-decoration: none;
      border-radius: 6px;
      border: 1px solid transparent;
      transition: all 0.2s ease;
    }

    #dh-drawer-links a:hover,
    #dh-drawer-links a.dh-active {
      color: #2dff7a;
      background: rgba(45,255,122,0.08);
      border-color: rgba(45,255,122,0.2);
      padding-left: 1.1rem;
    }

    body.light-mode #dh-drawer-links a       { color: #3d5266; }
    body.light-mode #dh-drawer-links a:hover,
    body.light-mode #dh-drawer-links a.dh-active { color: #16a34a; background: rgba(22,163,74,0.08); border-color: rgba(22,163,74,0.2); }

    /* Stagger drawer link animation */
    #dh-drawer.open #dh-drawer-links li {
      animation: dh-slide-in 0.3s ease both;
    }
    #dh-drawer.open #dh-drawer-links li:nth-child(1)  { animation-delay: 0.04s; }
    #dh-drawer.open #dh-drawer-links li:nth-child(2)  { animation-delay: 0.08s; }
    #dh-drawer.open #dh-drawer-links li:nth-child(3)  { animation-delay: 0.12s; }
    #dh-drawer.open #dh-drawer-links li:nth-child(4)  { animation-delay: 0.16s; }
    #dh-drawer.open #dh-drawer-links li:nth-child(5)  { animation-delay: 0.20s; }
    #dh-drawer.open #dh-drawer-links li:nth-child(6)  { animation-delay: 0.24s; }
    #dh-drawer.open #dh-drawer-links li:nth-child(7)  { animation-delay: 0.28s; }
    #dh-drawer.open #dh-drawer-links li:nth-child(8)  { animation-delay: 0.32s; }
    #dh-drawer.open #dh-drawer-links li:nth-child(9)  { animation-delay: 0.36s; }

    @keyframes dh-slide-in {
      from { opacity: 0; transform: translateX(-16px); }
      to   { opacity: 1; transform: translateX(0); }
    }

    /* Body top padding so content isn't hidden under nav */
    body { padding-top: 62px !important; }

    /* ── Entrance animation ───────────────────────────── */
    @keyframes dh-nav-enter {
      from { transform: translateY(-100%); opacity: 0; }
      to   { transform: translateY(0);    opacity: 1; }
    }

    #dh-nav { animation: dh-nav-enter 0.55s cubic-bezier(0.4,0,0.2,1) both; }

    /* ── Responsive ───────────────────────────────────── */
    @media (max-width: 900px) {
      #dh-links  { display: none; }
      #dh-burger { display: flex; }
    }

    @media (max-width: 400px) {
      #dh-logo { font-size: 0.92rem; }
    }
  `;
  document.head.appendChild(style);

  /* ── 2. Page map ──────────────────────────────────── */
  const NAV_LINKS = [
    { href: 'index.html',    label: 'Home',     icon: '⌂' },
    { href: 'about.html',    label: 'About',    icon: '◎' },
    { href: 'tools.html',    label: 'Tools',    icon: '⚙' },
    { href: 'concepts.html', label: 'Concepts', icon: '◈' },
    { href: 'workflow.html', label: 'Workflow', icon: '↺' },
    { href: 'roadmap.html',  label: 'Roadmap',  icon: '◉' },
    { href: 'quiz.html',     label: 'Quiz',     icon: '◆' },
    { href: 'blog.html',     label: 'Blog',     icon: '✎' },
    { href: 'contact.html',  label: 'Contact',  icon: '✉' },
  ];

  /* Detect current page */
  const currentFile = window.location.pathname.split('/').pop() || 'index.html';

  function isActive(href) {
    if (href === 'index.html' && (currentFile === '' || currentFile === 'index.html')) return true;
    return currentFile === href;
  }

  /* ── 3. Build HTML ────────────────────────────────── */
  function buildLinkItem(link, forDrawer = false) {
    const active = isActive(link.href) ? ' dh-active' : '';
    if (forDrawer) {
      return `<li><a href="${link.href}" class="${active.trim()}">
        <span style="opacity:0.5;font-size:0.85rem;">${link.icon}</span>
        ${link.label}
      </a></li>`;
    }
    return `<li><a href="${link.href}" class="${active.trim()}">
      <span class="dh-link-dot"></span>
      ${link.label}
    </a></li>`;
  }

  const desktopLinks = NAV_LINKS.map(l => buildLinkItem(l, false)).join('');
  const drawerLinks  = NAV_LINKS.map(l => buildLinkItem(l, true)).join('');

  /* Nav HTML */
  const navHTML = `
    <nav id="dh-nav" role="navigation" aria-label="Main navigation">
      <div id="dh-nav-progress" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"></div>
      <div id="dh-nav-inner">

        <a href="index.html" id="dh-logo" aria-label="DevOps Hub home">
          <span id="dh-logo-prompt">&gt;</span>
          DevOpsHub
        </a>

        <ul id="dh-links" aria-label="Site navigation">${desktopLinks}</ul>

        <div id="dh-controls">
          <button id="dh-theme-btn" aria-label="Toggle dark/light mode" title="Toggle theme">🌙</button>
          <button id="dh-burger" aria-label="Open mobile menu" aria-expanded="false" aria-controls="dh-drawer">
            <span></span><span></span><span></span>
          </button>
        </div>

      </div>
    </nav>

    <!-- Mobile drawer -->
    <div id="dh-drawer" role="dialog" aria-label="Mobile navigation" aria-hidden="true">
      <ul id="dh-drawer-links">${drawerLinks}</ul>
    </div>
  `;

  /* Inject into page */
  document.body.insertAdjacentHTML('afterbegin', navHTML);

  /* ── 4. Scroll behaviour ──────────────────────────── */
  const nav      = document.getElementById('dh-nav');
  const progress = document.getElementById('dh-nav-progress');

  let lastY   = 0;
  let ticking = false;

  window.addEventListener('scroll', () => {
    if (ticking) return;
    requestAnimationFrame(() => {
      const y = window.scrollY;

      /* Progress bar */
      const { scrollHeight, clientHeight } = document.documentElement;
      const pct = scrollHeight - clientHeight > 0
        ? (y / (scrollHeight - clientHeight)) * 100 : 0;
      progress.style.width = pct + '%';
      progress.setAttribute('aria-valuenow', Math.round(pct));

      /* Hide on scroll down (past 120px), show on scroll up */
      if (y > lastY && y > 120) {
        nav.classList.add('hidden');
        closeDrawer();
      } else {
        nav.classList.remove('hidden');
      }

      /* Scrolled class for stronger background */
      nav.classList.toggle('scrolled', y > 40);

      lastY   = y;
      ticking = false;
    });
    ticking = true;
  }, { passive: true });

  /* ── 5. Mobile drawer ─────────────────────────────── */
  const burger = document.getElementById('dh-burger');
  const drawer = document.getElementById('dh-drawer');

  function openDrawer() {
    burger.classList.add('open');
    drawer.classList.add('open');
    burger.setAttribute('aria-expanded', 'true');
    drawer.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeDrawer() {
    burger.classList.remove('open');
    drawer.classList.remove('open');
    burger.setAttribute('aria-expanded', 'false');
    drawer.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  burger.addEventListener('click', () => {
    drawer.classList.contains('open') ? closeDrawer() : openDrawer();
  });

  /* Close drawer on link click */
  drawer.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', closeDrawer);
  });

  /* Close drawer on outside tap */
  document.addEventListener('click', e => {
    if (!nav.contains(e.target) && !drawer.contains(e.target)) closeDrawer();
  });

  /* ── 6. Theme toggle ──────────────────────────────── */
  const themeBtn  = document.getElementById('dh-theme-btn');
  const THEME_KEY = 'devopshub_theme';

  /* Apply saved theme immediately */
  if (localStorage.getItem(THEME_KEY) === 'light') {
    document.body.classList.add('light-mode');
    themeBtn.textContent = '☀️';
  }

  themeBtn.addEventListener('click', () => {
    /* Spin animation */
    themeBtn.classList.remove('spinning');
    void themeBtn.offsetWidth;
    themeBtn.classList.add('spinning');
    setTimeout(() => themeBtn.classList.remove('spinning'), 500);

    const isLight = document.body.classList.toggle('light-mode');
    themeBtn.textContent = isLight ? '☀️' : '🌙';
    localStorage.setItem(THEME_KEY, isLight ? 'light' : 'dark');
  });

  /* ── 7. Keyboard nav ──────────────────────────────── */
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeDrawer();
  });

})();
