/* ============================================================
   KZ ELEVATE — interactive enhancement layer
   Loads after all other scripts. Non-destructive, additive only.
   ============================================================ */
(function(){
  'use strict';

  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isCoarse = matchMedia('(pointer: coarse)').matches;

  /* ------------------------------------------------------------
     1. Hero ember particles
     ------------------------------------------------------------ */
  function spawnEmbers(){
    if (reduceMotion) return;
    const hero = document.querySelector('.hero');
    if (!hero) return;
    const container = document.createElement('div');
    container.className = 'kz-embers';
    container.setAttribute('aria-hidden', 'true');
    hero.appendChild(container);

    const count = isCoarse ? 12 : 22;
    for (let i = 0; i < count; i++){
      const e = document.createElement('span');
      e.className = 'kz-ember';
      const size = 2 + Math.random() * 5;
      const dx = (Math.random() - 0.5) * 120;
      const dur = 7 + Math.random() * 8;
      const delay = Math.random() * 12;
      const peak = 0.5 + Math.random() * 0.5;
      e.style.cssText = `
        left: ${Math.random() * 100}%;
        --s: ${size}px;
        --dx: ${dx}px;
        --dur: ${dur}s;
        --delay: ${delay}s;
        --peak: ${peak};
        animation-delay: ${delay}s;
      `;
      container.appendChild(e);
    }
  }

  /* ------------------------------------------------------------
     2. Hero mouse parallax
     ------------------------------------------------------------ */
  function heroParallax(){
    if (reduceMotion || isCoarse) return;
    const hero = document.querySelector('.hero');
    if (!hero) return;
    hero.dataset.mouse = 'on';
    let raf = null;
    hero.addEventListener('mousemove', (e) => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        const r = hero.getBoundingClientRect();
        const mx = ((e.clientX - r.left) / r.width) * 100;
        const my = ((e.clientY - r.top) / r.height) * 100;
        hero.style.setProperty('--mx', mx + '%');
        hero.style.setProperty('--my', my + '%');
        raf = null;
      });
    });
  }

  /* ------------------------------------------------------------
     3. Topbar condense on scroll
     ------------------------------------------------------------ */
  function topbarCondense(){
    const topbar = document.querySelector('.topbar');
    if (!topbar) return;
    let last = 0;
    const onScroll = () => {
      const y = window.scrollY;
      topbar.classList.toggle('is-condensed', y > 40);
      last = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ------------------------------------------------------------
     4. Mobile nav toggle
     ------------------------------------------------------------ */
  function mobileNav(){
    const topbar = document.querySelector('.topbar');
    const btn = document.getElementById('menuBtn');
    if (!topbar || !btn) return;
    btn.addEventListener('click', () => {
      const open = topbar.classList.toggle('is-mobile-open');
      btn.setAttribute('aria-expanded', String(open));
      document.body.style.overflow = open ? 'hidden' : '';
    });
    // Close on link click
    topbar.querySelectorAll('.nav a').forEach(a => {
      a.addEventListener('click', () => {
        topbar.classList.remove('is-mobile-open');
        document.body.style.overflow = '';
      });
    });
    // Close on resize up
    matchMedia('(min-width: 981px)').addEventListener('change', (e) => {
      if (e.matches){
        topbar.classList.remove('is-mobile-open');
        document.body.style.overflow = '';
      }
    });
  }

  /* ------------------------------------------------------------
     5. Mega-menu (nav-drop) — keyboard + click on mobile
     ------------------------------------------------------------ */
  function megaMenuKeyboard(){
    document.querySelectorAll('.nav-item.has-sub').forEach(item => {
      const caret = item.querySelector('.nav-caret');
      const drop = item.querySelector('.nav-drop');
      if (!caret || !drop) return;
      caret.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const open = item.classList.toggle('is-open');
        caret.setAttribute('aria-expanded', String(open));
      });
    });
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.nav-item.has-sub')){
        document.querySelectorAll('.nav-item.has-sub.is-open').forEach(i => {
          i.classList.remove('is-open');
          const c = i.querySelector('.nav-caret');
          if (c) c.setAttribute('aria-expanded', 'false');
        });
      }
    });
  }

  /* ------------------------------------------------------------
     6. Scroll-triggered reveal
     ------------------------------------------------------------ */
  function setupReveal(){
    if (reduceMotion){
      document.querySelectorAll('[data-kz-reveal]').forEach(el => el.classList.add('is-revealed'));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach(en => {
        if (en.isIntersecting){
          en.target.classList.add('is-revealed');
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

    // Only enhance items that explicitly opt in (data-kz-reveal in markup)
    document.querySelectorAll('[data-kz-reveal]').forEach(el => io.observe(el));
  }

  /* ------------------------------------------------------------
     7. Count-up for dashboard metrics
     ------------------------------------------------------------ */
  function countUp(el, target, duration = 1600){
    if (reduceMotion){ el.textContent = target.toLocaleString('he-IL'); return; }
    const start = performance.now();
    const from = 0;
    const fmt = (n) => n.toLocaleString('he-IL');
    function tick(now){
      const t = Math.min(1, (now - start) / duration);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - t, 3);
      const v = Math.round(from + (target - from) * eased);
      el.textContent = fmt(v);
      if (t < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  function animateMetrics(){
    const targets = [
      { id: 'liveUsers',   n: 126   },
      { id: 'livePrayers', n: 49    },
      { id: 'weekPrayers', n: 2184  }
    ];
    const io = new IntersectionObserver((entries) => {
      entries.forEach(en => {
        if (en.isIntersecting){
          const t = targets.find(t => t.id === en.target.id);
          if (t){ countUp(en.target, t.n); io.unobserve(en.target); }
        }
      });
    }, { threshold: 0.4 });
    targets.forEach(t => {
      const el = document.getElementById(t.id);
      if (el) io.observe(el);
    });
  }

  /* ------------------------------------------------------------
     8. Live "drift" — small pulses to liveUsers/livePrayers
     ------------------------------------------------------------ */
  function liveDrift(){
    if (reduceMotion) return;
    const ids = ['liveUsers', 'livePrayers'];
    setInterval(() => {
      ids.forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        const cur = parseInt((el.textContent || '0').replace(/\D/g, ''), 10) || 0;
        const delta = Math.random() < 0.6 ? (Math.floor(Math.random() * 3) + 1) : -(Math.floor(Math.random() * 2) + 1);
        const next = Math.max(10, cur + delta);
        // brief flash
        el.style.transition = 'color .4s, transform .4s';
        el.style.color = 'var(--gold)';
        el.style.transform = 'translateY(-2px)';
        countUp(el, next, 700);
        setTimeout(() => {
          el.style.color = '';
          el.style.transform = '';
        }, 600);
      });
    }, 7000);
  }

  /* ------------------------------------------------------------
     9. Ticker — rotate items
     ------------------------------------------------------------ */
  function tickerRotate(){
    if (reduceMotion) return;
    const ul = document.getElementById('dashTicker');
    if (!ul) return;
    setInterval(() => {
      const first = ul.firstElementChild;
      if (!first) return;
      first.style.transition = 'opacity .4s, transform .4s';
      first.style.opacity = '0';
      first.style.transform = 'translateY(-12px)';
      setTimeout(() => {
        ul.appendChild(first);
        first.style.opacity = '';
        first.style.transform = '';
      }, 400);
    }, 5500);
  }

  /* ------------------------------------------------------------
     10. Smooth anchor scroll with offset for sticky header
     ------------------------------------------------------------ */
  function smoothAnchors(){
    document.querySelectorAll('a[href^="#"]').forEach(a => {
      const href = a.getAttribute('href');
      if (!href || href === '#' || href.length < 2) return;
      a.addEventListener('click', (e) => {
        const target = document.querySelector(href);
        if (!target) return;
        e.preventDefault();
        const top = target.getBoundingClientRect().top + window.scrollY - 80;
        window.scrollTo({ top, behavior: reduceMotion ? 'auto' : 'smooth' });
      });
    });
  }

  /* ------------------------------------------------------------
     11. Card 3D tilt (subtle, desktop only)
     ------------------------------------------------------------ */
  function cardTilt(){
    if (reduceMotion || isCoarse) return;
    const cards = document.querySelectorAll('.dash-metric, .hero-dash-verse, .daily-zmanim');
    cards.forEach(card => {
      let raf = null;
      card.addEventListener('mousemove', (e) => {
        if (raf) return;
        raf = requestAnimationFrame(() => {
          const r = card.getBoundingClientRect();
          const cx = (e.clientX - r.left) / r.width - 0.5;
          const cy = (e.clientY - r.top) / r.height - 0.5;
          card.style.transform = `perspective(900px) rotateX(${-cy * 4}deg) rotateY(${cx * 4}deg) translateY(-2px)`;
          raf = null;
        });
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });
  }

  /* ------------------------------------------------------------
     12. Modal animation guard — ensure spring on open
     ------------------------------------------------------------ */
  function enhanceModals(){
    document.querySelectorAll('.modal').forEach(m => {
      // Backdrop click to close
      const back = m.querySelector('.modal-back, [data-close]');
      m.querySelectorAll('[data-close]').forEach(el => {
        el.addEventListener('click', () => {
          m.setAttribute('hidden', '');
        });
      });
      // ESC
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !m.hasAttribute('hidden')){
          m.setAttribute('hidden', '');
        }
      });
    });
  }

  /* ------------------------------------------------------------
     13. Init
     ------------------------------------------------------------ */
  function init(){
    spawnEmbers();
    heroParallax();
    topbarCondense();
    mobileNav();
    megaMenuKeyboard();
    setupReveal();
    animateMetrics();
    liveDrift();
    tickerRotate();
    smoothAnchors();
    cardTilt();
    enhanceModals();
  }

  if (document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
