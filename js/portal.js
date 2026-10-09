/**
 * ==========================================================================
 * VARNAMS INTERACTIVE — PORTAL SCRIPT
 * Countdown Engine, Sovereign Audio, Interactive Visitor Mini-Game (Royal Blitz)
 * & Stealth Studio Management
 * ==========================================================================
 */

// 1. SYNTHESIZED AUDIO SYSTEM (Web Audio API)
class RoyalAudio {
  constructor() {
    this.ctx = null;
    this.enabled = localStorage.getItem('varnams_sound') !== 'false';
  }

  init() {
    if (!this.ctx && (window.AudioContext || window.webkitAudioContext)) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
  }

  playTone(freq, duration = 0.08, type = 'sine', vol = 0.05) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx || this.ctx.state === 'suspended') return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      gain.gain.setValueAtTime(vol, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch(e) {}
  }

  playCannon() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx || this.ctx.state === 'suspended') return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.exponentialRampToValueAtTime(45, now + 0.18);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(now + 0.18);
    } catch(e) {}
  }

  playHit() {
    this.playTone(380, 0.04, 'sine', 0.04);
  }

  playExplosion() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx || this.ctx.state === 'suspended') return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(260, now);
      osc.frequency.exponentialRampToValueAtTime(30, now + 0.22);
      gain.gain.setValueAtTime(0.09, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(now + 0.22);
    } catch(e) {}
  }

  playVictory() {
    if (!this.enabled) return;
    [440, 554, 659, 880].forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 0.15, 'triangle', 0.08), i * 90);
    });
  }

  playSlideWhistle() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx || this.ctx.state === 'suspended') return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(260, now);
      osc.frequency.exponentialRampToValueAtTime(980, now + 0.35);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(now + 0.35);
    } catch(e) {}
  }

  playRocketThrust() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx || this.ctx.state === 'suspended') return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.linearRampToValueAtTime(50, now + 0.7);
      gain.gain.setValueAtTime(0.11, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(now + 0.7);
    } catch(e) {}
  }

  playSpringBoing() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx || this.ctx.state === 'suspended') return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(650, now);
      osc.frequency.exponentialRampToValueAtTime(280, now + 0.28);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(now + 0.28);
    } catch(e) {}
  }

  playSqueak() {
    this.playTone(720, 0.08, 'triangle', 0.06);
  }

  toggle() {
    this.enabled = !this.enabled;
    localStorage.setItem('varnams_sound', this.enabled);
    return this.enabled;
  }
}

const royalAudio = new RoyalAudio();

// 3. GLOBAL LAUNCH COUNTDOWN ENGINE
function initCountdown() {
  // Target Launch Date: 48 days from current local baseline
  const launchDate = new Date();
  launchDate.setDate(launchDate.getDate() + 48);
  launchDate.setHours(18, 0, 0, 0);

  const daysEl = document.getElementById('days-val');
  const hoursEl = document.getElementById('hours-val');
  const minsEl = document.getElementById('mins-val');
  const secsEl = document.getElementById('secs-val');

  function update() {
    const now = new Date().getTime();
    const distance = launchDate.getTime() - now;

    if (distance < 0) {
      if (daysEl) daysEl.textContent = '00';
      if (hoursEl) hoursEl.textContent = '00';
      if (minsEl) minsEl.textContent = '00';
      if (secsEl) secsEl.textContent = '00';
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    if (daysEl) daysEl.textContent = String(days).padStart(2, '0');
    if (hoursEl) hoursEl.textContent = String(hours).padStart(2, '0');
    if (minsEl) minsEl.textContent = String(minutes).padStart(2, '0');
    if (secsEl) secsEl.textContent = String(seconds).padStart(2, '0');
  }

  update();
  setInterval(update, 1000);
}

// 4. FUNNY CARTOON MISSILE LAUNCHPAD CONTROLLER
function initFunnyMissileLaunchpad() {
  const deck = document.getElementById('launchpad-deck');
  const fireBtn = document.getElementById('btn-fire-missile');
  const speechEl = document.getElementById('mascot-speech');
  const mascotEl = document.getElementById('mascot-operator');
  const missileEl = document.getElementById('wobbly-missile');
  const smokeContainer = document.getElementById('launch-smoke-fx');

  if (!deck || !fireBtn) return;

  const funnyQuotes = [
    "T-minus 48 days... or until someone hits that red button!",
    "Warning: Missile fuel is 90% energy drinks & 10% adrenaline!",
    "Wait, did anyone check if the fins are taped on tight?!",
    "Don't press the red button! ...Okay fine, maybe just once!",
    "Target coordinates locked: Straight into the stratosphere!",
    "Houston, we don't have a problem, we have a PARTY!",
    "I swear the blueprints were drawn in crayon!",
    "Aiming for the Moon... hope I don't hit a satellite dish!",
    "Safety inspection status: Passed with flying colors (mostly yellow)!",
    "Hold onto your socks! The countdown is ticking!"
  ];

  const launchScreams = [
    "WHOA HOLD ON TO YOUR PANTS!!",
    "BLASTOOOOOFFFFF! BYE BYE MISSILE!",
    "I DIDN'T DO IT! IT WAS LIKE THAT!",
    "SEEEE YA IN ORBIT, SUCKEEEERS!",
    "WHEEEEEEEEEEE! THAT TICKLES!"
  ];

  const reloadQuotes = [
    "Phew! Fresh missile reloaded. Want another go?",
    "That was AWESOME! Let's do it again!",
    "BOING! Another Acme V-100 locked and loaded!",
    "Still 48 days left... plenty of time for test launches!"
  ];

  let currentQuoteIdx = 0;
  let isLaunching = false;

  function cycleSpeech(text) {
    if (!speechEl) return;
    speechEl.style.animation = 'none';
    speechEl.offsetHeight; // trigger reflow
    speechEl.textContent = text || funnyQuotes[currentQuoteIdx % funnyQuotes.length];
    speechEl.style.animation = 'bubblePop 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
  }

  // Periodic funny quotes
  setInterval(() => {
    if (!isLaunching) {
      currentQuoteIdx++;
      cycleSpeech();
    }
  }, 7500);

  // Click mascot to talk
  if (mascotEl) {
    mascotEl.addEventListener('click', () => {
      if (isLaunching) return;
      royalAudio.playSqueak();
      currentQuoteIdx++;
      cycleSpeech();
    });
  }

  // Helper to spawn smoke puff particles
  function spawnSmokePuff(xOffset = 0) {
    if (!smokeContainer) return;
    const puff = document.createElement('div');
    puff.className = 'smoke-burst-puff';
    const size = 18 + Math.random() * 24;
    puff.style.width = `${size}px`;
    puff.style.height = `${size}px`;
    puff.style.left = `calc(50% + ${xOffset}px)`;
    puff.style.bottom = '0px';
    puff.style.setProperty('--tx', `${(Math.random() - 0.5) * 60}px`);
    puff.style.setProperty('--ty', `-${40 + Math.random() * 45}px`);
    smokeContainer.appendChild(puff);
    setTimeout(() => puff.remove(), 950);
  }

  // Launch Sequence
  function triggerLaunch() {
    if (isLaunching) return;
    isLaunching = true;
    fireBtn.disabled = true;

    // 1. Ignition & Violent Rattle Phase
    deck.classList.add('is-preparing');
    cycleSpeech(launchScreams[Math.floor(Math.random() * launchScreams.length)]);
    royalAudio.playSlideWhistle();

    // Spawn rapid smoke puffs
    const smokeInterval = setInterval(() => {
      spawnSmokePuff((Math.random() - 0.5) * 40);
    }, 80);

    setTimeout(() => {
      // 2. Blastoff Phase!
      clearInterval(smokeInterval);
      deck.classList.remove('is-preparing');
      deck.classList.add('is-flying');
      royalAudio.playRocketThrust();
      showToast('🚀 Acme V-100 launched into orbit!', '💥');

      // Heavy smoke burst at launchpad
      for (let i = 0; i < 8; i++) {
        setTimeout(() => spawnSmokePuff((Math.random() - 0.5) * 60), i * 35);
      }

      // 3. Reload Phase
      setTimeout(() => {
        deck.classList.remove('is-flying');
        deck.classList.add('is-reloading');
        royalAudio.playSpringBoing();

        setTimeout(() => {
          deck.classList.remove('is-reloading');
          isLaunching = false;
          fireBtn.disabled = false;
          cycleSpeech(reloadQuotes[Math.floor(Math.random() * reloadQuotes.length)]);
        }, 950);
      }, 1400);

    }, 850);
  }

  fireBtn.addEventListener('click', triggerLaunch);
  if (missileEl) {
    missileEl.addEventListener('click', triggerLaunch);
  }
}

// 6. VISITOR MINI-GAME: VARNAMS ROYAL BLITZ (CORE DEMOLITION)
class RoyalBlitzGame {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');

    this.score = 0;
    this.highScore = parseInt(localStorage.getItem('varnams_blitz_high') || '0', 10);
    this.combo = 0;
    this.active = false;

    this.balls = [];
    this.blocks = [];
    this.particles = [];
    this.floatingScores = [];

    this.cannonPos = { x: 0, y: 0 };
    this.aimAngle = -Math.PI / 2;
    this.isAiming = false;

    this.init();
  }

  init() {
    this.resize();
    window.addEventListener('resize', () => this.resize());

    // Aim & Shoot event listeners
    this.canvas.addEventListener('mousemove', (e) => this.onAim(e));
    this.canvas.addEventListener('touchmove', (e) => this.onTouchAim(e), { passive: false });
    this.canvas.addEventListener('click', (e) => this.fire(e));
    this.canvas.addEventListener('touchend', (e) => this.onTouchFire(e));

    this.updateHUD();
    this.loop();
  }

  resize() {
    const rect = this.canvas.parentElement.getBoundingClientRect();
    this.canvas.width = rect.width;
    this.canvas.height = rect.height;
    this.cannonPos = { x: this.canvas.width / 2, y: this.canvas.height - 20 };
  }

  onAim(e) {
    const rect = this.canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    this.aimAngle = Math.atan2(mouseY - this.cannonPos.y, mouseX - this.cannonPos.x);
    // Limit cannon pointing upwards
    if (this.aimAngle > -0.2) this.aimAngle = -0.2;
    if (this.aimAngle < -Math.PI + 0.2) this.aimAngle = -Math.PI + 0.2;
  }

  onTouchAim(e) {
    e.preventDefault();
    if (!e.touches[0]) return;
    const rect = this.canvas.getBoundingClientRect();
    const touchX = e.touches[0].clientX - rect.left;
    const touchY = e.touches[0].clientY - rect.top;
    this.aimAngle = Math.atan2(touchY - this.cannonPos.y, touchX - this.cannonPos.x);
    if (this.aimAngle > -0.2) this.aimAngle = -0.2;
    if (this.aimAngle < -Math.PI + 0.2) this.aimAngle = -Math.PI + 0.2;
  }

  onTouchFire(e) {
    this.fire(e);
  }

  start() {
    this.score = 0;
    this.combo = 0;
    this.active = true;
    this.balls = [];
    this.blocks = [];
    this.particles = [];
    this.floatingScores = [];

    document.getElementById('minigame-overlay').classList.add('hidden');
    this.spawnBlockRow();
    this.spawnBlockRow();
    this.updateHUD();
  }

  spawnBlockRow() {
    const cols = 5;
    const margin = 20;
    const blockWidth = (this.canvas.width - margin * 2 - (cols - 1) * 10) / cols;
    const blockHeight = 32;

    // Shift existing blocks down
    for (let b of this.blocks) {
      b.y += blockHeight + 10;
      if (b.y > this.canvas.height - 70) {
        this.gameOver();
        return;
      }
    }

    for (let i = 0; i < cols; i++) {
      if (Math.random() > 0.3) {
        const hp = Math.floor(Math.random() * 8) + 4;
        this.blocks.push({
          x: margin + i * (blockWidth + 10),
          y: 45,
          width: blockWidth,
          height: blockHeight,
          hp: hp,
          maxHp: hp,
          isMultiplier: Math.random() < 0.2
        });
      }
    }
  }

  fire(e) {
    if (!this.active) return;
    // Don't fire if already multiple active balls in flight
    if (this.balls.length > 3) return;

    royalAudio.playCannon();

    const speed = 9;
    this.balls.push({
      x: this.cannonPos.x,
      y: this.cannonPos.y - 10,
      vx: Math.cos(this.aimAngle) * speed,
      vy: Math.sin(this.aimAngle) * speed,
      radius: 6,
      color: '#fbbf24'
    });
  }

  gameOver() {
    this.active = false;
    royalAudio.playExplosion();
    const overlay = document.getElementById('minigame-overlay');
    overlay.classList.remove('hidden');

    const title = document.getElementById('overlay-title');
    const desc = document.getElementById('overlay-desc');
    const btn = document.getElementById('overlay-start-btn');

    if (this.score >= 300) {
      royalAudio.playVictory();
      title.textContent = '👑 VIP CLEARANCE UNLOCKED!';
      desc.textContent = `Magnificent! Score: ${this.score}. You have proven worthy of Sovereign early access.`;
      btn.textContent = 'Play Again';
      showToast('ROYAL VIP ACCESS PASS UNLOCKED!', '👑');
    } else {
      title.textContent = 'DEFENSE BREACHED';
      desc.textContent = `Score: ${this.score}. Aim for the high score of 300 to unlock exclusive VIP testing clearance!`;
      btn.textContent = 'Try Again';
    }
  }

  updateHUD() {
    const scoreEl = document.getElementById('hud-score-val');
    const highEl = document.getElementById('hud-high-val');
    const comboEl = document.getElementById('hud-combo-val');

    if (scoreEl) scoreEl.textContent = this.score;
    if (highEl) highEl.textContent = this.highScore;
    if (comboEl) comboEl.textContent = `x${Math.max(1, this.combo)}`;
  }

  loop() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw Aim Line
    if (this.active) {
      this.ctx.save();
      this.ctx.beginPath();
      this.ctx.setLineDash([6, 6]);
      this.ctx.moveTo(this.cannonPos.x, this.cannonPos.y);
      this.ctx.lineTo(
        this.cannonPos.x + Math.cos(this.aimAngle) * 90,
        this.cannonPos.y + Math.sin(this.aimAngle) * 90
      );
      this.ctx.strokeStyle = 'rgba(251, 191, 36, 0.6)';
      this.ctx.lineWidth = 2;
      this.ctx.stroke();
      this.ctx.restore();
    }

    // Draw Cannon
    this.ctx.save();
    this.ctx.translate(this.cannonPos.x, this.cannonPos.y);
    this.ctx.rotate(this.aimAngle + Math.PI / 2);
    // Barrel
    this.ctx.fillStyle = '#f59e0b';
    this.ctx.fillRect(-6, -26, 12, 26);
    // Base
    this.ctx.beginPath();
    this.ctx.arc(0, 0, 16, 0, Math.PI * 2);
    this.ctx.fillStyle = '#0f172a';
    this.ctx.fill();
    this.ctx.strokeStyle = '#fbbf24';
    this.ctx.lineWidth = 2.5;
    this.ctx.stroke();
    this.ctx.restore();

    // Update & Draw Balls
    for (let i = this.balls.length - 1; i >= 0; i--) {
      let b = this.balls[i];
      b.x += b.vx;
      b.y += b.vy;

      // Wall collisions
      if (b.x - b.radius < 0) {
        b.x = b.radius;
        b.vx *= -1;
        royalAudio.playHit();
      } else if (b.x + b.radius > this.canvas.width) {
        b.x = this.canvas.width - b.radius;
        b.vx *= -1;
        royalAudio.playHit();
      }

      if (b.y - b.radius < 0) {
        b.y = b.radius;
        b.vy *= -1;
        royalAudio.playHit();
      }

      // Ball fell out at bottom
      if (b.y > this.canvas.height + 20) {
        this.balls.splice(i, 1);
        if (this.balls.length === 0) {
          this.combo = 0;
          this.spawnBlockRow();
          this.updateHUD();
        }
        continue;
      }

      // Block collisions
      for (let j = this.blocks.length - 1; j >= 0; j--) {
        let block = this.blocks[j];
        if (
          b.x + b.radius > block.x &&
          b.x - b.radius < block.x + block.width &&
          b.y + b.radius > block.y &&
          b.y - b.radius < block.y + block.height
        ) {
          b.vy *= -1;
          block.hp -= 1;
          this.combo++;
          const points = 10 * Math.min(this.combo, 5);
          this.score += points;

          if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('varnams_blitz_high', this.highScore);
          }

          royalAudio.playHit();

          // Spawn particle sparks
          for (let p = 0; p < 5; p++) {
            this.particles.push({
              x: b.x,
              y: b.y,
              vx: (Math.random() - 0.5) * 4,
              vy: (Math.random() - 0.5) * 4,
              radius: Math.random() * 2.5 + 1,
              life: 1,
              color: block.isMultiplier ? '#00f2fe' : '#fbbf24'
            });
          }

          // Floating score text
          this.floatingScores.push({
            x: block.x + block.width / 2,
            y: block.y,
            text: `+${points}`,
            life: 1
          });

          if (block.hp <= 0) {
            royalAudio.playExplosion();
            this.blocks.splice(j, 1);
            // Shatter particles
            for (let p = 0; p < 14; p++) {
              this.particles.push({
                x: block.x + block.width / 2,
                y: block.y + block.height / 2,
                vx: (Math.random() - 0.5) * 6,
                vy: (Math.random() - 0.5) * 6,
                radius: Math.random() * 3 + 1.5,
                life: 1,
                color: '#f59e0b'
              });
            }
          }

          this.updateHUD();
          break;
        }
      }

      // Draw Ball
      this.ctx.beginPath();
      this.ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
      this.ctx.fillStyle = b.color;
      this.ctx.shadowColor = '#fbbf24';
      this.ctx.shadowBlur = 10;
      this.ctx.fill();
      this.ctx.shadowBlur = 0;
    }

    // Draw Blocks
    for (let block of this.blocks) {
      this.ctx.save();
      const ratio = block.hp / block.maxHp;
      this.ctx.fillStyle = block.isMultiplier ? 'rgba(0, 242, 254, 0.2)' : `rgba(245, 158, 11, ${0.15 + ratio * 0.45})`;
      this.ctx.strokeStyle = block.isMultiplier ? '#00f2fe' : '#fbbf24';
      this.ctx.lineWidth = 1.5;

      this.ctx.fillRect(block.x, block.y, block.width, block.height);
      this.ctx.strokeRect(block.x, block.y, block.width, block.height);

      // Block HP label
      this.ctx.font = 'bold 12px "JetBrains Mono", monospace';
      this.ctx.fillStyle = '#fff';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText(block.isMultiplier ? '⚡ x2' : block.hp, block.x + block.width / 2, block.y + block.height / 2);
      this.ctx.restore();
    }

    // Update & Draw Particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      let p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= 0.035;

      if (p.life <= 0) {
        this.particles.splice(i, 1);
        continue;
      }

      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.radius * p.life, 0, Math.PI * 2);
      this.ctx.fillStyle = p.color;
      this.ctx.globalAlpha = p.life;
      this.ctx.fill();
      this.ctx.globalAlpha = 1;
    }

    // Floating Points
    for (let i = this.floatingScores.length - 1; i >= 0; i--) {
      let fs = this.floatingScores[i];
      fs.y -= 0.8;
      fs.life -= 0.03;

      if (fs.life <= 0) {
        this.floatingScores.splice(i, 1);
        continue;
      }

      this.ctx.font = 'bold 12px "Space Grotesk", sans-serif';
      this.ctx.fillStyle = `rgba(251, 191, 36, ${fs.life})`;
      this.ctx.textAlign = 'center';
      this.ctx.fillText(fs.text, fs.x, fs.y);
    }

    requestAnimationFrame(() => this.loop());
  }
}

// 7. TOAST NOTIFICATION SYSTEM
function showToast(msg, icon = '👑') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<span>${icon}</span> <span>${msg}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(12px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3800);
}

// 8. BACKGROUND CONSTELLATION CANVAS
function initAmbientCanvas() {
  const canvas = document.getElementById('ambient-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let width, height;
  let particles = [];
  const count = 40;

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  for (let i = 0; i < count; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      radius: Math.random() * 2 + 1,
      alpha: Math.random() * 0.35 + 0.1
    });
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);

    for (let i = 0; i < count; i++) {
      let p = particles[i];
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0) p.x = width;
      if (p.x > width) p.x = 0;
      if (p.y < 0) p.y = height;
      if (p.y > height) p.y = 0;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(245, 158, 11, ${p.alpha})`;
      ctx.fill();

      for (let j = i + 1; j < count; j++) {
        let p2 = particles[j];
        let dx = p.x - p2.x;
        let dy = p.y - p2.y;
        let dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 120) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = `rgba(245, 158, 11, ${(1 - dist / 120) * 0.1})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(draw);
  }

  requestAnimationFrame(draw);
}

// 9. INITIALIZE ON LOAD
document.addEventListener('DOMContentLoaded', () => {
  initAmbientCanvas();
  initCountdown();
  initFunnyMissileLaunchpad();

  // Initialize Visitor Mini-Game
  const blitzGame = new RoyalBlitzGame('minigame-canvas');
  window.startBlitz = () => blitzGame.start();

  const startBtn = document.getElementById('overlay-start-btn');
  if (startBtn) {
    startBtn.addEventListener('click', () => {
      royalAudio.playTone(600, 0.1);
      blitzGame.start();
    });
  }

  // Audio Toggle
  const soundBtn = document.getElementById('sound-toggle-btn');
  if (soundBtn) {
    soundBtn.textContent = royalAudio.enabled ? '🔊' : '🔇';
    soundBtn.addEventListener('click', () => {
      const enabled = royalAudio.toggle();
      soundBtn.textContent = enabled ? '🔊' : '🔇';
      showToast(enabled ? 'Royal Audio Enabled' : 'Royal Audio Muted', enabled ? '🔊' : '🔇');
    });
  }

  // Theme Toggle
  const themeBtn = document.getElementById('theme-toggle-btn');
  if (themeBtn) {
    const saved = localStorage.getItem('varnams_theme') || 'dark';
    document.documentElement.setAttribute('data-theme', saved);
    themeBtn.textContent = saved === 'light' ? '🌙' : '☀️';

    themeBtn.addEventListener('click', () => {
      royalAudio.playTone(400, 0.06);
      const curr = document.documentElement.getAttribute('data-theme');
      const next = curr === 'light' ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('varnams_theme', next);
      themeBtn.textContent = next === 'light' ? '🌙' : '☀️';
      showToast(`Switched to ${next} sovereign mode`, next === 'light' ? '☀️' : '🌙');
    });
  }

  // VIP Section Signup
  const vipForm = document.getElementById('vip-form');
  if (vipForm) {
    vipForm.addEventListener('submit', (e) => {
      e.preventDefault();
      royalAudio.playVictory();
      const email = document.getElementById('vip-email').value;
      showToast(`Welcome to VARNAMS Sovereign Council, ${email}!`, '👑');
      vipForm.reset();
    });
  }
});
