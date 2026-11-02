/**
 * particles.js — GPU-friendly particle effects using Three.js Points
 * Muzzle flash · Impact sparks · Smoke trail · Victory confetti
 */
import * as THREE from 'three';

export class ParticleSystem {
  constructor(scene) {
    this.scene = scene;
    this.systems = []; // active particle systems
  }

  /* ── Muzzle flash (billboard quad) ── */
  createMuzzleFlash(position) {
    const geo = new THREE.PlaneGeometry(1.6, 1.6);
    const mat = new THREE.MeshBasicMaterial({
      color: 0xffcc00, transparent: true, opacity: 1,
      side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.copy(position);
    mesh.lookAt(new THREE.Vector3(0, position.y, 14)); // face camera
    this.scene.add(mesh);

    let life = 1;
    this.systems.push({
      update: (dt) => {
        life -= dt * 10;
        mat.opacity = Math.max(0, life);
        mesh.scale.setScalar(1 + (1 - life) * 1.8);
        return life > 0;
      },
      dispose: () => { this.scene.remove(mesh); geo.dispose(); mat.dispose(); }
    });
  }

  /* ── Impact sparks ── */
  createImpactSparks(position, count = 24) {
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    const vels = [];

    for (let i = 0; i < count; i++) {
      pos[i * 3]     = position.x;
      pos[i * 3 + 1] = position.y;
      pos[i * 3 + 2] = position.z;
      vels.push(new THREE.Vector3(
        (Math.random() - 0.5) * 7,
        1 + Math.random() * 5,
        (Math.random() - 0.5) * 7
      ));
    }

    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const mat = new THREE.PointsMaterial({
      color: 0xffdd22, size: 0.14, transparent: true, opacity: 1,
      depthWrite: false, blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    });
    const pts = new THREE.Points(geo, mat);
    this.scene.add(pts);

    let life = 1;
    this.systems.push({
      update: (dt) => {
        life -= dt * 1.8;
        mat.opacity = Math.max(0, life * life);
        const arr = geo.attributes.position.array;
        for (let i = 0; i < count; i++) {
          vels[i].y -= 22 * dt;
          arr[i * 3]     += vels[i].x * dt;
          arr[i * 3 + 1] += vels[i].y * dt;
          arr[i * 3 + 2] += vels[i].z * dt;
        }
        geo.attributes.position.needsUpdate = true;
        return life > 0;
      },
      dispose: () => { this.scene.remove(pts); geo.dispose(); mat.dispose(); }
    });
  }

  /* ── 💨 Aerodynamic Speed Streak (Clean non-smoky wind trail) ── */
  createSpeedStreak(position, colorHex = 0xffffff, size = 0.14) {
    const geo = new THREE.BufferGeometry();
    const N = 3;
    const pos = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      pos[i * 3]     = position.x + (Math.random() - 0.5) * 0.08;
      pos[i * 3 + 1] = position.y + (Math.random() - 0.5) * 0.08;
      pos[i * 3 + 2] = position.z + (Math.random() - 0.5) * 0.08;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const mat = new THREE.PointsMaterial({
      color: colorHex,
      size: size,
      transparent: true,
      opacity: 0.40,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const pts = new THREE.Points(geo, mat);
    this.scene.add(pts);

    let life = 0.22;
    this.systems.push({
      update: (dt) => {
        life -= dt;
        mat.opacity = Math.max(0, (life / 0.22) * 0.40);
        return life > 0;
      },
      dispose: () => { this.scene.remove(pts); geo.dispose(); mat.dispose(); }
    });
  }

  /* ── Cannonball smoke puff ── */
  createSmokePuff(position) {
    const geo = new THREE.BufferGeometry();
    const N = 6;
    const pos = new Float32Array(N * 3);
    const vels = [];

    for (let i = 0; i < N; i++) {
      pos[i * 3]     = position.x + (Math.random() - 0.5) * 0.2;
      pos[i * 3 + 1] = position.y + (Math.random() - 0.5) * 0.2;
      pos[i * 3 + 2] = position.z + (Math.random() - 0.5) * 0.2;
      vels.push(new THREE.Vector3(
        (Math.random() - 0.5) * 0.4,
        0.3 + Math.random() * 0.4,
        (Math.random() - 0.5) * 0.4
      ));
    }

    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const mat = new THREE.PointsMaterial({
      color: 0xbbbbbb, size: 0.28, transparent: true, opacity: 0.55,
      depthWrite: false,
    });
    const pts = new THREE.Points(geo, mat);
    this.scene.add(pts);

    let life = 0.7;
    this.systems.push({
      update: (dt) => {
        life -= dt * 1.4;
        mat.opacity = Math.max(0, life * 0.6);
        mat.size += dt * 0.25;
        const arr = geo.attributes.position.array;
        for (let i = 0; i < N; i++) {
          arr[i * 3]     += vels[i].x * dt;
          arr[i * 3 + 1] += vels[i].y * dt;
          arr[i * 3 + 2] += vels[i].z * dt;
        }
        geo.attributes.position.needsUpdate = true;
        return life > 0;
      },
      dispose: () => { this.scene.remove(pts); geo.dispose(); mat.dispose(); }
    });
  }

  /* ── 🔥 Dragon Fire Trail ── */
  createFireTrail(position) {
    const geo = new THREE.BufferGeometry();
    const N = 8;
    const pos = new Float32Array(N * 3);
    const vels = [];
    for (let i = 0; i < N; i++) {
      pos[i * 3]     = position.x + (Math.random() - 0.5) * 0.22;
      pos[i * 3 + 1] = position.y + (Math.random() - 0.5) * 0.22;
      pos[i * 3 + 2] = position.z + (Math.random() - 0.5) * 0.22;
      vels.push(new THREE.Vector3((Math.random() - 0.5) * 0.6, 0.4 + Math.random() * 0.8, (Math.random() - 0.5) * 0.6));
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const mat = new THREE.PointsMaterial({
      color: 0xff4500, size: 0.32, transparent: true, opacity: 0.95,
      blending: THREE.AdditiveBlending, depthWrite: false,
    });
    const pts = new THREE.Points(geo, mat);
    this.scene.add(pts);
    let life = 0.55;
    this.systems.push({
      update: (dt) => {
        life -= dt * 2.0;
        mat.opacity = Math.max(0, life);
        const arr = geo.attributes.position.array;
        for (let i = 0; i < N; i++) {
          arr[i * 3]     += vels[i].x * dt;
          arr[i * 3 + 1] += vels[i].y * dt;
          arr[i * 3 + 2] += vels[i].z * dt;
        }
        geo.attributes.position.needsUpdate = true;
        return life > 0;
      },
      dispose: () => { this.scene.remove(pts); geo.dispose(); mat.dispose(); }
    });
  }

  /* ── ⚡ Tesla Plasma Electric Trail ── */
  createPlasmaTrail(position) {
    const geo = new THREE.BufferGeometry();
    const N = 10;
    const pos = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      pos[i * 3]     = position.x + (Math.random() - 0.5) * 0.25;
      pos[i * 3 + 1] = position.y + (Math.random() - 0.5) * 0.25;
      pos[i * 3 + 2] = position.z + (Math.random() - 0.5) * 0.25;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const mat = new THREE.PointsMaterial({
      color: 0x00f0ff, size: 0.25, transparent: true, opacity: 1,
      blending: THREE.AdditiveBlending, depthWrite: false,
    });
    const pts = new THREE.Points(geo, mat);
    this.scene.add(pts);
    let life = 0.4;
    this.systems.push({
      update: (dt) => {
        life -= dt * 2.5;
        mat.opacity = Math.max(0, life * 2.5);
        return life > 0;
      },
      dispose: () => { this.scene.remove(pts); geo.dispose(); mat.dispose(); }
    });
  }

  /* ── 👑 Royal Fever Golden Superball Sparkle Trail ── */
  createFeverTrail(position) {
    const geo = new THREE.BufferGeometry();
    const N = 14;
    const pos = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      pos[i * 3]     = position.x + (Math.random() - 0.5) * 0.35;
      pos[i * 3 + 1] = position.y + (Math.random() - 0.5) * 0.35;
      pos[i * 3 + 2] = position.z + (Math.random() - 0.5) * 0.35;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const mat = new THREE.PointsMaterial({
      color: 0xffd700, size: 0.38, transparent: true, opacity: 1,
      blending: THREE.AdditiveBlending, depthWrite: false,
    });
    const pts = new THREE.Points(geo, mat);
    this.scene.add(pts);
    let life = 0.6;
    this.systems.push({
      update: (dt) => {
        life -= dt * 1.8;
        mat.opacity = Math.max(0, life);
        return life > 0;
      },
      dispose: () => { this.scene.remove(pts); geo.dispose(); mat.dispose(); }
    });
  }

  /* ── 💥 Critical Hit Starburst ── */
  createCriticalHitStar(position) {
    this.createImpactSparks(position, 48);
    this.createClusterSparkles(position, 35);
  }

  /* ── Victory confetti rain ── */
  createVictoryConfetti() {
    const COLORS = [0xff2222, 0xffd700, 0x22ff88, 0xaa00ff, 0xff8800, 0x00ccff, 0xff66cc];
    const PER_COLOR = 30;

    COLORS.forEach(color => {
      const geo = new THREE.BufferGeometry();
      const pos = new Float32Array(PER_COLOR * 3);
      const vels = [];

      for (let i = 0; i < PER_COLOR; i++) {
        pos[i * 3]     = (Math.random() - 0.5) * 14;
        pos[i * 3 + 1] = 10 + Math.random() * 6;
        pos[i * 3 + 2] = (Math.random() - 0.5) * 5;
        vels.push(new THREE.Vector3(
          (Math.random() - 0.5) * 1.5,
          -(1.5 + Math.random() * 2),
          (Math.random() - 0.5) * 0.8
        ));
      }

      geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      const mat = new THREE.PointsMaterial({
        color, size: 0.22, transparent: true, opacity: 1, depthWrite: false,
      });
      const pts = new THREE.Points(geo, mat);
      this.scene.add(pts);

      let life = 3.5;
      this.systems.push({
        update: (dt) => {
          life -= dt;
          mat.opacity = Math.min(1, life * 0.7);
          const arr = geo.attributes.position.array;
          for (let i = 0; i < PER_COLOR; i++) {
            vels[i].x += (Math.random() - 0.5) * 0.3 * dt;
            arr[i * 3]     += vels[i].x * dt;
            arr[i * 3 + 1] += vels[i].y * dt;
            arr[i * 3 + 2] += vels[i].z * dt;
            if (arr[i * 3 + 1] < -3) {
              arr[i * 3 + 1] = 10 + Math.random() * 5;
              arr[i * 3]     = (Math.random() - 0.5) * 14;
            }
          }
          geo.attributes.position.needsUpdate = true;
          return life > 0;
        },
        dispose: () => { this.scene.remove(pts); geo.dispose(); mat.dispose(); }
      });
    });
  }

  /* ── Bomb explosion burst ── */
  createExplosion(position) {
    // 1. Shockwave ring billboard
    const ringGeo = new THREE.RingGeometry(0.2, 0.6, 24);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xffaa00, transparent: true, opacity: 0.9,
      side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.position.copy(position);
    ring.rotation.x = -Math.PI / 2;
    this.scene.add(ring);

    // 2. High-energy explosion fireball sparks
    const count = 48;
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    const vels = [];
    for (let i = 0; i < count; i++) {
      pos[i * 3]     = position.x;
      pos[i * 3 + 1] = position.y;
      pos[i * 3 + 2] = position.z;
      const angle = Math.random() * Math.PI * 2;
      const spd = 4 + Math.random() * 9;
      vels.push(new THREE.Vector3(
        Math.cos(angle) * spd,
        2 + Math.random() * 8,
        Math.sin(angle) * spd
      ));
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const mat = new THREE.PointsMaterial({
      color: 0xff4500, size: 0.28, transparent: true, opacity: 1,
      blending: THREE.AdditiveBlending, depthWrite: false
    });
    const pts = new THREE.Points(geo, mat);
    this.scene.add(pts);

    let life = 1;
    this.systems.push({
      update: (dt) => {
        life -= dt * 2.2;
        ring.scale.addScalar(dt * 12);
        ringMat.opacity = Math.max(0, life * 0.9);

        mat.opacity = Math.max(0, life);
        const arr = geo.attributes.position.array;
        for (let i = 0; i < count; i++) {
          vels[i].y -= 18 * dt;
          arr[i * 3]     += vels[i].x * dt;
          arr[i * 3 + 1] += vels[i].y * dt;
          arr[i * 3 + 2] += vels[i].z * dt;
        }
        geo.attributes.position.needsUpdate = true;
        return life > 0;
      },
      dispose: () => {
        this.scene.remove(ring); ringGeo.dispose(); ringMat.dispose();
        this.scene.remove(pts); geo.dispose(); mat.dispose();
      }
    });
  }

  /* ── Golden coin burst on custom target hit ── */
  createCoinShower(position) {
    const count = 18;
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    const vels = [];
    for (let i = 0; i < count; i++) {
      pos[i * 3]     = position.x;
      pos[i * 3 + 1] = position.y;
      pos[i * 3 + 2] = position.z;
      vels.push(new THREE.Vector3(
        (Math.random() - 0.5) * 5,
        3 + Math.random() * 6,
        (Math.random() - 0.5) * 5
      ));
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const mat = new THREE.PointsMaterial({
      color: 0xffd700, size: 0.25, transparent: true, opacity: 1,
      blending: THREE.AdditiveBlending, depthWrite: false
    });
    const pts = new THREE.Points(geo, mat);
    this.scene.add(pts);

    let life = 1.2;
    this.systems.push({
      update: (dt) => {
        life -= dt * 1.5;
        mat.opacity = Math.max(0, life);
        const arr = geo.attributes.position.array;
        for (let i = 0; i < count; i++) {
          vels[i].y -= 14 * dt;
          arr[i * 3]     += vels[i].x * dt;
          arr[i * 3 + 1] += vels[i].y * dt;
          arr[i * 3 + 2] += vels[i].z * dt;
        }
        geo.attributes.position.needsUpdate = true;
        return life > 0;
      },
      dispose: () => { this.scene.remove(pts); geo.dispose(); mat.dispose(); }
    });
  }

  /* ── Fireworks / Crackers Explosion (Palace Victory) ── */
  createFireworks(position, colorHex = 0xffd700) {
    const count = 48;
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    const vels = [];

    for (let i = 0; i < count; i++) {
      pos[i * 3]     = position.x;
      pos[i * 3 + 1] = position.y;
      pos[i * 3 + 2] = position.z;
      const theta = Math.random() * Math.PI * 2;
      const phi   = (Math.random() - 0.5) * Math.PI;
      const spd   = 4 + Math.random() * 8;
      vels.push(new THREE.Vector3(
        Math.cos(theta) * Math.cos(phi) * spd,
        Math.sin(phi) * spd + 2.5,
        Math.sin(theta) * Math.cos(phi) * spd
      ));
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const mat = new THREE.PointsMaterial({
      color: colorHex, size: 0.22, transparent: true, opacity: 1,
      blending: THREE.AdditiveBlending, depthWrite: false
    });
    const pts = new THREE.Points(geo, mat);
    this.scene.add(pts);

    let life = 1.4;
    this.systems.push({
      update: (dt) => {
        life -= dt * 1.1;
        mat.opacity = Math.max(0, life);
        const arr = geo.attributes.position.array;
        for (let i = 0; i < count; i++) {
          vels[i].y -= 8 * dt;
          arr[i * 3]     += vels[i].x * dt;
          arr[i * 3 + 1] += vels[i].y * dt;
          arr[i * 3 + 2] += vels[i].z * dt;
        }
        geo.attributes.position.needsUpdate = true;
        return life > 0;
      },
      dispose: () => { this.scene.remove(pts); geo.dispose(); mat.dispose(); }
    });
  }

  /* ── Falling Flower Petals Shower (Rose, Lotus, Jasmine) ── */
  createFlowerShower(count = 60) {
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    const vels = [];
    const colors = [0xff2a6d, 0xff758c, 0xffd166, 0xffffff, 0xf72585];

    for (let i = 0; i < count; i++) {
      pos[i * 3]     = (Math.random() - 0.5) * 12;
      pos[i * 3 + 1] = 8 + Math.random() * 6;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 8;
      vels.push(new THREE.Vector3(
        (Math.random() - 0.5) * 1.5,
        -(1.2 + Math.random() * 2.0),
        (Math.random() - 0.5) * 1.5
      ));
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const mat = new THREE.PointsMaterial({
      color: 0xff69b4, size: 0.32, transparent: true, opacity: 1,
      depthWrite: false, blending: THREE.NormalBlending
    });
    const pts = new THREE.Points(geo, mat);
    this.scene.add(pts);

    let life = 4.0;
    this.systems.push({
      update: (dt) => {
        life -= dt;
        mat.opacity = Math.max(0, Math.min(1, life / 1.5));
        const arr = geo.attributes.position.array;
        for (let i = 0; i < count; i++) {
          arr[i * 3]     += vels[i].x * dt + Math.sin(life * 3 + i) * 0.02;
          arr[i * 3 + 1] += vels[i].y * dt;
          arr[i * 3 + 2] += vels[i].z * dt;
        }
        geo.attributes.position.needsUpdate = true;
        return life > 0;
      },
      dispose: () => { this.scene.remove(pts); geo.dispose(); mat.dispose(); }
    });
  }

  /* ── Slipper (Chappal) Slap Dust Cloud & Stars ── */
  createDustSlapPuff(position) {
    const geo = new THREE.BufferGeometry();
    const count = 32;
    const pos = new Float32Array(count * 3);
    const vels = [];
    for (let i = 0; i < count; i++) {
      pos[i * 3]     = position.x;
      pos[i * 3 + 1] = position.y;
      pos[i * 3 + 2] = position.z;
      const angle = Math.random() * Math.PI * 2;
      const spd = 2 + Math.random() * 4;
      vels.push(new THREE.Vector3(Math.cos(angle) * spd, 1 + Math.random() * 3, Math.sin(angle) * spd));
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const mat = new THREE.PointsMaterial({
      color: 0xffd166, size: 0.28, transparent: true, opacity: 1,
      blending: THREE.AdditiveBlending, depthWrite: false
    });
    const pts = new THREE.Points(geo, mat);
    this.scene.add(pts);

    let life = 0.8;
    this.systems.push({
      update: (dt) => {
        life -= dt * 1.5;
        mat.opacity = Math.max(0, life);
        const arr = geo.attributes.position.array;
        for (let i = 0; i < count; i++) {
          vels[i].y -= 12 * dt;
          arr[i * 3]     += vels[i].x * dt;
          arr[i * 3 + 1] += vels[i].y * dt;
          arr[i * 3 + 2] += vels[i].z * dt;
        }
        geo.attributes.position.needsUpdate = true;
        return life > 0;
      },
      dispose: () => { this.scene.remove(pts); geo.dispose(); mat.dispose(); }
    });
  }

  /* ── Heavy Combat Boot Ground Stomp Shockwave ── */
  createGroundStompShock(position) {
    const geo = new THREE.RingGeometry(0.3, 0.55, 32);
    const mat = new THREE.MeshBasicMaterial({
      color: 0xff9f1c, transparent: true, opacity: 0.95, side: THREE.DoubleSide, depthWrite: false
    });
    const ring = new THREE.Mesh(geo, mat);
    ring.position.set(position.x, position.y + 0.05, position.z);
    ring.rotation.x = -Math.PI / 2;
    this.scene.add(ring);

    this.createImpactSparks(position, 40);

    let life = 0.6;
    this.systems.push({
      update: (dt) => {
        life -= dt * 1.8;
        mat.opacity = Math.max(0, life);
        const s = 1 + (0.6 - life) * 7.5;
        ring.scale.set(s, s, s);
        return life > 0;
      },
      dispose: () => { this.scene.remove(ring); geo.dispose(); mat.dispose(); }
    });
  }

  /* ── Hydro Splash Water Burst Droplets & Blue Ring ── */
  createWaterSplash(position) {
    const count = 55;
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    const vels = [];
    for (let i = 0; i < count; i++) {
      pos[i * 3]     = position.x;
      pos[i * 3 + 1] = position.y;
      pos[i * 3 + 2] = position.z;
      const angle = Math.random() * Math.PI * 2;
      const spd = 3 + Math.random() * 5.5;
      vels.push(new THREE.Vector3(
        Math.cos(angle) * spd,
        2.5 + Math.random() * 5.0,
        Math.sin(angle) * spd
      ));
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const mat = new THREE.PointsMaterial({
      color: 0x00d2ff, size: 0.32, transparent: true, opacity: 0.95,
      blending: THREE.AdditiveBlending, depthWrite: false
    });
    const pts = new THREE.Points(geo, mat);
    this.scene.add(pts);

    let life = 1.0;
    this.systems.push({
      update: (dt) => {
        life -= dt * 1.4;
        mat.opacity = Math.max(0, life);
        const arr = geo.attributes.position.array;
        for (let i = 0; i < count; i++) {
          vels[i].y -= 18 * dt;
          arr[i * 3]     += vels[i].x * dt;
          arr[i * 3 + 1] += vels[i].y * dt;
          arr[i * 3 + 2] += vels[i].z * dt;
        }
        geo.attributes.position.needsUpdate = true;
        return life > 0;
      },
      dispose: () => { this.scene.remove(pts); geo.dispose(); mat.dispose(); }
    });
  }

  /* ── MIRV Cluster Rocket Fireworks & Sparkles ── */
  createClusterSparkles(position, count = 70) {
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    const vels = [];
    const colors = [0xff0055, 0xffcc00, 0x00ffff, 0xff00ff, 0xffffff];

    for (let i = 0; i < count; i++) {
      pos[i * 3]     = position.x;
      pos[i * 3 + 1] = position.y;
      pos[i * 3 + 2] = position.z;
      const theta = Math.random() * Math.PI * 2;
      const phi   = (Math.random() - 0.5) * Math.PI;
      const spd   = 4 + Math.random() * 7;
      vels.push(new THREE.Vector3(
        Math.cos(theta) * Math.cos(phi) * spd,
        Math.sin(phi) * spd + 2.0,
        Math.sin(theta) * Math.cos(phi) * spd
      ));
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const mat = new THREE.PointsMaterial({
      color: 0xffd700, size: 0.35, transparent: true, opacity: 1,
      blending: THREE.AdditiveBlending, depthWrite: false
    });
    const pts = new THREE.Points(geo, mat);
    this.scene.add(pts);

    let life = 1.3;
    this.systems.push({
      update: (dt) => {
        life -= dt * 1.1;
        mat.opacity = Math.max(0, life);
        const arr = geo.attributes.position.array;
        for (let i = 0; i < count; i++) {
          vels[i].y -= 9 * dt;
          arr[i * 3]     += vels[i].x * dt;
          arr[i * 3 + 1] += vels[i].y * dt;
          arr[i * 3 + 2] += vels[i].z * dt;
        }
        geo.attributes.position.needsUpdate = true;
        return life > 0;
      },
      dispose: () => { this.scene.remove(pts); geo.dispose(); mat.dispose(); }
    });
  }

  /* ── Grand Palace Celebration Multi-Wave ── */
  createGrandCelebration() {
    this.createFlowerShower(90);
    const crackerColors = [0xffd700, 0xff3b30, 0x00e5ff, 0x34c759, 0xaf52de];
    [-3, -1, 1, 3].forEach((x, idx) => {
      setTimeout(() => {
        this.createFireworks({ x, y: 7 + (idx % 2), z: -1 }, crackerColors[idx % crackerColors.length]);
      }, idx * 300);
    });
  }

  /* ── Update all active systems ── */
  update(dt) {
    this.systems = this.systems.filter(s => {
      const alive = s.update(dt);
      if (!alive) s.dispose();
      return alive;
    });
  }

  clear() {
    this.systems.forEach(s => s.dispose());
    this.systems = [];
  }
}
