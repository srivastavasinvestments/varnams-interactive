/**
 * custom_target.js — AI / Custom Photo Target Processor & 3D Putla (Bust) Generator
 * Features:
 * - Automated Face-Till-Neck detection and extraction
 * - 3D Sculpted Effigy / Putla texture generation
 * - High-res Big Mosaic Medallion slicing (2x2, 3x2, 3x3)
 * - Mini Boss Block & Can badges for multi-block boss mode structures
 */
import * as THREE from 'three';
import { textureGen } from './textures.js';

class CustomTargetManager {
  constructor() {
    this.active = false;
    this.userUploaded = false;
    this.targetName = 'The Boss';
    this.filterType = 'photo'; // 'photo' | 'cartoon' | 'statue'
    this.customTexture = null;
    this.damagedTexture = null;
    this.previewUrl = null;
    this._sourceCanvas = null;
    this._normalCanvas = null;
    this._faceNeckCanvas = null;
    this._damagedCanvas = null;
    this._miniCanvas = null;
    this._lastSourceImage = null;
    this._faceCenterY = 0.45; // Default center of face
    this._listeners = [];

    // MediaPipe face landmark state
    this._faceLandmarks = null;       // 468 landmarks from MediaPipe
    this._faceMeshListeners = [];     // notified when landmarks are ready
    this._mediaPipeLoading = false;
    this._mediaPipeReady = false;

    this._initDefaultPreset();

    // Load MediaPipe in background after page settles (non-blocking)
    setTimeout(() => this._loadMediaPipe(), 2500);
  }

  // ── MediaPipe Face Mesh Loader ───────────────────────────────────────────
  async _loadMediaPipe() {
    if (this._mediaPipeLoading || this._mediaPipeReady) return;
    this._mediaPipeLoading = true;
    try {
      // Wait for FaceMesh global to appear (loaded via <script> tag in index.html)
      let tries = 0;
      while (!window.FaceMesh && tries < 24) {
        await new Promise(r => setTimeout(r, 500));
        tries++;
      }
      if (!window.FaceMesh) { console.warn('[MediaPipe] FaceMesh not loaded — face mesh disabled'); return; }

      this._mpFaceMesh = new window.FaceMesh({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh@0.4.1633559619/${file}`
      });
      this._mpFaceMesh.setOptions({ maxNumFaces: 1, refineLandmarks: false, minDetectionConfidence: 0.5, minTrackingConfidence: 0.5 });
      this._mpFaceMesh.onResults(() => {}); // placeholder
      await this._mpFaceMesh.initialize();
      this._mediaPipeReady = true;
      console.log('[MediaPipe] FaceMesh ready ✓');

      // If we already have a source image, detect now
      if (this._lastSourceImage && this.userUploaded) {
        this._detectAndNotify(this._lastSourceImage);
      }
    } catch(e) {
      console.warn('[MediaPipe] Init failed (face mesh disabled):', e.message);
    }
  }

  async _detectAndNotify(imgEl) {
    if (!this._mediaPipeReady || !this._mpFaceMesh) return;
    try {
      const landmarks = await new Promise((resolve) => {
        const tid = setTimeout(() => resolve(null), 4000);
        this._mpFaceMesh.onResults((results) => {
          clearTimeout(tid);
          const lms = results?.multiFaceLandmarks?.[0] || null;
          resolve(lms);
        });
        this._mpFaceMesh.send({ image: imgEl }).catch(() => resolve(null));
      });
      if (landmarks && landmarks.length >= 468) {
        this._faceLandmarks = landmarks;
        this._faceMeshListeners.forEach(fn => { try { fn(landmarks); } catch(_) {} });
        console.log('[MediaPipe] Detected', landmarks.length, 'landmarks ✓');
      }
    } catch(e) {
      console.warn('[MediaPipe] Detection error:', e.message);
    }
  }

  /** Subscribe to be notified when face landmarks are detected */
  onFaceMeshReady(fn) {
    this._faceMeshListeners.push(fn);
    // If landmarks already available, fire immediately
    if (this._faceLandmarks) setTimeout(() => fn(this._faceLandmarks), 0);
  }

  /**
   * Builds a Three.js BufferGeometry from MediaPipe face landmarks.
   * Vertices come from real facial 3D coordinates → actual face geometry.
   * @param {number} faceW - Width of face in Three.js units
   * @param {number} faceH - Height of face in Three.js units
   * @param {number} faceD - Depth (Z extrusion) in Three.js units
   */
  getFaceMeshGeometry(faceW, faceH, faceD) {
    const lms = this._faceLandmarks;
    if (!lms || lms.length < 468) return null;
    // Build triangles from MediaPipe tesselation edges (if available)
    const tesselation = window.FACEMESH_TESSELATION;
    if (!tesselation) return null;

    try {
      // Compute triangle list from edge pairs using adjacency graph
      if (!this._faceTris) {
        const adj = new Map();
        for (const [a, b] of tesselation) {
          if (!adj.has(a)) adj.set(a, new Set());
          if (!adj.has(b)) adj.set(b, new Set());
          adj.get(a).add(b);
          adj.get(b).add(a);
        }
        const tris = [];
        for (const [a, bSet] of adj) {
          for (const b of bSet) {
            if (b <= a) continue;
            for (const c of adj.get(a)) {
              if (c <= b) continue;
              if (bSet.has(c)) tris.push(a, b, c);
            }
          }
        }
        this._faceTris = tris;
        console.log('[MediaPipe] Computed', tris.length / 3, 'face triangles');
      }

      const n = lms.length;
      const pos = new Float32Array(n * 3);
      const uvs = new Float32Array(n * 2);

      for (let i = 0; i < n; i++) {
        const lm = lms[i];
        pos[i * 3 + 0] = (lm.x - 0.5) * faceW;
        pos[i * 3 + 1] = -(lm.y - 0.5) * faceH;
        pos[i * 3 + 2] = (-lm.z) * faceD;   // positive = forward toward camera
        uvs[i * 2 + 0] = lm.x;
        uvs[i * 2 + 1] = 1.0 - lm.y;         // Flip Y for Three.js UV
      }

      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      geo.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
      geo.setIndex(this._faceTris);
      geo.computeVertexNormals();
      return geo;
    } catch(e) {
      console.warn('[MediaPipe] Geometry build failed:', e.message);
      return null;
    }
  }

  /** Returns data URL of normal face (for DOM overlay img src) */
  getNormalUrl() { return this.previewUrl; }

  /** Returns data URL of damaged face (for DOM overlay img src) */
  getDamagedUrl() {
    if (this._damagedDataUrl) return this._damagedDataUrl;
    if (this._damagedCanvas) {
      this._damagedDataUrl = this._damagedCanvas.toDataURL('image/jpeg', 0.88);
      return this._damagedDataUrl;
    }
    return null;
  }

  /** Expose boss avatar drawing for use as fallback in structures.js */
  drawBossAvatar(ctx, w, h) { this._drawBossAvatar(ctx, w, h); }

  hasUserPhoto() {
    return this.active;
  }

  onChange(fn) {
    this._listeners.push(fn);
  }

  _notify() {
    this._listeners.forEach(fn => fn(this));
  }

  setFilter(filterName) {
    if (!['photo', 'cartoon', 'statue'].includes(filterName)) return;
    this.filterType = filterName;
    if (this._lastSourceImage) {
      this.applyFilter(this._lastSourceImage, this.targetName, filterName);
    }
  }

  loadPreset(presetName = 'The Boss') {
    this.targetName = presetName;
    this.userUploaded = false;
    this._lastSourceImage = null;
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    this._drawBossAvatar(ctx, 512, 512, presetName);
    this._setFromCanvas(canvas, presetName, this.filterType || 'photo', false);
  }

  _initDefaultPreset() {
    this.loadPreset('The Boss');
  }

  _drawBossAvatar(ctx, w, h, presetName = 'The Boss') {
    const grad = ctx.createRadialGradient(w/2, h/2, 40, w/2, h/2, w/2);
    if (presetName === 'My Ex') {
      grad.addColorStop(0, '#fbcfe8');
      grad.addColorStop(1, '#db2777');
    } else if (presetName === 'Rival Colleague') {
      grad.addColorStop(0, '#fed7aa');
      grad.addColorStop(1, '#c2410c');
    } else {
      grad.addColorStop(0, '#ffeaa7');
      grad.addColorStop(1, '#e17055');
    }
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Ornate gold border
    ctx.lineWidth = 24;
    ctx.strokeStyle = '#ffd700';
    ctx.strokeRect(12, 12, w - 24, h - 24);

    ctx.lineWidth = 6;
    ctx.strokeStyle = '#d63031';
    ctx.strokeRect(28, 28, w - 56, h - 56);

    // Head
    ctx.fillStyle = '#f8c291';
    ctx.beginPath();
    ctx.arc(w/2, h/2 - 10, 130, 0, Math.PI * 2);
    ctx.fill();
    ctx.lineWidth = 7;
    ctx.strokeStyle = '#2d3436';
    ctx.stroke();

    // Eyebrows
    ctx.fillStyle = '#2d3436';
    ctx.beginPath();
    ctx.moveTo(w/2 - 90, h/2 - 76);
    ctx.lineTo(w/2 - 24, h/2 - 40);
    ctx.lineTo(w/2 - 90, h/2 - 56);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(w/2 + 90, h/2 - 76);
    ctx.lineTo(w/2 + 24, h/2 - 40);
    ctx.lineTo(w/2 + 90, h/2 - 56);
    ctx.fill();

    // Eyes
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(w/2 - 48, h/2 - 28, 24, 0, Math.PI * 2);
    ctx.arc(w/2 + 48, h/2 - 28, 24, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#0984e3';
    ctx.beginPath();
    ctx.arc(w/2 - 44, h/2 - 28, 12, 0, Math.PI * 2);
    ctx.arc(w/2 + 44, h/2 - 28, 12, 0, Math.PI * 2);
    ctx.fill();

    // Big Mustache
    ctx.fillStyle = '#636e72';
    ctx.beginPath();
    ctx.moveTo(w/2, h/2 + 20);
    ctx.quadraticCurveTo(w/2 - 76, h/2 + 10, w/2 - 84, h/2 + 60);
    ctx.quadraticCurveTo(w/2 - 30, h/2 + 36, w/2, h/2 + 44);
    ctx.quadraticCurveTo(w/2 + 30, h/2 + 36, w/2 + 84, h/2 + 60);
    ctx.quadraticCurveTo(w/2 + 76, h/2 + 10, w/2, h/2 + 20);
    ctx.fill();
    ctx.stroke();

    // Crown
    ctx.fillStyle = '#ffd700';
    ctx.beginPath();
    ctx.moveTo(w/2 - 80, h/2 - 124);
    ctx.lineTo(w/2 - 90, h/2 - 190);
    ctx.lineTo(w/2 - 40, h/2 - 152);
    ctx.lineTo(w/2, h/2 - 210);
    ctx.lineTo(w/2 + 40, h/2 - 152);
    ctx.lineTo(w/2 + 90, h/2 - 190);
    ctx.lineTo(w/2 + 80, h/2 - 124);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#b7791f';
    ctx.lineWidth = 5;
    ctx.stroke();

    // Tie / Neck
    ctx.fillStyle = '#d63031';
    ctx.beginPath();
    ctx.moveTo(w/2 - 28, h/2 + 130);
    ctx.lineTo(w/2 + 28, h/2 + 130);
    ctx.lineTo(w/2 + 44, h/2 + 230);
    ctx.lineTo(w/2, h/2 + 250);
    ctx.lineTo(w/2 - 44, h/2 + 230);
    ctx.closePath();
    ctx.fill();

    // Banner
    ctx.fillStyle = '#2d3436';
    ctx.fillRect(32, h - 76, w - 64, 48);
    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 28px sans-serif';
    ctx.textAlign = 'center';
    let bannerTitle = '👑 THE BOSS';
    if (presetName === 'My Ex') bannerTitle = '💔 MY EX';
    else if (presetName === 'Rival Colleague') bannerTitle = '😤 RIVAL';
    else if (presetName) bannerTitle = presetName.toUpperCase();
    ctx.fillText(bannerTitle, w/2, h - 42);
  }

  processUploadedFile(file, callback) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        this.applyFilter(img, this.targetName || 'The Boss', this.filterType || 'photo');
        if (callback) callback(this.previewUrl);

        // 🌟 Background: detect face landmarks for real 3D geometry (non-blocking)
        this._faceLandmarks = null;   // reset old landmarks
        this._faceTris = null;         // reset computed triangles
        if (this._mediaPipeReady) {
          this._detectAndNotify(img);
        }
        // If MediaPipe not ready yet, _loadMediaPipe will call _detectAndNotify when done
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  }


  /**
   * Smart Face Centroid Detection: finds vertical center of face to prevent bad crops
   */
  _detectFaceCenter(canvas) {
    try {
      const ctx = canvas.getContext('2d');
      const w = canvas.width, h = canvas.height;
      const imgData = ctx.getImageData(0, 0, w, h);
      const data = imgData.data;
      let totalWeight = 0;
      let sumY = 0;

      // Sample every 4th pixel vertically in central 60% of the image
      const startX = Math.floor(w * 0.20), endX = Math.floor(w * 0.80);
      const startY = Math.floor(h * 0.10), endY = Math.floor(h * 0.85);

      for (let y = startY; y < endY; y += 4) {
        for (let x = startX; x < endX; x += 4) {
          const idx = (y * w + x) * 4;
          const r = data[idx], g = data[idx+1], b = data[idx+2];
          // Detect skin tone range or high facial contrast
          const isSkin = (r > 60 && g > 40 && b > 20 && r > g && (r - b) > 15);
          if (isSkin) {
            sumY += y;
            totalWeight++;
          }
        }
      }

      if (totalWeight > 200) {
        const avgY = (sumY / totalWeight) / h;
        return Math.max(0.32, Math.min(0.55, avgY));
      }
    } catch (_) {}
    return 0.44; // Fallback optimal portrait center
  }

  applyFilter(sourceImg, name = 'The Boss', filter = 'photo') {
    this._lastSourceImage = sourceImg;
    this.filterType = filter;
    const size = 1024; // High-definition 1024x1024 canvas for crisp 3D head rendering
    const rawCanvas = document.createElement('canvas');
    rawCanvas.width = size;
    rawCanvas.height = size;
    const rctx = rawCanvas.getContext('2d');
    rctx.imageSmoothingEnabled = true;
    rctx.imageSmoothingQuality = 'high';

    const sw = sourceImg.naturalWidth || sourceImg.width;
    const sh = sourceImg.naturalHeight || sourceImg.height;
    const minDim = Math.min(sw, sh);
    const sx = (sw - minDim) / 2;
    const sy = Math.max(0, (sh - minDim) * 0.35); // Focus slightly higher on faces

    // Draw base subject photo
    rctx.drawImage(sourceImg, sx, sy, minDim, minDim, 0, 0, size, size);

    // Detect face center
    this._faceCenterY = this._detectFaceCenter(rawCanvas);

    // Apply selected Style Filter
    if (filter === 'cartoon') {
      // 🎨 Cel-Shaded Royal Caricature Filter
      const imgData = rctx.getImageData(0, 0, size, size);
      const d = imgData.data;
      for (let i = 0; i < d.length; i += 4) {
        // Posterize colors into vibrant cartoon steps
        d[i]   = Math.min(255, Math.floor(d[i]   / 42) * 48 * 1.08);
        d[i+1] = Math.min(255, Math.floor(d[i+1] / 42) * 48 * 1.05);
        d[i+2] = Math.min(255, Math.floor(d[i+2] / 42) * 48 * 0.98);
      }
      rctx.putImageData(imgData, 0, 0);

      // Comic ink subtle contrast overlay
      rctx.lineWidth = 14;
      rctx.strokeStyle = '#ffd700';
      rctx.strokeRect(7, 7, size - 14, size - 14);

    } else if (filter === 'statue') {
      // 👑 Golden Emperor Metallic Statue Filter
      const imgData = rctx.getImageData(0, 0, size, size);
      const d = imgData.data;
      for (let i = 0; i < d.length; i += 4) {
        const lum = 0.299 * d[i] + 0.587 * d[i+1] + 0.114 * d[i+2];
        const norm = lum / 255;
        // Warm imperial gold specular ramp
        d[i]   = Math.min(255, Math.floor(norm * 255 * 1.05 + 25));
        d[i+1] = Math.min(255, Math.floor(norm * 215 * 1.0 + 15));
        d[i+2] = Math.min(255, Math.floor(norm * 65 * 0.7));
      }
      rctx.putImageData(imgData, 0, 0);
    } else {
      // 📸 Photorealistic Royal Filter: Rich contrast and warm lighting
      const imgData = rctx.getImageData(0, 0, size, size);
      const d = imgData.data;
      for (let i = 0; i < d.length; i += 4) {
        d[i]   = Math.min(255, d[i] * 1.04 + 4);
        d[i+1] = Math.min(255, d[i+1] * 1.02);
        d[i+2] = Math.min(255, d[i+2] * 0.98);
      }
      rctx.putImageData(imgData, 0, 0);
    }

    this.userUploaded = true;
    this._setFromCanvas(rawCanvas, name, filter, true);
  }

  /**
   * Generates a curved 3D Face UV texture with feathered alpha vignette
   */
  _extractFaceTillNeck(srcCanvas) {
    const c = document.createElement('canvas');
    c.width = 512;
    c.height = 512;
    const ctx = c.getContext('2d');
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // If the image was uploaded and already cropped by the user, preserve their exact crop!
    if (this.userUploaded) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(256, 256, 238, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(srcCanvas, 0, 0, srcCanvas.width, srcCanvas.height, 14, 14, 484, 484);
      ctx.restore();
    } else {
      const sSize = Math.min(srcCanvas.width, srcCanvas.height);
      const boxSize = sSize * 0.76; // Tightly frames forehead down to chin & neck
      const cropX = Math.max(0, Math.min(srcCanvas.width - boxSize, (srcCanvas.width - boxSize) / 2));
      const cropY = Math.max(0, Math.min(srcCanvas.height - boxSize, srcCanvas.height * this._faceCenterY - boxSize * 0.46));

      ctx.save();
      ctx.beginPath();
      ctx.arc(256, 256, 230, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(srcCanvas, cropX, cropY, boxSize, boxSize, 20, 20, 472, 472);
      ctx.restore();
    }

    // Soft feathered vignette so the face melts organically into the 3D cranium
    ctx.save();
    ctx.globalCompositeOperation = 'destination-in';
    const vGrad = ctx.createRadialGradient(256, 256, 175, 256, 256, 245);
    vGrad.addColorStop(0, 'rgba(0, 0, 0, 1.0)');
    vGrad.addColorStop(0.85, 'rgba(0, 0, 0, 0.92)');
    vGrad.addColorStop(1, 'rgba(0, 0, 0, 0.0)');
    ctx.fillStyle = vGrad;
    ctx.beginPath();
    ctx.arc(256, 256, 250, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Outer subtle gold seal rim
    ctx.lineWidth = 10;
    ctx.strokeStyle = '#ffd700';
    ctx.beginPath();
    ctx.arc(256, 256, 240, 0, Math.PI * 2);
    ctx.stroke();

    return c;
  }

  /**
   * Generates a hilarious, high-contrast combat-damaged / stunned face texture variant
   */
  _createDamagedFaceCanvas(faceCanvas) {
    const c = document.createElement('canvas');
    c.width = 512;
    c.height = 512;
    const ctx = c.getContext('2d');
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // Copy base face
    ctx.drawImage(faceCanvas, 0, 0);

    // Dim the face slightly with a stunned / dizzy tint
    ctx.fillStyle = 'rgba(76, 29, 149, 0.18)';
    ctx.beginPath();
    ctx.arc(256, 256, 230, 0, Math.PI * 2);
    ctx.fill();

    // 1. HUGE Cross-shaped emergency band-aid on left cheek (White gauze + Red cross)
    ctx.save();
    ctx.translate(150, 310);
    ctx.rotate(-0.28);
    // Outer white/cream bandage
    ctx.fillStyle = '#ffedd5';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 6;
    ctx.fillRect(-55, -20, 110, 40);
    ctx.strokeRect(-55, -20, 110, 40);
    ctx.rotate(0.56);
    ctx.fillRect(-55, -20, 110, 40);
    ctx.strokeRect(-55, -20, 110, 40);
    // Red cross emblem in center
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(-8, -25, 16, 50);
    ctx.fillRect(-25, -8, 50, 16);
    ctx.restore();

    // 2. Comic bruised shiner on right eye (Deep purple + black rim)
    ctx.save();
    const bruiseGrad = ctx.createRadialGradient(340, 220, 10, 340, 220, 65);
    bruiseGrad.addColorStop(0, 'rgba(30, 10, 60, 0.85)');
    bruiseGrad.addColorStop(0.5, 'rgba(109, 40, 217, 0.60)');
    bruiseGrad.addColorStop(0.85, 'rgba(234, 88, 12, 0.40)');
    bruiseGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = bruiseGrad;
    ctx.beginPath();
    ctx.arc(340, 220, 65, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 3. HUGE BOLD Spinning Dizzy Spiral Eyes (@_@) with Thick Black Borders
    [[180, 220], [340, 220]].forEach(([cx, cy]) => {
      // White eye backing disc so spiral stands out against any skin tone
      ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.arc(cx, cy, 38, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Bold black & gold spiral
      ctx.lineWidth = 5.5;
      ctx.strokeStyle = '#1e1b4b';
      ctx.beginPath();
      for (let a = 0; a < Math.PI * 5; a += 0.15) {
        const r = (a / (Math.PI * 5)) * 32;
        const x = cx + Math.cos(a) * r;
        const y = cy + Math.sin(a) * r;
        if (a === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    });

    // 4. Large Comic Sweat / Splash Droplets (left & right)
    ctx.font = '48px sans-serif';
    ctx.fillText('💦', 80, 190);
    ctx.fillText('💦', 390, 190);

    // 5. Giant Dizzy Stars & Birds on Forehead (High-visibility comic stars)
    ctx.font = '54px sans-serif';
    ctx.fillText('💫', 130, 120);
    ctx.fillText('⭐', 225, 95);
    ctx.fillText('💫', 320, 120);

    return c;
  }

  _extractMiniBossCanvas(faceCanvas) {
    const c = document.createElement('canvas');
    c.width = 256;
    c.height = 256;
    const ctx = c.getContext('2d');
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    ctx.fillStyle = '#1e1b4b';
    ctx.fillRect(0, 0, 256, 256);

    ctx.save();
    ctx.beginPath();
    ctx.arc(128, 128, 114, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(faceCanvas, 0, 0, faceCanvas.width, faceCanvas.height, 14, 14, 228, 228);
    ctx.restore();

    ctx.lineWidth = 12;
    ctx.strokeStyle = '#ffd700';
    ctx.beginPath();
    ctx.arc(128, 128, 118, 0, Math.PI * 2);
    ctx.stroke();

    return c;
  }

  _setFromCanvas(canvas, name, filter = 'photo', makeActive = false) {
    this.targetName = name || 'The Boss';
    this.filterType = filter;
    this.previewUrl = canvas.toDataURL('image/jpeg', 0.92); // JPEG for smaller DOM overlay src
    this._damagedDataUrl = null;       // ← invalidate cached damaged URL
    this._sourceCanvas = canvas;
    this._faceNeckCanvas = this._extractFaceTillNeck(canvas);
    this._damagedCanvas = this._createDamagedFaceCanvas(this._faceNeckCanvas);
    this._miniCanvas = this._extractMiniBossCanvas(this._faceNeckCanvas);

    // Never apply synthetic Sobel normal maps to real photos of people!
    this._normalCanvas = null;

    if (this.customTexture) {
      this.customTexture.image = canvas;
      this.customTexture.needsUpdate = true;
    } else {
      this.customTexture = new THREE.CanvasTexture(canvas);
      this.customTexture.colorSpace = THREE.SRGBColorSpace;
    }

    if (this.damagedTexture) {
      this.damagedTexture.image = this._damagedCanvas;
      this.damagedTexture.needsUpdate = true;
    } else {
      this.damagedTexture = new THREE.CanvasTexture(this._damagedCanvas);
      this.damagedTexture.colorSpace = THREE.SRGBColorSpace;
    }

    if (makeActive) this.active = true;
    this._notify();
  }


  getFaceCanvas() {
    return this._faceNeckCanvas || this._sourceCanvas;
  }

  getDamagedCanvas() {
    return this._damagedCanvas;
  }

  getDamagedFaceTexture() {
    if (!this._damagedCanvas) return null;
    const tex = new THREE.CanvasTexture(this._damagedCanvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.generateMipmaps = true;
    tex.minFilter = THREE.LinearMipmapLinearFilter;
    tex.magFilter = THREE.LinearFilter;
    return tex;
  }

  /**
   * Returns high-res face-till-neck texture for 3D Putla (Bust Statue)
   */
  getFaceTillNeckTexture() {
    if (!this._faceNeckCanvas) return null;
    const tex = new THREE.CanvasTexture(this._faceNeckCanvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.generateMipmaps = true;
    tex.minFilter = THREE.LinearMipmapLinearFilter;
    tex.magFilter = THREE.LinearFilter;
    return tex;
  }

  getMiniBossTexture() {
    if (!this._miniCanvas) return null;
    const tex = new THREE.CanvasTexture(this._miniCanvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.generateMipmaps = true;
    tex.minFilter = THREE.LinearMipmapLinearFilter;
    tex.magFilter = THREE.LinearFilter;
    return tex;
  }

  getMosaicTileTexture(col, row, totalCols = 2, totalRows = 2) {
    const srcCanvas = this._sourceCanvas;
    if (!srcCanvas) return null;

    const tileCanvas = document.createElement('canvas');
    tileCanvas.width = 512;
    tileCanvas.height = 512;
    const ctx = tileCanvas.getContext('2d');
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    const sW = srcCanvas.width / totalCols;
    const sH = srcCanvas.height / totalRows;
    const imgRow = totalRows - 1 - row;
    const sX = col * sW;
    const sY = imgRow * sH;

    ctx.drawImage(srcCanvas, sX, sY, sW, sH, 0, 0, 512, 512);

    const tex = new THREE.CanvasTexture(tileCanvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.generateMipmaps = true;
    tex.minFilter = THREE.LinearMipmapLinearFilter;
    tex.magFilter = THREE.LinearFilter;
    return tex;
  }

  getMosaicTileNormalTexture() {
    return null;
  }
}

export const customTargets = new CustomTargetManager();
