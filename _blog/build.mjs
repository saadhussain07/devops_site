#!/usr/bin/env node
/* ============================================================
   DevOps Hub — blog builder
   Turns _blog/posts.json + _blog/posts/<slug>.html into
   blog-<slug>.html pages, and refreshes the generated regions
   (between BUILD markers) in blog.html, sitemap.xml and
   search.html.

   Add an article:
     1. Write the body in _blog/posts/<slug>.html (start at <h2>,
        no <h1> — the page header is generated).
     2. Add its metadata to _blog/posts.json.
     3. Run:  node _blog/build.mjs
   ============================================================ */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const SRC  = dirname(fileURLToPath(import.meta.url));
const ROOT = join(SRC, '..');
const SITE = 'https://rocketdevops.vercel.app/';
const AUTHOR = 'Muhammad Saad Hussain';

const posts = JSON.parse(readFileSync(join(SRC, 'posts.json'), 'utf8'))
  .sort((a, b) => b.date.localeCompare(a.date));

const esc = s => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const slugify = s => s.toLowerCase().replace(/&[a-z]+;/g, '').replace(/<[^>]+>/g, '')
  .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const fmtDate = iso => new Date(iso + 'T00:00:00Z')
  .toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
const url = p => `blog-${p.slug}.html`;

/* ── Per-post derived data ─────────────────────────────────── */
for (const p of posts) {
  let body = readFileSync(join(SRC, 'posts', `${p.slug}.html`), 'utf8').trim();
  const toc = [];
  const used = new Set();
  body = body.replace(/<h2(\s[^>]*)?>([\s\S]*?)<\/h2>/g, (m, attrs = '', inner) => {
    const idMatch = attrs.match(/id="([^"]+)"/);
    let id = idMatch ? idMatch[1] : slugify(inner);
    while (used.has(id)) id += '-2';
    used.add(id);
    toc.push({ id, text: inner.replace(/<[^>]+>/g, '') });
    return idMatch ? m : `<h2 id="${id}"${attrs}>${inner}</h2>`;
  });
  // prose at ~220 wpm, code blocks at ~100 wpm (code is read more slowly)
  const countWords = html => html.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;
  const codeWords = (body.match(/<pre[\s\S]*?<\/pre>/g) || []).reduce((n, c) => n + countWords(c), 0);
  const proseWords = countWords(body) - codeWords;
  p.body = body;
  p.toc = toc;
  p.minutes = Math.max(2, Math.round(proseWords / 220 + codeWords / 100));
  p.text = body.replace(/<pre[\s\S]*?<\/pre>/g, ' ').replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z]+;/g, ' ').replace(/\s+/g, ' ').trim();
}

/* ── Shared chrome ─────────────────────────────────────────── */
const NAV = `<!-- ═══ NAVBAR ═══ -->
<nav id="dh-nav" aria-label="Main navigation">
  <div id="dh-progress"></div>
  <div id="dh-inner">
    <a href="index.html" id="dh-logo">
      <span id="dh-prompt">&gt;</span> DevOpsHub
    </a>
    <ul id="dh-links"></ul>
    <div id="dh-controls">
      <button id="dh-theme-btn" aria-label="Toggle theme">🌙</button>
      <button id="dh-burger" aria-label="Open menu" aria-expanded="false">
        <span></span><span></span><span></span>
      </button>
    </div>
  </div>
</nav>

<div id="dh-drawer">
  <ul></ul>
</div>
<!-- ═══ END NAVBAR ═══ -->`;

const FOOTER = `<footer class="footer" role="contentinfo">
  <div class="container">
    <div class="footer-grid">
      <div class="footer-brand">
        <div class="nav-logo">DevOpsHub</div>
        <p>In-depth DevOps tutorials, tools, and guides for engineers building modern software delivery systems.</p>
      </div>
      <div class="footer-col">
        <h4>Learn</h4>
        <ul class="footer-links">
          <li><a href="roadmap.html">Roadmap</a></li>
          <li><a href="blog.html">Blog</a></li>
          <li><a href="concepts.html">Concepts</a></li>
          <li><a href="tools.html">Tools</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <h4>Practice</h4>
        <ul class="footer-links">
          <li><a href="projects.html">Projects</a></li>
          <li><a href="interview.html">Interview Prep</a></li>
          <li><a href="troubleshooting.html">Troubleshooting</a></li>
          <li><a href="quiz.html">Quiz</a></li>
          <li><a href="cheatsheets.html">Cheatsheets</a></li>
          <li><a href="glossary.html">Glossary</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <h4>More</h4>
        <ul class="footer-links">
          <li><a href="resources.html">Resources</a></li>
          <li><a href="search.html">Search</a></li>
          <li><a href="contact.html">Contact</a></li>
          <li><a href="privacy-policy.html">Privacy Policy</a></li>
        </ul>
      </div>
    </div>
    <div class="footer-bottom">
      <p>© 2026 DevOpsHub. Powered by HTML5, CSS3 &amp; Vanilla JS.</p>
      <div class="footer-status"><span class="status-dot"></span>All systems operational</div>
    </div>
  </div>
</footer>`;

const PAGE_JS = `<script>
'use strict';
/* Copy buttons on code blocks */
document.querySelectorAll('.post-content pre').forEach(pre => {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'post-copy';
  btn.textContent = 'copy';
  btn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(pre.querySelector('code')?.textContent ?? pre.textContent);
      btn.textContent = '✓ copied';
    } catch { btn.textContent = '✗'; }
    setTimeout(() => (btn.textContent = 'copy'), 1600);
  });
  pre.appendChild(btn);
});

/* Copy page link */
document.getElementById('copy-link')?.addEventListener('click', async e => {
  try { await navigator.clipboard.writeText(location.href); e.target.textContent = '✓ Link copied'; }
  catch { e.target.textContent = '✗'; }
  setTimeout(() => (e.target.textContent = 'Copy link'), 1800);
});

/* Highlight current section in the TOC */
const tocLinks = document.querySelectorAll('.post-toc a');
if (tocLinks.length) {
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      tocLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + en.target.id));
    });
  }, { rootMargin: '-20% 0px -70% 0px' });
  document.querySelectorAll('.post-content h2[id]').forEach(h => io.observe(h));
}
</script>`;

/* ── Article page ──────────────────────────────────────────── */
function articlePage(p, i) {
  const newer = posts[i - 1];
  const older = posts[i + 1];
  const related = posts
    .filter(o => o !== p)
    .map(o => ({ o, score: (o.category === p.category ? 3 : 0) + o.tags.filter(t => p.tags.includes(t)).length }))
    .sort((a, b) => b.score - a.score || b.o.date.localeCompare(a.o.date))
    .slice(0, 3)
    .map(x => x.o);
  const pageUrl = SITE + url(p);
  const ld = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'TechArticle',
        headline: p.title,
        description: p.description,
        datePublished: p.date,
        dateModified: p.updated || p.date,
        author: { '@type': 'Person', name: AUTHOR, url: SITE + 'about.html' },
        publisher: { '@type': 'Organization', name: 'DevOps Hub', url: SITE },
        image: SITE + 'og-image.png',
        mainEntityOfPage: pageUrl,
        keywords: p.tags.join(', '),
        timeRequired: `PT${p.minutes}M`,
        proficiencyLevel: p.level,
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: SITE },
          { '@type': 'ListItem', position: 2, name: 'Blog', item: SITE + 'blog.html' },
          { '@type': 'ListItem', position: 3, name: p.title, item: pageUrl },
        ],
      },
    ],
  };
  const share = encodeURIComponent(pageUrl);

  return `<!DOCTYPE html>
<!-- Generated by _blog/build.mjs from _blog/posts/${p.slug}.html, do not edit by hand. -->
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="${esc(p.description)}">
  <meta name="keywords" content="${esc(p.tags.join(', '))}">
  <meta name="author" content="${AUTHOR}">
  <meta name="robots" content="index, follow">
  <title>${esc(p.title)} · DevOps Hub</title>
  <link rel="icon" href="favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="style.css">
  <link rel="stylesheet" href="article.css">
  <link rel="canonical" href="${pageUrl}">
  <meta property="og:title" content="${esc(p.title)}">
  <meta property="og:description" content="${esc(p.description)}">
  <meta property="og:type" content="article">
  <meta property="og:url" content="${pageUrl}">
  <meta property="og:site_name" content="DevOps Hub">
  <meta property="og:image" content="${SITE}og-image.png">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="article:published_time" content="${p.date}">
  <meta property="article:modified_time" content="${p.updated || p.date}">
  <meta property="article:section" content="${esc(p.categoryLabel)}">
  <meta name="twitter:card" content="summary_large_image">
  <script type="application/ld+json">
${JSON.stringify(ld, null, 2)}
  </script>
</head>
<body>
${NAV}

<header class="post-header">
  <div class="container">
    <nav class="post-crumbs" aria-label="Breadcrumb"><a href="index.html">Home</a> / <a href="blog.html">Blog</a> / ${esc(p.categoryLabel)}</nav>
    <h1>${esc(p.title)}</h1>
    <p class="post-lede">${esc(p.description)}</p>
    <div class="post-meta">
      <span>${p.emoji} ${esc(p.categoryLabel)}</span>
      <span>📅 <time datetime="${p.date}">${fmtDate(p.date)}</time></span>${p.updated && p.updated !== p.date ? `
      <span>✎ Updated <time datetime="${p.updated}">${fmtDate(p.updated)}</time></span>` : ''}
      <span>⏱ ${p.minutes} min read</span>
      <span>📶 ${esc(p.level)}</span>
    </div>
    <div class="post-tags">${p.tags.map(t => `<span class="post-tag">${esc(t)}</span>`).join('')}</div>
  </div>
</header>

<div class="container">
  <div class="post-layout">
    <article class="post-content">
${p.body}

      <div class="post-share">
        <span>Share:</span>
        <a href="https://www.linkedin.com/sharing/share-offsite/?url=${share}" target="_blank" rel="noopener">LinkedIn</a>
        <a href="https://x.com/intent/post?url=${share}&amp;text=${encodeURIComponent(p.title)}" target="_blank" rel="noopener">X / Twitter</a>
        <button type="button" id="copy-link">Copy link</button>
      </div>

      <nav class="post-nav" aria-label="More articles">${older ? `
        <a href="${url(older)}" class="prev"><span>← Previous</span><strong>${esc(older.title)}</strong></a>` : ''}${newer ? `
        <a href="${url(newer)}" class="next"><span>Next →</span><strong>${esc(newer.title)}</strong></a>` : ''}
      </nav>

      <section class="post-related" aria-label="Related articles">
        <h2>Keep reading</h2>
        <div class="post-related-grid">${related.map(r => `
          <a href="${url(r)}"><span class="emoji">${r.emoji}</span><strong>${esc(r.title)}</strong><small>${esc(r.categoryLabel)} · ${r.minutes} min</small></a>`).join('')}
        </div>
      </section>

      <div class="post-cta">
        <p><strong>Learn it by building it.</strong> Put this article into practice with a hands-on portfolio project, then test yourself with the quiz.</p>
        <div style="display:flex;gap:0.6rem;flex-wrap:wrap;">
          <a href="projects.html" class="btn btn-primary">Projects →</a>
          <a href="quiz.html" class="btn btn-ghost">Take the quiz</a>
        </div>
      </div>
    </article>
${p.toc.length > 1 ? `
    <aside class="post-toc" aria-label="On this page">
      <div class="post-toc-title">On this page</div>
      <ol>${p.toc.map(t => `
        <li><a href="#${t.id}">${esc(t.text)}</a></li>`).join('')}
      </ol>
    </aside>` : ''}
  </div>
</div>

${FOOTER}

<script src="main.js" defer></script>
${PAGE_JS}
</body>
</html>
`;
}

posts.forEach((p, i) => writeFileSync(join(ROOT, url(p)), articlePage(p, i)));

/* ── Generated regions in existing files ───────────────────── */
function region(file, name, content, open = `<!-- BUILD:${name} -->`, close = `<!-- /BUILD:${name} -->`) {
  const path = join(ROOT, file);
  const src = readFileSync(path, 'utf8');
  const a = src.indexOf(open), b = src.indexOf(close);
  if (a < 0 || b < 0) throw new Error(`${file}: missing ${open} … ${close}`);
  writeFileSync(path, src.slice(0, a + open.length) + '\n' + content + '\n' + src.slice(b));
}

const featured = posts.find(p => p.featured) || posts[0];
const listed = posts; // featured post is listed too, so category filters always find it
const cats = [...new Map(posts.map(p => [p.category, p.categoryLabel])).entries()];

region('blog.html', 'FEATURED', `    <div class="blog-hero" id="featured-card">
      <div class="blog-hero-visual">
        <div class="blog-hero-icon">${featured.emoji}</div>
      </div>
      <div class="blog-hero-content">
        <span class="tag">⭐ Featured Article</span>
        <div class="blog-meta">
          <span class="blog-meta-item">📅 ${fmtDate(featured.date)}</span>
          <span class="blog-meta-item">⏱ ${featured.minutes} min read</span>
          <span class="blog-meta-item">🏷 ${esc(featured.categoryLabel)} · ${esc(featured.level)}</span>
        </div>
        <h2><a href="${url(featured)}" style="color:inherit;text-decoration:none;">${esc(featured.title)}</a></h2>
        <p>${esc(featured.description)}</p>
        <a class="btn btn-primary" href="${url(featured)}" style="align-self:flex-start;">Read Article →</a>
      </div>
    </div>`);

region('blog.html', 'FILTERS', [
  `      <button class="filter-pill active" data-filter="all">All</button>`,
  ...cats.map(([k, v]) => `      <button class="filter-pill" data-filter="${k}">${esc(v)}</button>`),
].join('\n'));

region('blog.html', 'GRID', listed.map(p => `          <a class="article-card" data-cat="${p.category}" href="${url(p)}">
            <div class="article-thumb ${p.thumb || 'thumb-green'}">
              <div class="article-thumb-emoji">${p.emoji}</div>
              <div class="article-thumb-glow"></div>
            </div>
            <div class="article-body">
              <div class="article-tags">
                ${p.tags.map((t, j) => `<span class="article-tag${j === 0 ? ' green' : ''}">${esc(t)}</span>`).join('\n                ')}
              </div>
              <h3 class="article-title">${esc(p.title)}</h3>
              <div class="article-excerpt">${esc(p.description)}</div>
              <div class="article-footer">
                <span class="article-date">📅 ${fmtDate(p.date)}</span>
                <span class="article-read-time">⏱ ${p.minutes} min</span>
              </div>
              <span class="article-read-more">Read more →</span>
            </div>
          </a>`).join('\n\n'));

region('blog.html', 'LATEST', posts.slice(0, 5).map((p, i) => `              <li><a class="popular-item" href="${url(p)}">
                <span class="popular-num">${String(i + 1).padStart(2, '0')}</span>
                <span class="popular-title">${esc(p.title)}</span>
              </a></li>`).join('\n'));

const avg = Math.round(posts.reduce((n, p) => n + p.minutes, 0) / posts.length);
region('blog.html', 'STATS', `              <div class="stats-row">
                <span class="stats-row-label">Total Articles</span>
                <span class="stats-row-val">${posts.length}</span>
              </div>
              <div class="stats-row">
                <span class="stats-row-label">Topics Covered</span>
                <span class="stats-row-val">${cats.length}</span>
              </div>
              <div class="stats-row">
                <span class="stats-row-label">Avg Read Time</span>
                <span class="stats-row-val">${avg} min</span>
              </div>
              <div class="stats-row">
                <span class="stats-row-label">Last Updated</span>
                <span class="stats-row-val">${fmtDate(posts.map(p => p.updated || p.date).sort().pop())}</span>
              </div>`);

region('blog.html', 'FOOTER', posts.slice(0, 6).map(p =>
  `          <li><a href="${url(p)}">${esc(p.title.split(':')[0])}</a></li>`).join('\n'));

region('sitemap.xml', 'BLOG', posts.map(p =>
  `  <url><loc>${SITE}${url(p)}</loc><lastmod>${p.updated || p.date}</lastmod><priority>0.8</priority></url>`).join('\n'));

const js = s => s.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
region('search.html', 'BLOG', posts.map(p => `  { page:'blog', badge:'badge-blog', url:'${url(p)}', cat:'blog',
    title:'${js(p.title)}',
    body:'${js((p.description + ' ' + p.tags.join(' ') + ' ' + p.text).slice(0, 600))}' },`).join('\n'),
  '/* BUILD:BLOG */', '/* /BUILD:BLOG */');

/* ── RSS feed ──────────────────────────────────────────────── */
const rfc822 = iso => new Date(iso + 'T09:00:00Z').toUTCString();
writeFileSync(join(ROOT, 'feed.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>DevOps Hub Blog</title>
    <link>${SITE}blog.html</link>
    <atom:link href="${SITE}feed.xml" rel="self" type="application/rss+xml"/>
    <description>DevOps tutorials, guides and best practices.</description>
    <language>en</language>
    <lastBuildDate>${rfc822(posts.map(p => p.updated || p.date).sort().pop())}</lastBuildDate>
${posts.map(p => `    <item>
      <title>${esc(p.title)}</title>
      <link>${SITE}${url(p)}</link>
      <guid isPermaLink="true">${SITE}${url(p)}</guid>
      <pubDate>${rfc822(p.date)}</pubDate>
      <category>${esc(p.categoryLabel)}</category>
      <description>${esc(p.description)}</description>
    </item>`).join('\n')}
  </channel>
</rss>
`);

console.log(`Built ${posts.length} articles: ${posts.map(url).join(', ')}`);
