/**
 * textures.js — High-Definition Procedural Canvas Textures for Royal Smash 3D
 * Recreates the exact, authentic art style of Cypher Games' "Royal Smash!":
 * - Authentic Silver Royal Cans with double gold battlement crenellations and purple cutouts
 * - Royal Purple Fleur-de-lis lacquer with embossed gold crest
 * - Orange & White 14-blade Candy Pinwheel discs
 * - Glossy Pink Peppermint Candy cylinders
 * - Metallic Silver-Blue Gemstone Beams with ruby gems
 * - Feathered warm sandy-ochre dirt arena texture
 * - Vibrant stylized cartoon grass
 * - Luxury Gilded Boss Portrait Frame
 */
import * as THREE from 'three';

class TextureGenerator {
  constructor() {
    this._cache = {};
  }

  // ─── 1. Authentic Silver Royal Can Body Texture ─────────────────────────────
  // Matches WhatsApp Image 2026-09-22 at 21.44.57.jpeg (Level 20 screenshot)
  getSilverRoyalCanTexture() {
    if (this._cache.silverCan) return this._cache.silverCan;
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // 1. Brushed Silver-Blue Metallic Base
    const bgGrad = ctx.createLinearGradient(0, 0, 512, 0);
    bgGrad.addColorStop(0.00, '#b0c4de');
    bgGrad.addColorStop(0.18, '#d8e6f4');
    bgGrad.addColorStop(0.35, '#ffffff'); // bright specular sheen
    bgGrad.addColorStop(0.55, '#c5d8ea');
    bgGrad.addColorStop(0.80, '#9eb8d4');
    bgGrad.addColorStop(1.00, '#b0c4de');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 512, 512);

    // Subtle horizontal can rib reflections
    ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.fillRect(0, 180, 512, 12);
    ctx.fillRect(0, 320, 512, 12);
    ctx.fillStyle = 'rgba(70, 90, 120, 0.22)';
    ctx.fillRect(0, 192, 512, 8);
    ctx.fillRect(0, 332, 512, 8);

    // 2. Helper to draw Golden Battlement / Crenellated Crown Band with purple cutouts
    const drawCrownBand = (yBase, isFlipped = false) => {
      const bandH = 80;
      const numTeeth = 8;
      const toothW = 512 / numTeeth;

      // Solid Gold Background of the band
      const goldGrad = ctx.createLinearGradient(0, yBase, 0, yBase + bandH);
      goldGrad.addColorStop(0.0, '#ffe875');
      goldGrad.addColorStop(0.3, '#ffcc00');
      goldGrad.addColorStop(0.7, '#d49b00');
      goldGrad.addColorStop(1.0, '#9e6d00');
      ctx.fillStyle = goldGrad;
      ctx.fillRect(0, yBase, 512, bandH);

      // Gold highlight lines
      ctx.fillStyle = '#fff6b0';
      ctx.fillRect(0, isFlipped ? yBase + bandH - 5 : yBase, 512, 5);

      // Castellated purple notches
      for (let i = 0; i < numTeeth; i++) {
        const x = i * toothW;
        const notchW = toothW * 0.46;
        const notchH = bandH * 0.48;
        const notchX = x + (toothW - notchW) / 2;
        const notchY = isFlipped ? yBase : yBase + bandH - notchH;

        // Dark violet/purple cutout
        ctx.fillStyle = '#3a0066';
        ctx.fillRect(notchX, notchY, notchW, notchH);

        // Gold border stroke around cutout
        ctx.strokeStyle = '#fff088';
        ctx.lineWidth = 3;
        ctx.strokeRect(notchX, notchY, notchW, notchH);
      }
    };

    // Top Crown Band (around y=35)
    drawCrownBand(35, false);

    // Bottom Crown Band (around y=395)
    drawCrownBand(395, true);

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    this._cache.silverCan = tex;
    return tex;
  }

  // ─── 2. Royal Fleur-de-lis Can Body Texture ─────────────────────────────────
  // Matches WhatsApp Image 2026-09-22 at 21.45.14.jpeg (Level 19 screenshot)
  getFleurCanTexture() {
    if (this._cache.fleurCan) return this._cache.fleurCan;
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Royal Purple Enamel Cylinder Base
    const grad = ctx.createLinearGradient(0, 0, 512, 0);
    grad.addColorStop(0.0, '#4a0072');
    grad.addColorStop(0.2, '#7b1fa2');
    grad.addColorStop(0.4, '#aa00ff');
    grad.addColorStop(0.6, '#7b1fa2');
    grad.addColorStop(1.0, '#38006b');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 512);

    // Top & Bottom Gold Filigree Bands
    [40, 420].forEach(y => {
      const g = ctx.createLinearGradient(0, y, 0, y + 45);
      g.addColorStop(0, '#fff4a3');
      g.addColorStop(0.5, '#ffd700');
      g.addColorStop(1, '#b38600');
      ctx.fillStyle = g;
      ctx.fillRect(0, y, 512, 45);
      ctx.fillStyle = '#ffeaa7';
      ctx.fillRect(0, y + 4, 512, 6);
    });

    // 2 Repeated Embossed Gold Fleur-de-lis in Center (front and back of cylinder)
    [128, 384].forEach(cx => {
      ctx.save();
      ctx.translate(cx, 256);
      ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
      ctx.shadowBlur = 16;
      ctx.shadowOffsetY = 6;
      this._drawFleurShape(ctx, '#ffd700', '#b38600', '#fff8b3', 0.65);
      ctx.restore();
    });

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    this._cache.fleurCan = tex;
    return tex;
  }

  // ─── 2B. Signature Royal Blue Crown Can Body Texture ────────────────────────
  // Matches authentic Cypher Games' Royal Smash hero blue can from bg_reference.jpg
  getRoyalBlueCanTexture() {
    if (this._cache.royalBlueCan) return this._cache.royalBlueCan;
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Rich Cobalt / Royal Blue Gloss Cylinder
    const grad = ctx.createLinearGradient(0, 0, 512, 0);
    grad.addColorStop(0.0, '#1565c0');
    grad.addColorStop(0.2, '#1e88e5');
    grad.addColorStop(0.38, '#42a5f5'); // specular highlight
    grad.addColorStop(0.55, '#1e88e5');
    grad.addColorStop(0.85, '#0d47a1');
    grad.addColorStop(1.0, '#1565c0');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 512);

    // Top & Bottom Gold Filigree Bands
    [40, 420].forEach(y => {
      const g = ctx.createLinearGradient(0, y, 0, y + 45);
      g.addColorStop(0, '#fff4a3');
      g.addColorStop(0.5, '#ffd700');
      g.addColorStop(1, '#b38600');
      ctx.fillStyle = g;
      ctx.fillRect(0, y, 512, 45);
      ctx.fillStyle = '#ffeaa7';
      ctx.fillRect(0, y + 4, 512, 6);
    });

    // 2 Repeated Stamped Golden Crown Crests (front and back of cylinder)
    [128, 384].forEach(cx => {
      ctx.save();
      ctx.translate(cx, 256);
      ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
      ctx.shadowBlur = 14;
      ctx.shadowOffsetY = 6;
      ctx.fillStyle = '#ffd700';
      ctx.beginPath();
      ctx.moveTo(-50, 20);
      ctx.lineTo(-65, -30);
      ctx.lineTo(-24, -10);
      ctx.lineTo(0, -45);
      ctx.lineTo(24, -10);
      ctx.lineTo(65, -30);
      ctx.lineTo(50, 20);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#b38600';
      ctx.lineWidth = 4;
      ctx.stroke();
      // Jewels on crown
      ctx.fillStyle = '#ff1744';
      ctx.beginPath(); ctx.arc(0, -5, 6, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = '#00e676';
      ctx.beginPath(); ctx.arc(-28, -2, 5, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(28, -2, 5, 0, Math.PI*2); ctx.fill();
      ctx.restore();
    });

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    this._cache.royalBlueCan = tex;
    return tex;
  }

  // ─── 2C. Jade / Emerald Royal Can (for World 5 Tropical Atoll) ─────────────
  getJadeCanTexture() {
    if (this._cache.jadeCan) return this._cache.jadeCan;
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    const grad = ctx.createLinearGradient(0, 0, 512, 0);
    grad.addColorStop(0.0, '#004d40');
    grad.addColorStop(0.2, '#00897b');
    grad.addColorStop(0.4, '#26a69a');
    grad.addColorStop(0.6, '#00897b');
    grad.addColorStop(1.0, '#00332c');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 512);

    [40, 420].forEach(y => {
      ctx.fillStyle = '#ffd700';
      ctx.fillRect(0, y, 512, 45);
      ctx.fillStyle = '#fff9c4';
      ctx.fillRect(0, y + 4, 512, 6);
    });

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    this._cache.jadeCan = tex;
    return tex;
  }

  // ─── 2D. Obsidian / Midnight Cyan Can (for World 4 Moonlit Cove) ───────────
  getObsidianCanTexture() {
    if (this._cache.obsidianCan) return this._cache.obsidianCan;
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    const grad = ctx.createLinearGradient(0, 0, 512, 0);
    grad.addColorStop(0.0, '#0a192f');
    grad.addColorStop(0.2, '#172a45');
    grad.addColorStop(0.4, '#203a5f');
    grad.addColorStop(0.6, '#172a45');
    grad.addColorStop(1.0, '#050c18');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 512);

    [40, 420].forEach(y => {
      ctx.fillStyle = '#00e5ff';
      ctx.fillRect(0, y, 512, 45);
      ctx.fillStyle = '#e0f7fa';
      ctx.fillRect(0, y + 4, 512, 6);
    });

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    this._cache.obsidianCan = tex;
    return tex;
  }

  // ─── 3. Pink Candy Peppermint Can Body ──────────────────────────────────────
  getPinkCanTexture() {
    if (this._cache.pinkCan) return this._cache.pinkCan;
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Glossy Bubblegum / Magenta Gradient
    const grad = ctx.createLinearGradient(0, 0, 512, 0);
    grad.addColorStop(0.0, '#c2185b');
    grad.addColorStop(0.3, '#ff4081');
    grad.addColorStop(0.45, '#ffffff'); // bright glossy shine
    grad.addColorStop(0.6, '#ff4081');
    grad.addColorStop(1.0, '#880e4f');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 512);

    // Top & Bottom Candy-Stripe Bands
    [30, 430].forEach(yBase => {
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, yBase, 512, 50);
      ctx.clip();

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, yBase, 512, 50);

      // 45-degree pink candy stripes
      ctx.fillStyle = '#ff1744';
      for (let x = -50; x < 600; x += 32) {
        ctx.beginPath();
        ctx.moveTo(x, yBase);
        ctx.lineTo(x + 20, yBase);
        ctx.lineTo(x - 10, yBase + 50);
        ctx.lineTo(x - 30, yBase + 50);
        ctx.closePath();
        ctx.fill();
      }

      // Gold bounding borders
      ctx.fillStyle = '#ffd700';
      ctx.fillRect(0, yBase, 512, 5);
      ctx.fillRect(0, yBase + 45, 512, 5);
      ctx.restore();
    });

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    this._cache.pinkCan = tex;
    return tex;
  }

  // ─── 4. Orange & White Candy Pinwheel Disc ─────────────────────────────────
  getPinwheelTexture() {
    if (this._cache.pinwheel) return this._cache.pinwheel;
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    const cx = 256, cy = 256, R = 240;

    // Background circle
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();

    // 14 alternating radial candy segments
    const segments = 14;
    const angleStep = (Math.PI * 2) / segments;
    for (let i = 0; i < segments; i++) {
      if (i % 2 === 0) {
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, R, i * angleStep, (i + 1) * angleStep);
        ctx.closePath();
        const grad = ctx.createRadialGradient(cx, cy, 20, cx, cy, R);
        grad.addColorStop(0, '#ffaa00');
        grad.addColorStop(0.7, '#ff6d00');
        grad.addColorStop(1, '#dd2c00');
        ctx.fillStyle = grad;
        ctx.fill();
      }
    }

    // Outer thick gold rim
    ctx.lineWidth = 26;
    ctx.strokeStyle = '#ffd700';
    ctx.beginPath();
    ctx.arc(cx, cy, R - 13, 0, Math.PI * 2);
    ctx.stroke();

    // Inner gold ring
    ctx.lineWidth = 6;
    ctx.strokeStyle = '#ffeaa7';
    ctx.beginPath();
    ctx.arc(cx, cy, R - 32, 0, Math.PI * 2);
    ctx.stroke();

    // Center candy dome
    const centerGrad = ctx.createRadialGradient(cx - 15, cy - 15, 10, cx, cy, 70);
    centerGrad.addColorStop(0, '#ffffff');
    centerGrad.addColorStop(0.5, '#ffd700');
    centerGrad.addColorStop(1, '#d48806');
    ctx.fillStyle = centerGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, 64, 0, Math.PI * 2);
    ctx.fill();

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    this._cache.pinwheel = tex;
    return tex;
  }

  // ─── 5. Royal Fleur-de-lis Cube Texture ────────────────────────────────────
  getFleurDeLisTexture() {
    if (this._cache.fleur) return this._cache.fleur;
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Royal purple enamel base with radial gradient
    const grad = ctx.createRadialGradient(256, 256, 50, 256, 256, 280);
    grad.addColorStop(0, '#6a0dad');
    grad.addColorStop(0.7, '#3c0060');
    grad.addColorStop(1, '#1f0033');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 512);

    // Subtle diamond quilted royal pattern
    ctx.strokeStyle = 'rgba(255, 215, 0, 0.12)';
    ctx.lineWidth = 2.5;
    const step = 48;
    for (let x = -512; x < 1024; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x + 512, 512);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x, 512);
      ctx.lineTo(x + 512, 0);
      ctx.stroke();
    }

    // Outer thick gold border
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 28;
    ctx.strokeRect(14, 14, 484, 484);

    // Inner gold pin-stripe
    ctx.strokeStyle = '#fff275';
    ctx.lineWidth = 6;
    ctx.strokeRect(36, 36, 440, 440);

    // 4 Corner Gold Studs
    [[40, 40], [472, 40], [40, 472], [472, 472]].forEach(([cx, cy]) => {
      ctx.fillStyle = '#ffd700';
      ctx.beginPath();
      ctx.arc(cx, cy, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(cx - 3, cy - 3, 5, 0, Math.PI * 2);
      ctx.fill();
    });

    // 3D Embossed Gold Fleur-de-lis in Center
    ctx.save();
    ctx.translate(256, 260);
    ctx.shadowColor = 'rgba(0, 0, 0, 0.75)';
    ctx.shadowBlur = 24;
    ctx.shadowOffsetY = 12;
    this._drawFleurShape(ctx, '#ffd700', '#b38600', '#fff8b3', 1.0);
    ctx.restore();

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    this._cache.fleur = tex;
    return tex;
  }

  _drawFleurShape(ctx, fillPrimary, shadowColor, highlightColor, scale = 1.0) {
    ctx.save();
    ctx.scale(scale, scale);

    // Center tall petal
    ctx.fillStyle = fillPrimary;
    ctx.beginPath();
    ctx.moveTo(0, -140);
    ctx.bezierCurveTo(40, -100, 50, -40, 0, 30);
    ctx.bezierCurveTo(-50, -40, -40, -100, 0, -140);
    ctx.fill();

    // Center petal highlight
    ctx.fillStyle = highlightColor;
    ctx.beginPath();
    ctx.moveTo(0, -135);
    ctx.bezierCurveTo(15, -100, 18, -40, 0, 20);
    ctx.bezierCurveTo(-5, -40, -5, -100, 0, -135);
    ctx.fill();

    // Left curved petal
    ctx.fillStyle = fillPrimary;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(-60, -30, -110, -80, -95, -120);
    ctx.bezierCurveTo(-75, -135, -45, -100, -30, -50);
    ctx.bezierCurveTo(-30, 0, 0, 15, 0, 15);
    ctx.closePath();
    ctx.fill();

    // Right curved petal
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(60, -30, 110, -80, 95, -120);
    ctx.bezierCurveTo(75, -135, 45, -100, 30, -50);
    ctx.bezierCurveTo(30, 0, 0, 15, 0, 15);
    ctx.closePath();
    ctx.fill();

    // Horizontal gold collar band
    ctx.fillStyle = '#ffae00';
    ctx.fillRect(-65, 15, 130, 24);
    ctx.fillStyle = highlightColor;
    ctx.fillRect(-65, 15, 130, 6);

    // Bottom base pedestal of fleur
    ctx.fillStyle = fillPrimary;
    ctx.beginPath();
    ctx.moveTo(-45, 40);
    ctx.lineTo(45, 40);
    ctx.bezierCurveTo(30, 85, -30, 85, -45, 40);
    ctx.fill();

    ctx.restore();
  }

  // ─── 6. Generic Can Body (for backward compatibility) ─────────────────────
  getCanBodyTexture(theme = 'silver') {
    if (theme === 'silver' || theme === 'blue') return this.getSilverRoyalCanTexture();
    if (theme === 'purple') return this.getFleurCanTexture();
    if (theme === 'pink') return this.getPinkCanTexture();
    return this.getSilverRoyalCanTexture();
  }

  // ─── 7. Feathered Warm Sandy Dirt Arena Ring Texture ───────────────────────
  // Recreates the circular dirt ground patch under the pedestal from screenshots
  getDirtArenaTexture() {
    if (this._cache.dirtRing) return this._cache.dirtRing;
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    const cx = 256, cy = 256;

    // Radial gradient from warm golden dirt to transparent grass edge
    const grad = ctx.createRadialGradient(cx, cy, 30, cx, cy, 250);
    grad.addColorStop(0.0, 'rgba(196, 142, 60, 1.0)');  // Warm rich dirt
    grad.addColorStop(0.55, 'rgba(180, 126, 48, 0.95)');
    grad.addColorStop(0.80, 'rgba(150, 105, 38, 0.60)');
    grad.addColorStop(0.95, 'rgba(110, 80, 25, 0.15)');
    grad.addColorStop(1.0, 'rgba(80, 60, 20, 0.0)');   // Completely transparent
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 512);

    // Fine organic pebble & dirt grain noise
    for (let i = 0; i < 600; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = Math.sqrt(Math.random()) * 220;
      const px = cx + Math.cos(angle) * r;
      const py = cy + Math.sin(angle) * r;
      const size = 1.5 + Math.random() * 3.5;
      ctx.fillStyle = Math.random() > 0.4 ? 'rgba(235, 185, 95, 0.4)' : 'rgba(100, 65, 20, 0.35)';
      ctx.beginPath();
      ctx.arc(px, py, size, 0, Math.PI * 2);
      ctx.fill();
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    this._cache.dirtRing = tex;
    return tex;
  }

  // ─── 8. Stylized Lush Cartoon Grass Texture ────────────────────────────────
  getStylizedGrassTexture() {
    if (this._cache.grass) return this._cache.grass;
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Vibrant emerald green base matching the scenic background
    ctx.fillStyle = '#4fa82d';
    ctx.fillRect(0, 0, 512, 512);

    // Clumps of stylized cartoon grass blades
    for (let i = 0; i < 1200; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      const len = 10 + Math.random() * 18;
      ctx.strokeStyle = Math.random() > 0.5 ? '#7ad33b' : '#33851b';
      ctx.lineWidth = 2 + Math.random() * 2.5;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.quadraticCurveTo(x + (Math.random() - 0.5) * 8, y - len * 0.5, x + (Math.random() - 0.5) * 10, y - len);
      ctx.stroke();
    }

    // Little buttercup flowers
    for (let i = 0; i < 35; i++) {
      const fx = Math.random() * 512;
      const fy = Math.random() * 512;
      ctx.fillStyle = Math.random() > 0.5 ? '#ffeb3b' : '#ffffff';
      ctx.beginPath();
      ctx.arc(fx, fy, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(16, 16);
    tex.colorSpace = THREE.SRGBColorSpace;
    this._cache.grass = tex;
    return tex;
  }

  // ─── 9. Luxury Gilded Portrait Frame for Boss Mode ─────────────────────────
  createGildedBossCanvas(photoCanvas, targetName = 'THE BOSS') {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Deep royal crimson velvet background
    const bg = ctx.createRadialGradient(256, 256, 40, 256, 256, 320);
    bg.addColorStop(0, '#800020');
    bg.addColorStop(0.7, '#4a0011');
    bg.addColorStop(1, '#200008');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, 512, 512);

    // Outer Baroque Gold Frame
    ctx.lineWidth = 16;
    ctx.strokeStyle = '#ffd700';
    ctx.strokeRect(8, 8, 496, 496);

    ctx.lineWidth = 4;
    ctx.strokeStyle = '#fff1a8';
    ctx.strokeRect(18, 18, 476, 476);

    // Draw photo prominent and crystal-clear in center (filling ~90% of frame)
    if (photoCanvas) {
      ctx.save();
      const pSize = 460;
      const px = (512 - pSize) / 2;
      const py = (512 - pSize) / 2;

      ctx.beginPath();
      ctx.roundRect(px, py, pSize, pSize, 14);
      ctx.clip();

      const sw = photoCanvas.width;
      const sh = photoCanvas.height;
      const minD = Math.min(sw, sh);
      const sx = (sw - minD) / 2;
      const sy = (sh - minD) / 2;
      ctx.drawImage(photoCanvas, sx, sy, minD, minD, px, py, pSize, pSize);
      ctx.restore();

      ctx.lineWidth = 6;
      ctx.strokeStyle = '#ffd700';
      ctx.beginPath();
      ctx.roundRect(px, py, pSize, pSize, 14);
      ctx.stroke();
    }

    return canvas;
  }

  // ─── 11. World-Themed Structure Textures ────────────────────────────────────

  // Coastal Weathered Timber Wood Plank (512x512)
  getTimberTexture() {
    if (this._cache.timber) return this._cache.timber;
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Warm oak base
    const grad = ctx.createLinearGradient(0, 0, 512, 0);
    grad.addColorStop(0.0, '#78350f');
    grad.addColorStop(0.3, '#92400e');
    grad.addColorStop(0.7, '#b45309');
    grad.addColorStop(1.0, '#78350f');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 512);

    // 4 horizontal wooden planks
    const plankH = 512 / 4;
    for (let i = 0; i < 4; i++) {
      const y = i * plankH;
      // Plank wood grain lines
      ctx.strokeStyle = 'rgba(69, 26, 3, 0.45)';
      ctx.lineWidth = 2;
      for (let g = 0; g < 6; g++) {
        ctx.beginPath();
        const gy = y + 15 + g * 16;
        ctx.moveTo(0, gy);
        ctx.bezierCurveTo(150, gy + (g % 2 ? 6 : -6), 350, gy + (g % 2 ? -6 : 6), 512, gy);
        ctx.stroke();
      }
      // Seam between planks
      ctx.fillStyle = '#291003';
      ctx.fillRect(0, y + plankH - 4, 512, 5);
      ctx.fillStyle = 'rgba(254, 215, 170, 0.25)';
      ctx.fillRect(0, y, 512, 2);

      // Iron nail heads on each plank end
      [32, 480].forEach(nx => {
        ctx.beginPath();
        ctx.arc(nx, y + plankH / 2, 8, 0, Math.PI * 2);
        ctx.fillStyle = '#334155';
        ctx.fill();
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 2;
        ctx.stroke();
      });
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    this._cache.timber = tex;
    return tex;
  }

  // Coastal Pirate Oak Rum Barrel Staves & Iron Hoops (512x512)
  getBarrelTexture() {
    if (this._cache.barrel) return this._cache.barrel;
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Rich dark oak wood
    const grad = ctx.createLinearGradient(0, 0, 512, 0);
    grad.addColorStop(0.0, '#582a0a');
    grad.addColorStop(0.5, '#78350f');
    grad.addColorStop(1.0, '#582a0a');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 512);

    // Vertical barrel staves
    const staves = 8;
    const staveW = 512 / staves;
    for (let i = 0; i < staves; i++) {
      const x = i * staveW;
      ctx.fillStyle = 'rgba(30, 10, 2, 0.45)';
      ctx.fillRect(x, 0, 3, 512);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
      ctx.fillRect(x + 3, 0, 2, 512);
    }

    // Heavy iron hoops (top, middle, bottom)
    const hoops = [40, 220, 420];
    hoops.forEach(hy => {
      const hGrad = ctx.createLinearGradient(0, hy, 0, hy + 38);
      hGrad.addColorStop(0, '#64748b');
      hGrad.addColorStop(0.5, '#334155');
      hGrad.addColorStop(1, '#0f172a');
      ctx.fillStyle = hGrad;
      ctx.fillRect(0, hy, 512, 38);

      // Gold/brass rivets
      for (let r = 0; r < 8; r++) {
        const rx = r * staveW + staveW / 2;
        ctx.beginPath();
        ctx.arc(rx, hy + 19, 5, 0, Math.PI * 2);
        ctx.fillStyle = '#f59e0b';
        ctx.fill();
        ctx.strokeStyle = '#78350f';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
    });

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    this._cache.barrel = tex;
    return tex;
  }

  // Sunset Terracotta Clay Bricks (512x512)
  getTerracottaTexture() {
    if (this._cache.terracotta) return this._cache.terracotta;
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Sandstone mortar background
    ctx.fillStyle = '#d6c7b2';
    ctx.fillRect(0, 0, 512, 512);

    // Terracotta brick rows
    const rows = 8;
    const rowH = 512 / rows;
    for (let r = 0; r < rows; r++) {
      const y = r * rowH;
      const offset = (r % 2) * (512 / 8);
      const cols = 5;
      const colW = 512 / 4;
      for (let c = -1; c < cols; c++) {
        const x = c * colW + offset;
        // Brick grad
        const bGrad = ctx.createLinearGradient(x, y, x + colW, y + rowH);
        bGrad.addColorStop(0, '#ea580c');
        bGrad.addColorStop(0.5, '#c2410c');
        bGrad.addColorStop(1, '#9a3412');
        ctx.fillStyle = bGrad;
        ctx.fillRect(x + 4, y + 4, colW - 8, rowH - 8);

        // Highlight top/left
        ctx.fillStyle = 'rgba(254, 215, 170, 0.35)';
        ctx.fillRect(x + 5, y + 5, colW - 10, 3);
        ctx.fillRect(x + 5, y + 5, 3, rowH - 10);
      }
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    this._cache.terracotta = tex;
    return tex;
  }

  // Sunset Hammered Bronze / Copper Urn (512x512)
  getBronzeUrnTexture() {
    if (this._cache.bronzeUrn) return this._cache.bronzeUrn;
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Rich radial bronze metallic grad
    const bGrad = ctx.createLinearGradient(0, 0, 512, 0);
    bGrad.addColorStop(0.0, '#7c2d12');
    bGrad.addColorStop(0.2, '#c2410c');
    bGrad.addColorStop(0.5, '#fdba74'); // fiery copper sheen
    bGrad.addColorStop(0.8, '#9a3412');
    bGrad.addColorStop(1.0, '#7c2d12');
    ctx.fillStyle = bGrad;
    ctx.fillRect(0, 0, 512, 512);

    // Sunburst medallion center
    ctx.save();
    ctx.translate(256, 256);
    ctx.strokeStyle = '#fef08a';
    ctx.lineWidth = 3;
    for (let a = 0; a < 16; a++) {
      ctx.rotate((Math.PI * 2) / 16);
      ctx.beginPath();
      ctx.moveTo(35, 0);
      ctx.lineTo(75, 0);
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.arc(0, 0, 32, 0, Math.PI * 2);
    ctx.fillStyle = '#f59e0b';
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // Top & bottom Greek fret border
    ctx.fillStyle = '#fde68a';
    ctx.fillRect(0, 40, 512, 12);
    ctx.fillRect(0, 460, 512, 12);

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    this._cache.bronzeUrn = tex;
    return tex;
  }

  // Palace White Marble with Golden Veins (512x512)
  getMarbleTexture() {
    if (this._cache.marble) return this._cache.marble;
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Polished ivory base
    const grad = ctx.createLinearGradient(0, 0, 512, 512);
    grad.addColorStop(0, '#f8fafc');
    grad.addColorStop(0.5, '#e2e8f0');
    grad.addColorStop(1, '#cbd5e1');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 512);

    // Delicate golden & violet veins
    ctx.strokeStyle = 'rgba(217, 119, 6, 0.45)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(20, 0);
    ctx.bezierCurveTo(120, 180, 220, 240, 310, 512);
    ctx.moveTo(180, 0);
    ctx.bezierCurveTo(240, 150, 420, 280, 500, 400);
    ctx.moveTo(0, 320);
    ctx.bezierCurveTo(140, 340, 280, 420, 400, 512);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(124, 58, 237, 0.25)';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(380, 0);
    ctx.bezierCurveTo(340, 210, 160, 310, 100, 512);
    ctx.stroke();

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    this._cache.marble = tex;
    return tex;
  }

  // Night Mystic Obsidian with Glowing Neon Runes (512x512)
  getObsidianRuneTexture() {
    if (this._cache.obsidianRune) return this._cache.obsidianRune;
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Volcanic deep obsidian black
    ctx.fillStyle = '#09090b';
    ctx.fillRect(0, 0, 512, 512);

    // Subtle dark purple crystal facets
    ctx.fillStyle = '#18181b';
    ctx.beginPath();
    ctx.moveTo(0, 0); ctx.lineTo(320, 0); ctx.lineTo(180, 512); ctx.lineTo(0, 512);
    ctx.fill();

    // Glowing cyan/amethyst runes
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 12;
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 4;

    // Center rune diamond
    ctx.strokeRect(180, 180, 152, 152);
    ctx.beginPath();
    ctx.moveTo(256, 130); ctx.lineTo(382, 256); ctx.lineTo(256, 382); ctx.lineTo(130, 256); ctx.closePath();
    ctx.stroke();

    // Rune corner accents
    ctx.strokeStyle = '#c084fc';
    ctx.shadowColor = '#c084fc';
    [[60, 60], [452, 60], [60, 452], [452, 452]].forEach(([rx, ry]) => {
      ctx.strokeRect(rx - 20, ry - 20, 40, 40);
    });

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    this._cache.obsidianRune = tex;
    return tex;
  }

  // Tropical Bamboo Woven Crate (512x512)
  getBambooTexture() {
    if (this._cache.bamboo) return this._cache.bamboo;
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Jungle green background
    ctx.fillStyle = '#064e3b';
    ctx.fillRect(0, 0, 512, 512);

    // Cross-hatched bamboo strips
    const strips = 10;
    const step = 512 / strips;
    for (let i = 0; i < strips; i++) {
      const p = i * step;
      // Horizontal bamboo
      const bGradH = ctx.createLinearGradient(0, p, 0, p + step);
      bGradH.addColorStop(0, '#a3e635');
      bGradH.addColorStop(0.5, '#65a30d');
      bGradH.addColorStop(1, '#3f6212');
      ctx.fillStyle = bGradH;
      ctx.fillRect(0, p + 4, 512, step - 8);

      // Vertical bamboo (alternating weave)
      const bGradV = ctx.createLinearGradient(p, 0, p + step, 0);
      bGradV.addColorStop(0, '#bef264');
      bGradV.addColorStop(0.5, '#84cc16');
      bGradV.addColorStop(1, '#4d7c0f');
      ctx.fillStyle = bGradV;
      ctx.fillRect(p + 4, 0, step - 8, 512);
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    this._cache.bamboo = tex;
    return tex;
  }

  // Empire Heavy Riveted Iron Vault Plate (512x512)
  getIronVaultTexture() {
    if (this._cache.ironVault) return this._cache.ironVault;
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Brushed gunmetal base
    const grad = ctx.createLinearGradient(0, 0, 512, 512);
    grad.addColorStop(0.0, '#334155');
    grad.addColorStop(0.3, '#475569');
    grad.addColorStop(0.7, '#1e293b');
    grad.addColorStop(1.0, '#0f172a');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 512);

    // Inset beveled border
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 4;
    ctx.strokeRect(24, 24, 464, 464);
    ctx.strokeStyle = '#020617';
    ctx.lineWidth = 3;
    ctx.strokeRect(30, 30, 452, 452);

    // Heavy perimeter bolts
    const numBolts = 6;
    const bStep = 464 / (numBolts - 1);
    for (let b = 0; b < numBolts; b++) {
      const p = 24 + b * bStep;
      [[p, 24], [p, 488], [24, p], [488, p]].forEach(([bx, by]) => {
        ctx.beginPath();
        ctx.arc(bx, by, 7, 0, Math.PI * 2);
        ctx.fillStyle = '#f59e0b'; // golden hex bolts
        ctx.fill();
        ctx.strokeStyle = '#78350f';
        ctx.lineWidth = 2;
        ctx.stroke();
      });
    }

    // Sovereign Crown Inscription in center
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.moveTo(216, 280); ctx.lineTo(296, 280); ctx.lineTo(312, 230);
    ctx.lineTo(276, 255); ctx.lineTo(256, 215); ctx.lineTo(236, 255); ctx.lineTo(200, 230);
    ctx.closePath();
    ctx.fill();

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    this._cache.ironVault = tex;
    return tex;
  }

  // ─── 10. Real-time PBR Normal Map Generator for 3D Sculpted Boss Medallions ───
  generateNormalMap(sourceCanvas, strength = 3.2) {
    if (!sourceCanvas) return null;
    const w = sourceCanvas.width;
    const h = sourceCanvas.height;
    const srcCtx = sourceCanvas.getContext('2d');
    const srcImg = srcCtx.getImageData(0, 0, w, h);
    const srcData = srcImg.data;

    const normCanvas = document.createElement('canvas');
    normCanvas.width = w;
    normCanvas.height = h;
    const normCtx = normCanvas.getContext('2d');
    const normImg = normCtx.createImageData(w, h);
    const normData = normImg.data;

    const lum = (x, y) => {
      const cx = Math.max(0, Math.min(w - 1, x));
      const cy = Math.max(0, Math.min(h - 1, y));
      const idx = (cy * w + cx) * 4;
      return (srcData[idx] * 0.299 + srcData[idx + 1] * 0.587 + srcData[idx + 2] * 0.114) / 255.0;
    };

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const tl = lum(x - 1, y - 1);
        const t  = lum(x,     y - 1);
        const tr = lum(x + 1, y - 1);
        const l  = lum(x - 1, y);
        const r  = lum(x + 1, y);
        const bl = lum(x - 1, y + 1);
        const b  = lum(x,     y + 1);
        const br = lum(x + 1, y + 1);

        const dX = (tr + 2.0 * r + br) - (tl + 2.0 * l + bl);
        const dY = (bl + 2.0 * b + br) - (tl + 2.0 * t + tr);

        let nx = -dX * strength;
        let ny = -dY * strength;
        let nz = 1.0;
        const len = Math.hypot(nx, ny, nz);
        nx /= len; ny /= len; nz /= len;

        const outIdx = (y * w + x) * 4;
        normData[outIdx]     = Math.floor((nx * 0.5 + 0.5) * 255);
        normData[outIdx + 1] = Math.floor((ny * 0.5 + 0.5) * 255);
        normData[outIdx + 2] = Math.floor((nz * 0.5 + 0.5) * 255);
        normData[outIdx + 3] = 255;
      }
    }

    normCtx.putImageData(normImg, 0, 0);
    return normCanvas;
  }
}

export const textureGen = new TextureGenerator();
