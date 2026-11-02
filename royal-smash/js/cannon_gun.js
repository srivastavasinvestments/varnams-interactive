/**
 * cannon_gun.js — Authentic 3D Royal Cannon, Aiming, Trajectory & Firing
 * Accurately models the signature cannon from "Royal Smash!":
 * - Concentric purple & golden segmented ground dais
 * - Vibrant sky-blue trunnion mounting brackets
 * - Glossy crimson red cascabel sphere & rivet-studded band
 * - Royal blue barrel sleeve with embossed golden crown crest
 * - Chunky golden-yellow flared donut muzzle ring
 * - Loaded cannonball inside bore ready to fire
 */
import * as THREE from 'three';

const FIRE_SPEED = 23;       // m/s
const GRAVITY_PREVIEW = -22; // Matches physics world gravity exact

export class RoyalCannon {
  constructor(scene, cameraOrSkin = null, skinId = 'royal') {
    this.scene = scene;
    if (cameraOrSkin && typeof cameraOrSkin === 'object' && cameraOrSkin.isCamera) {
      this.camera = cameraOrSkin;
      this.skinId = skinId;
    } else if (typeof cameraOrSkin === 'string') {
      this.camera = null;
      this.skinId = cameraOrSkin;
    } else {
      this.camera = null;
      this.skinId = skinId;
    }

    // Aim state
    this.azimuth   =  0;     // Y-axis rotation (left/right)
    this.elevation =  0.38;  // X-axis angle (up/down)
    this.AZ_MAX    =  Math.PI / 3.2;
    this.EL_MIN    =  0.08;
    this.EL_MAX    =  0.86;

    // Groups
    this.group       = new THREE.Group(); // Cannon group (rotates azimuth)
    this.barrelPivot = new THREE.Group(); // Barrel + cascabel + muzzle (rotates elevation)
    this._recoilT    = 0;
    this._targetObjs = [];
    this.isWeakSpot  = false;

    this._buildModel(this.skinId);
    this._buildTrajectory();

    // Position cannon in bottom center foreground (100% visible, perfectly framed)
    const aspect = window.innerWidth / window.innerHeight;
    this.updateLayout(aspect);
    this._applyAim();

    scene.add(this.group);
  }

  updateLayout(aspect = 1.0) {
    if (aspect >= 1.0) {
      // Landscape (Laptop/Desktop): Perfectly framed above bottom HUD
      this.group.position.set(0, 2.10, 8.8);
      this.group.scale.set(1.15, 1.15, 1.15);
    } else {
      // Portrait (Mobile): Set comfortably back from castle pedestal so targets & fallen blocks remain in clear view
      this.group.position.set(0, 2.15, 11.2);
      this.group.scale.set(1.10, 1.10, 1.10);
    }
  }

  setTargetObjects(objs) {
    this._targetObjs = objs || [];
    this._refreshTrajectory();
  }

  getBlasterPerks() {
    switch (this.skinId) {
      case 'dragon':
        return { name: 'Dragon Fire', speedMult: 1.06, shockwaveMult: 1.45, burnWood: true, trail: 'fire' };
      case 'tesla':
        return { name: 'Tesla Railgun', speedMult: 1.28, punchMult: 1.6, punchThrough: true, trail: 'plasma' };
      case 'pirate':
        return { name: 'Pirate Bombardier', speedMult: 1.0, ricochetShrapnel: 2, trail: 'smoke' };
      case 'candy':
        return { name: 'Candy Carnival', speedMult: 1.0, bounciness: 0.85, extraShot: true, trail: 'sweet' };
      case 'royal':
      default:
        return { name: 'Royal Sovereign', speedMult: 1.0, coinBonusPct: 15, laserSight: true, trail: 'gold' };
    }
  }

  // ─── 3D Model Construction for 5 Unique Blaster Skins ────────────────────
  setBlasterSkin(skinId = 'royal') {
    this.skinId = skinId;
    while (this.group.children.length > 0) {
      const child = this.group.children[0];
      this.group.remove(child);
      child.traverse(c => {
        if (c.geometry) c.geometry.dispose();
      });
    }
    this.barrelPivot = new THREE.Group();
    this._buildModel(this.skinId);
    this._applyAim();
    this.showTrajectory(true);
    this._refreshTrajectory();
  }

  _buildModel(skinId = 'royal') {
    this.skinId = skinId;

    const add = (parent, geo, mat, pos, rot) => {
      const mesh = new THREE.Mesh(geo, mat);
      if (pos) mesh.position.set(...pos);
      if (rot) mesh.rotation.set(...rot);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      parent.add(mesh);
      return mesh;
    };

    // Common Base Dimensions
    const daisGroup = new THREE.Group();
    daisGroup.position.set(0, -0.42, 0);

    // ─────────────────────────────────────────────────────────────────────────
    // SKIN 1: 👑 ROYAL SOVEREIGN CANNON (Authentic Casual 3D Arcade Design)
    // ─────────────────────────────────────────────────────────────────────────
    if (skinId === 'royal') {
      const m = {
        royalBlue:    new THREE.MeshStandardMaterial({ color: 0x1d4ed8, metalness: 0.12, roughness: 0.20 }),
        skyBracket:   new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.15, roughness: 0.18 }),
        crimsonBreech:new THREE.MeshStandardMaterial({ color: 0xdc2626, metalness: 0.10, roughness: 0.18 }),
        goldPolished: new THREE.MeshStandardMaterial({ color: 0xfbbf24, metalness: 0.35, roughness: 0.18 }),
        goldenDonut:  new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.28, roughness: 0.15 }),
        purpleDais:   new THREE.MeshStandardMaterial({ color: 0x9333ea, metalness: 0.14, roughness: 0.22 }),
        cyanDais:     new THREE.MeshStandardMaterial({ color: 0x06b6d4, metalness: 0.16, roughness: 0.20 }),
        darkBore:     new THREE.MeshBasicMaterial({ color: 0x080808 }),
        ironBall:     new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.40, roughness: 0.20 }),
      };

      // 1. Concentric Royal Arcade Dais (Triple-tier rings matching reference)
      // Tier A (Outer Royal Violet Ring)
      const outerRing = new THREE.Mesh(new THREE.CylinderGeometry(2.6, 2.75, 0.14, 40), m.purpleDais);
      daisGroup.add(outerRing);
      // Tier B (Middle Golden Yellow Ring with studs)
      const midRing = new THREE.Mesh(new THREE.CylinderGeometry(2.05, 2.15, 0.18, 36), m.goldPolished);
      daisGroup.add(midRing);
      for (let i = 0; i < 14; i++) {
        const a = (i / 14) * Math.PI * 2;
        const stud = new THREE.Mesh(new THREE.SphereGeometry(0.065, 8, 8), m.purpleDais);
        stud.position.set(Math.cos(a) * 2.1, 0.08, Math.sin(a) * 2.1);
        daisGroup.add(stud);
      }
      // Tier C (Inner Vivid Turquoise Disc)
      const innerDisc = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.58, 0.22, 32), m.cyanDais);
      daisGroup.add(innerDisc);
      this.group.add(daisGroup);

      // 2. Chunky Sky-Blue Carriage Brackets with Gold Trunnion Caps
      add(this.group, new THREE.CylinderGeometry(0.85, 0.95, 0.32, 28), m.goldPolished, [0, -0.15, 0]);
      [-0.56, 0.56].forEach(x => {
        // Curved semicircular bracket arm
        const bracket = add(this.group, new THREE.BoxGeometry(0.20, 0.72, 0.92), m.skyBracket, [x, 0.18, 0]);
        bracket.rotation.x = -0.10;
        // Trunnion bearing cylinder
        const bearing = add(this.group, new THREE.CylinderGeometry(0.28, 0.28, 0.22, 20), m.skyBracket, [x, 0.48, -0.04]);
        bearing.rotation.z = Math.PI / 2;
        // Shiny golden dome hubcap bolt
        const bolt = add(this.group, new THREE.SphereGeometry(0.16, 16, 16), m.goldPolished, [x + (x > 0 ? 0.04 : -0.04), 0.48, -0.04]);
        bolt.scale.set(0.6, 1.0, 1.0);
      });

      // 3. Stylized Barrel Pivot & Chunky Casual Cannon
      this.barrelPivot.position.set(0, 0.48, -0.04);

      // A) Rear Spherical Crimson Breech
      add(this.barrelPivot, new THREE.SphereGeometry(0.52, 28, 28), m.crimsonBreech, [0, 0, 0.46]);
      // Gold Cascabel Ball at rear
      add(this.barrelPivot, new THREE.SphereGeometry(0.15, 16, 16), m.goldPolished, [0, 0, 0.98]);

      // B) Cylindrical Breech Body
      const midBreech = add(this.barrelPivot, new THREE.CylinderGeometry(0.48, 0.52, 0.88, 28), m.crimsonBreech, [0, 0, -0.15]);
      midBreech.rotation.x = Math.PI / 2;

      // C) Polished Golden Rivet Stud Belt (10 prominent golden domes)
      const rivetBelt = add(this.barrelPivot, new THREE.CylinderGeometry(0.52, 0.52, 0.22, 28), m.goldPolished, [0, 0, -0.15]);
      rivetBelt.rotation.x = Math.PI / 2;
      for (let i = 0; i < 10; i++) {
        const a = (i / 10) * Math.PI * 2;
        add(this.barrelPivot, new THREE.SphereGeometry(0.068, 10, 10), m.goldPolished, [
          Math.cos(a) * 0.53,
          Math.sin(a) * 0.53,
          -0.15
        ]);
      }

      // D) Front Tapered Royal Cobalt Blue Barrel Cone
      const blueBarrel = add(this.barrelPivot, new THREE.CylinderGeometry(0.38, 0.46, 1.25, 28), m.royalBlue, [0, 0, -1.08]);
      blueBarrel.rotation.x = Math.PI / 2;

      // E) Embossed 3D Golden Royal Crown Crest on Blue Barrel
      const crownBase = add(this.barrelPivot, new THREE.BoxGeometry(0.28, 0.08, 0.18), m.goldPolished, [0, 0.46, -1.02]);
      [-0.10, 0, 0.10].forEach((x, idx) => {
        const peakH = (idx === 1) ? 0.16 : 0.12;
        add(this.barrelPivot, new THREE.ConeGeometry(0.05, peakH, 8), m.goldPolished, [x, 0.49 + peakH / 2, -1.02]);
      });

      // F) Signature Thick Golden Donut Muzzle (Plump Torus)
      const donutMuzzle = new THREE.Mesh(new THREE.TorusGeometry(0.38, 0.125, 20, 36), m.goldenDonut);
      donutMuzzle.position.set(0, 0, -1.72);
      this.barrelPivot.add(donutMuzzle);

      // G) Dark Bore Interior & Loaded Cannonball
      const bore = add(this.barrelPivot, new THREE.CylinderGeometry(0.26, 0.26, 0.38, 24), m.darkBore, [0, 0, -1.62]);
      bore.rotation.x = Math.PI / 2;
      this._loadedBall = add(this.barrelPivot, new THREE.SphereGeometry(0.24, 18, 18), m.ironBall, [0, 0, -1.52]);

      this.group.add(this.barrelPivot);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // SKIN 2: 🐉 DRAGON FIRE MORTAR (Volcanic Basalt, Golden Dragon Head & Magma)
    // ─────────────────────────────────────────────────────────────────────────
    else if (skinId === 'dragon') {
      const m = {
        basalt:     new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.35, metalness: 0.25 }),
        crimson:    new THREE.MeshStandardMaterial({ color: 0x991b1b, roughness: 0.25, metalness: 0.20 }),
        dragonGold: new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.20, metalness: 0.35 }),
        magmaCore:  new THREE.MeshStandardMaterial({ color: 0xff4500, emissive: 0xe11d48, emissiveIntensity: 0.65, roughness: 0.10 }),
        darkBore:   new THREE.MeshBasicMaterial({ color: 0x050505 }),
        fireBall:   new THREE.MeshStandardMaterial({ color: 0xf97316, emissive: 0xea580c, emissiveIntensity: 0.4 }),
      };

      // Volcanic Magma Dais
      daisGroup.add(new THREE.Mesh(new THREE.CylinderGeometry(2.3, 2.5, 0.14, 36), m.basalt));
      daisGroup.add(new THREE.Mesh(new THREE.CylinderGeometry(1.75, 1.85, 0.16, 36), m.magmaCore));
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        const claw = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.28, 6), m.dragonGold);
        claw.position.set(Math.cos(a) * 1.9, 0.10, Math.sin(a) * 1.9);
        claw.rotation.z = -Math.cos(a) * 0.4;
        daisGroup.add(claw);
      }
      daisGroup.add(new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.3, 0.18, 32), m.crimson));
      this.group.add(daisGroup);

      // Carriage with dragon spikes
      add(this.group, new THREE.CylinderGeometry(0.75, 0.85, 0.35, 24), m.basalt, [0, -0.15, 0]);
      [-0.52, 0.52].forEach(x => {
        const bracket = add(this.group, new THREE.BoxGeometry(0.18, 0.65, 0.85), m.basalt, [x, 0.15, 0]);
        bracket.rotation.x = -0.12;
        const topCap = add(this.group, new THREE.CylinderGeometry(0.24, 0.24, 0.18, 16), m.crimson, [x, 0.44, -0.04]);
        topCap.rotation.z = Math.PI / 2;
        // Dragon Horn Spikes
        const horn = add(this.group, new THREE.ConeGeometry(0.08, 0.32, 6), m.dragonGold, [x, 0.68, -0.04]);
        horn.rotation.z = x > 0 ? -0.3 : 0.3;
      });

      // Barrel Pivot
      this.barrelPivot.position.set(0, 0.44, -0.04);
      // Volcanic Magma Cascabel
      add(this.barrelPivot, new THREE.SphereGeometry(0.44, 20, 20), m.magmaCore, [0, 0, 0.45]);
      add(this.barrelPivot, new THREE.ConeGeometry(0.15, 0.40, 8), m.dragonGold, [0, 0, 0.95], [Math.PI/2, 0, 0]);

      // Crimson Breech with dragon scale plates
      const midBreech = add(this.barrelPivot, new THREE.CylinderGeometry(0.42, 0.44, 0.85, 24), m.crimson, [0, 0, -0.15]);
      midBreech.rotation.x = Math.PI / 2;
      const goldBand = add(this.barrelPivot, new THREE.CylinderGeometry(0.45, 0.45, 0.22, 24), m.dragonGold, [0, 0, -0.15]);
      goldBand.rotation.x = Math.PI / 2;

      // Dark Basalt Barrel
      const barrel = add(this.barrelPivot, new THREE.CylinderGeometry(0.33, 0.39, 1.25, 24), m.basalt, [0, 0, -1.1]);
      barrel.rotation.x = Math.PI / 2;

      // 🐉 Sculpted Golden Dragon Head Muzzle with Horns & Fangs
      const dragonHead = new THREE.Group();
      dragonHead.position.set(0, 0, -1.75);
      // Main Jaw Ring
      dragonHead.add(new THREE.Mesh(new THREE.TorusGeometry(0.34, 0.09, 16, 28), m.dragonGold));
      // Top Snout & Horns
      const snout = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.16, 0.35), m.dragonGold);
      snout.position.set(0, 0.32, 0.10);
      dragonHead.add(snout);
      [-0.14, 0.14].forEach(hx => {
        const horn = new THREE.Mesh(new THREE.ConeGeometry(0.065, 0.38, 8), m.magmaCore);
        horn.position.set(hx, 0.52, 0.18);
        horn.rotation.x = -0.5;
        horn.rotation.z = hx > 0 ? -0.2 : 0.2;
        dragonHead.add(horn);
      });
      // Sharp Dragon Fangs
      [-0.18, 0, 0.18].forEach(fx => {
        const fang = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.16, 6), m.dragonGold);
        fang.position.set(fx, 0.24, -0.08);
        fang.rotation.x = Math.PI;
        dragonHead.add(fang);
      });
      this.barrelPivot.add(dragonHead);

      const bore = add(this.barrelPivot, new THREE.CylinderGeometry(0.23, 0.23, 0.35, 20), m.darkBore, [0, 0, -1.65]);
      bore.rotation.x = Math.PI / 2;
      this._loadedBall = add(this.barrelPivot, new THREE.SphereGeometry(0.21, 16, 16), m.fireBall, [0, 0, -1.55]);
      this.group.add(this.barrelPivot);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // SKIN 3: ⚡ TESLA ARC BLASTER (Polished Titanium, Neon Cyan Coils & Plasma)
    // ─────────────────────────────────────────────────────────────────────────
    else if (skinId === 'tesla') {
      const m = {
        chrome:     new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.85, roughness: 0.12 }),
        darkCarbon: new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.25, metalness: 0.30 }),
        neonCyan:   new THREE.MeshStandardMaterial({ color: 0x00e5ff, emissive: 0x00b4d8, emissiveIntensity: 0.85, roughness: 0.05 }),
        deepNavy:   new THREE.MeshStandardMaterial({ color: 0x1e3a8a, metalness: 0.40, roughness: 0.18 }),
        darkBore:   new THREE.MeshBasicMaterial({ color: 0x020617 }),
        plasmaBall: new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0284c7, emissiveIntensity: 0.7 }),
      };

      // Cyber Dais with concentric glowing circuits
      daisGroup.add(new THREE.Mesh(new THREE.CylinderGeometry(2.3, 2.5, 0.14, 36), m.darkCarbon));
      daisGroup.add(new THREE.Mesh(new THREE.CylinderGeometry(1.85, 1.85, 0.16, 36), m.neonCyan));
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        const conduit = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.18, 0.55), m.chrome);
        conduit.position.set(Math.cos(a) * 1.8, 0, Math.sin(a) * 1.8);
        conduit.rotation.y = -a;
        daisGroup.add(conduit);
      }
      daisGroup.add(new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.3, 0.18, 32), m.chrome));
      this.group.add(daisGroup);

      // High-tech Chrome Brackets
      add(this.group, new THREE.CylinderGeometry(0.75, 0.85, 0.35, 24), m.darkCarbon, [0, -0.15, 0]);
      [-0.52, 0.52].forEach(x => {
        const bracket = add(this.group, new THREE.BoxGeometry(0.18, 0.65, 0.85), m.chrome, [x, 0.15, 0]);
        bracket.rotation.x = -0.12;
        const topCap = add(this.group, new THREE.CylinderGeometry(0.24, 0.24, 0.18, 16), m.deepNavy, [x, 0.44, -0.04]);
        topCap.rotation.z = Math.PI / 2;
        // Cyan Power Core Node
        const node = add(this.group, new THREE.SphereGeometry(0.09, 12, 12), m.neonCyan, [x + (x > 0 ? 0.04 : -0.04), 0.44, -0.04]);
      });

      // Barrel Pivot
      this.barrelPivot.position.set(0, 0.44, -0.04);
      // Reactor Sphere
      add(this.barrelPivot, new THREE.SphereGeometry(0.44, 20, 20), m.darkCarbon, [0, 0, 0.45]);
      add(this.barrelPivot, new THREE.SphereGeometry(0.24, 16, 16), m.neonCyan, [0, 0, 0.55]);

      // Polished Chrome Breech
      const midBreech = add(this.barrelPivot, new THREE.CylinderGeometry(0.42, 0.44, 0.85, 24), m.chrome, [0, 0, -0.15]);
      midBreech.rotation.x = Math.PI / 2;

      // Chrome Forward Barrel
      const barrel = add(this.barrelPivot, new THREE.CylinderGeometry(0.33, 0.38, 1.25, 24), m.chrome, [0, 0, -1.1]);
      barrel.rotation.x = Math.PI / 2;

      // 3 Glowing Neon Cyan Energy Coils
      [-0.75, -1.10, -1.45].forEach(z => {
        const coil = new THREE.Mesh(new THREE.TorusGeometry(0.38, 0.05, 12, 24), m.neonCyan);
        coil.position.set(0, 0, z);
        this.barrelPivot.add(coil);
      });

      // Rail-Cannon Muzzle Collar
      const muzzleRing = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.36, 0.22, 8), m.darkCarbon);
      muzzleRing.position.set(0, 0, -1.75);
      muzzleRing.rotation.x = Math.PI / 2;
      this.barrelPivot.add(muzzleRing);

      const bore = add(this.barrelPivot, new THREE.CylinderGeometry(0.23, 0.23, 0.35, 20), m.darkBore, [0, 0, -1.65]);
      bore.rotation.x = Math.PI / 2;
      this._loadedBall = add(this.barrelPivot, new THREE.SphereGeometry(0.21, 16, 16), m.plasmaBall, [0, 0, -1.55]);
      this.group.add(this.barrelPivot);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // SKIN 4: 🏴‍☠️ GOLDEN PIRATE BOMBARDIER (Black Cast Iron, 3D Skull, Brass)
    // ─────────────────────────────────────────────────────────────────────────
    else if (skinId === 'pirate') {
      const m = {
        castIron:     new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.40, metalness: 0.35 }),
        antiqueBrass: new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.22, metalness: 0.50 }),
        shipWood:     new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.45, metalness: 0.10 }),
        skullGold:    new THREE.MeshStandardMaterial({ color: 0xffd700, roughness: 0.18, metalness: 0.35 }),
        rubyEye:      new THREE.MeshStandardMaterial({ color: 0xdc2626, emissive: 0x991b1b, emissiveIntensity: 0.5 }),
        darkBore:     new THREE.MeshBasicMaterial({ color: 0x020202 }),
        cannonball:   new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.30, metalness: 0.40 }),
      };

      // Galleon Deck Wood Dais
      daisGroup.add(new THREE.Mesh(new THREE.CylinderGeometry(2.3, 2.5, 0.14, 36), m.shipWood));
      daisGroup.add(new THREE.Mesh(new THREE.CylinderGeometry(1.75, 1.85, 0.16, 36), m.antiqueBrass));
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        const rivet = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 8), m.skullGold);
        rivet.position.set(Math.cos(a) * 1.8, 0.08, Math.sin(a) * 1.8);
        daisGroup.add(rivet);
      }
      daisGroup.add(new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.3, 0.18, 32), m.shipWood));
      this.group.add(daisGroup);

      // Heavy Bronze Brackets
      add(this.group, new THREE.CylinderGeometry(0.75, 0.85, 0.35, 24), m.shipWood, [0, -0.15, 0]);
      [-0.52, 0.52].forEach(x => {
        const bracket = add(this.group, new THREE.BoxGeometry(0.18, 0.65, 0.85), m.antiqueBrass, [x, 0.15, 0]);
        bracket.rotation.x = -0.12;
        const topCap = add(this.group, new THREE.CylinderGeometry(0.24, 0.24, 0.18, 16), m.castIron, [x, 0.44, -0.04]);
        topCap.rotation.z = Math.PI / 2;
      });

      // Barrel Pivot
      this.barrelPivot.position.set(0, 0.44, -0.04);
      add(this.barrelPivot, new THREE.SphereGeometry(0.44, 20, 20), m.castIron, [0, 0, 0.45]);
      // Rope collar finial
      const rope = add(this.barrelPivot, new THREE.TorusGeometry(0.16, 0.04, 8, 16), m.antiqueBrass, [0, 0, 0.85]);

      // Heavy Cast Iron Breech
      const midBreech = add(this.barrelPivot, new THREE.CylinderGeometry(0.42, 0.44, 0.85, 24), m.castIron, [0, 0, -0.15]);
      midBreech.rotation.x = Math.PI / 2;
      const brassCollar = add(this.barrelPivot, new THREE.CylinderGeometry(0.45, 0.45, 0.18, 24), m.antiqueBrass, [0, 0, -0.15]);
      brassCollar.rotation.x = Math.PI / 2;

      // Forward Barrel
      const barrel = add(this.barrelPivot, new THREE.CylinderGeometry(0.33, 0.39, 1.25, 24), m.castIron, [0, 0, -1.1]);
      barrel.rotation.x = Math.PI / 2;

      // 💀 3D Sculpted Golden Pirate Skull & Crossbones Emblem
      const skullGroup = new THREE.Group();
      skullGroup.position.set(0, 0.42, -1.05);
      // Skull Cranium
      const cranium = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 12), m.skullGold);
      skullGroup.add(cranium);
      // Jaw
      const jaw = new THREE.Mesh(new THREE.BoxGeometry(0.10, 0.08, 0.08), m.skullGold);
      jaw.position.set(0, -0.10, 0.02);
      skullGroup.add(jaw);
      // Glowing Ruby Eye Sockets
      [-0.045, 0.045].forEach(ex => {
        const eye = new THREE.Mesh(new THREE.SphereGeometry(0.03, 8, 8), m.rubyEye);
        eye.position.set(ex, 0.01, 0.10);
        skullGroup.add(eye);
      });
      // Crossbones
      [-0.4, 0.4].forEach(rot => {
        const bone = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.38, 8), m.skullGold);
        bone.rotation.z = rot;
        bone.position.set(0, -0.04, -0.03);
        skullGroup.add(bone);
      });
      this.barrelPivot.add(skullGroup);

      // Heavy Antique Brass Flared Bell Muzzle
      const muzzle = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.32, 0.32, 24), m.antiqueBrass);
      muzzle.position.set(0, 0, -1.75);
      muzzle.rotation.x = Math.PI / 2;
      this.barrelPivot.add(muzzle);

      const bore = add(this.barrelPivot, new THREE.CylinderGeometry(0.23, 0.23, 0.35, 20), m.darkBore, [0, 0, -1.65]);
      bore.rotation.x = Math.PI / 2;
      this._loadedBall = add(this.barrelPivot, new THREE.SphereGeometry(0.21, 16, 16), m.cannonball, [0, 0, -1.55]);
      this.group.add(this.barrelPivot);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // SKIN 5: 🍭 CANDY PEPPERMINT BLASTER (Strawberry Glaze, Candy Cane, Caramel)
    // ─────────────────────────────────────────────────────────────────────────
    else if (skinId === 'candy') {
      const m = {
        candyPink:   new THREE.MeshStandardMaterial({ color: 0xf43f5e, roughness: 0.15, metalness: 0.10 }),
        creamWhite:  new THREE.MeshStandardMaterial({ color: 0xfff1f2, roughness: 0.20, metalness: 0.08 }),
        mintGreen:   new THREE.MeshStandardMaterial({ color: 0x10b981, roughness: 0.22, metalness: 0.10 }),
        caramelGold: new THREE.MeshStandardMaterial({ color: 0xfbbf24, roughness: 0.18, metalness: 0.22 }),
        darkBore:    new THREE.MeshBasicMaterial({ color: 0x4c0519 }),
        candyBall:   new THREE.MeshStandardMaterial({ color: 0xfb7185, roughness: 0.12, metalness: 0.15 }),
      };

      // Candy Dais
      daisGroup.add(new THREE.Mesh(new THREE.CylinderGeometry(2.3, 2.5, 0.14, 36), m.candyPink));
      daisGroup.add(new THREE.Mesh(new THREE.CylinderGeometry(1.75, 1.85, 0.16, 36), m.creamWhite));
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2;
        const sprinkle = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.18, 0.30), i % 2 === 0 ? m.mintGreen : m.caramelGold);
        sprinkle.position.set(Math.cos(a) * 1.8, 0, Math.sin(a) * 1.8);
        sprinkle.rotation.y = -a;
        daisGroup.add(sprinkle);
      }
      daisGroup.add(new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.3, 0.18, 32), m.candyPink));
      this.group.add(daisGroup);

      // Mint Candy Carriage
      add(this.group, new THREE.CylinderGeometry(0.75, 0.85, 0.35, 24), m.caramelGold, [0, -0.15, 0]);
      [-0.52, 0.52].forEach(x => {
        const bracket = add(this.group, new THREE.BoxGeometry(0.18, 0.65, 0.85), m.mintGreen, [x, 0.15, 0]);
        bracket.rotation.x = -0.12;
        const topCap = add(this.group, new THREE.CylinderGeometry(0.24, 0.24, 0.18, 16), m.creamWhite, [x, 0.44, -0.04]);
        topCap.rotation.z = Math.PI / 2;
      });

      // Barrel Pivot
      this.barrelPivot.position.set(0, 0.44, -0.04);
      // Strawberry Gumdrop Cascabel
      add(this.barrelPivot, new THREE.SphereGeometry(0.44, 20, 20), m.candyPink, [0, 0, 0.45]);
      add(this.barrelPivot, new THREE.SphereGeometry(0.14, 12, 12), m.creamWhite, [0, 0, 0.90]);

      // Striped Breech
      const midBreech = add(this.barrelPivot, new THREE.CylinderGeometry(0.42, 0.44, 0.85, 24), m.creamWhite, [0, 0, -0.15]);
      midBreech.rotation.x = Math.PI / 2;
      const swirlRing = add(this.barrelPivot, new THREE.CylinderGeometry(0.45, 0.45, 0.22, 24), m.candyPink, [0, 0, -0.15]);
      swirlRing.rotation.x = Math.PI / 2;

      // Candy Swirl Forward Barrel
      const barrel = add(this.barrelPivot, new THREE.CylinderGeometry(0.33, 0.39, 1.25, 24), m.candyPink, [0, 0, -1.1]);
      barrel.rotation.x = Math.PI / 2;
      // White Candy Spiral Ring
      const spiralRing = add(this.barrelPivot, new THREE.TorusGeometry(0.37, 0.04, 10, 24), m.creamWhite, [0, 0, -1.1]);

      // 🍩 Caramel Glazed Donut Muzzle
      const donutMuzzle = new THREE.Mesh(new THREE.TorusGeometry(0.33, 0.09, 16, 28), m.caramelGold);
      donutMuzzle.position.set(0, 0, -1.75);
      this.barrelPivot.add(donutMuzzle);

      const bore = add(this.barrelPivot, new THREE.CylinderGeometry(0.23, 0.23, 0.35, 20), m.darkBore, [0, 0, -1.65]);
      bore.rotation.x = Math.PI / 2;
      this._loadedBall = add(this.barrelPivot, new THREE.SphereGeometry(0.21, 16, 16), m.candyBall, [0, 0, -1.55]);
      this.group.add(this.barrelPivot);
    }
  }

  // ─── Trajectory Preview (Gleaming golden glowing beads) ───────────────────
  // ─── Trajectory Preview & 3D Target Impact Reticle ────────────────────────
  _buildTrajectory() {
    const N = 32;
    this._dots = [];
    for (let i = 0; i < N; i++) {
      const mat = new THREE.MeshBasicMaterial({
        color: 0xffe066,
        transparent: true,
        opacity: 0.95,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      // Plump glowing spheres easily visible on mobile and desktop
      const radius = Math.max(0.045, 0.10 - i * 0.0018);
      const dot = new THREE.Mesh(new THREE.SphereGeometry(radius, 10, 10), mat);
      dot.visible = false;
      this.scene.add(dot);
      this._dots.push(dot);
    }

    // 🎯 Dynamic 3D Royal Target Reticle (Impact Ring with Crosshairs)
    this._reticle = new THREE.Group();
    const retMat = new THREE.MeshBasicMaterial({
      color: 0xffd700,
      transparent: true,
      opacity: 0.95,
      side: THREE.DoubleSide,
      depthTest: false,
    });
    // Outer Ring
    const outerRing = new THREE.Mesh(new THREE.RingGeometry(0.24, 0.28, 28), retMat);
    this._reticle.add(outerRing);
    // Inner Ring
    const innerRing = new THREE.Mesh(new THREE.RingGeometry(0.09, 0.12, 20), retMat);
    this._reticle.add(innerRing);
    // 4 Crosshair ticks
    [0, Math.PI / 2, Math.PI, Math.PI * 1.5].forEach(ang => {
      const tick = new THREE.Mesh(new THREE.PlaneGeometry(0.03, 0.12), retMat);
      tick.position.set(Math.cos(ang) * 0.20, Math.sin(ang) * 0.20, 0);
      tick.rotation.z = ang;
      this._reticle.add(tick);
    });
    // Center Pip
    const pip = new THREE.Mesh(new THREE.CircleGeometry(0.035, 12), retMat);
    this._reticle.add(pip);

    this._reticle.visible = false;
    this.scene.add(this._reticle);
    this._activeSpeedMult = 1.0;
    this._activeAmmoType = 'normal';
    this._reticleTime = 0;
  }

  // ─── Aiming Controls ──────────────────────────────────────────────────────
  setAmmoType(type, speedMult = 1.0) {
    this._activeAmmoType = type;
    this._activeSpeedMult = speedMult;

    // Dynamically update loaded cannonball inside the muzzle chamber
    if (this._loadedBall) {
      if (type === 'bomb') {
        this._loadedBall.material = new THREE.MeshStandardMaterial({
          color: 0xdc2626, emissive: 0xef4444, emissiveIntensity: 0.65, roughness: 0.20
        });
      } else if (type === 'heavy') {
        this._loadedBall.material = new THREE.MeshStandardMaterial({
          color: 0xd97706, metalness: 0.65, roughness: 0.20, emissive: 0xb45309, emissiveIntensity: 0.25
        });
      } else if (type === 'roller') {
        this._loadedBall.material = new THREE.MeshStandardMaterial({
          color: 0x059669, roughness: 0.15, metalness: 0.35, emissive: 0x10b981, emissiveIntensity: 0.30
        });
      } else if (type === 'slipper') {
        this._loadedBall.material = new THREE.MeshStandardMaterial({
          color: 0x06b6d4, roughness: 0.40, emissive: 0x0891b2, emissiveIntensity: 0.25
        });
      } else if (type === 'boot') {
        this._loadedBall.material = new THREE.MeshStandardMaterial({
          color: 0x3b1c0a, roughness: 0.40, metalness: 0.20
        });
      } else if (type === 'splash') {
        this._loadedBall.material = new THREE.MeshStandardMaterial({
          color: 0x00d2ff, transparent: true, opacity: 0.85, roughness: 0.10, emissive: 0x0284c7, emissiveIntensity: 0.30
        });
      } else if (type === 'cluster') {
        this._loadedBall.material = new THREE.MeshStandardMaterial({
          color: 0xd90429, roughness: 0.25, metalness: 0.35, emissive: 0xef4444, emissiveIntensity: 0.35
        });
      } else if (type === 'fever') {
        this._loadedBall.material = new THREE.MeshStandardMaterial({
          color: 0xffd700, metalness: 0.70, roughness: 0.10, emissive: 0xf59e0b, emissiveIntensity: 0.75
        });
      } else {
        // Standard Iron Ball: Solid slate gunmetal iron
        this._loadedBall.material = new THREE.MeshStandardMaterial({
          color: 0x334155, metalness: 0.75, roughness: 0.25
        });
      }
    }

    this._refreshTrajectory();
  }

  aim(dAz, dEl) {
    this.azimuth   = Math.max(-this.AZ_MAX, Math.min(this.AZ_MAX, this.azimuth   + dAz));
    this.elevation = Math.max(this.EL_MIN,  Math.min(this.EL_MAX,  this.elevation + dEl));
    this._applyAim();
    this._refreshTrajectory();
  }

  setAimDirect(az, el) {
    this.azimuth   = Math.max(-this.AZ_MAX, Math.min(this.AZ_MAX, az));
    this.elevation = Math.max(this.EL_MIN,  Math.min(this.EL_MAX, el));
    this._applyAim();
    this._refreshTrajectory();
  }

  aimAtWorldPoint(p, speedMult = null) {
    if (speedMult) this._activeSpeedMult = speedMult;
    const v = FIRE_SPEED * this._activeSpeedMult;
    const g = 22; // physics world gravity magnitude
    const v2 = v * v;

    // 2-pass iterative solver to account for muzzle shift with elevation
    for (let iter = 0; iter < 2; iter++) {
      const m = this.getMuzzleWorld();
      const dx = p.x - m.x;
      const dz = p.z - m.z;
      const dy = p.y - m.y;
      const targetAz = Math.atan2(dx, -dz);
      const horizDist = Math.hypot(dx, dz);

      const disc = v2 * v2 - g * (g * horizDist * horizDist + 2 * dy * v2);
      let targetEl = Math.atan2(dy, horizDist); // fallback line of sight
      if (disc >= 0 && horizDist > 0.1) {
        targetEl = Math.atan((v2 - Math.sqrt(disc)) / (g * horizDist));
      }

      this.azimuth   = Math.max(-this.AZ_MAX, Math.min(this.AZ_MAX, targetAz));
      this.elevation = Math.max(this.EL_MIN,  Math.min(this.EL_MAX, targetEl));
      this._applyAim();
    }
    this._refreshTrajectory();
  }

  _applyAim() {
    // Negative azimuth rotates Three.js group around +Y so barrel points towards +X (right)
    this.group.rotation.y       = -this.azimuth;
    // Positive elevation rotates Three.js barrel around +X so barrel points towards +Y (up)
    this.barrelPivot.rotation.x =  this.elevation;
  }

  getFireDir() {
    const d = new THREE.Vector3();
    d.x =  Math.sin(this.azimuth)   * Math.cos(this.elevation);
    d.y =  Math.sin(this.elevation);
    d.z = -Math.cos(this.azimuth)   * Math.cos(this.elevation);
    return d.normalize();
  }

  getMuzzleWorld() {
    // Muzzle tip is at local (0, 0, -1.82) relative to barrelPivot
    const tip = new THREE.Vector3(0, 0, -1.82);
    tip.applyEuler(new THREE.Euler(this.elevation, 0, 0));
    tip.add(this.barrelPivot.position);
    tip.multiply(this.group.scale);
    tip.applyEuler(new THREE.Euler(0, -this.azimuth, 0));
    tip.add(this.group.position);
    return tip;
  }

  _refreshTrajectory() {
    const DT = 0.052;
    const speed = FIRE_SPEED * this._activeSpeedMult;
    const dir  = this.getFireDir();
    let vx = dir.x * speed, vy = dir.y * speed, vz = dir.z * speed;
    const m = this.getMuzzleWorld();
    let px = m.x, py = m.y, pz = m.z;

    // Color code trajectory beads by ammo type
    let beadColor = 0xffffff; // Clean silver-white for precision iron ball
    if (this._activeAmmoType === 'bomb')    beadColor = 0xef4444; // Fiery red
    if (this._activeAmmoType === 'heavy')   beadColor = 0xf59e0b; // Heavy golden brass
    if (this._activeAmmoType === 'roller')  beadColor = 0x10b981; // Emerald green
    if (this._activeAmmoType === 'slipper') beadColor = 0x06b6d4; // Cyan
    if (this._activeAmmoType === 'boot')    beadColor = 0xb45309; // Leather bronze
    if (this._activeAmmoType === 'splash')  beadColor = 0x38bdf8; // Aqua
    if (this._activeAmmoType === 'cluster') beadColor = 0xf43f5e; // Rocket ruby
    if (this._activeAmmoType === 'fever')   beadColor = 0xffd700; // Royal gold

    let hitFound = false;
    let hitX = px, hitY = py, hitZ = pz;
    let hitNormal = new THREE.Vector3(0, 1, 0);
    this.isWeakSpot = false;

    for (let i = 0; i < this._dots.length; i++) {
      if (hitFound) {
        this._dots[i].visible = false;
        continue;
      }

      this._dots[i].position.set(px, py, pz);
      this._dots[i].visible = true;
      this._dots[i].material.color.setHex(beadColor);
      this._dots[i].material.opacity = Math.max(0.18, 0.98 - i * 0.026);

      vy += GRAVITY_PREVIEW * DT;
      px += vx * DT; py += vy * DT; pz += vz * DT;

      // 1. Target Cans & Structural Blocks Collision Test
      if (this._targetObjs && this._targetObjs.length > 0) {
        for (let j = 0; j < this._targetObjs.length; j++) {
          const obj = this._targetObjs[j];
          if (!obj || obj.fallen || !obj.mesh) continue;
          const op = obj.mesh.position;
          const dx = Math.abs(px - op.x);
          const dy = Math.abs(py - op.y);
          const dz = Math.abs(pz - op.z);
          const r = obj.isCan ? 0.42 : 0.52;
          if (dx < r && dy < (obj.isCan ? 0.65 : r) && dz < r) {
            hitFound = true;
            hitX = px; hitY = py; hitZ = pz;
            hitNormal.set(px - op.x, py - op.y, pz - op.z).normalize();
            // Only true designated boss/keystone objects count as weak spots
            if (obj.isWeakSpot || obj.isBoss || obj.isBossPart) {
              this.isWeakSpot = true;
            }
            break;
          }
        }
      }

      if (hitFound) continue;

      // 2. Table surface impact test (table is at y = 3.66, within X=[-2.8, 2.8], Z=[-2.2, 2.2])
      if (py <= 3.66 && Math.abs(px) <= 2.8 && Math.abs(pz) <= 2.2 && vy < 0) {
        hitFound = true;
        hitX = px; hitY = 3.66; hitZ = pz;
        hitNormal.set(0, 1, 0);
      } else if (py <= 0.05 && vy < 0) {
        // Ground impact
        hitFound = true;
        hitX = px; hitY = 0.06; hitZ = pz;
        hitNormal.set(0, 1, 0);
      }
    }

    if (hitFound && this._reticle) {
      this._reticle.visible = true;
      this._reticle.position.set(hitX, hitY + 0.02, hitZ);
      // Billboard reticle so it ALWAYS faces the player/camera (crisp round crosshair bullseye)
      if (this.camera) {
        this._reticle.quaternion.copy(this.camera.quaternion);
      } else {
        this._reticle.rotation.set(-0.35, 0, 0);
      }
      const retColor = this.isWeakSpot ? 0xf59e0b : beadColor;
      this._reticle.children.forEach(c => {
        if (c.material) c.material.color.setHex(retColor);
      });
      const baseScale = this.isWeakSpot ? 1.30 : 1.05;
      this._reticle.scale.set(baseScale, baseScale, baseScale);
    } else if (this._reticle) {
      this._reticle.visible = false;
    }
  }

  showTrajectory(show) {
    this._dots.forEach(d => (d.visible = show));
    if (this._reticle) this._reticle.visible = show;
    if (show) this._refreshTrajectory();
  }

  // ─── Fire Action ──────────────────────────────────────────────────────────
  fire() {
    this._recoilT = 0.35;
    if (this._loadedBall) {
      this._loadedBall.scale.set(0.01, 0.01, 0.01);
      setTimeout(() => {
        if (this._loadedBall) this._loadedBall.scale.set(1, 1, 1);
      }, 400);
    }
    const perks = this.getBlasterPerks();
    const finalSpeed = FIRE_SPEED * this._activeSpeedMult * perks.speedMult;
    return {
      position: this.getMuzzleWorld(),
      velocity: this.getFireDir().multiplyScalar(finalSpeed),
      perks,
      isWeakSpot: this.isWeakSpot,
      skinId: this.skinId,
    };
  }

  // ─── Animation Update ─────────────────────────────────────────────────────
  update(dt) {
    if (this._recoilT > 0) {
      this._recoilT -= dt * 3.8;
      // Kick barrel backward along Z
      this.barrelPivot.position.z = -0.04 + Math.sin(Math.max(0, this._recoilT) * Math.PI) * 0.35;
    } else {
      this.barrelPivot.position.z = -0.04;
    }

    // Dynamic Reticle Pulse, Spin, and Billboard alignment
    if (this._reticle && this._reticle.visible) {
      this._reticleTime = (this._reticleTime || 0) + dt;
      if (this.camera) {
        this._reticle.quaternion.copy(this.camera.quaternion);
      }
      this._reticle.rotateZ(dt * 1.5);
      const baseScale = this.isWeakSpot ? 1.5 : 1.1;
      const s = baseScale * (1.0 + Math.sin(this._reticleTime * 6) * 0.10);
      this._reticle.scale.set(s, s, s);
    }
  }

  dispose() {
    this._dots.forEach(d => {
      this.scene.remove(d);
      d.geometry.dispose();
    });
    if (this._reticle) {
      this.scene.remove(this._reticle);
      this._reticle.traverse(c => {
        if (c.geometry) c.geometry.dispose();
      });
    }
    this.scene.remove(this.group);
  }
}
