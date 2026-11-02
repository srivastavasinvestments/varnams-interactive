/**
 * livebg.js — Lightweight "live" animated backgrounds for Royal Smash 3D
 *
 * Design goals (performance first):
 *  - Pure CSS animations on transform/opacity only → run on the GPU compositor,
 *    ZERO JavaScript work per frame, no extra WebGL draw calls.
 *  - Small element counts (≈8–22 DOM nodes), halved automatically on low-end phones.
 *  - Auto-paused when the tab is hidden; enabled by default across all stages.
 *  - Dynamically rotates atmospheric weather/mood every 3 stages so every world
 *    block feels fresh and alive.
 */

const css = `
#live-bg { position:absolute; inset:0; overflow:hidden; pointer-events:none; z-index:0; contain:strict; }
#live-bg.rs-paused * { animation-play-state: paused !important; }
#live-bg > * { position:absolute; will-change: transform, opacity; backface-visibility:hidden; }

/* ☁️ Clouds */
.rs-cloud { left:0; height:90px; opacity:.85;
  background:
    radial-gradient(closest-side at 22% 62%, var(--c) 0 70%, transparent 72%),
    radial-gradient(closest-side at 45% 42%, var(--c) 0 78%, transparent 80%),
    radial-gradient(closest-side at 70% 58%, var(--c) 0 72%, transparent 74%),
    radial-gradient(closest-side at 50% 72%, var(--c) 0 80%, transparent 82%);
  animation: rsDrift linear infinite; }
@keyframes rsDrift { from { transform: translate3d(-45vw,0,0); } to { transform: translate3d(115vw,0,0); } }

/* 🐦 Birds (outer drifts, inner flaps) */
.rs-bird { left:0; width:34px; height:16px; animation: rsFly linear infinite; }
.rs-bird i { display:block; width:100%; height:100%; transform-origin:50% 80%;
  background:no-repeat center/contain url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 18'><path d='M1 12 Q10 -2 20 11 Q30 -2 39 12' fill='none' stroke='%23222' stroke-width='3' stroke-linecap='round'/></svg>");
  animation: rsFlap .55s ease-in-out infinite alternate; }
@keyframes rsFly { 0% { transform: translate3d(-12vw,0,0);} 50% { transform: translate3d(50vw,-18px,0);} 100% { transform: translate3d(112vw,6px,0);} }
@keyframes rsFlap { from { transform: scaleY(1);} to { transform: scaleY(.35);} }

/* 🌊 River shimmer */
.rs-river { left:-100px; right:-100px; bottom:6%; height:24%;
  background: repeating-linear-gradient(100deg, transparent 0 38px, rgba(255,255,255,.22) 38px 44px, transparent 44px 90px);
  -webkit-mask-image: linear-gradient(to bottom, transparent, #000 35%, #000 70%, transparent);
          mask-image: linear-gradient(to bottom, transparent, #000 35%, #000 70%, transparent);
  opacity:.58; animation: rsFlow 3.2s linear infinite; }
@keyframes rsFlow { from { transform: translate3d(0,0,0);} to { transform: translate3d(90px,0,0);} }

/* 🚩 Distant Horizon Royal Flags (Left & Right Castle Banners) */
.rs-flag-wrap { width:44px; height:64px; opacity:0.9; }
.rs-flag-pole { position:absolute; left:4px; top:4px; width:3px; height:56px; background:linear-gradient(180deg,#fef08a,#b45309); border-radius:2px; }
.rs-flag-cloth { position:absolute; left:7px; top:6px; width:34px; height:20px;
  background:linear-gradient(90deg, var(--fc1, #ef4444), var(--fc2, #f59e0b));
  clip-path: polygon(0 0, 100% 15%, 82% 50%, 100% 85%, 0 100%);
  transform-origin: left center;
  animation: rsFlagWave 1.1s ease-in-out infinite alternate; }
@keyframes rsFlagWave { from { transform: skewY(-6deg) scaleX(0.92); } to { transform: skewY(7deg) scaleX(1.04); } }

/* ✨ Stars / sparkles / fireflies / petals */
.rs-star { width:3px; height:3px; border-radius:50%; background:#fff; box-shadow:0 0 6px 1px rgba(255,255,255,.8);
  animation: rsTwinkle ease-in-out infinite; }
@keyframes rsTwinkle { 0%,100% { opacity:.15; transform:scale(.7);} 50% { opacity:1; transform:scale(1.25);} }
.rs-shoot { top:8%; left:0; width:90px; height:2px; opacity:0;
  background:linear-gradient(90deg, transparent, #fff); transform: rotate(18deg);
  animation: rsShoot 9s ease-in infinite; }
@keyframes rsShoot { 0%,88% { opacity:0; transform: translate3d(10vw,0,0) rotate(18deg);} 90% { opacity:1;} 100% { opacity:0; transform: translate3d(70vw,26vh,0) rotate(18deg);} }
.rs-fly { width:5px; height:5px; border-radius:50%; background:#d9f99d; box-shadow:0 0 8px 3px rgba(190,242,100,.7);
  animation: rsFloat ease-in-out infinite alternate; }
@keyframes rsFloat { from { transform: translate3d(0,0,0); opacity:.2;} to { transform: translate3d(var(--dx),var(--dy),0); opacity:1;} }
.rs-gold { width:4px; height:4px; background:#ffd54a; border-radius:50%; box-shadow:0 0 7px 2px rgba(255,213,74,.8);
  bottom:-10px; animation: rsRise linear infinite; }
@keyframes rsRise { 0% { transform: translate3d(0,0,0); opacity:0;} 15% { opacity:.95;} 100% { transform: translate3d(var(--dx),-85vh,0); opacity:0;} }
.rs-petal { width:8px; height:5px; border-radius:80% 20% 80% 20%; background:var(--pc, #fda4af);
  top:-12px; opacity:.85; animation: rsPetalFall linear infinite; }
@keyframes rsPetalFall { 0% { transform: translate3d(0,0,0) rotate(0deg); opacity:0; } 15% { opacity:.9; } 100% { transform: translate3d(var(--dx), 88vh, 0) rotate(320deg); opacity:0; } }

/* 🌅 Sun / moon glow pulse */
.rs-glow { width:46vmin; height:46vmin; border-radius:50%; animation: rsGlow 6s ease-in-out infinite alternate; }
@keyframes rsGlow { from { opacity:.45; transform:scale(.94);} to { opacity:.85; transform:scale(1.06);} }
`;

const rnd = (a, b) => a + Math.random() * (b - a);

const THEME_CFG = {
  coast:    { clouds: 4, cloud: 'rgba(255,255,255,.95)', birds: 4, river: true, flags: ['#ef4444', '#fbbf24'] },
  sunset:   { clouds: 3, cloud: 'rgba(255,170,110,.88)', birds: 3, river: true, sparks: 10, flags: ['#f97316', '#fde047'], glow: 'radial-gradient(circle, rgba(255,160,60,.58), transparent 65%)', glowPos: { right: '-8vmin', top: '16%' } },
  palace:   { clouds: 3, cloud: 'rgba(235,215,255,.92)', birds: 3, motes: 12, petals: '#fda4af', flags: ['#9333ea', '#fde047'], glow: 'radial-gradient(circle, rgba(232,121,249,.35), transparent 65%)', glowPos: { left: '12%', top: '6%' } },
  night:    { stars: 24, shoot: true, flies: 8, flags: ['#38bdf8', '#818cf8'], glow: 'radial-gradient(circle, rgba(170,200,255,.38), transparent 65%)', glowPos: { left: '-6vmin', top: '4%' } },
  tropical: { clouds: 4, cloud: 'rgba(255,255,255,.94)', birds: 5, river: true, petals: '#6ee7b7', flags: ['#10b981', '#fde047'] },
  empire:   { clouds: 3, cloud: 'rgba(255,230,150,.88)', birds: 2, sparks: 18, flags: ['#dc2626', '#ffd700'], glow: 'radial-gradient(circle, rgba(255,215,0,.45), transparent 65%)', glowPos: { right: '8%', top: '8%' } },
};

class LiveBackground {
  constructor() {
    this.root = null;
    this.theme = null;
    this.enabled = true; // Always enabled by default
    this.lite = false;
    this._listeners = [];
    this._init();
  }

  _init() {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;
    this.enabled = true;
    this.lite = (typeof navigator !== 'undefined') &&
      ((navigator.deviceMemory && navigator.deviceMemory <= 2) || (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2));

    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);

    document.addEventListener('visibilitychange', () => {
      this.root?.classList.toggle('rs-paused', document.hidden);
    });
  }

  _ensureRoot() {
    if (this.root) return this.root;
    const container = document.getElementById('game-container');
    if (!container) return null;
    this.root = document.createElement('div');
    this.root.id = 'live-bg';
    container.insertBefore(this.root, container.firstChild);
    return this.root;
  }

  setTheme(theme = 'coast') {
    this.theme = theme;
    this._build();
  }

  isEnabled() { return this.enabled; }

  setEnabled(on) {
    this.enabled = !!on;
    this._build(true);
    this._listeners.forEach(fn => { try { fn(this.enabled); } catch (_) {} });
    return this.enabled;
  }

  toggle() { return this.setEnabled(!this.enabled); }

  onChange(fn) {
    if (typeof fn === 'function') this._listeners.push(fn);
  }

  _build(force = false) {
    const root = this._ensureRoot();
    if (!root) return;
    if (!force && root.dataset.theme === this.theme && root.dataset.on === String(this.enabled)) return;
    root.dataset.theme = this.theme;
    root.dataset.on = String(this.enabled);
    root.innerHTML = '';
    if (!this.enabled) return;

    const cfg = THEME_CFG[this.theme] || THEME_CFG.coast;
    const k = this.lite ? 0.5 : 1;
    const n = (v) => Math.max(1, Math.round((v || 0) * k));
    const frag = document.createDocumentFragment();
    const add = (cls, styles = {}, inner = '') => {
      const el = document.createElement('div');
      el.className = cls;
      Object.assign(el.style, styles);
      if (inner) el.innerHTML = inner;
      frag.appendChild(el);
      return el;
    };

    if (cfg.glow) {
      add('rs-glow', { background: cfg.glow, ...cfg.glowPos });
    }
    if (cfg.river) {
      add('rs-river');
    }
    if (cfg.flags) {
      const f1 = add('rs-flag-wrap', { left: '7%', bottom: '32%' }, '<div class="rs-flag-pole"></div><div class="rs-flag-cloth"></div>');
      f1.style.setProperty('--fc1', cfg.flags[0]);
      f1.style.setProperty('--fc2', cfg.flags[1]);
      const f2 = add('rs-flag-wrap', { right: '7%', bottom: '32%' }, '<div class="rs-flag-pole"></div><div class="rs-flag-cloth"></div>');
      f2.style.setProperty('--fc1', cfg.flags[0]);
      f2.style.setProperty('--fc2', cfg.flags[1]);
    }
    for (let i = 0; cfg.clouds && i < n(cfg.clouds); i++) {
      const dur = rnd(65, 120);
      const el = add('rs-cloud', {
        top: `${rnd(3, 28)}%`,
        width: `${rnd(180, 340)}px`,
        animationDuration: `${dur}s`,
        animationDelay: `-${rnd(0, dur)}s`,
        opacity: rnd(0.55, 0.9),
      });
      el.style.setProperty('--c', cfg.cloud);
    }
    for (let i = 0; cfg.birds && i < n(cfg.birds); i++) {
      const dur = rnd(24, 44);
      add('rs-bird', {
        top: `${rnd(8, 32)}%`,
        animationDuration: `${dur}s`,
        animationDelay: `-${rnd(0, dur)}s`,
        transform: `scale(${rnd(0.7, 1.2)})`,
      }, '<i></i>');
    }
    for (let i = 0; cfg.stars && i < n(cfg.stars); i++) {
      add('rs-star', {
        left: `${rnd(2, 98)}%`, top: `${rnd(2, 45)}%`,
        animationDuration: `${rnd(2, 5)}s`, animationDelay: `-${rnd(0, 5)}s`,
      });
    }
    if (cfg.shoot) add('rs-shoot');
    for (let i = 0; cfg.flies && i < n(cfg.flies); i++) {
      const el = add('rs-fly', {
        left: `${rnd(5, 95)}%`, top: `${rnd(50, 88)}%`,
        animationDuration: `${rnd(4, 8)}s`, animationDelay: `-${rnd(0, 6)}s`,
      });
      el.style.setProperty('--dx', `${rnd(-40, 40)}px`);
      el.style.setProperty('--dy', `${rnd(-50, 10)}px`);
    }
    for (let i = 0; cfg.sparks && i < n(cfg.sparks); i++) {
      const dur = rnd(7, 14);
      const el = add('rs-gold', {
        left: `${rnd(2, 98)}%`,
        animationDuration: `${dur}s`, animationDelay: `-${rnd(0, dur)}s`,
      });
      el.style.setProperty('--dx', `${rnd(-60, 60)}px`);
    }
    for (let i = 0; cfg.motes && i < n(cfg.motes); i++) {
      const dur = rnd(10, 18);
      const el = add('rs-gold', {
        left: `${rnd(2, 98)}%`, background: '#f5d0fe',
        boxShadow: '0 0 7px 2px rgba(245,208,254,.8)',
        animationDuration: `${dur}s`, animationDelay: `-${rnd(0, dur)}s`,
      });
      el.style.setProperty('--dx', `${rnd(-50, 50)}px`);
    }
    if (cfg.petals) {
      for (let i = 0; i < n(8); i++) {
        const dur = rnd(9, 16);
        const el = add('rs-petal', {
          left: `${rnd(5, 95)}%`,
          animationDuration: `${dur}s`, animationDelay: `-${rnd(0, dur)}s`,
        });
        el.style.setProperty('--pc', cfg.petals);
        el.style.setProperty('--dx', `${rnd(40, 140)}px`);
      }
    }
    root.appendChild(frag);
    root.classList.toggle('rs-paused', document.hidden);
  }
}

export const liveBg = new LiveBackground();
if (typeof window !== 'undefined') {
  window.RSLiveBg = liveBg;
}
