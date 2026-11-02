/**
 * engine.js — Three.js Rendering Engine: Scene, Camera, Lighting, PBR Environment & Themes
 * Delivers AAA mobile casual game aesthetics matching Cypher Games' "Royal Smash!":
 * - Transparent WebGL canvas seamlessly displaying 8K painted scenic backdrops
 * - Directional sunlight casting crisp, soft-penumbra shadows onto transparent ground
 * - Direct frontal fill lighting to guarantee cans, column and blocks shine brightly
 * - Responsive adaptive camera framing both bottom 3D cannon and high target structures
 * - ACES Filmic tone mapping for vibrant, rich, saturated Pixar/Supercell casual colors
 */
import * as THREE from 'three';
import { liveBg } from './livebg.js';

export class RenderEngine {
  constructor(canvas) {
    this.canvas   = canvas;
    this.scene    = null;
    this.camera   = null;
    this.renderer = null;
    this.clock    = new THREE.Clock();

    // Lighting refs
    this._sunLight   = null;
    this._frontFill  = null;
    this._hemiLight  = null;
    this._rimLight   = null;
    this._groundMesh = null;
    this._currentTheme = 'coast';
  }

  init() {
    this._initRenderer();
    this._initScene();
    this._initCamera();
    this._initLighting();
    this._initEnvironment();

    window.addEventListener('resize', () => this._onResize());
    this._onResize();
  }

  // ─── Renderer ────────────────────────────────────────────────────────────
  _initRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: true,                  // 100% transparent canvas over HTML scenic background
      powerPreference: 'high-performance',
      stencil: false,
    });
    this.renderer.setClearColor(0x000000, 0); // Transparent clear
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2.0));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type    = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping       = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;

    if (THREE.SRGBColorSpace !== undefined) {
      this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    } else {
      this.renderer.outputEncoding = THREE.sRGBEncoding;
    }
  }

  // ─── Scene ───────────────────────────────────────────────────────────────
  _initScene() {
    this.scene = new THREE.Scene();
  }

  // ─── Adaptive Camera ─────────────────────────────────────────────────────
  _initCamera() {
    this.camera = new THREE.PerspectiveCamera(50, 1.0, 0.1, 200);
    this._updateCamera();
  }

  _updateCamera() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const aspect = w / h;
    this.camera.aspect = aspect;

    if (aspect >= 1.0) {
      // Landscape (Laptops, Desktops, Landscape Tablets)
      // Framing table comfortably in distance with ample room for full tower and blaster cannon
      this.camera.fov = 46;
      this.camera.position.set(0, 4.3, 14.8);
      this.camera.lookAt(0, 3.7, 0);
    } else {
      // Portrait (Mobile Phones, Tall Windows)
      // Generous FOV and distance framing table and 3D cannon ("blaster tope") comfortably apart
      this.camera.fov = 54;
      this.camera.position.set(0, 4.8, 17.2);
      this.camera.lookAt(0, 3.8, 0);
    }
    this.camera.updateProjectionMatrix();
  }

  // ─── Lighting ────────────────────────────────────────────────────────────
  _initLighting() {
    // 1. Outdoor Sky & Ground Hemisphere Light
    this._hemiLight = new THREE.HemisphereLight(0xffffff, 0x4fa82d, 0.85);
    this.scene.add(this._hemiLight);

    // 2. Main Sun Light — Warm, bright, casting crisp shadows down-right
    this._sunLight = new THREE.DirectionalLight(0xfffaed, 2.3);
    this._sunLight.position.set(6, 22, 11);
    this._sunLight.castShadow = true;
    this._sunLight.shadow.radius = 2.0;
    Object.assign(this._sunLight.shadow.mapSize, { width: 2048, height: 2048 });
    Object.assign(this._sunLight.shadow.camera, {
      near: 1.0,
      far: 50,
      left: -7,
      right: 7,
      top: 13,
      bottom: -2,
    });
    this._sunLight.shadow.bias       = -0.0006;
    this._sunLight.shadow.normalBias = 0.02;
    this.scene.add(this._sunLight);

    // 3. Direct Frontal Fill Light — Guarantees cans, column & cannon face camera brightly
    this._frontFill = new THREE.DirectionalLight(0xfff8ee, 1.25);
    this._frontFill.position.set(0, 6, 14);
    this.scene.add(this._frontFill);

    // 4. Subtle Cool Rim Light from opposite rear angle
    this._rimLight = new THREE.DirectionalLight(0xb0e0ff, 0.7);
    this._rimLight.position.set(-6, 10, -8);
    this.scene.add(this._rimLight);
  }

  // ─── Environment & Shadow Ground ──────────────────────────────────────────
  _initEnvironment() {
    // Transparent shadow ground plane: catches real-time dynamic shadows
    // from falling blocks, pedestal and cannon directly onto the scenic background
    const shadowGeo = new THREE.PlaneGeometry(32, 24);
    const shadowMat = new THREE.ShadowMaterial({ opacity: 0.36 });
    this._groundMesh = new THREE.Mesh(shadowGeo, shadowMat);
    this._groundMesh.rotation.x = -Math.PI / 2;
    this._groundMesh.position.set(0, 0, 1.5);
    this._groundMesh.receiveShadow = true;
    this.scene.add(this._groundMesh);

    this.applyTheme('coast');
  }

  // ─── World Themes ─────────────────────────────────────────────────────────
  applyTheme(themeKey = 'coast', levelNum = 1) {
    this._currentTheme = themeKey;

    const THEMES = {
      coast: {
        bgPath: 'assets/bg_coastal.jpg',
        sunColor: 0xfffaed, sunIntensity: 2.3,
        frontFillColor: 0xfff8ee,
        hemiSky: 0x87ceeb, hemiGround: 0x4fa82d,
      },
      sunset: {
        bgPath: 'assets/bg_sunset.jpg',
        sunColor: 0xffb347, sunIntensity: 2.6,
        frontFillColor: 0xffd1a4,
        hemiSky: 0xff7043, hemiGround: 0x5d4037,
      },
      palace: {
        bgPath: 'assets/bg_palace.jpg',
        sunColor: 0xfff0aa, sunIntensity: 2.4,
        frontFillColor: 0xfff5e4,
        hemiSky: 0xce93d8, hemiGround: 0x388e3c,
      },
      night: {
        bgPath: 'assets/bg_night.jpg',
        sunColor: 0x90caf9, sunIntensity: 1.8,
        frontFillColor: 0xb3e5fc,
        hemiSky: 0x1a237e, hemiGround: 0x0a192f,
      },
      tropical: {
        bgPath: 'assets/bg_tropical.jpg',
        sunColor: 0xfffae0, sunIntensity: 2.5,
        frontFillColor: 0xfffde7,
        hemiSky: 0x00e5ff, hemiGround: 0x558b2f,
      },
      empire: {
        bgPath: 'assets/bg_palace.jpg',
        sunColor: 0xffd700, sunIntensity: 2.8,
        frontFillColor: 0xffecb3,
        hemiSky: 0xffd54f, hemiGround: 0x2e7d32,
      },
    };

    const t = THEMES[themeKey] || THEMES.coast;

    // Progressive palace approach visual scaling
    const progress = ((levelNum - 1) % 13) / 12; // 0.0 at stage 1 -> 1.0 at stage 13
    const zoom = 100 + Math.round(progress * 18);
    const yPos = 50 - Math.round(progress * 8);

    // Update HTML scenic background with progressive approach towards palace
    const container = document.getElementById('game-container');
    if (container && t.bgPath) {
      container.style.backgroundImage = `url('${t.bgPath}')`;
      container.style.backgroundSize = `${zoom}%`;
      container.style.backgroundPosition = `center ${yPos}%`;
      container.style.transition = 'background-size 1.2s ease, background-position 1.2s ease';
    }

    // Live animated overlay (clouds / birds / river / stars) — CSS-only, no per-frame JS
    try { liveBg.setTheme(themeKey); } catch (_) {}

    // Update lighting tints
    if (this._sunLight) {
      this._sunLight.color.setHex(t.sunColor);
      this._sunLight.intensity = t.sunIntensity;
    }
    if (this._frontFill) {
      this._frontFill.color.setHex(t.frontFillColor);
    }
    if (this._hemiLight) {
      this._hemiLight.color.setHex(t.hemiSky);
      this._hemiLight.groundColor.setHex(t.hemiGround);
    }
  }

  _onResize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    if (this.camera) {
      this._updateCamera();
    }
    if (this.renderer) {
      this.renderer.setSize(w, h);
    }
  }

  update(dt) {
    // Idle animations if needed
  }

  // ─── Render Loop ──────────────────────────────────────────────────────────
  render() {
    const dt = this.clock.getDelta();
    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
    return dt;
  }

  shakeCamera(intensity = 0.22, duration = 0.35) {
    const origPos = this.camera.position.clone();
    const startTime = performance.now();
    const doShake = () => {
      const elapsed = (performance.now() - startTime) / 1000;
      if (elapsed < duration) {
        const decay = 1 - elapsed / duration;
        this.camera.position.x = origPos.x + (Math.random() - 0.5) * intensity * decay;
        this.camera.position.y = origPos.y + (Math.random() - 0.5) * intensity * decay;
        requestAnimationFrame(doShake);
      } else {
        this.camera.position.copy(origPos);
      }
    };
    doShake();
  }
}
