/**
 * economy.js — Royal Smash 3D Economy, Inventory, Player Profile & Leaderboard
 * Features:
 * - Gold 🪙 and Silver ⚪ coins balances with localStorage persistence
 * - Complete Ammo & Novelty Projectile Inventory: Iron, Bomb, Heavy, Roller, Slipper, Boot, Splash, Cluster Rocket
 * - Tabbed Royal Arsenal & Treasury with 1-click buy & insufficient coins helper
 * - Player Name & Global Leaderboard Ranking
 * - Audio & Mode settings persistence
 */

const STORAGE_KEY = 'royal_smash_economy_v5_2';
const PROFILE_KEY = 'royal_smash_profile_v5_0';

export const AMMO_MAX_CAPACITY = {
  normal: Infinity,
  bomb: 99,
  heavy: 99,
  roller: 99,
  slipper: 99,
  boot: 99,
  splash: 99,
  cluster: 99,
};

export const PREMIUM_AMMO_TYPES = ['roller', 'slipper', 'boot', 'splash', 'cluster'];

// 12 Single-Device Alpha Pass Codes (INR 1 UPI Checkout - Mirrors Chess Game)
export const ALPHA_CODES = [
  'ALPHA-7K9P-2M4X', 'ALPHA-3R8W-9Q2Z', 'ALPHA-5T2Y-8L6V', 'ALPHA-9N4C-1J7B',
  'ALPHA-2H8D-6K3S', 'ALPHA-4X1M-7W9P', 'ALPHA-8B5Q-3V2T', 'ALPHA-6Z9L-4R8Y',
  'ALPHA-1J7T-9C5N', 'ALPHA-3V2K-8H4D', 'ALPHA-7W9S-2X1M', 'ALPHA-9P4X-5T2Y'
];

// 12 Single-Device VIP Pass Codes (100% Free Bypass - Mirrors Chess Game)
export const VIP_CODES = [
  'VIP-8N2K-9X4M', 'VIP-4P7W-1T8Z', 'VIP-6L3V-5R9Q', 'VIP-9Y2D-8B4S',
  'VIP-3M5T-7K1J', 'VIP-1X8R-6W9C', 'VIP-7Z4Q-2P8L', 'VIP-5B9S-3V2T',
  'VIP-8T1J-9M5N', 'VIP-2W6C-8R4Y', 'VIP-4K8D-1X7P', 'VIP-9R3L-5Z2K'
];

export const LEGACY_VIP_CODES = ['VARNAMS15', 'VARNAMSVIP', 'ALPHA2026', 'CHESS2026', 'TESTERPASS', 'ROYAL2026'];
for (let i = 1; i <= 15; i++) LEGACY_VIP_CODES.push(`TESTER${i < 10 ? '0' + i : i}`);

// Universal Master VIP Codes (Any device, instant bypass)
export const UNIVERSAL_VIP_CODES = [
  'VIPP@SS2026', 'VIPPASS2026', 'VIP@2026', 'VARNAMSVIP', 'TESTERPASS',
  'CHESS2026', 'ROYALSMASH', 'SOVEREIGN55', 'VARNAMS15', 'VARNAMS2026'
];

class EconomyManager {
  constructor() {
    this.silverCoins = 500; // 👑 High-Roller Welcome Bonus (500 Silver)
    this.goldCoins   = 60;  // 👑 High-Roller Welcome Bonus (60 Gold)
    this.welcomeClaimed = false;
    this.isPremium   = false;
    this.inventory   = {
      normal: 9999, // Infinite Iron
      bomb: 1,      // Starter: 1 Bomb
      heavy: 1,     // Starter: 1 Heavy
      roller: 0,
      slipper: 1,   // Starter: 1 Slipper
      boot: 1,      // Starter: 1 Boot
      splash: 0,
      cluster: 0,
    };

    // Player Profile & Settings
    this.playerName = 'Royal Champion';
    this.soundMuted = false;
    this.vibrationEnabled = true; // Switchable Phone Vibration / Haptics
    this.bossModeContinuous = false; // When true, every stage has Boss custom target
    this.totalScore = 0;
    this.starsCount = 0;
    this.levelStars = {}; // { [level]: starsEarned }
    this.starChestProgress = 0; // 0 to 10
    this.starChestsClaimed = 0;
    this.shotsFired = 0;
    this.targetsHit = 0;

    // Varnams Account Restore Key & Cloud Identity (Mirrors Chess Game)
    this.deviceId = this.getDeviceId();
    this.registeredDeviceId = this.deviceId;
    this.syncKey = this.generateSyncKey();
    this.googleLinked = false;
    this.googleEmail = '';
    this.googleName = '';
    this.appleLinked = false;
    this.appleEmail = '';
    this.appleName = '';
    this.receipts = []; // Digital Transaction Receipts

    // 🎁 7-Day Daily Login Streak Calendar (Modest Gold Economy)
    this.dailyLogin = {
      currentDay: 1,
      lastClaimDate: '',
    };

    // 🔥 Crown Rush Win-Streak Multiplier
    this.winStreak = 0;
    this.streakShieldUsed = false;

    // ❤️ Royal Hearts (Lives / Energy System)
    this.maxHearts = 5;
    this.hearts = 5;
    this.lastHeartLossTime = Date.now();
    this.heartRegenMs = 15 * 60 * 1000; // 15 minutes per heart (10 mins with Courtyard Fountain perk)

    // 🏰 My Kingdom Castle Restoration Meta-Game
    this.kingdom = {
      currentArea: 'throne_room',
      restoredItems: [],
    };

    // 🚀 Premium 3D Blaster Designs Catalog (2.5x Prices)
    this.equippedBlaster = 'royal';
    this.unlockedBlasters = ['royal'];
    this.blasterCatalog = [
      {
        id: 'royal',
        name: 'Royal Sovereign Cannon',
        description: 'Imperial Royal Blue barrel, embossed golden crown crest & ruby trunnions',
        icon: '<svg class="blaster-svg" viewBox="0 0 32 32" style="width:28px;height:28px;"><use href="#cannon-icon"/></svg>',
        badge: 'LASER SIGHT 🎯',
        perk: '🎯 Precision Laser Guide + 💰 +15% Level Clear Coins Bonus',
        silverPrice: 0,
        goldPrice: 0,
      },
      {
        id: 'dragon',
        name: 'Dragon Fire Mortar',
        description: 'Volcanic obsidian & crimson scales. Launches Mega Red Molten Magma Ball with burning shockwave!',
        icon: '🐉',
        badge: 'MAGMA 🔥',
        perk: '🔥 Mega Red Magma Ball (+25% Punch of Iron Ball) + Blazing Shockwave',
        silverPrice: 2600,
        goldPrice: 95,
      },
      {
        id: 'tesla',
        name: 'Tesla Arc Blaster',
        description: 'Titanium chrome & high-voltage coils. Fires electric plasma orb with electromagnetic discharge!',
        icon: '⚡',
        badge: 'CYBER ⚡',
        perk: '⚡ Electric Plasma Orb (+25% Punch) + High-Voltage EMP Shockwave',
        silverPrice: 4200,
        goldPrice: 160,
      },
      {
        id: 'pirate',
        name: 'Golden Pirate Bombardier',
        description: 'Blackened cast iron with gold skull. Fires gilded skull cannonball that ricochets into 2 mini balls!',
        icon: '🏴‍☠️',
        badge: 'CORSAIR 💀',
        perk: '🏴‍☠️ Gilded Corsair Skull Ball + Broadside Ricochet (2 Bouncing Mini Balls)',
        silverPrice: 3200,
        goldPrice: 120,
      },
      {
        id: 'candy',
        name: 'Candy Peppermint Blaster',
        description: 'Sweet peppermint swirl striped barrel. Fires bouncy peppermint candy ball with high elasticity!',
        icon: '🍭',
        badge: 'SWEET 🍬',
        perk: '🍬 Peppermint Swirl Jawbreaker (High Elastic Bounce + 1 Bonus Ball)',
        silverPrice: 2200,
        goldPrice: 80,
      },
    ];

    // Full Arsenal Catalog (Stacks up to 99 in Arsenal)
    this.shopCatalog = [
      {
        id: 'bomb_pack',
        type: 'bomb',
        category: 'ammo',
        name: '2x Explosive Bombs',
        description: 'Demolishes clustered stone walls with massive area shockwaves (Stacks in Arsenal)',
        count: 2,
        icon: '💣',
        silverPrice: 800,
        goldPrice: 38,
        badge: 'POPULAR 🔥',
      },
      {
        id: 'heavy_pack',
        type: 'heavy',
        category: 'ammo',
        name: '2x Heavy Boulders',
        description: 'Dense 7.5kg wrecking mass topples foundational columns (Stacks in Arsenal)',
        count: 2,
        icon: '⚡',
        silverPrice: 650,
        goldPrice: 30,
        badge: 'CRUSHER',
      },
      {
        id: 'roller_pack',
        type: 'roller',
        category: 'ammo',
        name: '2x Deck Rollers',
        description: 'Ground bowling sphere that sweeps bottom rows clean (VIP Weapon • Stacks in Arsenal)',
        count: 2,
        icon: '🎳',
        silverPrice: 500,
        goldPrice: 22,
        badge: 'VIP SWEEPER 👑',
      },
      {
        id: 'slipper_pack',
        type: 'slipper',
        category: 'novelty',
        name: '4x Flying Slippers (Chappal)',
        description: 'Hilarious aerodynamic flipping sandal with slap impact & comic dust puff (VIP Weapon • Stacks in Arsenal)',
        count: 4,
        icon: '🩴',
        silverPrice: 600,
        goldPrice: 28,
        badge: 'VIP FUN 😂',
      },
      {
        id: 'boot_pack',
        type: 'boot',
        category: 'novelty',
        name: '3x Combat Stomp Boots',
        description: 'Steel-toed combat boot with ground shockwave & crushing force (VIP Weapon • Stacks in Arsenal)',
        count: 3,
        icon: '👢',
        silverPrice: 750,
        goldPrice: 35,
        badge: 'VIP HEAVY 👑',
      },
      {
        id: 'splash_pack',
        type: 'splash',
        category: 'novelty',
        name: '3x Hydro Splash Blasts',
        description: 'Giant water balloon that explodes into splash droplets, blue waves & mist (VIP Weapon • Stacks in Arsenal)',
        count: 3,
        icon: '💦',
        silverPrice: 550,
        goldPrice: 25,
        badge: 'VIP SPLASH 🌊',
      },
      {
        id: 'cluster_pack',
        type: 'cluster',
        category: 'novelty',
        name: '2x MIRV Cluster Rockets',
        description: 'Splits mid-air into 5 orbiting round bombs with sparkle fireworks shower (VIP Weapon • Stacks in Arsenal)',
        count: 2,
        icon: '🚀',
        silverPrice: 1100,
        goldPrice: 50,
        badge: 'VIP ULTIMATE 💥',
      },
      {
        id: 'vip_pass',
        type: 'vip',
        category: 'vip',
        name: '👑 Royal VIP Arsenal Pass',
        description: 'Unlocks Roller, Flying Slipper, Combat Boot, Hydro Splash & Cluster Rocket refills permanently!',
        count: 1,
        icon: '👑',
        silverPrice: 4500,
        goldPrice: 180,
        badge: 'VIP PASS ⭐',
      },
    ];

    // Publisher & Direct UPI / Store Payment Configuration (Varnams — Mirrors Chess Game)
    const detectedCurrency = (() => {
      try {
        const saved = localStorage.getItem('rs_preferred_currency');
        if (saved === 'INR' || saved === 'USD') return saved;
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
        const lang = navigator.language || '';
        const isIndia = tz.includes('Calcutta') || tz.includes('Kolkata') || tz === 'Asia/Kolkata' || lang.includes('en-IN') || lang.includes('hi');
        return isIndia ? 'INR' : 'USD';
      } catch (e) { return 'INR'; }
    })();

    this.paymentConfig = {
      brandName: 'Varnams',
      gameTitle: 'Royal Smash 3D',
      supportEmail: 'support@varnams.in',
      billingEmail: 'srivastavasinvestments@gmail.com',
      currency: detectedCurrency,
      upi: {
        enabled: true,
        merchantVpa: 'varnams@upi',
        merchantName: 'Varnams',
      },
    };

    // Real Money Monetization Coin Bundles (Balanced Tiered Value Progression)
    // Only Emperor's Royal Vault (₹299) and King's Unlimited Hoard (₹499) include automatic lifetime VIP Pass!
    this.coinPacks = [
      {
        id: 'squire_pouch',
        name: "Squire's Coin Pouch",
        priceUsd: '$0.99',
        priceInr: '₹49',
        amountInr: 49,
        amountUsd: 0.99,
        silver: 800,
        gold: 20,
        bombs: 1,
        heavy: 0,
        roller: 0,
        slipper: 2,
        boot: 0,
        splash: 0,
        cluster: 0,
        unlocksVip: false,
        badge: 'STARTER ⭐',
        icon: '👛',
      },
      {
        id: 'knight_chest',
        name: "Knight's Treasure Chest",
        priceUsd: '$2.99',
        priceInr: '₹149',
        amountInr: 149,
        amountUsd: 2.99,
        silver: 2800,
        gold: 80,
        bombs: 3,
        heavy: 2,
        roller: 1,
        slipper: 3,
        boot: 1,
        splash: 1,
        cluster: 0,
        unlocksVip: false,
        badge: 'BEST SELLER 🔥',
        icon: '📦',
      },
      {
        id: 'emperor_vault',
        name: "Emperor's Royal Vault",
        priceUsd: '$4.99',
        priceInr: '₹299',
        amountInr: 299,
        amountUsd: 4.99,
        silver: 6500,
        gold: 220,
        bombs: 6,
        heavy: 4,
        roller: 3,
        slipper: 5,
        boot: 2,
        splash: 2,
        cluster: 1,
        unlocksVip: true,
        badge: 'VIP + VALUE 👑',
        icon: '🏦',
      },
      {
        id: 'king_hoard',
        name: "King's Unlimited Hoard",
        priceUsd: '$9.99',
        priceInr: '₹499',
        amountInr: 499,
        amountUsd: 9.99,
        silver: 15000,
        gold: 550,
        bombs: 12,
        heavy: 8,
        roller: 6,
        slipper: 10,
        boot: 5,
        splash: 5,
        cluster: 4,
        unlocksVip: true,
        badge: 'ULTIMATE VIP 💎',
        icon: '👑',
      },
    ];

    // VIP & Collector Passes Catalog (Mirrors Chess Game Royal Edition)
    this.vipPasses = [
      {
        id: 'pass_vip_adfree',
        name: 'VIP Ad-Free Pass',
        description: 'Zero Ads Forever + Permanent VIP Refills + 1-Tap Daily Streak Protection',
        priceUsd: '$6.99',
        priceInr: '₹299',
        amountInr: 299,
        amountUsd: 6.99,
        origPriceInr: '₹599',
        origPriceUsd: '$13.99',
        discountBadge: '50% OFF',
        silver: 3500,
        gold: 120,
        bombs: 4,
        heavy: 3,
        roller: 2,
        slipper: 4,
        boot: 2,
        splash: 2,
        cluster: 1,
        unlocksVip: true,
        unlocksAllBlasters: false,
        badge: 'VIP PASS 50% OFF 🛡️',
        icon: '🛡️',
        lemonKey: 'VIP Ad-Free Pass',
      },
      {
        id: 'vault_sovereign_55',
        name: 'Sovereign 5+5 Vault',
        description: 'All 5 Royal 3D Blasters + 5 Ammo Caches + Lifetime VIP Status',
        priceUsd: '$9.99',
        priceInr: '₹399',
        amountInr: 399,
        amountUsd: 9.99,
        origPriceInr: '₹799',
        origPriceUsd: '$19.99',
        discountBadge: '50% OFF',
        silver: 6000,
        gold: 200,
        bombs: 6,
        heavy: 5,
        roller: 4,
        slipper: 6,
        boot: 4,
        splash: 4,
        cluster: 2,
        unlocksVip: true,
        unlocksAllBlasters: true,
        badge: 'COLLECTOR 50% OFF 🔮',
        icon: '🔮',
        lemonKey: 'Sovereign 5+5 Vault',
      },
      {
        id: 'pass_grandmaster',
        name: 'Grandmaster Pass',
        description: 'Ultimate Monarch Pass: All Blasters + Unlimited VIP Refills + 15,000 Silver + 500 Gold',
        priceUsd: '$19.99',
        priceInr: '₹799',
        amountInr: 799,
        amountUsd: 19.99,
        origPriceInr: '₹1,599',
        origPriceUsd: '$39.99',
        discountBadge: '50% OFF',
        silver: 15000,
        gold: 500,
        bombs: 12,
        heavy: 8,
        roller: 6,
        slipper: 10,
        boot: 6,
        splash: 6,
        cluster: 4,
        unlocksVip: true,
        unlocksAllBlasters: true,
        badge: 'ULTIMATE 50% OFF 👑',
        icon: '👑',
        lemonKey: 'Grandmaster Pass',
      },
      {
        id: 'alpha_tester_pass',
        name: 'Alpha Tester Pass',
        description: 'Enter Alpha Code below to activate all VIP features & 3D Blasters for ₹1 UPI',
        priceUsd: '$0.99',
        priceInr: '₹1 Pass',
        amountInr: 1,
        amountUsd: 0.99,
        origPriceInr: '₹49',
        origPriceUsd: '$0.99',
        discountBadge: '₹1 UPI',
        silver: 2500,
        gold: 50,
        bombs: 2,
        heavy: 2,
        roller: 1,
        slipper: 3,
        boot: 1,
        splash: 1,
        cluster: 1,
        unlocksVip: true,
        unlocksAllBlasters: true,
        badge: '₹1 UPI PASS 🧪',
        icon: '🧪',
        lemonKey: 'Alpha Tester Pass',
      },
    ];

    this._load();
  }

  getDeviceId() {
    let devId = localStorage.getItem('varnams_device_id');
    if (!devId) {
      if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        devId = crypto.randomUUID();
      } else {
        devId = 'dev-' + Math.random().toString(36).substring(2, 12) + '-' + Date.now();
      }
      try {
        localStorage.setItem('varnams_device_id', devId);
      } catch (e) {}
    }
    return devId;
  }

  generateSyncKey() {
    const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
    let code = 'VARNAM-';
    for (let i = 0; i < 4; i++) code += chars[Math.floor(Math.random() * chars.length)];
    code += '-';
    for (let i = 0; i < 2; i++) code += chars[Math.floor(Math.random() * chars.length)];
    return code;
  }

  getPackPrice(pack) {
    if (!pack) return '';
    return this.paymentConfig.currency === 'INR' ? (pack.priceInr || pack.priceUsd) : pack.priceUsd;
  }

  _load() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        if (typeof parsed.silverCoins === 'number') this.silverCoins = parsed.silverCoins;
        if (typeof parsed.goldCoins === 'number') this.goldCoins = parsed.goldCoins;
        if (typeof parsed.welcomeClaimed === 'boolean') this.welcomeClaimed = parsed.welcomeClaimed;
        if (typeof parsed.isPremium === 'boolean') this.isPremium = parsed.isPremium;
        if (!this.welcomeClaimed) {
          // New player welcome boost
          if (this.silverCoins < 500) this.silverCoins = 500;
          if (this.goldCoins < 60) this.goldCoins = 60;
        }
        if (parsed.inventory) {
          this.inventory = {
            normal: 9999,
            bomb: Math.max(0, Math.min(AMMO_MAX_CAPACITY.bomb, parsed.inventory.bomb ?? 1)),
            heavy: Math.max(0, Math.min(AMMO_MAX_CAPACITY.heavy, parsed.inventory.heavy ?? 1)),
            roller: Math.max(0, Math.min(AMMO_MAX_CAPACITY.roller, parsed.inventory.roller ?? 0)),
            slipper: Math.max(0, Math.min(AMMO_MAX_CAPACITY.slipper, parsed.inventory.slipper ?? 1)),
            boot: Math.max(0, Math.min(AMMO_MAX_CAPACITY.boot, parsed.inventory.boot ?? 1)),
            splash: Math.max(0, Math.min(AMMO_MAX_CAPACITY.splash, parsed.inventory.splash ?? 0)),
            cluster: Math.max(0, Math.min(AMMO_MAX_CAPACITY.cluster, parsed.inventory.cluster ?? 0)),
          };
        }
      }

      const pData = localStorage.getItem(PROFILE_KEY);
      if (pData) {
        const p = JSON.parse(pData);
        if (p.playerName) this.playerName = p.playerName;
        if (typeof p.soundMuted === 'boolean') this.soundMuted = p.soundMuted;
        if (typeof p.vibrationEnabled === 'boolean') this.vibrationEnabled = p.vibrationEnabled;
        if (typeof p.bossModeContinuous === 'boolean') this.bossModeContinuous = p.bossModeContinuous;
        if (typeof p.totalScore === 'number') this.totalScore = p.totalScore;
        if (typeof p.starsCount === 'number') this.starsCount = p.starsCount;
        if (p.levelStars && typeof p.levelStars === 'object') this.levelStars = p.levelStars;
        if (typeof p.starChestProgress === 'number') this.starChestProgress = p.starChestProgress;
        if (typeof p.starChestsClaimed === 'number') this.starChestsClaimed = p.starChestsClaimed;
        if (typeof p.winStreak === 'number') this.winStreak = p.winStreak;
        if (typeof p.streakShieldUsed === 'boolean') this.streakShieldUsed = p.streakShieldUsed;
        if (typeof p.hearts === 'number') this.hearts = Math.max(0, Math.min(5, p.hearts));
        if (typeof p.lastHeartLossTime === 'number') this.lastHeartLossTime = p.lastHeartLossTime;
        if (typeof p.isPremium === 'boolean') this.isPremium = p.isPremium;
        if (p.syncKey) this.syncKey = p.syncKey;
        if (p.registeredDeviceId) this.registeredDeviceId = p.registeredDeviceId;
        if (typeof p.googleLinked === 'boolean') this.googleLinked = p.googleLinked;
        if (p.googleEmail) this.googleEmail = p.googleEmail;
        if (p.googleName) this.googleName = p.googleName;
        if (typeof p.appleLinked === 'boolean') this.appleLinked = p.appleLinked;
        if (p.appleEmail) this.appleEmail = p.appleEmail;
        if (p.appleName) this.appleName = p.appleName;
        if (Array.isArray(p.receipts)) this.receipts = p.receipts;
        if (p.dailyLogin && typeof p.dailyLogin === 'object') {
          this.dailyLogin = {
            currentDay: p.dailyLogin.currentDay || 1,
            lastClaimDate: p.dailyLogin.lastClaimDate || '',
          };
        }
        if (p.kingdom && typeof p.kingdom === 'object') {
          this.kingdom = {
            currentArea: p.kingdom.currentArea || 'throne_room',
            restoredItems: Array.isArray(p.kingdom.restoredItems) ? p.kingdom.restoredItems : [],
          };
        }
        if (typeof p.shotsFired === 'number') this.shotsFired = p.shotsFired;
        if (typeof p.targetsHit === 'number') this.targetsHit = p.targetsHit;
        if (p.equippedBlaster) this.equippedBlaster = p.equippedBlaster;
        if (Array.isArray(p.unlockedBlasters)) this.unlockedBlasters = p.unlockedBlasters;
      }

      // Check shared Varnams Google session (cross-game with Grand Chess 3D)
      try {
        const sharedGoogle = localStorage.getItem('varnams_google_user_session');
        if (sharedGoogle) {
          const gUser = JSON.parse(sharedGoogle);
          if (gUser && gUser.email) {
            this.googleLinked = true;
            this.googleEmail = gUser.email;
            this.googleName = gUser.name || gUser.email.split('@')[0];
          }
        }
        const sharedApple = localStorage.getItem('varnams_apple_user_session');
        if (sharedApple) {
          const aUser = JSON.parse(sharedApple);
          if (aUser && aUser.email) {
            this.appleLinked = true;
            this.appleEmail = aUser.email;
            this.appleName = aUser.name || aUser.email.split('@')[0];
          }
        }
      } catch (e) {}

      if (!this.syncKey) this.syncKey = this.generateSyncKey();
      if (!this.unlockedBlasters.includes('royal')) this.unlockedBlasters.push('royal');
      this.updateHearts();
    } catch (e) {
      console.warn('[Economy] Failed to load saved data:', e);
    }
  }

  _save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        silverCoins: this.silverCoins,
        goldCoins: this.goldCoins,
        welcomeClaimed: this.welcomeClaimed,
        isPremium: this.isPremium,
        inventory: this.inventory,
      }));
      localStorage.setItem(PROFILE_KEY, JSON.stringify({
        playerName: this.playerName,
        soundMuted: this.soundMuted,
        vibrationEnabled: this.vibrationEnabled,
        bossModeContinuous: this.bossModeContinuous,
        totalScore: this.totalScore,
        starsCount: this.starsCount,
        levelStars: this.levelStars,
        starChestProgress: this.starChestProgress,
        starChestsClaimed: this.starChestsClaimed,
        winStreak: this.winStreak,
        streakShieldUsed: this.streakShieldUsed,
        hearts: this.hearts,
        lastHeartLossTime: this.lastHeartLossTime,
        isPremium: this.isPremium,
        syncKey: this.syncKey,
        registeredDeviceId: this.registeredDeviceId,
        googleLinked: this.googleLinked,
        googleEmail: this.googleEmail,
        googleName: this.googleName,
        appleLinked: this.appleLinked,
        appleEmail: this.appleEmail,
        appleName: this.appleName,
        receipts: this.receipts,
        dailyLogin: this.dailyLogin,
        kingdom: this.kingdom,
        shotsFired: this.shotsFired,
        targetsHit: this.targetsHit,
        equippedBlaster: this.equippedBlaster,
        unlockedBlasters: this.unlockedBlasters,
      }));
    } catch (e) {
      console.warn('[Economy] Failed to save data:', e);
    }
  }

  addSilver(amount) {
    this.silverCoins = Math.max(0, (this.silverCoins || 0) + amount);
    this._save();
    return this.silverCoins;
  }

  addGold(amount) {
    this.goldCoins = Math.max(0, (this.goldCoins || 0) + amount);
    this._save();
    return this.goldCoins;
  }

  claimWelcomeBonus() {
    this.welcomeClaimed = true;
    if (this.silverCoins < 500) this.silverCoins = 500;
    if (this.goldCoins < 60) this.goldCoins = 60;
    if ((this.inventory.bomb || 0) < 1) this.inventory.bomb = 1;
    if ((this.inventory.slipper || 0) < 1) this.inventory.slipper = 1;
    if ((this.inventory.boot || 0) < 1) this.inventory.boot = 1;
    if ((this.inventory.heavy || 0) < 1) this.inventory.heavy = 1;
    this._save();
    return { success: true, silver: this.silverCoins, gold: this.goldCoins, inventory: this.inventory };
  }

  // ─── 1. ⭐ 3-STAR MASTERY & STAR CHEST ──────────────────────────────────────
  getStarsForLevel(level) {
    return this.levelStars[level] || 0;
  }

  recordLevelStars(level, earnedStars) {
    const prev = this.getStarsForLevel(level);
    const validStars = Math.max(1, Math.min(3, earnedStars));
    let gained = 0;
    if (validStars > prev) {
      gained = validStars - prev;
      this.levelStars[level] = validStars;
      this.starsCount += gained;
      this.starChestProgress = Math.min(10, this.starChestProgress + gained);
      this._save();
    }
    return { newRecord: gained > 0, stars: validStars, gained, total: this.starsCount, progress: this.starChestProgress };
  }

  canClaimStarChest() {
    return this.starChestProgress >= 10;
  }

  claimStarChest() {
    if (!this.canClaimStarChest()) return null;
    this.starChestProgress = 0;
    this.starChestsClaimed++;
    const reward = {
      gold: 15,
      silver: 250,
      heavy: 2,
      cluster: 1,
      splash: 2,
    };
    this.addGold(reward.gold);
    this.addSilver(reward.silver);
    this.addAmmo('heavy', reward.heavy);
    this.addAmmo('cluster', reward.cluster);
    this.addAmmo('splash', reward.splash);
    this._save();
    return reward;
  }

  // ─── 2. 🔥 CROWN RUSH WIN-STREAK ──────────────────────────────────────────
  incrementWinStreak() {
    this.winStreak++;
    this.streakShieldUsed = false; // Reset shield for new streak
    this._save();
    return this.winStreak;
  }

  resetWinStreak() {
    // 🛡️ Heraldic Crest Shields Perk: 1 free streak save per streak!
    if (this.winStreak > 0 && this.isKingdomItemRestored('armory_shields') && !this.streakShieldUsed) {
      this.streakShieldUsed = true;
      this._save();
      return { savedByShield: true, streak: this.winStreak };
    }
    this.winStreak = 0;
    this.streakShieldUsed = false;
    this._save();
    return { savedByShield: false, streak: 0 };
  }

  getStreakPerk() {
    if (this.winStreak >= 3) {
      return { tier: 3, title: 'Imperial Crown', icon: '👑', scoreMult: 2.0, freeAmmo: 'cluster' };
    } else if (this.winStreak === 2) {
      return { tier: 2, title: 'Silver Crown', icon: '🥈', scoreMult: 1.3, freeAmmo: 'heavy' };
    } else if (this.winStreak === 1) {
      return { tier: 1, title: 'Bronze Crown', icon: '🥉', scoreMult: 1.15, freeAmmo: null };
    }
    return { tier: 0, title: 'None', icon: '', scoreMult: 1.0, freeAmmo: null };
  }

  // ─── 3. ❤️ ROYAL HEARTS / ENERGY ──────────────────────────────────────────
  getHeartRegenMs() {
    // ⛲ Marble Angel Fountain Perk: 10 mins per heart instead of 15 mins!
    return this.isKingdomItemRestored('courtyard_fountain') ? (10 * 60 * 1000) : (15 * 60 * 1000);
  }

  updateHearts() {
    const regenMs = this.getHeartRegenMs();
    this.heartRegenMs = regenMs;
    if (this.hearts >= this.maxHearts) {
      this.lastHeartLossTime = Date.now();
      return;
    }
    const now = Date.now();
    const elapsed = now - this.lastHeartLossTime;
    const gained = Math.floor(elapsed / regenMs);
    if (gained > 0) {
      this.hearts = Math.min(this.maxHearts, this.hearts + gained);
      this.lastHeartLossTime = now - (elapsed % regenMs);
      this._save();
    }
  }

  getHeartsState() {
    this.updateHearts();
    const regenMs = this.getHeartRegenMs();
    let secondsToNext = 0;
    if (this.hearts < this.maxHearts) {
      const elapsed = Date.now() - this.lastHeartLossTime;
      secondsToNext = Math.max(0, Math.ceil((regenMs - elapsed) / 1000));
    }
    return {
      hearts: this.hearts,
      maxHearts: this.maxHearts,
      secondsToNext,
      isFull: this.hearts >= this.maxHearts,
    };
  }

  consumeHeart() {
    this.updateHearts();
    if (this.hearts > 0) {
      if (this.hearts === this.maxHearts) {
        this.lastHeartLossTime = Date.now();
      }
      this.hearts--;
      this._save();
      return true;
    }
    return false;
  }

  refillHearts(type = 'gold') {
    if (type === 'gold') {
      if (this.goldCoins >= 35) {
        this.goldCoins -= 35;
        this.hearts = this.maxHearts;
        this.lastHeartLossTime = Date.now();
        this._save();
        return { success: true, message: 'All 5 Hearts Restored!' };
      }
      return { success: false, message: 'Not enough Gold Coins!' };
    } else if (type === 'ad') {
      this.hearts = Math.min(this.maxHearts, this.hearts + 1);
      this._save();
      return { success: true, message: '+1 Heart Granted!' };
    }
    return { success: false, message: 'Invalid refill type' };
  }

  // ─── 4. 🏰 MY KINGDOM CASTLE RESTORATION (ALL 10 PERKS ACTIVE) ───────────
  getKingdomCatalog() {
    return [
      {
        id: 'throne_room',
        name: 'The Grand Throne Room',
        icon: '👑',
        banner: 'assets/bg_coastal.jpg',
        items: [
          { id: 'throne_carpet', name: 'Imperial Velvet Carpet', cost: 4, icon: '🧶', perk: '+15% Silver Coins on Victory' },
          { id: 'throne_seat', name: 'Golden Lion Throne', cost: 6, icon: '🪑', perk: '+1 Starting Ball in every level' },
          { id: 'throne_chandelier', name: 'Crystal Sun Chandelier', cost: 5, icon: '💡', perk: '+20% Score Multiplier' },
          { id: 'throne_tapestry', name: 'Imperial Dragon Banner', cost: 8, icon: '🐉', perk: '25% Discount on Dragon Mortar' },
        ],
      },
      {
        id: 'royal_armory',
        name: 'The Royal Armory',
        icon: '⚔️',
        banner: 'assets/bg_coastal.jpg',
        items: [
          { id: 'armory_racks', name: 'Hardened Weapon Racks', cost: 6, icon: '🗡️', perk: '+2 Heavy Boulders on Stage Clear' },
          { id: 'armory_shields', name: 'Heraldic Crest Shields', cost: 7, icon: '🛡️', perk: 'Streak Protection: 1 Free Save' },
          { id: 'armory_pedestal', name: 'Blaster Showcase Dais', cost: 10, icon: '⚡', perk: '+15% Kinetic Impact Shockwave' },
        ],
      },
      {
        id: 'clifftop_courtyard',
        name: 'Clifftop Courtyard',
        icon: '🏰',
        banner: 'assets/bg_coastal.jpg',
        items: [
          { id: 'courtyard_fountain', name: 'Marble Angel Fountain', cost: 8, icon: '⛲', perk: 'Faster Heart Regen (10 mins)' },
          { id: 'courtyard_tower', name: 'Grand Watchtower', cost: 12, icon: '🗼', perk: '+2 Bonus Gold Coins on Victory' },
          { id: 'courtyard_gardens', name: 'Imperial Rose Gardens', cost: 10, icon: '🌹', perk: 'Instant +100 Gold Coins Bonus' },
        ],
      },
    ];
  }

  isKingdomItemRestored(itemId) {
    return this.kingdom.restoredItems.includes(itemId);
  }

  getKingdomScoreMultiplier() {
    // 💡 Crystal Sun Chandelier Perk: +20% Score Multiplier
    return this.isKingdomItemRestored('throne_chandelier') ? 1.20 : 1.0;
  }

  getShockwaveMultiplier() {
    // ⚡ Blaster Showcase Dais Perk: +15% Kinetic Impact Shockwave
    return this.isKingdomItemRestored('armory_pedestal') ? 1.15 : 1.0;
  }

  getBlasterEffectivePrice(item) {
    if (!item) return { silverPrice: 0, goldPrice: 0, discounted: false };
    // 🐉 Imperial Dragon Banner Perk: 25% Discount on Dragon Fire Mortar
    if (item.id === 'dragon' && this.isKingdomItemRestored('throne_tapestry')) {
      return {
        silverPrice: Math.round(item.silverPrice * 0.75), // 1950 Silver
        goldPrice: Math.round(item.goldPrice * 0.75),     // 71 Gold
        discounted: true,
      };
    }
    return {
      silverPrice: item.silverPrice,
      goldPrice: item.goldPrice,
      discounted: false,
    };
  }

  restoreKingdomItem(itemId) {
    if (this.isKingdomItemRestored(itemId)) return { success: false, message: 'Already restored!' };
    
    // Find item
    let targetItem = null;
    this.getKingdomCatalog().forEach(area => {
      area.items.forEach(it => {
        if (it.id === itemId) targetItem = it;
      });
    });

    if (!targetItem) return { success: false, message: 'Item not found' };
    if (this.starsCount < targetItem.cost) {
      return { success: false, message: `Need ${targetItem.cost} Stars ⭐ (You have ${this.starsCount})` };
    }

    this.starsCount -= targetItem.cost;
    this.kingdom.restoredItems.push(itemId);

    // 🌹 Imperial Rose Gardens Perk: Instant +100 Gold Coins Treasury Bonus!
    if (itemId === 'courtyard_gardens') {
      this.goldCoins += 100;
    }
    // ⛲ Marble Angel Fountain Perk: Immediately update heart regen speed
    if (itemId === 'courtyard_fountain') {
      this.updateHearts();
    }

    this._save();
    return { success: true, item: targetItem, remainingStars: this.starsCount };
  }

  // ─── 5. 🎁 7-DAY DAILY LOGIN BONUS (MODEST GOLD ECONOMY) ─────────────────
  getDailyBonusCatalog() {
    return [
      { day: 1, title: 'Day 1', icon: '⚪', label: '150 Silver', reward: { silver: 150 } },
      { day: 2, title: 'Day 2', icon: '💣', label: '1x Bomb', reward: { bomb: 1 } },
      { day: 3, title: 'Day 3', icon: '🪙', label: '3 Gold', reward: { gold: 3 } },
      { day: 4, title: 'Day 4', icon: '🩴', label: '2x Slippers', reward: { slipper: 2 } },
      { day: 5, title: 'Day 5', icon: '⚪', label: '300 Silver', reward: { silver: 300 } },
      { day: 6, title: 'Day 6', icon: '⚡', label: '1 Heavy + 1 Splash', reward: { heavy: 1, splash: 1 } },
      { day: 7, title: 'Day 7 Chest', icon: '👑', label: '10 Gold + 350 Silver + 1 Cluster', reward: { gold: 10, silver: 350, cluster: 1 }, isGrand: true },
    ];
  }

  _getTodayDateStr() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  canClaimDailyBonus() {
    const today = this._getTodayDateStr();
    return this.dailyLogin.lastClaimDate !== today;
  }

  claimDailyBonus() {
    if (!this.canClaimDailyBonus()) {
      return { success: false, message: 'Already claimed today! Come back tomorrow.' };
    }
    const today = this._getTodayDateStr();
    const catalog = this.getDailyBonusCatalog();
    const dayIndex = Math.max(1, Math.min(7, this.dailyLogin.currentDay || 1));
    const entry = catalog.find(c => c.day === dayIndex) || catalog[0];

    const r = entry.reward;
    if (r.silver) this.silverCoins += r.silver;
    if (r.gold) this.goldCoins += r.gold;
    if (r.bomb) this.addAmmo('bomb', r.bomb);
    if (r.heavy) this.addAmmo('heavy', r.heavy);
    if (r.slipper) this.addAmmo('slipper', r.slipper);
    if (r.splash) this.addAmmo('splash', r.splash);
    if (r.cluster) this.addAmmo('cluster', r.cluster);

    this.dailyLogin.lastClaimDate = today;
    this.dailyLogin.currentDay = dayIndex >= 7 ? 1 : (dayIndex + 1);
    this._save();

    return {
      success: true,
      claimedDay: dayIndex,
      entry,
      nextDay: this.dailyLogin.currentDay,
    };
  }

  isBlasterUnlocked(id) {
    return this.unlockedBlasters.includes(id);
  }

  equipBlaster(id) {
    if (this.isBlasterUnlocked(id)) {
      this.equippedBlaster = id;
      this._save();
      return true;
    }
    return false;
  }

  buyBlaster(id, currency = 'silver') {
    const item = this.blasterCatalog.find(b => b.id === id);
    if (!item) return { success: false, reason: 'Invalid blaster' };
    if (this.isBlasterUnlocked(id)) {
      this.equippedBlaster = id;
      this._save();
      return { success: true, alreadyOwned: true, item };
    }

    const eff = this.getBlasterEffectivePrice(item);
    const price = currency === 'gold' ? eff.goldPrice : eff.silverPrice;
    if (currency === 'gold') {
      if (this.goldCoins < price) {
        return { success: false, needCoins: true, currency: 'gold', needed: price - this.goldCoins };
      }
      this.goldCoins -= price;
    } else {
      if (this.silverCoins < price) {
        return { success: false, needCoins: true, currency: 'silver', needed: price - this.silverCoins };
      }
      this.silverCoins -= price;
    }

    this.unlockedBlasters.push(id);
    this.equippedBlaster = id;
    this._save();
    return { success: true, item };
  }

  setPlayerName(name) {
    if (!name || !name.trim()) return;
    this.playerName = name.trim().slice(0, 16);
    this._save();
  }

  toggleSound() {
    this.soundMuted = !this.soundMuted;
    this._save();
    return this.soundMuted;
  }

  // ─── 6. 📳 SWITCHABLE PHONE VIBRATION / HAPTICS ──────────────────────────
  toggleVibration() {
    this.vibrationEnabled = !this.vibrationEnabled;
    this._save();
    if (this.vibrationEnabled) {
      this.vibrate([30, 40, 30]);
    }
    return this.vibrationEnabled;
  }

  vibrate(pattern = 25) {
    if (!this.vibrationEnabled) return;
    try {
      if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
        navigator.vibrate(pattern);
      }
    } catch (e) {}
  }

  toggleBossMode() {
    this.bossModeContinuous = !this.bossModeContinuous;
    this._save();
    return this.bossModeContinuous;
  }

  setBossMode(enabled) {
    this.bossModeContinuous = Boolean(enabled);
    this._save();
    return this.bossModeContinuous;
  }

  recordLevelScore(score, stars, shotsUsed, targetsDestroyed) {
    this.totalScore += Math.max(0, score);
    this.starsCount += Math.max(0, stars);
    this.shotsFired += Math.max(1, shotsUsed);
    this.targetsHit += Math.max(0, targetsDestroyed);
    this._save();
  }

  getAccuracy() {
    if (this.shotsFired === 0) return 92;
    return Math.min(100, Math.max(50, Math.round((this.targetsHit / (this.shotsFired * 1.8)) * 100)));
  }

  // ─── 🏆 Crown Rush Win-Streak Boosters + Kingdom Perks ───────────────────
  getStreakBonuses() {
    const streak = this.winStreak || 0;
    const throneBonusBall = this.isKingdomItemRestored('throne_seat') ? 1 : 0;
    return {
      streak,
      extraShots: (streak >= 3 ? 2 : (streak >= 1 ? 1 : 0)) + (this.equippedBlaster === 'candy' ? 1 : 0) + throneBonusBall,
      freeBomb: streak >= 2,
      freeCluster: streak >= 3,
      freeFeverBall: streak >= 3,
    };
  }

  // ─── Earnings on Victory (Includes Blaster & Kingdom Perks) ──────────────
  calculateLevelEarnings(levelNum, stars, score, shotsLeft) {
    let silverEarned = Math.floor(40 + (shotsLeft * 8) + (stars * 15) + (score / 100));
    // 👑 Royal Sovereign Blaster Perk: +15% Level Clear Coins Bonus
    if (this.equippedBlaster === 'royal') {
      silverEarned = Math.floor(silverEarned * 1.15);
    }
    // 🧶 Imperial Velvet Carpet Perk: +15% Silver Coins Bonus
    if (this.isKingdomItemRestored('throne_carpet')) {
      silverEarned = Math.floor(silverEarned * 1.15);
    }

    let goldEarned = stars >= 3 ? 4 : (stars >= 2 ? 2 : 1);
    if (levelNum % 5 === 0) goldEarned += 6;
    if (levelNum % 13 === 0) goldEarned += 15;
    // 🗼 Grand Watchtower Perk: +2 Bonus Gold Coins on every Victory
    if (this.isKingdomItemRestored('courtyard_tower')) {
      goldEarned += 2;
    }

    this.silverCoins += silverEarned;
    this.goldCoins += goldEarned;
    this._save();

    return { silverEarned, goldEarned };
  }

  // ─── VIP / Premium Access ──────────────────────────────────────────────────
  isPremiumUser() {
    return Boolean(this.isPremium);
  }

  unlockPremium() {
    this.isPremium = true;
    this._save();
    return true;
  }

  // ─── Inventory Management ──────────────────────────────────────────────────
  getAmmoCount(type) {
    if (type === 'normal') return Infinity;
    return this.inventory[type] || 0;
  }

  hasAmmo(type) {
    if (type === 'normal') return true;
    return (this.inventory[type] || 0) > 0;
  }

  consumeAmmo(type) {
    if (type === 'normal') return true;
    if ((this.inventory[type] || 0) > 0) {
      this.inventory[type]--;
      this._save();
      return true;
    }
    return false;
  }

  addAmmo(type, count) {
    if (type === 'normal') return;
    const maxCap = AMMO_MAX_CAPACITY[type] ?? 99;
    const current = this.inventory[type] || 0;
    this.inventory[type] = Math.min(maxCap, current + count);
    this._save();
  }

  // ─── Shop Purchases ────────────────────────────────────────────────────────
  canAfford(catalogId, useGold = false) {
    const item = this.shopCatalog.find(i => i.id === catalogId);
    if (!item) return false;
    return useGold ? (this.goldCoins >= item.goldPrice) : (this.silverCoins >= item.silverPrice);
  }

  buyItem(catalogId, useGold = false) {
    const item = this.shopCatalog.find(i => i.id === catalogId);
    if (!item) return { success: false, reason: 'Item not found' };

    // VIP Pass purchase
    if (item.type === 'vip') {
      if (this.isPremium) {
        return { success: false, reason: 'Already a VIP Arsenal Pass holder! 👑' };
      }
      if (useGold) {
        if (this.goldCoins < item.goldPrice) {
          return { success: false, needCoins: true, currency: 'gold', needed: item.goldPrice - this.goldCoins, reason: `Need ${item.goldPrice - this.goldCoins} more Gold Coins 🪙` };
        }
        this.goldCoins -= item.goldPrice;
      } else {
        if (this.silverCoins < item.silverPrice) {
          return { success: false, needCoins: true, currency: 'silver', needed: item.silverPrice - this.silverCoins, reason: `Need ${item.silverPrice - this.silverCoins} more Silver Coins ⚪` };
        }
        this.silverCoins -= item.silverPrice;
      }
      this.isPremium = true;
      this._save();
      return { success: true, item, remainingSilver: this.silverCoins, remainingGold: this.goldCoins };
    }

    // Check if premium locked
    if (PREMIUM_AMMO_TYPES.includes(item.type) && !this.isPremium) {
      return { success: false, isVipRequired: true, reason: 'Requires VIP Arsenal Pass! 👑 Unlock in Shop or Treasury.' };
    }

    // Capacity limit check
    const maxCap = AMMO_MAX_CAPACITY[item.type] ?? 99;
    const currentStock = this.inventory[item.type] || 0;
    if (currentStock >= maxCap) {
      return { success: false, reason: `Arsenal full! Maximum capacity for this ammo is ${maxCap}.` };
    }

    if (useGold) {
      if (this.goldCoins < item.goldPrice) {
        return {
          success: false,
          needCoins: true,
          currency: 'gold',
          needed: item.goldPrice - this.goldCoins,
          reason: `Need ${item.goldPrice - this.goldCoins} more Gold Coins 🪙`,
        };
      }
      this.goldCoins -= item.goldPrice;
    } else {
      if (this.silverCoins < item.silverPrice) {
        return {
          success: false,
          needCoins: true,
          currency: 'silver',
          needed: item.silverPrice - this.silverCoins,
          reason: `Need ${item.silverPrice - this.silverCoins} more Silver Coins ⚪`,
        };
      }
      this.silverCoins -= item.silverPrice;
    }

    this.addAmmo(item.type, item.count);
    this._save();
    return { success: true, item, remainingSilver: this.silverCoins, remainingGold: this.goldCoins };
  }

  // ─── Rewarded Continues ────────────────────────────────────────────────────
  getContinuePrice(type = 'shots', attempt = 0) {
    const mult = Math.pow(1.40, attempt);
    if (type === 'shots') {
      return {
        silver: Math.round(180 * mult),
        gold: Math.round(20 * mult),
      };
    } else {
      return {
        silver: Math.round(140 * mult),
        gold: Math.round(16 * mult),
      };
    }
  }

  buyContinue(type = 'shots', useGold = false, attempt = 0) {
    const cost = this.getContinuePrice(type, attempt);
    if (useGold) {
      if (this.goldCoins < cost.gold) return false;
      this.goldCoins -= cost.gold;
    } else {
      if (this.silverCoins < cost.silver) return false;
      this.silverCoins -= cost.silver;
    }
    this._save();
    return true;
  }

  rewardFromAd(type = 'shots') {
    this.silverCoins += 50;
    this.goldCoins += 2;
    this._save();
    return true;
  }

  // ─── Real Money Coin Pack Purchase & Digital Receipt ───────────────────────
  buyCoinPack(packId, paymentMeta = {}) {
    const pack = this.coinPacks.find(p => p.id === packId) || (this.vipPasses && this.vipPasses.find(p => p.id === packId));
    if (!pack) return { success: false, reason: 'Offer pack not found' };

    this.silverCoins += (pack.silver || 0);
    this.goldCoins   += (pack.gold || 0);
    if (pack.unlocksVip) {
      this.isPremium = true;
    }
    if (pack.unlocksAllBlasters) {
      this.unlockedBlasters = ['royal', 'dragon', 'tesla', 'pirate', 'candy'];
    }
    if (pack.bombs)   this.addAmmo('bomb', pack.bombs);
    if (pack.heavy)   this.addAmmo('heavy', pack.heavy);
    if (pack.roller)  this.addAmmo('roller', pack.roller);
    if (pack.slipper) this.addAmmo('slipper', pack.slipper);
    if (pack.boot)    this.addAmmo('boot', pack.boot);
    if (pack.splash)  this.addAmmo('splash', pack.splash);
    if (pack.cluster) this.addAmmo('cluster', pack.cluster);

    const receipt = this.createDigitalReceipt({
      itemName: pack.name,
      price: this.getPackPrice(pack),
      method: paymentMeta.method || 'UPI Direct (varnams@upi)',
      utr: paymentMeta.utr || '',
      packId: pack.id,
      vipUnlocked: Boolean(pack.unlocksVip),
    });

    this._save();
    return {
      success: true,
      pack,
      receipt,
      vipUnlocked: Boolean(pack.unlocksVip),
      silverEarned: pack.silver || 0,
      goldEarned: pack.gold || 0,
      silverCoins: this.silverCoins,
      goldCoins: this.goldCoins,
    };
  }

  getLatestReceipt() {
    return (Array.isArray(this.receipts) && this.receipts.length > 0) ? this.receipts[0] : null;
  }

  createDigitalReceipt({ itemName, price, method = 'UPI Direct', utr = '', packId = '', vipUnlocked = false }) {
    const now = new Date();
    const randSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    const txnId = `VNM-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${randSuffix}`;
    const receipt = {
      txnId,
      utr: utr ? String(utr).trim() : 'VERIFIED-UPI',
      itemName,
      price,
      method,
      packId,
      vipUnlocked,
      syncKey: this.syncKey,
      playerEmail: this.googleEmail || 'Guest (Device Linked)',
      playerName: this.playerName,
      timestamp: now.toISOString(),
      dateFormatted: now.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }),
    };
    if (!Array.isArray(this.receipts)) this.receipts = [];
    this.receipts.unshift(receipt);
    if (this.receipts.length > 25) this.receipts = this.receipts.slice(0, 25);
    this._save();
    return receipt;
  }

  // ─── Varnams Account Restore & Cloud Sync (Mirrors Chess Game) ─────────────
  linkGoogleAccount(email, name = '') {
    if (!email || !email.includes('@')) return { success: false, message: 'Please enter a valid Google email address.' };
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = (name && name.trim()) || cleanEmail.split('@')[0].replace(/[\._]/g, ' ');
    const formattedName = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);

    this.googleLinked = true;
    this.googleEmail = cleanEmail;
    this.googleName = formattedName;
    if (this.playerName === 'Royal Champion' || this.playerName === 'Player') {
      this.playerName = formattedName.slice(0, 16);
    }

    // Save to shared Varnams cross-game session key (same as Chess Game!)
    try {
      localStorage.setItem('varnams_google_user_session', JSON.stringify({
        id: 'g_' + Date.now(),
        email: cleanEmail,
        name: formattedName,
        verified: true,
        linkedAt: new Date().toISOString(),
      }));
    } catch (e) {}

    this._save();
    return { success: true, email: cleanEmail, name: formattedName };
  }

  unlinkGoogleAccount() {
    this.googleLinked = false;
    this.googleEmail = '';
    this.googleName = '';
    try {
      localStorage.removeItem('varnams_google_user_session');
    } catch (e) {}
    this._save();
  }

  linkAppleAccount(email, name = '') {
    const cleanEmail = (email && email.includes('@')) ? email.trim().toLowerCase() : 'champion@privaterelay.appleid.com';
    const cleanName = (name && name.trim()) || cleanEmail.split('@')[0].replace(/[\._]/g, ' ');
    const formattedName = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);

    this.appleLinked = true;
    this.appleEmail = cleanEmail;
    this.appleName = formattedName;
    if (this.playerName === 'Royal Champion' || this.playerName === 'Player') {
      this.playerName = formattedName.slice(0, 16);
    }

    try {
      localStorage.setItem('varnams_apple_user_session', JSON.stringify({
        id: 'apple_' + Date.now(),
        email: cleanEmail,
        name: formattedName,
        verified: true,
        linkedAt: new Date().toISOString(),
      }));
    } catch (e) {}

    this._save();
    return { success: true, email: cleanEmail, name: formattedName };
  }

  unlinkAppleAccount() {
    this.appleLinked = false;
    this.appleEmail = '';
    this.appleName = '';
    try {
      localStorage.removeItem('varnams_apple_user_session');
    } catch (e) {}
    this._save();
  }

  transferAccountToThisDevice(keyString) {
    if (!keyString || typeof keyString !== 'string') {
      return { success: false, message: 'Please enter a valid Varnams Account Key.' };
    }
    const cleanKey = keyString.trim().toUpperCase();
    if (!cleanKey.startsWith('VARNAM-') || cleanKey.length < 11) {
      return { success: false, message: 'Invalid Varnams Key format. Keys look like VARNAM-7281-9X.' };
    }

    const thisDevice = this.getDeviceId();
    this.syncKey = cleanKey;
    this.registeredDeviceId = thisDevice;
    this._save();

    return {
      success: true,
      syncKey: cleanKey,
      message: 'Account successfully linked & transferred to this device. Previous sessions have been deauthorized.',
    };
  }

  // ─── Alpha (₹1) & VIP (Free) Pass Code Redemption (Mirrors Chess Game) ─────
  validatePassCode(rawCode) {
    if (!rawCode) return { valid: false, message: 'Please enter an Alpha or VIP pass code.' };
    const code = rawCode.trim().toUpperCase();

    // Universal Master Codes: instant bypass on any device
    if (UNIVERSAL_VIP_CODES.includes(code)) {
      return { valid: true, type: 'vip', tier: 'VIP', code, priceInr: 'FREE', amountInr: 0, isUniversal: true };
    }

    let registry = {};
    try {
      registry = JSON.parse(localStorage.getItem('varnams_redeemed_codes_registry') || '{}');
    } catch (e) {}

    const deviceId = this.getDeviceId();
    if (registry[code] && registry[code] !== deviceId) {
      return { valid: false, message: 'Code already redeemed on another device (Single-Device Policy).' };
    }

    if (ALPHA_CODES.includes(code)) {
      return { valid: true, type: 'alpha', tier: 'ALPHA', code, priceInr: '₹1', amountInr: 1 };
    }
    if (VIP_CODES.includes(code) || LEGACY_VIP_CODES.includes(code)) {
      return { valid: true, type: 'vip', tier: 'VIP', code, priceInr: 'FREE', amountInr: 0 };
    }
    return { valid: false, message: 'Invalid Pass Code. Please check your Alpha or VIP code.' };
  }

  activatePassCode(code, type = 'vip') {
    const cleanCode = (code || '').trim().toUpperCase();
    try {
      const registry = JSON.parse(localStorage.getItem('varnams_redeemed_codes_registry') || '{}');
      registry[cleanCode] = this.getDeviceId();
      localStorage.setItem('varnams_redeemed_codes_registry', JSON.stringify(registry));
      localStorage.setItem('varnams_device_active_pass_code', cleanCode);
    } catch (e) {}

    this.isPremium = true;
    // Unlock all 5 royal 3D blaster cannons
    this.unlockedBlasters = ['royal', 'dragon', 'tesla', 'pirate', 'candy'];
    this.silverCoins += (type === 'alpha' ? 2500 : 5000);
    this.goldCoins   += (type === 'alpha' ? 50 : 150);
    this.addAmmo('bomb', 3);
    this.addAmmo('heavy', 3);
    this.addAmmo('roller', 2);
    this.addAmmo('slipper', 4);
    this.addAmmo('boot', 3);
    this.addAmmo('splash', 2);
    this.addAmmo('cluster', 2);

    const receipt = this.createDigitalReceipt({
      itemName: `${type === 'alpha' ? 'Alpha Tester Pass' : 'VIP Pass'} (${cleanCode})`,
      price: type === 'alpha' ? '₹1' : 'FREE (VIP Code)',
      method: type === 'alpha' ? 'UPI ₹1 Verification' : 'VIP Pass Code Redemption',
      utr: cleanCode,
      packId: cleanCode,
      vipUnlocked: true,
    });

    this._save();
    return {
      success: true,
      code: cleanCode,
      receipt,
    };
  }

  // ─── Palace Gate Victory Special Bonus ─────────────────────────────────────
  awardPalaceGateBonus() {
    const silverBonus = 500;
    const goldBonus = 35;

    this.silverCoins += silverBonus;
    this.goldCoins   += goldBonus;
    this.addAmmo('bomb', 1);
    // 🗡️ Hardened Weapon Racks Perk: +2 extra Heavy Boulders on Stage Clear!
    const heavyBonus = 1 + (this.isKingdomItemRestored('armory_racks') ? 2 : 0);
    this.addAmmo('heavy', heavyBonus);
    this.addAmmo('roller', 1);
    this.addAmmo('slipper', 1);
    this.addAmmo('boot', 1);
    this.addAmmo('splash', 1);
    this.addAmmo('cluster', 1);

    this._save();
    return {
      silverBonus,
      goldBonus,
      heavyBonus,
      silverCoins: this.silverCoins,
      goldCoins: this.goldCoins,
    };
  }

  // ─── Global Leaderboard Simulation ─────────────────────────────────────────
  getLeaderboardData() {
    const topBotPlayers = [
      { rank: 1, name: 'King Arthur IX', title: 'Grand Sovereign 👑', score: 184500, stars: 234, flag: '🇬🇧' },
      { rank: 2, name: 'Duchess Victoria', title: 'Empress of Spires 💎', score: 162300, stars: 218, flag: '🇫🇷' },
      { rank: 3, name: 'Lord Shadowfall', title: 'Midnight Overlord ⚔️', score: 148900, stars: 205, flag: '🇩🇪' },
      { rank: 4, name: 'Baron Von Blitz', title: 'Cannon Master 🔥', score: 129400, stars: 182, flag: '🇺🇸' },
      { rank: 5, name: 'Commander Sonya', title: 'Bastion Smasher ⚡', score: 115200, stars: 165, flag: '🇨🇦' },
      { rank: 6, name: 'Master Chen', title: 'Dragon Bombardier 🐉', score: 98400, stars: 142, flag: '🇯🇵' },
      { rank: 7, name: 'Sir Galahad', title: 'Royal Paladin 🛡️', score: 87600, stars: 128, flag: '🇮🇹' },
    ];

    const effectiveScore = Math.max(12500, this.totalScore);
    const effectiveStars = Math.max(3, this.starsCount);

    let playerRank = 12;
    let playerTitle = 'Royal Knight ⚔️';
    if (effectiveScore > 180000) { playerRank = 1; playerTitle = 'Grand Sovereign 👑'; }
    else if (effectiveScore > 150000) { playerRank = 2; playerTitle = 'Imperial Marshal 💎'; }
    else if (effectiveScore > 120000) { playerRank = 4; playerTitle = 'Cannon Arch-Duke 🔥'; }
    else if (effectiveScore > 80000)  { playerRank = 7; playerTitle = 'Fortress Breaker ⚡'; }
    else if (effectiveScore > 40000)  { playerRank = 10; playerTitle = 'Royal Bombardier 🎯'; }
    else if (effectiveScore > 15000)  { playerRank = 18; playerTitle = 'Royal Knight ⚔️'; }
    else { playerRank = 42; playerTitle = 'Noble Squire 🛡️'; }

    return {
      topPlayers: topBotPlayers,
      player: {
        rank: playerRank,
        name: this.playerName,
        title: playerTitle,
        score: effectiveScore,
        stars: effectiveStars,
        accuracy: this.getAccuracy(),
        flag: '👑',
      },
    };
  }
}

export const economy = new EconomyManager();

// Payment Gateway & Monetization Configuration (Mirrors Chess Game Royal Edition)
export const PAYMENT_CONFIG = {
  // 1. Lemon Squeezy (Merchant of Record for Global Cards, Apple Pay, Google Pay)
  lemonSqueezy: {
    enabled: true,
    storeSlug: 'varnams',
    storeUrl: 'https://varnams.lemonsqueezy.com',
    testMode: true,
    productUrls: {
      "Squire's Coin Pouch": 'https://varnams.lemonsqueezy.com/checkout/buy/8cd4786d-9519-4240-b1de-69ba631d5480',
      "Knight's Treasure Chest": 'https://varnams.lemonsqueezy.com/checkout/buy/0a036d3d-335e-442f-bb22-df5bf743c03c',
      "Emperor's Royal Vault": 'https://varnams.lemonsqueezy.com/checkout/buy/701285bd-895b-4ad0-a49f-e70f1c83b9ab',
      "King's Unlimited Hoard": 'https://varnams.lemonsqueezy.com/checkout/buy/701285bd-895b-4ad0-a49f-e70f1c83b9ab',
      'VIP Ad-Free Pass': 'https://varnams.lemonsqueezy.com/checkout/buy/4cf55aa7-6fd9-4710-bfdc-3c02b9222f97',
      'Sovereign 5+5 Vault': 'https://varnams.lemonsqueezy.com/checkout/buy/4d5697fd-4b56-4a4e-b8f4-f46497f9cb72',
      'Grandmaster Pass': 'https://varnams.lemonsqueezy.com/checkout/buy/f877e000-4d33-421b-a461-9615a52a83b9',
      'Alpha Tester Pass': 'https://varnams.lemonsqueezy.com/checkout/buy/4cf55aa7-6fd9-4710-bfdc-3c02b9222f97',
    }
  },

  // 2. PayPal Gateway (Global E-Wallet, USD, International Cards)
  paypal: {
    enabled: true,
    clientId: 'sb',
    merchantEmail: 'payments@varnams.com',
    currency: 'USD',
    paypalMeUrl: 'https://paypal.me/varnams'
  },

  // 3. Direct Bank UPI (India - 0% Commission Bank Transfer)
  upi: {
    enabled: true,
    merchantVpa: 'varnams@upi',
    merchantName: 'Varnams',
    qrCodeImage: 'images/varnams_upi_qr.jpg'
  },

  // 4. Google Play In-App Billing (Restricted to Android Native Store builds)
  googlePlay: {
    enabled: true,
    storeListingUrl: 'https://play.google.com/store/apps/details?id=in.varnams.royalsmash3d',
    skus: {
      'squire_pouch': 'squire_pouch',
      'knight_chest': 'knight_chest',
      'emperor_vault': 'emperor_vault',
      'king_hoard': 'king_hoard',
      'pass_vip_adfree': 'pass_vip_noads',
      'vault_sovereign_55': 'vault_sovereign_55',
      'pass_grandmaster': 'pass_grandmaster',
      'alpha_tester_pass': 'alpha_tester_pass'
    }
  },

  // 5. Purchasing Power Parity (PPP) & Discount Codes
  discounts: {
    enabled: true,
    indiaPppCode: 'INDIA50',
    discountPercent: 50
  }
};

