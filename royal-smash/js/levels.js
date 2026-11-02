/**
 * levels.js — 78 Diverse, Monumental, Progressively Escalating Levels for Royal Smash 3D
 * Across 6 Grand Royal Worlds (13 Levels per World with Palace Gate culmination):
 * 1. Emerald Coast (Levels 1–13 · Palace Gate: Grand Coral Citadel)
 * 2. Sunset Port Royale (Levels 14–26 · Palace Gate: Port Sun King Bastion)
 * 3. Imperial Palace Keep (Levels 27–39 · Palace Gate: The Sovereign Crown Gate)
 * 4. Mystic Moonlit Citadel (Levels 40–52 · Palace Gate: Lunar Overlord Spires)
 * 5. Dragon's Coral Atoll (Levels 53–65 · Palace Gate: Sea Dragon Throne Keep)
 * 6. Sovereign Grand Empire Peak (Levels 66–78 · Palace Gate: The Imperial Zenith Citadel)
 *
 * Engineered with 8 authentic, distinct structural archetypes with anti-collapse segmented piers.
 */
import { customTargets } from './custom_target.js';
import { economy } from './economy.js';

// ─── World Themes Definition (6 Grand Worlds x 13 Levels) ─────────────────────
export const WORLDS = [
  { id: 'coast',    name: 'Emerald Coastal Haven',       levels: [1, 13],  canTheme: 'blue' },
  { id: 'sunset',   name: 'Sunset Port Royale',          levels: [14, 26], canTheme: 'pink' },
  { id: 'palace',   name: 'Imperial Palace Keep',        levels: [27, 39], canTheme: 'purple' },
  { id: 'night',    name: 'Mystic Moonlit Citadel',      levels: [40, 52], canTheme: 'obsidian' },
  { id: 'tropical', name: "Dragon's Coral Atoll",        levels: [53, 65], canTheme: 'jade' },
  { id: 'empire',   name: 'Sovereign Grand Empire Peak', levels: [66, 78], canTheme: 'purple' },
];

const WORLD_ROTATION = ['coast', 'sunset', 'palace', 'tropical', 'night', 'empire'];

export function getWorldTheme(levelNum) {
  const idx = Math.floor((Math.max(1, levelNum) - 1) / 3) % WORLD_ROTATION.length;
  return WORLD_ROTATION[idx];
}


export const LEVELS = [];

// ─── 3D Putla & Mini-Boss Stage Builder for Continuous Boss Mode ──────────────
// 8 monumental architectural archetypes directly inspired by reference images:
// Multi-tier, 7-8 columns wide, grand Boss Putla busts and colossal Photo Mosaics!
export function buildBossModeStage(levelNum, platformY, themeCan) {
  const canH  = 0.72;
  const bH    = 0.22;
  const cubeS = 0.56;
  const items = [];
  const arch  = levelNum % 8; // 8 distinct monumental archetypes

  const isPalace = (levelNum % 13 === 0);
  const putlaScale = isPalace ? 1.25 : 1.05;

  // Helper: Place a column of cans at (x, z)
  const addCol = (x, z, count, primaryType, secondaryType = 'can') => {
    for (let r = 0; r < count; r++) {
      const type = (r % 2 === 0) ? primaryType : secondaryType;
      items.push({ type, pos: { x, y: platformY + r * canH + canH / 2, z: z || 0 } });
    }
  };

  // Helper: Place a horizontal beam
  const addBeam = (x, y, z, width) => {
    items.push({ type: 'beam', pos: { x, y, z: z || 0 }, width });
  };

  // Helper: Place Boss Putla
  const addPutla = (y, x = 0, z = 0) => {
    items.push({ type: 'putla', pos: { x, y, z }, sizeScale: putlaScale });
  };

  // Helper: Place a multi-story mini-boss bastion [block + can + spire]
  const addBastion = (x, z, baseY, height = 3) => {
    items.push({ type: 'boss_block', pos: { x, y: baseY + cubeS / 2, z } });
    if (height >= 2) items.push({ type: 'boss_can', pos: { x, y: baseY + cubeS + canH / 2, z } });
    if (height >= 3) items.push({ type: 'spire',    pos: { x, y: baseY + cubeS + canH + 0.30, z } });
  };

  // ── Archetype 0: Grand Imperial Coliseum (Inspired by Image 1) ─────────────
  // 7 wide foundation columns (2 tiers tall), wide beam, horizontal pinwheels,
  // Giant Boss Putla center-stage flanked by 3-tier mini-boss bastions!
  if (arch === 0) {
    const cols = [-1.80, -1.20, -0.60, 0, 0.60, 1.20, 1.80];
    cols.forEach((x, idx) => {
      const cType = (idx === 0 || idx === 6) ? 'boss_can' : (idx % 2 === 0 ? 'pink_can' : themeCan);
      addCol(x, 0, 2, cType, 'can');
    });

    const deck1Y = platformY + canH * 2 + bH / 2;
    addBeam(0, deck1Y, 0, 4.8);

    // Horizontal rolling candy pinwheels on deck
    [-1.50, 1.50].forEach(x => {
      items.push({ type: 'pinwheel', pos: { x, y: deck1Y + bH / 2 + cubeS / 2, z: 0 } });
    });

    // Central Monumental Boss Putla
    addPutla(deck1Y + bH / 2, 0, 0);

    // Flanking 3-tier towers
    addBastion(-1.80, 0, deck1Y + bH / 2, 3);
    addBastion( 1.80, 0, deck1Y + bH / 2, 3);

    // Top crown canopy over side bastions
    const canopyY = deck1Y + bH / 2 + cubeS + canH + bH / 2;
    [-1.20, 1.20].forEach(x => {
      items.push({ type: 'boss_block', pos: { x, y: deck1Y + bH / 2 + cubeS / 2, z: -0.20 } });
    });

    if (isPalace) {
      [-2.10, 2.10].forEach(x => {
        items.push({ type: 'boss_can', pos: { x, y: platformY + canH / 2, z: 0 } });
        items.push({ type: 'spire', pos: { x, y: platformY + canH + 0.30, z: 0 } });
      });
    }
  }

  // ── Archetype 1: The Colossal Boss Mosaic Keep (Inspired by Image 3) ────────
  // Dual massive stone foundation pillars holding a HUGE 3x3 Photo Mosaic Wall!
  else if (arch === 1) {
    // Twin massive 3-story foundation pillars (x = -1.50 and +1.50)
    [-1.60, -1.10].forEach(x => {
      items.push({ type: 'fleur', pos: { x, y: platformY + cubeS / 2, z: 0 } });
      items.push({ type: 'boss_can', pos: { x, y: platformY + cubeS + canH / 2, z: 0 } });
      items.push({ type: 'fleur', pos: { x, y: platformY + cubeS + canH + cubeS / 2, z: 0 } });
    });
    [1.10, 1.60].forEach(x => {
      items.push({ type: 'fleur', pos: { x, y: platformY + cubeS / 2, z: 0 } });
      items.push({ type: 'boss_can', pos: { x, y: platformY + cubeS + canH / 2, z: 0 } });
      items.push({ type: 'fleur', pos: { x, y: platformY + cubeS + canH + cubeS / 2, z: 0 } });
    });

    // Central support arch
    items.push({ type: 'boss_can', pos: { x: 0, y: platformY + canH / 2, z: -0.25 } });
    items.push({ type: themeCan, pos: { x: 0, y: platformY + canH * 1.5, z: -0.25 } });

    const pierTopY = platformY + cubeS * 2 + canH;
    const deckY = pierTopY + bH / 2;
    addBeam(0, deckY, 0, 4.4);

    // 👑 MONUMENTAL 3D ROYAL BOSS PUTLA CENTERPIECE
    items.push({
      type: 'putla',
      pos: { x: 0, y: deckY + bH / 2, z: 0 },
      sizeScale: 1.25
    });

    // Flanking guardian bastions
    [-1.75, 1.75].forEach(x => {
      items.push({ type: 'boss_block', pos: { x, y: deckY + bH / 2 + cubeS / 2, z: 0 } });
      items.push({ type: 'boss_can', pos: { x, y: deckY + bH / 2 + cubeS + canH / 2, z: 0 } });
      items.push({ type: 'spire', pos: { x, y: deckY + bH / 2 + cubeS + canH + 0.30, z: 0 } });
    });
  }

  // ── Archetype 2: 4-Story Sovereign Fortress (Inspired by Image 2) ───────────
  // 7 wide foundation pillars, double gemstone beams, elevated Boss Putla & spires!
  else if (arch === 2) {
    const cols = [-1.75, -1.15, -0.58, 0, 0.58, 1.15, 1.75];
    cols.forEach(x => addCol(x, 0, 2, themeCan, 'can'));

    const deck1Y = platformY + canH * 2 + bH / 2;
    addBeam(0, deck1Y, 0, 4.6);

    // Tier 2: 5 columns on deck 1
    [-1.20, -0.60, 0, 0.60, 1.20].forEach((x, idx) => {
      items.push({ type: idx % 2 === 0 ? 'boss_can' : 'pinwheel', pos: { x, y: deck1Y + bH / 2 + canH / 2, z: 0 } });
    });

    const deck2Y = deck1Y + bH / 2 + canH + bH / 2;
    addBeam(0, deck2Y, 0, 3.4);

    // Summit: Giant Boss Putla
    addPutla(deck2Y + bH / 2, 0, 0);

    // Flanking bastions on deck 1
    addBastion(-1.75, 0, deck1Y + bH / 2, 3);
    addBastion( 1.75, 0, deck1Y + bH / 2, 3);

    // Flanking spires on deck 2
    [-1.20, 1.20].forEach(x => {
      items.push({ type: 'spire', pos: { x, y: deck2Y + bH / 2 + 0.30, z: 0 } });
    });
  }

  // ── Archetype 3: Twin Bastion Sky-Bridge Citadel ─────────────────────────────
  // Two monumental 3-story siege towers connected by a massive sky-bridge with Boss Putla!
  else if (arch === 3) {
    const towerX = 1.45;
    // Left Siege Tower
    [-towerX - 0.32, -towerX + 0.32].forEach(x => addCol(x, 0, 3, 'boss_can', themeCan));
    const leftBeamY = platformY + canH * 3 + bH / 2;
    addBeam(-towerX, leftBeamY, 0, 1.2);
    items.push({ type: 'spire', pos: { x: -towerX, y: leftBeamY + bH / 2 + 0.30, z: 0 } });

    // Right Siege Tower
    [towerX - 0.32, towerX + 0.32].forEach(x => addCol(x, 0, 3, 'boss_can', themeCan));
    const rightBeamY = platformY + canH * 3 + bH / 2;
    addBeam(towerX, rightBeamY, 0, 1.2);
    items.push({ type: 'spire', pos: { x: towerX, y: rightBeamY + bH / 2 + 0.30, z: 0 } });

    // Central Arch Support
    [-0.50, 0.50].forEach(x => addCol(x, 0, 2, themeCan, 'can'));
    const bridgeY = platformY + canH * 2 + bH / 2;
    addBeam(0, bridgeY, 0, 3.8);

    // Summit: Giant Boss Putla overlooking the bridge
    addPutla(bridgeY + bH / 2, 0, 0);
    [-0.75, 0.75].forEach(x => {
      items.push({ type: 'boss_block', pos: { x, y: bridgeY + bH / 2 + cubeS / 2, z: 0 } });
    });
  }

  // ── Archetype 4: Grand 4x3 Mosaic Rampart ───────────────────────────────────
  // Colossal wide 4-column x 3-row Boss Photo Mosaic wall (3.6m wide!)
  else if (arch === 4) {
    const cols = [-1.65, -1.10, -0.55, 0.55, 1.10, 1.65];
    cols.forEach((x, idx) => addCol(x, 0, 2, idx % 2 === 0 ? 'boss_can' : themeCan, 'can'));

    const deck1Y = platformY + canH * 2 + bH / 2;
    addBeam(0, deck1Y, 0, 4.8);

    // 👑 MONUMENTAL 3D ROYAL BOSS PUTLA CENTERPIECE
    items.push({
      type: 'putla',
      pos: { x: 0, y: deck1Y + bH / 2, z: 0 },
      sizeScale: 1.30
    });

    // Flanking Sentry Towers
    [-1.90, 1.90].forEach(x => {
      items.push({ type: 'boss_block', pos: { x, y: deck1Y + bH / 2 + cubeS / 2, z: 0 } });
      items.push({ type: 'boss_can', pos: { x, y: deck1Y + bH / 2 + cubeS + canH / 2, z: 0 } });
      items.push({ type: 'spire', pos: { x, y: deck1Y + bH / 2 + cubeS + canH + 0.30, z: 0 } });
    });
  }

  // ── Archetype 5: Fortified Gatehouse Rampart (8 Columns Across) ──────────────
  // Massive 8-column wide fortified foundation wall across the entire 5.2m platform!
  else if (arch === 5) {
    const wallXs = [-1.80, -1.30, -0.80, -0.30, 0.30, 0.80, 1.30, 1.80];
    wallXs.forEach((x, idx) => {
      addCol(x, 0, 2, (idx === 0 || idx === 7 || idx === 3 || idx === 4) ? 'boss_can' : themeCan, 'can');
    });

    const deck1Y = platformY + canH * 2 + bH / 2;
    addBeam(0, deck1Y, 0, 4.8);

    // Gatehouse Ramparts: Boss blocks on left and right
    [-1.80, -1.30, 1.30, 1.80].forEach(x => {
      items.push({ type: 'boss_block', pos: { x, y: deck1Y + bH / 2 + cubeS / 2, z: 0 } });
    });

    // Central High Boss Putla
    addPutla(deck1Y + bH / 2, 0, 0);

    // Parapet roof spires
    [-1.80, -1.30, 1.30, 1.80].forEach(x => {
      items.push({ type: 'spire', pos: { x, y: deck1Y + bH / 2 + cubeS + 0.30, z: 0 } });
    });
  }

  // ── Archetype 6: Diamond Chevron Sovereign Keep ─────────────────────────────
  // Deep 3D chevron arrangement with multi-tier platforms and summit Boss Putla!
  else if (arch === 6) {
    const vCols = [
      { x: 0,     z:  0,    rows: 2, t: 'boss_can' },
      { x: -0.75, z: -0.22, rows: 2, t: themeCan   },
      { x:  0.75, z: -0.22, rows: 2, t: themeCan   },
      { x: -1.45, z:  0.22, rows: 2, t: 'boss_can' },
      { x:  1.45, z:  0.22, rows: 2, t: 'boss_can' },
      { x: -1.90, z:  0,    rows: 1, t: themeCan   },
      { x:  1.90, z:  0,    rows: 1, t: themeCan   },
    ];
    vCols.forEach(({ x, z, rows, t }) => addCol(x, z, rows, t, 'can'));

    const deck1Y = platformY + canH * 2 + bH / 2;
    addBeam(0, deck1Y, 0, 4.6);

    // Central Elevated Boss Putla
    addPutla(deck1Y + bH / 2, 0, 0);

    // Flanking 3-tier towers
    addBastion(-1.50, 0.22, deck1Y + bH / 2, 3);
    addBastion( 1.50, 0.22, deck1Y + bH / 2, 3);

    [-0.75, 0.75].forEach(x => {
      items.push({ type: 'pinwheel', pos: { x, y: deck1Y + bH / 2 + cubeS / 2, z: 0 } });
    });
  }

  // ── Archetype 7: 3-Tier Imperial Throne Summit ──────────────────────────────
  // Grand ascending pyramid: 8 wide base -> 5 wide mid -> summit Boss Putla!
  else {
    const baseXs = [-1.80, -1.30, -0.80, -0.30, 0.30, 0.80, 1.30, 1.80];
    baseXs.forEach((x, idx) => {
      items.push({ type: (idx === 0 || idx === 7) ? 'boss_can' : themeCan, pos: { x, y: platformY + canH / 2, z: 0 } });
    });
    const t1BeamY = platformY + canH + bH / 2;
    addBeam(0, t1BeamY, 0, 4.8);

    // Tier 2: 5 columns wide
    const t2Xs = [-1.20, -0.60, 0, 0.60, 1.20];
    t2Xs.forEach((x, idx) => {
      items.push({ type: idx % 2 === 0 ? 'boss_block' : 'boss_can', pos: { x, y: t1BeamY + bH / 2 + canH / 2, z: 0 } });
    });
    const t2BeamY = t1BeamY + bH / 2 + canH + bH / 2;
    addBeam(0, t2BeamY, 0, 3.2);

    // Summit: Giant Boss Putla
    addPutla(t2BeamY + bH / 2, 0, 0);

    // Flanking spires on Tier 1
    [-1.80, -1.30, 1.30, 1.80].forEach(x => {
      items.push({ type: 'spire', pos: { x, y: t1BeamY + bH / 2 + 0.30, z: 0 } });
    });
    [-1.20, 1.20].forEach(x => {
      items.push({ type: 'spire', pos: { x, y: t2BeamY + bH / 2 + 0.30, z: 0 } });
    });
  }

  return items;
}

// 78 Curated level titles
const LEVEL_TITLES = [
  // World 1: Coast (1-13)
  "The Royal Gateway", "Seaside Citadel", "Rolling Shore Wheels", "Watchtower Fortress", "Boss: Coastal Warden",
  "Seagull's Rampart", "Emerald Colosseum", "Twin Lookout Towers", "The King's Gate", "Boss: Grand Admiral's Keep",
  "Tide Watchtower", "Harbor Bastion", "👑 PALACE GATE: Grand Coastal Keep",

  // World 2: Sunset (14-26)
  "Amber Ramparts", "Sunset Wheel Run", "Crimson Watchtower", "Golden Barbican", "Boss: Sunset General",
  "Fiery Colosseum", "Dusk Keep", "Twin Sunset Citadels", "The Sunken Vault", "Boss: Sun King's Monument",
  "Gilded Redoubt", "Solar Fortress", "👑 PALACE GATE: Port Sun King Bastion",

  // World 3: Palace (27-39)
  "Imperial Courtyard", "Fleur-de-lis Keep", "Palace Archway", "The Royal Treasury", "Boss: Grand Chancellor",
  "Cathedral Spires", "Purple Marble Bastion", "Imperial Bridge", "The Hall of Kings", "Boss: The Queen's Citadel",
  "Royal Armor Keep", "Crown Jewels Vault", "👑 PALACE GATE: Sovereign Crown Gate",

  // World 4: Night (40-52)
  "Moonlit Redoubt", "Midnight Barrels", "Starlight Spire", "Shadow Keep", "Boss: Midnight Overlord",
  "Eclipse Colosseum", "Cyan Lagoon Tower", "Twin Moon Towers", "The Obsidian Gate", "Boss: Lord of the Night",
  "Celestial Rampart", "Astral Keep", "👑 PALACE GATE: Lunar Overlord Spires",

  // World 5: Tropical (53-65)
  "Coral Isle Fortress", "Tropical Avalanche", "Palm Haven Citadel", "Pirate King's Vault", "Boss: Treasure Commodore",
  "Sapphire Spire", "Turquoise Redoubt", "Twin Coral Towers", "The Imperial Atoll", "Boss: Sovereign of the Seas",
  "Lagoon Fortress", "Kraken's Redoubt", "👑 PALACE GATE: Sea Dragon Throne Keep",

  // World 6: Empire (66-78)
  "Zenith Spires", "Golden Lion Rampart", "Imperial Monolith", "Dragon's Crown Fortress", "Boss: Archduke of Iron",
  "Titan's Colosseum", "Emperor's Redoubt", "Sovereign Twin Towers", "Crown of the Realm", "Boss: Grand Sovereign Keep",
  "Aegis Citadel", "Apex Bastion", "👑 PALACE GATE: The Imperial Zenith Citadel"
];

function getThemeCan(theme) {
  if (theme === 'coast') return 'blue_can';
  if (theme === 'sunset') return 'pink_can';
  if (theme === 'palace') return 'fleur_can';
  if (theme === 'night') return 'obsidian_can';
  if (theme === 'tropical') return 'jade_can';
  if (theme === 'empire') return 'fleur_can';
  return 'can';
}

// ── Bulky Wave 1 Diverse Vanguard Fortresses ─────────────────────────────────
// 8 unique, weighty architectural archetypes for Wave 1 outer walls & barbicans
export function buildBulkyWave1(levelNum, platformY, themeCan) {
  const items = [];
  const canH = 0.72;
  const bH = 0.22;
  const cubeS = 0.56;
  const arch = (levelNum + Math.floor(levelNum / 3)) % 8;
  const isRevenge = Boolean(customTargets.active || economy.bossModeContinuous);
  const bBlock = isRevenge ? 'boss_block' : 'wide_block';
  const bCan   = isRevenge ? 'boss_can'   : 'octagon_tower';

  // ── Vanguard 0: The Barbican Gatehouse Bulwark ──
  if (arch === 0) {
    // Left Pier (x = -1.35): Wide Stone foundation + Octagon turret + spire
    items.push({ type: bBlock, pos: { x: -1.35, y: platformY + cubeS / 2, z: 0 } });
    items.push({ type: themeCan, pos: { x: -1.35, y: platformY + cubeS + canH / 2, z: 0 } });
    const lBeamY = platformY + cubeS + canH + bH / 2;
    items.push({ type: 'beam', pos: { x: -1.35, y: lBeamY, z: 0 }, width: 1.25 });
    items.push({ type: 'octagon_tower', pos: { x: -1.35, y: lBeamY + bH / 2 + canH / 2, z: 0 } });
    items.push({ type: 'royal_dome', pos: { x: -1.35, y: lBeamY + bH / 2 + canH + 0.30, z: 0 } });

    // Right Pier (x = +1.35)
    items.push({ type: bBlock, pos: { x: 1.35, y: platformY + cubeS / 2, z: 0 } });
    items.push({ type: themeCan, pos: { x: 1.35, y: platformY + cubeS + canH / 2, z: 0 } });
    const rBeamY = platformY + cubeS + canH + bH / 2;
    items.push({ type: 'beam', pos: { x: 1.35, y: rBeamY, z: 0 }, width: 1.25 });
    items.push({ type: 'octagon_tower', pos: { x: 1.35, y: rBeamY + bH / 2 + canH / 2, z: 0 } });
    items.push({ type: 'royal_dome', pos: { x: 1.35, y: rBeamY + bH / 2 + canH + 0.30, z: 0 } });

    // Center Gate Bulwark (x = 0): Staggered depth (z = -0.25 and z = +0.25)
    [-0.25, 0.25].forEach(z => {
      items.push({ type: 'blue_can', pos: { x: 0, y: platformY + canH / 2, z: z } });
      items.push({ type: themeCan, pos: { x: 0, y: platformY + canH + canH / 2, z: z } });
    });
    const cBeamY = platformY + canH * 2 + bH / 2;
    items.push({ type: 'beam', pos: { x: 0, y: cBeamY, z: 0 }, width: 1.40 });
    items.push({ type: bCan, pos: { x: 0, y: cBeamY + bH / 2 + canH / 2, z: 0 } });
    items.push({ type: 'crystal_spire', pos: { x: 0, y: cBeamY + bH / 2 + canH + 0.30, z: 0 } });
  }

  // ── Vanguard 1: The Triple-Bastion Moat Wall ──
  else if (arch === 1) {
    const bastions = [-1.40, 0, 1.40];
    bastions.forEach((bx, idx) => {
      items.push({ type: (idx === 1 ? bBlock : 'fleur'), pos: { x: bx - 0.25, y: platformY + cubeS / 2, z: 0 } });
      items.push({ type: themeCan, pos: { x: bx + 0.25, y: platformY + canH / 2, z: 0 } });
      items.push({ type: (idx === 1 ? bCan : 'blue_can'), pos: { x: bx - 0.25, y: platformY + cubeS + canH / 2, z: 0 } });
      items.push({ type: 'can', pos: { x: bx + 0.25, y: platformY + canH + canH / 2, z: 0 } });

      const bDeckY = platformY + Math.max(cubeS, canH) + canH + bH / 2;
      items.push({ type: 'beam', pos: { x: bx, y: bDeckY, z: 0 }, width: 1.15 });
      items.push({ type: (idx === 1 ? 'powder_keg' : themeCan), pos: { x: bx, y: bDeckY + bH / 2 + canH / 2, z: 0 } });
      items.push({ type: 'spire', pos: { x: bx, y: bDeckY + bH / 2 + canH + 0.30, z: 0 } });
    });
  }

  // ── Vanguard 2: The Monolithic Armored Vault ──
  else if (arch === 2) {
    // Left Heavy Pillar (x = -1.30): 2x2 bulky can & stone cluster
    items.push({ type: bBlock, pos: { x: -1.30, y: platformY + cubeS / 2, z: -0.22 } });
    items.push({ type: themeCan, pos: { x: -1.30, y: platformY + canH / 2, z: 0.22 } });
    items.push({ type: 'octagon_tower', pos: { x: -1.30, y: platformY + cubeS + canH / 2, z: -0.22 } });
    items.push({ type: 'can', pos: { x: -1.30, y: platformY + canH + canH / 2, z: 0.22 } });
    const lDeckY = platformY + canH * 2 + bH / 2;
    items.push({ type: 'beam', pos: { x: -1.30, y: lDeckY, z: 0 }, width: 1.25 });
    items.push({ type: 'blue_can', pos: { x: -1.30, y: lDeckY + bH / 2 + canH / 2, z: 0 } });
    items.push({ type: 'spire', pos: { x: -1.30, y: lDeckY + bH / 2 + canH + 0.30, z: 0 } });

    // Right Heavy Pillar (x = +1.30)
    items.push({ type: bBlock, pos: { x: 1.30, y: platformY + cubeS / 2, z: -0.22 } });
    items.push({ type: themeCan, pos: { x: 1.30, y: platformY + canH / 2, z: 0.22 } });
    items.push({ type: 'octagon_tower', pos: { x: 1.30, y: platformY + cubeS + canH / 2, z: -0.22 } });
    items.push({ type: 'can', pos: { x: 1.30, y: platformY + canH + canH / 2, z: 0.22 } });
    const rDeckY = platformY + canH * 2 + bH / 2;
    items.push({ type: 'beam', pos: { x: 1.30, y: rDeckY, z: 0 }, width: 1.25 });
    items.push({ type: 'blue_can', pos: { x: 1.30, y: rDeckY + bH / 2 + canH / 2, z: 0 } });
    items.push({ type: 'spire', pos: { x: 1.30, y: rDeckY + bH / 2 + canH + 0.30, z: 0 } });

    // Center Portcullis Gateway
    items.push({ type: 'wide_block', pos: { x: 0, y: platformY + cubeS / 2, z: 0 } });
    items.push({ type: bCan, pos: { x: 0, y: platformY + cubeS + canH / 2, z: 0 } });
    items.push({ type: 'royal_dome', pos: { x: 0, y: platformY + cubeS + canH + 0.30, z: 0 } });
  }

  // ── Vanguard 3: The Diamond Vanguard Redoubt ──
  else if (arch === 3) {
    // Front Vanguard (z = +0.45, x = 0)
    items.push({ type: bBlock, pos: { x: 0, y: platformY + cubeS / 2, z: 0.45 } });
    items.push({ type: bCan, pos: { x: 0, y: platformY + cubeS + canH / 2, z: 0.45 } });

    // Left Bastion Wing (x = -1.35, z = 0): Tall Corinthian Pillar + lintel
    items.push({ type: 'tall_pillar', pos: { x: -1.35, y: platformY + 1.08 / 2, z: 0 } });
    const lDeckY = platformY + 1.08 + bH / 2;
    items.push({ type: 'beam', pos: { x: -1.35, y: lDeckY, z: 0 }, width: 1.15 });
    items.push({ type: 'octagon_tower', pos: { x: -1.35, y: lDeckY + bH / 2 + canH / 2, z: 0 } });
    items.push({ type: 'spire', pos: { x: -1.35, y: lDeckY + bH / 2 + canH + 0.30, z: 0 } });

    // Right Bastion Wing (x = +1.35, z = 0)
    items.push({ type: 'tall_pillar', pos: { x: 1.35, y: platformY + 1.08 / 2, z: 0 } });
    const rDeckY = platformY + 1.08 + bH / 2;
    items.push({ type: 'beam', pos: { x: 1.35, y: rDeckY, z: 0 }, width: 1.15 });
    items.push({ type: 'octagon_tower', pos: { x: 1.35, y: rDeckY + bH / 2 + canH / 2, z: 0 } });
    items.push({ type: 'spire', pos: { x: 1.35, y: rDeckY + bH / 2 + canH + 0.30, z: 0 } });

    // Rear Citadel Keep (z = -0.45, x = 0)
    items.push({ type: 'fleur', pos: { x: 0, y: platformY + cubeS / 2, z: -0.45 } });
    items.push({ type: themeCan, pos: { x: 0, y: platformY + cubeS + canH / 2, z: -0.45 } });
    items.push({ type: 'royal_dome', pos: { x: 0, y: platformY + cubeS + canH + 0.30, z: -0.45 } });
  }

  // ── Vanguard 4: The Imperial Colonnade Rampart ──
  else if (arch === 4) {
    [-1.40, -0.70, 0, 0.70, 1.40].forEach((x, idx) => {
      if (idx % 2 === 0) {
        items.push({ type: bBlock, pos: { x, y: platformY + cubeS / 2, z: 0 } });
        items.push({ type: themeCan, pos: { x, y: platformY + cubeS + canH / 2, z: 0 } });
      } else {
        items.push({ type: 'octagon_tower', pos: { x, y: platformY + canH / 2, z: 0 } });
        items.push({ type: 'blue_can', pos: { x, y: platformY + canH + canH / 2, z: 0 } });
      }
    });

    const deckY = platformY + canH * 2 + bH / 2;
    items.push({ type: 'beam', pos: { x: -1.05, y: deckY, z: 0 }, width: 1.35 });
    items.push({ type: 'beam', pos: { x:  1.05, y: deckY, z: 0 }, width: 1.35 });

    items.push({ type: bCan,      pos: { x: -1.05, y: deckY + bH / 2 + canH / 2, z: 0 } });
    items.push({ type: 'spire',   pos: { x: -1.05, y: deckY + bH / 2 + canH + 0.30, z: 0 } });

    items.push({ type: bCan,      pos: { x:  1.05, y: deckY + bH / 2 + canH / 2, z: 0 } });
    items.push({ type: 'spire',   pos: { x:  1.05, y: deckY + bH / 2 + canH + 0.30, z: 0 } });

    items.push({ type: 'powder_keg', pos: { x: 0, y: platformY + canH * 2 + 0.36, z: 0 } });
  }

  // ── Vanguard 5: The Twin Sentry Moat Keeps ──
  else if (arch === 5) {
    [-1.35, 1.35].forEach((tx, idx) => {
      [-0.24, 0.24].forEach(ox => {
        items.push({ type: (idx === 0 ? themeCan : 'octagon_tower'), pos: { x: tx + ox, y: platformY + canH / 2, z: 0 } });
        items.push({ type: (idx === 0 ? 'can' : themeCan), pos: { x: tx + ox, y: platformY + canH + canH / 2, z: 0 } });
      });
      const tDeckY = platformY + canH * 2 + bH / 2;
      items.push({ type: 'beam', pos: { x: tx, y: tDeckY, z: 0 }, width: 1.25 });
      items.push({ type: themeCan, pos: { x: tx, y: tDeckY + bH / 2 + canH / 2, z: 0 } });
      items.push({ type: 'royal_dome', pos: { x: tx, y: tDeckY + bH / 2 + canH + 0.30, z: 0 } });
    });

    // Central Shield with rolling candy wheels
    items.push({ type: 'beam', pos: { x: 0, y: platformY + canH + bH / 2, z: 0 }, width: 1.40 });
    [-0.32, 0.32].forEach(x => {
      items.push({ type: 'hcan', pos: { x, y: platformY + canH + bH + 0.28, z: 0 } });
    });
  }

  // ── Vanguard 6: The Grand Shield Gatehouse ──
  else if (arch === 6) {
    [-1.30, 1.30].forEach((tx, idx) => {
      items.push({ type: 'wide_block', pos: { x: tx, y: platformY + cubeS / 2, z: 0 } });
      items.push({ type: themeCan, pos: { x: tx, y: platformY + cubeS + canH / 2, z: 0 } });
      items.push({ type: 'octagon_tower', pos: { x: tx, y: platformY + cubeS + canH * 1.5, z: 0 } });
      const bY = platformY + cubeS + canH * 2 + bH / 2;
      items.push({ type: 'beam', pos: { x: tx, y: bY, z: 0 }, width: 1.15 });
      items.push({ type: 'spire', pos: { x: tx, y: bY + bH / 2 + 0.30, z: 0 } });
    });

    // Center gate bridge with pinwheel shields
    const bridgeY = platformY + cubeS + canH + bH / 2;
    items.push({ type: 'beam', pos: { x: 0, y: bridgeY, z: 0 }, width: 1.50 });
    [-0.35, 0.35].forEach(x => {
      items.push({ type: 'pinwheel', pos: { x, y: bridgeY + bH / 2 + cubeS / 2, z: 0 } });
    });
    items.push({ type: bCan, pos: { x: 0, y: bridgeY + bH / 2 + cubeS + canH / 2, z: 0 } });
  }

  // ── Vanguard 7: The Stepped Vanguard Bastion ──
  else {
    const tCols = 5;
    const sp = 0.60;
    const stX = -((tCols - 1) * sp) / 2;
    for (let c = 0; c < tCols; c++) {
      const x = stX + c * sp;
      items.push({ type: (c % 2 === 0 ? 'fleur' : 'octagon_tower'), pos: { x, y: platformY + (c % 2 === 0 ? cubeS : canH) / 2, z: 0 } });
    }
    const b1Y = platformY + canH + bH / 2;
    items.push({ type: 'beam', pos: { x: 0, y: b1Y, z: 0 }, width: 3.20 });

    [-0.75, 0, 0.75].forEach((x, idx) => {
      items.push({ type: idx === 1 ? 'powder_keg' : themeCan, pos: { x, y: b1Y + bH / 2 + canH / 2, z: 0 } });
    });
    [-0.75, 0.75].forEach(x => {
      items.push({ type: 'royal_dome', pos: { x, y: b1Y + bH / 2 + canH + 0.30, z: 0 } });
    });
  }

  return items;
}

// ── Bulky Wave 2 Intermediate Baileys & Sentry Courtyards ─────────────────────
// Used for 3-wave Palace Gate stages (Levels 13, 26, 39, 52, 65, 78) and Epic Bosses
export function buildBulkyWave2(levelNum, platformY, themeCan) {
  const items = [];
  const canH = 0.72;
  const bH = 0.22;
  const cubeS = 0.56;
  const arch = levelNum % 4;
  const isRevenge = Boolean(customTargets.active || economy.bossModeContinuous);
  const bBlock = isRevenge ? 'boss_block' : 'wide_block';
  const bCan   = isRevenge ? 'boss_can'   : 'octagon_tower';

  // ── Intermediate 0: The Fortified Inner Baileys ──
  if (arch === 0) {
    [-1.50, -0.65, 0.65, 1.50].forEach((x, idx) => {
      items.push({ type: bBlock, pos: { x, y: platformY + cubeS / 2, z: 0 } });
      items.push({ type: themeCan, pos: { x, y: platformY + cubeS + canH / 2, z: 0 } });
    });
    const dY = platformY + cubeS + canH + bH / 2;
    items.push({ type: 'beam', pos: { x: -1.05, y: dY, z: 0 }, width: 1.60 });
    items.push({ type: 'beam', pos: { x:  1.05, y: dY, z: 0 }, width: 1.60 });

    [-1.30, -0.80].forEach(x => {
      items.push({ type: 'octagon_tower', pos: { x, y: dY + bH / 2 + canH / 2, z: 0 } });
    });
    items.push({ type: 'royal_dome', pos: { x: -1.05, y: dY + bH / 2 + canH + 0.30, z: 0 } });

    [0.80, 1.30].forEach(x => {
      items.push({ type: 'octagon_tower', pos: { x, y: dY + bH / 2 + canH / 2, z: 0 } });
    });
    items.push({ type: 'royal_dome', pos: { x: 1.05, y: dY + bH / 2 + canH + 0.30, z: 0 } });

    // Center sanctum barrier
    items.push({ type: 'pinwheel', pos: { x: 0, y: platformY + cubeS / 2, z: 0 } });
    items.push({ type: bCan, pos: { x: 0, y: platformY + cubeS + canH / 2, z: 0 } });
  }

  // ── Intermediate 1: The Sentry Fortress Courtyard ──
  else if (arch === 1) {
    [-1.40, 0, 1.40].forEach((bx, idx) => {
      items.push({ type: 'wide_block', pos: { x: bx, y: platformY + cubeS / 2, z: 0 } });
      items.push({ type: themeCan, pos: { x: bx, y: platformY + cubeS + canH / 2, z: 0 } });
      items.push({ type: (idx === 1 ? bCan : 'octagon_tower'), pos: { x: bx, y: platformY + cubeS + canH * 1.5, z: 0 } });
      const bY = platformY + cubeS + canH * 2 + bH / 2;
      items.push({ type: 'beam', pos: { x: bx, y: bY, z: 0 }, width: 1.25 });
      items.push({ type: 'spire', pos: { x: bx, y: bY + bH / 2 + 0.30, z: 0 } });
    });
    [-0.70, 0.70].forEach(x => {
      items.push({ type: 'hcan', pos: { x, y: platformY + 0.28, z: 0 } });
    });
  }

  // ── Intermediate 2: The Armored Portcullis Bastion ──
  else if (arch === 2) {
    [-1.30, 1.30].forEach(tx => {
      [-0.22, 0.22].forEach(oz => {
        items.push({ type: bBlock, pos: { x: tx, y: platformY + cubeS / 2, z: oz } });
        items.push({ type: themeCan, pos: { x: tx, y: platformY + cubeS + canH / 2, z: oz } });
      });
      const bY = platformY + cubeS + canH + bH / 2;
      items.push({ type: 'beam', pos: { x: tx, y: bY, z: 0 }, width: 1.30 });
      items.push({ type: bCan, pos: { x: tx, y: bY + bH / 2 + canH / 2, z: 0 } });
      items.push({ type: 'royal_dome', pos: { x: tx, y: bY + bH / 2 + canH + 0.30, z: 0 } });
    });
    const cBridgeY = platformY + cubeS + canH * 0.8 + bH / 2;
    items.push({ type: 'beam', pos: { x: 0, y: cBridgeY, z: 0 }, width: 1.60 });
    [-0.35, 0.35].forEach(x => {
      items.push({ type: 'hcan', pos: { x, y: cBridgeY + bH / 2 + 0.28, z: 0 } });
    });
  }

  // ── Intermediate 3: The Imperial Vanguard Colonnade ──
  else {
    const cols = [-1.50, -0.90, -0.30, 0.30, 0.90, 1.50];
    cols.forEach((x, idx) => {
      items.push({ type: (idx % 2 === 0 ? 'fleur' : themeCan), pos: { x, y: platformY + canH / 2, z: 0 } });
      items.push({ type: (idx % 2 === 0 ? 'octagon_tower' : 'can'), pos: { x, y: platformY + canH * 1.5, z: 0 } });
    });
    const dY = platformY + canH * 2 + bH / 2;
    items.push({ type: 'beam', pos: { x: 0, y: dY, z: 0 }, width: 3.60 });
    [-1.20, 0, 1.20].forEach(x => {
      items.push({ type: bCan, pos: { x, y: dY + bH / 2 + canH / 2, z: 0 } });
      items.push({ type: 'spire', pos: { x, y: dY + bH / 2 + canH + 0.30, z: 0 } });
    });
  }

  return items;
}

// Helper to pick stage-varied architectural blocks & cylindrical vessels so every stage looks unique
function getStageMaterialSet(stageIdx, themeCan) {
  const blockPool = [
    'marble_block', 'wide_block', 'terracotta_block', 'fleur',
    'iron_vault', 'bamboo_crate', 'obsidian_block', 'gold_ingot'
  ];
  const cylPool = [
    themeCan, 'octagon_tower', 'jade_urn', 'bronze_urn',
    'plasma_can', 'barrel', 'can', 'blue_can'
  ];
  const crownPool = [
    'royal_dome', 'crystal_spire', 'spire', 'royal_dome', 'crystal_spire', 'spire'
  ];
  const primaryBlock = blockPool[stageIdx % blockPool.length];
  const secondaryBlock = blockPool[(stageIdx + 3) % blockPool.length];
  const primaryCyl = cylPool[stageIdx % cylPool.length];
  const secondaryCyl = cylPool[(stageIdx + 2) % cylPool.length];
  const crownType = crownPool[stageIdx % crownPool.length];
  const altCrownType = crownPool[(stageIdx + 1) % crownPool.length];
  return { primaryBlock, secondaryBlock, primaryCyl, secondaryCyl, crownType, altCrownType };
}

// Generate 78 diverse fortifications across 8 structural archetypes
for (let i = 1; i <= 78; i++) {
  const theme = getWorldTheme(i);
  const isPalaceGate = (i % 13 === 0);
  const isBossLevel = (i % 5 === 0) || isPalaceGate;
  const title = LEVEL_TITLES[i - 1] || `Royal Level ${i}`;
  const themeCan = getThemeCan(theme);
  const matSet = getStageMaterialSet(i, themeCan);

  // Progressive Platform Rotation Speed
  let rotSpeed = 0;
  if (i >= 6 && i <= 13) {
    rotSpeed = (i % 2 === 0) ? 0.12 : 0;
  } else if (i >= 14 && i <= 26) {
    rotSpeed = (i % 3 === 0) ? -0.18 : 0.18;
  } else if (i >= 27 && i <= 39) {
    rotSpeed = (i % 2 === 0) ? 0.22 : -0.20;
  } else if (i >= 40 && i <= 52) {
    rotSpeed = (i % 2 === 0) ? -0.25 : 0.24;
  } else if (i >= 53 && i <= 65) {
    rotSpeed = (i % 2 === 0) ? 0.28 : -0.26;
  } else if (i >= 66 && i <= 78) {
    rotSpeed = (i % 2 === 0) ? 0.30 : -0.28;
  }

  // Archetype index (8 archetypes)
  const arch = i % 8;
  const isSquareArch = (arch === 3 || arch === 5) || (rotSpeed !== 0);
  const platShape = isSquareArch ? 'square' : 'rect';

  // 🏰 Multi-Wave Castle Progression:
  // - Palace Gate culmination levels (13, 26, 39, 52, 65, 78): 3 Monumental Waves!
  // - Levels 4+: 2 Waves standard (Vanguard Wall -> Inner Citadel Keep)
  // - Levels 1–3: 1 Wave onboarding
  let totalWaves = 2;
  if (isPalaceGate) {
    totalWaves = 3;
  } else if (i <= 3) {
    totalWaves = 1;
  }

  // 🎯 Strategic Shot Tuning & Scarcity:
  let shots = 5;
  if (isPalaceGate) {
    shots = 6;
  } else if (isBossLevel) {
    shots = 6;
  } else if (i <= 2) {
    shots = 5;
  } else {
    shots = 5;
  }

  // ⏱️ Pacing & Timer Calibration (Capped strictly at 90s max):
  let timeLimit = 55;
  if (isPalaceGate) {
    timeLimit = Math.min(90, 80 + Math.floor(i / 13) * 5);
  } else if (isBossLevel) {
    timeLimit = Math.min(90, 65);
  } else if (i <= 3) {
    timeLimit = 50;
  } else {
    timeLimit = 55;
  }
  timeLimit = Math.min(90, timeLimit);

  LEVELS.push({
    levelNumber: i,
    name: title,
    theme: theme,
    shots: shots,
    timeLimit: timeLimit,
    isBoss: isBossLevel,
    isPalaceGate: isPalaceGate,
    platShape: platShape,
    rotSpeed: rotSpeed,
    totalWaves: totalWaves,
    buildWave: function(waveNum, platformY) {
      if (this.totalWaves === 3) {
        if (waveNum === 1) return buildBulkyWave1(this.levelNumber, platformY, themeCan);
        if (waveNum === 2) return buildBulkyWave2(this.levelNumber, platformY, themeCan);
        return this.build(platformY);
      }
      if (this.totalWaves === 2 && waveNum === 1) {
        return buildBulkyWave1(this.levelNumber, platformY, themeCan);
      }
      return this.build(platformY);
    },
    build: (platformY) => {
      const items = [];
      const canH = 0.72;
      const tallH = 1.08;
      const bH = 0.22; // Gemstone beam height
      const cubeS = 0.56;
      const isRevengeMode = Boolean(customTargets.active || economy.bossModeContinuous);

      // ── Revenge / Stress Buster Mode Only ───────────────────────────────────
      if (isRevengeMode) {
        return buildBossModeStage(i, platformY, themeCan);
      }

      // ── Level 1: Royal Twin Bastion & Sovereign Citadel Arch (Pure Kingdom Architecture) ─
      if (i === 1) {
        // 1. Left Flank Bastion (Octagon Turret + Marble Columns)
        [-1.45, -0.95].forEach((x, idx) => {
          items.push({ type: (idx === 0 ? 'octagon_tower' : 'jade_urn'), pos: { x, y: platformY + canH / 2, z: 0 } });
          items.push({ type: (idx === 0 ? 'marble_block' : 'blue_can'), pos: { x, y: platformY + canH + (idx === 0 ? cubeS / 2 : canH / 2), z: 0 } });
        });
        const lBeamY = platformY + canH * 2 + bH / 2;
        items.push({ type: 'beam', pos: { x: -1.20, y: lBeamY, z: 0 }, width: 1.25 });
        [-1.40, -1.00].forEach(x => {
          items.push({ type: 'blue_can', pos: { x, y: lBeamY + bH / 2 + canH / 2, z: 0 } });
        });
        items.push({ type: 'royal_dome', pos: { x: -1.20, y: lBeamY + bH / 2 + canH + 0.30, z: 0 } });

        // 2. Right Flank Bastion
        [0.95, 1.45].forEach((x, idx) => {
          items.push({ type: (idx === 0 ? 'jade_urn' : 'octagon_tower'), pos: { x, y: platformY + canH / 2, z: 0 } });
          items.push({ type: (idx === 0 ? 'blue_can' : 'marble_block'), pos: { x, y: platformY + canH + (idx === 1 ? cubeS / 2 : canH / 2), z: 0 } });
        });
        const rBeamY = platformY + canH * 2 + bH / 2;
        items.push({ type: 'beam', pos: { x: 1.20, y: rBeamY, z: 0 }, width: 1.25 });
        [1.00, 1.40].forEach(x => {
          items.push({ type: 'blue_can', pos: { x, y: rBeamY + bH / 2 + canH / 2, z: 0 } });
        });
        items.push({ type: 'royal_dome', pos: { x: 1.20, y: rBeamY + bH / 2 + canH + 0.30, z: 0 } });

        // 3. Central Grand Keep with Powder Keg Core & Tall Fluted Pillars
        [-0.50, 0.50].forEach(x => {
          items.push({ type: 'tall_pillar', pos: { x, y: platformY + tallH / 2, z: 0 } });
          items.push({ type: 'octagon_tower', pos: { x, y: platformY + tallH + canH / 2, z: 0 } });
        });
        // Explosive Powder Keg in the central courtyard for satisfying chain reaction!
        items.push({ type: 'powder_keg', pos: { x: 0, y: platformY + canH / 2, z: 0 } });

        const cBeamY = platformY + tallH + canH + bH / 2;
        items.push({ type: 'beam', pos: { x: 0, y: cBeamY, z: 0 }, width: 1.65 });
        items.push({ type: 'wide_block', pos: { x: 0, y: cBeamY + bH / 2 + cubeS / 2, z: 0 } });
        [-0.52, 0.52].forEach(x => {
          items.push({ type: 'crystal_spire', pos: { x, y: cBeamY + bH / 2 + 0.34, z: 0 } });
        });
        items.push({ type: 'royal_dome', pos: { x: 0, y: cBeamY + bH / 2 + cubeS + 0.30, z: 0 } });

        return items;
      }

      // ── Level 2: The Alchemist's Sentry Barbican (Multi-Shape Colonnade + Rolling Targets) ─
      if (i === 2) {
        [-1.30, 1.30].forEach((tx, idx) => {
          items.push({ type: 'wide_block', pos: { x: tx, y: platformY + cubeS / 2, z: 0 } });
          items.push({ type: 'tall_pillar', pos: { x: tx - 0.24, y: platformY + cubeS + tallH / 2, z: 0 } });
          items.push({ type: 'tall_pillar', pos: { x: tx + 0.24, y: platformY + cubeS + tallH / 2, z: 0 } });
          const bY = platformY + cubeS + tallH + bH / 2;
          items.push({ type: 'beam', pos: { x: tx, y: bY, z: 0 }, width: 1.25 });
          items.push({ type: 'octagon_tower', pos: { x: tx, y: bY + bH / 2 + canH / 2, z: 0 } });
          items.push({ type: 'crystal_spire', pos: { x: tx, y: bY + bH / 2 + canH + 0.34, z: 0 } });
        });
        // Center rolling can & powder keg cradle
        items.push({ type: 'terracotta_block', pos: { x: -0.38, y: platformY + cubeS / 2, z: 0 } });
        items.push({ type: 'terracotta_block', pos: { x: 0.38, y: platformY + cubeS / 2, z: 0 } });
        const cBeamY = platformY + cubeS + bH / 2;
        items.push({ type: 'beam', pos: { x: 0, y: cBeamY, z: 0 }, width: 1.45 });
        items.push({ type: 'hcan', pos: { x: -0.35, y: cBeamY + bH / 2 + 0.28, z: 0 } });
        items.push({ type: 'hcan', pos: { x: 0.35, y: cBeamY + bH / 2 + 0.28, z: 0 } });
        items.push({ type: 'powder_keg', pos: { x: 0, y: cBeamY + bH / 2 + canH / 2, z: 0 } });
        items.push({ type: 'royal_dome', pos: { x: 0, y: cBeamY + bH / 2 + canH + 0.30, z: 0 } });
        return items;
      }

      // ── Level 3: The Triple Basilica Arch (Stepped Masonry & Byzantine Domes) ──
      if (i === 3) {
        [-1.40, 0, 1.40].forEach((bx, idx) => {
          const isCenter = (idx === 1);
          items.push({ type: isCenter ? 'wide_block' : 'iron_vault', pos: { x: bx, y: platformY + cubeS / 2, z: 0 } });
          if (isCenter) {
            items.push({ type: 'tall_pillar', pos: { x: bx - 0.26, y: platformY + cubeS + tallH / 2, z: 0 } });
            items.push({ type: 'tall_pillar', pos: { x: bx + 0.26, y: platformY + cubeS + tallH / 2, z: 0 } });
            const bY = platformY + cubeS + tallH + bH / 2;
            items.push({ type: 'beam', pos: { x: bx, y: bY, z: 0 }, width: 1.35 });
            items.push({ type: 'gold_ingot', pos: { x: bx, y: bY + bH / 2 + cubeS / 2, z: 0 } });
            items.push({ type: 'royal_dome', pos: { x: bx, y: bY + bH / 2 + cubeS + 0.30, z: 0 } });
          } else {
            items.push({ type: 'octagon_tower', pos: { x: bx, y: platformY + cubeS + canH / 2, z: 0 } });
            const bY = platformY + cubeS + canH + bH / 2;
            items.push({ type: 'beam', pos: { x: bx, y: bY, z: 0 }, width: 1.15 });
            items.push({ type: 'jade_urn', pos: { x: bx, y: bY + bH / 2 + canH / 2, z: 0 } });
            items.push({ type: 'crystal_spire', pos: { x: bx, y: bY + bH / 2 + canH + 0.34, z: 0 } });
          }
        });
        return items;
      }

      // ── Level 10 / Palace Gates: Reinforced 3-Section Monumental Citadel ────────
      if (i === 10 || isPalaceGate) {
        // Left Bastion Pier (Tall Fluted Pillars + Octagon Turret)
        [-1.48, -0.96].forEach((x, idx) => {
          items.push({ type: 'tall_pillar', pos: { x, y: platformY + tallH / 2, z: 0 } });
          items.push({ type: matSet.primaryCyl, pos: { x, y: platformY + tallH + canH / 2, z: 0 } });
        });
        const leftBeamY = platformY + tallH + canH + bH / 2;
        items.push({ type: 'beam', pos: { x: -1.22, y: leftBeamY, z: 0 }, width: 1.35 });
        items.push({ type: 'wide_block', pos: { x: -1.22, y: leftBeamY + bH / 2 + cubeS / 2, z: 0 } });
        items.push({ type: 'royal_dome', pos: { x: -1.22, y: leftBeamY + bH / 2 + cubeS + 0.30, z: 0 } });

        // Right Bastion Pier
        [0.96, 1.48].forEach((x, idx) => {
          items.push({ type: 'tall_pillar', pos: { x, y: platformY + tallH / 2, z: 0 } });
          items.push({ type: matSet.primaryCyl, pos: { x, y: platformY + tallH + canH / 2, z: 0 } });
        });
        const rightBeamY = platformY + tallH + canH + bH / 2;
        items.push({ type: 'beam', pos: { x: 1.22, y: rightBeamY, z: 0 }, width: 1.35 });
        items.push({ type: 'wide_block', pos: { x: 1.22, y: rightBeamY + bH / 2 + cubeS / 2, z: 0 } });
        items.push({ type: 'royal_dome', pos: { x: 1.22, y: rightBeamY + bH / 2 + cubeS + 0.30, z: 0 } });

        // Central Monumental Keep
        [-0.48, 0, 0.48].forEach((x, idx) => {
          items.push({ type: (idx === 1 ? 'powder_keg' : 'octagon_tower'), pos: { x, y: platformY + canH / 2, z: 0 } });
          items.push({ type: matSet.primaryBlock, pos: { x, y: platformY + canH + cubeS / 2, z: 0 } });
          items.push({ type: matSet.secondaryCyl, pos: { x, y: platformY + canH + cubeS + canH / 2, z: 0 } });
        });
        const centerDeckY = platformY + canH * 2 + cubeS + bH / 2;
        items.push({ type: 'beam', pos: { x: 0, y: centerDeckY, z: 0 }, width: 1.85 });

        [-0.42, 0.42].forEach(x => {
          items.push({ type: 'gold_ingot', pos: { x, y: centerDeckY + bH / 2 + cubeS / 2, z: 0 } });
          items.push({ type: 'octagon_tower', pos: { x, y: centerDeckY + bH / 2 + cubeS + canH / 2, z: 0 } });
        });
        const crownRoofY = centerDeckY + bH / 2 + cubeS + canH + bH / 2;
        items.push({ type: 'beam', pos: { x: 0, y: crownRoofY, z: 0 }, width: 1.55 });
        items.push({ type: 'royal_dome', pos: { x: 0, y: crownRoofY + bH / 2 + 0.30, z: 0 } });
        [-0.55, 0.55].forEach(x => {
          items.push({ type: 'crystal_spire', pos: { x, y: crownRoofY + bH / 2 + 0.34, z: 0 } });
        });

        return items;
      }

      // ── Milestone Bastion Stages (Every 5th level in Standard Kingdom Mode) ──
      if (isBossLevel) {
        const colsCount = (i <= 15) ? 6 : ((i <= 40) ? 7 : 8);
        const spacing = (colsCount >= 8) ? 0.50 : ((colsCount >= 7) ? 0.58 : 0.65);
        const startX = -((colsCount - 1) * spacing) / 2;
        const foundationTier = (i >= 25) ? 2 : 1;

        for (let c = 0; c < colsCount; c++) {
          const x = startX + c * spacing;
          for (let row = 0; row < foundationTier; row++) {
            const isCenterKeg = (row === 0 && c === Math.floor(colsCount / 2));
            const canType = isCenterKeg
              ? 'powder_keg'
              : ((c + row) % 2 === 0 ? matSet.primaryCyl : matSet.secondaryCyl);
            items.push({ type: canType, pos: { x, y: platformY + row * canH + canH / 2, z: 0 } });
          }
        }

        const deck1Y = platformY + foundationTier * canH + bH / 2;
        const deck1W = (colsCount * spacing) + 0.6;
        items.push({ type: 'beam', pos: { x: 0, y: deck1Y, z: 0 }, width: deck1W });

        // Sovereign Imperial Citadel Upper Structure
        const coreCols = (colsCount >= 8) ? 4 : 3;
        const coreSpacing = 0.68;
        const coreStartX = -((coreCols - 1) * coreSpacing) / 2;

        for (let c = 0; c < colsCount; c++) {
          const x = startX + c * spacing;
          const isFlank = (c === 0 || c === colsCount - 1);
          if (isFlank) {
            items.push({ type: 'tall_pillar', pos: { x, y: deck1Y + bH / 2 + tallH / 2, z: 0 } });
            items.push({ type: 'royal_dome', pos: { x, y: deck1Y + bH / 2 + tallH + 0.30, z: 0 } });
          } else if (Math.abs(x) <= Math.abs(coreStartX) + 0.12) {
            items.push({ type: matSet.primaryBlock, pos: { x, y: deck1Y + bH / 2 + cubeS / 2, z: 0 } });
            items.push({ type: 'octagon_tower', pos: { x, y: deck1Y + bH / 2 + cubeS + canH / 2, z: 0 } });
          }
        }

        const topDeckY = deck1Y + bH / 2 + cubeS + canH + bH / 2;
        items.push({ type: 'beam', pos: { x: 0, y: topDeckY, z: 0 }, width: coreCols * coreSpacing + 0.85 });

        for (let c = 0; c < coreCols; c++) {
          const x = coreStartX + c * coreSpacing;
          items.push({ type: (c === 1 ? 'gold_ingot' : matSet.secondaryBlock), pos: { x, y: topDeckY + bH / 2 + cubeS / 2, z: 0 } });
        }
        items.push({ type: 'royal_dome', pos: { x: 0, y: topDeckY + bH / 2 + cubeS + 0.30, z: 0 } });
        [-coreSpacing, coreSpacing].forEach(x => {
          items.push({ type: 'crystal_spire', pos: { x, y: topDeckY + bH / 2 + cubeS + 0.34, z: 0 } });
        });

        return items;
      }

      // ── Archetype 0: The Monumental Segmented Royal Fortress (Tall Pillars + Wide Bastions) ─
      if (arch === 0) {
        // 1. Left Bastion (x = -1.30)
        [-1.52, -1.04].forEach((x, idx) => {
          items.push({ type: (idx === 0 ? 'tall_pillar' : matSet.primaryCyl), pos: { x, y: platformY + (idx === 0 ? tallH / 2 : canH / 2), z: 0 } });
          if (idx !== 0) {
            items.push({ type: matSet.secondaryBlock, pos: { x, y: platformY + canH + cubeS / 2, z: 0 } });
          }
        });
        const lDeckY = platformY + Math.max(tallH, canH + cubeS) + bH / 2;
        items.push({ type: 'beam', pos: { x: -1.28, y: lDeckY, z: 0 }, width: 1.28 });
        items.push({ type: 'wide_block', pos: { x: -1.28, y: lDeckY + bH / 2 + cubeS / 2, z: 0 } });
        items.push({ type: matSet.crownType, pos: { x: -1.28, y: lDeckY + bH / 2 + cubeS + 0.30, z: 0 } });

        // 2. Right Bastion (x = +1.30)
        [1.04, 1.52].forEach((x, idx) => {
          items.push({ type: (idx === 1 ? 'tall_pillar' : matSet.primaryCyl), pos: { x, y: platformY + (idx === 1 ? tallH / 2 : canH / 2), z: 0 } });
          if (idx !== 1) {
            items.push({ type: matSet.secondaryBlock, pos: { x, y: platformY + canH + cubeS / 2, z: 0 } });
          }
        });
        const rDeckY = platformY + Math.max(tallH, canH + cubeS) + bH / 2;
        items.push({ type: 'beam', pos: { x: 1.28, y: rDeckY, z: 0 }, width: 1.28 });
        items.push({ type: 'wide_block', pos: { x: 1.28, y: rDeckY + bH / 2 + cubeS / 2, z: 0 } });
        items.push({ type: matSet.crownType, pos: { x: 1.28, y: rDeckY + bH / 2 + cubeS + 0.30, z: 0 } });

        // 3. Central Majestic Citadel (x = 0)
        [-0.46, 0.46].forEach((x) => {
          items.push({ type: 'octagon_tower', pos: { x, y: platformY + canH / 2, z: 0 } });
          items.push({ type: matSet.primaryBlock, pos: { x, y: platformY + canH + cubeS / 2, z: 0 } });
          items.push({ type: matSet.secondaryCyl, pos: { x, y: platformY + canH + cubeS + canH / 2, z: 0 } });
        });
        items.push({ type: 'powder_keg', pos: { x: 0, y: platformY + canH / 2, z: 0 } });

        const cDeckY = platformY + canH * 2 + cubeS + bH / 2;
        items.push({ type: 'beam', pos: { x: 0, y: cDeckY, z: 0 }, width: 1.65 });

        [-0.36, 0.36].forEach(x => {
          items.push({ type: 'gold_ingot', pos: { x, y: cDeckY + bH / 2 + cubeS / 2, z: 0 } });
        });
        const cDeck2Y = cDeckY + bH / 2 + cubeS + bH / 2;
        items.push({ type: 'beam', pos: { x: 0, y: cDeck2Y, z: 0 }, width: 1.35 });
        items.push({ type: 'royal_dome', pos: { x: 0, y: cDeck2Y + bH / 2 + 0.30, z: 0 } });

        return items;
      }

      // ── Archetype 1: The Triple Sentry Colonnade & Rolling Wheels ───────────
      if (arch === 1) {
        // 1. Left & Right Tall Sentry Columns
        [-1.35, 1.35].forEach(x => {
          items.push({ type: 'tall_pillar', pos: { x: x - 0.24, y: platformY + tallH / 2, z: 0 } });
          items.push({ type: 'tall_pillar', pos: { x: x + 0.24, y: platformY + tallH / 2, z: 0 } });
          const bY = platformY + tallH + bH / 2;
          items.push({ type: 'beam', pos: { x, y: bY, z: 0 }, width: 1.25 });
          items.push({ type: matSet.primaryBlock, pos: { x, y: bY + bH / 2 + cubeS / 2, z: 0 } });
          items.push({ type: matSet.crownType, pos: { x, y: bY + bH / 2 + cubeS + 0.30, z: 0 } });
        });

        // 2. Central Rolling Wheel & Octagon Colonnade
        [-0.46, 0.46].forEach(x => {
          items.push({ type: 'octagon_tower', pos: { x, y: platformY + canH / 2, z: 0 } });
          items.push({ type: matSet.secondaryCyl, pos: { x, y: platformY + canH + canH / 2, z: 0 } });
        });
        const cBeamY = platformY + canH * 2 + bH / 2;
        items.push({ type: 'beam', pos: { x: 0, y: cBeamY, z: 0 }, width: 1.65 });

        [-0.38, 0.38].forEach(x => {
          items.push({ type: 'hcan', pos: { x, y: cBeamY + bH / 2 + 0.28, z: 0 } });
        });
        const topRoofY = cBeamY + bH / 2 + 0.56 + bH / 2;
        items.push({ type: 'beam', pos: { x: 0, y: topRoofY, z: 0 }, width: 1.45 });
        items.push({ type: 'wide_block', pos: { x: 0, y: topRoofY + bH / 2 + cubeS / 2, z: 0 } });
        items.push({ type: 'crystal_spire', pos: { x: 0, y: topRoofY + bH / 2 + cubeS + 0.34, z: 0 } });

        return items;
      }

      // ── Archetype 2: The Triple-Bastion Citadel (Heavy Masonry + Powder Keg) ─
      if (arch === 2) {
        // 1. Left & Right Flank Bastions
        [-1.35, 1.35].forEach(bx => {
          items.push({ type: 'wide_block', pos: { x: bx, y: platformY + cubeS / 2, z: 0 } });
          [-0.25, 0.25].forEach(ox => {
            items.push({ type: matSet.primaryCyl, pos: { x: bx + ox, y: platformY + cubeS + canH / 2, z: 0 } });
          });
          const deckY = platformY + cubeS + canH + bH / 2;
          items.push({ type: 'beam', pos: { x: bx, y: deckY, z: 0 }, width: 1.25 });
          items.push({ type: 'octagon_tower', pos: { x: bx, y: deckY + bH / 2 + canH / 2, z: 0 } });
          items.push({ type: matSet.altCrownType, pos: { x: bx, y: deckY + bH / 2 + canH + 0.30, z: 0 } });
        });

        // 2. Central Throne Keep (x = 0)
        [-0.46, 0.46].forEach(x => {
          items.push({ type: matSet.primaryBlock, pos: { x, y: platformY + cubeS / 2, z: 0 } });
          items.push({ type: 'tall_pillar', pos: { x, y: platformY + cubeS + tallH / 2, z: 0 } });
        });
        items.push({ type: 'powder_keg', pos: { x: 0, y: platformY + canH / 2, z: 0 } });
        const cDeckY = platformY + cubeS + tallH + bH / 2;
        items.push({ type: 'beam', pos: { x: 0, y: cDeckY, z: 0 }, width: 1.65 });

        [-0.36, 0.36].forEach(x => {
          items.push({ type: matSet.secondaryBlock, pos: { x, y: cDeckY + bH / 2 + cubeS / 2, z: 0 } });
        });
        items.push({ type: 'royal_dome', pos: { x: 0, y: cDeckY + bH / 2 + cubeS + 0.30, z: 0 } });

        return items;
      }

      // ── Archetype 3: The 3D Depth Citadel (True Z-Depth Grid on Square Platform) ─
      if (arch === 3) {
        const zLayers = [-0.75, 0, 0.75];
        const xCols = [-1.1, 0, 1.1];

        // Base 3x3 Multi-Material Pillars
        zLayers.forEach(z => {
          xCols.forEach(x => {
            const isCorner = Math.abs(x) > 0.5 && Math.abs(z) > 0.5;
            const isCenter = (x === 0 && z === 0);
            if (isCenter) {
              items.push({ type: 'powder_keg', pos: { x, y: platformY + canH / 2, z } });
              items.push({ type: 'gold_ingot', pos: { x, y: platformY + canH + cubeS / 2, z } });
            } else {
              items.push({ type: (isCorner ? 'octagon_tower' : matSet.primaryCyl), pos: { x, y: platformY + canH / 2, z } });
              items.push({ type: (isCorner ? matSet.primaryBlock : matSet.secondaryCyl), pos: { x, y: platformY + canH + (isCorner ? cubeS / 2 : canH / 2), z } });
            }
          });
        });

        // 3D Interlocking Crossbeams along X and Z
        const deckY = platformY + canH * 2 + bH / 2;
        zLayers.forEach(z => {
          items.push({ type: 'beam', pos: { x: 0, y: deckY, z }, width: 3.2 });
        });

        // Upper Tier: Core pinwheel surrounded by corner domes & spires
        const upY0 = deckY + bH / 2;
        xCols.forEach(x => {
          zLayers.forEach(z => {
            if (x === 0 && z === 0) {
              items.push({ type: 'pinwheel', pos: { x, y: upY0 + cubeS / 2, z } });
              items.push({ type: 'royal_dome', pos: { x, y: upY0 + cubeS + 0.30, z } });
            } else if (Math.abs(x) > 0.5 && Math.abs(z) > 0.5) {
              items.push({ type: matSet.secondaryBlock, pos: { x, y: upY0 + cubeS / 2, z } });
              items.push({ type: 'crystal_spire', pos: { x, y: upY0 + cubeS + 0.34, z } });
            } else {
              items.push({ type: 'hcan', pos: { x, y: upY0 + 0.28, z } });
            }
          });
        });

        return items;
      }

      // ── Archetype 4: The Royal Pagoda & Archway (Rolling Target Matrix + Domes) ─
      if (arch === 4) {
        const span = 1.35;
        [-span, span].forEach(tx => {
          [-0.34, 0.34].forEach((ox) => {
            const x = tx + ox;
            items.push({ type: 'tall_pillar', pos: { x, y: platformY + tallH / 2, z: 0 } });
          });
          const bY = platformY + tallH + bH / 2;
          items.push({ type: 'beam', pos: { x: tx, y: bY, z: 0 }, width: 1.25 });
          items.push({ type: 'wide_block', pos: { x: tx, y: bY + bH / 2 + cubeS / 2, z: 0 } });
        });

        // Mid central bridge sitting above base bastions
        const archBeamY = platformY + tallH + bH + cubeS + bH / 2;
        items.push({ type: 'beam', pos: { x: 0, y: archBeamY, z: 0 }, width: 3.35 });

        // Rolling target matrix & central keg on bridge
        const wheelCols = [-1.05, -0.52, 0.52, 1.05];
        const wheelBaseY = archBeamY + bH / 2;
        wheelCols.forEach(x => {
          items.push({ type: 'hcan', pos: { x, y: wheelBaseY + 0.28, z: 0 } });
        });
        items.push({ type: 'powder_keg', pos: { x: 0, y: wheelBaseY + canH / 2, z: 0 } });

        // Stepped Pagoda Roof
        const roof1Y = wheelBaseY + canH + bH / 2;
        items.push({ type: 'beam', pos: { x: 0, y: roof1Y, z: 0 }, width: 2.5 });
        [-0.65, 0, 0.65].forEach((x, idx) => {
          items.push({ type: (idx === 1 ? 'royal_dome' : matSet.primaryBlock), pos: { x, y: roof1Y + bH / 2 + (idx === 1 ? 0.30 : cubeS / 2), z: 0 } });
        });

        return items;
      }

      // ── Archetype 5: The Rotating Carousel Rotunda (Circular Colonnade) ─────
      if (arch === 5) {
        const numPillars = 6;
        const r = 1.22;
        for (let p = 0; p < numPillars; p++) {
          const ang = (p / numPillars) * Math.PI * 2;
          const x = Math.cos(ang) * r;
          const z = Math.sin(ang) * r;
          items.push({ type: (p % 2 === 0 ? 'octagon_tower' : matSet.primaryCyl), pos: { x, y: platformY + canH / 2, z } });
          items.push({ type: (p % 2 === 0 ? matSet.primaryBlock : 'octagon_tower'), pos: { x, y: platformY + canH + (p % 2 === 0 ? cubeS / 2 : canH / 2), z } });
        }
        // Central explosive core + pinwheel
        items.push({ type: 'powder_keg', pos: { x: 0, y: platformY + canH / 2, z: 0 } });
        items.push({ type: 'pinwheel', pos: { x: 0, y: platformY + canH + cubeS / 2, z: 0 } });

        const midDeckY = platformY + canH * 2 + bH / 2;
        items.push({ type: 'beam', pos: { x: 0, y: midDeckY, z: 0 }, width: 3.05 });

        // Crown carousel spires & domes
        for (let p = 0; p < numPillars; p++) {
          const ang = (p / numPillars) * Math.PI * 2;
          const x = Math.cos(ang) * (r * 0.68);
          const z = Math.sin(ang) * (r * 0.68);
          items.push({ type: matSet.secondaryCyl, pos: { x, y: midDeckY + bH / 2 + canH / 2, z } });
          items.push({ type: (p % 2 === 0 ? 'royal_dome' : 'crystal_spire'), pos: { x, y: midDeckY + bH / 2 + canH + 0.32, z } });
        }

        return items;
      }

      // ── Archetype 6: The Twin Guard Citadels & Suspension Bridge ────────────
      if (arch === 6) {
        const towerSpacing = 1.38;
        [-towerSpacing, towerSpacing].forEach(tx => {
          items.push({ type: 'wide_block', pos: { x: tx, y: platformY + cubeS / 2, z: 0 } });
          [-0.28, 0.28].forEach(ox => {
            const x = tx + ox;
            items.push({ type: 'tall_pillar', pos: { x, y: platformY + cubeS + tallH / 2, z: 0 } });
          });
          const deckY = platformY + cubeS + tallH + bH / 2;
          items.push({ type: 'beam', pos: { x: tx, y: deckY, z: 0 }, width: 1.28 });
          items.push({ type: 'octagon_tower', pos: { x: tx, y: deckY + bH / 2 + canH / 2, z: 0 } });
          items.push({ type: 'royal_dome', pos: { x: tx, y: deckY + bH / 2 + canH + 0.30, z: 0 } });
        });

        // Connecting Central Bridge
        const bridgeY = platformY + cubeS + tallH * 0.55 + bH / 2;
        items.push({ type: 'beam', pos: { x: 0, y: bridgeY, z: 0 }, width: 1.45 });
        [-0.38, 0.38].forEach(x => {
          items.push({ type: 'hcan', pos: { x, y: bridgeY + bH / 2 + 0.28, z: 0 } });
        });
        items.push({ type: 'powder_keg', pos: { x: 0, y: bridgeY + bH / 2 + canH / 2, z: 0 } });

        return items;
      }

      // ── Archetype 7: The Royal Ziggurat (Ascending Multi-Material Stepped Terraces) ─
      if (arch === 7) {
        // Terrace 1 (Base - 6 columns with central Powder Keg)
        const t1Cols = 6;
        const sp1 = 0.58;
        const st1 = -((t1Cols - 1) * sp1) / 2;
        for (let c = 0; c < t1Cols; c++) {
          const x = st1 + c * sp1;
          const isMid = (c === 2 || c === 3);
          items.push({
            type: isMid ? 'octagon_tower' : (c % 2 === 0 ? matSet.primaryBlock : matSet.primaryCyl),
            pos: { x, y: platformY + (c % 2 === 0 && !isMid ? cubeS / 2 : canH / 2), z: 0 }
          });
        }
        const b1Y = platformY + canH + bH / 2;
        items.push({ type: 'beam', pos: { x: 0, y: b1Y, z: 0 }, width: t1Cols * sp1 + 0.45 });

        // Terrace 2 (4 columns + central powder keg)
        const t2Cols = 4;
        const sp2 = 0.68;
        const st2 = -((t2Cols - 1) * sp2) / 2;
        for (let c = 0; c < t2Cols; c++) {
          const x = st2 + c * sp2;
          items.push({ type: matSet.secondaryCyl, pos: { x, y: b1Y + bH / 2 + canH / 2, z: 0 } });
        }
        items.push({ type: 'powder_keg', pos: { x: 0, y: b1Y + bH / 2 + canH / 2, z: 0 } });

        const b2Y = b1Y + bH / 2 + canH + bH / 2;
        items.push({ type: 'beam', pos: { x: 0, y: b2Y, z: 0 }, width: t2Cols * sp2 + 0.45 });

        // Terrace 3 (Top Apex - Wide Block + Twin Crystal Spires + Royal Dome)
        items.push({ type: 'wide_block', pos: { x: 0, y: b2Y + bH / 2 + cubeS / 2, z: 0 } });
        items.push({ type: 'royal_dome', pos: { x: 0, y: b2Y + bH / 2 + cubeS + 0.30, z: 0 } });
        [-0.65, 0.65].forEach(x => {
          items.push({ type: 'crystal_spire', pos: { x, y: b2Y + bH / 2 + 0.34, z: 0 } });
        });

        return items;
      }

      return items;
    }
  });
}
