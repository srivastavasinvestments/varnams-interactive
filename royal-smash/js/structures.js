/**
 * structures.js — Authentic 3D Royal Smash Structures, Blocks, Pedestal & Materials
 * Matches the exact aesthetics of Cypher Games' "Royal Smash!":
 * - Authentic Silver Royal Cans with gold crown battlement bands & purple cutouts
 * - Royal Blue Crown Cans (signature hero cans from official game art)
 * - Royal Purple Fleur-de-lis cans & cubes
 * - Pink Peppermint Candy cylinders
 * - Orange candy rolling cans with 14-blade pinwheel end caps
 * - Jade / Emerald & Obsidian / Midnight cans for progressive world themes
 * - Royal Gemstone Beams with gold collars and ruby jewel studs
 * - Elegant golden candlestick pedestal with arched bell base & adaptive world platforms
 * - Multi-block Boss portrait frame with crystal-clear photo rendering
 */
import * as THREE from 'three';
import { customTargets } from './custom_target.js';
import { textureGen }    from './textures.js';

// ─── Shared PBR Materials Singleton ──────────────────────────────────────────
let _mats = null;
function getMats() {
  if (_mats) return _mats;
  _mats = {
    // 1. Silver Royal Can with Gold Battlement
    silverCanMat: new THREE.MeshStandardMaterial({
      map: textureGen.getSilverRoyalCanTexture(),
      roughness: 0.22,
      metalness: 0.16,
    }),
    // 2. Royal Blue Hero Can with Gold Crown Crest
    royalBlueCanMat: new THREE.MeshStandardMaterial({
      map: textureGen.getRoyalBlueCanTexture(),
      roughness: 0.20,
      metalness: 0.15,
    }),
    // 3. Fleur-de-lis Purple Can
    fleurCanMat: new THREE.MeshStandardMaterial({
      map: textureGen.getFleurCanTexture(),
      roughness: 0.22,
      metalness: 0.15,
    }),
    // 4. Pink Candy Peppermint Can
    pinkCanMat: new THREE.MeshStandardMaterial({
      map: textureGen.getPinkCanTexture(),
      roughness: 0.24,
      metalness: 0.10,
    }),
    // 5. Jade / Emerald Can (World 5)
    jadeCanMat: new THREE.MeshStandardMaterial({
      map: textureGen.getJadeCanTexture(),
      roughness: 0.22,
      metalness: 0.14,
    }),
    // 6. Obsidian / Midnight Can (World 4)
    obsidianCanMat: new THREE.MeshStandardMaterial({
      map: textureGen.getObsidianCanTexture(),
      roughness: 0.22,
      metalness: 0.16,
    }),
    // 7. Polished Gold
    goldPolished: new THREE.MeshStandardMaterial({
      color: 0xffd700,
      metalness: 0.22,
      roughness: 0.18,
    }),
    // 8. Warm Radiant Golden Amber (Candlestick Column)
    goldWarm: new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      metalness: 0.14,
      roughness: 0.24,
    }),
    // 9. Radiant Royal Violet/Purple
    purpleEnamel: new THREE.MeshStandardMaterial({
      color: 0x7c3aed,
      metalness: 0.12,
      roughness: 0.26,
    }),
    // 10. Deep Purple
    purpleDeep: new THREE.MeshStandardMaterial({
      color: 0x4c1d95,
      metalness: 0.15,
      roughness: 0.25,
    }),
    // 11. Silver Metal Trim
    silverMetal: new THREE.MeshStandardMaterial({
      color: 0xd8e4f0,
      metalness: 0.20,
      roughness: 0.20,
    }),
    // 12. Gemstone Beams
    beamSilver: new THREE.MeshStandardMaterial({
      color: 0x93c5fd,
      metalness: 0.18,
      roughness: 0.22,
    }),
    // 13. Ruby Gemstones with glowing core
    rubyGem: new THREE.MeshStandardMaterial({
      color: 0xf43f5e,
      metalness: 0.10,
      roughness: 0.05,
      emissive: 0xe11d48,
      emissiveIntensity: 0.50,
    }),
    // 14. Emerald Gemstones
    emeraldGem: new THREE.MeshStandardMaterial({
      color: 0x10b981,
      metalness: 0.10,
      roughness: 0.05,
      emissive: 0x059669,
      emissiveIntensity: 0.50,
    }),
    // 15. Orange Rolling Candy
    orangeCandy: new THREE.MeshStandardMaterial({
      color: 0xf97316,
      metalness: 0.12,
      roughness: 0.22,
    }),
    // 16. Navy / Royal Block
    navyBlock: new THREE.MeshStandardMaterial({
      color: 0x1e3a8a,
      metalness: 0.15,
      roughness: 0.22,
    }),
    // 17. Fleur Cube
    fleurCubeMat: new THREE.MeshStandardMaterial({
      map: textureGen.getFleurDeLisTexture(),
      roughness: 0.22,
      metalness: 0.15,
    }),
    // 18. Pinwheel Disc
    pinwheelMat: new THREE.MeshStandardMaterial({
      map: textureGen.getPinwheelTexture(),
      roughness: 0.18,
      metalness: 0.12,
    }),
    // 19. Can Lid
    canLid: new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      metalness: 0.25,
      roughness: 0.18,
    }),
    // 20. Coastal Weathered Timber Wood Plank
    timberMat: new THREE.MeshStandardMaterial({
      map: textureGen.getTimberTexture(),
      roughness: 0.65,
      metalness: 0.05,
    }),
    // 21. Coastal Pirate Oak Rum Barrel Staves
    barrelMat: new THREE.MeshStandardMaterial({
      map: textureGen.getBarrelTexture(),
      roughness: 0.45,
      metalness: 0.15,
    }),
    // 22. Sunset Terracotta Clay Brick
    terracottaMat: new THREE.MeshStandardMaterial({
      map: textureGen.getTerracottaTexture(),
      roughness: 0.70,
      metalness: 0.02,
    }),
    // 23. Sunset Hammered Bronze / Copper Urn
    bronzeUrnMat: new THREE.MeshStandardMaterial({
      map: textureGen.getBronzeUrnTexture(),
      roughness: 0.28,
      metalness: 0.40,
    }),
    // 24. Palace Polished White Marble
    marbleMat: new THREE.MeshStandardMaterial({
      map: textureGen.getMarbleTexture(),
      roughness: 0.16,
      metalness: 0.08,
    }),
    // 25. Prismatic Amethyst / Crystal
    crystalMat: new THREE.MeshStandardMaterial({
      color: 0xc084fc,
      roughness: 0.08,
      metalness: 0.15,
      transparent: true,
      opacity: 0.88,
      emissive: 0x7c3aed,
      emissiveIntensity: 0.45,
    }),
    // 26. Night Obsidian with Neon Runes
    obsidianRuneMat: new THREE.MeshStandardMaterial({
      map: textureGen.getObsidianRuneTexture(),
      roughness: 0.18,
      metalness: 0.30,
      emissive: 0x0284c7,
      emissiveIntensity: 0.30,
    }),
    // 27. Electric Cyan Plasma Can
    plasmaCanMat: new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      roughness: 0.10,
      metalness: 0.20,
      emissive: 0x0284c7,
      emissiveIntensity: 0.65,
    }),
    // 28. Tropical Woven Bamboo Crate
    bambooMat: new THREE.MeshStandardMaterial({
      map: textureGen.getBambooTexture(),
      roughness: 0.55,
      metalness: 0.05,
    }),
    // 29. Imperial Heavy Riveted Iron Vault
    ironVaultMat: new THREE.MeshStandardMaterial({
      map: textureGen.getIronVaultTexture(),
      roughness: 0.32,
      metalness: 0.55,
    }),
    // 30. Gilded Gold Ingot Bar
    goldIngotMat: new THREE.MeshStandardMaterial({
      color: 0xffd700,
      roughness: 0.15,
      metalness: 0.65,
    }),
    // 31. Dark Iron Corner Braces
    ironDark: new THREE.MeshStandardMaterial({
      color: 0x334155,
      roughness: 0.35,
      metalness: 0.50,
    }),
    // 32. Warm Bronze Trim
    bronzeTrim: new THREE.MeshStandardMaterial({
      color: 0xb45309,
      roughness: 0.30,
      metalness: 0.45,
    }),
  };
  return _mats;
}

function addMesh(parent, geo, mat, pos, rot) {
  const m = new THREE.Mesh(geo, mat);
  if (pos) m.position.set(...pos);
  if (rot) m.rotation.set(...rot);
  m.castShadow = true;
  m.receiveShadow = true;
  parent.add(m);
  return m;
}

// ─────────────────────────────────────────────────────────────────────────────
//  1. AUTHENTIC ROYAL CAN (Silver, Blue, Purple, Pink, Jade, Obsidian)
// ─────────────────────────────────────────────────────────────────────────────
export function createRoyalCan(scene, physics, position, colorTheme = 'silver') {
  const R = 0.28, H = 0.72;
  const m = getMats();
  const g = new THREE.Group();

  let bodyMat = m.silverCanMat;
  if (colorTheme === 'blue')     bodyMat = m.royalBlueCanMat;
  if (colorTheme === 'purple')   bodyMat = m.fleurCanMat;
  if (colorTheme === 'pink')     bodyMat = m.pinkCanMat;
  if (colorTheme === 'jade')     bodyMat = m.jadeCanMat;
  if (colorTheme === 'obsidian') bodyMat = m.obsidianCanMat;

  // Main metallic cylinder body
  addMesh(g, new THREE.CylinderGeometry(R, R, H * 0.88, 28), bodyMat);

  // Top & Bottom Gold Collar Rims
  addMesh(g, new THREE.CylinderGeometry(R + 0.022, R + 0.022, H * 0.07, 28), m.goldPolished, [0, H * 0.44, 0]);
  addMesh(g, new THREE.CylinderGeometry(R + 0.022, R + 0.022, H * 0.07, 28), m.goldPolished, [0, -H * 0.44, 0]);

  // Metallic Lid with pull tab
  addMesh(g, new THREE.CylinderGeometry(R - 0.015, R - 0.015, 0.02, 24), m.canLid, [0, H * 0.46, 0]);
  const tab = addMesh(g, new THREE.TorusGeometry(0.06, 0.015, 6, 12), m.goldPolished, [0.06, H * 0.475, 0]);
  tab.rotation.x = Math.PI / 2;

  g.position.set(position.x, position.y, position.z);
  scene.add(g);

  const body = physics.makeCanBody(R, H, 4.2, position);
  physics.registerPair(g, body);
  return { mesh: g, body, initialPos: { ...position }, isCan: true };
}


// Convenience factories
export function createFleurCan(scene, physics, position) {
  return createRoyalCan(scene, physics, position, 'purple');
}

export function createPinkCan(scene, physics, position) {
  return createRoyalCan(scene, physics, position, 'pink');
}

// ─────────────────────────────────────────────────────────────────────────────
//  4. HORIZONTAL ROLLING CAN (With candy pinwheel end discs)
// ─────────────────────────────────────────────────────────────────────────────
export function createHorizontalCan(scene, physics, position) {
  const R = 0.28, H = 0.65;
  const m = getMats();
  const g = new THREE.Group();

  // Glossy vibrant cylinder body
  const bodyMesh = addMesh(g, new THREE.CylinderGeometry(R, R, H, 28), m.orangeCandy);
  bodyMesh.rotation.z = Math.PI / 2;

  // Middle gold accent ring
  const midRing = addMesh(g, new THREE.CylinderGeometry(R + 0.015, R + 0.015, 0.08, 24), m.goldPolished);
  midRing.rotation.z = Math.PI / 2;

  // Candy pinwheel caps on both flat circular ends
  [-H / 2, H / 2].forEach(x => {
    const cap = new THREE.Mesh(new THREE.CircleGeometry(R - 0.01, 24), m.pinwheelMat);
    cap.rotation.y = Math.PI / 2;
    cap.position.x = x + (x > 0 ? 0.012 : -0.012);
    cap.castShadow = true;
    g.add(cap);

    // Outer thick gold protective rim
    const rim = new THREE.Mesh(new THREE.TorusGeometry(R, 0.024, 8, 24), m.goldPolished);
    rim.rotation.y = Math.PI / 2;
    rim.position.x = x;
    g.add(rim);
  });

  g.position.set(position.x, position.y, position.z);
  scene.add(g);

  const phys = physics.makeCylinder(R, R, H, 3.8, position);

  phys.quaternion.setFromEuler(0, 0, Math.PI / 2);
  physics.registerPair(g, phys);
  return { mesh: g, body: phys, initialPos: { ...position }, isCan: true, isHCan: true };
}

// ─────────────────────────────────────────────────────────────────────────────
//  5. FLEUR-DE-LIS ROYAL PURPLE BLOCK (Cube with gold brackets & emblem)
// ─────────────────────────────────────────────────────────────────────────────
export function createFleurBlock(scene, physics, position) {
  const S = 0.56;
  const m = getMats();
  const g = new THREE.Group();

  // 6-sided cube with Fleur-de-lis enamel texture
  addMesh(g, new THREE.BoxGeometry(S, S, S), m.fleurCubeMat);

  // Thick corner gold brackets
  const bSize = 0.09;
  [
    [S/2, S/2, S/2], [-S/2, S/2, S/2], [S/2, -S/2, S/2], [-S/2, -S/2, S/2],
    [S/2, S/2, -S/2], [-S/2, S/2, -S/2], [S/2, -S/2, -S/2], [-S/2, -S/2, -S/2],
  ].forEach(([x, y, z]) => {
    addMesh(g, new THREE.BoxGeometry(bSize, bSize, bSize), m.goldPolished, [x, y, z]);
  });

  g.position.set(position.x, position.y, position.z);
  scene.add(g);

  const body = physics.makeBox(S, S, S, 8.0, position);

  physics.registerPair(g, body);
  return { mesh: g, body, initialPos: { ...position }, isCan: true };
}

// ─────────────────────────────────────────────────────────────────────────────
//  5b. ROYAL BLOCK (Stone cube with gold corner pillars and crown plaque)
// ─────────────────────────────────────────────────────────────────────────────
export function createRoyalBlock(scene, physics, position) {
  const S = 0.56;
  const m = getMats();
  const g = new THREE.Group();

  addMesh(g, new THREE.BoxGeometry(S, S, S), m.navyBlock);

  // Gold edge pillars
  const h = S + 0.04;
  [[S / 2, S / 2], [-S / 2, S / 2], [S / 2, -S / 2], [-S / 2, -S / 2]].forEach(([x, z]) => {
    addMesh(g, new THREE.BoxGeometry(0.06, h, 0.06), m.goldPolished, [x, 0, z]);
  });

  // Front gold crown emblem
  addMesh(g, new THREE.BoxGeometry(0.22, 0.16, 0.05), m.goldPolished, [0, 0.04, S / 2 + 0.02]);

  g.position.set(position.x, position.y, position.z);
  scene.add(g);

  const body = physics.makeBox(S, S, S, 8.0, position);

  physics.registerPair(g, body);
  return { mesh: g, body, initialPos: { ...position }, isCan: true };
}

// ─────────────────────────────────────────────────────────────────────────────
//  6. PINWHEEL CANDY BLOCK (Orange cube with radial sunburst disc)
// ─────────────────────────────────────────────────────────────────────────────
export function createPinwheelBlock(scene, physics, position) {
  const S = 0.56;
  const m = getMats();
  const g = new THREE.Group();

  addMesh(g, new THREE.BoxGeometry(S, S, S), m.orangeCandy);

  // Front and back pinwheel medallions
  [-S/2 - 0.01, S/2 + 0.01].forEach(z => {
    const pw = new THREE.Mesh(new THREE.CircleGeometry(S * 0.42, 24), m.pinwheelMat);
    pw.position.z = z;
    if (z < 0) pw.rotation.y = Math.PI;
    g.add(pw);

    // Gold rim around medallion
    const rim = new THREE.Mesh(new THREE.TorusGeometry(S * 0.42, 0.022, 8, 24), m.goldPolished);
    rim.position.z = z;
    g.add(rim);
  });

  g.position.set(position.x, position.y, position.z);
  scene.add(g);

  const body = physics.makeBox(S, S, S, 3.8, position);
  physics.registerPair(g, body);
  return { mesh: g, body, initialPos: { ...position }, isCan: true };
}

// ─────────────────────────────────────────────────────────────────────────────
//  7. ROYAL GEMSTONE BEAM (Silver-blue bevelled beam with gold collars & ruby gems)
// ─────────────────────────────────────────────────────────────────────────────
export function createGemBeam(scene, physics, position, width = 3.6) {
  const H = 0.22, D = 0.52; // Wide 0.52m footprint matching cans (0.518m) for rock-solid stability
  const m = getMats();
  const g = new THREE.Group();

  // Main metallic silver-blue beam
  addMesh(g, new THREE.BoxGeometry(width, H, D), m.beamSilver);

  // Gold top and bottom trim runners
  addMesh(g, new THREE.BoxGeometry(width + 0.04, 0.035, D + 0.04), m.goldPolished, [0, H/2 + 0.018, 0]);
  addMesh(g, new THREE.BoxGeometry(width + 0.04, 0.035, D + 0.04), m.goldPolished, [0, -H/2 - 0.018, 0]);

  // Gold end caps
  [-width / 2 + 0.08, width / 2 - 0.08].forEach(x => {
    addMesh(g, new THREE.BoxGeometry(0.16, H + 0.08, D + 0.08), m.goldPolished, [x, 0, 0]);
  });

  // Center Gold Collars with purple cutouts and Square Ruby Gems
  const numBrackets = Math.max(1, Math.floor(width / 1.3));
  for (let i = 0; i < numBrackets; i++) {
    const x = -width / 2 + (i + 0.5) * (width / numBrackets);
    addMesh(g, new THREE.BoxGeometry(0.24, H + 0.06, D + 0.06), m.goldPolished, [x, 0, 0]);
    addMesh(g, new THREE.BoxGeometry(0.14, H + 0.02, D + 0.07), m.purpleDeep, [x, 0, 0]);
    [-D/2 - 0.03, D/2 + 0.03].forEach(z => {
      const gem = addMesh(g, new THREE.BoxGeometry(0.08, 0.08, 0.04), m.rubyGem, [x, 0, z]);
      gem.rotation.z = Math.PI / 4;
    });
  }

  g.position.set(position.x, position.y, position.z);
  scene.add(g);

  const beamMass = Math.max(7.0, width * 2.8);

  const body = physics.makeBox(width, H, D, beamMass, position);
  physics.registerPair(g, body);
  return { mesh: g, body, initialPos: { ...position }, isCan: false };
}

// ─────────────────────────────────────────────────────────────────────────────
//  8. CASTLE SPIRE TURRET (Conical roof & golden rod, exactly aligned at base)
// ─────────────────────────────────────────────────────────────────────────────
export function createSpire(scene, physics, position) {
  const m = getMats();
  const g = new THREE.Group();
  const H = 0.60; // Total collider height, centered at local (0, 0, 0), extends from -0.30 to +0.30

  // Cylindrical base: height 0.28, centered at local -0.16 (extends from -0.30 to -0.02)
  addMesh(g, new THREE.CylinderGeometry(0.24, 0.255, 0.28, 16), m.orangeCandy, [0, -0.16, 0]);
  addMesh(g, new THREE.CylinderGeometry(0.26, 0.26, 0.07, 16), m.goldPolished, [0, -0.01, 0]);

  // Silver conical roof: height 0.82, centered at local +0.42
  addMesh(g, new THREE.ConeGeometry(0.22, 0.82, 16), m.silverMetal, [0, 0.42, 0]);

  // Golden spire rod & ball finial
  addMesh(g, new THREE.CylinderGeometry(0.018, 0.018, 0.32, 8), m.goldPolished, [0, 0.95, 0]);
  addMesh(g, new THREE.SphereGeometry(0.045, 12, 12), m.goldPolished, [0, 1.12, 0]);

  // Pennant flag
  const flagGeo = new THREE.BufferGeometry();
  const flagV = new Float32Array([
    0, 1.08, 0,
    0.22, 1.01, 0,
    0, 0.94, 0,
  ]);
  flagGeo.setAttribute('position', new THREE.BufferAttribute(flagV, 3));
  flagGeo.computeVertexNormals();
  const flagMesh = new THREE.Mesh(flagGeo, m.rubyGem);
  g.add(flagMesh);

  g.position.set(position.x, position.y, position.z);
  scene.add(g);

  // Physics box collider: height H = 0.60 with 0.44m flat square base for rock-solid stability
  const body = physics.makeBox(0.44, H, 0.44, 1.2, position);
  physics.registerPair(g, body);
  return { mesh: g, body, initialPos: { ...position }, isCan: true };
}

// ─────────────────────────────────────────────────────────────────────────────
//  8b. WORLD-THEMED DIVERSE STRUCTURE ARCHETYPES
// ─────────────────────────────────────────────────────────────────────────────

// 🪵 Coast 1: Weathered Timber Wood Plank Crate (6.5kg mass)
export function createTimberBlock(scene, physics, position) {
  const S = 0.56;
  const m = getMats();
  const g = new THREE.Group();

  addMesh(g, new THREE.BoxGeometry(S, S, S), m.timberMat);

  // Dark iron corner reinforcements
  const bSize = 0.085;
  [
    [S/2, S/2, S/2], [-S/2, S/2, S/2], [S/2, -S/2, S/2], [-S/2, -S/2, S/2],
    [S/2, S/2, -S/2], [-S/2, S/2, -S/2], [S/2, -S/2, -S/2], [-S/2, -S/2, -S/2],
  ].forEach(([x, y, z]) => {
    addMesh(g, new THREE.BoxGeometry(bSize, bSize, bSize), m.ironDark, [x, y, z]);
  });

  g.position.set(position.x, position.y, position.z);
  scene.add(g);

  const body = physics.makeBox(S, S, S, 6.5, position);
  physics.registerPair(g, body);
  return { mesh: g, body, initialPos: { ...position }, isCan: true, structureType: 'timber_block' };
}

// 🏴‍☠️ Coast 2: Pirate Oak Rum Keg Barrel (4.0kg mass)
export function createOakBarrel(scene, physics, position) {
  const R = 0.28, H = 0.72;
  const m = getMats();
  const g = new THREE.Group();

  // Barrel body with wood staves
  addMesh(g, new THREE.CylinderGeometry(R * 0.94, R * 0.94, H * 0.88, 24), m.barrelMat);

  // Iron hoops top and bottom
  addMesh(g, new THREE.CylinderGeometry(R + 0.018, R + 0.018, 0.065, 24), m.ironDark, [0, H * 0.36, 0]);
  addMesh(g, new THREE.CylinderGeometry(R + 0.018, R + 0.018, 0.065, 24), m.ironDark, [0, -H * 0.36, 0]);
  addMesh(g, new THREE.CylinderGeometry(R + 0.012, R + 0.012, 0.05, 24), m.ironDark, [0, 0, 0]);

  // Center brass bung
  const bung = addMesh(g, new THREE.SphereGeometry(0.045, 12, 12), m.goldPolished, [0, 0, R * 0.95]);

  g.position.set(position.x, position.y, position.z);
  scene.add(g);

  const body = physics.makeCanBody(R, H, 4.0, position);
  physics.registerPair(g, body);
  return { mesh: g, body, initialPos: { ...position }, isCan: true, structureType: 'barrel' };
}

// 🏺 Sunset 1: Terracotta Baked Clay Brick Block (7.5kg mass)
export function createTerracottaBlock(scene, physics, position) {
  const S = 0.56;
  const m = getMats();
  const g = new THREE.Group();

  addMesh(g, new THREE.BoxGeometry(S, S, S), m.terracottaMat);

  // Warm sandstone corner trims
  const h = S + 0.03;
  [[S/2, S/2], [-S/2, S/2], [S/2, -S/2], [-S/2, -S/2]].forEach(([x, z]) => {
    addMesh(g, new THREE.BoxGeometry(0.065, h, 0.065), m.bronzeTrim, [x, 0, z]);
  });

  g.position.set(position.x, position.y, position.z);
  scene.add(g);

  const body = physics.makeBox(S, S, S, 7.5, position);
  physics.registerPair(g, body);
  return { mesh: g, body, initialPos: { ...position }, isCan: true, structureType: 'terracotta_block' };
}

// 🏺 Sunset 2: Hammered Bronze / Copper Sun Urn (4.2kg mass)
export function createBronzeUrn(scene, physics, position) {
  const R = 0.28, H = 0.72;
  const m = getMats();
  const g = new THREE.Group();

  addMesh(g, new THREE.CylinderGeometry(R, R * 0.88, H * 0.86, 26), m.bronzeUrnMat);

  // Gold rim and flared lip
  addMesh(g, new THREE.CylinderGeometry(R + 0.02, R + 0.015, 0.06, 26), m.goldPolished, [0, H * 0.44, 0]);
  addMesh(g, new THREE.CylinderGeometry(R * 0.90, R + 0.015, 0.05, 26), m.goldPolished, [0, -H * 0.44, 0]);

  // Decorative side handles
  [-R - 0.02, R + 0.02].forEach(hx => {
    const handle = addMesh(g, new THREE.TorusGeometry(0.08, 0.018, 6, 16), m.goldPolished, [hx, H * 0.10, 0]);
    handle.rotation.y = Math.PI / 2;
  });

  g.position.set(position.x, position.y, position.z);
  scene.add(g);

  const body = physics.makeCanBody(R, H, 4.2, position);
  physics.registerPair(g, body);
  return { mesh: g, body, initialPos: { ...position }, isCan: true, structureType: 'bronze_urn' };
}

// 🏛️ Palace 1: Polished Ivory White Marble Block with Gold Filigree (8.5kg mass)
export function createMarbleBlock(scene, physics, position) {
  const S = 0.56;
  const m = getMats();
  const g = new THREE.Group();

  addMesh(g, new THREE.BoxGeometry(S, S, S), m.marbleMat);

  // Filigree gold corner brackets
  const bSize = 0.095;
  [
    [S/2, S/2, S/2], [-S/2, S/2, S/2], [S/2, -S/2, S/2], [-S/2, -S/2, S/2],
    [S/2, S/2, -S/2], [-S/2, S/2, -S/2], [S/2, -S/2, -S/2], [-S/2, -S/2, -S/2],
  ].forEach(([x, y, z]) => {
    addMesh(g, new THREE.BoxGeometry(bSize, bSize, bSize), m.goldPolished, [x, y, z]);
  });

  // Front sovereign gold crown seal
  addMesh(g, new THREE.BoxGeometry(0.24, 0.18, 0.04), m.goldPolished, [0, 0, S/2 + 0.02]);

  g.position.set(position.x, position.y, position.z);
  scene.add(g);

  const body = physics.makeBox(S, S, S, 8.5, position);
  physics.registerPair(g, body);
  return { mesh: g, body, initialPos: { ...position }, isCan: true, structureType: 'marble_block' };
}

// 💎 Palace 2: Prismatic Amethyst Crystal Spire (3.2kg mass)
export function createCrystalSpire(scene, physics, position) {
  const m = getMats();
  const g = new THREE.Group();
  const H = 0.60;

  // Candlestick gold pedestal base
  addMesh(g, new THREE.CylinderGeometry(0.24, 0.26, 0.24, 16), m.goldPolished, [0, -0.16, 0]);

  // Translucent glowing amethyst crystal cone
  addMesh(g, new THREE.ConeGeometry(0.22, 0.78, 8), m.crystalMat, [0, 0.40, 0]);

  // Floating crystal finial
  const finial = addMesh(g, new THREE.OctahedronGeometry(0.07, 0), m.crystalMat, [0, 0.96, 0]);
  finial.rotation.y = Math.PI / 4;

  g.position.set(position.x, position.y, position.z);
  scene.add(g);

  const body = physics.makeBox(0.44, H, 0.44, 1.4, position);
  physics.registerPair(g, body);
  return { mesh: g, body, initialPos: { ...position }, isCan: true, structureType: 'crystal_spire' };
}

// 🔮 Night 1: Mystic Obsidian Runestone Block (8.8kg mass)
export function createObsidianBlock(scene, physics, position) {
  const S = 0.56;
  const m = getMats();
  const g = new THREE.Group();

  addMesh(g, new THREE.BoxGeometry(S, S, S), m.obsidianRuneMat);

  // Dark spiked corner clamps
  const cSize = 0.085;
  [
    [S/2, S/2, S/2], [-S/2, S/2, S/2], [S/2, -S/2, S/2], [-S/2, -S/2, S/2],
    [S/2, S/2, -S/2], [-S/2, S/2, -S/2], [S/2, -S/2, -S/2], [-S/2, -S/2, -S/2],
  ].forEach(([x, y, z]) => {
    addMesh(g, new THREE.BoxGeometry(cSize, cSize, cSize), m.ironDark, [x, y, z]);
  });

  g.position.set(position.x, position.y, position.z);
  scene.add(g);

  const body = physics.makeBox(S, S, S, 8.8, position);
  physics.registerPair(g, body);
  return { mesh: g, body, initialPos: { ...position }, isCan: true, structureType: 'obsidian_block' };
}

// ⚡ Night 2: Electric Cyan Plasma Can (4.0kg mass)
export function createPlasmaCan(scene, physics, position) {
  const R = 0.28, H = 0.72;
  const m = getMats();
  const g = new THREE.Group();

  // Glowing neon plasma core
  addMesh(g, new THREE.CylinderGeometry(R * 0.95, R * 0.95, H * 0.86, 24), m.plasmaCanMat);

  // Dark obsidian collar rims
  addMesh(g, new THREE.CylinderGeometry(R + 0.02, R + 0.02, H * 0.08, 24), m.obsidianCanMat, [0, H * 0.44, 0]);
  addMesh(g, new THREE.CylinderGeometry(R + 0.02, R + 0.02, H * 0.08, 24), m.obsidianCanMat, [0, -H * 0.44, 0]);

  // Center containment ring
  addMesh(g, new THREE.CylinderGeometry(R + 0.015, R + 0.015, 0.06, 24), m.goldPolished, [0, 0, 0]);

  g.position.set(position.x, position.y, position.z);
  scene.add(g);

  const body = physics.makeCanBody(R, H, 4.0, position);
  physics.registerPair(g, body);
  return { mesh: g, body, initialPos: { ...position }, isCan: true, structureType: 'plasma_can' };
}

// 🎋 Tropical 1: Woven Bamboo Jungle Crate (5.5kg mass)
export function createBambooCrate(scene, physics, position) {
  const S = 0.56;
  const m = getMats();
  const g = new THREE.Group();

  addMesh(g, new THREE.BoxGeometry(S, S, S), m.bambooMat);

  // Jungle rattan edge frames
  const h = S + 0.03;
  [[S/2, S/2], [-S/2, S/2], [S/2, -S/2], [-S/2, -S/2]].forEach(([x, z]) => {
    addMesh(g, new THREE.BoxGeometry(0.06, h, 0.06), m.goldPolished, [x, 0, z]);
  });

  g.position.set(position.x, position.y, position.z);
  scene.add(g);

  const body = physics.makeBox(S, S, S, 5.5, position);
  physics.registerPair(g, body);
  return { mesh: g, body, initialPos: { ...position }, isCan: true, structureType: 'bamboo_crate' };
}

// 🎋 Tropical 2: Carved Imperial Jade Urn (4.2kg mass)
export function createJadeUrn(scene, physics, position) {
  const R = 0.28, H = 0.72;
  const m = getMats();
  const g = new THREE.Group();

  addMesh(g, new THREE.CylinderGeometry(R, R, H * 0.88, 24), m.jadeCanMat);

  // Gold top & bottom collars
  addMesh(g, new THREE.CylinderGeometry(R + 0.022, R + 0.022, H * 0.07, 24), m.goldPolished, [0, H * 0.44, 0]);
  addMesh(g, new THREE.CylinderGeometry(R + 0.022, R + 0.022, H * 0.07, 24), m.goldPolished, [0, -H * 0.44, 0]);

  g.position.set(position.x, position.y, position.z);
  scene.add(g);

  const body = physics.makeCanBody(R, H, 4.2, position);
  physics.registerPair(g, body);
  return { mesh: g, body, initialPos: { ...position }, isCan: true, structureType: 'jade_urn' };
}

// 🪙 Empire 1: Heavy Riveted Iron Vault Safe Block (9.5kg mass)
export function createIronVaultBlock(scene, physics, position) {
  const S = 0.56;
  const m = getMats();
  const g = new THREE.Group();

  addMesh(g, new THREE.BoxGeometry(S, S, S), m.ironVaultMat);

  // Front gold combination vault dial
  const dial = addMesh(g, new THREE.CylinderGeometry(0.09, 0.09, 0.04, 20), m.goldPolished, [0, 0, S/2 + 0.02]);
  dial.rotation.x = Math.PI / 2;

  // Dark iron corner reinforcements
  const bSize = 0.09;
  [
    [S/2, S/2, S/2], [-S/2, S/2, S/2], [S/2, -S/2, S/2], [-S/2, -S/2, S/2],
    [S/2, S/2, -S/2], [-S/2, S/2, -S/2], [S/2, -S/2, -S/2], [-S/2, -S/2, -S/2],
  ].forEach(([x, y, z]) => {
    addMesh(g, new THREE.BoxGeometry(bSize, bSize, bSize), m.ironDark, [x, y, z]);
  });

  g.position.set(position.x, position.y, position.z);
  scene.add(g);

  const body = physics.makeBox(S, S, S, 9.5, position);
  physics.registerPair(g, body);
  return { mesh: g, body, initialPos: { ...position }, isCan: true, structureType: 'iron_vault' };
}

// 🪙 Empire 2: Gilded Gold Ingot Canister (4.8kg mass)
export function createGoldIngotCan(scene, physics, position) {
  const R = 0.28, H = 0.72;
  const m = getMats();
  const g = new THREE.Group();

  // Polished golden body
  addMesh(g, new THREE.CylinderGeometry(R, R, H * 0.88, 28), m.goldPolished);

  // Tiered gold bullion rings
  addMesh(g, new THREE.CylinderGeometry(R + 0.025, R + 0.025, 0.06, 28), m.goldIngotMat, [0, H * 0.30, 0]);
  addMesh(g, new THREE.CylinderGeometry(R + 0.025, R + 0.025, 0.06, 28), m.goldIngotMat, [0, -H * 0.30, 0]);

  // Royal ruby crest medallion in center
  const crest = addMesh(g, new THREE.BoxGeometry(0.12, 0.12, 0.04), m.rubyGem, [0, 0, R + 0.015]);
  crest.rotation.z = Math.PI / 4;

  g.position.set(position.x, position.y, position.z);
  scene.add(g);

  const body = physics.makeCanBody(R, H, 4.8, position);
  physics.registerPair(g, body);
  return { mesh: g, body, initialPos: { ...position }, isCan: true, structureType: 'gold_ingot' };
}

// ─────────────────────────────────────────────────────────────────────────────
//  8c. NEW DISTINCT SHAPES & SIZES (Tall Pillars, Wide Bastions, Octagons, Domes, Powder Kegs)
// ─────────────────────────────────────────────────────────────────────────────

// 🏛️ Tall Fluted Corinthian Pillar (1.08m height = 1.5x standard can, 5.8kg)
export function createTallPillar(scene, physics, position, theme = 'palace') {
  const R = 0.25, H = 1.08;
  const m = getMats();
  const g = new THREE.Group();

  let shaftMat = m.marbleMat;
  if (theme === 'sunset') shaftMat = m.terracottaMat;
  else if (theme === 'night') shaftMat = m.obsidianRuneMat;
  else if (theme === 'tropical') shaftMat = m.jadeCanMat;
  else if (theme === 'empire') shaftMat = m.ironVaultMat;
  else if (theme === 'coast') shaftMat = m.royalBlueCanMat;

  // Fluted tall column shaft
  addMesh(g, new THREE.CylinderGeometry(R * 0.90, R * 0.95, H * 0.84, 16), shaftMat);

  // Stepped Capital (top) & Plinth (bottom) in Polished Gold
  addMesh(g, new THREE.BoxGeometry(R * 2.15, 0.08, R * 2.15), m.goldPolished, [0, H * 0.46, 0]);
  addMesh(g, new THREE.CylinderGeometry(R * 1.06, R * 0.92, 0.07, 16), m.goldPolished, [0, H * 0.40, 0]);
  addMesh(g, new THREE.BoxGeometry(R * 2.15, 0.08, R * 2.15), m.goldPolished, [0, -H * 0.46, 0]);
  addMesh(g, new THREE.CylinderGeometry(R * 0.92, R * 1.06, 0.07, 16), m.goldPolished, [0, -H * 0.40, 0]);

  // Center jewel band
  addMesh(g, new THREE.CylinderGeometry(R * 0.98, R * 0.98, 0.07, 16), m.goldPolished, [0, 0, 0]);

  g.position.set(position.x, position.y, position.z);
  scene.add(g);

  const body = physics.makeCanBody(R, H, 5.8, position);
  physics.registerPair(g, body);
  return { mesh: g, body, initialPos: { ...position }, isCan: true, structureType: 'tall_pillar' };
}

// 🧱 Wide Heavy Bastion Block (0.84m wide x 0.56m tall x 0.54m deep, 9.2kg)
export function createWideBlock(scene, physics, position, theme = 'coast') {
  const W = 0.84, H = 0.56, D = 0.54;
  const m = getMats();
  const g = new THREE.Group();

  let coreMat = m.navyBlock;
  if (theme === 'sunset') coreMat = m.terracottaMat;
  else if (theme === 'palace') coreMat = m.marbleMat;
  else if (theme === 'night') coreMat = m.obsidianRuneMat;
  else if (theme === 'tropical') coreMat = m.bambooMat;
  else if (theme === 'empire') coreMat = m.ironVaultMat;

  addMesh(g, new THREE.BoxGeometry(W, H, D), coreMat);

  // Gold top/bottom bands & twin heraldic shields
  addMesh(g, new THREE.BoxGeometry(W + 0.03, 0.05, D + 0.03), m.goldPolished, [0, H / 2 - 0.025, 0]);
  addMesh(g, new THREE.BoxGeometry(W + 0.03, 0.05, D + 0.03), m.goldPolished, [0, -H / 2 + 0.025, 0]);
  [-W * 0.24, W * 0.24].forEach(sx => {
    const gem = addMesh(g, new THREE.OctahedronGeometry(0.08, 0), m.rubyGem, [sx, 0, D / 2 + 0.02]);
    gem.scale.set(1, 1.2, 0.5);
  });

  g.position.set(position.x, position.y, position.z);
  scene.add(g);

  const body = physics.makeBox(W, H, D, 9.2, position);
  physics.registerPair(g, body);
  return { mesh: g, body, initialPos: { ...position }, isCan: true, structureType: 'wide_block' };
}

// 🏰 Octagonal Prism Fortress Turret (8-sided tower, R = 0.30, H = 0.72, 5.2kg)
export function createOctagonTower(scene, physics, position, theme = 'palace') {
  const R = 0.30, H = 0.72;
  const m = getMats();
  const g = new THREE.Group();

  let wallMat = m.purpleEnamel;
  if (theme === 'coast') wallMat = m.royalBlueCanMat;
  else if (theme === 'sunset') wallMat = m.bronzeUrnMat;
  else if (theme === 'palace') wallMat = m.marbleMat;
  else if (theme === 'night') wallMat = m.obsidianCanMat;
  else if (theme === 'tropical') wallMat = m.jadeCanMat;
  else if (theme === 'empire') wallMat = m.goldIngotMat;

  // 8-sided octagonal cylinder
  addMesh(g, new THREE.CylinderGeometry(R, R, H * 0.88, 8), wallMat);
  addMesh(g, new THREE.CylinderGeometry(R + 0.025, R + 0.025, 0.07, 8), m.goldPolished, [0, H * 0.44, 0]);
  addMesh(g, new THREE.CylinderGeometry(R + 0.025, R + 0.025, 0.07, 8), m.goldPolished, [0, -H * 0.44, 0]);

  // 4 Arrow slit windows with glowing emerald/ruby core
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2;
    const slit = addMesh(g, new THREE.BoxGeometry(0.06, 0.24, 0.04), m.emeraldGem, [Math.cos(a) * (R * 0.94), 0, Math.sin(a) * (R * 0.94)]);
    slit.rotation.y = -a;
  }

  g.position.set(position.x, position.y, position.z);
  scene.add(g);

  const body = physics.makeCanBody(R, H, 5.2, position);
  physics.registerPair(g, body);
  return { mesh: g, body, initialPos: { ...position }, isCan: true, structureType: 'octagon_tower' };
}

// 🕌 Royal Golden & Crystal Dome Turret (H = 0.60, 2.4kg)
export function createRoyalDome(scene, physics, position, theme = 'palace') {
  const m = getMats();
  const g = new THREE.Group();
  const H = 0.60;

  // Octagonal drum base
  addMesh(g, new THREE.CylinderGeometry(0.25, 0.27, 0.24, 12), m.marbleMat, [0, -0.18, 0]);
  addMesh(g, new THREE.CylinderGeometry(0.28, 0.28, 0.05, 16), m.goldPolished, [0, -0.04, 0]);

  // Ribbed Golden/Crystal Dome Hemisphere
  const domeMat = (theme === 'night' || theme === 'palace') ? m.crystalMat : m.goldPolished;
  const dome = new THREE.Mesh(new THREE.SphereGeometry(0.26, 20, 14, 0, Math.PI * 2, 0, Math.PI * 0.55), domeMat);
  dome.position.set(0, -0.04, 0);
  dome.castShadow = true;
  g.add(dome);

  // Spire finial atop dome
  addMesh(g, new THREE.CylinderGeometry(0.02, 0.03, 0.28, 8), m.goldPolished, [0, 0.32, 0]);
  addMesh(g, new THREE.OctahedronGeometry(0.065, 0), m.rubyGem, [0, 0.48, 0]);

  g.position.set(position.x, position.y, position.z);
  scene.add(g);

  const body = physics.makeBox(0.46, H, 0.46, 2.2, position);
  physics.registerPair(g, body);
  return { mesh: g, body, initialPos: { ...position }, isCan: true, structureType: 'royal_dome' };
}

// 🧨 Explosive Gunpowder Barrel / Powder Keg (Detonates in a shockwave when hit! R = 0.28, H = 0.72)
export function createPowderKeg(scene, physics, position) {
  const R = 0.28, H = 0.72;
  const m = getMats();
  const g = new THREE.Group();

  // Crimson danger barrel body
  addMesh(g, new THREE.CylinderGeometry(R * 0.95, R * 0.95, H * 0.88, 24), m.rubyGem);

  // Gold hazard hoops
  addMesh(g, new THREE.CylinderGeometry(R + 0.02, R + 0.02, 0.07, 24), m.goldPolished, [0, H * 0.36, 0]);
  addMesh(g, new THREE.CylinderGeometry(R + 0.02, R + 0.02, 0.07, 24), m.goldPolished, [0, -H * 0.36, 0]);
  addMesh(g, new THREE.CylinderGeometry(R + 0.015, R + 0.015, 0.12, 24), m.ironDark, [0, 0, 0]);

  // Glowing fuse spark on top
  addMesh(g, new THREE.CylinderGeometry(0.025, 0.025, 0.12, 8), m.goldWarm, [0, H * 0.48, 0]);
  addMesh(g, new THREE.SphereGeometry(0.055, 10, 10), m.goldPolished, [0, H * 0.55, 0]);

  g.position.set(position.x, position.y, position.z);
  scene.add(g);

  const body = physics.makeCanBody(R, H, 3.6, position);
  physics.registerPair(g, body);
  return { mesh: g, body, initialPos: { ...position }, isCan: true, isPowderKeg: true, structureType: 'powder_keg' };
}

// ─────────────────────────────────────────────────────────────────────────────
//  8d. AUTOMATIC PER-STAGE ARCHITECTURAL MATERIAL ROTATION & MIXING
// ─────────────────────────────────────────────────────────────────────────────
export const STRUCTURE_THEMES = [
  { id: 'auto',     name: 'Auto (Stage Rotation)', icon: '🌍' },
  { id: 'coast',    name: 'Timber & Rum Bastion', icon: '🪵' },
  { id: 'sunset',   name: 'Terracotta & Bronze Citadel', icon: '🏺' },
  { id: 'palace',   name: 'Ivory Marble & Crystal Keep', icon: '🏛️' },
  { id: 'night',    name: 'Obsidian & Neon Crypt', icon: '🔮' },
  { id: 'tropical', name: 'Bamboo & Jade Fortress', icon: '🎋' },
  { id: 'empire',   name: 'Iron Vault & Gold Treasury', icon: '🪙' },
];

const STAGE_THEME_ROTATION = ['coast', 'sunset', 'palace', 'tropical', 'night', 'empire'];
let _activeStructureTheme = 'auto';
let _currentStageNumber = 1;

export function setStageStructureNumber(stageNum = 1) {
  _currentStageNumber = Math.max(1, stageNum);
}

export function getStructureTheme() { return 'auto'; }
export function setStructureTheme() { _activeStructureTheme = 'auto'; return 'auto'; }
export function cycleStructureTheme() { return STRUCTURE_THEMES[0]; }

export function getEffectiveStructureTheme(worldTheme = 'coast', posHint = null) {
  // Automatically rotate primary structure material every single stage,
  // and blend complementary secondary materials by vertical tier so every castle looks unique!
  const baseIdx = (_currentStageNumber - 1) % STAGE_THEME_ROTATION.length;
  if (posHint && typeof posHint.y === 'number') {
    const tierOffset = Math.floor(Math.abs(posHint.y) * 1.5 + Math.abs(posHint.x || 0)) % 2;
    if (tierOffset === 1 && (_currentStageNumber % 2 === 0)) {
      return STAGE_THEME_ROTATION[(baseIdx + 2) % STAGE_THEME_ROTATION.length];
    }
  }
  return STAGE_THEME_ROTATION[baseIdx] || worldTheme || 'coast';
}

// Unified Themed Block Factory (Mixes materials automatically per stage & position)
export function createThemedBlock(scene, physics, position, theme = 'coast') {
  const eff = getEffectiveStructureTheme(theme, position);
  switch (eff) {
    case 'sunset':   return createTerracottaBlock(scene, physics, position);
    case 'palace':   return createMarbleBlock(scene, physics, position);
    case 'night':    return createObsidianBlock(scene, physics, position);
    case 'tropical': return createBambooCrate(scene, physics, position);
    case 'empire':   return createIronVaultBlock(scene, physics, position);
    case 'coast':
    default:         return createTimberBlock(scene, physics, position);
  }
}

// Unified Themed Can / Target Factory
export function createThemedCan(scene, physics, position, theme = 'coast') {
  const eff = getEffectiveStructureTheme(theme, position);
  switch (eff) {
    case 'sunset':   return createBronzeUrn(scene, physics, position);
    case 'palace':   return createRoyalCan(scene, physics, position, 'purple');
    case 'night':    return createPlasmaCan(scene, physics, position);
    case 'tropical': return createJadeUrn(scene, physics, position);
    case 'empire':   return createGoldIngotCan(scene, physics, position);
    case 'coast':
    default:         return createOakBarrel(scene, physics, position);
  }
}

// Unified Themed Spire Factory (Alternates Royal Spire, Crystal Spire, and Royal Dome)
export function createThemedSpire(scene, physics, position, theme = 'coast') {
  const eff = getEffectiveStructureTheme(theme, position);
  const posHash = Math.round(Math.abs((position.x || 0) * 10) + _currentStageNumber) % 3;
  if (eff === 'palace' || eff === 'night' || posHash === 1) {
    return createCrystalSpire(scene, physics, position);
  }
  if (eff === 'empire' || eff === 'sunset' || posHash === 2) {
    return createRoyalDome(scene, physics, position, eff);
  }
  return createSpire(scene, physics, position);
}

// Unified Themed Gem Beam Factory
export function createThemedBeam(scene, physics, position, width = 3.6, theme = 'coast') {
  const eff = getEffectiveStructureTheme(theme, position);
  const m = getMats();
  const obj = createGemBeam(scene, physics, position, width);

  if (eff === 'sunset') {
    obj.mesh.children.forEach(c => {
      if (c.material === m.beamSilver) c.material = m.bronzeTrim;
      if (c.material === m.rubyGem) c.material = m.orangeCandy;
    });
  } else if (eff === 'palace') {
    obj.mesh.children.forEach(c => {
      if (c.material === m.beamSilver) c.material = m.marbleMat;
      if (c.material === m.rubyGem) c.material = m.crystalMat;
    });
  } else if (eff === 'night') {
    obj.mesh.children.forEach(c => {
      if (c.material === m.beamSilver) c.material = m.obsidianRuneMat;
      if (c.material === m.rubyGem) c.material = m.plasmaCanMat;
    });
  } else if (eff === 'tropical') {
    obj.mesh.children.forEach(c => {
      if (c.material === m.beamSilver) c.material = m.bambooMat;
      if (c.material === m.rubyGem) c.material = m.emeraldGem;
    });
  } else if (eff === 'empire') {
    obj.mesh.children.forEach(c => {
      if (c.material === m.beamSilver) c.material = m.ironVaultMat;
      if (c.material === m.rubyGem) c.material = m.goldIngotMat;
    });
  }
  return obj;
}

// ─────────────────────────────────────────────────────────────────────────────
//  9. PHOTOREALISTIC 3D SCULPTED BOSS MEDALLION BLOCK
// ─────────────────────────────────────────────────────────────────────────────
export function createPhotoMosaicBlock(scene, physics, position, col, row, totalCols = 3, totalRows = 2, sizeX = 0.82, sizeY = 0.82, sizeZ = 0.42) {
  const m = getMats();
  const g = new THREE.Group();

  // Solid dark navy/gold royal block casing
  addMesh(g, new THREE.BoxGeometry(sizeX, sizeY, sizeZ), m.navyBlock);

  // Outer Perimeter Gold Frame only (NO interior dividing bars slicing the face!)
  const frameThick = 0.055;
  const frameDepth = 0.035;
  const fZ = sizeZ / 2 + frameDepth / 2 - 0.005;

  if (row === totalRows - 1) {
    // Top border
    addMesh(g, new THREE.BoxGeometry(sizeX, frameThick, frameDepth), m.goldPolished, [0, sizeY / 2 - frameThick / 2, fZ]);
  }
  if (row === 0) {
    // Bottom border
    addMesh(g, new THREE.BoxGeometry(sizeX, frameThick, frameDepth), m.goldPolished, [0, -sizeY / 2 + frameThick / 2, fZ]);
  }
  if (col === 0) {
    // Left border
    addMesh(g, new THREE.BoxGeometry(frameThick, sizeY, frameDepth), m.goldPolished, [-sizeX / 2 + frameThick / 2, 0, fZ]);
  }
  if (col === totalCols - 1) {
    // Right border
    addMesh(g, new THREE.BoxGeometry(frameThick, sizeY, frameDepth), m.goldPolished, [sizeX / 2 - frameThick / 2, 0, fZ]);
  }

  // 4 Corner Gold Stud Rosettes on outer corners
  const isTopLeft     = (row === totalRows - 1 && col === 0);
  const isTopRight    = (row === totalRows - 1 && col === totalCols - 1);
  const isBottomLeft  = (row === 0 && col === 0);
  const isBottomRight = (row === 0 && col === totalCols - 1);
  if (isTopLeft || isTopRight || isBottomLeft || isBottomRight) {
    const cx = (col === 0) ? -sizeX / 2 + frameThick / 2 : sizeX / 2 - frameThick / 2;
    const cy = (row === 0) ? -sizeY / 2 + frameThick / 2 : sizeY / 2 - frameThick / 2;
    const rosette = addMesh(g, new THREE.CylinderGeometry(0.045, 0.045, 0.025, 12), m.goldPolished, [cx, cy, fZ + 0.015]);
    rosette.rotation.x = Math.PI / 2;
  }

  // Seamless Crisp Photo Face (High-definition photographic material with matte diffuse, no normal distortion, no seam insets)
  const tileTex = customTargets.getMosaicTileTexture(col, row, totalCols, totalRows);
  if (tileTex) {
    // Exact tile width/height so adjacent blocks meet edge-to-edge without blue gaps
    const faceGeo = new THREE.PlaneGeometry(sizeX + 0.002, sizeY + 0.002);
    const faceMat = new THREE.MeshStandardMaterial({
      map: tileTex,
      roughness: 0.85,
      metalness: 0.0,
      side: THREE.FrontSide,
    });
    const faceMesh = new THREE.Mesh(faceGeo, faceMat);
    faceMesh.castShadow = true;
    faceMesh.receiveShadow = true;
    faceMesh.position.set(0, 0, sizeZ / 2 + 0.008);
    g.add(faceMesh);
  }

  g.position.set(position.x, position.y, position.z);
  scene.add(g);

  const body = physics.makeBox(sizeX, sizeY, sizeZ, 5.0, position);
  physics.registerPair(g, body);
  return { mesh: g, body, initialPos: { ...position }, isCan: true, isBossBlock: true };
}

// ─────────────────────────────────────────────────────────────────────────────
//  9B. 3D SCULPTED BOSS EFFIGY / "PUTLA" (STATUE BUST: Head + Neck + Torso + Plinth)
//  Genuine 3D statue look — sphere head with face, cylindrical neck,
//  tapered geometric torso in marble/stone, decorative plinth/base.
// ─────────────────────────────────────────────────────────────────────────────
export function createBossPutla(scene, physics, position, sizeScale = 1.0) {
  const m = getMats();
  const objs = [];
  const s = sizeScale * 1.45; // Well-proportioned monumental scale that fits castle decks beautifully

  // ── Material Palette ───────────────────────────────────────────────────────
  const royalCrimsonMat = new THREE.MeshStandardMaterial({
    color: 0x991b1b, // Imperial royal velvet crimson
    roughness: 0.40,
    metalness: 0.15,
  });
  const marblePedestalMat = new THREE.MeshStandardMaterial({
    color: 0xf1f5f9, // Polished white royal marble
    roughness: 0.22,
    metalness: 0.08,
  });
  const goldMat = m.goldPolished;
  const rubyMat = m.rubyGem;
  const emeraldMat = m.emeraldGem;

  // ── Boss face textures (normal & combat-damaged) ──────────────────────────
  const normalFaceTex = customTargets.getFaceTillNeckTexture() || customTargets.customTexture;
  const damagedFaceTex = customTargets.getDamagedFaceTexture();

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // PART 1: ORNATE ROYAL PEDESTAL (Gilded marble base, ruby studs)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const plinthW = 0.88 * s, plinthH = 0.20 * s, plinthD = 0.62 * s;
  const plinthG = new THREE.Group();
  addMesh(plinthG, new THREE.BoxGeometry(plinthW, plinthH, plinthD), marblePedestalMat);
  // Gold top and bottom bevel mouldings
  addMesh(plinthG, new THREE.BoxGeometry(plinthW + 0.05, 0.035, plinthD + 0.05), goldMat, [0,  plinthH / 2 + 0.018, 0]);
  addMesh(plinthG, new THREE.BoxGeometry(plinthW + 0.05, 0.035, plinthD + 0.05), goldMat, [0, -plinthH / 2 - 0.018, 0]);
  // 4 corner gold studs
  [[plinthW/2 - 0.04, plinthD/2 - 0.04], [-plinthW/2 + 0.04, plinthD/2 - 0.04],
   [plinthW/2 - 0.04, -plinthD/2 + 0.04], [-plinthW/2 + 0.04, -plinthD/2 + 0.04]].forEach(([x, z]) => {
    addMesh(plinthG, new THREE.CylinderGeometry(0.04 * s, 0.05 * s, plinthH + 0.04, 10), goldMat, [x, 0, z]);
  });
  const plinthPos = { x: position.x, y: position.y + plinthH / 2, z: position.z || 0 };
  plinthG.position.set(plinthPos.x, plinthPos.y, plinthPos.z);
  scene.add(plinthG);
  const plinthBody = physics.makeBox(plinthW, plinthH, plinthD, 3.5, plinthPos);
  physics.registerPair(plinthG, plinthBody);
  const plinthObj = { mesh: plinthG, body: plinthBody, initialPos: { ...plinthPos }, isCan: false, isBossBlock: true };
  objs.push(plinthObj);

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // PART 2: TORSO (Royal Crimson Robe, Gold Pauldrons & Crimson Velvet Cape)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const torsoW = 0.95 * s, torsoH = 0.62 * s, torsoD = 0.52 * s;
  const torsoG = new THREE.Group();
  // Tapered chest body
  addMesh(torsoG, new THREE.CylinderGeometry(torsoW * 0.44, torsoW * 0.34, torsoH, 10), royalCrimsonMat);

  // Gold royal collar plate
  addMesh(torsoG, new THREE.CylinderGeometry(torsoW * 0.46, torsoW * 0.46, 0.04 * s, 16), goldMat, [0, torsoH / 2 + 0.01, 0]);

  // Royal Velvet Cape draped down the back
  const capeGeo = new THREE.PlaneGeometry(torsoW * 0.92, torsoH * 1.30, 8, 8);
  const cPos = capeGeo.attributes.position;
  for (let vi = 0; vi < cPos.count; vi++) {
    const yNorm = (cPos.getY(vi) + torsoH * 0.65) / (torsoH * 1.30);
    const zOffset = -torsoD * 0.46 - Math.sin(yNorm * Math.PI) * 0.12 * s;
    cPos.setZ(vi, zOffset);
  }
  capeGeo.computeVertexNormals();
  const capeMesh = new THREE.Mesh(capeGeo, royalCrimsonMat);
  capeMesh.position.set(0, -torsoH * 0.10, 0);
  capeMesh.castShadow = true;
  torsoG.add(capeMesh);

  // Gilded Pauldrons (Shoulder Armor Pads on left & right)
  [-1, 1].forEach(side => {
    const ex = side * torsoW * 0.44;
    const eGroup = new THREE.Group();
    addMesh(eGroup, new THREE.CylinderGeometry(0.14 * s, 0.17 * s, 0.08 * s, 10), goldMat);
    addMesh(eGroup, new THREE.SphereGeometry(0.048 * s, 8, 8), side > 0 ? rubyMat : emeraldMat, [0, 0.05 * s, 0]);
    eGroup.position.set(ex, torsoH * 0.36, 0);
    torsoG.add(eGroup);
  });

  // Chest royal insignia medal
  const medalFront = addMesh(torsoG, new THREE.CylinderGeometry(0.12 * s, 0.12 * s, 0.02 * s, 14), goldMat, [0, 0, torsoD * 0.46 + 0.01]);
  medalFront.rotation.x = Math.PI / 2;
  addMesh(torsoG, new THREE.SphereGeometry(0.048 * s, 8, 8), rubyMat, [0, 0, torsoD * 0.46 + 0.025]);

  const torsoBaseY = position.y + plinthH;
  const torsoPos = { x: position.x, y: torsoBaseY + torsoH / 2, z: position.z || 0 };
  torsoG.position.set(torsoPos.x, torsoPos.y, torsoPos.z);
  scene.add(torsoG);
  const torsoBody = physics.makeBox(torsoW, torsoH, torsoD, 5.0, torsoPos);
  physics.registerPair(torsoG, torsoBody);
  const torsoObj = { mesh: torsoG, body: torsoBody, initialPos: { ...torsoPos }, isCan: false, isBossBlock: true };
  objs.push(torsoObj);

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // PART 3: NECK (Gilded Torc Ring)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const neckR = 0.18 * s, neckH = 0.20 * s;
  const neckG = new THREE.Group();
  addMesh(neckG, new THREE.CylinderGeometry(neckR, neckR * 1.12, neckH, 14), goldMat);
  addMesh(neckG, new THREE.CylinderGeometry(neckR + 0.025, neckR + 0.025, 0.035 * s, 14), m.rubyGem, [0, 0, 0]);

  const neckBaseY = torsoBaseY + torsoH;
  const neckPos = { x: position.x, y: neckBaseY + neckH / 2, z: position.z || 0 };
  neckG.position.set(neckPos.x, neckPos.y, neckPos.z);
  scene.add(neckG);
  const neckBody = physics.makeBox(neckR * 2.2, neckH, neckR * 2.2, 2.0, neckPos);
  physics.registerPair(neckG, neckBody);
  const neckObj = { mesh: neckG, body: neckBody, initialPos: { ...neckPos }, isCan: false, isBossBlock: true };
  objs.push(neckObj);

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // PART 4: VTO-QUALITY 3D SCULPTED HEAD — MediaPipe Face Mesh + Canvas Fallback
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const headR = 0.44 * s;
  const headG = new THREE.Group();

  // Anatomically shaped head cranium (skin-tone sphere, renders BEFORE face mesh)
  const headMat = new THREE.MeshStandardMaterial({
    color: 0xedd6c8,  // Natural warm alabaster skin-stone
    roughness: 0.38,
    metalness: 0.04,
  });
  const cranium = addMesh(headG, new THREE.SphereGeometry(headR, 24, 20), headMat);
  cranium.scale.set(0.96, 1.08, 0.98);
  cranium.renderOrder = 0;

  // Sculpted Chin Ridge
  addMesh(headG, new THREE.SphereGeometry(headR * 0.30, 10, 10), headMat, [0, -headR * 0.78, headR * 0.48]);

  // Sculpted ear shells (left & right)
  [-1, 1].forEach(side => {
    addMesh(headG, new THREE.SphereGeometry(0.065 * s, 8, 8), headMat, [side * headR * 0.94, -headR * 0.05, 0]);
  });

  // Sculpted Royal Chestnut Hair Framing Head (Top cap + side ringlets)
  const hairMat = new THREE.MeshStandardMaterial({
    color: 0x3d2314, // Royal dark chestnut hair
    roughness: 0.65,
    metalness: 0.08,
  });
  const hairCap = new THREE.Mesh(new THREE.SphereGeometry(headR * 1.03, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.55), hairMat);
  hairCap.rotation.x = Math.PI * 0.10;
  headG.add(hairCap);
  [-1, 1].forEach(side => {
    const curl = new THREE.Mesh(new THREE.CylinderGeometry(0.075 * s, 0.06 * s, 0.42 * s, 8), hairMat);
    curl.position.set(side * headR * 0.92, -headR * 0.24, -0.04 * s);
    curl.rotation.z = side * 0.12;
    headG.add(curl);
  });

  // Gilded Royal Cameo Bezel Frame around Face (encircling the portrait at exact face depth)
  const bezelGeo = new THREE.TorusGeometry(headR * 0.90, 0.045 * s, 10, 36);
  const bezelMesh = new THREE.Mesh(bezelGeo, goldMat);
  bezelMesh.position.set(0, 0, headR * 1.04);
  headG.add(bezelMesh);

  // 8 Royal Gem studs around the royal cameo bezel
  for (let gi = 0; gi < 8; gi++) {
    const angle = (gi / 8) * Math.PI * 2;
    const gx = Math.cos(angle) * headR * 0.90;
    const gy = Math.sin(angle) * headR * 0.90;
    addMesh(headG, new THREE.SphereGeometry(0.028 * s, 8, 8), gi % 2 === 0 ? rubyMat : emeraldMat, [gx, gy, headR * 1.07]);
  }

  // ── FIXED Live Canvas Texture: High-definition 512x512 with mipmaps ─────────
  const faceCanvas = document.createElement('canvas');
  faceCanvas.width = 512;
  faceCanvas.height = 512;
  const faceCtx = faceCanvas.getContext('2d');

  // Draw face with guaranteed fallback — never leaves faceCanvas blank
  const normalSrcCanvas = customTargets.getFaceCanvas();
  if (normalSrcCanvas && normalSrcCanvas.width > 0 && normalSrcCanvas.height > 0) {
    try {
      faceCtx.drawImage(normalSrcCanvas, 0, 0, 512, 512);
    } catch(_) {
      customTargets.drawBossAvatar(faceCtx, 512, 512);  // ← fallback
    }
  } else {
    customTargets.drawBossAvatar(faceCtx, 512, 512);    // ← always-visible default
  }

  const liveFaceTex = new THREE.CanvasTexture(faceCanvas);
  liveFaceTex.colorSpace = THREE.SRGBColorSpace;
  liveFaceTex.generateMipmaps = true;
  liveFaceTex.minFilter = THREE.LinearMipmapLinearFilter;
  liveFaceTex.magFilter = THREE.LinearFilter;
  liveFaceTex.needsUpdate = true;  // ← Flush to GPU on first frame

  // Grab damaged canvas reference now (used in triggerDamage)
  const damagedSrcCanvas = customTargets.getDamagedCanvas();

  // ── Sculpted 3D Portrait Relief: Smooth, pristine curved cameo dome ──
  // Gentle spherical convexity preserves exact facial anatomy and photograph fidelity without warping
  const grid = 28;
  const faceW = headR * 1.82;
  const faceH = headR * 1.82;
  const faceGeo = new THREE.PlaneGeometry(faceW, faceH, grid, grid);
  const posAttr = faceGeo.attributes.position;
  for (let i = 0; i < posAttr.count; i++) {
    const x = posAttr.getX(i);
    const y = posAttr.getY(i);
    const nx = x / (faceW * 0.5); // -1 to +1
    const ny = y / (faceH * 0.5); // -1 to +1
    const d2 = nx * nx + ny * ny;

    // Smooth gentle royal cameo curvature — no artificial vertex bumps that distort real human faces
    const zCurve = Math.sqrt(Math.max(0, 1 - Math.min(1, d2 * 0.90))) * (headR * 0.15);
    posAttr.setZ(i, headR * 0.99 + zCurve);
  }
  faceGeo.computeVertexNormals();

  // ── FIXED Face Material: no z-fighting, renders clearly in front ───────────────────
  const faceMat = new THREE.MeshStandardMaterial({
    map: liveFaceTex,
    roughness: 0.40,
    metalness: 0.02,
    transparent: true,
    alphaTest: 0.01,
    side: THREE.DoubleSide,
    depthWrite: false,        // ← CRITICAL: prevents z-fighting with cranium
    polygonOffset: true,
    polygonOffsetFactor: -4,
    polygonOffsetUnits: -4,
  });
  const faceMesh = new THREE.Mesh(faceGeo, faceMat);
  faceMesh.castShadow = false;
  faceMesh.renderOrder = 2;   // ← Render after cranium (order 0)
  headG.add(faceMesh);

  // ── MediaPipe geometry upgrade: swap to real face mesh when landmarks ready ──
  customTargets.onFaceMeshReady((landmarks) => {
    try {
      const mpGeo = customTargets.getFaceMeshGeometry(faceW * 1.08, faceH * 1.08, headR * 0.55);
      if (mpGeo && faceMesh.parent) {
        faceMesh.geometry.dispose();
        faceMesh.geometry = mpGeo;
        console.log('[Boss] 🌟 Upgraded to real MediaPipe face mesh!');
      }
    } catch(_) {}
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // PART 5: MAGNIFICENT 5-PRONG GOLDEN ROYAL CROWN & 3D ORBITING STARS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const crownG = new THREE.Group();
  const crownBaseR = headR * 0.72;
  const crownBaseH = 0.14 * s;

  // Crown base ring
  addMesh(crownG, new THREE.CylinderGeometry(crownBaseR, crownBaseR * 1.06, crownBaseH, 20), goldMat, [0, crownBaseH / 2, 0]);
  // Crown ring gems
  for (let i = 0; i < 5; i++) {
    const angle = (i / 5) * Math.PI * 2;
    addMesh(crownG, new THREE.SphereGeometry(0.038 * s, 8, 8), i % 2 === 0 ? rubyMat : emeraldMat,
      [Math.cos(angle) * crownBaseR * 0.98, crownBaseH * 0.5, Math.sin(angle) * crownBaseR * 0.98]);
  }

  // 5 Tall dramatic prongs
  const prongCount = 5;
  for (let i = 0; i < prongCount; i++) {
    const angle = (i / prongCount) * Math.PI * 2;
    const px = Math.cos(angle) * crownBaseR * 0.80;
    const pz = Math.sin(angle) * crownBaseR * 0.80;
    const isTall = (i === 0);
    const prongH = (isTall ? 0.48 : 0.34) * s;
    addMesh(crownG, new THREE.CylinderGeometry(0.028 * s, 0.042 * s, prongH, 8), goldMat, [px, crownBaseH / 2 + prongH / 2, pz]);
    addMesh(crownG, new THREE.SphereGeometry(0.052 * s, 8, 8), i % 2 === 0 ? rubyMat : emeraldMat,
      [px, crownBaseH / 2 + prongH + 0.045 * s, pz]);
  }
  crownG.position.set(0, headR * 0.82, 0);
  headG.add(crownG);

  // 💫 3D Orbiting Golden Dizzy Stars Group (Spins above crown on hit!)
  const dizzyStarsG = new THREE.Group();
  for (let si = 0; si < 3; si++) {
    const a = (si / 3) * Math.PI * 2;
    const starM = new THREE.Mesh(new THREE.OctahedronGeometry(0.09 * s), goldMat);
    starM.position.set(Math.cos(a) * headR * 0.85, 0, Math.sin(a) * headR * 0.85);
    dizzyStarsG.add(starM);
  }
  dizzyStarsG.position.set(0, headR * 1.55, 0);
  dizzyStarsG.visible = false;
  headG.add(dizzyStarsG);

  const headBaseY = neckBaseY + neckH;
  const headPos = { x: position.x, y: headBaseY + headR, z: position.z || 0 };
  headG.position.set(headPos.x, headPos.y, headPos.z);
  scene.add(headG);
  const headBody = physics.makeBox(headR * 2.2, headR * 2 + 0.48 * s, headR * 2.2, 3.5, headPos);
  physics.registerPair(headG, headBody);
  const headObj = { mesh: headG, body: headBody, initialPos: { ...headPos }, isCan: true, isBossBlock: true, isBossHead: true };


  // 💥 PREMIUM COMBAT DAMAGE REACTION: canvas blit + 3D crown tilt + dizzy stars
  let damageTimer = null;
  const triggerDamage = (duration = 3000) => {
    // 1. Canvas texture swap (persistent damaged expression on 3D mesh)
    const dmgCanvas = customTargets.getDamagedCanvas();
    if (dmgCanvas) {
      faceCtx.clearRect(0, 0, 512, 512);
      faceCtx.drawImage(dmgCanvas, 0, 0, 512, 512);
      liveFaceTex.needsUpdate = true;
    } else {
      _drawEmergencyDamage(faceCtx);
      liveFaceTex.needsUpdate = true;
    }

    // 2. Activate 3D Orbiting Dizzy Stars
    if (dizzyStarsG) dizzyStarsG.visible = true;

    // 3. Knock crown crooked & tilt head
    if (crownG) {
      crownG.rotation.z = (Math.random() > 0.5 ? 0.48 : -0.48);
      crownG.rotation.x = -0.28;
      crownG.position.x = (Math.random() > 0.5 ? 0.08 * s : -0.08 * s);
    }
    // 4. Physical wobble impulse on head body if not docked yet
    if (headBody && !headG._skipPhysicsSync) {
      headBody.angularVelocity.z += (Math.random() > 0.5 ? 3.0 : -3.0);
      headBody.angularVelocity.x += 1.5;
      headBody.wakeUp();
    }

    if (damageTimer) clearTimeout(damageTimer);
    damageTimer = setTimeout(() => {
      // Restore normal face
      const normCanvas = customTargets.getFaceCanvas();
      faceCtx.clearRect(0, 0, 512, 512);
      if (normCanvas && normCanvas.width > 0) {
        try { faceCtx.drawImage(normCanvas, 0, 0, 512, 512); } catch(_) { customTargets.drawBossAvatar(faceCtx, 512, 512); }
      } else {
        customTargets.drawBossAvatar(faceCtx, 512, 512);
      }
      liveFaceTex.needsUpdate = true;

      // Reset 3D elements unless fallen/docked
      if (dizzyStarsG && !headObj.fallen) dizzyStarsG.visible = false;
      if (crownG) {
        crownG.rotation.set(0, 0, 0);
        crownG.position.set(0, headR * 0.82, 0);
      }
    }, duration);
  };

  headObj.dizzyStarsG = dizzyStarsG;
  headObj.crownG = crownG;

  // ── When boss head falls, trigger dizzy stars and let physics tumble it naturally! ──
  // (We do NOT pull the 3D head in front of the camera, keeping the player's view and cannon line of fire completely clear)
  headObj.updateOverlayPosition = (camera, renderer) => {
    if (!headG || !headG.parent) return;

    const baseFloorY = (position && typeof position.y === 'number') ? position.y : 2.5;
    const isFallen = headObj.fallen || (headBody && headBody.position.y < (baseFloorY - 0.25)) || (headG.position.y < (baseFloorY - 0.25));

    if (isFallen) {
      if (!headObj.fallen) {
        headObj.fallen = true;
      }
      if (dizzyStarsG) dizzyStarsG.visible = true;
    }
  };

  headObj.updateStars = () => {
    if (dizzyStarsG && dizzyStarsG.visible) {
      dizzyStarsG.rotation.y += 0.12;
    }
  };

  headObj.removeOverlay = () => {
    if (damageTimer) clearTimeout(damageTimer);
  };

  headObj._takeBossDamage = triggerDamage;
  neckObj._takeBossDamage = triggerDamage;
  torsoObj._takeBossDamage = triggerDamage;
  plinthObj._takeBossDamage = triggerDamage;

  objs.push(headObj);
  return objs;
}

// Helper: draw emergency damage overlay when no damaged canvas available
function _drawEmergencyDamage(ctx) {
  // Purple concussion flash
  ctx.fillStyle = 'rgba(109, 40, 217, 0.35)';
  ctx.beginPath(); ctx.arc(256, 256, 230, 0, Math.PI * 2); ctx.fill();
  // @_@ dizzy eyes
  [[175, 210], [335, 210]].forEach(([cx, cy]) => {
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.beginPath(); ctx.arc(cx, cy, 38, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#000'; ctx.lineWidth = 5; ctx.stroke();
    ctx.strokeStyle = '#1e1b4b'; ctx.lineWidth = 5;
    ctx.beginPath();
    for (let a = 0; a < Math.PI * 5; a += 0.16) {
      const r = (a / (Math.PI * 5)) * 30;
      const x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r;
      if (a < 0.16) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();
  });
  // Stars
  ctx.font = '48px sans-serif';
  ctx.fillText('💫', 130, 120); ctx.fillText('⭐', 220, 95); ctx.fillText('💫', 305, 120);
}



// ─────────────────────────────────────────────────────────────────────────────
//  9C. PREMIUM MINI BOSS BLOCKS & CANS (Supporting bricks with crystal-clear photo cameo)
// ─────────────────────────────────────────────────────────────────────────────
let _miniBossFaceTex = null;
let _miniBossFaceCanvas = null;

export function getMiniBossFaceTexture() {
  if (!_miniBossFaceCanvas) {
    _miniBossFaceCanvas = document.createElement('canvas');
    _miniBossFaceCanvas.width = 256;
    _miniBossFaceCanvas.height = 256;
  }
  const ctx = _miniBossFaceCanvas.getContext('2d');
  ctx.clearRect(0, 0, 256, 256);

  // Rich royal dark blue-violet background backing
  ctx.fillStyle = '#16162a';
  ctx.fillRect(0, 0, 256, 256);

  const normalSrcCanvas = customTargets.getFaceCanvas();
  if (normalSrcCanvas && normalSrcCanvas.width > 0 && normalSrcCanvas.height > 0) {
    try {
      ctx.drawImage(normalSrcCanvas, 0, 0, 256, 256);
    } catch (_) {
      customTargets.drawBossAvatar(ctx, 256, 256);
    }
  } else {
    customTargets.drawBossAvatar(ctx, 256, 256);
  }

  if (!_miniBossFaceTex) {
    _miniBossFaceTex = new THREE.CanvasTexture(_miniBossFaceCanvas);
    _miniBossFaceTex.colorSpace = THREE.SRGBColorSpace;
    _miniBossFaceTex.generateMipmaps = true;
    _miniBossFaceTex.minFilter = THREE.LinearMipmapLinearFilter;
    _miniBossFaceTex.magFilter = THREE.LinearFilter;

    // Auto-update texture when target photo changes
    customTargets.onChange(() => {
      if (_miniBossFaceCanvas && _miniBossFaceTex) {
        const c = _miniBossFaceCanvas.getContext('2d');
        c.clearRect(0, 0, 256, 256);
        c.fillStyle = '#16162a';
        c.fillRect(0, 0, 256, 256);
        const src = customTargets.getFaceCanvas();
        if (src && src.width > 0 && src.height > 0) {
          try { c.drawImage(src, 0, 0, 256, 256); } catch(_) { customTargets.drawBossAvatar(c, 256, 256); }
        } else {
          customTargets.drawBossAvatar(c, 256, 256);
        }
        _miniBossFaceTex.needsUpdate = true;
      }
    });
  }
  _miniBossFaceTex.needsUpdate = true;
  return _miniBossFaceTex;
}

export function createMiniBossBlock(scene, physics, position) {
  const m = getMats();
  const g = new THREE.Group();
  const sX = 0.62, sY = 0.62, sZ = 0.54;

  // Dark stone body
  const stoneMat = new THREE.MeshStandardMaterial({ color: 0x1c1c2e, roughness: 0.38, metalness: 0.14 });
  addMesh(g, new THREE.BoxGeometry(sX, sY, sZ), stoneMat);

  // Gold bevelled frame on front face
  const fT = 0.048, fD = 0.03, fZ = sZ / 2 + fD / 2;
  addMesh(g, new THREE.BoxGeometry(sX - fT, fT, fD), m.goldPolished, [0,  sY / 2 - fT / 2, fZ]);
  addMesh(g, new THREE.BoxGeometry(sX - fT, fT, fD), m.goldPolished, [0, -sY / 2 + fT / 2, fZ]);
  addMesh(g, new THREE.BoxGeometry(fT, sY, fD), m.goldPolished, [-sX / 2 + fT / 2, 0, fZ]);
  addMesh(g, new THREE.BoxGeometry(fT, sY, fD), m.goldPolished, [ sX / 2 - fT / 2, 0, fZ]);
  // 4 corner rosette gems
  [[sX/2 - fT/2, sY/2 - fT/2], [-sX/2 + fT/2, sY/2 - fT/2],
   [sX/2 - fT/2, -sY/2 + fT/2], [-sX/2 + fT/2, -sY/2 + fT/2]].forEach(([x, y]) => {
    const r = addMesh(g, new THREE.CylinderGeometry(0.028, 0.028, 0.022, 8), m.goldPolished, [x, y, fZ + 0.012]);
    r.rotation.x = Math.PI / 2;
    addMesh(g, new THREE.SphereGeometry(0.022, 6, 6), m.rubyGem, [x, y, fZ + 0.025]);
  });

  // 🌟 Gilded Royal Cameo Portrait disc (Crisp, high-contrast, always visible photo)
  const medalR = (sX - fT * 2) * 0.44;
  const cameoMat = new THREE.MeshStandardMaterial({
    map: getMiniBossFaceTexture(),
    roughness: 0.22,
    metalness: 0.02,
    emissive: 0x222222, // Crisp ambient illumination for mobile
    side: THREE.FrontSide,
  });

  // Front Face Cameo
  addMesh(g, new THREE.CircleGeometry(medalR * 0.96, 32), cameoMat, [0, 0, fZ + 0.008]);
  addMesh(g, new THREE.TorusGeometry(medalR, 0.018, 8, 28), m.goldPolished, [0, 0, fZ + 0.012]);

  // Mini decorative royal crown crest on top of cameo
  const crownMesh = addMesh(g, new THREE.ConeGeometry(medalR * 0.36, medalR * 0.28, 5), m.goldPolished, [0, medalR * 0.88, fZ + 0.018]);
  crownMesh.rotation.z = Math.PI;
  addMesh(g, new THREE.SphereGeometry(0.025, 8, 8), m.rubyGem, [0, medalR * 0.98, fZ + 0.024]);

  // Back Face Cameo (so if box is knocked or spun, photo remains 100% visible)
  const backZ = -fZ;
  const backCameo = addMesh(g, new THREE.CircleGeometry(medalR * 0.96, 32), cameoMat, [0, 0, backZ - 0.008]);
  backCameo.rotation.y = Math.PI;
  const backRing = addMesh(g, new THREE.TorusGeometry(medalR, 0.018, 8, 28), m.goldPolished, [0, 0, backZ - 0.012]);
  backRing.rotation.y = Math.PI;

  g.position.set(position.x, position.y, position.z);
  scene.add(g);
  const body = physics.makeBox(sX, sY, sZ, 4.8, position);
  physics.registerPair(g, body);
  return { mesh: g, body, initialPos: { ...position }, isCan: true, isBossBlock: true };
}

export function createMiniBossCan(scene, physics, position) {
  const m = getMats();
  const g = new THREE.Group();
  const r = 0.26, h = 0.72;

  // Dark obsidian can body with polished lacquer
  const darkMat = new THREE.MeshStandardMaterial({ color: 0x12122a, roughness: 0.24, metalness: 0.22 });
  const can = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h * 0.88, 24), darkMat);
  can.castShadow = true;
  g.add(can);

  // Gold crown battlement bands at top & bottom
  addMesh(g, new THREE.CylinderGeometry(r + 0.022, r + 0.022, h * 0.07, 24), m.goldPolished, [0,  h * 0.44, 0]);
  addMesh(g, new THREE.CylinderGeometry(r + 0.022, r + 0.022, h * 0.07, 24), m.goldPolished, [0, -h * 0.44, 0]);
  // Lid
  addMesh(g, new THREE.CylinderGeometry(r - 0.012, r - 0.012, 0.02, 20), m.canLid, [0, h * 0.46, 0]);

  // Embossed Gilded Royal Cameo Portrait Seal
  const badgeR = r * 0.58;
  const canFaceMat = new THREE.MeshStandardMaterial({
    map: getMiniBossFaceTexture(),
    roughness: 0.22,
    metalness: 0.02,
    emissive: 0x222222,
    side: THREE.FrontSide,
  });
  addMesh(g, new THREE.CircleGeometry(badgeR * 0.94, 28), canFaceMat, [0, 0.04, r + 0.010]);
  addMesh(g, new THREE.TorusGeometry(badgeR, 0.016, 8, 24), m.goldPolished, [0, 0.04, r + 0.012]);
  addMesh(g, new THREE.SphereGeometry(0.032, 8, 8), m.rubyGem, [0, 0.04 + badgeR * 0.92, r + 0.018]);

  g.position.set(position.x, position.y, position.z);
  scene.add(g);
  const body = physics.makeCanBody(r, h, 4.8, position);

  physics.registerPair(g, body);
  return { mesh: g, body, initialPos: { ...position }, isCan: true, isBossBlock: true };
}

// ─────────────────────────────────────────────────────────────────────────────
//  10. AUTHENTIC GOLDEN CANDLESTICK PEDESTAL & PURPLE PLATFORM
//  Direct match to WhatsApp Image 2026-09-22 at 21.44.57.jpeg & bg_reference.jpg
// ─────────────────────────────────────────────────────────────────────────────

export function createPedestal(scene, physics, position, worldTheme = 'coast', platShape = 'rect', rotSpeed = 0) {
  const m = getMats();
  const g = new THREE.Group();

  // 1. Feathered Dirt Arena Disc directly beneath pedestal on ground
  const dirtGeo = new THREE.CircleGeometry(3.8, 32);
  const dirtMat = new THREE.MeshBasicMaterial({
    map: textureGen.getDirtArenaTexture(),
    transparent: true,
    opacity: 0.94,
    depthWrite: false,
  });
  const dirt = new THREE.Mesh(dirtGeo, dirtMat);
  dirt.rotation.x = -Math.PI / 2;
  dirt.position.set(0, 0.02, 0);
  g.add(dirt);

  // Theme-adaptive platform colors
  let platMat = m.purpleEnamel;
  let colMat = m.goldWarm;
  if (worldTheme === 'sunset') {
    platMat = new THREE.MeshStandardMaterial({ color: 0xd90429, roughness: 0.26, metalness: 0.12 });
    colMat  = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.24, metalness: 0.14 });
  } else if (worldTheme === 'palace') {
    platMat = new THREE.MeshStandardMaterial({ color: 0x4f46e5, roughness: 0.24, metalness: 0.12 });
    colMat  = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.22, metalness: 0.16 });
  } else if (worldTheme === 'night') {
    platMat = new THREE.MeshStandardMaterial({ color: 0x1e1b4b, roughness: 0.28, metalness: 0.14 });
    colMat  = new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.24, metalness: 0.14 });
  } else if (worldTheme === 'tropical') {
    platMat = new THREE.MeshStandardMaterial({ color: 0x0f766e, roughness: 0.25, metalness: 0.12 });
    colMat  = new THREE.MeshStandardMaterial({ color: 0xfbbf24, roughness: 0.22, metalness: 0.15 });
  }

  // 2. Ornate Golden Bell-Shaped Base with Purple Trim (Stationary)
  addMesh(g, new THREE.CylinderGeometry(1.28, 1.45, 0.16, 32), platMat, [0, 0.08, 0]);
  addMesh(g, new THREE.CylinderGeometry(0.85, 1.25, 0.52, 32), colMat, [0, 0.38, 0]);

  // Decorative Golden Scalloped Arches with warm glowing window panels
  const numArches = 8;
  for (let i = 0; i < numArches; i++) {
    const a = (i / numArches) * Math.PI * 2;
    const r = 1.05;
    const archMat = new THREE.MeshBasicMaterial({ color: 0xfff0aa });
    const arch = new THREE.Mesh(new THREE.CircleGeometry(0.16, 16), archMat);
    arch.position.set(Math.cos(a) * r, 0.38, Math.sin(a) * r);
    arch.lookAt(Math.cos(a) * (r + 1), 0.38, Math.sin(a) * (r + 1));
    g.add(arch);

    const archRim = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.025, 8, 16, Math.PI), m.goldPolished);
    archRim.position.set(Math.cos(a) * (r + 0.01), 0.38, Math.sin(a) * (r + 0.01));
    archRim.lookAt(Math.cos(a) * (r + 1), 0.38, Math.sin(a) * (r + 1));
    g.add(archRim);
  }

  // Golden collar ring above bell base
  addMesh(g, new THREE.CylinderGeometry(0.55, 0.78, 0.15, 24), m.goldPolished, [0, 0.70, 0]);

  // 3. Central Tapered Golden Candlestick Column
  addMesh(g, new THREE.CylinderGeometry(0.24, 0.42, 2.3, 20), colMat, [0, 1.90, 0]);

  // 4. Flared Golden Capital / Head supporting the platform
  addMesh(g, new THREE.CylinderGeometry(0.55, 0.28, 0.36, 20), m.goldPolished, [0, 3.20, 0]);

  // 5. Signature Platform Slab (Rectangular or Square Depth, rotates if rotSpeed !== 0)
  const isSquare = (platShape === 'square');
  const platW = isSquare ? 4.2 : 5.4;
  const platH = 0.28;
  const platD = isSquare ? 4.2 : 2.0;
  const platY = 3.38 + platH / 2; // 3.52
  const platTopY = position.y + 3.38 + platH; // Top surface Y = 3.66

  const platformGroup = new THREE.Group();
  platformGroup.position.set(0, platY, 0);

  const slab = new THREE.Mesh(new THREE.BoxGeometry(platW, platH, platD), platMat);
  slab.castShadow = true;
  slab.receiveShadow = true;
  platformGroup.add(slab);

  // Gold bevel trim runners along the platform edges
  const topTrim = new THREE.Mesh(new THREE.BoxGeometry(platW + 0.06, 0.04, platD + 0.06), m.goldPolished);
  topTrim.position.set(0, platH/2 + 0.02, 0);
  platformGroup.add(topTrim);

  const botTrim = new THREE.Mesh(new THREE.BoxGeometry(platW + 0.06, 0.04, platD + 0.06), m.goldPolished);
  botTrim.position.set(0, -platH/2 - 0.02, 0);
  platformGroup.add(botTrim);

  // Gold rounded end caps
  [-platW / 2, platW / 2].forEach(x => {
    const cap = new THREE.Mesh(new THREE.BoxGeometry(0.08, platH + 0.08, platD + 0.06), m.goldPolished);
    cap.position.set(x, 0, 0);
    platformGroup.add(cap);
  });
  if (isSquare) {
    [-platD / 2, platD / 2].forEach(z => {
      const cap = new THREE.Mesh(new THREE.BoxGeometry(platW + 0.06, platH + 0.08, 0.08), m.goldPolished);
      cap.position.set(0, 0, z);
      platformGroup.add(cap);
    });
  }

  g.add(platformGroup);
  g.position.set(position.x, position.y, position.z);
  scene.add(g);

  // 100% Solid Table Surface: 3.0-meter deep kinematic block extending downward from platTopY
  const platBody = physics.makeKinematicPlatform(platW, 3.0, platD, { x: position.x, y: platTopY, z: position.z });
  physics.makeStaticBox(2.8, 0.6, 2.8, { x: position.x, y: position.y + 0.3, z: position.z });

  return {
    mesh: g,
    platformGroup,
    platBody,
    rotSpeed,
    platW,
    platD,
    platformY: platTopY, // Top surface Y = 3.66
  };
}

// ─────────────────────────────────────────────────────────────────────────────
//  11. 4 DISTINCT CANNONBALL QUALITIES (Iron, Bomb, Heavy, Roller)
// ─────────────────────────────────────────────────────────────────────────────
export function createCannonball(scene, physics, position, type = 'normal', skinId = 'royal') {
  let R = 0.26;
  let mass = 2.2;
  let mat;

  const g = new THREE.Group();

  if (type === 'bomb') {
    // 💥 BOMB: Area blast demolition (1.8 kg, pulsing incendiary red core with fuse)
    R = 0.32;
    mass = 1.8;
    mat = new THREE.MeshStandardMaterial({
      color: 0xdc2626,
      roughness: 0.20,
      metalness: 0.15,
      emissive: 0xef4444,
      emissiveIntensity: 0.70,
    });
    const sphere = new THREE.Mesh(new THREE.SphereGeometry(R, 20, 20), mat);
    sphere.castShadow = true;
    g.add(sphere);

    // Top bronze collar & burning fuse spark
    const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.10, 0.08, 14), getMats().goldPolished);
    collar.position.set(0, R * 0.94, 0);
    g.add(collar);
    const fuseSpark = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 8), new THREE.MeshBasicMaterial({ color: 0xffea00 }));
    fuseSpark.position.set(0, R * 0.94 + 0.08, 0);
    g.add(fuseSpark);

  } else if (type === 'heavy') {
    // 🧱 HEAVY: Kinetic Wrecking Ball (7.5 kg - 3.4x mass of iron, dense brass with rivets)
    R = 0.36;
    mass = 7.5;
    mat = new THREE.MeshStandardMaterial({
      color: 0xd97706,
      metalness: 0.35,
      roughness: 0.16,
      emissive: 0xb45309,
      emissiveIntensity: 0.25,
    });
    const sphere = new THREE.Mesh(new THREE.SphereGeometry(R, 22, 22), mat);
    sphere.castShadow = true;
    g.add(sphere);

    // Heavy iron band & 8 dome rivets
    const band = new THREE.Mesh(new THREE.TorusGeometry(R * 0.98, 0.035, 8, 24), getMats().silverMetal);
    g.add(band);
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      const rivet = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 8), getMats().goldPolished);
      rivet.position.set(Math.cos(a) * (R + 0.01), Math.sin(a) * (R + 0.01), 0);
      g.add(rivet);
    }

  } else if (type === 'roller') {
    // 🎳 ROLLER: Bowling Deck Sweeper (4.8 kg, ultra-low rolling friction, spins through bases)
    R = 0.30;
    mass = 4.8;
    mat = new THREE.MeshStandardMaterial({
      color: 0x059669,
      roughness: 0.10,
      metalness: 0.32,
      emissive: 0x10b981,
      emissiveIntensity: 0.30,
    });
    const sphere = new THREE.Mesh(new THREE.SphereGeometry(R, 22, 22), mat);
    sphere.castShadow = true;
    g.add(sphere);

    // Dual gold racing equator rings
    const ring1 = new THREE.Mesh(new THREE.TorusGeometry(R * 0.96, 0.024, 8, 24), getMats().goldPolished);
    ring1.rotation.x = Math.PI / 2;
    g.add(ring1);
    const ring2 = new THREE.Mesh(new THREE.TorusGeometry(R * 0.96, 0.024, 8, 24), getMats().goldPolished);
    ring2.rotation.y = Math.PI / 2;
    g.add(ring2);

    // 3 Bowling finger grip indentations
    const dotMat = new THREE.MeshBasicMaterial({ color: 0x064e3b });
    [[0.06, 0.22, 0.18], [-0.06, 0.22, 0.18], [0, 0.12, 0.25]].forEach(([x, y, z]) => {
      const grip = new THREE.Mesh(new THREE.CircleGeometry(0.032, 12), dotMat);
      grip.position.set(x, y, z);
      grip.lookAt(x * 2, y * 2, z * 2);
      g.add(grip);
    });

  } else if (type === 'slipper') {
    // 🩴 SLIPPER (CHAPPAL): Aerodynamic flipping rubber sandal (3.2 kg, comedic slap impact)
    R = 0.32;
    mass = 3.2;
    // Sole
    const soleGeo = new THREE.BoxGeometry(0.36, 0.09, 0.62);
    const soleMat = new THREE.MeshStandardMaterial({
      color: 0x06b6d4, roughness: 0.40, metalness: 0.10, emissive: 0x0891b2, emissiveIntensity: 0.25
    });
    const sole = new THREE.Mesh(soleGeo, soleMat);
    sole.castShadow = true;
    g.add(sole);

    // Yellow top footbed
    const bedGeo = new THREE.BoxGeometry(0.34, 0.02, 0.58);
    const bedMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.35 });
    const bed = new THREE.Mesh(bedGeo, bedMat);
    bed.position.y = 0.055;
    g.add(bed);

    // Red rubber Y-strap thong
    const strapMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.30 });
    const leftStrap = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.28, 8), strapMat);
    leftStrap.position.set(-0.10, 0.12, 0.02);
    leftStrap.rotation.z = -0.55;
    leftStrap.rotation.x = 0.45;
    g.add(leftStrap);

    const rightStrap = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.28, 8), strapMat);
    rightStrap.position.set(0.10, 0.12, 0.02);
    rightStrap.rotation.z = 0.55;
    rightStrap.rotation.x = 0.45;
    g.add(rightStrap);

  } else if (type === 'boot') {
    // 👢 COMBAT BOOT: Heavy steel-toed stomper (8.2 kg, heavy ground shockwave)
    R = 0.38;
    mass = 8.2;
    const bootGroup = new THREE.Group();
    const bootMat = new THREE.MeshStandardMaterial({ color: 0x3b1c0a, roughness: 0.35, metalness: 0.15 });
    const soleMat = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.60 });
    const goldMat = getMats().goldPolished;

    // Boot base / foot
    const foot = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.24, 0.58), bootMat);
    foot.position.set(0, -0.06, 0.04);
    bootGroup.add(foot);

    // Boot ankle / shaft
    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.20, 0.38, 14), bootMat);
    shaft.position.set(0, 0.18, -0.06);
    bootGroup.add(shaft);

    // Thick treaded sole
    const sole = new THREE.Mesh(new THREE.BoxGeometry(0.40, 0.09, 0.64), soleMat);
    sole.position.set(0, -0.21, 0.04);
    bootGroup.add(sole);

    // Steel toe cap
    const steelToe = new THREE.Mesh(new THREE.SphereGeometry(0.18, 14, 14), goldMat);
    steelToe.position.set(0, -0.06, 0.26);
    steelToe.scale.set(1.1, 0.8, 0.9);
    bootGroup.add(steelToe);

    g.add(bootGroup);

  } else if (type === 'splash') {
    // 💦 HYDRO SPLASH: Water balloon burst (2.8 kg, explodes in water droplets & waves)
    R = 0.30;
    mass = 2.8;
    mat = new THREE.MeshStandardMaterial({
      color: 0x00d2ff,
      roughness: 0.05,
      metalness: 0.10,
      transparent: true,
      opacity: 0.82,
      emissive: 0x0284c7,
      emissiveIntensity: 0.40,
    });
    const sphere = new THREE.Mesh(new THREE.SphereGeometry(R, 22, 22), mat);
    sphere.castShadow = true;
    g.add(sphere);

    // Tied balloon nozzle
    const nozzle = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.09, 0.09, 12), mat);
    nozzle.position.set(0, R * 0.95, 0);
    g.add(nozzle);

    // White gloss highlight spots
    const shineMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.75 });
    const shine = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 8), shineMat);
    shine.position.set(0.12, 0.14, 0.20);
    g.add(shine);

  } else if (type === 'cluster') {
    // 🚀 MIRV CLUSTER ROCKET: Missile that splits into 5 orbiting round bombs
    R = 0.34;
    mass = 3.6;
    const rocketGroup = new THREE.Group();
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0xd90429, roughness: 0.20, metalness: 0.30 });
    const noseMat = getMats().goldPolished;
    const finMat  = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.25 });

    // Rocket fuselage
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.20, 0.62, 16), bodyMat);
    body.rotation.x = Math.PI / 2;
    rocketGroup.add(body);

    // Golden nose cone
    const nose = new THREE.Mesh(new THREE.ConeGeometry(0.19, 0.32, 16), noseMat);
    nose.position.set(0, 0, 0.46);
    nose.rotation.x = Math.PI / 2;
    rocketGroup.add(nose);

    // 4 Stabilization fins
    for (let i = 0; i < 4; i++) {
      const fin = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.24, 0.22), finMat);
      const a = (i / 4) * Math.PI * 2;
      fin.position.set(Math.cos(a) * 0.22, Math.sin(a) * 0.22, -0.22);
      fin.rotation.z = a;
      rocketGroup.add(fin);
    }

    g.add(rocketGroup);

  } else if (type === 'fever') {
    // 👑 ROYAL FEVER OVERCHARGE: Giant 9.5 kg Golden Superball with radiant crown halo
    R = 0.42;
    mass = 9.5;
    mat = new THREE.MeshStandardMaterial({
      color: 0xffd700,
      metalness: 0.65,
      roughness: 0.12,
      emissive: 0xf59e0b,
      emissiveIntensity: 0.75,
    });
    const sphere = new THREE.Mesh(new THREE.SphereGeometry(R, 24, 24), mat);
    sphere.castShadow = true;
    g.add(sphere);

    // Golden Crown Ring Halo
    const crownRing = new THREE.Mesh(new THREE.TorusGeometry(R * 1.05, 0.045, 8, 28), getMats().goldPolished);
    crownRing.rotation.x = Math.PI / 2;
    g.add(crownRing);

  } else if (skinId === 'dragon') {
    // 🐉 DRAGON FIRE MORTAR: Mega Red Molten Magma Ball (2.9 kg, volcanic glow & fiery magma ring)
    R = 0.33; // Mega size
    mass = 2.9;
    mat = new THREE.MeshStandardMaterial({
      color: 0xdc2626,
      emissive: 0xb91c1c,
      emissiveIntensity: 0.85,
      roughness: 0.22,
      metalness: 0.15,
    });
    const sphere = new THREE.Mesh(new THREE.SphereGeometry(R, 24, 24), mat);
    sphere.castShadow = true;
    g.add(sphere);

    // Glowing magma molten band
    const magmaRing = new THREE.Mesh(new THREE.TorusGeometry(R * 0.96, 0.035, 8, 28), new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      emissive: 0xd97706,
      emissiveIntensity: 0.90,
      roughness: 0.1,
    }));
    magmaRing.rotation.x = Math.PI / 2;
    g.add(magmaRing);

    // Golden Dragon crest studs
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2;
      const stud = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.08, 6), getMats().goldPolished);
      stud.position.set(Math.cos(a) * (R * 0.95), 0, Math.sin(a) * (R * 0.95));
      stud.rotation.z = -Math.cos(a);
      g.add(stud);
    }

  } else if (skinId === 'tesla') {
    // ⚡ TESLA ARC BLASTER: Electric Plasma Orb (2.7 kg, high-voltage cyan glow & induction rings)
    R = 0.30;
    mass = 2.7;
    mat = new THREE.MeshStandardMaterial({
      color: 0x06b6d4,
      emissive: 0x00f0ff,
      emissiveIntensity: 0.95,
      roughness: 0.12,
      metalness: 0.35,
    });
    const sphere = new THREE.Mesh(new THREE.SphereGeometry(R, 24, 24), mat);
    sphere.castShadow = true;
    g.add(sphere);

    // Dual high-voltage electric induction rings
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 0.80,
      metalness: 0.8,
    });
    const ring1 = new THREE.Mesh(new THREE.TorusGeometry(R * 1.02, 0.025, 8, 24), ringMat);
    ring1.rotation.x = Math.PI / 3;
    g.add(ring1);
    const ring2 = new THREE.Mesh(new THREE.TorusGeometry(R * 1.02, 0.025, 8, 24), ringMat);
    ring2.rotation.y = Math.PI / 3;
    g.add(ring2);

  } else if (skinId === 'pirate') {
    // 🏴‍☠️ GOLDEN PIRATE BOMBARDIER: Gilded Corsair Skull Cannonball (2.8 kg, obsidian iron with golden skull plate)
    R = 0.31;
    mass = 2.8;
    mat = new THREE.MeshStandardMaterial({
      color: 0x18181b,
      metalness: 0.90,
      roughness: 0.22,
    });
    const sphere = new THREE.Mesh(new THREE.SphereGeometry(R, 22, 22), mat);
    sphere.castShadow = true;
    g.add(sphere);

    // Gold skull medallion and rim
    const skullPlate = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.04, 16), getMats().goldPolished);
    skullPlate.position.set(0, 0, R * 0.94);
    skullPlate.rotation.x = Math.PI / 2;
    g.add(skullPlate);

    const goldBand = new THREE.Mesh(new THREE.TorusGeometry(R * 0.98, 0.028, 8, 24), getMats().goldPolished);
    goldBand.rotation.x = Math.PI / 2;
    g.add(goldBand);

  } else if (skinId === 'candy') {
    // 🍬 CANDY PEPPERMINT BLASTER: Peppermint Swirl Jawbreaker (2.4 kg, high elasticity bounce)
    R = 0.30;
    mass = 2.4;
    mat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.12,
      metalness: 0.05,
      emissive: 0xffe4e6,
      emissiveIntensity: 0.20,
    });
    const sphere = new THREE.Mesh(new THREE.SphereGeometry(R, 24, 24), mat);
    sphere.castShadow = true;
    g.add(sphere);

    // Red candy swirl bands
    const candyRedMat = new THREE.MeshStandardMaterial({ color: 0xf43f5e, roughness: 0.15, metalness: 0.05 });
    const swirl1 = new THREE.Mesh(new THREE.TorusGeometry(R * 0.98, 0.035, 8, 24), candyRedMat);
    swirl1.rotation.set(0.6, 0.4, 0.2);
    g.add(swirl1);
    const swirl2 = new THREE.Mesh(new THREE.TorusGeometry(R * 0.98, 0.035, 8, 24), candyRedMat);
    swirl2.rotation.set(-0.6, -0.4, 0.8);
    g.add(swirl2);

  } else {
    // 🎯 ROYAL SOVEREIGN CANNONBALL: Authentic polished cast-iron cannonball
    R = 0.26;
    mass = 2.2;
    mat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.85,
      roughness: 0.20,
    });
    const sphere = new THREE.Mesh(new THREE.SphereGeometry(R, 22, 22), mat);
    sphere.castShadow = true;
    g.add(sphere);

    // Subtle polished silver equator bead
    const ring = new THREE.Mesh(new THREE.TorusGeometry(R * 0.98, 0.020, 8, 28), getMats().silverMetal);
    ring.rotation.x = Math.PI / 2;
    g.add(ring);
  }

  g.position.set(position.x, position.y, position.z);
  scene.add(g);

  const body = physics.makeSphere(R, mass, position);
  if (type === 'roller') {
    // Ultra-low damping for bowling deck roll
    body.linearDamping  = 0.002;
    body.angularDamping = 0.002;
  } else if (type === 'fever') {
    body.material.restitution = 0.55;
    body.linearDamping = 0.005;
  } else if (skinId === 'candy' && type === 'normal') {
    // High bouncy jawbreaker elasticity
    body.material.restitution = 0.65;
    body.linearDamping = 0.01;
    body.angularDamping = 0.02;
  } else if (type === 'heavy' || type === 'boot') {
    body.linearDamping  = 0.015;
    body.angularDamping = 0.025;
  } else if (type === 'slipper') {
    body.linearDamping  = 0.01;
    body.angularDamping = 0.01;
    // Comedic flipping spin impulse
    body.angularVelocity.set(12, 4, 8);
  } else {
    body.linearDamping  = 0.02;
    body.angularDamping = 0.04;
  }
  physics.registerPair(g, body);

  return { mesh: g, body, ballType: type, skinId };
}

// ─────────────────────────────────────────────────────────────────────────────
//  12. DISPOSE HELPER
// ─────────────────────────────────────────────────────────────────────────────
export function disposeObj(scene, physics, obj) {
  if (!obj) return;
  obj.fallen = true;
  obj.clearedFromTable = true;
  if (obj.mesh) {
    scene.remove(obj.mesh);
    obj.mesh.traverse(child => {
      if (child.isMesh) {
        if (child.geometry) child.geometry.dispose();
      }
    });
  }
  if (obj.body) {
    physics.removeBody(obj.body);
  }
}
