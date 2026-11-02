/**
 * audio.js — Web Audio API procedural sounds
 * No audio files needed — all synthesised in real-time
 */
export class AudioManager {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.enabled = false;
  }

  async init() {
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.75;
      this.masterGain.connect(this.ctx.destination);
      this.enabled = true;
    } catch (e) {
      console.warn('[Audio] Web Audio API unavailable:', e.message);
    }
  }

  resume() {
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
  }

  _noise(duration, cutoff = 800) {
    if (!this.enabled) return;
    const samples = Math.floor(this.ctx.sampleRate * duration);
    const buf = this.ctx.createBuffer(1, samples, this.ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < samples; i++) data[i] = Math.random() * 2 - 1;

    const src = this.ctx.createBufferSource();
    src.buffer = buf;

    const flt = this.ctx.createBiquadFilter();
    flt.type = 'lowpass';
    flt.frequency.value = cutoff;

    src.connect(flt);
    return { src, flt };
  }

  /* ── Mechanical Aiming Ratchet Tick ── */
  playTick() {
    if (!this.enabled) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(680, t);
    osc.frequency.exponentialRampToValueAtTime(320, t + 0.03);
    g.gain.setValueAtTime(0.09, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.03);
    osc.connect(g); g.connect(this.masterGain);
    osc.start(t); osc.stop(t + 0.03);
  }

  /* ── Cannon fire: deep boom + noise burst ── */
  playCannonFire() {
    if (!this.enabled) return;
    const t = this.ctx.currentTime;

    // Sub boom
    const osc1 = this.ctx.createOscillator();
    const g1 = this.ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(90, t);
    osc1.frequency.exponentialRampToValueAtTime(18, t + 0.55);
    g1.gain.setValueAtTime(1.2, t);
    g1.gain.exponentialRampToValueAtTime(0.001, t + 0.55);
    osc1.connect(g1); g1.connect(this.masterGain);
    osc1.start(t); osc1.stop(t + 0.55);

    // Noise burst
    const n = this._noise(0.28, 500);
    if (n) {
      const gn = this.ctx.createGain();
      gn.gain.setValueAtTime(0.9, t);
      gn.gain.exponentialRampToValueAtTime(0.001, t + 0.28);
      n.flt.connect(gn); gn.connect(this.masterGain);
      n.src.start(t);
    }
  }

  /* ── Metal can clank ── */
  playCanHit(velocity = 1.0) {
    if (!this.enabled) return;
    const t = this.ctx.currentTime;
    const vol = Math.min(1, velocity / 8);

    const freq = 280 + Math.random() * 180;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, t);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.55, t + 0.18);
    g.gain.setValueAtTime(vol * 0.6, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
    osc.connect(g); g.connect(this.masterGain);
    osc.start(t); osc.stop(t + 0.18);

    // High-freq metallic ping
    const osc2 = this.ctx.createOscillator();
    const g2 = this.ctx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.value = freq * 3.2;
    g2.gain.setValueAtTime(vol * 0.25, t);
    g2.gain.exponentialRampToValueAtTime(0.001, t + 0.09);
    osc2.connect(g2); g2.connect(this.masterGain);
    osc2.start(t); osc2.stop(t + 0.09);
  }

  /* ── Victory fanfare ── */
  playVictory() {
    if (!this.enabled) return;
    const notes = [523, 659, 784, 1047, 1319];
    const t = this.ctx.currentTime;
    notes.forEach((freq, i) => {
      const delay = t + i * 0.11;
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.value = freq;
      g.gain.setValueAtTime(0, delay);
      g.gain.linearRampToValueAtTime(0.4, delay + 0.04);
      g.gain.exponentialRampToValueAtTime(0.001, delay + 0.5);
      osc.connect(g); g.connect(this.masterGain);
      osc.start(delay); osc.stop(delay + 0.5);
    });
  }

  /* ── Fail / lose ── */
  playFail() {
    if (!this.enabled) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(250, t);
    osc.frequency.linearRampToValueAtTime(70, t + 0.6);
    g.gain.setValueAtTime(0.35, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.6);
    osc.connect(g); g.connect(this.masterGain);
    osc.start(t); osc.stop(t + 0.6);
  }

  /* ── Combo whoosh ── */
  playCombo() {
    if (!this.enabled) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(200, t);
    osc.frequency.exponentialRampToValueAtTime(1000, t + 0.25);
    g.gain.setValueAtTime(0.3, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
    osc.connect(g); g.connect(this.masterGain);
    osc.start(t); osc.stop(t + 0.3);
  }

  /* ── Bomb explosion sound ── */
  playExplosion() {
    if (!this.enabled) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(160, t);
    osc.frequency.exponentialRampToValueAtTime(25, t + 0.7);
    g.gain.setValueAtTime(1.5, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.7);
    osc.connect(g); g.connect(this.masterGain);
    osc.start(t); osc.stop(t + 0.7);

    const n = this._noise(0.6, 600);
    if (n) {
      const gn = this.ctx.createGain();
      gn.gain.setValueAtTime(1.2, t);
      gn.gain.exponentialRampToValueAtTime(0.001, t + 0.6);
      n.flt.connect(gn); gn.connect(this.masterGain);
      n.src.start(t);
    }
  }

  /* ── Dramatic Gold Jackpot Chime (Ascending crystalline bell) ── */
  playGoldChime(step = 0, total = 8) {
    if (!this.enabled) return;
    const t = this.ctx.currentTime;
    // Ascending pentatonic/harmonic frequencies for rewarding jackpot progression
    const baseFreqs = [523.25, 587.33, 659.25, 783.99, 880.00, 1046.50, 1174.66, 1318.51, 1567.98];
    const freq = baseFreqs[step % baseFreqs.length] * (1 + Math.floor(step / baseFreqs.length) * 0.5);

    // Primary bell tone
    const osc1 = this.ctx.createOscillator();
    const g1 = this.ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(freq, t);

    g1.gain.setValueAtTime(0, t);
    g1.gain.linearRampToValueAtTime(0.45, t + 0.015);
    g1.gain.exponentialRampToValueAtTime(0.001, t + 0.45);

    osc1.connect(g1);
    g1.connect(this.masterGain);
    osc1.start(t);
    osc1.stop(t + 0.45);

    // High sparkle shimmer harmonic
    const osc2 = this.ctx.createOscillator();
    const g2 = this.ctx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(freq * 2.76, t);

    g2.gain.setValueAtTime(0, t);
    g2.gain.linearRampToValueAtTime(0.2, t + 0.01);
    g2.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

    osc2.connect(g2);
    g2.connect(this.masterGain);
    osc2.start(t);
    osc2.stop(t + 0.25);
  }

  /* ── Crisp Coin Clink (HUD Wallet arrival) ── */
  playCoinClink() {
    if (!this.enabled) return;
    const t = this.ctx.currentTime;
    const freq = 1800 + Math.random() * 400;

    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, t);
    osc.frequency.exponentialRampToValueAtTime(freq * 1.5, t + 0.08);

    g.gain.setValueAtTime(0.3, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

    osc.connect(g);
    g.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.08);
  }

  /* ── Comic Punch sound for custom target hit ── */
  playComicPunch() {
    if (!this.enabled) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(320, t);
    osc.frequency.exponentialRampToValueAtTime(80, t + 0.2);
    g.gain.setValueAtTime(0.8, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
    osc.connect(g); g.connect(this.masterGain);
    osc.start(t); osc.stop(t + 0.2);
  }

  /* ── Grand Palace Conquered Fanfare & Royal Trumpets ── */
  playPalaceFanfare() {
    if (!this.enabled) return;
    const t = this.ctx.currentTime;

    // Triumphant Brass Chord Arpeggio
    const chords = [
      [523.25, 659.25, 783.99], // C Major
      [587.33, 739.99, 880.00], // D Major
      [659.25, 830.61, 987.77], // E Major
      [783.99, 987.77, 1174.66, 1567.98] // High Grand C
    ];

    chords.forEach((chord, step) => {
      const stepTime = t + step * 0.22;
      chord.forEach(freq => {
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, stepTime);

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(2400, stepTime);

        g.gain.setValueAtTime(0, stepTime);
        g.gain.linearRampToValueAtTime(0.22, stepTime + 0.04);
        g.gain.exponentialRampToValueAtTime(0.001, stepTime + (step === 3 ? 1.4 : 0.35));

        osc.connect(filter);
        filter.connect(g);
        g.connect(this.masterGain);
        osc.start(stepTime);
        osc.stop(stepTime + (step === 3 ? 1.4 : 0.35));
      });
    });

    // Crowd cheering ambient roar (filtered pink noise swell)
    const n = this._noise(2.8, 1400);
    if (n) {
      const gn = this.ctx.createGain();
      gn.gain.setValueAtTime(0.01, t + 0.3);
      gn.gain.linearRampToValueAtTime(0.35, t + 0.9);
      gn.gain.exponentialRampToValueAtTime(0.001, t + 2.8);
      n.flt.connect(gn);
      gn.connect(this.masterGain);
      n.src.start(t + 0.3);
    }
  }

  /* ── Mute Toggle ── */
  setMuted(muted) {
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(muted ? 0 : 0.75, this.ctx.currentTime);
    }
  }

  /* ── Slipper (Chappal) Slap Sound ── */
  playSlap() {
    if (!this.enabled) return;
    const t = this.ctx.currentTime;
    // Crisp snappy high-frequency crack + hollow flesh/rubber thwack
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(540, t);
    osc.frequency.exponentialRampToValueAtTime(120, t + 0.12);
    g.gain.setValueAtTime(0.95, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
    osc.connect(g); g.connect(this.masterGain);
    osc.start(t); osc.stop(t + 0.12);

    const n = this._noise(0.09, 2600);
    if (n) {
      const gn = this.ctx.createGain();
      gn.gain.setValueAtTime(0.85, t);
      gn.gain.exponentialRampToValueAtTime(0.001, t + 0.09);
      n.flt.connect(gn); gn.connect(this.masterGain);
      n.src.start(t);
    }
  }

  /* ── Combat Boot Heavy Stomp ── */
  playStomp() {
    if (!this.enabled) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(140, t);
    osc.frequency.exponentialRampToValueAtTime(25, t + 0.32);
    g.gain.setValueAtTime(1.1, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.32);
    osc.connect(g); g.connect(this.masterGain);
    osc.start(t); osc.stop(t + 0.32);

    const n = this._noise(0.25, 450);
    if (n) {
      const gn = this.ctx.createGain();
      gn.gain.setValueAtTime(0.9, t);
      gn.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
      n.flt.connect(gn); gn.connect(this.masterGain);
      n.src.start(t);
    }
  }

  /* ── Hydro Splash Water Burst ── */
  playSplash() {
    if (!this.enabled) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(480, t);
    osc.frequency.exponentialRampToValueAtTime(90, t + 0.28);
    g.gain.setValueAtTime(0.8, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.28);
    osc.connect(g); g.connect(this.masterGain);
    osc.start(t); osc.stop(t + 0.28);

    const n = this._noise(0.35, 1200);
    if (n) {
      const gn = this.ctx.createGain();
      gn.gain.setValueAtTime(0.01, t);
      gn.gain.linearRampToValueAtTime(0.7, t + 0.04);
      gn.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
      n.flt.connect(gn); gn.connect(this.masterGain);
      n.src.start(t);
    }
  }

  /* ── MIRV Cluster Rocket Launch & Sparkle Multi-Boom ── */
  playClusterLaunch() {
    if (!this.enabled) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, t);
    osc.frequency.exponentialRampToValueAtTime(720, t + 0.35);
    g.gain.setValueAtTime(0.6, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
    osc.connect(g); g.connect(this.masterGain);
    osc.start(t); osc.stop(t + 0.35);
  }

  playSparkleBoom() {
    if (!this.enabled) return;
    this.playExplosion();
    const t = this.ctx.currentTime;
    // Twinkling sparkle chime bursts
    [1200, 1500, 1800, 2200, 2600].forEach((freq, idx) => {
      const dt = idx * 0.04;
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t + dt);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.3, t + dt + 0.12);
      g.gain.setValueAtTime(0.3, t + dt);
      g.gain.exponentialRampToValueAtTime(0.001, t + dt + 0.12);
      osc.connect(g); g.connect(this.masterGain);
      osc.start(t + dt); osc.stop(t + dt + 0.12);
    });
  }
}

