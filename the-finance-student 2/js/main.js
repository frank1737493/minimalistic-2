(() => {
  const root = document.documentElement;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  window.scrollTo(0, 0);

  /* ---------- smooth scroll ---------- */
  let lenis = null;
  if (window.Lenis && !reduced) lenis = new window.Lenis({ lerp: 0.1, wheelMultiplier: 0.9 });

  const fontsReady = Promise.race([
    document.fonts ? document.fonts.ready : Promise.resolve(),
    new Promise((r) => setTimeout(r, 1500)),
  ]);

  /* ---------- intro: the site opens out of the "a" ---------- */
  const intro = $('.intro');
  const letterA = $('.hero__a');

  function endIntro() {
    root.classList.remove('is-intro');
    root.classList.add('is-done');
    if (lenis) lenis.start();
  }

  function runIntro() {
    if (lenis) lenis.stop();
    const r = letterA.getBoundingClientRect();
    const x = r.left + r.width / 2;
    const y = r.top + r.height * 0.62; // the bowl of the "a", not the cap height
    const far = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    intro.style.setProperty('--ix', `${x}px`);
    intro.style.setProperty('--iy', `${y}px`);

    const supportsRadius = window.CSS && CSS.supports && CSS.supports('(mask-image: radial-gradient(black, white)) or (-webkit-mask-image: radial-gradient(black, white))');
    if (reduced || !supportsRadius) {
      // gentle fallback: fade the sheet away
      intro.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 300, easing: 'ease', fill: 'forwards' });
      root.classList.add('is-revealed');
      setTimeout(endIntro, 320);
      return;
    }

    // hold on "Finance." for a beat, then open
    setTimeout(() => {
      intro.style.transition = '--r 1.25s cubic-bezier(.77, 0, .175, 1)';
      intro.style.setProperty('--r', `${far + 2}px`);
      setTimeout(() => root.classList.add('is-revealed'), 280);
      let done = false;
      const finish = () => { if (!done) { done = true; endIntro(); } };
      intro.addEventListener('transitionend', finish, { once: true });
      setTimeout(finish, 1500); // if --r cannot transition, still finish
    }, 650);
  }

  if (intro && letterA) fontsReady.then(() => requestAnimationFrame(runIntro));
  else { root.classList.add('is-revealed'); endIntro(); }

  /* ---------- statement words ---------- */
  const statement = $('[data-words]');
  let words = [];
  if (statement) {
    statement.innerHTML = statement.textContent.trim().split(/\s+/).map((w) => `<span class="w">${w}</span>`).join(' ');
    words = $$('.w', statement);
  }

  /* ---------- marquee: duplicate the track for a seamless loop ---------- */
  $$('.marquee').forEach((m) => {
    const track = $('.marquee__track', m);
    const copy = track.cloneNode(true);
    copy.setAttribute('aria-hidden', 'true');
    $$('img', copy).forEach((img) => (img.alt = ''));
    m.appendChild(copy);
  });

  /* ---------- scroll reveals (fire once) ---------- */
  $$('.roles .role').forEach((el, i) => el.style.setProperty('--d', i));
  $$('.statement__row .fact').forEach((el, i) => el.style.setProperty('--d', i));
  // clipped headings have no visible area until revealed, so watch their parent
  const watched = new Map();
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      (watched.get(e.target) || []).forEach((el) => el.classList.add('in'));
      io.unobserve(e.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
  $$('.reveal, .reveal-clip').forEach((el) => {
    const target = el.classList.contains('reveal-clip') ? el.parentElement : el;
    if (!watched.has(target)) { watched.set(target, []); io.observe(target); }
    watched.get(target).push(el);
  });

  /* ---------- footer wordmark: same gap on both sides ---------- */
  const mega = $('[data-mega]');
  const measure = document.createElement('canvas').getContext('2d');
  function fitMega() {
    if (!mega) return;
    const box = mega.parentElement;
    const gap = parseFloat(getComputedStyle(box).paddingLeft);
    const avail = box.clientWidth - gap * 2;
    const base = 100;
    mega.style.fontSize = `${base}px`;
    mega.style.marginLeft = '0px';
    const layoutW = mega.getBoundingClientRect().width;
    // side bearings of the first and last glyphs, so the ink (not the box) is centred
    measure.font = `700 ${base}px "SK Modernist"`;
    const first = measure.measureText('T');
    const last = measure.measureText('t');
    const lsb = -first.actualBoundingBoxLeft;
    const rsb = last.width - last.actualBoundingBoxRight;
    const ink = layoutW - lsb - rsb;
    const k = avail / ink;
    mega.style.fontSize = `${base * k}px`;
    mega.style.marginLeft = `${-lsb * k}px`;
  }
  fontsReady.then(fitMega);
  window.addEventListener('resize', fitMega);

  /* ---------- per-frame scroll effects ---------- */
  const header = $('.header');
  const hero = $('.hero');
  const stack = $('[data-stack]');
  const panels = stack ? $$('.panel', stack) : [];
  const panelImgs = panels.map((p) => $('.panel__media img', p));
  if (stack) stack.style.setProperty('--n', panels.length);

  let lastY = 0;
  function onScroll() {
    const y = window.scrollY;
    const vh = window.innerHeight;

    if (header && root.classList.contains('is-done')) {
      header.classList.toggle('is-solid', y > 40);
      if (y > lastY + 2 && y > hero.offsetHeight * 0.6) header.classList.add('is-hidden');
      else if (y < lastY - 2 || y < 40) header.classList.remove('is-hidden');
    }
    lastY = y;

    if (statement && words.length) {
      const r = statement.getBoundingClientRect();
      const p = clamp((vh * 0.85 - r.top) / (r.height + vh * 0.35));
      const on = Math.round(p * words.length);
      words.forEach((w, i) => w.classList.toggle('on', i < on));
    }

    if (stack && panels.length) {
      const scrolled = -stack.getBoundingClientRect().top;
      panels.forEach((panel, i) => {
        const local = i === 0 ? 1 : clamp((scrolled - (i - 1) * vh) / vh);
        if (i > 0) panel.style.transform = `translate3d(${((1 - local) * 100).toFixed(3)}%, 0, 0)`;
        // photo lags behind its panel, then settles
        const img = panelImgs[i];
        if (img && !reduced) img.style.transform = `translate3d(${(-(1 - local) * 18).toFixed(2)}%, 0, 0) scale(1.12)`;
      });
    }
  }

  function raf(time) {
    if (lenis) lenis.raf(time);
    onScroll();
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

  /* ---------- anchors & placeholder links ---------- */
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    e.preventDefault();
    const id = a.getAttribute('href');
    if (id.length < 2) return; // placeholder buttons go nowhere for now
    const target = $(id);
    if (!target) return;
    if (lenis) lenis.scrollTo(target, { offset: 0, duration: 1.4 });
    else target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
  });

  /* ---------- palette: copy hex ---------- */
  $$('.swatch').forEach((btn) => {
    const hex = $('.swatch__hex', btn);
    btn.addEventListener('click', () => {
      const value = btn.dataset.hex;
      const show = (msg) => {
        hex.textContent = msg;
        clearTimeout(btn._t);
        btn._t = setTimeout(() => (hex.textContent = value), 1200);
      };
      if (navigator.clipboard) navigator.clipboard.writeText(value).then(() => show('Copied'), () => show(value));
      else show(value);
    });
  });

  /* ---------- subscribe (UI only) ---------- */
  const form = $('.subscribe');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = $('#sub-email').value.trim();
      const city = $('#sub-city').value;
      $('.subscribe__note').textContent = /^\S+@\S+\.\S+$/.test(email)
        ? `Almost done. Check your inbox to confirm ${city} alerts.`
        : 'Enter your email address to subscribe.';
    });
  }
})();
