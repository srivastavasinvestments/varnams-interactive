/**
 * main.js — Royal Smash 3D: Game state machine, event wiring, game loop (v6.0)
 * Features:
 * - 78 Escalating Levels across 6 Royal Worlds with Palace Gates
 * - Progressive Palace Journey visual zooming
 * - Grand Palace Victory celebration (flowers, fireworks, cheering crowds)
 * - Gold 🪙 & Silver ⚪ Coin economy & Royal Arsenal Shop with Tabbed Vault
 * - Complete Arsenal: Iron, Bomb, Heavy, Roller, Slipper, Boot, Splash, Cluster Rocket
 * - Instant Insufficient Coins Prompt with 1-Click Offer Checkout
 * - Fixed Blaster Freeze Bug: Unconditional physics unpause on modal close
 * - Mobile-First Firing: Prominent glowing Fire Button + Tap Directly on 3D Blaster
 * - Player Profile with Editable Name + Global Leaderboard Ranking & Scorecard
 * - One-Tap Audio Toggle (🔊 / 🔇)
 * - Boss Mode vs Standard Mode Toggle (Continuous Boss Smash)
 * - Rock-solid anti-collapse physics and zero-drift sleeping stacks
 */
import * as THREE from 'three';
import { Vec3 } from 'cannon-es';
import { RenderEngine }   from './engine.js';
import { PhysicsWorld }   from './physics.js';
import { RoyalCannon }    from './cannon_gun.js';
import { ParticleSystem } from './particles.js';
import { AudioManager }   from './audio.js';
import { LEVELS }         from './levels.js';
import { customTargets }  from './custom_target.js';
import { economy, AMMO_MAX_CAPACITY, PREMIUM_AMMO_TYPES, PAYMENT_CONFIG } from './economy.js';
import { liveBg }         from './livebg.js';
import {
  createRoyalCan, createFleurCan, createHorizontalCan, createGemBeam,
  createRoyalBlock, createSpire, createPedestal,
  createCannonball, createPhotoMosaicBlock, createPinkCan,
  createPinwheelBlock, createFleurBlock, createBossPutla,
  createMiniBossBlock, createMiniBossCan, disposeObj,
  STRUCTURE_THEMES, getStructureTheme, setStructureTheme, cycleStructureTheme, getEffectiveStructureTheme,
  setStageStructureNumber,
  createThemedBlock, createThemedCan, createThemedSpire, createThemedBeam,
  createTimberBlock, createOakBarrel, createTerracottaBlock, createBronzeUrn,
  createMarbleBlock, createCrystalSpire, createObsidianBlock, createPlasmaCan,
  createBambooCrate, createJadeUrn, createIronVaultBlock, createGoldIngotCan,
  createTallPillar, createWideBlock, createOctagonTower, createRoyalDome, createPowderKeg,
} from './structures.js';

// ─── Game state enum ──────────────────────────────────────────────────────────
const S = { LOADING:'loading', ONBOARD:'onboard', MENU:'menu', PLAYING:'playing', WIN:'win', LOSE:'lose' };

class RoyalSmash {
  constructor() {
    this.state           = S.LOADING;
    this.levelIdx        = 0;
    this.shotsLeft       = 18;
    this.score           = 0;
    this.gameObjs        = [];   // { mesh, body, fallen, isCan, initialPos }
    this.balls           = [];   // { mesh, body, age, ballType, hasSplit }
    this.pedestal        = null;
    this.platformY       = 3.66;
    this.platformAngle   = 0;
    this.ammoType        = 'normal'; // 'normal'|'bomb'|'heavy'|'roller'|'slipper'|'boot'|'splash'|'cluster'
    this.timeLeft        = 60;
    this._timerRunning   = false;
    this._wasTimerRunning= false;
    this._gameResolved   = false;
    this._inputCooldown  = 0;
    this._continueCount  = 0;

    // Input drag tracking
    this._lastX          = 0;
    this._lastY          = 0;
    this._isDragging     = false;

    // Modules
    this.engine          = null;
    this.physics         = null;
    this.cannon          = null;
    this.particles       = null;
    this.audio           = null;

    // DOM references
    this.$ = {
      hud:            document.getElementById('hud'),
      companySplash:  document.getElementById('company-splash-screen'),
      loading:        document.getElementById('loading-screen'),
      onboarding:     document.getElementById('onboarding-screen'),
      menu:           document.getElementById('menu-screen'),
      win:            document.getElementById('win-screen'),
      palaceVictory:  document.getElementById('palace-victory-screen'),
      lose:           document.getElementById('lose-screen'),
      vipModal:       document.getElementById('vip-modal'),
      shopModal:      document.getElementById('shop-modal'),
      needCoinsModal: document.getElementById('need-coins-modal'),
      profileModal:   document.getElementById('profile-modal'),
      leaderboardModal: document.getElementById('leaderboard-modal'),
      continueModal:  document.getElementById('continue-modal'),
      confirmModal:   document.getElementById('confirm-modal'),
      welcomeModal:   document.getElementById('welcome-modal'),
      settingsModal:  document.getElementById('settings-modal'),
      hudBossCam:     document.getElementById('hud-boss-cam'),
      bossCamImg:     document.getElementById('boss-cam-img'),
      bossCamAvatarWrap: document.getElementById('boss-cam-avatar-wrap'),
      bossCamStars:   document.getElementById('boss-cam-stars'),
      bossCamPill:    document.getElementById('boss-cam-pill'),
      bossCamName:    document.getElementById('boss-cam-name'),
      bossCamStatusTag: document.getElementById('boss-cam-status-tag'),
      bossCamQuote:   document.getElementById('boss-cam-quote'),
      adOverlay:      document.getElementById('ad-overlay'),
      shots:          document.getElementById('shot-count'),
      hudShotBadge:   document.getElementById('hud-shot-badge'),
      targets:        document.getElementById('target-count'),
      timerText:      document.getElementById('timer-text'),
      timerBadge:     document.getElementById('timer-badge'),
      level:          document.getElementById('level-number'),
      score:          document.getElementById('score-display'),
      silverCoins:    document.getElementById('silver-coins-display'),
      goldCoins:      document.getElementById('gold-coins-display'),
      menuSilver:     document.getElementById('menu-silver-coins'),
      menuGold:       document.getElementById('menu-gold-coins'),
      shopSilver:     document.getElementById('shop-silver-coins'),
      shopGold:       document.getElementById('shop-gold-coins'),
      shopGrid:       document.getElementById('shop-items-grid'),
      stockBomb:      document.getElementById('stock-bomb'),
      stockHeavy:     document.getElementById('stock-heavy'),
      stockRoller:    document.getElementById('stock-roller'),
      stockSlipper:   document.getElementById('stock-slipper'),
      stockBoot:      document.getElementById('stock-boot'),
      stockSplash:    document.getElementById('stock-splash'),
      stockCluster:   document.getElementById('stock-cluster'),
      hudPlayerName:  document.getElementById('hud-player-name'),
      bar:            document.getElementById('loading-bar'),
      combo:          document.getElementById('combo-banner'),
      comic:          document.getElementById('comic-popup'),
      winScore:       document.getElementById('win-score'),
      winStars:       document.getElementById('win-stars'),
      winShotsLeft:   document.getElementById('win-shots-left'),
      earnSilver:     document.getElementById('earn-silver'),
      earnGold:       document.getElementById('earn-gold'),
      loseScore:      document.getElementById('lose-score'),
      ctHud:          document.getElementById('custom-target-hud'),
      vipPreview:     document.getElementById('vip-preview-img'),
      targetInput:    document.getElementById('target-name-input'),
      goldOverlay:    document.getElementById('gold-celebration-overlay'),
      goldDramaticNum:document.getElementById('gold-dramatic-num'),
      silverDramaticNum:document.getElementById('silver-dramatic-num'),
      claimGoldBtn:   document.getElementById('btn-claim-gold'),
      flyingContainer:document.getElementById('flying-coins-container'),
      stageBanner:    document.getElementById('stage-banner'),
      stageNum:       document.getElementById('stage-banner-num'),
      stageName:      document.getElementById('stage-banner-name'),
      treasuryGrid:   document.getElementById('treasury-packs-grid'),
      checkoutModal:  document.getElementById('checkout-modal'),
      palaceCanvas:   document.getElementById('palace-celebration-canvas'),
      tabAmmo:            document.getElementById('tab-btn-ammo'),
      tabBlasters:        document.getElementById('tab-btn-blasters'),
      tabTreasury:        document.getElementById('tab-btn-treasury'),
      tabContentAmmo:     document.getElementById('tab-content-ammo'),
      tabContentBlasters: document.getElementById('tab-content-blasters'),
      tabContentTreasury: document.getElementById('tab-content-treasury'),
      blasterGrid:        document.getElementById('blaster-skins-grid'),
      hudHeartsBtn:       document.getElementById('hud-hearts-btn'),
      hudHeartsCount:     document.getElementById('hud-hearts-count'),
      hudHeartsTimer:     document.getElementById('hud-hearts-timer'),
      hudStreakBadge:     document.getElementById('hud-streak-badge'),
      hudStreakText:      document.getElementById('hud-streak-text'),
      hudStarChestBtn:    document.getElementById('hud-star-chest-btn'),
      hudStarChestTxt:    document.getElementById('hud-star-chest-txt'),
      hudKingdomBtn:      document.getElementById('hud-kingdom-btn'),
      menuKingdomBtn:     document.getElementById('menu-kingdom-btn'),
      winKingdomBtn:      document.getElementById('win-kingdom-btn'),
      hudWaveBadge:       document.getElementById('hud-wave-badge'),
      hudWaveText:        document.getElementById('hud-wave-text'),
      waveClearedBanner:  document.getElementById('wave-cleared-banner'),
      waveClearedTitle:   document.getElementById('wave-cleared-title'),
      waveClearedSub:     document.getElementById('wave-cleared-sub'),
      starChestModal:     document.getElementById('star-chest-modal'),
      starChestClaimBtn:  document.getElementById('star-chest-claim-btn'),
      heartsModal:        document.getElementById('hearts-modal'),
      heartsCloseBtn:     document.getElementById('hearts-close-btn'),
      heartsModalCount:   document.getElementById('hearts-modal-count'),
      heartsModalTimer:   document.getElementById('hearts-modal-timer'),
      heartsRefillGoldBtn:document.getElementById('hearts-refill-gold-btn'),
      heartsRefillAdBtn:  document.getElementById('hearts-refill-ad-btn'),
      kingdomModal:       document.getElementById('kingdom-modal'),
      kingdomCloseBtn:    document.getElementById('kingdom-close-btn'),
      kingdomStarsAvail:  document.getElementById('kingdom-stars-avail'),
      kingdomTabsRow:     document.getElementById('kingdom-tabs-row'),
      kingdomAreaTitle:   document.getElementById('kingdom-area-title'),
      kingdomAreaSub:     document.getElementById('kingdom-area-sub'),
      kingdomItemsGrid:   document.getElementById('kingdom-items-grid'),
      winStar1:           document.getElementById('win-star-1'),
      winStar2:           document.getElementById('win-star-2'),
      winStar3:           document.getElementById('win-star-3'),
      winStarTierTitle:   document.getElementById('win-star-tier-title'),
      winChestProgressTxt:document.getElementById('win-chest-progress-txt'),
      winChestBarFill:    document.getElementById('win-chest-bar-fill'),
    };

    this._hasFired = false;
    this._selectedCheckoutPack = null;
    this._palaceAnimId = null;
    this.currentWave = 1;
    this.totalWaves = 1;
    this._lastShotDepletedTimer = null;
    this._isFeverShot = false;
    this._currentShotKnocked = 0;
    this._slowMoTimer = 0;
    this._lastCannonAz = 0;
    this._lastFireTime = 0;

    this._init();
  }

  async _init() {
    // ── STEP 1: Varnams Company Logo Splash Screen ──────────────────────────
    this._showOnly('companySplash');
    await this._delay(900);

    // ── STEP 2: Game Loading Screen with Royal Smash 3D Emblem ──────────────
    this._showOnly('loading');
    this._progress(15, 'Starting Royal Engine…');
    try {
      this.engine = new RenderEngine(document.getElementById('game-canvas'));
      this.engine.init();
    } catch(e) { this._fatalError('Engine init failed', e); return; }

    this._progress(45, 'Loading Royal Physics…');
    try {
      this.physics = new PhysicsWorld();
      this.physics.init();
    } catch(e) { this._fatalError('Physics init failed', e); return; }

    this._progress(65, 'Tuning Royal Audio…');
    try {
      this.audio = new AudioManager();
      await this.audio.init();
      if (economy.soundMuted) this.audio.setMuted(true);
    } catch(e) { console.warn('[Audio] init failed:', e); }

    this._progress(80, 'Preparing Castle Sparks & Live Sky…');
    try {
      this.particles = new ParticleSystem(this.engine.scene);
      liveBg.setEnabled(true); // Always active by default
    } catch(e) { this._fatalError('Particles init failed', e); return; }

    this._progress(95, 'Preparing Royal Arsenal & Kingdom…');
    this._bindUI();
    this._initOnboardingAndSettingsUI();
    this._initVIPUI();
    this._initDailyBonusUI();
    this._initCheckoutAndRestoreUI();
    this._renderShopCatalog();
    this._renderTreasuryCatalog();
    this._updateWalletDisplays();
    this._updateProfileDisplays();
    this._updateSoundUI();
    this._updateVibrationUI();
    this._updateModeUI();
    this._progress(100, 'Kingdom Ready!');

    await this._delay(450);
    this._initWordReveal();   // ← Initialize secret message word reveal panel
    this._loop();

    // ── STEP 3: Champion Name, Google/Apple Sign-In & Mode Selection Screen ──
    this._goOnboarding();
  }


  _fatalError(label, err) {
    console.error(`[RoyalSmash] ${label}:`, err);
    const sub = document.querySelector('.loading-sub');
    if (sub) {
      sub.textContent = `⚠️ ${label}: ${err?.message ?? err}`;
      sub.style.color = '#ff6666';
    }
  }

  // ─── UI / Event Wiring ─────────────────────────────────────────────────────
  _bindUI() {
    try {
      document.getElementById('play-btn')?.addEventListener('click', () => {
        customTargets.active = Boolean(economy.bossModeContinuous);
        if (customTargets.active && !customTargets.userUploaded) {
          document.getElementById('vip-modal')?.classList.remove('hidden');
          return;
        }
        this._startLevel(0);
      });

      document.getElementById('next-btn')?.addEventListener('click', () => {
        this._startLevel((this.levelIdx + 1) % LEVELS.length);
      });

      document.getElementById('palace-next-btn')?.addEventListener('click', () => {
        this._startLevel((this.levelIdx + 1) % LEVELS.length);
      });

      document.getElementById('retry-btn')?.addEventListener('click', () => {
        this._startLevel(this.levelIdx);
      });

      // Share With Friend Triggers
      document.getElementById('win-share-btn')?.addEventListener('click', () => this._shareWithFriend('win'));
      document.getElementById('palace-share-btn')?.addEventListener('click', () => this._shareWithFriend('palace'));
      document.getElementById('secret-share-btn')?.addEventListener('click', () => this._shareWithFriend('secret'));

      // Shop & Treasury Triggers
      document.getElementById('open-shop-btn')?.addEventListener('click', () => this._openShop('ammo'));
      document.getElementById('menu-shop-btn')?.addEventListener('click', () => this._openShop('ammo'));
      const shopClose = document.getElementById('shop-close-btn');
      if (shopClose) {
        const handleShopClose = (e) => {
          e.preventDefault();
          e.stopPropagation();
          this._closeShop();
        };
        shopClose.addEventListener('click', handleShopClose);
        shopClose.addEventListener('touchend', handleShopClose, { passive: false });
      }
      this.$.shopModal?.addEventListener('click', (e) => {
        if (e.target === this.$.shopModal) this._closeShop();
      });
      document.getElementById('hud-treasury-btn')?.addEventListener('click', () => this._openShop('treasury'));
      document.getElementById('hud-silver-btn')?.addEventListener('click', () => this._openShop('treasury'));
      document.getElementById('hud-gold-btn')?.addEventListener('click', () => this._openShop('treasury'));
      document.getElementById('hud-wallet-badge')?.addEventListener('click', () => this._openShop('treasury'));
      document.getElementById('menu-silver-btn')?.addEventListener('click', () => this._openShop('treasury'));
      document.getElementById('menu-gold-btn')?.addEventListener('click', () => this._openShop('treasury'));
      document.getElementById('shop-treasury-plus-btn')?.addEventListener('click', () => this._switchShopTab('treasury'));

      // 🎯 Click on Shots badge in HUD -> Prompt to buy more shots with coins (available all the time)
      const shotBadge = document.getElementById('hud-shot-badge') || document.querySelector('.shot-badge');
      shotBadge?.addEventListener('click', () => {
        if (this.state === S.WIN) return; // Do not interrupt victory screen
        this.audio?.playCoinClink?.();
        this._wasTimerRunning = this._timerRunning;
        this._timerRunning = false;
        this.physics?.pause();

        const isMidGame = (this.state === S.PLAYING);
        this._showConfirmModal({
          icon: '👑',
          title: 'NEED MORE SHOTS?',
          msg: 'Do you want more shots to crush this fortress?',
          yesText: '👑 YES, GET +5 SHOTS',
          noText: isMidGame ? '◀ NO, KEEP PLAYING' : '◀ NO, STAY HERE',
          onYes: () => {
            const standing = this.gameObjs.filter(o => o.isCan && !o.fallen).length;
            this._openContinueModal('shots', standing, isMidGame);
          },
          onNo: () => {
            if (isMidGame) {
              this._timerRunning = this._wasTimerRunning;
              this.physics?.unpause();
            }
          }
        });
      });

      // ⏱️ Click on Time badge in HUD -> Prompt to add more time with coins (available all the time)
      document.getElementById('timer-badge')?.addEventListener('click', () => {
        if (this.state === S.WIN) return;
        this.audio?.playCoinClink?.();
        this._wasTimerRunning = this._timerRunning;
        this._timerRunning = false;
        this.physics?.pause();

        const isMidGame = (this.state === S.PLAYING);
        this._showConfirmModal({
          icon: '⏱️',
          title: 'NEED MORE TIME?',
          msg: 'Do you want more time to complete your royal siege?',
          yesText: '⏱️ YES, GET +25s TIME',
          noText: isMidGame ? '◀ NO, KEEP PLAYING' : '◀ NO, STAY HERE',
          onYes: () => {
            const standing = this.gameObjs.filter(o => o.isCan && !o.fallen).length;
            this._openContinueModal('time', standing, isMidGame);
          },
          onNo: () => {
            if (isMidGame) {
              this._timerRunning = this._wasTimerRunning;
              this.physics?.unpause();
            }
          }
        });
      });

      // Shop Tab Buttons
      this.$.tabAmmo?.addEventListener('click', () => this._switchShopTab('ammo'));
      this.$.tabBlasters?.addEventListener('click', () => this._switchShopTab('blasters'));
      this.$.tabTreasury?.addEventListener('click', () => this._switchShopTab('treasury'));

      // Insufficient Coins Modal Triggers
      document.getElementById('need-coins-cancel-btn')?.addEventListener('click', () => {
        this.$.needCoinsModal?.classList.add('hidden');
        const standing = this.gameObjs.filter(o => o.isCan && !o.fallen).length;
        this._openContinueModal(this._continueType || 'shots', standing, this._continueOrigin === 'midgame');
      });
      document.getElementById('need-coins-buy-btn')?.addEventListener('click', () => {
        this._storeOpenedFromContinue = true;
        this.$.needCoinsModal?.classList.add('hidden');
        this._openCheckout('squire_pouch');
      });
      document.getElementById('need-coins-upgrade-btn')?.addEventListener('click', () => {
        this._storeOpenedFromContinue = true;
        this.$.needCoinsModal?.classList.add('hidden');
        this._openCheckout('knight_chest');
      });
      document.getElementById('need-coins-view-all-btn')?.addEventListener('click', () => {
        this._storeOpenedFromContinue = true;
        this.$.needCoinsModal?.classList.add('hidden');
        this._openShop('treasury');
      });
      const setCurrency = (curr) => {
        economy.paymentConfig.currency = curr;
        try { localStorage.setItem('rs_preferred_currency', curr); } catch(_) {}
        document.querySelectorAll('.currency-tab').forEach(tab => {
          tab.classList.toggle('active', tab.getAttribute('data-currency') === curr);
        });
        this._renderTreasuryCatalog();
        this._updateNeedCoinsPrices();
        this.audio?.playCoinClink?.();
      };

      document.querySelectorAll('.currency-tab').forEach(tab => {
        tab.addEventListener('click', () => {
          const c = tab.getAttribute('data-currency');
          if (c) setCurrency(c);
        });
      });

      document.getElementById('currency-toggle-btn')?.addEventListener('click', () => {
        setCurrency(economy.paymentConfig.currency === 'INR' ? 'USD' : 'INR');
      });


      // Player Profile Name Modal Triggers
      document.getElementById('player-profile-badge')?.addEventListener('click', () => this._openProfileModal());
      document.getElementById('profile-close-btn')?.addEventListener('click', () => this._closeProfileModal());
      document.getElementById('player-name-save-btn')?.addEventListener('click', () => this._saveProfileName());

      // Global Leaderboard Triggers
      document.getElementById('leaderboard-btn')?.addEventListener('click', () => this._openLeaderboard());
      document.getElementById('menu-leaderboard-btn')?.addEventListener('click', () => this._openLeaderboard());
      document.getElementById('leaderboard-close-btn')?.addEventListener('click', () => this._closeLeaderboard());

      // Audio Sound & Haptic Vibration Toggle Triggers
      document.getElementById('sound-toggle-btn')?.addEventListener('click', () => this._toggleSound());
      document.getElementById('menu-sound-btn')?.addEventListener('click', () => this._toggleSound());
      document.getElementById('hud-vibe-btn')?.addEventListener('click', () => this._toggleVibration());
      document.getElementById('menu-vibe-btn')?.addEventListener('click', () => this._toggleVibration());

      // Live Background Toggle Triggers
      document.getElementById('hud-livebg-btn')?.addEventListener('click', () => this._toggleLiveBg());
      document.getElementById('menu-livebg-btn')?.addEventListener('click', () => this._toggleLiveBg());
      liveBg.onChange((on) => this._updateLiveBgUI(on));

      // Castle Architecture Structure Theme Triggers
      document.getElementById('hud-struct-btn')?.addEventListener('click', () => this._cycleStructureTheme());
      document.getElementById('menu-struct-btn')?.addEventListener('click', () => this._cycleStructureTheme());

      // Home Navigation
      document.getElementById('hud-home-btn')?.addEventListener('click', () => this._returnToHome());

      // Quick 3D Blaster Cannon Access
      document.getElementById('hud-blaster-btn')?.addEventListener('click', () => this._openShop('blasters'));
      document.getElementById('menu-blaster-btn')?.addEventListener('click', () => this._openShop('blasters'));

      // Mode Switch Triggers (Standard vs Stress Buster / Boss Mode)
      document.getElementById('mode-switch-btn')?.addEventListener('click', () => this._toggleBossMode());
      document.getElementById('hud-mode-toggle-btn')?.addEventListener('click', () => this._toggleBossMode());
      document.getElementById('hud-mode-btn')?.addEventListener('click', () => this._toggleBossMode());

      // Tutorial / Instructions Triggers
      document.getElementById('hud-help-btn')?.addEventListener('click', () => this._openTutorial(0));
      document.getElementById('menu-help-btn')?.addEventListener('click', () => this._openTutorial(0));
      document.getElementById('tutorial-close-btn')?.addEventListener('click', () => this._closeTutorial());
      document.getElementById('tut-start-btn')?.addEventListener('click', () => this._closeTutorial());
      document.getElementById('tut-prev-btn')?.addEventListener('click', () => this._prevTutorialStep());
      document.getElementById('tut-next-btn')?.addEventListener('click', () => this._nextTutorialStep());
      document.querySelectorAll('.tut-tab').forEach(tab => {
        tab.addEventListener('click', () => {
          const step = parseInt(tab.getAttribute('data-step') || '0', 10);
          this._openTutorial(step);
        });
      });

      // Checkout Modal Triggers
      const checkoutClose = document.getElementById('checkout-close-btn');
      if (checkoutClose) {
        const handleCheckoutClose = (e) => {
          e.preventDefault();
          e.stopPropagation();
          this._closeCheckout();
        };
        checkoutClose.addEventListener('click', handleCheckoutClose);
        checkoutClose.addEventListener('touchend', handleCheckoutClose, { passive: false });
      }
      this.$.checkoutModal?.addEventListener('click', (e) => {
        if (e.target === this.$.checkoutModal) this._closeCheckout();
      });
      document.getElementById('checkout-confirm-btn')?.addEventListener('click', () => this._confirmCheckout());

      // Rewarded Continues Buttons
      document.getElementById('continue-ad-btn')?.addEventListener('click', () => this._watchRewardedAd('continue'));
      document.getElementById('continue-coin-btn')?.addEventListener('click', () => this._buyContinueWithCoins(false));
      document.getElementById('continue-gold-btn')?.addEventListener('click', () => this._buyContinueWithCoins(true));
      document.getElementById('continue-store-btn')?.addEventListener('click', () => {
        this._pendingContinue = { type: this._continueType || 'shots' };
        this._storeOpenedFromContinue = true;
        this.$.continueModal?.classList.add('hidden');
        this._openShop('treasury');
      });
      document.getElementById('continue-retry-btn')?.addEventListener('click', () => {
        this.$.continueModal?.classList.add('hidden');
        if (this._continueOrigin === 'midgame') {
          this.state = S.PLAYING;
          this._timerRunning = this._wasTimerRunning;
          this.physics?.unpause();
        } else {
          this._lose(this.gameObjs.filter(o => o.isCan && !o.fallen).length);
        }
      });

      // Welcome Bounty Claim Button
      document.getElementById('welcome-claim-btn')?.addEventListener('click', () => {
        economy.claimWelcomeBonus();
        this.audio?.playPalaceFanfare?.();
        this.particles?.createGrandCelebration?.();
        this._triggerFlyingCoins(25);
        this._updateWalletDisplays();
        document.getElementById('welcome-modal')?.classList.add('hidden');
        this._showCombo('👑 +500 SILVER ⚪ & +60 GOLD 🪙 CLAIMED!');
      });

      // Ad Close / Skip buttons
      const closeAdHandler = (e) => {
        if (e) { e.preventDefault(); e.stopPropagation(); }
        if (this._adTimer) clearInterval(this._adTimer);
        this.$.adOverlay?.classList.add('hidden');
      };
      document.getElementById('ad-skip-btn')?.addEventListener('click', closeAdHandler);
      document.getElementById('ad-skip-btn')?.addEventListener('touchend', closeAdHandler);

      const claimRewardHandler = (e) => {
        if (e) { e.preventDefault(); e.stopPropagation(); }
        if (this._adTimer) clearInterval(this._adTimer);
        this.$.adOverlay?.classList.add('hidden');
        if (this._adRewardPurpose === 'heart') {
          economy.refillHearts('ad');
          this.audio?.playVictory();
          this._updateHeartsHUD();
          this._showComicReaction('+1 HEART! ❤️');
        } else {
          this._adContinueUsedThisLevel = true;
          const contType = this._continueType || 'shots';
          economy.rewardFromAd(contType);
          this._applyContinueReward(contType);
        }
      };
      document.getElementById('ad-close-btn')?.addEventListener('click', claimRewardHandler);
      document.getElementById('ad-close-btn')?.addEventListener('touchend', claimRewardHandler);

      // Dedicated Big Glowing Fire Button
      const fireBtn = document.getElementById('fire-btn');
      if (fireBtn) {
        let lastFireBtnTime = 0;
        const triggerFire = (e) => {
          e.preventDefault();
          e.stopPropagation();
          document.getElementById('aim-hint')?.classList.add('dismissed');
          const now = Date.now();
          if (now - lastFireBtnTime < 450) return;
          lastFireBtnTime = now;
          this._fire();
        };
        fireBtn.addEventListener('click', triggerFire);
        fireBtn.addEventListener('touchend', triggerFire, { passive: false });
      }

      // Ammo Type Selector Buttons (All 8 Projectiles)
      // Allow firing any ammo currently in inventory (including pack bonuses & free teasers),
      // while opening the shop if out of stock or locked behind VIP Pass.
      ['normal', 'bomb', 'heavy', 'roller', 'slipper', 'boot', 'splash', 'cluster'].forEach(type => {
        const btn = document.getElementById(`ammo-${type}`);
        if (btn) {
          btn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (type !== 'normal' && !economy.hasAmmo(type)) {
              if (PREMIUM_AMMO_TYPES.includes(type) && !economy.isPremiumUser()) {
                this._showComicReaction('🔒 VIP ARSENAL');
              }
              this._openShop('ammo');
              return;
            }
            this.ammoType = type;
            document.querySelectorAll('.ammo-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const speedMult = this._getSpeedMult(type);
            this.cannon?.setAmmoType(type, speedMult);
            this.audio?.playCombo();
            economy.vibrate(18);
          });
        }
      });

      // 🎯 Intuitive Blaster Controls: Smooth Drag Aiming + Direct Blaster Tap + Castle Direct Aim + FIRE Button
      const touchZone = document.getElementById('touch-zone') || this.engine.canvas;

      const isIgnoredUI = (target) => {
        if (!target || !target.closest) return false;
        return !!(target.closest('.ammo-btn') || target.closest('#fire-btn') || target.closest('.hud-top') || target.closest('.modal-content') || target.closest('.screen-card') || target.closest('.win-chest-modal'));
      };

      const handleTouchStart = (e) => {
        if (isIgnoredUI(e.target)) return;
        document.getElementById('aim-hint')?.classList.add('dismissed');
        this.audio?.resume();
        const t = e.touches[0];
        this._startX = t.clientX;
        this._startY = t.clientY;
        this._lastX  = t.clientX;
        this._lastY  = t.clientY;
        this._startTime = performance.now();
        this._isDragging = true;
        this._hasAimed = false;
      };

      const handleTouchMove = (e) => {
        if (!this._isDragging || this.state !== S.PLAYING) return;
        const t = e.touches[0];
        const dx = t.clientX - this._lastX;
        const dy = t.clientY - this._lastY;
        this._lastX = t.clientX;
        this._lastY = t.clientY;

        const totalDist = Math.hypot(t.clientX - this._startX, t.clientY - this._startY);
        // Drag threshold 14px: movement rotates/tilts cannon smoothly
        if (totalDist > 14) {
          this._hasAimed = true;
          this.cannon?.aim(dx * 0.0035, -dy * 0.0035);
          this._updateBossCamAiming();
          if (this.cannon && Math.abs(this.cannon.azimuth - (this._lastCannonAz || 0)) > 0.035) {
            this.audio?.playTick();
            this._lastCannonAz = this.cannon.azimuth;
          }
        }
      };

      const handleTouchEnd = (e) => {
        if (!this._isDragging) return;
        this._isDragging = false;
        if (this.state !== S.PLAYING) return;
        const dt = performance.now() - (this._startTime || 0);
        const t = e.changedTouches ? e.changedTouches[0] : null;
        if (!t) return;

        // 1. If player dragged to aim, DO NOT FIRE on release! Cannon stays locked on target.
        if (this._hasAimed) return;

        const totalDist = Math.hypot(t.clientX - this._startX, t.clientY - this._startY);

        // 2. Clean, stationary tap (< 12px move, < 280ms duration)
        if (totalDist < 12 && dt < 280) {
          // Direct tap strictly on 3D Cannon mesh
          if (this._isBlasterTarget(t.clientX, t.clientY)) {
            if (e.cancelable) e.preventDefault();
            this._fire();
            return;
          }

          // Direct tap on castle area (< 65% screen height): Aim at that block/tower position
          if (t.clientY <= window.innerHeight * 0.65) {
            this._aimAtScreenCoords(t.clientX, t.clientY);
            this.audio?.playTick();

            // Double tap within 380ms on same spot fires!
            const now = performance.now();
            if (this._lastTapTime && (now - this._lastTapTime < 380) &&
                Math.hypot(t.clientX - (this._lastTapX || 0), t.clientY - (this._lastTapY || 0)) < 30) {
              if (e.cancelable) e.preventDefault();
              this._fire();
              this._lastTapTime = 0;
            } else {
              this._lastTapTime = now;
              this._lastTapX = t.clientX;
              this._lastTapY = t.clientY;
            }
          }
        }
      };

      touchZone.addEventListener('touchstart', handleTouchStart, { passive: true });
      touchZone.addEventListener('touchmove', handleTouchMove, { passive: true });
      touchZone.addEventListener('touchend', handleTouchEnd);

      // Mouse drag & click controls for desktop
      const handleMouseDown = (e) => {
        if (isIgnoredUI(e.target)) return;
        document.getElementById('aim-hint')?.classList.add('dismissed');
        this.audio?.resume();
        this._startX = e.clientX;
        this._startY = e.clientY;
        this._lastX  = e.clientX;
        this._lastY  = e.clientY;
        this._startTime = performance.now();
        this._isDragging = true;
        this._hasAimed = false;
      };

      const handleMouseMove = (e) => {
        if (!this._isDragging || this.state !== S.PLAYING) return;
        const dx = e.clientX - this._lastX;
        const dy = e.clientY - this._lastY;
        this._lastX = e.clientX;
        this._lastY = e.clientY;

        const totalDist = Math.hypot(e.clientX - this._startX, e.clientY - this._startY);
        if (totalDist > 14) {
          this._hasAimed = true;
          this.cannon?.aim(dx * 0.0035, -dy * 0.0035);
          this._updateBossCamAiming();
          if (this.cannon && Math.abs(this.cannon.azimuth - (this._lastCannonAz || 0)) > 0.035) {
            this.audio?.playTick();
            this._lastCannonAz = this.cannon.azimuth;
          }
        }
      };

      const handleMouseUp = (e) => {
        if (!this._isDragging) return;
        this._isDragging = false;
        if (this.state !== S.PLAYING) return;
        const dt = performance.now() - (this._startTime || 0);
        const totalDist = Math.hypot(e.clientX - (this._startX || 0), e.clientY - (this._startY || 0));

        // 1. If player dragged to aim, DO NOT FIRE on release!
        if (this._hasAimed) return;

        // 2. Direct Click strictly on 3D Cannon mesh
        if (totalDist < 12 && dt < 280) {
          if (this._isBlasterTarget(e.clientX, e.clientY)) {
            this._fire();
            return;
          }

          // Direct click on castle area: Aim at that block/tower position
          if (e.clientY <= window.innerHeight * 0.65) {
            this._aimAtScreenCoords(e.clientX, e.clientY);
            this.audio?.playTick();

            const now = performance.now();
            if (this._lastTapTime && (now - this._lastTapTime < 380) &&
                Math.hypot(e.clientX - (this._lastTapX || 0), e.clientY - (this._lastTapY || 0)) < 30) {
              this._fire();
              this._lastTapTime = 0;
            } else {
              this._lastTapTime = now;
              this._lastTapX = e.clientX;
              this._lastY = e.clientY;
            }
          }
        }
      };

      touchZone.addEventListener('mousedown', handleMouseDown);
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);

      // Keyboard controls
      window.addEventListener('keydown', (e) => {
        if (this.state !== S.PLAYING) return;
        if (e.code === 'ArrowLeft')  { e.preventDefault(); this.cannon?.aim(-0.035, 0); }
        if (e.code === 'ArrowRight') { e.preventDefault(); this.cannon?.aim(0.035, 0); }
        if (e.code === 'ArrowUp')    { e.preventDefault(); this.cannon?.aim(0, 0.025); }
        if (e.code === 'ArrowDown')  { e.preventDefault(); this.cannon?.aim(0, -0.025); }
        if (e.code === 'Space')      { e.preventDefault(); this._fire(); }
      });

      window.addEventListener('resize', () => {
        this.cannon?.updateLayout(window.innerWidth / window.innerHeight);
      });

      this._initHeartsUI();
      this._initStarChestUI();
      this._initKingdomUI();
    } catch(e) {
      console.warn('[UI] bind error:', e);
    }
  }

  _aimAtScreenCoords(clientX, clientY) {
    if (!this.engine?.camera || !this.cannon) return;
    const rect = this.engine.canvas.getBoundingClientRect();
    const mouse = new THREE.Vector2(
      ((clientX - rect.left) / rect.width) * 2 - 1,
      -((clientY - rect.top) / rect.height) * 2 + 1
    );
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, this.engine.camera);

    const candidates = [];
    this.gameObjs.forEach(o => {
      if (o.mesh) candidates.push(o.mesh);
    });
    if (this.pedestal?.platformGroup) candidates.push(this.pedestal.platformGroup);

    const intersects = raycaster.intersectObjects(candidates, true);
    if (intersects.length > 0) {
      const hitPt = intersects[0].point;
      const speedMult = this._getSpeedMult();
      this.cannon.aimAtWorldPoint(hitPt, speedMult);
    } else {
      const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
      const target = new THREE.Vector3();
      if (raycaster.ray.intersectPlane(plane, target)) {
        if (target.y >= 0.5 && target.y <= 12.0 && Math.abs(target.x) <= 7.0) {
          const speedMult = this._getSpeedMult();
          this.cannon.aimAtWorldPoint(target, speedMult);
        }
      }
    }
  }

  _isBlasterTarget(clientX, clientY) {
    if (this.state !== S.PLAYING || !this.cannon) return false;

    // 1. Precise 3D Raycasting against Royal Cannon Meshes
    try {
      if (this.cannon.group && this.engine?.camera && this.engine?.canvas) {
        const rect = this.engine.canvas.getBoundingClientRect();
        const ndcX = ((clientX - rect.left) / rect.width) * 2 - 1;
        const ndcY = -((clientY - rect.top) / rect.height) * 2 + 1;
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(new THREE.Vector2(ndcX, ndcY), this.engine.camera);
        const hits = raycaster.intersectObjects(this.cannon.group.children, true);
        if (hits && hits.length > 0) {
          return true;
        }
      }
    } catch (err) {}

    return false;
  }

  // ─── Step 3 Onboarding & ⚙️ Royal Settings Modal ─────────────────────────
  _initOnboardingAndSettingsUI() {
    this._activeAuthProvider = 'google'; // 'google' | 'apple'

    // 1. Onboarding Name Input
    const onboardNameInput = document.getElementById('onboard-name-input');
    if (onboardNameInput) {
      onboardNameInput.value = economy.playerName || 'Royal Champion';
      onboardNameInput.addEventListener('change', () => {
        const v = onboardNameInput.value.trim();
        if (v) {
          economy.setPlayerName(v);
          this._updateProfileDisplays();
        }
      });
    }

    // 2. Google & Apple Sign-In on Onboarding Screen & Settings Modal
    const openAuthDrawer = (provider, fromSettings = false) => {
      this._activeAuthProvider = provider;
      if (fromSettings) {
        const currentEmail = provider === 'apple' ? economy.appleEmail : economy.googleEmail;
        const promptLabel = provider === 'apple'
          ? ' Sign in with Apple — Enter your Apple ID email to sync your Royal Smash account:'
          : 'G Sign in with Google — Enter your Google email to sync your Royal Smash account:';
        const entered = window.prompt(promptLabel, currentEmail || '');
        if (entered && entered.trim().includes('@')) {
          const res = provider === 'apple'
            ? economy.linkAppleAccount(entered.trim(), economy.playerName)
            : economy.linkGoogleAccount(entered.trim(), economy.playerName);
          if (res.success) {
            this.audio?.playVictory?.();
            this._updateAuthSignInUI();
            this._refreshAccountSyncDisplays();
            this._showCombo(`☁️ SIGNED IN WITH ${provider.toUpperCase()}: ${res.email.toUpperCase()}`);
          }
        }
        return;
      }

      const drawer = document.getElementById('onboard-auth-drawer');
      const emailInput = document.getElementById('onboard-auth-email');
      if (drawer) drawer.classList.remove('hidden');
      if (emailInput) {
        emailInput.placeholder = provider === 'apple' ? 'yourname@icloud.com (Apple ID)' : 'yourname@gmail.com (Google)';
        emailInput.value = (provider === 'apple' ? economy.appleEmail : economy.googleEmail) || '';
        emailInput.focus();
      }
    };

    document.getElementById('onboard-google-btn')?.addEventListener('click', () => openAuthDrawer('google', false));
    document.getElementById('onboard-apple-btn')?.addEventListener('click', () => openAuthDrawer('apple', false));
    document.getElementById('settings-google-btn')?.addEventListener('click', () => openAuthDrawer('google', true));
    document.getElementById('settings-apple-btn')?.addEventListener('click', () => openAuthDrawer('apple', true));

    document.getElementById('onboard-auth-confirm-btn')?.addEventListener('click', () => {
      const emailInput = document.getElementById('onboard-auth-email');
      const nameInput = document.getElementById('onboard-name-input');
      const emailVal = emailInput?.value?.trim() || '';
      const nameVal = nameInput?.value?.trim() || economy.playerName;
      if (nameVal) economy.setPlayerName(nameVal);

      const res = (this._activeAuthProvider === 'apple')
        ? economy.linkAppleAccount(emailVal, nameVal)
        : economy.linkGoogleAccount(emailVal, nameVal);

      if (res.success) {
        this.audio?.playVictory?.();
        document.getElementById('onboard-auth-drawer')?.classList.add('hidden');
        this._updateAuthSignInUI();
        this._updateProfileDisplays();
        this._refreshAccountSyncDisplays();
        this._showCombo(`☁️ SIGNED IN WITH ${this._activeAuthProvider.toUpperCase()}!`);
      } else {
        alert(res.message || 'Please enter a valid email address.');
      }
    });

    // 3. Mode Selection Cards on Onboarding Screen (Normal vs Revenge / Stress Buster)
    const cardNormal = document.getElementById('onboard-mode-normal');
    const cardRevenge = document.getElementById('onboard-mode-revenge');

    cardNormal?.addEventListener('click', () => {
      this.audio?.playTick?.();
      this._setGameMode(false);
    });

    cardRevenge?.addEventListener('click', () => {
      this.audio?.playCombo?.();
      this._setGameMode(true);
      // Directly open the custom photo / target popup as requested by user
      document.getElementById('vip-modal')?.classList.remove('hidden');
    });

    // 4. Launch Siege / Open Main Menu CTA Buttons on Onboarding Screen
    const saveOnboardingProfile = () => {
      const nameInput = document.getElementById('onboard-name-input');
      if (nameInput && nameInput.value.trim()) {
        economy.setPlayerName(nameInput.value.trim());
        this._updateProfileDisplays();
      }
      // Grant starter welcome treasury automatically so new players don't get interrupted by a popup on Stage 1
      if (!economy.welcomeClaimed) {
        economy.claimWelcomeBonus();
        this._updateWalletDisplays();
      }
    };

    document.getElementById('onboard-play-btn')?.addEventListener('click', () => {
      saveOnboardingProfile();
      if (this._isBossModeActive() && !customTargets.userUploaded) {
        document.getElementById('vip-modal')?.classList.remove('hidden');
        return;
      }
      this._startLevel(0);
    });

    document.getElementById('onboard-menu-btn')?.addEventListener('click', () => {
      saveOnboardingProfile();
      this._goMenu();
    });

    // 5. ⚙️ Royal Settings Modal Wiring (HUD & Menu Settings Buttons)
    document.getElementById('hud-settings-btn')?.addEventListener('click', () => this._openSettingsModal());
    document.getElementById('menu-settings-btn')?.addEventListener('click', () => this._openSettingsModal());
    document.getElementById('settings-close-btn')?.addEventListener('click', () => this._closeSettingsModal());
    document.getElementById('settings-done-btn')?.addEventListener('click', () => this._closeSettingsModal());

    document.getElementById('settings-sound-toggle')?.addEventListener('click', () => this._toggleSound());
    document.getElementById('settings-vibe-toggle')?.addEventListener('click', () => this._toggleVibration());

    document.getElementById('settings-mode-normal')?.addEventListener('click', () => {
      this._setGameMode(false, true);
    });
    document.getElementById('settings-mode-revenge')?.addEventListener('click', () => {
      this._setGameMode(true, true);
    });

    document.getElementById('settings-name-save-btn')?.addEventListener('click', () => {
      const inp = document.getElementById('settings-name-input');
      if (inp && inp.value.trim()) {
        economy.setPlayerName(inp.value.trim());
        this._updateProfileDisplays();
        this._showCombo(`👑 CHAMPION NAME: ${economy.playerName.toUpperCase()}`);
      }
    });

    // Also wire direct clicks on the two Menu mode pills
    document.getElementById('mode-pill-standard')?.addEventListener('click', (e) => {
      e.stopPropagation();
      this._setGameMode(false, true);
    });
    document.getElementById('mode-pill-boss')?.addEventListener('click', (e) => {
      e.stopPropagation();
      this._setGameMode(true, true);
    });

    this._updateAuthSignInUI();
  }

  _goOnboarding() {
    this.state = S.ONBOARD;
    // Default to Normal Kingdom Mode unless player explicitly chose Revenge Mode earlier
    if (!economy.bossModeContinuous) {
      customTargets.active = false;
    }
    const onboardName = document.getElementById('onboard-name-input');
    if (onboardName) onboardName.value = economy.playerName || 'Royal Champion';
    this._updateAuthSignInUI();
    this._updateModeUI();
    this._showOnly('onboarding');
  }

  _openSettingsModal() {
    this._wasTimerRunning = this._timerRunning;
    this._timerRunning = false;
    this.physics?.pause();

    const inp = document.getElementById('settings-name-input');
    if (inp) inp.value = economy.playerName || 'Royal Champion';

    this._updateSoundUI();
    this._updateVibrationUI();
    this._updateModeUI();
    this._updateAuthSignInUI();

    this.$.settingsModal?.classList.remove('hidden');
  }

  _closeSettingsModal() {
    const inp = document.getElementById('settings-name-input');
    if (inp && inp.value.trim() && inp.value.trim() !== economy.playerName) {
      economy.setPlayerName(inp.value.trim());
      this._updateProfileDisplays();
    }
    this.$.settingsModal?.classList.add('hidden');
    if (this.state === S.PLAYING) {
      this._timerRunning = this._wasTimerRunning;
      this.physics?.unpause();
    }
  }

  _updateAuthSignInUI() {
    const gLinked = economy.googleLinked && economy.googleEmail;
    const aLinked = economy.appleLinked && economy.appleEmail;

    const gBtns = [document.getElementById('onboard-google-btn'), document.getElementById('settings-google-btn')];
    const aBtns = [document.getElementById('onboard-apple-btn'), document.getElementById('settings-apple-btn')];
    const gTxts = [document.getElementById('onboard-google-txt'), document.getElementById('settings-google-txt')];
    const aTxts = [document.getElementById('onboard-apple-txt'), document.getElementById('settings-apple-txt')];

    gBtns.forEach(b => b?.classList.toggle('linked', Boolean(gLinked)));
    aBtns.forEach(b => b?.classList.toggle('linked', Boolean(aLinked)));

    gTxts.forEach(t => {
      if (t) t.textContent = gLinked ? `✓ ${economy.googleEmail.split('@')[0]}` : 'Sign in with Google';
    });
    aTxts.forEach(t => {
      if (t) t.textContent = aLinked ? `✓ ${economy.appleEmail.split('@')[0]}` : 'Sign in with Apple';
    });

    const statusText = gLinked
      ? `✅ Linked with Google (${economy.googleEmail}) · Key: ${economy.syncKey}`
      : (aLinked
        ? `✅ Linked with Apple (${economy.appleEmail}) · Key: ${economy.syncKey}`
        : `Playing as ${economy.playerName} · Backup Key: ${economy.syncKey}`);

    const s1 = document.getElementById('onboard-auth-status');
    const s2 = document.getElementById('settings-auth-status');
    if (s1) s1.textContent = statusText;
    if (s2) s2.textContent = statusText;
  }

  // ─── Sound, Haptic Vibration & Mode UI Toggles ────────────────────────────
  _toggleSound() {
    const isMuted = economy.toggleSound();
    this.audio?.setMuted(isMuted);
    this._updateSoundUI();
  }

  _updateSoundUI() {
    const isOn = !economy.soundMuted;
    const icon = isOn ? '🔊' : '🔇';
    const sBtn = document.getElementById('sound-toggle-btn');
    const mBtn = document.getElementById('menu-sound-btn');
    if (sBtn) sBtn.textContent = icon;
    if (mBtn) mBtn.textContent = `${icon} SOUND`;

    const setIcon = document.getElementById('settings-sound-icon');
    const setToggle = document.getElementById('settings-sound-toggle');
    if (setIcon) setIcon.textContent = icon;
    if (setToggle) {
      setToggle.textContent = isOn ? 'ON' : 'OFF';
      setToggle.classList.toggle('active', isOn);
    }
  }

  _toggleVibration() {
    const enabled = economy.toggleVibration();
    this._updateVibrationUI();
    if (enabled) {
      economy.vibrate([30, 40, 30]);
      this._showCombo('📳 PHONE VIBRATION: ON');
    } else {
      this._showCombo('📴 PHONE VIBRATION: OFF');
    }
  }

  _updateVibrationUI() {
    const enabled = Boolean(economy.vibrationEnabled);
    const setIcon = document.getElementById('settings-vibe-icon');
    const setToggle = document.getElementById('settings-vibe-toggle');
    if (setIcon) setIcon.textContent = enabled ? '📳' : '📴';
    if (setToggle) {
      setToggle.textContent = enabled ? 'ON' : 'OFF';
      setToggle.classList.toggle('active', enabled);
    }
  }

  // ─── Share With Friend (Web Share API + WhatsApp / Clipboard Fallback) ────
  async _shareWithFriend(context = 'win') {
    const gameUrl = window.location.origin + window.location.pathname;
    let shareText = `🏰 Join me in Royal Smash 3D by Varnams! I just smashed Level ${this.levelIdx + 1} with ${this.score.toLocaleString()} pts! Can you beat my Royal Rank? 👑🔥`;

    if (context === 'palace') {
      shareText = `👑 GRAND PALACE CONQUERED! I just breached Stage ${this.levelIdx + 1} in Royal Smash 3D by Varnams! Play free now:`;
    } else if (context === 'secret') {
      const ch = this._getCurrentChapter();
      const targetName = customTargets.targetName || 'The Boss';
      shareText = `😈 I just unlocked a Secret Royal Scroll for ${targetName} in Royal Smash 3D ("${ch.message}")! Smash the castle to reveal yours:`;
    }

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Royal Smash 3D — by Varnams',
          text: shareText,
          url: gameUrl,
        });
        this._showCombo('📤 SHARED WITH FRIEND!');
        return;
      } catch (err) {
        if (err && err.name === 'AbortError') return;
      }
    }

    const fullMsg = `${shareText} ${gameUrl}`;
    try {
      await navigator.clipboard.writeText(fullMsg);
      this._showCombo('📋 INVITE COPIED! OPENING WHATSAPP...');
    } catch (_) {}

    const waUrl = `https://wa.me/?text=${encodeURIComponent(fullMsg)}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  }

  _returnToHome() {
    this._timerRunning = false;
    this.physics?.pause();
    this._clearLevel();
    this._goMenu();
  }

  _setGameMode(isBoss, rebuildIfPlaying = false) {
    const bossOn = Boolean(isBoss);
    economy.setBossMode(bossOn);
    customTargets.active = bossOn;
    this._updateModeUI();
    const modeName = bossOn ? 'REVENGE / STRESS BUSTER MODE' : 'NORMAL KINGDOM MODE';
    this._showCombo(`⚔️ MODE: ${modeName}!`);
    if (rebuildIfPlaying && this.state === S.PLAYING) {
      this._startLevel(this.levelIdx);
    }
  }

  _toggleBossMode() {
    this._setGameMode(!economy.bossModeContinuous, true);
  }

  _updateModeUI() {
    const isBoss = Boolean(economy.bossModeContinuous);
    const pillStd = document.getElementById('mode-pill-standard');
    const pillBoss = document.getElementById('mode-pill-boss');
    const hudModePill = document.getElementById('hud-mode-toggle-btn');
    const hudModeIcon = document.getElementById('hud-mode-icon');
    const hudModeTxt = document.getElementById('hud-mode-txt');

    if (pillStd && pillBoss) {
      pillStd.classList.toggle('active', !isBoss);
      pillBoss.classList.toggle('active', isBoss);
    }
    if (hudModePill) {
      hudModePill.classList.toggle('boss-active', isBoss);
      if (hudModeIcon) hudModeIcon.textContent = isBoss ? '😈' : '🏰';
      if (hudModeTxt) hudModeTxt.textContent = isBoss ? 'REVENGE' : 'NORMAL';
      hudModePill.title = isBoss ? 'Mode: Revenge / Stress Buster (Tap for Normal Kingdom)' : 'Mode: Normal Kingdom (Tap for Revenge Mode)';
    }

    // Sync Onboarding Mode Cards
    const cardNormal = document.getElementById('onboard-mode-normal');
    const cardRevenge = document.getElementById('onboard-mode-revenge');
    const revengeOpts = document.getElementById('onboard-revenge-options');
    if (cardNormal && cardRevenge) {
      cardNormal.classList.toggle('active', !isBoss);
      cardRevenge.classList.toggle('active', isBoss);
    }
    if (revengeOpts) {
      revengeOpts.classList.toggle('hidden', !isBoss);
    }

    // Sync Settings Modal Mode Buttons
    const setModeNormal = document.getElementById('settings-mode-normal');
    const setModeRevenge = document.getElementById('settings-mode-revenge');
    if (setModeNormal && setModeRevenge) {
      setModeNormal.classList.toggle('active', !isBoss);
      setModeRevenge.classList.toggle('active', isBoss);
    }

    this._updateWordRevealVisibility();
  }



  // ─── Tutorial / Academy Modal ─────────────────────────────────────────────
  _openTutorial(step = 0) {
    this._tutorialStep = Math.max(0, Math.min(3, step));
    this._renderTutorialStep();
    document.getElementById('tutorial-modal')?.classList.remove('hidden');
  }

  _closeTutorial() {
    document.getElementById('tutorial-modal')?.classList.add('hidden');
    try { localStorage.setItem('royal_smash_tutorial_seen', 'true'); } catch (e) {}
  }

  _prevTutorialStep() {
    if (this._tutorialStep > 0) {
      this._openTutorial(this._tutorialStep - 1);
    }
  }

  _nextTutorialStep() {
    if (this._tutorialStep < 3) {
      this._openTutorial(this._tutorialStep + 1);
    } else {
      this._closeTutorial();
    }
  }

  _renderTutorialStep() {
    const totalSteps = 4;
    for (let i = 0; i < totalSteps; i++) {
      const stepEl = document.getElementById(`tut-step-${i}`);
      const tabEl = document.querySelector(`.tut-tab[data-step="${i}"]`);
      if (stepEl) stepEl.classList.toggle('hidden', i !== this._tutorialStep);
      if (tabEl) tabEl.classList.toggle('active', i === this._tutorialStep);
    }
    const prevBtn = document.getElementById('tut-prev-btn');
    const nextBtn = document.getElementById('tut-next-btn');
    const startBtn = document.getElementById('tut-start-btn');

    if (prevBtn) prevBtn.style.display = (this._tutorialStep > 0) ? 'block' : 'none';
    if (nextBtn) nextBtn.style.display = (this._tutorialStep < totalSteps - 1) ? 'block' : 'none';
    if (startBtn) startBtn.style.display = (this._tutorialStep === totalSteps - 1) ? 'block' : 'none';
  }

  // ─── Player Profile Name & Leaderboard ────────────────────────────────────
  _openProfileModal() {
    const input = document.getElementById('player-name-input');
    if (input) input.value = economy.playerName;
    const syncKeyEl = document.getElementById('profile-sync-key');
    if (syncKeyEl) syncKeyEl.textContent = economy.syncKey || 'VARNAM-XXXX-YY';
    this.$.profileModal?.classList.remove('hidden');
  }

  _closeProfileModal() {
    this.$.profileModal?.classList.add('hidden');
  }

  _saveProfileName() {
    const input = document.getElementById('player-name-input');
    if (input && input.value.trim()) {
      economy.setPlayerName(input.value.trim());
      this._updateProfileDisplays();
      this._closeProfileModal();
      this._showCombo(`CHAMPION NAME SAVED: ${economy.playerName.toUpperCase()}`);
    }
  }

  _updateProfileDisplays() {
    if (this.$.hudPlayerName) this.$.hudPlayerName.textContent = economy.playerName;
    const syncKeyEl = document.getElementById('profile-sync-key');
    if (syncKeyEl) syncKeyEl.textContent = economy.syncKey || 'VARNAM-XXXX-YY';
  }

  _openLeaderboard() {
    const data = economy.getLeaderboardData();
    const myCardEl = document.getElementById('leaderboard-my-card');
    const listEl = document.getElementById('leaderboard-list');

    if (myCardEl) {
      myCardEl.innerHTML = `
        <div class="lb-left">
          <div class="lb-rank">#${data.player.rank}</div>
          <div class="lb-info">
            <div class="lb-name">👑 ${data.player.name} (YOU)</div>
            <div class="lb-title">${data.player.title} · ${data.player.accuracy}% Accuracy</div>
          </div>
        </div>
        <div class="lb-score">
          <div class="lb-pts">${data.player.score.toLocaleString()} pts</div>
          <div class="lb-stars">⭐ ${data.player.stars} Stars</div>
        </div>
      `;
    }

    if (listEl) {
      listEl.innerHTML = '';
      data.topPlayers.forEach((p) => {
        const row = document.createElement('div');
        row.className = `leaderboard-row ${p.rank === 1 ? 'top-1' : ''}`;
        row.innerHTML = `
          <div class="lb-rank">${p.rank === 1 ? '👑 1' : (p.rank === 2 ? '🥈 2' : (p.rank === 3 ? '🥉 3' : `#${p.rank}`))}</div>
          <div class="lb-info">
            <div class="lb-name">${p.flag} ${p.name}</div>
            <div class="lb-title">${p.title}</div>
          </div>
          <div class="lb-score">
            <div class="lb-pts">${p.score.toLocaleString()} pts</div>
            <div class="lb-stars">⭐ ${p.stars}</div>
          </div>
        `;
        listEl.appendChild(row);
      });
    }

    this.$.leaderboardModal?.classList.remove('hidden');
  }

  _closeLeaderboard() {
    this.$.leaderboardModal?.classList.add('hidden');
  }

  // ─── Royal Arsenal & Treasury Modal Management ─────────────────────────────
  _switchShopTab(tab = 'ammo') {
    const isAmmo = (tab === 'ammo');
    const isBlasters = (tab === 'blasters');
    const isTreasury = (tab === 'treasury');

    this.$.tabAmmo?.classList.toggle('active', isAmmo);
    this.$.tabBlasters?.classList.toggle('active', isBlasters);
    this.$.tabTreasury?.classList.toggle('active', isTreasury);

    this.$.tabContentAmmo?.classList.toggle('hidden', !isAmmo);
    this.$.tabContentBlasters?.classList.toggle('hidden', !isBlasters);
    this.$.tabContentTreasury?.classList.toggle('hidden', !isTreasury);

    if (isAmmo) this._renderShopCatalog();
    if (isBlasters) this._renderBlastersCatalog();
    if (isTreasury) this._renderTreasuryCatalog();
  }

  _renderBlastersCatalog() {
    if (!this.$.blasterGrid) return;
    this.$.blasterGrid.innerHTML = '';

    economy.blasterCatalog.forEach(item => {
      const isUnlocked = economy.isBlasterUnlocked(item.id);
      const isEquipped = (economy.equippedBlaster === item.id);
      const effPrice = economy.getBlasterEffectivePrice(item);

      const card = document.createElement('div');
      card.className = `blaster-card ${isEquipped ? 'equipped' : ''}`;

      let actionsHtml = '';
      if (isEquipped) {
        actionsHtml = `<div class="btn-blaster-equipped">✓ EQUIPPED</div>`;
      } else if (isUnlocked) {
        actionsHtml = `<button class="btn-blaster-equip" data-blaster="${item.id}">EQUIP ⚡</button>`;
      } else {
        actionsHtml = `
          <button class="btn-blaster-buy-silver" data-blaster="${item.id}" data-currency="silver">⚪ ${effPrice.silverPrice}${effPrice.discounted ? ' (-25%)' : ''}</button>
          <button class="btn-blaster-buy-gold" data-blaster="${item.id}" data-currency="gold">🪙 ${effPrice.goldPrice}${effPrice.discounted ? ' (-25%)' : ''}</button>
        `;
      }

      card.innerHTML = `
        <div class="blaster-info">
          <div class="blaster-icon">${item.icon}</div>
          <div>
            <div class="blaster-name">${item.name} <span class="blaster-badge">${effPrice.discounted ? '🏰 -25% PERK' : item.badge}</span></div>
            <div class="blaster-desc">${item.description}</div>
            <div class="blaster-perk">⚡ ${item.perk || ''}</div>
          </div>
        </div>
        <div class="blaster-actions">
          ${actionsHtml}
        </div>
      `;
      this.$.blasterGrid.appendChild(card);
    });

    // Equip handlers
    this.$.blasterGrid.querySelectorAll('.btn-blaster-equip').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-blaster');
        if (economy.equipBlaster(id)) {
          this.cannon?.setBlasterSkin(id);
          this.audio?.playVictory();
          const item = economy.blasterCatalog.find(b => b.id === id);
          this._showCombo(`EQUIPPED: ${item?.name || id}!`);
          this._updateBlasterHUDIcon();
          this._renderBlastersCatalog();
        }
      });
    });

    // Buy handlers
    this.$.blasterGrid.querySelectorAll('.btn-blaster-buy-silver, .btn-blaster-buy-gold').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-blaster');
        const currency = btn.getAttribute('data-currency');
        const res = economy.buyBlaster(id, currency);
        if (res.success) {
          this.cannon?.setBlasterSkin(id);
          this.audio?.playVictory();
          this._showCombo(`UNLOCKED & EQUIPPED: ${res.item?.name || id}!`);
          this._updateWalletDisplays();
          this._updateBlasterHUDIcon();
          this._renderBlastersCatalog();
          this._triggerFlyingCoins(12);
        } else if (res.needCoins) {
          this._showNeedCoinsPrompt(`You need ${res.needed} more ${res.currency} coins for this blaster.`);
        } else {
          alert(res.reason || 'Cannot complete purchase');
        }
      });
    });
  }

  _updateBlasterHUDIcon() {
    const el = document.getElementById('hud-blaster-icon');
    if (!el) return;
    const skinId = economy.equippedBlaster || 'royal';
    if (skinId === 'royal') {
      el.innerHTML = '<svg class="blaster-svg"><use href="#cannon-icon"/></svg>';
    } else {
      const item = economy.blasterCatalog.find(b => b.id === skinId);
      el.innerHTML = item ? item.icon : '<svg class="blaster-svg"><use href="#cannon-icon"/></svg>';
    }
  }

  _renderShopCatalog() {
    if (!this.$.shopGrid) return;
    this.$.shopGrid.innerHTML = '';
    const isVip = economy.isPremiumUser();

    economy.shopCatalog.forEach(item => {
      const card = document.createElement('div');
      card.className = 'shop-item-card';

      if (item.type === 'vip') {
        card.innerHTML = `
          <div class="shop-item-info">
            <div class="shop-item-icon-box">${item.icon}</div>
            <div class="shop-item-text">
              <div class="shop-item-name-row">
                <span class="shop-item-name">${item.name}</span>
                <span class="badge-stock-count" style="${isVip ? 'background:#059669;color:#fff;' : 'background:#d97706;color:#fff;'}">${isVip ? '👑 VIP ACTIVE' : 'ARSENAL PASS'}</span>
              </div>
              <div class="shop-item-desc">${item.description}</div>
            </div>
          </div>
          <div class="shop-item-buttons">
            ${isVip ? '<button class="btn-buy-silver" disabled style="grid-column:span 2;background:#059669;color:#fff;border:none;font-weight:700;">UNLOCKED 👑</button>' : `
              <button class="btn-buy-silver" data-id="${item.id}" data-gold="false">⚪ ${item.silverPrice}</button>
              <button class="btn-buy-gold" data-id="${item.id}" data-gold="true">🪙 ${item.goldPrice}</button>
            `}
          </div>
        `;
      } else {
        const stock = economy.getAmmoCount(item.type);
        const maxCap = AMMO_MAX_CAPACITY[item.type] ?? 99;
        const isPremiumLocked = PREMIUM_AMMO_TYPES.includes(item.type) && !isVip;
        const isFull = stock >= maxCap;

        card.innerHTML = `
          <div class="shop-item-info">
            <div class="shop-item-icon-box">${item.icon}</div>
            <div class="shop-item-text">
              <div class="shop-item-name-row">
                <span class="shop-item-name">${item.name}</span>
                <span class="badge-stock-count" style="${isPremiumLocked ? 'background:#ef4444;color:#fff;' : (isFull ? 'background:#f59e0b;color:#1e293b;' : '')}">${isPremiumLocked ? (stock > 0 ? `🔒 VIP (Owned: x${stock})` : '🔒 VIP ONLY') : (isFull ? `MAX (x${stock})` : `Owned: x${stock}`)}</span>
              </div>
              <div class="shop-item-desc">${item.description}</div>
            </div>
          </div>
          <div class="shop-item-buttons">
            ${isPremiumLocked ? `
              <div style="grid-column:span 2;display:flex;gap:6px;">
                <button class="btn-buy-gold" data-id="vip_pass" data-gold="false" style="flex:1;background:linear-gradient(135deg, #d97706, #b45309);color:#fff;font-weight:700;border:none;font-size:11px;padding:6px 4px;">⚪ 4500 / 🪙 180</button>
                <button class="btn-open-vip-checkout" style="flex:1;background:linear-gradient(135deg, #0284c7, #38bdf8);color:#fff;font-weight:800;border:none;font-size:11px;border-radius:8px;cursor:pointer;padding:6px 4px;">👑 VIP PASS</button>
              </div>
            ` : (isFull ? `
              <button class="btn-buy-silver" disabled style="grid-column:span 2;opacity:0.6;font-weight:600;">INVENTORY FULL (x${maxCap})</button>
            ` : `
              <button class="btn-buy-silver" data-id="${item.id}" data-gold="false">⚪ ${item.silverPrice}</button>
              <button class="btn-buy-gold" data-id="${item.id}" data-gold="true">🪙 ${item.goldPrice}</button>
            `)}
          </div>
        `;
      }
      this.$.shopGrid.appendChild(card);
    });

    this.$.shopGrid.querySelectorAll('.btn-open-vip-checkout').forEach(btn => {
      btn.addEventListener('click', () => {
        this._openCheckout('pass_vip_adfree');
      });
    });

    this.$.shopGrid.querySelectorAll('button[data-id]:not([disabled])').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = btn.getAttribute('data-id');
        const useGold = btn.getAttribute('data-gold') === 'true';
        const res = economy.buyItem(id, useGold);
        if (res.success) {
          this.audio?.playCombo();
          this._updateWalletDisplays();
          this._updateAmmoStockDisplay();
          this._renderShopCatalog();
          if (res.item.type === 'vip') {
            this._showCombo(`👑 ROYAL VIP ARSENAL PASS UNLOCKED!`);
            this._triggerFlyingCoins(20);
          } else {
            this._showCombo(`PURCHASED: +${res.item.count} ${res.item.name.toUpperCase()}!`);
          }
        } else if (res.needCoins) {
          this._showNeedCoinsPrompt(res.reason);
        } else {
          alert(res.reason || 'Cannot complete purchase');
        }
      });
    });
  }

  _updateNeedCoinsPrices() {
    const squire = economy.coinPacks.find(p => p.id === 'squire_pouch');
    const knight = economy.coinPacks.find(p => p.id === 'knight_chest');
    const sqPrice = economy.getPackPrice(squire);
    const knPrice = economy.getPackPrice(knight);

    const sqPriceEl = document.getElementById('need-coins-squire-price');
    const upBtnEl = document.getElementById('need-coins-upgrade-btn');
    const buyBtnEl = document.getElementById('need-coins-buy-btn');
    const curBtn = document.getElementById('currency-toggle-btn');

    if (sqPriceEl) sqPriceEl.textContent = sqPrice;
    if (upBtnEl) upBtnEl.textContent = `BUY ${knPrice}`;
    if (buyBtnEl) buyBtnEl.textContent = `⚡ GET SQUIRE PACK (${sqPrice})`;
    if (curBtn) {
      curBtn.textContent = economy.paymentConfig.currency === 'INR' ? '🇮🇳 INR (₹)' : '🌎 USD ($)';
    }
  }

  _showNeedCoinsPrompt(reason) {
    const msgEl = document.getElementById('need-coins-msg');
    if (msgEl) msgEl.textContent = reason || "You don't have enough coins for this item.";
    this._updateNeedCoinsPrices();
    this.$.needCoinsModal?.classList.remove('hidden');
  }

  _openShop(tab = 'ammo') {
    this._wasTimerRunning = this._timerRunning;
    this._timerRunning = false;
    this.physics?.pause();
    this._switchShopTab(tab);
    this._renderShopCatalog();
    this._renderBlastersCatalog();
    this._renderTreasuryCatalog();
    this._updateNeedCoinsPrices();
    this._updateWalletDisplays();
    this.$.shopModal?.classList.remove('hidden');
  }

  _closeShop(force = false) {
    if (this._storeOpenedFromContinue && !force) {
      const typeLabel = (this._continueType === 'time') ? 'TIME' : 'SHOTS';
      this._showConfirmModal({
        icon: '⚠️',
        title: 'CLOSE ROYAL VAULT?',
        msg: 'Do you confirm if you want to close? You will need to start the level again.',
        yesText: '✕ YES, CLOSE & RESTART LEVEL',
        noText: `◀ NO, RETURN TO BUY ${typeLabel}`,
        yesDanger: true,
        onYes: () => {
          this._storeOpenedFromContinue = false;
          this._pendingContinue = null;
          this.$.shopModal?.classList.add('hidden');
          this.$.needCoinsModal?.classList.add('hidden');
          this._startLevel(this.levelIdx);
        },
        onNo: () => {
          this._storeOpenedFromContinue = false;
          this.$.shopModal?.classList.add('hidden');
          this.$.needCoinsModal?.classList.add('hidden');
          // Re-open continue modal with updated coin balance so user can buy shots/time!
          const standing = this.gameObjs.filter(o => o.isCan && !o.fallen).length;
          this._openContinueModal(this._continueType || 'shots', standing, this._continueOrigin === 'midgame');
        }
      });
      return;
    }

    this._storeOpenedFromContinue = false;
    this.$.shopModal?.classList.add('hidden');
    this.$.needCoinsModal?.classList.add('hidden');
    this._isDragging = false;
    this._inputCooldown = Date.now() + 150;

    // UNCONDITIONAL UNPAUSE: guarantees cannon/physics will never freeze on shop exit!
    if (this.state === S.PLAYING) {
      this._timerRunning = this._wasTimerRunning;
      this.physics?.unpause();
    }
  }

  _renderTreasuryCatalog() {
    if (!this.$.treasuryGrid) return;
    this.$.treasuryGrid.innerHTML = '';

    const activeCurr = economy.paymentConfig.currency;
    document.querySelectorAll('.currency-tab').forEach(tab => {
      tab.classList.toggle('active', tab.getAttribute('data-currency') === activeCurr);
    });
    const curBtn = document.getElementById('currency-toggle-btn');
    if (curBtn) {
      curBtn.textContent = activeCurr === 'INR' ? '🇮🇳 INR (₹)' : '🌎 USD ($)';
    }

    // 1. VIP & Collector Passes Section (Mirrors Chess Game Royal Edition)
    const vipSectionHeader = document.createElement('div');
    vipSectionHeader.style.cssText = 'grid-column: 1 / -1; margin-top: 4px; margin-bottom: 2px; font-size: 0.76rem; font-weight: 800; color: #fbbf24; text-transform: uppercase; letter-spacing: 0.6px; display: flex; align-items: center; justify-content: space-between;';
    vipSectionHeader.innerHTML = '<span>👑 Royal VIP Passes</span><span style="font-size:0.65rem;color:#38bdf8;background:rgba(56,189,248,0.15);border:1px solid rgba(56,189,248,0.3);padding:1px 6px;border-radius:6px;font-weight:700;">50% Launch Discount</span>';
    this.$.treasuryGrid.appendChild(vipSectionHeader);

    economy.vipPasses.forEach(pass => {
      const card = document.createElement('div');
      card.className = 'vip-pass-card treasury-pack-card';
      const isCollector = pass.id === 'vault_sovereign_55';
      const isGrandmaster = pass.id === 'pass_grandmaster';
      const isAlpha = pass.id === 'alpha_tester_pass';

      if (isCollector) {
        card.style.borderColor = '#c084fc';
        card.style.background = 'linear-gradient(135deg, rgba(88, 28, 135, 0.45), rgba(168, 85, 247, 0.22))';
        card.style.boxShadow = '0 4px 18px rgba(168, 85, 247, 0.35)';
      } else if (isGrandmaster) {
        card.style.borderColor = '#f59e0b';
        card.style.background = 'linear-gradient(135deg, rgba(180, 83, 9, 0.40), rgba(245, 158, 11, 0.20))';
        card.style.boxShadow = '0 4px 18px rgba(245, 158, 11, 0.30)';
      } else if (isAlpha) {
        card.style.borderColor = '#38bdf8';
        card.style.background = 'linear-gradient(135deg, rgba(3, 105, 161, 0.40), rgba(56, 189, 248, 0.20))';
        card.style.boxShadow = '0 4px 18px rgba(56, 189, 248, 0.30)';
      }

      const displayPrice = economy.getPackPrice(pass);
      const origPrice = economy.paymentConfig.currency === 'INR' ? pass.origPriceInr : pass.origPriceUsd;

      let perkBullet = '';
      if (pass.unlocksAllBlasters) {
        perkBullet = '<div style="font-size:0.72rem;color:#34d399;font-weight:700;margin-top:2px;">✨ Unlocks all 5 Royal 3D Blasters</div>';
      } else if (pass.unlocksVip) {
        perkBullet = '<div style="font-size:0.72rem;color:#7dd3fc;font-weight:700;margin-top:2px;">✨ Lifetime VIP Pass Refills + Zero Ads</div>';
      }

      card.innerHTML = `
        <div class="vip-badge-tag">${pass.badge}</div>
        <div class="vip-left">
          <div class="vip-icon">${pass.icon}</div>
          <div>
            <div class="vip-name">${pass.name}</div>
            <div class="vip-desc">${pass.description}</div>
            ${perkBullet}
            <div class="pack-contents" style="margin-top:4px;">
              <span>⚪ +${pass.silver.toLocaleString()}</span>
              <span>🪙 +${pass.gold.toLocaleString()}</span>
            </div>
          </div>
        </div>
        <div class="vip-price-wrap">
          ${origPrice ? `<div class="vip-orig-price">${origPrice}</div>` : ''}
          <button class="btn-vip-buy" data-pass="${pass.id}">BUY ${displayPrice}</button>
        </div>
      `;
      this.$.treasuryGrid.appendChild(card);
    });

    // 2. Coin Packs Section
    const coinSectionHeader = document.createElement('div');
    coinSectionHeader.style.cssText = 'grid-column: 1 / -1; margin-top: 10px; margin-bottom: 2px; font-size: 0.76rem; font-weight: 800; color: #cbd5e1; text-transform: uppercase; letter-spacing: 0.6px;';
    coinSectionHeader.textContent = '💰 Treasury Coin Vaults';
    this.$.treasuryGrid.appendChild(coinSectionHeader);

    economy.coinPacks.forEach(pack => {
      const card = document.createElement('div');
      card.className = 'treasury-pack-card';

      let bonusHtml = '';
      const bonuses = [];
      if (pack.unlocksVip) bonuses.push(`👑 VIP PASS`);
      if (pack.bombs) bonuses.push(`+${pack.bombs} 💣`);
      if (pack.heavy) bonuses.push(`+${pack.heavy} ⚡`);
      if (pack.roller) bonuses.push(`+${pack.roller} 🎳`);
      if (pack.slipper) bonuses.push(`+${pack.slipper} 🩴`);
      if (pack.boot) bonuses.push(`+${pack.boot} 👢`);
      if (pack.splash) bonuses.push(`+${pack.splash} 💦`);
      if (pack.cluster) bonuses.push(`+${pack.cluster} 🚀`);
      if (bonuses.length > 0) bonusHtml = `<span class="pack-bonus">${bonuses.slice(0, 4).join(' ')}</span>`;

      const displayPrice = economy.getPackPrice(pack);
      const isBest = pack.badge.includes('BEST') || pack.badge.includes('ULTIMATE') || pack.badge.includes('VIP');
      card.innerHTML = `
        <div class="pack-badge ${isBest ? 'best' : ''}">${pack.badge}</div>
        <div class="pack-left">
          <div class="pack-icon">${pack.icon}</div>
          <div>
            <div class="pack-name">${pack.name}</div>
            <div class="pack-contents">
              <span>⚪ +${pack.silver.toLocaleString()}</span>
              <span>🪙 +${pack.gold.toLocaleString()}</span>
              ${bonusHtml}
            </div>
          </div>
        </div>
        <button class="btn-pack-buy" data-pack="${pack.id}">BUY ${displayPrice}</button>
      `;
      this.$.treasuryGrid.appendChild(card);
    });

    // Wire buy buttons for both VIP passes and coin packs
    this.$.treasuryGrid.querySelectorAll('.btn-vip-buy').forEach(btn => {
      btn.addEventListener('click', () => {
        const passId = btn.getAttribute('data-pass');
        this._openCheckout(passId);
      });
    });

    this.$.treasuryGrid.querySelectorAll('.btn-pack-buy').forEach(btn => {
      btn.addEventListener('click', () => {
        const packId = btn.getAttribute('data-pack');
        this._openCheckout(packId);
      });
    });
  }

  // ─── Multi-Gateway Payment System (Lemon Squeezy, PayPal, Direct UPI & Google Play) ───
  _selectPaymentMethod(method) {
    this._currentPayMethod = method;
    const optionCards = {
      lemonsqueezy: document.getElementById('payOptLemonSqueezy'),
      paypal: document.getElementById('payOptPayPal'),
      upi: document.getElementById('payOptUpi'),
      googleplay: document.getElementById('payOptGooglePlay'),
    };
    const detailPanels = {
      lemonsqueezy: document.getElementById('payDetailLemonSqueezy'),
      paypal: document.getElementById('payDetailPayPal'),
      upi: document.getElementById('payDetailUpi'),
      googleplay: document.getElementById('payDetailGooglePlay'),
    };

    Object.keys(optionCards).forEach(key => {
      const card = optionCards[key];
      const panel = detailPanels[key];
      const isSel = (key === method);
      if (card) card.classList.toggle('selected', isSel);
      if (panel) panel.style.display = isSel ? 'block' : 'none';
    });

    const btnLbl = document.getElementById('checkout-btn-label');
    if (btnLbl) {
      if (method === 'lemonsqueezy') {
        const isAppleDevice = /Mac|iPhone|iPad|iPod/.test(navigator.userAgent || '');
        btnLbl.textContent = isAppleDevice ? '🍏 Pay with Apple Pay' : '💳 Pay with Card';
      } else if (method === 'paypal') {
        btnLbl.textContent = '🅿️ Pay with PayPal';
      } else if (method === 'upi') {
        btnLbl.textContent = '⚡ Verify & Unlock with UPI';
      } else if (method === 'googleplay') {
        btnLbl.textContent = '▶️ Pay with Google Play';
      }
    }
  }

  _launchLemonSqueezyCheckout() {
    if (!this._selectedCheckoutPack) return;
    const pack = this._selectedCheckoutPack;
    const prodKey = pack.lemonKey || pack.name;
    let url = PAYMENT_CONFIG.lemonSqueezy.productUrls[prodKey] || PAYMENT_CONFIG.lemonSqueezy.storeUrl;

    const isIndia = (economy.paymentConfig.currency === 'INR');
    if (isIndia && PAYMENT_CONFIG.discounts.enabled) {
      const sep = url.includes('?') ? '&' : '?';
      url += `${sep}discount=${PAYMENT_CONFIG.discounts.indiaPppCode}`;
    }

    if (window.createLemonSqueezy) {
      window.createLemonSqueezy();
    }
    if (window.LemonSqueezy && window.LemonSqueezy.Url) {
      try {
        window.LemonSqueezy.Url.Open(url);
      } catch (e) {
        window.open(url, '_blank');
      }
    } else {
      window.open(url, '_blank');
    }

    if (window.LemonSqueezy && !this._lemonSqueezySetupDone) {
      this._lemonSqueezySetupDone = true;
      try {
        window.LemonSqueezy.Setup({
          eventHandler: (event) => {
            if (event.event === 'Checkout.Success') {
              this._deliverPurchasedPack(this._selectedCheckoutPack, { method: 'Apple Pay & Card (Lemon Squeezy)' });
            }
          }
        });
      } catch (e) {}
    }
  }

  _launchPayPalCheckout() {
    if (!this._selectedCheckoutPack) return;
    const pack = this._selectedCheckoutPack;
    const amountUsd = pack.amountUsd || 0.99;
    const paypalUrl = `${PAYMENT_CONFIG.paypal.paypalMeUrl}/${amountUsd}`;
    window.open(paypalUrl, '_blank');
  }

  _initCheckoutAndRestoreUI() {
    this._currentPayMethod = 'upi';

    // 1. Wire Payment Option Selector Cards
    const payOptions = [
      { id: 'payOptLemonSqueezy', method: 'lemonsqueezy' },
      { id: 'payOptPayPal', method: 'paypal' },
      { id: 'payOptUpi', method: 'upi' },
      { id: 'payOptGooglePlay', method: 'googleplay' },
    ];

    payOptions.forEach(opt => {
      const el = document.getElementById(opt.id);
      el?.addEventListener('click', () => {
        this._selectPaymentMethod(opt.method);
      });
    });

    // 2. Wire Direct Action Buttons inside detail panels
    document.getElementById('btnPayWithLemonSqueezy')?.addEventListener('click', () => {
      this._launchLemonSqueezyCheckout();
    });

    document.getElementById('btnPayWithPayPal')?.addEventListener('click', () => {
      this._launchPayPalCheckout();
    });

    // Copy UPI ID button
    const btnCopyUpi = document.getElementById('btn-copy-upi-id');
    btnCopyUpi?.addEventListener('click', () => {
      const upiId = PAYMENT_CONFIG.upi.merchantVpa || 'varnams@upi';
      navigator.clipboard?.writeText(upiId).catch(() => {});
      btnCopyUpi.textContent = '✓ Copied!';
      setTimeout(() => { btnCopyUpi.textContent = '📋 Copy'; }, 2000);
    });

    // Link Google Email inside Checkout Modal
    const btnCheckoutLink = document.getElementById('btn-checkout-google-link');
    btnCheckoutLink?.addEventListener('click', () => {
      const email = prompt('Enter your Google email address to link your purchases:', economy.googleEmail || '');
      if (email) {
        const res = economy.linkGoogleAccount(email);
        if (res.success) {
          this._refreshAccountSyncDisplays();
          this._showCombo(`☁️ LINKED TO ${res.email.toUpperCase()}`);
        } else {
          alert(res.message);
        }
      }
    });

    // Redeem Alpha / VIP Pass Code in Vault Tab
    const btnRedeem = document.getElementById('btn-redeem-tester-code');
    btnRedeem?.addEventListener('click', () => {
      const inputEl = document.getElementById('input-tester-code');
      const rawCode = inputEl?.value || '';
      const check = economy.validatePassCode(rawCode);

      if (!check.valid) {
        alert(check.message || 'Invalid Pass Code');
        return;
      }

      if (check.tier === 'VIP') {
        const act = economy.activatePassCode(check.code, 'vip');
        if (act.success) {
          if (inputEl) inputEl.value = '';
          this.audio?.playPalaceFanfare();
          this._updateWalletDisplays();
          this._renderShopCatalog();
          this._renderBlastersCatalog();
          this._renderTreasuryCatalog();
          this._triggerFlyingCoins(25);
          alert('🎉 VIP Pass Activated! All Blasters, VIP Arsenal & Coins Unlocked!');
          if (act.receipt) {
            this._openReceiptModal(act.receipt);
          }
        }
      } else if (check.tier === 'ALPHA') {
        this._openCheckout({
          id: 'alpha_tester_pass',
          isAlphaPass: true,
          passCode: check.code,
          name: `Alpha Tester Pass (${check.code})`,
          icon: '🧪',
          amountInr: 1,
          amountUsd: 0.99,
          silver: 2500,
          gold: 50,
          unlocksVip: true,
          unlocksAllBlasters: true,
        });
      }
    });

    // Store Restore & Receipts Buttons
    document.getElementById('btn-store-restore')?.addEventListener('click', () => this._openRestoreModal());
    document.getElementById('restore-close-btn')?.addEventListener('click', () => {
      document.getElementById('restore-account-modal')?.classList.add('hidden');
    });

    document.getElementById('btn-store-receipts')?.addEventListener('click', () => {
      const latest = economy.getLatestReceipt();
      if (latest) {
        this._openReceiptModal(latest);
      } else {
        this._showCombo('🧾 NO DIGITAL RECEIPTS YET');
      }
    });

    // Restore Modal Actions
    document.getElementById('btn-modal-google-sync')?.addEventListener('click', () => {
      const emailEl = document.getElementById('restore-google-email');
      const statusEl = document.getElementById('restore-key-status');
      const res = economy.linkGoogleAccount(emailEl?.value || '');
      if (statusEl) {
        statusEl.style.display = 'block';
        statusEl.style.color = res.success ? '#34d399' : '#f87171';
        statusEl.textContent = res.success ? `✅ ${res.message}` : `❌ ${res.message}`;
      }
      if (res.success) {
        this._refreshAccountSyncDisplays();
        this._updateWalletDisplays();
      }
    });

    document.getElementById('btn-modal-restore-key')?.addEventListener('click', () => {
      const keyEl = document.getElementById('restore-key-input');
      const statusEl = document.getElementById('restore-key-status');
      const res = economy.transferAccountToThisDevice(keyEl?.value || '');
      if (statusEl) {
        statusEl.style.display = 'block';
        statusEl.style.color = res.success ? '#34d399' : '#f87171';
        statusEl.textContent = res.success ? `✅ ${res.message}` : `❌ ${res.message}`;
      }
      if (res.success) {
        this.audio?.playVictory();
        this._refreshAccountSyncDisplays();
        this._updateWalletDisplays();
        this._renderShopCatalog();
        this._renderBlastersCatalog();
      }
    });

    const copySyncHandler = (btnEl) => {
      const key = economy.syncKey || '';
      navigator.clipboard?.writeText(key).catch(() => {});
      if (btnEl) {
        const orig = btnEl.textContent;
        btnEl.textContent = '✓ COPIED!';
        setTimeout(() => { btnEl.textContent = orig; }, 2000);
      }
    };

    document.getElementById('btn-copy-my-sync-key')?.addEventListener('click', (e) => copySyncHandler(e.currentTarget));
    document.getElementById('profile-copy-key-btn')?.addEventListener('click', (e) => copySyncHandler(e.currentTarget));

    // Receipt Modal Actions
    document.getElementById('receipt-close-btn')?.addEventListener('click', () => {
      document.getElementById('receipt-modal')?.classList.add('hidden');
    });
    document.getElementById('receipt-done-btn')?.addEventListener('click', () => {
      document.getElementById('receipt-modal')?.classList.add('hidden');
    });

    document.getElementById('btn-copy-receipt')?.addEventListener('click', (e) => {
      const r = this._currentReceipt || economy.getLatestReceipt();
      if (!r) return;
      const text = [
        `=== VARNAMS DIGITAL RECEIPT ===`,
        `Game: ${r.game}`,
        `Receipt ID: ${r.txId}`,
        `Date: ${r.dateDisplay}`,
        `Item: ${r.itemName}`,
        `Amount: ${r.priceDisplay}`,
        `Method: ${r.method}`,
        `UTR / Ref: ${r.utr}`,
        `Support Backup Key: ${r.syncKey}`,
        `Support: ${economy.paymentConfig.supportEmail}`
      ].join('\n');
      navigator.clipboard?.writeText(text).catch(() => {});
      const btn = e.currentTarget;
      if (btn) {
        btn.textContent = '✓ Receipt Copied!';
        setTimeout(() => { btn.textContent = '📋 Copy Receipt'; }, 2000);
      }
    });

    document.getElementById('btn-email-receipt')?.addEventListener('click', () => {
      const r = this._currentReceipt || economy.getLatestReceipt();
      if (!r) return;
      const emailInput = document.getElementById('receipt-email-input');
      const userEmail = emailInput?.value?.trim() || economy.googleEmail || '';
      if (userEmail && userEmail.includes('@')) {
        economy.linkGoogleAccount(userEmail);
      }
      const subject = `Royal Smash 3D Purchase Confirmation - ${r.txId}`;
      const body = [
        `Hello Varnams Team,`,
        ``,
        `Please find my official digital purchase receipt for Royal Smash 3D:`,
        ``,
        `• Receipt / Transaction ID: ${r.txId}`,
        `• Date & Time: ${r.dateDisplay}`,
        `• Pack / Item Unlocked: ${r.itemName}`,
        `• Price Paid: ${r.priceDisplay}`,
        `• Payment Method: ${r.method}`,
        `• UTR / Reference: ${r.utr}`,
        `• Account Backup Key: ${r.syncKey}`,
        `• Player Name: ${r.playerName}`,
        userEmail ? `• Linked Email: ${userEmail}` : ``,
        ``,
        `Thank you,`,
        `${r.playerName}`
      ].filter(Boolean).join('\n');

      const toAddr = economy.paymentConfig.supportEmail || 'support@varnams.in';
      const ccParam = (userEmail && userEmail.includes('@')) ? `&cc=${encodeURIComponent(userEmail)}` : '';
      const mailtoUrl = `mailto:${toAddr}?subject=${encodeURIComponent(subject)}${ccParam}&body=${encodeURIComponent(body)}`;
      window.location.href = mailtoUrl;
    });
  }

  _refreshAccountSyncDisplays() {
    const key = economy.syncKey || 'VARNAM-XXXX-YY';
    const email = economy.googleEmail || '';

    const elIds = ['checkout-sync-key', 'restore-my-sync-key', 'profile-sync-key'];
    elIds.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.textContent = key;
    });

    const checkoutEmail = document.getElementById('checkout-account-email');
    if (checkoutEmail && email) checkoutEmail.value = email;

    const checkoutStatus = document.getElementById('checkout-account-status');
    if (checkoutStatus) {
      if (email) {
        checkoutStatus.style.color = '#34d399';
        checkoutStatus.textContent = `✅ Linked to ${email} · Backup Key: ${key}`;
      } else {
        checkoutStatus.style.color = '#94a3b8';
        checkoutStatus.textContent = `Backup Key: ${key} (Single Active Device Policy)`;
      }
    }
  }

  _openRestoreModal() {
    this._refreshAccountSyncDisplays();
    const emailEl = document.getElementById('restore-google-email');
    if (emailEl && economy.googleEmail) emailEl.value = economy.googleEmail;
    const statusEl = document.getElementById('restore-key-status');
    if (statusEl) statusEl.style.display = 'none';
    document.getElementById('restore-account-modal')?.classList.remove('hidden');
  }

  _openReceiptModal(receipt) {
    if (!receipt) return;
    this._currentReceipt = receipt;
    const setTxt = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    };
    setTxt('receipt-tx-id', receipt.txId);
    setTxt('receipt-date', receipt.dateDisplay);
    setTxt('receipt-item', receipt.itemName);
    setTxt('receipt-price', receipt.priceDisplay);
    setTxt('receipt-method', receipt.method);
    setTxt('receipt-utr', receipt.utr);
    setTxt('receipt-sync-key', receipt.syncKey);

    const emailInput = document.getElementById('receipt-email-input');
    if (emailInput) {
      emailInput.value = receipt.email || economy.googleEmail || '';
    }

    document.getElementById('receipt-modal')?.classList.remove('hidden');
  }

  _openCheckout(packOrId) {
    let pack = null;
    if (typeof packOrId === 'string') {
      pack = (economy.vipPasses && economy.vipPasses.find(p => p.id === packOrId)) || economy.coinPacks.find(p => p.id === packOrId);
    } else {
      pack = packOrId;
    }
    if (!pack) return;
    this._selectedCheckoutPack = pack;

    const isAlpha = Boolean(pack.isAlphaPass || pack.id === 'alpha_tester_pass');
    const displayPrice = isAlpha ? '₹1' : economy.getPackPrice(pack);
    const amountInr = pack.amountInr || 49;
    const upiId = PAYMENT_CONFIG.upi.merchantVpa || 'varnams@upi';
    const merchantName = PAYMENT_CONFIG.upi.merchantName || 'Varnams';

    const iconEl = document.getElementById('checkout-item-icon');
    const nameEl = document.getElementById('checkout-item-name');
    const subEl = document.getElementById('checkout-item-sub');
    const priceEl = document.getElementById('checkout-item-price');
    const origPriceEl = document.getElementById('checkoutProductOrigPrice');
    const discountNoticeEl = document.getElementById('checkoutDiscountNotice');
    const upiExactEl = document.getElementById('checkoutUpiExactAmount');
    const upiTxtEl = document.getElementById('checkout-upi-id-txt');
    const utrInput = document.getElementById('checkout-utr-input');

    if (iconEl) iconEl.textContent = pack.icon || '👑';
    if (nameEl) nameEl.textContent = pack.name;
    if (subEl) {
      if (pack.description) {
        subEl.textContent = pack.description;
      } else if (isAlpha) {
        subEl.textContent = '👑 Full VIP Arsenal + All Blasters + 2,500 Silver + 50 Gold';
      } else {
        subEl.textContent = `⚪ +${(pack.silver || 0).toLocaleString()} Silver, 🪙 +${(pack.gold || 0).toLocaleString()} Gold${pack.unlocksVip ? ' + 👑 VIP PASS' : ''}`;
      }
    }
    if (priceEl) priceEl.textContent = displayPrice;
    if (origPriceEl) {
      const orig = economy.paymentConfig.currency === 'INR' ? (pack.origPriceInr || '') : (pack.origPriceUsd || '');
      origPriceEl.textContent = orig;
      origPriceEl.style.display = orig ? 'block' : 'none';
    }
    if (discountNoticeEl) {
      discountNoticeEl.textContent = pack.discountBadge ? `🎉 ${pack.discountBadge} Active` : '🎉 50% Launch Discount Active';
    }
    if (upiExactEl) upiExactEl.textContent = `₹${amountInr}`;
    if (upiTxtEl) upiTxtEl.textContent = upiId;
    if (utrInput) utrInput.value = '';

    // Build UPI URI & Render Live Offline QR Code (identical to Chess Game)
    const txNote = `RoyalSmash ${pack.name}`;
    const upiParams = `pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(merchantName)}&am=${amountInr}.00&cu=INR&tn=${encodeURIComponent(txNote)}`;
    const upiUri = `upi://pay?${upiParams}`;

    const qrBox = document.getElementById('checkout-upi-qr');
    if (qrBox) {
      qrBox.innerHTML = '';
      if (typeof window.QRCode === 'function') {
        try {
          new window.QRCode(qrBox, {
            text: upiUri,
            width: 144,
            height: 144,
            colorDark: '#0f172a',
            colorLight: '#ffffff',
          });
        } catch (e) {
          qrBox.textContent = upiId;
        }
      } else {
        qrBox.textContent = upiId;
      }
    }

    // Wire 1-Tap UPI Deep Links (GPay / PhonePe / Paytm)
    const gpayEl = document.getElementById('btn-pay-gpay');
    const phonepeEl = document.getElementById('btn-pay-phonepe');
    const paytmEl = document.getElementById('btn-pay-paytm');
    if (gpayEl) gpayEl.href = `tez://upi/pay?${upiParams}`;
    if (phonepeEl) phonepeEl.href = `phonepe://pay?${upiParams}`;
    if (paytmEl) paytmEl.href = `paytmmp://pay?${upiParams}`;

    // Detect device for Apple Pay vs Card wording on Lemon Squeezy
    const isAppleDevice = /Mac|iPhone|iPad|iPod/.test(navigator.userAgent || '');
    const lemonIconEl = document.getElementById('btnLemonIcon');
    const lemonTextEl = document.getElementById('btnLemonText');
    if (lemonIconEl && lemonTextEl) {
      if (isAppleDevice) {
        lemonIconEl.textContent = '';
        lemonTextEl.textContent = 'Pay with Apple Pay';
      } else {
        lemonIconEl.textContent = '💳';
        lemonTextEl.textContent = 'Pay with Card';
      }
    }

    // Default select UPI for India, Lemon Squeezy for Global
    const defaultMethod = (economy.paymentConfig.currency === 'INR') ? 'upi' : 'lemonsqueezy';
    this._selectPaymentMethod(defaultMethod);

    this._refreshAccountSyncDisplays();
    this.$.checkoutModal?.classList.remove('hidden');
  }

  _closeCheckout(force = false) {
    if (this._storeOpenedFromContinue && !force) {
      const typeLabel = (this._continueType === 'time') ? 'TIME' : 'SHOTS';
      this._showConfirmModal({
        icon: '⚠️',
        title: 'CLOSE PAYMENT & REFILL?',
        msg: 'Do you confirm if you want to close? You will need to start the level again.',
        yesText: '✕ YES, CLOSE & RESTART LEVEL',
        noText: `◀ NO, RETURN TO BUY ${typeLabel}`,
        yesDanger: true,
        onYes: () => {
          this._storeOpenedFromContinue = false;
          this._pendingContinue = null;
          this.$.checkoutModal?.classList.add('hidden');
          this.$.shopModal?.classList.add('hidden');
          this.$.needCoinsModal?.classList.add('hidden');
          this._startLevel(this.levelIdx);
        },
        onNo: () => {
          this._storeOpenedFromContinue = false;
          this.$.checkoutModal?.classList.add('hidden');
          this.$.shopModal?.classList.add('hidden');
          this.$.needCoinsModal?.classList.add('hidden');
          const standing = this.gameObjs.filter(o => o.isCan && !o.fallen).length;
          this._openContinueModal(this._continueType || 'shots', standing, this._continueOrigin === 'midgame');
        }
      });
      return;
    }

    this.$.checkoutModal?.classList.add('hidden');
    this._selectedCheckoutPack = null;
  }

  _deliverPurchasedPack(pack, paymentMeta = {}) {
    let res;
    if (pack.isAlphaPass && pack.passCode) {
      res = economy.activatePassCode(pack.passCode, 'alpha');
    } else {
      res = economy.buyCoinPack(pack.id, paymentMeta);
    }

    this._closeCheckout();
    this._closeShop(true);

    if (res && res.success) {
      this.audio?.playVictory();
      const vipMsg = (pack.unlocksVip || pack.isAlphaPass) ? ' + 👑 VIP PASS' : '';
      this._showCombo(`👑 +${(pack.silver || 0).toLocaleString()} Silver & +${pack.gold || 0} Gold${vipMsg} Delivered!`);
      this._updateWalletDisplays();
      this._updateAmmoStockDisplay();
      this._renderShopCatalog();
      this._renderBlastersCatalog();
      this._renderTreasuryCatalog();
      this._triggerFlyingCoins(20);

      // If player was attempting to buy a continue when out of shots/time, auto-complete the continue!
      if (this._pendingContinue) {
        const cont = this._pendingContinue;
        this._pendingContinue = null;
        const ok = economy.buyContinue(cont.type, cont.useGold, this._continueCount);
        if (ok) {
          this._continueCount++;
          this.$.continueModal?.classList.add('hidden');
          this._applyContinueReward(cont.type);
          this._updateWalletDisplays();
        } else {
          this.$.continueModal?.classList.remove('hidden');
        }
      }

      // Open Digital Receipt Modal
      if (res.receipt) {
        setTimeout(() => this._openReceiptModal(res.receipt), 450);
      }
    }
  }

  _confirmCheckout() {
    if (!this._selectedCheckoutPack) return;
    const pack = this._selectedCheckoutPack;

    if (this._currentPayMethod === 'lemonsqueezy') {
      this._launchLemonSqueezyCheckout();
      return;
    }
    if (this._currentPayMethod === 'paypal') {
      this._launchPayPalCheckout();
      return;
    }

    // Direct UPI / Google Play confirmation flow
    const btn = document.getElementById('checkout-confirm-btn');
    const btnLbl = document.getElementById('checkout-btn-label');
    const utrInput = document.getElementById('checkout-utr-input');
    const rawUtr = utrInput?.value?.trim() || '';

    // Check if player entered an Alpha/VIP code directly into the UTR box!
    if (rawUtr) {
      const codeCheck = economy.validatePassCode(rawUtr);
      if (codeCheck.valid && codeCheck.tier === 'VIP') {
        const act = economy.activatePassCode(codeCheck.code, 'vip');
        this._closeCheckout();
        this._closeShop(true);
        if (act.success) {
          this.audio?.playPalaceFanfare();
          this._updateWalletDisplays();
          this._renderShopCatalog();
          this._renderBlastersCatalog();
          this._renderTreasuryCatalog();
          this._triggerFlyingCoins(25);
          if (act.receipt) setTimeout(() => this._openReceiptModal(act.receipt), 400);
        }
        return;
      }
    }

    const methodLabel = this._currentPayMethod === 'googleplay'
      ? 'Google Play Billing'
      : (this._currentPayMethod === 'lemonsqueezy' ? 'Apple Pay & Card (Lemon Squeezy)' : (this._currentPayMethod === 'paypal' ? 'PayPal Gateway' : 'Direct UPI (varnams@upi)'));

    const utrRef = rawUtr || `UPI-${Date.now().toString().slice(-8)}`;

    if (btnLbl) btnLbl.textContent = '⏳ Verifying Varnams Vault...';
    if (btn) btn.disabled = true;

    setTimeout(() => {
      if (btn) btn.disabled = false;
      this._deliverPurchasedPack(pack, {
        method: methodLabel,
        utr: utrRef,
      });
    }, 450);
  }

  // ─── 🎁 7-Day Daily Login Bonus UI ─────────────────────────────────────────
  _initDailyBonusUI() {
    document.getElementById('menu-daily-btn')?.addEventListener('click', () => this._openDailyBonusModal());
    document.getElementById('daily-bonus-close-btn')?.addEventListener('click', () => {
      document.getElementById('daily-bonus-modal')?.classList.add('hidden');
    });
    document.getElementById('daily-bonus-claim-btn')?.addEventListener('click', () => {
      // Immediately hide/close the gift screen upon claiming!
      document.getElementById('daily-bonus-modal')?.classList.add('hidden');
      const res = economy.claimDailyBonus();
      if (res.success) {
        this.audio?.playPalaceFanfare();
        economy.vibrate([30, 50, 40]);
        this._updateWalletDisplays();
        this._triggerFlyingCoins(18);
        this._showCombo(`🎁 DAY ${res.reward.day} LOGIN BONUS: ${res.reward.label.toUpperCase()}!`);
      }
    });
  }

  _openDailyBonusModal() {
    this._renderDailyBonusGrid();
    document.getElementById('daily-bonus-modal')?.classList.remove('hidden');
  }

  _renderDailyBonusGrid() {
    const grid = document.getElementById('daily-bonus-grid');
    const claimBtn = document.getElementById('daily-bonus-claim-btn');
    const subEl = document.getElementById('daily-bonus-sub');
    if (!grid) return;

    const catalog = economy.getDailyBonusCatalog();
    const canClaim = economy.canClaimDailyBonus();
    const curStreak = economy.dailyBonus?.streak || 0;
    const activeDay = canClaim ? ((curStreak % 7) + 1) : (curStreak > 0 ? ((curStreak - 1) % 7) + 1 : 1);

    grid.innerHTML = '';
    catalog.forEach(item => {
      const isClaimed = canClaim ? (item.day < activeDay) : (item.day <= activeDay && curStreak > 0);
      const isToday = (item.day === activeDay);
      const isDay7 = (item.day === 7);

      const cell = document.createElement('div');
      cell.style.cssText = `
        background:${isToday ? 'linear-gradient(135deg, rgba(245,158,11,0.32), rgba(217,119,6,0.2))' : (isClaimed ? 'rgba(16,185,129,0.15)' : 'rgba(15,23,42,0.65)')};
        border:${isToday ? '2px solid #fbbf24' : (isClaimed ? '1px solid rgba(52,211,153,0.4)' : '1px solid rgba(255,255,255,0.1)')};
        border-radius:10px;
        padding:${isDay7 ? '10px 12px' : '8px 4px'};
        text-align:center;
        ${isDay7 ? 'grid-column: span 2; display:flex; align-items:center; justify-content:center; gap:10px;' : ''}
      `;
      cell.innerHTML = `
        <div style="font-size:${isDay7 ? '1.6rem' : '1.25rem'};">${isClaimed ? '✅' : item.icon}</div>
        <div>
          <div style="font-size:0.65rem;font-weight:900;color:${isToday ? '#fde68a' : '#94a3b8'};">DAY ${item.day}${isToday && canClaim ? ' · TODAY' : ''}</div>
          <div style="font-size:0.72rem;font-weight:800;color:#fff;margin-top:2px;">${item.label}</div>
        </div>
      `;
      grid.appendChild(cell);
    });

    if (claimBtn) {
      if (canClaim) {
        claimBtn.disabled = false;
        claimBtn.style.opacity = '1';
        claimBtn.textContent = `🎁 CLAIM DAY ${activeDay} REWARD!`;
      } else {
        claimBtn.disabled = true;
        claimBtn.style.opacity = '0.6';
        claimBtn.textContent = `✓ TODAY'S BONUS CLAIMED (COME BACK TOMORROW)`;
      }
    }
    if (subEl) {
      subEl.textContent = canClaim
        ? `Day ${activeDay} of 7 is ready to claim!`
        : `Current Streak: ${curStreak} Day(s) · Next gift unlocks tomorrow!`;
    }
  }


  _updateWalletDisplays() {
    const s = economy.silverCoins;
    const g = economy.goldCoins;
    if (this.$.silverCoins) this.$.silverCoins.textContent = s;
    if (this.$.goldCoins)   this.$.goldCoins.textContent   = g;
    if (this.$.menuSilver)  this.$.menuSilver.textContent  = s;
    if (this.$.menuGold)    this.$.menuGold.textContent    = g;
    if (this.$.shopSilver)  this.$.shopSilver.textContent  = s;
    if (this.$.shopGold)    this.$.shopGold.textContent    = g;

    // Explicitly guarantee both Silver and Gold badges in the shop wallet row are visible
    const shopSilverBadge = document.getElementById('shop-wallet-silver');
    const shopGoldBadge = document.getElementById('shop-wallet-gold');
    if (shopSilverBadge) shopSilverBadge.style.display = 'flex';
    if (shopGoldBadge) shopGoldBadge.style.display = 'flex';

    this._updateAmmoStockDisplay();
  }

  _updateAmmoStockDisplay() {
    const isVip = economy.isPremiumUser();
    const updateBtn = (type, el) => {
      if (!el) return;
      const count = economy.getAmmoCount(type);
      const isPremium = PREMIUM_AMMO_TYPES.includes(type);
      const btn = document.getElementById(`ammo-${type}`);
      if (isPremium && !isVip && count <= 0) {
        btn?.classList.add('premium-locked');
        el.textContent = '🔒 VIP';
      } else {
        btn?.classList.remove('premium-locked');
        el.textContent = `x${count}`;
      }
    };

    updateBtn('bomb', this.$.stockBomb);
    updateBtn('heavy', this.$.stockHeavy);
    updateBtn('roller', this.$.stockRoller);
    updateBtn('slipper', this.$.stockSlipper);
    updateBtn('boot', this.$.stockBoot);
    updateBtn('splash', this.$.stockSplash);
    updateBtn('cluster', this.$.stockCluster);
  }

  // ─── VIP Custom Target Modal UI & Interactive Photo Cropper ────────────────
  _initVIPUI() {
    try {
      const vipBtn = document.getElementById('vip-btn');
      const vipModal = document.getElementById('vip-modal');
      const closeBtn = document.getElementById('vip-close-btn');
      const startBtn = document.getElementById('vip-start-btn');
      const fileInput = document.getElementById('photo-file-input');

      // Cropper DOM Elements
      const cropModal = document.getElementById('photo-crop-modal');
      const cropCanvas = document.getElementById('crop-canvas');
      const cropViewport = document.getElementById('crop-viewport-wrap');
      const cropZoomSlider = document.getElementById('crop-zoom-slider');
      const cropResetBtn = document.getElementById('crop-reset-btn');
      const cropCloseBtn = document.getElementById('crop-close-btn');
      const cropCancelBtn = document.getElementById('crop-cancel-btn');
      const cropConfirmBtn = document.getElementById('crop-confirm-btn');

      // Confirmation Popup DOM Elements
      const confirmModal = document.getElementById('photo-confirm-modal');
      const confirmImg = document.getElementById('photo-confirm-img');
      const confirmName = document.getElementById('photo-confirm-name');
      const btnPhotoChange = document.getElementById('btn-photo-change');
      const btnPhotoContinue = document.getElementById('btn-photo-continue');

      if (this.$.vipPreview) this.$.vipPreview.src = customTargets.previewUrl;

      vipBtn?.addEventListener('click', () => {
        vipModal?.classList.remove('hidden');
      });

      closeBtn?.addEventListener('click', () => {
        vipModal?.classList.add('hidden');
      });

      // Quick Target Presets (The Boss / My Ex / Rival / Custom Photo)
      const presetBtns = document.querySelectorAll('.vip-preset-btn[data-preset]');
      presetBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          presetBtns.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          const p = btn.getAttribute('data-preset');
          const nameInput = document.getElementById('target-name-input');
          let tName = 'The Boss';
          if (p === 'ex') tName = 'My Ex';
          else if (p === 'rival') tName = 'Rival Colleague';

          if (nameInput) nameInput.value = tName;
          customTargets.loadPreset(tName);
          if (this.$.vipPreview) this.$.vipPreview.src = customTargets.previewUrl;
          this.audio?.playCoinClink?.();
        });
      });

      document.getElementById('vip-btn-pick-custom')?.addEventListener('click', () => {
        fileInput?.click();
      });

      // ── Interactive Face Cropper Engine ──
      let cropImg = null;
      let cropScale = 1.0;
      let cropBaseScale = 1.0;
      let cropPanX = 0;
      let cropPanY = 0;
      let isDragging = false;
      let dragStartX = 0;
      let dragStartY = 0;
      let panStartX = 0;
      let panStartY = 0;

      const renderCropCanvas = () => {
        if (!cropCanvas || !cropImg) return;
        const ctx = cropCanvas.getContext('2d');
        const w = cropCanvas.width;
        const h = cropCanvas.height;

        ctx.fillStyle = '#0b0f19';
        ctx.fillRect(0, 0, w, h);

        ctx.save();
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // Translate to center + pan offset
        ctx.translate(w / 2 + cropPanX, h / 2 + cropPanY);
        const effScale = cropScale * cropBaseScale;
        ctx.scale(effScale, effScale);

        // Draw image centered
        ctx.drawImage(cropImg, -cropImg.width / 2, -cropImg.height / 2);
        ctx.restore();
      };

      const openCropperWithImage = (img) => {
        cropImg = img;
        if (!cropCanvas) return;
        const guideDiameter = cropCanvas.width * 0.78;
        const minDim = Math.min(img.width, img.height);
        cropBaseScale = (guideDiameter * 1.15) / minDim;
        cropScale = 1.0;
        cropPanX = 0;
        cropPanY = 0;
        if (cropZoomSlider) cropZoomSlider.value = '1.0';

        renderCropCanvas();
        cropModal?.classList.remove('hidden');
      };

      // File upload handler triggers cropper
      fileInput?.addEventListener('change', (e) => {
        const file = e.target.files?.[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (ev) => {
            const img = new Image();
            img.onload = () => {
              openCropperWithImage(img);
            };
            img.src = ev.target.result;
          };
          reader.readAsDataURL(file);
        }
      });

      // Cropper zoom slider
      cropZoomSlider?.addEventListener('input', (e) => {
        cropScale = parseFloat(e.target.value) || 1.0;
        renderCropCanvas();
      });

      // Cropper center reset
      cropResetBtn?.addEventListener('click', () => {
        cropPanX = 0;
        cropPanY = 0;
        cropScale = 1.0;
        if (cropZoomSlider) cropZoomSlider.value = '1.0';
        renderCropCanvas();
        this.audio?.playTick?.();
      });

      // Cropper Drag & Pan (Mouse + Touch)
      const onDragStart = (clientX, clientY) => {
        isDragging = true;
        dragStartX = clientX;
        dragStartY = clientY;
        panStartX = cropPanX;
        panStartY = cropPanY;
      };
      const onDragMove = (clientX, clientY) => {
        if (!isDragging) return;
        cropPanX = panStartX + (clientX - dragStartX);
        cropPanY = panStartY + (clientY - dragStartY);
        renderCropCanvas();
      };
      const onDragEnd = () => {
        isDragging = false;
      };

      cropViewport?.addEventListener('mousedown', (e) => onDragStart(e.clientX, e.clientY));
      window.addEventListener('mousemove', (e) => onDragMove(e.clientX, e.clientY));
      window.addEventListener('mouseup', onDragEnd);

      cropViewport?.addEventListener('touchstart', (e) => {
        if (e.touches.length === 1) {
          onDragStart(e.touches[0].clientX, e.touches[0].clientY);
        }
      }, { passive: true });
      window.addEventListener('touchmove', (e) => {
        if (isDragging && e.touches.length === 1) {
          onDragMove(e.touches[0].clientX, e.touches[0].clientY);
        }
      }, { passive: true });
      window.addEventListener('touchend', onDragEnd);

      // Cropper cancel buttons
      const closeCropper = () => {
        cropModal?.classList.add('hidden');
      };
      cropCloseBtn?.addEventListener('click', closeCropper);
      cropCancelBtn?.addEventListener('click', closeCropper);

      // Confirm crop: slice square centered on stencil circle & export
      cropConfirmBtn?.addEventListener('click', () => {
        if (!cropImg || !cropCanvas) return;
        const exportCanvas = document.createElement('canvas');
        exportCanvas.width = 512;
        exportCanvas.height = 512;
        const ectx = exportCanvas.getContext('2d');
        ectx.imageSmoothingEnabled = true;
        ectx.imageSmoothingQuality = 'high';

        const guideRadius = (cropCanvas.width * 0.78) / 2;
        const effScale = cropScale * cropBaseScale;

        ectx.translate(256, 256);
        const exportScaleFactor = 256 / guideRadius;
        ectx.scale(exportScaleFactor, exportScaleFactor);
        ectx.translate(cropPanX, cropPanY);
        ectx.scale(effScale, effScale);
        ectx.drawImage(cropImg, -cropImg.width / 2, -cropImg.height / 2);

        const targetName = document.getElementById('target-name-input')?.value?.trim() || 'Custom Boss';
        const currentStyle = document.querySelector('.vip-style-tab.active')?.getAttribute('data-style') || 'photo';

        customTargets.applyFilter(exportCanvas, targetName, currentStyle);
        if (this.$.vipPreview) this.$.vipPreview.src = customTargets.previewUrl;

        // Hide crop modal
        closeCropper();

        // Show Post-Selection Confirmation Popup!
        if (confirmImg) confirmImg.src = customTargets.previewUrl;
        if (confirmName) confirmName.textContent = targetName;
        confirmModal?.classList.remove('hidden');
        this.audio?.playSparkleBoom?.();
      });

      // ── Post-Selection Confirmation Popup Wiring ──
      btnPhotoChange?.addEventListener('click', () => {
        confirmModal?.classList.add('hidden');
        if (cropImg) {
          cropModal?.classList.remove('hidden');
        } else {
          fileInput?.click();
        }
      });

      btnPhotoContinue?.addEventListener('click', () => {
        const nameVal = document.getElementById('target-name-input')?.value?.trim() || 'The Boss';
        const msgVal = document.getElementById('target-secret-msg-input')?.value?.trim();
        customTargets.targetName = nameVal;
        economy.setBossMode(true);
        customTargets.active = true;
        this._updateModeUI();

        if (msgVal && msgVal.length > 0) {
          localStorage.setItem('rsCustomSecretMessage', msgVal);
          localStorage.setItem('rsChapterWordIdx', '0');
        }

        // Hide all screens & modals
        confirmModal?.classList.add('hidden');
        vipModal?.classList.add('hidden');
        document.getElementById('onboarding-screen')?.classList.add('hidden');
        document.getElementById('menu-screen')?.classList.add('hidden');

        // Launch directly into game!
        this._initWordReveal();
        this._startLevel(0);
      });

      // Avatar Style Selector Tabs (Realistic, Cartoon, Gold Statue)
      const styleTabs = document.querySelectorAll('.vip-style-tab');
      styleTabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
          e.preventDefault();
          styleTabs.forEach(t => t.classList.remove('active'));
          tab.classList.add('active');
          const style = tab.getAttribute('data-style');
          customTargets.setFilter(style);
          if (this.$.vipPreview) this.$.vipPreview.src = customTargets.previewUrl;
          this.audio?.playCombo?.();
        });
      });

      // Quick Name Chips
      const chips = document.querySelectorAll('.vip-chip');
      chips.forEach(chip => {
        chip.addEventListener('click', () => {
          chips.forEach(c => c.classList.remove('active'));
          chip.classList.add('active');
          const targetInput = document.getElementById('target-name-input');
          const nameVal = chip.getAttribute('data-name');
          if (targetInput) targetInput.value = nameVal;
          customTargets.targetName = nameVal;
          this.audio?.playCoinClink?.();
        });
      });

      // Quick Secret Message Chips
      const msgChips = document.querySelectorAll('.vip-msg-chip');
      msgChips.forEach(chip => {
        chip.addEventListener('click', () => {
          const msgInput = document.getElementById('target-secret-msg-input');
          if (msgInput) msgInput.value = chip.getAttribute('data-msg');
          this.audio?.playCoinClink?.();
        });
      });

      startBtn?.addEventListener('click', () => {
        const nameVal = document.getElementById('target-name-input')?.value?.trim() || 'The Boss';
        const msgVal = document.getElementById('target-secret-msg-input')?.value?.trim();
        customTargets.targetName = nameVal;
        economy.setBossMode(true);
        customTargets.active = true;
        this._updateModeUI();

        if (msgVal && msgVal.length > 0) {
          localStorage.setItem('rsCustomSecretMessage', msgVal);
          localStorage.setItem('rsChapterWordIdx', '0');
        } else {
          localStorage.removeItem('rsCustomSecretMessage');
        }

        this._initWordReveal();
        vipModal?.classList.add('hidden');
        document.getElementById('onboarding-screen')?.classList.add('hidden');
        this._startLevel(0);
      });
    } catch(e) {
      console.warn('[VIP] UI error:', e);
    }
  }


  // ─── Screen Transitions ────────────────────────────────────────────────────
  _showOnly(...ids) {
    ['hud', 'companySplash', 'loading', 'onboarding', 'menu', 'win', 'palaceVictory', 'lose', 'vipModal', 'shopModal', 'needCoinsModal', 'profileModal', 'leaderboardModal', 'continueModal', 'confirmModal', 'welcomeModal', 'settingsModal', 'adOverlay', 'goldOverlay', 'starChestModal', 'heartsModal', 'kingdomModal'].forEach(id => {
      const el = this.$[id];
      if (el) el.classList.toggle('hidden', !ids.includes(id));
    });

    // Ensure magical word reveal panel is never visible underneath non-HUD modal screens
    if (!ids.includes('hud') || this.state !== S.PLAYING) {
      document.getElementById('word-reveal-panel')?.classList.add('hidden');
    }
  }

  // ─── Royal Confirmation / Prompt Modal ──────────────────────────────────────
  _showConfirmModal({ icon = '👑', title = 'CONFIRM', msg = 'Are you sure?', yesText = 'YES', noText = 'CANCEL', yesDanger = false, onYes, onNo }) {
    const modal = this.$.confirmModal || document.getElementById('confirm-modal');
    if (!modal) return;
    const iconEl = document.getElementById('confirm-modal-icon');
    const titleEl = document.getElementById('confirm-modal-title');
    const msgEl = document.getElementById('confirm-modal-msg');
    const yesBtn = document.getElementById('confirm-modal-yes-btn');
    const noBtn = document.getElementById('confirm-modal-no-btn');

    if (iconEl) iconEl.textContent = icon;
    if (titleEl) titleEl.textContent = title;
    if (msgEl) msgEl.textContent = msg;

    if (yesBtn) {
      yesBtn.textContent = yesText;
      yesBtn.style.background = yesDanger
        ? 'linear-gradient(135deg, #ef4444, #dc2626)'
        : 'linear-gradient(135deg, #22c55e, #16a34a)';
      yesBtn.onclick = () => {
        this._closeConfirmModal();
        if (typeof onYes === 'function') onYes();
      };
    }

    if (noBtn) {
      noBtn.textContent = noText;
      noBtn.onclick = () => {
        this._closeConfirmModal();
        if (typeof onNo === 'function') onNo();
      };
    }

    modal.classList.remove('hidden');
  }

  _closeConfirmModal() {
    const modal = this.$.confirmModal || document.getElementById('confirm-modal');
    if (modal) modal.classList.add('hidden');
  }

  _goMenu() {
    this.state = S.MENU;
    this._stopPalaceCelebrationCanvas();
    this._updateWalletDisplays();
    this._updateSoundUI();
    this._updateVibrationUI();
    this._updateModeUI();
    this._showOnly('menu');
    // Note: Daily Bonus (Claim Day 1) is intentionally deferred to a later stage (Stage 2+)
    // so the initial launch & menu experience stays clean and uninterrupted!
  }

  _getSpeedMult(type = this.ammoType) {
    if (type === 'bomb') return 1.05;
    if (type === 'heavy') return 0.92;
    if (type === 'roller') return 1.15;
    if (type === 'slipper') return 1.10;
    if (type === 'boot') return 0.90;
    if (type === 'splash') return 1.02;
    if (type === 'cluster') return 1.20;
    return 1.0;
  }

  // ─── Level Lifecycle ───────────────────────────────────────────────────────
  _startLevel(idx) {
    try {
      this.audio?.resume();

      // ❤️ Check Royal Hearts (Lives / Energy)
      economy.updateHearts();
      if (economy.hearts <= 0) {
        this._openHeartsModal();
        return;
      }

      this.levelIdx       = idx;
      const lvlData       = LEVELS[idx] || LEVELS[0];
      this.shotsLeft      = lvlData.shots;
      
      const baseTime      = lvlData.timeLimit || 60;
      const carriedTime   = this._carriedTime || 0;
      this.timeLeft       = Math.min(90, baseTime + carriedTime);
      this._carriedTime   = 0;
      
      this._timerRunning  = true;
      this._continueCount = 0;
      this._adContinueUsedThisLevel = false;
      this.score          = 0;
      this._gameResolved  = false;
      this._hasFired      = false;
      this._inputCooldown = Date.now() + 400;
      if (this._lastShotDepletedTimer) {
        clearTimeout(this._lastShotDepletedTimer);
        this._lastShotDepletedTimer = null;
      }

      // 🌊 Multi-Wave Stage Initialization
      this.currentWave = 1;
      this.totalWaves = lvlData.totalWaves || 1;

      this._clearLevel();

      // Strictly sync Revenge / Boss Mode vs Standard Kingdom Mode
      customTargets.active = Boolean(economy.bossModeContinuous);
      this._updateWordRevealVisibility();

      // Automatically rotate castle structure material palette every stage,
      // and rotate Live Animated Background every 3 stages!
      setStageStructureNumber(idx + 1);
      this.engine.applyTheme(lvlData.theme || 'coast', idx + 1);


      this.platformAngle = 0;
      this.pedestal = createPedestal(
        this.engine.scene, this.physics, { x: 0, y: 0, z: 0 },
        lvlData.theme || 'coast', lvlData.platShape || 'rect', lvlData.rotSpeed || 0
      );
      this.platformY = this.pedestal.platformY;

      this._buildLevel(lvlData, this.currentWave);
      this.physics.sleepAll();

      // 🏆 Crown Rush Win-Streak Boosters (Royal Match Engine)
      const bonuses = economy.getStreakBonuses();
      if (bonuses.extraShots > 0) {
        this.shotsLeft += bonuses.extraShots;
      }
      if (bonuses.freeBomb) {
        economy.addAmmo('bomb', 1);
      }
      if (bonuses.freeCluster) {
        economy.addAmmo('cluster', 1);
      }
      if (bonuses.freeFeverBall) {
        economy.addAmmo('bomb', 1);
      }
      this._isFeverShot = false; // Always start with pure authentic Cast-Iron Ball
      if (bonuses.streak > 0) {
        setTimeout(() => {
          let perksMsg = `🔥 CROWN STREAK ${bonuses.streak}: +${bonuses.extraShots} SHOTS`;
          if (bonuses.freeBomb) perksMsg += ' · FREE BOMB';
          this._showCombo(perksMsg);
        }, 700);
      }

      // 🎁 "Try Before You Buy" VIP Weapon Teaser (Level 3: Slipper, Level 7: Cluster Rocket)
      let teaserType = null;
      if (idx === 2 && !this._teasedSlipper && !economy.isPremiumUser() && economy.getAmmoCount('slipper') === 0) {
        this._teasedSlipper = true;
        economy.addAmmo('slipper', 1);
        teaserType = 'slipper';
      } else if (idx === 6 && !this._teasedCluster && !economy.isPremiumUser() && economy.getAmmoCount('cluster') === 0) {
        this._teasedCluster = true;
        economy.addAmmo('cluster', 1);
        teaserType = 'cluster';
      }

      // Aim hint: show on first 2 levels, otherwise dismiss
      const aimHint = document.getElementById('aim-hint');
      if (aimHint) {
        if (idx <= 1) aimHint.classList.remove('dismissed');
        else aimHint.classList.add('dismissed');
      }

      this.cannon = new RoyalCannon(this.engine.scene, this.engine.camera, economy.equippedBlaster || 'royal');
      this.cannon.updateLayout(window.innerWidth / window.innerHeight);
      this.cannon.setTargetObjects(this.gameObjs);

      // Default ammo is Cast-Iron Ball (or auto-equipped Teaser on Level 3 / Level 7)
      this.ammoType = teaserType || 'normal';
      document.querySelectorAll('.ammo-btn').forEach(b => b.classList.remove('active'));
      document.getElementById(`ammo-${this.ammoType}`)?.classList.add('active');

      const speedMult = this._getSpeedMult(this.ammoType);
      this.cannon.setAmmoType(this.ammoType, speedMult);
      this.cannon.showTrajectory(true);
      this._updateBlasterHUDIcon();

      if (teaserType) {
        setTimeout(() => {
          const label = teaserType === 'slipper' ? 'FLYING SLIPPER 🩴' : 'CLUSTER ROCKET 🚀';
          this._showCombo(`🎁 FREE VIP TEASER: 1x ${label} READY TO FIRE!`);
        }, 950);
      }

      if (this.$.stageBanner) {
        if (this.$.stageNum) this.$.stageNum.textContent = `LEVEL ${idx + 1} · ${(lvlData.theme || 'COAST').toUpperCase()}`;
        if (this.$.stageName) this.$.stageName.textContent = (lvlData.name || 'ROYAL SMASH').toUpperCase();
        this.$.stageBanner.classList.remove('hidden');
        this.$.stageBanner.style.animation = 'none';
        this.$.stageBanner.offsetHeight;
        this.$.stageBanner.style.animation = '';
        setTimeout(() => this.$.stageBanner?.classList.add('hidden'), 2300);
      }

      if ((economy.bossModeContinuous || customTargets.active) && this.$.ctHud) {
        this.$.ctHud.classList.remove('hidden');
        const ctNameEl = document.getElementById('ct-name');
        if (ctNameEl) ctNameEl.textContent = (customTargets.targetName || 'THE BOSS').toUpperCase();
      } else if (this.$.ctHud) {
        this.$.ctHud.classList.add('hidden');
      }

      this._initBossCam();

      this._updateWalletDisplays();
      this._updateProfileDisplays();
      this._updateHUD();
      this._updateSoundUI();
      this._updateVibrationUI();
      this._updateModeUI();

      // First-time player walkthrough introduction
      if (idx === 0 && !localStorage.getItem('royal_smash_tutorial_seen')) {
        setTimeout(() => this._openTutorial(0), 400);
      }

      this._showOnly('hud');
      this.state = S.PLAYING;
    } catch(err) {
      console.error('[RoyalSmash] Error starting level:', err);
    }
  }

  _clearLevel() {
    this._stopPalaceCelebrationCanvas();
    this.gameObjs.forEach(o => {
      o.removeOverlay?.();   // ← Remove any DOM face overlay before level disposal
      disposeObj(this.engine.scene, this.physics, o);
    });

    this.gameObjs = [];
    this.balls.forEach(b => disposeObj(this.engine.scene, this.physics, b));
    this.balls = [];

    if (this.pedestal?.mesh) {
      this.engine.scene.remove(this.pedestal.mesh);
      this.pedestal = null;
    }

    if (this.cannon) { this.cannon.dispose(); this.cannon = null; }
    this.particles?.clear();
    this.physics.reset();
  }

  _buildLevel(levelData, waveNum = 1) {
    const lvlTheme = levelData.theme || 'coast';
    const items = typeof levelData.buildWave === 'function'
      ? levelData.buildWave(waveNum, this.platformY)
      : levelData.build(this.platformY);
    items.forEach(item => {
      let obj;
      switch (item.type) {
        case 'putla': {
          const putlaParts = createBossPutla(this.engine.scene, this.physics, item.pos, item.sizeScale || 1.0);
          putlaParts.forEach(part => {
            this.gameObjs.push({
              ...part,
              fallen: false,
              clearedFromTable: false,
              fallTime: 0,
              isAnchored: true,
              initialPos: { ...part.initialPos },
            });
          });
          break;
        }
        case 'boss_block':
          obj = createMiniBossBlock(this.engine.scene, this.physics, item.pos);
          break;
        case 'boss_can':
          obj = createMiniBossCan(this.engine.scene, this.physics, item.pos);
          break;
        case 'mosaic':
          obj = createPhotoMosaicBlock(
            this.engine.scene, this.physics, item.pos,
            item.col, item.row, item.totalCols, item.totalRows,
            item.sizeX, item.sizeY
          );
          break;
        case 'tall_pillar':
          obj = createTallPillar(this.engine.scene, this.physics, item.pos, lvlTheme);
          break;
        case 'wide_block':
          obj = createWideBlock(this.engine.scene, this.physics, item.pos, lvlTheme);
          break;
        case 'octagon_tower':
          obj = createOctagonTower(this.engine.scene, this.physics, item.pos, lvlTheme);
          break;
        case 'royal_dome':
          obj = createRoyalDome(this.engine.scene, this.physics, item.pos, lvlTheme);
          break;
        case 'powder_keg':
          obj = createPowderKeg(this.engine.scene, this.physics, item.pos);
          break;
        case 'pink_can':
          obj = createPinkCan(this.engine.scene, this.physics, item.pos);
          break;
        case 'blue_can':
          obj = createRoyalCan(this.engine.scene, this.physics, item.pos, 'blue');
          break;
        case 'jade_can':
        case 'jade_urn':
          obj = createJadeUrn(this.engine.scene, this.physics, item.pos);
          break;
        case 'obsidian_can':
          obj = createRoyalCan(this.engine.scene, this.physics, item.pos, 'obsidian');
          break;
        case 'barrel':
          obj = createOakBarrel(this.engine.scene, this.physics, item.pos);
          break;
        case 'bronze_urn':
          obj = createBronzeUrn(this.engine.scene, this.physics, item.pos);
          break;
        case 'plasma_can':
          obj = createPlasmaCan(this.engine.scene, this.physics, item.pos);
          break;
        case 'gold_ingot':
          obj = createGoldIngotCan(this.engine.scene, this.physics, item.pos);
          break;
        case 'timber_block':
          obj = createTimberBlock(this.engine.scene, this.physics, item.pos);
          break;
        case 'terracotta_block':
          obj = createTerracottaBlock(this.engine.scene, this.physics, item.pos);
          break;
        case 'marble_block':
          obj = createMarbleBlock(this.engine.scene, this.physics, item.pos);
          break;
        case 'obsidian_block':
          obj = createObsidianBlock(this.engine.scene, this.physics, item.pos);
          break;
        case 'bamboo_crate':
          obj = createBambooCrate(this.engine.scene, this.physics, item.pos);
          break;
        case 'iron_vault':
          obj = createIronVaultBlock(this.engine.scene, this.physics, item.pos);
          break;
        case 'pinwheel':
          obj = createPinwheelBlock(this.engine.scene, this.physics, item.pos);
          break;
        case 'fleur':
          obj = createThemedBlock(this.engine.scene, this.physics, item.pos, lvlTheme);
          break;
        case 'can':
          obj = item.colorTheme
            ? createRoyalCan(this.engine.scene, this.physics, item.pos, item.colorTheme)
            : createThemedCan(this.engine.scene, this.physics, item.pos, lvlTheme);
          break;
        case 'fleur_can':
          obj = createFleurCan(this.engine.scene, this.physics, item.pos);
          break;
        case 'hcan':
          obj = createHorizontalCan(this.engine.scene, this.physics, item.pos);
          break;
        case 'beam':
          obj = createThemedBeam(this.engine.scene, this.physics, item.pos, item.width ?? 3.5, lvlTheme);
          break;
        case 'block':
          obj = createThemedBlock(this.engine.scene, this.physics, item.pos, lvlTheme);
          break;
        case 'spire':
          obj = createThemedSpire(this.engine.scene, this.physics, item.pos, lvlTheme);
          break;
        case 'crystal_spire':
          obj = createCrystalSpire(this.engine.scene, this.physics, item.pos);
          break;
      }
      if (obj) {
        this.gameObjs.push({
          ...obj,
          fallen: false,
          clearedFromTable: false,
          fallTime: 0,
          isAnchored: true,
          initialPos: { x: item.pos.x, y: item.pos.y, z: item.pos.z || 0 },
        });
      }
    });
  }

  _wakeAllStructures() {
    const rotSpd = this.pedestal?.rotSpeed || 0;
    this.gameObjs.forEach(o => {
      if (o.isAnchored) {
        o.isAnchored = false;
        if (o.body) {
          const px = o.body.position.x;
          const pz = o.body.position.z;
          o.body.velocity.set(-pz * rotSpd, 0, px * rotSpd);
          o.body.wakeUp();
        }
      }
    });
    this.physics.wakeUpAll();
  }

  _fire() {
    if (this.state !== S.PLAYING || this.shotsLeft <= 0) return;
    const now = Date.now();
    if (now - (this._lastFireTime || 0) < 450) return;
    if (now < this._inputCooldown) return;
    this._lastFireTime = now;
    this._inputCooldown = now + 450;

    this._hasFired = true;
    document.getElementById('aim-hint')?.classList.add('dismissed');
    economy.vibrate(25);

    let selectedType = this.ammoType || 'normal';
    if (this._isFeverShot) {
      selectedType = 'fever';
      this._isFeverShot = false;
      this._showCombo('👑 ROYAL FEVER OVERCHARGE FIRED! ⚡');
    }

    if (selectedType !== 'normal' && selectedType !== 'fever') {
      const consumed = economy.consumeAmmo(selectedType);
      if (!consumed) {
        selectedType = 'normal';
      }
      this._updateAmmoStockDisplay();

      // Automatically revert to standard Iron Ball after firing any special shot!
      this.ammoType = 'normal';
      document.querySelectorAll('.ammo-btn').forEach(b => b.classList.remove('active'));
      document.getElementById('ammo-normal')?.classList.add('active');
      const speedMult = this._getSpeedMult('normal');
      this.cannon?.setAmmoType('normal', speedMult);
    }

    this.shotsLeft--;
    this._currentShotKnocked = 0;
    this._updateHUD();

    if (selectedType === 'cluster') {
      this.audio?.playClusterLaunch();
    } else if (selectedType === 'fever') {
      this.audio?.playSparkleBoom();
    } else {
      this.audio?.playCannonFire();
    }

    const fireData = this.cannon.fire();
    const position = fireData.position;
    const velocity = fireData.velocity;
    const perks = fireData.perks || {};
    const isWeakSpot = fireData.isWeakSpot || false;
    const skinId = fireData.skinId || 'royal';

    const ball = createCannonball(this.engine.scene, this.physics, position, selectedType, skinId);

    const vSpeed = Math.hypot(velocity.x, velocity.y, velocity.z) || 1;
    ball.fireDir = {
      x: velocity.x / vSpeed,
      y: velocity.y / vSpeed,
      z: velocity.z / vSpeed,
    };

    ball.body.velocity.set(velocity.x, velocity.y, velocity.z);
    const isLast = (this.shotsLeft <= 0);
    ball.isLastBall = isLast;
    const ballObj = {
      ...ball,
      age: 0,
      hasSplit: false,
      hasHit: false,
      hitTime: 0,
      isLastBall: isLast,
      ballType: selectedType,
      perks,
      isWeakSpot,
      skinId,
      isFever: (selectedType === 'fever'),
    };
    this.balls.push(ballObj);
    this._attachBallCollision(ballObj);

    this.particles.createMuzzleFlash(position);
    if (skinId === 'dragon') {
      this.particles.createFireTrail(position);
    } else if (skinId === 'tesla') {
      this.particles.createPlasmaTrail(position);
    } else if (selectedType === 'fever') {
      this.particles.createFeverTrail(position);
    }
  }

  _wakeLocalStructures(hitPos, radius = 1.6) {
    const rotSpd = this.pedestal?.rotSpeed || 0;
    this.gameObjs.forEach(o => {
      if (!o.body) return;
      const bp = o.body.position;
      const dx = bp.x - hitPos.x;
      const dy = bp.y - hitPos.y;
      const dz = bp.z - hitPos.z;
      const dist = Math.hypot(dx, dy, dz);
      const horizDist = Math.hypot(dx, dz);

      // 1. Direct proximity to impact
      const isNearby = (dist <= radius);

      // 2. Vertical load-bearing cascade: any structures resting vertically above
      // the impacted support column wake up immediately so gravity pulls them down!
      const isAboveInColumn = (horizDist <= 1.15 && bp.y >= (hitPos.y - 0.35));

      if (isNearby || isAboveInColumn) {
        if (o.isAnchored) {
          o.isAnchored = false;
          if (rotSpd !== 0) {
            o.body.velocity.set(-bp.z * rotSpd, 0, bp.x * rotSpd);
          }
        }
        o.body.wakeUp();
      }
    });
  }

  _attachBallCollision(ball) {
    ball.body.addEventListener('collide', (ev) => {
      ball.hasHit = true;
      ball.hitTime = performance.now();
      const impact = Math.abs(ev.contact.getImpactVelocityAlongNormal());
      const hitPos = {
        x: ball.body.position.x,
        y: ball.body.position.y,
        z: ball.body.position.z,
      };

      // Ignore mutual collisions between sub-bombs in mid-air
      if (ball.body?.isSubBomb && ev.body?.isSubBomb) return;

      // Only wake local structures immediately adjacent to impact point
      this._wakeLocalStructures(hitPos, 1.35);

      // Energetic momentum transfer in the forward firing direction
      const targetBody = ev.body;
      if (targetBody && targetBody.mass > 0) {
        targetBody.wakeUp();
        const fDir = ball.fireDir || { x: 0, y: 0.1, z: -1 };
        let punch = 9.5;
        let lift = 0.15;

        if (ball.ballType === 'fever') {
          // 👑 Royal Fever: Colossal Overcharge Demolition
          punch = 26.0;
          lift = 0.60;
        } else if (ball.ballType === 'heavy') {
          // 🧱 Heavy Brass Boulder: Unstoppable kinetic momentum straight through columns
          punch = 20.0;
          lift = 0.15;
        } else if (ball.ballType === 'bomb') {
          // 💥 Explosive Bomb: Direct contact punch before detonation
          punch = 12.0;
          lift = 0.35;
        } else if (ball.ballType === 'cluster') {
          // 🚀 Cluster Rocket: High-velocity rocket impact
          punch = 14.0;
          lift = 0.35;
        } else if (ball.ballType === 'cluster_sub') {
          // Mini cluster bomb kinetic impact
          punch = 8.5;
          lift = 0.20;
        } else if (ball.ballType === 'slipper') {
          // 🩴 Desi Chappal: Aerodynamic slap with high rotational torque
          punch = 9.5;
          lift = 0.45;
          targetBody.angularVelocity.x += (Math.random() - 0.5) * 8;
          targetBody.angularVelocity.y += 4.0;
        } else if (ball.ballType === 'boot') {
          // 👢 Combat Boot: Downward stomping ground shock
          punch = 15.0;
          lift = -0.50;
        } else if (ball.ballType === 'roller') {
          // 🎳 Bowling Roller: Low deck sweep
          punch = 13.0;
          lift = 0.05;
        } else if (ball.ballType === 'splash') {
          // 💦 Hydro Splash: Water balloon burst
          punch = 11.0;
          lift = 0.25;
        } else {
          // Standard ball: tailored kinetic punch and lift based on equipped blaster
          if (ball.skinId === 'dragon') {
            // 🐉 Dragon Fire Mortar: Mega Red Molten Magma Ball (.25 extra of iron ball = 9.5 * 1.25 = 11.9)
            punch = 11.9;
            lift = 0.20;
          } else if (ball.skinId === 'tesla') {
            // ⚡ Tesla Arc Blaster: Electric Plasma Orb (same impact as Dragon Fiery = 11.9)
            punch = 11.9;
            lift = 0.20;
          } else if (ball.skinId === 'pirate') {
            // 🏴‍☠️ Pirate Bombardier: Heavy gilded corsair skull ball
            punch = 11.2;
            lift = 0.16;
          } else if (ball.skinId === 'candy') {
            // 🍬 Candy Peppermint Blaster: Bouncy peppermint jawbreaker
            punch = 10.8;
            lift = 0.25;
          } else {
            // 🎯 Standard Authentic Cast-Iron Cannonball (Royal Sovereign): Clean, surgical
            punch = 9.5;
            lift = 0.15;
          }
        }

        // Apply Kingdom Armory Pedestal Perk (+15% impact punch)
        const shockMult = economy.getShockwaveMultiplier();
        punch *= shockMult;

        const impulseX = fDir.x * punch;
        const impulseY = Math.max(0.1, fDir.y * punch * 0.25) + lift;
        const impulseZ = fDir.z * punch;

        // Realistic angular tumbling rotation
        targetBody.angularVelocity.x += (Math.random() - 0.5) * 3;
        targetBody.angularVelocity.y += (Math.random() - 0.5) * 3;
        targetBody.angularVelocity.z += (Math.random() - 0.5) * 3;

        // Cannon-es single clean impulse at center of mass (NO double velocity add!)
        try {
          targetBody.applyImpulse(new Vec3(impulseX, impulseY, impulseZ), new Vec3(0, 0, 0));
        } catch (_) {}
      }

      if (ball.ballType === 'fever') {
        // 👑 ROYAL FEVER: Golden mega shockwave, coin fountain & screen shake
        this.particles.createExplosion(hitPos);
        this.particles.createClusterSparkles(hitPos, 80);
        this.particles.createCoinShower(hitPos);
        this.audio?.playSparkleBoom();
        this._applyExplosionShockwave(hitPos, 4.4, 48);
        this._cameraShake(0.35, 0.28);
        this._showComicReaction('👑 FEVER BLAST!');

      } else if (ball.ballType === 'cluster') {
        // Direct rocket hit before split: massive cluster sparkle detonation
        this.particles.createExplosion(hitPos);
        this.audio?.playSparkleBoom();
        this.particles.createClusterSparkles(hitPos, 60);
        this._applyExplosionShockwave(hitPos, 3.2, 36);
        this._cameraShake(0.24, 0.20);
        this._showComicReaction('🚀 CLUSTER!');

      } else if (ball.ballType === 'bomb' || ball.ballType === 'cluster_sub') {
        // 💥 BOMB: True incendiary explosion with smoke, audio boom & radial blast wave
        this.particles.createExplosion(hitPos);
        if (ball.ballType === 'cluster_sub') {
          this.audio?.playSparkleBoom();
          this.particles.createClusterSparkles(hitPos, 30);
          this._applyExplosionShockwave(hitPos, 2.4, 24);
        } else {
          this.audio?.playExplosion();
          this._applyExplosionShockwave(hitPos, 2.4, 24);   // 🔧 nerfed: was (3.4, 38)
          this._showComicReaction('💥 BOOM!');

        }
        this._cameraShake(0.25, 0.20);

      } else if (ball.ballType === 'slipper') {
        // 🩴 SLIPPER: Comedic slap with dust puff
        this.audio?.playSlap();
        this.particles.createDustSlapPuff(hitPos);
        this._cameraShake(0.06, 0.12);
        this._showComicReaction('👋 SLAP!');

      } else if (ball.ballType === 'boot') {
        // 👢 BOOT: Ground stomp shockwave
        this.audio?.playStomp();
        this.particles.createGroundStompShock(hitPos);
        this._cameraShake(0.16, 0.18);
        this._applyExplosionShockwave(hitPos, 1.6, 16);    // 🔧 nerfed: was (2.2, 22)
        this._showComicReaction('👢 STOMP!');

      } else if (ball.ballType === 'splash') {
        // 💦 SPLASH: Hydro wave burst
        this.audio?.playSplash();
        this.particles.createWaterSplash(hitPos);
        this._cameraShake(0.08, 0.15);
        this._applyExplosionShockwave(hitPos, 1.8, 15);    // 🔧 nerfed: was (2.5, 20)
        this._showComicReaction('💦 SPLASH!');


      } else if (ball.ballType === 'heavy') {
        // 🧱 HEAVY: Crushing kinetic boulder (NO explosion, heavy clang & spark shower)
        this.audio?.playCanHit(Math.max(1.5, impact * 1.6));
        this.particles.createImpactSparks(hitPos, Math.min(48, Math.floor(impact * 6) + 16));
        this._cameraShake(0.12 * Math.min(impact / 5, 1.5), 0.18);
        economy.vibrate([35, 20, 35]);
        if (Math.random() < 0.6) this._showComicReaction('🔨 CRUSH!');

      } else if (ball.ballType === 'roller') {
        // 🎳 ROLLER: Bowling deck sweeper
        this.audio?.playCanHit(Math.max(1.0, impact * 1.2));
        this.particles.createImpactSparks(hitPos, 16);
        this._cameraShake(0.04, 0.08);
        economy.vibrate(25);
        if (Math.random() < 0.5) this._showComicReaction('🎳 STRIKE!');

      } else {
        // 🎯 Standard Blaster Projectiles
        this.audio?.playCanHit(impact);
        this.particles.createImpactSparks(hitPos, Math.min(32, Math.floor(impact * 4) + 8));
        this._cameraShake(0.04 * Math.min(impact / 6, 1.0), 0.08);
        if (impact > 1.5) economy.vibrate(20);

        if (ball.skinId === 'dragon') {
          this.particles.createFireTrail(hitPos);
          this._applyExplosionShockwave(hitPos, 2.2, 18);
          this._showComicReaction('🔥 DRAGON ROAR!');
        } else if (ball.skinId === 'tesla') {
          this.particles.createPlasmaTrail(hitPos);
          this._applyExplosionShockwave(hitPos, 2.2, 18);
          this._showComicReaction('⚡ VOLTAGE SURGE!');
        } else if (ball.skinId === 'candy') {
          this.particles.createClusterSparkles(hitPos, 25);
          this._showComicReaction('🍬 SWEET CRUSH!');
        }
      }

      // 🎯 Weak-Spot Critical Hit (bonus score + golden star sparkle; explosive shockwave ONLY for explosive ammo)
      if (ball.isWeakSpot && !ball._weakSpotTriggered) {
        ball._weakSpotTriggered = true;
        this.particles.createCriticalHitStar(hitPos);
        this.score += Math.round(250 * economy.getKingdomScoreMultiplier());
        this._showComicReaction('🎯 BULLSEYE!');
        this._cameraShake(0.08, 0.12);
        if (ball.ballType === 'bomb' || ball.ballType === 'cluster' || ball.ballType === 'fever') {
          this._applyExplosionShockwave(hitPos, 2.8, 28);
        }
      }

      // 🐉 Dragonfire Blaster Perk: Incendiary Shockwave (only for explosive ammunition or fever)
      if (ball.skinId === 'dragon' && !ball._dragonTriggered && (ball.ballType === 'bomb' || ball.ballType === 'fever')) {
        ball._dragonTriggered = true;
        this.particles.createFireTrail(hitPos);
        this._applyExplosionShockwave(hitPos, 3.2, 34);
      }

      // 🏴‍☠️ Pirate Bombardier Perk: Broadside Ricochet (Spawns 2 Bouncing Mini Iron Balls)
      if (ball.skinId === 'pirate' && !ball._pirateRicocheted) {
        ball._pirateRicocheted = true;
        [-1, 1].forEach(side => {
          const sub = createCannonball(this.engine.scene, this.physics, hitPos, 'roller');
          sub.body.velocity.set(side * 7, 3.5, -4);
          const subObj = { ...sub, age: 0, hasHit: false, hitTime: 0, ballType: 'roller' };
          this.balls.push(subObj);
          this._attachBallCollision(subObj);
        });
      }

      // Boss Reaction: Any hit on the castle or boss triggers the boss damage reaction!
      const hitTargetObj = this.gameObjs.find(o => o.body === ev.body);

      // 🧨 Explosive Powder Keg Detonation!
      if (hitTargetObj && hitTargetObj.isPowderKeg && !hitTargetObj._detonated) {
        this._detonatePowderKeg(hitTargetObj);
      }

      const bossHeadObj = this.gameObjs.find(o => (o.isBossBlock || o.isBossHead) && o._takeBossDamage);

      const isDirectBossHit = hitTargetObj && (hitTargetObj.isBossBlock || hitTargetObj.isBossHead);

      if (bossHeadObj || (this.gameObjs && this.gameObjs.some(o => o.isBossBlock || o.isBossHead)) || economy.bossModeContinuous || customTargets.active) {
        bossHeadObj?._takeBossDamage?.(3000);
        hitTargetObj?._takeBossDamage?.(3000);
        this.particles?.createCoinShower(hitPos);
        this._onBossHit(Boolean(isDirectBossHit));
        const bossName = customTargets.targetName || 'THE BOSS';
        const directReactions = [
          `👑 ${bossName}: MY CROWN!`,
          `💥 DIRECT HIT ON ${bossName.toUpperCase()}!`,
          `⚡ IMPERIAL SMASH!`,
          `💫 ${bossName}: I'M DIZZY!`,
          `🤕 ${bossName}: OUCH!`
        ];
        const castleReactions = [
          `💥 ${bossName}: MY CASTLE!`,
          `⚡ ${bossName}: STOP THAT!`,
          `💫 ${bossName}: WHOA!`,
          `👑 ${bossName}: YOU DARE?!`,
          `💥 ${bossName}: WATCH IT!`
        ];
        const list = isDirectBossHit ? directReactions : castleReactions;
        this._showComicReaction(list[Math.floor(Math.random() * list.length)]);
      } else if ((customTargets.hasUserPhoto() || economy.bossModeContinuous) && Math.random() < 0.5) {
        this._showComicReaction();
        this.particles?.createCoinShower(hitPos);
      }
    });
  }

  _detonatePowderKeg(kegObj) {
    if (!kegObj || kegObj._detonated || !kegObj.mesh) return;
    kegObj._detonated = true;
    kegObj.fallen = true;
    kegObj.fallTime = performance.now() / 1000;
    const kegPos = kegObj.mesh.position.clone();
    this.audio?.playExplosion?.();
    this.particles?.createBombExplosion?.(kegPos);
    this.particles?.createImpactSparks?.(kegPos, 45);
    this._cameraShake(0.24, 0.30);
    this._showComicReaction('🧨 POWDER KEG BOOM!');
    this.score += Math.round(350 * economy.getKingdomScoreMultiplier());
    this._applyExplosionShockwave(kegPos, 3.4, 38);
    setTimeout(() => {
      if (kegObj.mesh && kegObj.mesh.parent) {
        kegObj.clearedFromTable = true;
        disposeObj(this.engine.scene, this.physics, kegObj);
      }
    }, 120);
  }

  _applyExplosionShockwave(center, radius, force) {
    const shockMult = economy.getShockwaveMultiplier();
    const effRadius = radius * shockMult;
    const effForce  = force * shockMult;
    economy.vibrate([45, 25, 55]);

    this.gameObjs.forEach(o => {
      if (!o.body || o.fallen) return;
      const bp = o.body.position;
      const dx = bp.x - center.x;
      const dy = bp.y - center.y;
      const dz = bp.z - center.z;
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
      if (dist < effRadius && dist > 0.01) {
        if (o.isPowderKeg && !o._detonated && dist < effRadius * 0.85) {
          setTimeout(() => this._detonatePowderKeg(o), 90);
        }
        const factor = (1 - dist / effRadius);
        o.isAnchored = false;
        o.body.wakeUp();
        const bMass = Math.max(0.6, o.body.mass);
        const fx = (dx / dist) * effForce * factor;
        const fy = Math.max(1.8, (dy / dist) * effForce * factor * 0.35 + 3.5 * factor);
        const fz = (dz / dist) * effForce * factor;

        const spinMult = bMass >= 4.0 ? 2.5 : 5.0;
        o.body.angularVelocity.x += (Math.random() - 0.5) * spinMult;
        o.body.angularVelocity.y += (Math.random() - 0.5) * spinMult;

        try {
          o.body.applyImpulse(new Vec3(fx, fy, fz), new Vec3(0, 0, 0));
        } catch (_) {}
      }
    });
  }

  _cameraShake(intensity, duration) {
    const orig = this.engine.camera.position.clone();
    const t0   = performance.now();
    const shake = () => {
      const elapsed = (performance.now() - t0) / 1000;
      if (elapsed < duration) {
        const frac = 1 - elapsed / duration;
        this.engine.camera.position.x = orig.x + (Math.random() - 0.5) * intensity * frac;
        this.engine.camera.position.y = orig.y + (Math.random() - 0.5) * intensity * frac;
        requestAnimationFrame(shake);
      } else {
        this.engine.camera.position.copy(orig);
      }
    };
    shake();
  }

  // ─── Table Debris Cleaner ───────────────────────────────────────────────────
  _cleanTableDebris() {
    if (!this._hasFired) return;
    const platW = this.pedestal?.platW || 5.4;
    const platD = this.pedestal?.platD || 2.0;
    const maxR = Math.hypot(platW / 2, platD / 2) + 0.35;

    const restingFallen = [];

    for (const o of this.gameObjs) {
      if (!o.fallen || o.clearedFromTable) continue;
      // 👑 GUARANTEED PERMANENT VISIBILITY: Boss Head and Boss Blocks are NEVER cleared or dissolved!
      if (o.isBossHead || o.isBossBlock) continue;

      const pos = o.mesh.position;
      const r = Math.hypot(pos.x, pos.z);
      const isOffTable = (pos.y < (this.platformY - 0.50)) || (r > maxR);

      if (isOffTable) {
        o.clearedFromTable = true;
      } else {
        restingFallen.push(o);
      }
    }

    if (restingFallen.length > 2) {
      restingFallen.sort((a, b) => (b.fallTime || 0) - (a.fallTime || 0));
      const toDissolve = restingFallen.slice(2);

      for (const obj of toDissolve) {
        if (obj.isBossHead || obj.isBossBlock) continue;
        obj.clearedFromTable = true;
        this.particles?.createSmokePuff(obj.mesh.position.clone());
        this.particles?.createImpactSparks(obj.mesh.position.clone(), 12);
        disposeObj(this.engine.scene, this.physics, obj);
      }
    }
  }

  _showComicReaction(text = 'SMASH!') {
    if (!this.$.comic) return;
    this.$.comic.textContent = text;
    this.$.comic.classList.remove('hidden');
    this.$.comic.style.animation = 'none';
    this.$.comic.offsetHeight;
    this.$.comic.style.animation = '';
    setTimeout(() => this.$.comic?.classList.add('hidden'), 900);
  }

  // ─── 👑 Always-Visible Live Boss Reaction Cam (PiP Widget) ────────────────
  _initBossCam() {
    if (this._bossCamHitTimer) {
      clearTimeout(this._bossCamHitTimer);
      this._bossCamHitTimer = null;
    }
    const hasBoss = Boolean(
      (this.gameObjs && this.gameObjs.some(o => o.isBossBlock || o.isBossHead)) ||
      economy.bossModeContinuous ||
      customTargets.active
    );

    if (!hasBoss) {
      this.$.hudBossCam?.classList.add('hidden');
      return;
    }

    this._bossCamFallen = false;
    this._bossAimReactionCooldown = 0;
    this.$.hudBossCam?.classList.remove('hidden');

    const avatarUrl = customTargets.getNormalUrl();
    if (this.$.bossCamImg && avatarUrl) {
      this.$.bossCamImg.src = avatarUrl;
    } else if (this.$.bossCamImg) {
      const cv = customTargets.getFaceCanvas();
      if (cv) {
        try { this.$.bossCamImg.src = cv.toDataURL(); } catch (_) {}
      }
    }

    if (this.$.bossCamName) {
      this.$.bossCamName.textContent = (customTargets.targetName || 'THE BOSS').toUpperCase();
    }
    if (this.$.bossCamAvatarWrap) {
      this.$.bossCamAvatarWrap.classList.remove('boss-fallen', 'boss-cam-shake');
    }
    if (this.$.bossCamStars) {
      this.$.bossCamStars.classList.add('hidden');
    }
    if (this.$.bossCamPill) {
      this.$.bossCamPill.textContent = '😈 SMUG';
      this.$.bossCamPill.style.color = '#ffd700';
    }
    if (this.$.bossCamStatusTag) {
      this.$.bossCamStatusTag.textContent = '🏰 DEFENDING';
      this.$.bossCamStatusTag.style.color = '#38bdf8';
    }

    const openers = [
      `"You can't smash my fortress!"`,
      `"Aim all you want, peasant!"`,
      `"My castle walls are unbreakable!"`,
      `"Prepare to be humiliated!"`
    ];
    if (this.$.bossCamQuote) {
      this.$.bossCamQuote.textContent = openers[Math.floor(Math.random() * openers.length)];
    }
  }

  _updateBossCamAiming() {
    if (!this.$.hudBossCam || this.$.hudBossCam.classList.contains('hidden') || this._bossCamFallen) return;
    const now = performance.now();
    if (now - (this._bossAimReactionCooldown || 0) < 1800) return;
    this._bossAimReactionCooldown = now;

    if (this.$.bossCamPill) {
      this.$.bossCamPill.textContent = '😰 NERVOUS';
      this.$.bossCamPill.style.color = '#fbbf24';
    }
    if (this.$.bossCamStatusTag) {
      this.$.bossCamStatusTag.textContent = '🎯 TARGETED';
      this.$.bossCamStatusTag.style.color = '#f59e0b';
    }

    const aimQuotes = [
      `"Hey! Watch where you point that cannon!"`,
      `"Don't shoot there! Wait, stop!"`,
      `"What are you aiming at?! Hey!"`,
      `"You wouldn't dare fire at my tower!"`
    ];
    if (this.$.bossCamQuote) {
      this.$.bossCamQuote.textContent = aimQuotes[Math.floor(Math.random() * aimQuotes.length)];
    }
  }

  _onBossHit(isDirectHit = false) {
    if (!this.$.hudBossCam || this.$.hudBossCam.classList.contains('hidden')) return;

    if (this.$.bossCamAvatarWrap) {
      this.$.bossCamAvatarWrap.classList.remove('boss-cam-shake');
      void this.$.bossCamAvatarWrap.offsetWidth;
      this.$.bossCamAvatarWrap.classList.add('boss-cam-shake');
    }

    if (this._bossCamFallen) {
      const fallenQuotes = [
        `"Stop it... I'm already defeated! 😭"`,
        `"Leave the rest of my castle alone!"`,
        `"You've already knocked me down!"`,
        `"Stop rubbing it in!"`
      ];
      if (this.$.bossCamQuote) {
        this.$.bossCamQuote.textContent = fallenQuotes[Math.floor(Math.random() * fallenQuotes.length)];
      }
      return;
    }

    if (this._bossCamHitTimer) clearTimeout(this._bossCamHitTimer);

    if (isDirectHit) {
      const dmgUrl = customTargets.getDamagedUrl();
      if (this.$.bossCamImg && dmgUrl) this.$.bossCamImg.src = dmgUrl;
      this.$.bossCamStars?.classList.remove('hidden');
      if (this.$.bossCamPill) {
        this.$.bossCamPill.textContent = '💥 OUCH!';
        this.$.bossCamPill.style.color = '#ef4444';
      }
      if (this.$.bossCamStatusTag) {
        this.$.bossCamStatusTag.textContent = '💥 DIRECT HIT!';
        this.$.bossCamStatusTag.style.color = '#ef4444';
      }
      const directQuotes = [
        `"OUCH! RIGHT IN MY TEETH!"`,
        `"MY CROWN! THAT WAS DIRECT!"`,
        `"WHOA! I'M SEEING STARS! 💫"`,
        `"THAT ACTUALLY HURT!"`
      ];
      if (this.$.bossCamQuote) {
        this.$.bossCamQuote.textContent = directQuotes[Math.floor(Math.random() * directQuotes.length)];
      }
    } else {
      if (this.$.bossCamPill) {
        this.$.bossCamPill.textContent = '😱 SHOCKED';
        this.$.bossCamPill.style.color = '#f97316';
      }
      if (this.$.bossCamStatusTag) {
        this.$.bossCamStatusTag.textContent = '⚡ UNDER SIEGE';
        this.$.bossCamStatusTag.style.color = '#f97316';
      }
      const castleQuotes = [
        `"MY CASTLE! STOP SMASHING IT!"`,
        `"HEY! THAT WALL TOOK MONTHS TO BUILD!"`,
        `"NO! MY PRECIOUS DEFENSES!"`,
        `"WATCH IT! THAT'S EXPENSIVE STONE!"`
      ];
      if (this.$.bossCamQuote) {
        this.$.bossCamQuote.textContent = castleQuotes[Math.floor(Math.random() * castleQuotes.length)];
      }
    }

    this._bossCamHitTimer = setTimeout(() => {
      if (this._bossCamFallen) return;
      const normalUrl = customTargets.getNormalUrl();
      if (this.$.bossCamImg && normalUrl) this.$.bossCamImg.src = normalUrl;
      this.$.bossCamStars?.classList.add('hidden');
      if (this.$.bossCamPill) {
        this.$.bossCamPill.textContent = '😈 SMUG';
        this.$.bossCamPill.style.color = '#ffd700';
      }
      if (this.$.bossCamStatusTag) {
        this.$.bossCamStatusTag.textContent = '🏰 DEFENDING';
        this.$.bossCamStatusTag.style.color = '#38bdf8';
      }
    }, 2600);
  }

  _onBossFallen() {
    this._bossCamFallen = true;
    if (this._bossCamHitTimer) clearTimeout(this._bossCamHitTimer);

    this.$.hudBossCam?.classList.remove('hidden');

    const dmgUrl = customTargets.getDamagedUrl();
    if (this.$.bossCamImg && dmgUrl) this.$.bossCamImg.src = dmgUrl;
    this.$.bossCamStars?.classList.remove('hidden');

    if (this.$.bossCamAvatarWrap) {
      this.$.bossCamAvatarWrap.classList.add('boss-fallen');
      this.$.bossCamAvatarWrap.classList.remove('boss-cam-shake');
      void this.$.bossCamAvatarWrap.offsetWidth;
      this.$.bossCamAvatarWrap.classList.add('boss-cam-shake');
    }

    if (this.$.bossCamPill) {
      this.$.bossCamPill.textContent = '💫 DEFEATED! 😭';
      this.$.bossCamPill.style.color = '#ef4444';
    }
    if (this.$.bossCamStatusTag) {
      this.$.bossCamStatusTag.textContent = '💀 TOPPLED!';
      this.$.bossCamStatusTag.style.color = '#ef4444';
    }

    const fallQuotes = [
      `"I'M FALLINGGGG! 😭"`,
      `"MY CROWN! YOU TOPPLED ME!"`,
      `"NOOOO! MY GLORIOUS REIGN!"`,
      `"I CANNOT BELIEVE I FELL!"`
    ];
    if (this.$.bossCamQuote) {
      this.$.bossCamQuote.textContent = fallQuotes[Math.floor(Math.random() * fallQuotes.length)];
    }

    // 💥 Comic celebration reaction & audio
    this._showComicReaction('👑 BOSS TOPPLED! 💥');
    this.audio?.playSparkleBoom?.();

    // Mark all parts of the toppled boss structure as defeated immediately
    if (this.gameObjs) {
      const nowSec = performance.now() / 1000;
      this.gameObjs.forEach(o => {
        if (o.isBossHead || o.isBossBlock) {
          o.fallen = true;
          o.fallTime = o.fallTime || nowSec;
        }
      });
      this._updateHUD();
    }

    // 🌟 When boss head falls, ensure it stays VISIBLE all the time on the floor with dizzy stars
    const bossHeadObj = this.gameObjs?.find(o => o.isBossHead);
    if (bossHeadObj) {
      bossHeadObj.fallen = true;
      bossHeadObj._takeBossDamage?.(12000);
      if (bossHeadObj.dizzyStarsG) bossHeadObj.dizzyStarsG.visible = true;

      // Higher damping prevents wild ricochets and keeps it resting cleanly in view
      if (bossHeadObj.body) {
        bossHeadObj.body.linearDamping = 0.82;
        bossHeadObj.body.angularDamping = 0.85;
      }

      // Celebrate topple with impact sparks & coin shower, but keep the head resting on the floor
      const fallenPos = bossHeadObj.mesh?.position?.clone?.();
      if (fallenPos) {
        this.particles?.createImpactSparks?.(fallenPos, 20);
        this.particles?.createCoinShower?.(fallenPos, 24);
      }
      this.audio?.playCoin?.();
      this._updateHUD();
    }
  }

  // ─── Main Game Loop ────────────────────────────────────────────────────────
  _loop() {
    requestAnimationFrame(() => this._loop());
    if (!this.engine) return;

    let dt = Math.min(this.engine.clock.getDelta(), 0.05);
    if (this._slowMoTimer > 0) {
      this._slowMoTimer = Math.max(0, this._slowMoTimer - dt);
      dt *= 0.30; // 🎥 Cinematic Slow-Motion Climax!
    }

    if (this.state === S.PLAYING) {
      if (this._timerRunning && this.timeLeft > 0) {
        this.timeLeft -= dt;
        const secs = Math.max(0, Math.ceil(this.timeLeft));
        if (this.$.timerText) this.$.timerText.textContent = `${secs}s`;
        if (this.$.timerBadge) {
          this.$.timerBadge.classList.toggle('urgent', this.timeLeft <= 10);
        }
        if (this.timeLeft <= 0) {
          this.timeLeft = 0;
          if (this.$.timerText) this.$.timerText.textContent = `0s`;

          // Overtime buzzer-beater check: if ball is in-flight or recently fired, wait for impact
          const activeBalls = this.balls.filter(b => !b.hasDied && b.body && b.body.velocity.length() > 0.30);
          const timeSinceLastFire = Date.now() - (this._lastFireTime || 0);
          if (activeBalls.length > 0 || timeSinceLastFire < 2200) {
            if (!this._overtimeStartTime) this._overtimeStartTime = Date.now();
            if (Date.now() - this._overtimeStartTime >= 3000 && !this._gameResolved) {
              this._timerRunning = false;
              this._onTimeExpired();
            }
          } else {
            this._timerRunning = false;
            this._onTimeExpired();
          }
        }
      }

      if (this.physics) {
        if (this.pedestal && this.pedestal.rotSpeed !== 0 && !this.physics._paused) {
          const dAngle = this.pedestal.rotSpeed * dt;
          this.platformAngle += dAngle;
          this.physics.rotateKinematicPlatform(this.pedestal.platBody, this.platformAngle, this.pedestal.rotSpeed);
          this.pedestal.platformGroup.rotation.y = this.platformAngle;

          const cos = Math.cos(this.platformAngle);
          const sin = Math.sin(this.platformAngle);
          const qAngle = this.platformAngle;

          // Only anchor blocks to rotation BEFORE the first shot is fired!
          // Once fired, dynamic physics takes over so blocks never levitate in mid-air.
          if (!this._hasFired) {
            this.gameObjs.forEach(o => {
              if (o.isAnchored && o.body && o.mesh && o.initialPos) {
                const nx = o.initialPos.x * cos + o.initialPos.z * sin;
                const ny = o.initialPos.y;
                const nz = -o.initialPos.x * sin + o.initialPos.z * cos;

                o.body.position.set(nx, ny, nz);
                o.body.quaternion.setFromAxisAngle(new Vec3(0, 1, 0), qAngle);
                o.body.velocity.set(0, 0, 0);
                o.body.angularVelocity.set(0, 0, 0);
                o.body.sleep();

                o.mesh.position.set(nx, ny, nz);
                o.mesh.quaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), qAngle);
              }
            });
          }
        }

        if (this._hasFired) {
          this.physics.step(dt);
          this.physics.syncMeshes();
          this._cleanTableDebris();

          // 👑 GUARANTEE BOSS HEAD & BOSS BLOCKS ALWAYS VISIBLE AT OK DISTANCE FROM FIRE MACHINE
          if (this.gameObjs) {
            for (let i = 0; i < this.gameObjs.length; i++) {
              const o = this.gameObjs[i];
              if (!o) continue;

              if (o.isBossHead) {
                if (o.mesh) o.mesh.visible = true;

                if (o.fallen && o.body) {
                  // Ground clamping: keep resting gracefully on arena floor (head radius ~0.65 => y >= 0.72)
                  if (o.body.position.y < 0.72) {
                    o.body.position.y = 0.72;
                    if (o.body.velocity.y < 0) o.body.velocity.y = 0;
                  }

                  // Distance clamping: keep in visible arena at OK distance from cannon (cannon is at z=8.8 - 11.2)
                  if (o.body.position.z > 4.2) {
                    o.body.position.z = 4.2;
                    if (o.body.velocity.z > 0) o.body.velocity.z = 0;
                  } else if (o.body.position.z < -1.2) {
                    o.body.position.z = -1.2;
                    if (o.body.velocity.z < 0) o.body.velocity.z = 0;
                  }

                  if (Math.abs(o.body.position.x) > 2.3) {
                    o.body.position.x = Math.sign(o.body.position.x) * 2.3;
                    o.body.velocity.x = 0;
                  }

                  // Settle and smoothly turn face towards camera (+Z with gentle upward tilt)
                  const speed = o.body.velocity.length();
                  if (speed < 0.40) {
                    if (o.dizzyStarsG) o.dizzyStarsG.visible = true;

                    const targetEuler = new THREE.Euler(-0.25, 0, 0);
                    const targetQuat = new THREE.Quaternion().setFromEuler(targetEuler);
                    o.mesh.quaternion.slerp(targetQuat, 0.08);

                    o.body.quaternion.set(o.mesh.quaternion.x, o.mesh.quaternion.y, o.mesh.quaternion.z, o.mesh.quaternion.w);
                    o.body.angularVelocity.set(0, 0, 0);
                  }

                  o.mesh.position.copy(o.body.position);
                }
              } else if (o.isBossBlock) {
                if (o.mesh) o.mesh.visible = true;

                if (o.fallen && o.body) {
                  if (o.body.position.y < 0.35) {
                    o.body.position.y = 0.35;
                    if (o.body.velocity.y < 0) o.body.velocity.y = 0;
                  }

                  if (o.body.position.z > 5.2) {
                    o.body.position.z = 5.2;
                    if (o.body.velocity.z > 0) o.body.velocity.z = 0;
                  } else if (o.body.position.z < -2.0) {
                    o.body.position.z = -2.0;
                    if (o.body.velocity.z < 0) o.body.velocity.z = 0;
                  }

                  if (Math.abs(o.body.position.x) > 3.0) {
                    o.body.position.x = Math.sign(o.body.position.x) * 3.0;
                    o.body.velocity.x = 0;
                  }

                  o.mesh.position.copy(o.body.position);
                }
              }
            }
          }
        }

        // Animate dynamic 3D elements (orbiting stars + DOM face overlay tracking)
        if (this.gameObjs) {
          for (let i = 0; i < this.gameObjs.length; i++) {
            try {
              this.gameObjs[i].updateStars?.();
              this.gameObjs[i].updateOverlayPosition?.(this.engine.camera, this.engine.renderer);
            } catch (overlayErr) {
              // Silently protect render loop so 3D scene always renders
            }
          }
        }

        // Projectile lifetime, smoke puffs & MIRV cluster rocket mid-air split
        for (let i = this.balls.length - 1; i >= 0; i--) {
          const b = this.balls[i];
          b.age += dt;

          // MIRV Cluster Rocket mid-flight splitting into 5 round bombs
          if (b.ballType === 'cluster' && !b.hasSplit && b.age >= 0.18) {
            b.hasSplit = true;
            const splitPos = b.mesh.position.clone();
            const curVel = b.body.velocity;

            this.audio?.playSparkleBoom();
            this.particles?.createClusterSparkles(splitPos, 60);

            // Spawn 5 independent cluster mini-bombs fanning out
            const offsets = [
              { dx: -0.36, dy:  0.18, vx: -5.0, vy:  1.6 },
              { dx: -0.18, dy: -0.08, vx: -2.5, vy: -0.6 },
              { dx:  0.00, dy:  0.00, vx:  0.0, vy:  0.3 },
              { dx:  0.18, dy: -0.08, vx:  2.5, vy: -0.6 },
              { dx:  0.36, dy:  0.18, vx:  5.0, vy:  1.6 },
            ];
            offsets.forEach((cfg) => {
              const subPos = {
                x: splitPos.x + cfg.dx,
                y: splitPos.y + cfg.dy,
                z: splitPos.z,
              };
              const subBall = createCannonball(this.engine.scene, this.physics, subPos, 'bomb');
              subBall.ballType = 'cluster_sub';
              subBall.body.isSubBomb = true; // Mark to prevent self-collision
              const vx = curVel.x + cfg.vx;
              const vy = curVel.y + cfg.vy;
              const vz = curVel.z * 1.05;
              const sLen = Math.hypot(vx, vy, vz) || 1;
              subBall.fireDir = { x: vx / sLen, y: vy / sLen, z: vz / sLen };
              subBall.body.velocity.set(vx, vy, vz);
              this.balls.push({ ...subBall, age: 0, hasSplit: true });
              this._attachBallCollision(subBall);
            });

            disposeObj(this.engine.scene, this.physics, b);
            this.balls.splice(i, 1);
            continue;
          }

          if (b.age % 0.04 < dt && this.particles) {
            const bPos = b.mesh.position.clone();
            if (b.isFever || b.ballType === 'fever') {
              this.particles.createFeverTrail(bPos);
            } else if (b.ballType === 'bomb' || b.ballType === 'cluster_sub') {
              this.particles.createFireTrail(bPos);
              if (Math.random() < 0.45) this.particles.createSmokePuff(bPos);
            } else if (b.ballType === 'cluster') {
              this.particles.createFireTrail(bPos);
            } else if (b.skinId === 'dragon') {
              this.particles.createFireTrail(bPos);
            } else if (b.skinId === 'tesla') {
              this.particles.createPlasmaTrail(bPos);
            } else if (b.ballType === 'heavy') {
              this.particles.createSpeedStreak(bPos, 0xf59e0b, 0.16);
            } else if (b.ballType === 'roller') {
              this.particles.createSpeedStreak(bPos, 0x10b981, 0.14);
            } else if (b.ballType === 'splash') {
              this.particles.createSpeedStreak(bPos, 0x38bdf8, 0.14);
            } else if (b.ballType === 'slipper') {
              this.particles.createSpeedStreak(bPos, 0x06b6d4, 0.12);
            } else if (b.ballType === 'boot') {
              this.particles.createSpeedStreak(bPos, 0xb45309, 0.14);
            } else {
              // 🎯 Iron Ball: Clean supersonic aerodynamic wind streak (NEVER heavy smoke)
              this.particles.createSpeedStreak(bPos, 0xffffff, 0.12);
            }
          }
          const pos = b.mesh.position;
          const isMissed = (pos.z < -6.5) || (pos.y < (this.platformY - 2.0)) || (Math.abs(pos.x) > 6.5);
          const hasHitExpired = b.hasHit && (performance.now() - (b.hitTime || 0) > 400);
          if (b.age > 2.2 || isMissed || hasHitExpired || b.mesh.position.y < -8) {
            disposeObj(this.engine.scene, this.physics, b);
            this.balls.splice(i, 1);
          }
        }

        this.cannon?.update(dt);
        this._checkWinLose();
      }
    }

    if (this.particles) this.particles.update(dt);
    this.engine.update(dt);
    this.engine.render();
  }

  // ─── Grand Palace Celebration Canvas Animation Loop ────────────────────────
  _startPalaceCelebrationCanvas() {
    this._stopPalaceCelebrationCanvas();
    const canvas = this.$.palaceCanvas || document.getElementById('palace-celebration-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = [];
    const colors = ['#ffd700', '#ff2a6d', '#00e5ff', '#38ef7d', '#ff758c', '#ffffff', '#ffb703'];

    for (let i = 0; i < 90; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * -canvas.height,
        r: 4 + Math.random() * 8,
        color: colors[Math.floor(Math.random() * colors.length)],
        vx: (Math.random() - 0.5) * 2.5,
        vy: 2 + Math.random() * 4.5,
        rot: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.1,
        type: Math.random() < 0.4 ? 'petal' : (Math.random() < 0.7 ? 'coin' : 'confetti')
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vRot;

        if (p.y > canvas.height + 20) {
          p.y = -20;
          p.x = Math.random() * canvas.width;
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;

        if (p.type === 'petal') {
          ctx.beginPath();
          ctx.ellipse(0, 0, p.r, p.r * 1.6, 0, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.type === 'coin') {
          ctx.fillStyle = '#ffd700';
          ctx.beginPath();
          ctx.arc(0, 0, p.r, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#ca8a04';
          ctx.lineWidth = 1.5;
          ctx.stroke();
        } else {
          ctx.fillRect(-p.r, -p.r/2, p.r * 2, p.r);
        }

        ctx.restore();
      });

      this._palaceAnimId = requestAnimationFrame(render);
    };

    render();
  }

  _stopPalaceCelebrationCanvas() {
    if (this._palaceAnimId) {
      cancelAnimationFrame(this._palaceAnimId);
      this._palaceAnimId = null;
    }
  }

  // ─── Win / Lose Checking ───────────────────────────────────────────────────
  _checkWinLose() {
    if (this._gameResolved) return;

    let targetsStanding = 0;
    const now = performance.now() / 1000;

    const platW = this.pedestal?.platW || 5.4;
    const platD = this.pedestal?.platD || 2.4;
    const maxR = Math.hypot(platW / 2, platD / 2) + 0.40;

    this.gameObjs.forEach(o => {
      // If object was cleared, disposed, or unparented, it is definitively knocked/fallen
      if (o.clearedFromTable || !o.mesh || !o.mesh.parent) {
        o.fallen = true;
        return;
      }

      const mPos = o.mesh.position;
      const bPos = o.body ? o.body.position : mPos;
      const r = Math.min(Math.hypot(mPos.x, mPos.z), Math.hypot(bPos.x, bPos.z));
      const minY = Math.min(mPos.y, bPos.y);
      const isOffTable = (minY < (this.platformY - 0.20)) || (r > maxR);

      // Check tilt: an upright object has world Y axis pointing straight up
      // True knockdown on table: object is lying on its side (tilted by > 66 degrees from vertical)
      let isLyingFlat = false;
      if (o.mesh.quaternion) {
        const upVec = new THREE.Vector3(0, 1, 0).applyQuaternion(o.mesh.quaternion);
        isLyingFlat = (upVec.y < 0.40);
      }
      const isFlatOnTable = isLyingFlat && (minY <= (this.platformY + 0.38));

      // Truly defeated if knocked off table or knocked flat on its side
      const isKnocked = isOffTable || isFlatOnTable;

      if (isKnocked && !o.fallen) {
        o.fallen = true;
        const hasBossHeadInGame = this.gameObjs && this.gameObjs.some(x => x.isBossHead);
        if (hasBossHeadInGame ? o.isBossHead : (o.isBossBlock || o.isBossHead)) {
          this._onBossFallen();
        }
        const scoreMult = economy.getKingdomScoreMultiplier();
        this.score += Math.round(150 * scoreMult);
        this._currentShotKnocked = (this._currentShotKnocked || 0) + 1;
        this._updateHUD();

        // 🎯 COMBO SCORE BONUS: Rewarding skillful multi-target shots with bonus points
        if (this._currentShotKnocked === 3) {
          const pts = Math.round(300 * scoreMult);
          this.score += pts;
          this._showCombo(`🔥 TRIPLE KNOCKDOWN! +${pts} PTS`);
          this.audio?.playCombo?.();
        } else if (this._currentShotKnocked === 4) {
          const pts = Math.round(500 * scoreMult);
          this.score += pts;
          this._showCombo(`⚡ QUADRA SMASH! +${pts} PTS`);
          this.audio?.playCombo?.();
        } else if (this._currentShotKnocked >= 5) {
          const pts = Math.round(800 * scoreMult);
          this.score += pts;
          this._showCombo(`👑 MEGA ROYAL SMASH! +${pts} PTS`);
          this.audio?.playCombo?.();
        }
      }

      if (o.isCan && !o.fallen && !o.clearedFromTable) {
        targetsStanding++;
      }
    });

    const totalCans = this.gameObjs.filter(o => o.isCan).length;
    if (totalCans > 0 && targetsStanding === 0) {
      if (this.currentWave < this.totalWaves) {
        this._onWaveCleared();
      } else {
        this._gameResolved = true;
        this._slowMoTimer = 0.40; // 🎥 Final Hit Cinematic Slow-Mo Climax!
        setTimeout(() => this._win(), 500);
      }
    } else if (this._hasFired && targetsStanding === 0 && this.gameObjs.length > 0) {
      if (this.currentWave < this.totalWaves) {
        this._onWaveCleared();
      } else {
        this._gameResolved = true;
        this._slowMoTimer = 0.40; // 🎥 Final Hit Cinematic Slow-Mo Climax!
        setTimeout(() => this._win(), 500);
      }
    } else if (this.shotsLeft <= 0) {
      // 🎯 ACTIVE MOTION SETTLEMENT WINDOW:
      const nowMs = Date.now();
      const timeSinceLastFire = nowMs - (this._lastFireTime || 0);

      // Check if any balls are still active in the world
      const hasActiveBalls = this.balls.some(b => !b.hasHit || (b.body && b.body.velocity.length() > 0.40));

      // Check if any standing target cans are still tumbling/falling
      let standingCansMoving = false;
      for (let i = 0; i < this.gameObjs.length; i++) {
        const o = this.gameObjs[i];
        if (!o.isCan || o.fallen || !o.body) continue;
        if (o.body.velocity.length() > 0.30 || o.body.angularVelocity.length() > 0.50) {
          standingCansMoving = true;
          break;
        }
      }

      // Allow 1.8s to 2.8s for ball impact & tumbling blocks to fall
      const stillSettling = (timeSinceLastFire < 1800) || 
                            (timeSinceLastFire < 2800 && (hasActiveBalls || standingCansMoving));

      if (stillSettling) {
        return; // wait for ball impact and settling
      }

      // Settlement window complete: if targets still remain, open continue modal
      if (targetsStanding > 0 && this.state === S.PLAYING && !this._gameResolved) {
        console.log('[ShotsDepleted] All shots depleted, opening continue modal. Standing:', targetsStanding);
        this._onShotsDepleted(targetsStanding);
      }
    }
  }

  _onWaveCleared() {
    this.currentWave++;
    this._gameResolved = true;
    if (this._lastShotDepletedTimer) {
      clearTimeout(this._lastShotDepletedTimer);
      this._lastShotDepletedTimer = null;
    }
    this.$.continueModal?.classList.add('hidden');
    try {
      this.audio?.playVictoryFanfare();
      this.particles?.createVictoryConfetti();
    } catch (_) {}

    // Reinforcements bonus balls for reaching the next wave!
    this.shotsLeft += 2;
    this._updateHUD();

    if (this.$.waveClearedBanner) {
      if (this.$.waveClearedTitle) this.$.waveClearedTitle.textContent = `🌊 WAVE ${this.currentWave - 1} CONQUERED!`;
      if (this.$.waveClearedSub) this.$.waveClearedSub.textContent = `+2 REINFORCEMENTS! PREPARE FOR CITADEL! 🏰`;
      this.$.waveClearedBanner.classList.remove('hidden');
      setTimeout(() => this.$.waveClearedBanner?.classList.add('hidden'), 2200);
    }

    setTimeout(() => {
      try {
        this.gameObjs.forEach(o => disposeObj(this.engine.scene, this.physics, o));
        this.gameObjs = [];
        this.balls.forEach(b => disposeObj(this.engine.scene, this.physics, b));
        this.balls = [];

        const lvlData = LEVELS[this.levelIdx] || LEVELS[0];
        this._buildLevel(lvlData, this.currentWave);
        this.physics.sleepAll();
        this._updateWaveBadge();
        this._updateHUD();
        this._hasFired = false;
        this._gameResolved = false;
      } catch (err) {
        console.error('[WaveCleared] Error spawning next wave:', err);
        this._win();
      }
    }, 1400);
  }

  _win() {
    if (this._lastShotDepletedTimer) {
      clearTimeout(this._lastShotDepletedTimer);
      this._lastShotDepletedTimer = null;
    }
    this.$.continueModal?.classList.add('hidden');
    try {
      this.state = S.WIN;
      this._timerRunning = false;
      this._carriedTime = Math.min(90, Math.max(0, Math.ceil(this.timeLeft)));

      // ⭐ 3-Star Mastery Calculation:
      // 3 Stars: 2+ balls left
      // 2 Stars: 1 ball left
      // 1 Star: 0 balls left
      let stars = 1;
      if (this.shotsLeft >= 2) stars = 3;
      else if (this.shotsLeft >= 1) stars = 2;
      else stars = 1;

      try {
        economy.recordLevelStars(this.levelIdx + 1, stars);
        economy.incrementWinStreak();
        const totalTargets = this.gameObjs.filter(o => o.isCan).length;
        economy.recordLevelScore(this.score, stars, Math.max(1, 18 - this.shotsLeft), totalTargets);
      } catch (e) {
        console.warn('[Win] Economy tracking warning:', e);
      }

      const isPalaceGate = ((this.levelIdx + 1) % 13 === 0);

      if (isPalaceGate) {
        try {
          economy.awardPalaceGateBonus();
          this.audio?.playPalaceFanfare();
          this.particles?.createGrandCelebration();
          this._startPalaceCelebrationCanvas();
        } catch (_) {}
        this._showOnly('palaceVictory');
        this._updateWalletDisplays();
        this._updateHUD();
      } else {
        const earnings = economy.calculateLevelEarnings(this.levelIdx + 1, stars, this.score, this.shotsLeft);
        try {
          this.audio?.playVictory();
          this.particles?.createVictoryConfetti();
        } catch (_) {}

        // Animate 3-Star Rating Slots
        [this.$.winStar1, this.$.winStar2, this.$.winStar3].forEach((el, idx) => {
          if (el) {
            el.classList.remove('earned');
            if (idx < stars) {
              setTimeout(() => el.classList.add('earned'), 300 + idx * 220);
            }
          }
        });

        if (this.$.winStarTierTitle) {
          if (stars === 3) this.$.winStarTierTitle.textContent = 'ROYAL ACE! ⭐⭐⭐';
          else if (stars === 2) this.$.winStarTierTitle.textContent = 'ROYAL MASTER! ⭐⭐';
          else this.$.winStarTierTitle.textContent = 'VICTOR! ⭐';
        }

        // Star Chest Meter in Win Screen
        if (this.$.winChestProgressTxt) {
          this.$.winChestProgressTxt.textContent = `${economy.starChestProgress}/10`;
        }
        if (this.$.winChestBarFill) {
          this.$.winChestBarFill.style.width = `${(economy.starChestProgress / 10) * 100}%`;
        }

        if (this.$.winStars) this.$.winStars.textContent = '⭐'.repeat(stars);
        if (this.$.winScore) this.$.winScore.textContent = `${this.score} PTS`;
        if (this.$.earnSilver) this.$.earnSilver.textContent = earnings.silverEarned;
        if (this.$.earnGold)   this.$.earnGold.textContent   = earnings.goldEarned;

        this._renderWinSecretBox();
        this._showOnly('win');
        this._updateWalletDisplays();
        this._updateHUD();

        // 🌟 Magical Word Reveal — reveal celebratory secret message word on Victory screen
        setTimeout(() => this._revealNextWord(), 600);

        if (earnings.goldEarned >= 2) {
          setTimeout(() => this._showDramaticGoldJackpot(earnings.goldEarned, earnings.silverEarned), 1800);
        }

        // 📅 Deferred 1st Day Daily Bonus — presented at Stage 2+ so initial onboarding stays clean!
        if (this.levelIdx >= 1 && !this._dailyPromptShownThisSession && economy.canClaimDailyBonus()) {
          this._dailyPromptShownThisSession = true;
          setTimeout(() => this._openDailyBonusModal(), 2600);
        }
      }
    } catch (err) {
      console.error('[Win] Critical error in _win():', err);
      this._showOnly('win');
    }
  }

  // ─── 🌟 Multi-Chapter Magical Secret Message System ───────
  // Chapters progress automatically upon completion or can be customized via VIP modal
  _getSecretChapters() {
    return [
      {
        chapter: 1,
        title: 'Apology',
        message: "Sorry I apologise for my behaviour and you are truly awesome please forgive me"
      },
      {
        chapter: 2,
        title: 'Gratitude',
        message: "You bring genuine happiness positive energy and bright smiles every single day thank you so much"
      },
      {
        chapter: 3,
        title: 'Friendship',
        message: "True companions always stand strong together through all adventures no matter what comes"
      },
      {
        chapter: 4,
        title: 'Royal Praise',
        message: "Nobody in this entire kingdom compares to your incredible humor charm and golden royal heart"
      },
      {
        chapter: 5,
        title: 'Blessings',
        message: "May your realm forever be filled with grand victories endless laughter and prosperity"
      }
    ];
  }

  _isBossModeActive() {
    return Boolean(economy.bossModeContinuous || customTargets.active);
  }

  _updateWordRevealVisibility() {
    const panel = document.getElementById('word-reveal-panel');
    if (!panel) return;
    // Keep off the active playfield during shooting so it never obstructs aiming or cannonballs!
    panel.classList.add('hidden');
  }

  _renderWinSecretBox(newWord = null) {
    const box = document.getElementById('win-secret-box');
    const titleEl = document.getElementById('win-secret-title');
    const countEl = document.getElementById('win-secret-count');
    const wordsDiv = document.getElementById('win-secret-words');
    if (!box || !wordsDiv) return;

    const ch = this._getCurrentChapter();
    const words = this._getRevealWords();
    const revealedCount = Math.min(words.length, this._chapterWordIdx);

    if (titleEl) titleEl.textContent = `SECRET MESSAGE · CH. ${ch.chapter}: ${ch.title.toUpperCase()}`;
    if (countEl) countEl.textContent = `${revealedCount}/${words.length} WORDS`;

    wordsDiv.innerHTML = '';
    for (let i = 0; i < revealedCount; i++) {
      const chip = document.createElement('span');
      chip.className = 'win-secret-word-chip';
      chip.textContent = words[i];
      if (newWord && words[i] === newWord && i === revealedCount - 1) {
        chip.classList.add('newly-unlocked');
      }
      wordsDiv.appendChild(chip);
    }

    if (revealedCount < words.length) {
      const placeholder = document.createElement('span');
      placeholder.style.cssText = 'font-size:10px;color:rgba(255,215,0,0.5);font-style:italic;margin-left:4px;';
      placeholder.textContent = '...more unlocking next level!';
      wordsDiv.appendChild(placeholder);
    }
  }

  _getCurrentChapter() {
    const customMsg = localStorage.getItem('rsCustomSecretMessage');
    if (customMsg && customMsg.trim().length > 0) {
      return {
        chapter: 'VIP',
        title: 'Custom Note',
        message: customMsg.trim()
      };
    }
    const chapters = this._getSecretChapters();
    const chapterIdx = parseInt(localStorage.getItem('rsSecretChapterIdx') || '0', 10);
    return chapters[chapterIdx % chapters.length];
  }

  _getRevealWords() {
    const ch = this._getCurrentChapter();
    return ch.message.split(/\s+/).filter(Boolean);
  }

  _initWordReveal() {
    this._chapterWordIdx = parseInt(localStorage.getItem('rsChapterWordIdx') || '0', 10);
    const panel = document.getElementById('word-reveal-panel');
    const wordsDiv = document.getElementById('word-reveal-words');
    const labelEl = document.getElementById('wrp-label-text');
    if (!panel || !wordsDiv) return;

    // Miniature Boss Avatar Above Secret Message
    const updateBossAvatar = () => {
      const bossImg = document.getElementById('wrp-boss-img');
      if (!bossImg) return;
      const url = customTargets.getNormalUrl();
      if (url) {
        bossImg.src = url;
      }
    };
    updateBossAvatar();
    customTargets.onChange(updateBossAvatar);

    const ch = this._getCurrentChapter();
    const words = this._getRevealWords();
    if (labelEl) labelEl.textContent = `Ch.${ch.chapter}: ${ch.title}`;

    wordsDiv.innerHTML = '';

    // Render already-revealed words
    const revealedCount = Math.min(this._chapterWordIdx, words.length);
    for (let i = 0; i < revealedCount; i++) {
      const chip = document.createElement('span');
      chip.className = 'wrp-word-chip';
      chip.style.animationDuration = '0s';
      chip.style.opacity = '1';
      chip.style.transform = 'none';
      chip.textContent = words[i];
      wordsDiv.appendChild(chip);
    }

    if (this._chapterWordIdx >= words.length) {
      const done = document.createElement('span');
      done.className = 'wrp-word-chip';
      done.style.animation = 'none'; done.style.opacity = '1'; done.style.transform = 'none';
      done.style.background = 'linear-gradient(135deg, #ffd700, #f59e0b)';
      done.style.color = '#1a1a00';
      done.textContent = '🎉 Chapter Done!';
      wordsDiv.appendChild(done);
    }

    this._updateWordRevealProgress();
    this._updateWordRevealVisibility();
    this._renderWinSecretBox();
  }

  _updateWordRevealProgress() {
    const ch = this._getCurrentChapter();
    const words = this._getRevealWords();
    const el = document.getElementById('wrp-progress-txt');
    if (!el) return;
    const remaining = words.length - this._chapterWordIdx;
    if (remaining <= 0) {
      el.textContent = `🌟 Chapter ${ch.chapter} completed! Tap Next!`;
    } else {
      el.textContent = `${remaining} word${remaining !== 1 ? 's' : ''} remaining...`;
    }
  }

  _revealNextWord() {
    const panel = document.getElementById('word-reveal-panel');
    const wordsDiv = document.getElementById('word-reveal-words');
    const popup = document.getElementById('word-reveal-popup');
    const popupWord = document.getElementById('word-reveal-popup-word');

    let ch = this._getCurrentChapter();
    let words = this._getRevealWords();

    // If current chapter was fully completed previously, advance automatically to next chapter!
    if (this._chapterWordIdx >= words.length) {
      let curChapterIdx = parseInt(localStorage.getItem('rsSecretChapterIdx') || '0', 10);
      curChapterIdx = (curChapterIdx + 1) % this._getSecretChapters().length;
      localStorage.setItem('rsSecretChapterIdx', curChapterIdx);
      this._chapterWordIdx = 0;
      localStorage.setItem('rsChapterWordIdx', '0');
      ch = this._getCurrentChapter();
      words = this._getRevealWords();

      const labelEl = document.getElementById('wrp-label-text');
      if (labelEl) labelEl.textContent = `Ch.${ch.chapter}: ${ch.title}`;
      if (wordsDiv) wordsDiv.innerHTML = '';
    }

    const word = words[this._chapterWordIdx];
    this._chapterWordIdx++;
    localStorage.setItem('rsChapterWordIdx', this._chapterWordIdx);

    // 1. Add word chip to the scroll panel with bounce-in animation
    this._updateWordRevealVisibility();
    if (wordsDiv) {
      const chip = document.createElement('span');
      chip.className = 'wrp-word-chip';
      chip.textContent = word;
      wordsDiv.appendChild(chip);
    }

    // 2. Render on Victory Screen card with shiny highlight
    this._renderWinSecretBox(word);

    // 3. Show center-screen popup above all screens
    if (popup && popupWord) {
      this.audio?.playCoinClink?.();
      popupWord.textContent = word;
      popup.classList.remove('hidden', 'hiding');
      popup.classList.add('showing');

      // Dismiss popup after 2.2s
      setTimeout(() => {
        popup.classList.remove('showing');
        popup.classList.add('hiding');
        setTimeout(() => {
          popup.classList.add('hidden');
          popup.classList.remove('hiding');
        }, 420);
      }, 2200);
    }

    this._updateWordRevealProgress();

    // 4. Check if all words in this chapter are now revealed
    if (this._chapterWordIdx >= words.length) {
      setTimeout(() => {
        const done = document.createElement('span');
        done.className = 'wrp-word-chip';
        done.style.background = 'linear-gradient(135deg, #ffd700, #f59e0b)';
        done.style.color = '#1a1a00';
        done.textContent = '🎉 Chapter Done!';
        if (wordsDiv) wordsDiv.appendChild(done);
        this._showCombo(`👑 CHAPTER ${ch.chapter} COMPLETED! NEXT CHAPTER UNLOCKED!`);
        this._updateWordRevealProgress();
        this._renderWinSecretBox();
      }, 800);
    }
  }

  _showDramaticGoldJackpot(goldCount, silverCount) {
    if (!this.$.goldOverlay) return;
    this.audio?.playPalaceFanfare();
    this.particles?.createFlowerShower(60);

    if (this.$.goldDramaticNum) this.$.goldDramaticNum.textContent = '0';
    if (this.$.silverDramaticNum) this.$.silverDramaticNum.textContent = '0';
    this.$.goldOverlay.classList.remove('hidden');

    let curG = 0, curS = 0;
    const gStep = Math.max(1, Math.ceil(goldCount / 15));
    const sStep = Math.max(1, Math.ceil(silverCount / 15));

    const tallyInt = setInterval(() => {
      curG = Math.min(goldCount, curG + gStep);
      curS = Math.min(silverCount, curS + sStep);
      if (this.$.goldDramaticNum) this.$.goldDramaticNum.textContent = curG;
      if (this.$.silverDramaticNum) this.$.silverDramaticNum.textContent = curS;
      this.audio?.playCoinClink();

      if (curG >= goldCount && curS >= silverCount) {
        clearInterval(tallyInt);
      }
    }, 60);

    const claimHandler = () => {
      this.$.goldOverlay?.classList.add('hidden');
      this._triggerFlyingCoins(20);
      this.$.claimGoldBtn?.removeEventListener('click', claimHandler);
    };
    this.$.claimGoldBtn?.addEventListener('click', claimHandler);
  }

  _triggerFlyingCoins(count = 14) {
    if (!this.$.flyingContainer) return;
    const targetRect = this.$.hud?.querySelector('.hud-coins')?.getBoundingClientRect() ||
                       { left: window.innerWidth - 60, top: 20 };

    for (let i = 0; i < count; i++) {
      setTimeout(() => {
        const coin = document.createElement('div');
        coin.className = 'flying-coin';
        coin.textContent = (i % 2 === 0) ? '🪙' : '⚪';

        const startX = window.innerWidth / 2 + (Math.random() - 0.5) * 160;
        const startY = window.innerHeight / 2 + (Math.random() - 0.5) * 120;

        coin.style.left = `${startX}px`;
        coin.style.top = `${startY}px`;
        this.$.flyingContainer.appendChild(coin);

        const destX = targetRect.left + 25;
        const destY = targetRect.top + 15;

        const anim = coin.animate([
          { transform: 'translate(-50%, -50%) scale(1.6)', opacity: 1 },
          { transform: `translate(${destX - startX}px, ${destY - startY}px) scale(0.6)`, opacity: 0.95 }
        ], { duration: 650, easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)' });

        anim.onfinish = () => {
          coin.remove();
          this.audio?.playCoinClink();
          const badge = this.$.hud?.querySelector('.hud-coins');
          if (badge) {
            badge.classList.remove('coin-wallet-pulse');
            badge.offsetWidth;
            badge.classList.add('coin-wallet-pulse');
          }
        };
      }, i * 45);
    }
  }

  _onShotsDepleted(standing) {
    this._openContinueModal('shots', standing);
  }

  _onTimeExpired() {
    this._openContinueModal('time', this.gameObjs.filter(o => o.isCan && !o.fallen).length);
  }

  _openContinueModal(type, remainingTargets, isMidGame = false) {
    if (this.state === S.WIN) return;
    if (remainingTargets <= 0) return;
    if (this._lastShotDepletedTimer) {
      clearTimeout(this._lastShotDepletedTimer);
      this._lastShotDepletedTimer = null;
    }
    this._continueOrigin = isMidGame ? 'midgame' : 'depleted';
    this._wasTimerRunning = this._timerRunning;
    if (!isMidGame) {
      this.state = S.LOSE;
      this._gameResolved = true;
    }
    this._timerRunning = false;
    this.physics?.pause();

    // Clean up any in-flight comic reaction or combo text so nothing is trapped behind or before the modal
    if (this.$.comic) this.$.comic.classList.add('hidden');
    if (this.$.combo) this.$.combo.classList.add('hidden');

    this._continueType = type; // 'time' or 'shots'
    const price = economy.getContinuePrice(type, this._continueCount);
    const titleEl = document.getElementById('continue-title');
    const subEl   = document.getElementById('continue-sub');
    const adBtn   = document.getElementById('continue-ad-btn');
    const adTxt   = document.getElementById('continue-ad-txt');
    const coinBtn = document.getElementById('continue-coin-btn');
    const goldBtn = document.getElementById('continue-gold-btn');
    const coinTxt = document.getElementById('continue-coin-txt');
    const goldTxt = document.getElementById('continue-gold-txt');
    const retryBtn = document.getElementById('continue-retry-btn');

    // Limit Free Ad Continue to 1 per level so coin economy stays meaningful
    if (adBtn) {
      adBtn.style.display = this._adContinueUsedThisLevel ? 'none' : '';
    }

    if (type === 'time') {
      if (titleEl) titleEl.textContent = isMidGame ? '⏱️ EXTEND TIME!' : '⏱️ TIME EXPIRED!';
      if (subEl)   subEl.textContent   = isMidGame
        ? `Need extra time to plan your strike? Extend time by +25 seconds!`
        : `Only ${remainingTargets} target(s) left! Extend time by +25 seconds to win!`;
      if (adTxt)   adTxt.textContent   = 'WATCH AD FOR +25s TIME';
      if (coinTxt) coinTxt.textContent = `BUY +25s TIME (${price.silver} Silver)`;
      if (goldTxt) goldTxt.textContent = `BUY +25s TIME (${price.gold} Gold)`;
      if (coinBtn && !coinTxt) coinBtn.innerHTML = `⚪ BUY +25s TIME (${price.silver} Silver)`;
      if (goldBtn && !goldTxt) goldBtn.innerHTML = `🪙 BUY +25s TIME (${price.gold} Gold)`;
    } else {
      if (titleEl) titleEl.textContent = isMidGame ? '👑 REFILL SHOTS!' : '👑 OUT OF SHOTS!';
      if (subEl)   subEl.textContent   = isMidGame
        ? `Need more ammunition for your siege? Get +5 more shots!`
        : `${remainingTargets} block(s) still standing! Get +5 more shots to crush them!`;
      if (adTxt)   adTxt.textContent   = 'WATCH AD FOR +5 SHOTS';
      if (coinTxt) coinTxt.textContent = `BUY +5 SHOTS (${price.silver} Silver)`;
      if (goldTxt) goldTxt.textContent = `BUY +5 SHOTS (${price.gold} Gold)`;
      if (coinBtn && !coinTxt) coinBtn.innerHTML = `⚪ BUY +5 SHOTS (${price.silver} Silver)`;
      if (goldBtn && !goldTxt) goldBtn.innerHTML = `🪙 BUY +5 SHOTS (${price.gold} Gold)`;
    }

    if (retryBtn) {
      retryBtn.textContent = isMidGame ? '◀ RESUME GAME' : '↺ GIVE UP & RETRY';
    }

    const modal = this.$.continueModal || document.getElementById('continue-modal');
    if (modal) modal.classList.remove('hidden');
  }

  _buyContinueWithCoins(useGold) {
    const type = this._continueType || 'shots';
    const success = economy.buyContinue(type, useGold, this._continueCount);
    if (success) {
      this._continueCount++;
      this._pendingContinue = null;
      this.$.continueModal?.classList.add('hidden');
      this._applyContinueReward(type);
      this._updateWalletDisplays();
    } else {
      const price = economy.getContinuePrice(type, this._continueCount);
      this._pendingContinue = { type, useGold };
      this.$.continueModal?.classList.add('hidden');
      if (useGold) {
        const needed = Math.max(1, price.gold - economy.goldCoins);
        this._showNeedCoinsPrompt(`Need ${needed} more Gold Coins (You have 🪙 ${economy.goldCoins}). Refill in Royal Vault to continue!`);
      } else {
        const needed = Math.max(1, price.silver - economy.silverCoins);
        this._showNeedCoinsPrompt(`Need ${needed} more Silver Coins (You have ⚪ ${economy.silverCoins}). Refill in Royal Vault to continue!`);
      }
    }
  }


  _watchRewardedAd(purpose = 'continue') {
    this._adRewardPurpose = purpose;
    this.$.continueModal?.classList.add('hidden');
    this.$.adOverlay?.classList.remove('hidden');

    let seconds = 5;
    const timerEl = document.getElementById('ad-countdown');
    const barEl = document.getElementById('ad-progress-bar');
    const closeBtn = document.getElementById('ad-close-btn');

    if (closeBtn) closeBtn.classList.add('hidden');
    if (barEl) barEl.style.width = '0%';

    this._adTimer = setInterval(() => {
      seconds--;
      if (timerEl) timerEl.textContent = `${seconds}s`;
      if (barEl) barEl.style.width = `${((5 - seconds) / 5) * 100}%`;

      if (seconds <= 0) {
        clearInterval(this._adTimer);
        if (closeBtn) closeBtn.classList.remove('hidden');
        if (timerEl) timerEl.textContent = '✓';
      }
    }, 1000);
  }

  _applyContinueReward(type = 'shots') {
    if (type === 'time') {
      this.timeLeft += 25;
      this.shotsLeft += 2;
      this._showCombo('+25s TIME & +2 BONUS SHOTS! ⏱️🔥');
    } else {
      this.shotsLeft += 5;
      this.timeLeft += 15;
      this._showCombo('+5 SHOTS & +15s BONUS TIME! 👑💥');
    }
    this._timerRunning = true;
    this._gameResolved = false;
    this.physics?.unpause();
    this.state = S.PLAYING;
    this._updateHUD();
    this._showOnly('hud');
  }

  _lose(standing) {
    this.state = S.LOSE;
    this._timerRunning = false;
    this.audio?.playGameOver();

    // 🔥 Crown Rush Streak breaks upon defeat (unless protected by Royal Shield in My Kingdom!)
    const streakRes = economy.resetWinStreak();
    if (streakRes?.savedByShield) {
      setTimeout(() => this._showCombo('🛡️ CROWN STREAK SAVED BY ROYAL SHIELD!'), 350);
    }

    // ❤️ Failed siege consumes 1 Royal Heart
    economy.consumeHeart();

    this._updateHUD();

    if (this.$.loseScore) this.$.loseScore.textContent = `${this.score} PTS`;
    this._showOnly('lose');
  }

  _updateHUD() {
    if (this.$.shots)   this.$.shots.textContent   = this.shotsLeft;
    if (this.$.targets) this.$.targets.textContent = this.gameObjs.filter(o => o.isCan && !o.fallen && !o.clearedFromTable && o.mesh && o.mesh.parent).length;
    if (this.$.level)   this.$.level.textContent   = this.levelIdx + 1;
    if (this.$.score)   this.$.score.textContent   = this.score;

    this._updateHeartsHUD();
    this._updateStreakHUD();
    this._updateStarChestHUD();
    this._updateWaveBadge();
  }

  // ─── ❤️ Royal Hearts (Lives / Energy) System ───────────────────────────────
  _initHeartsUI() {
    this.$.hudHeartsBtn?.addEventListener('click', () => this._openHeartsModal());
    this.$.heartsCloseBtn?.addEventListener('click', () => {
      this.$.heartsModal?.classList.add('hidden');
    });

    this.$.heartsRefillGoldBtn?.addEventListener('click', () => {
      const res = economy.refillHearts('gold');
      if (res.success) {
        this.audio?.playCoinClink();
        this._updateHeartsHUD();
        this._openHeartsModal();
        this._showComicReaction('HEARTS REFILLED! ❤️');
      } else {
        this._showNeedCoinsPrompt('Need more Gold to refill Royal Hearts.');
      }
    });

    this.$.heartsRefillAdBtn?.addEventListener('click', () => {
      this.$.heartsModal?.classList.add('hidden');
      this._watchRewardedAd('heart');
    });
  }

  _openHeartsModal() {
    if (!this.$.heartsModal) return;
    const state = economy.getHeartsState();
    if (this.$.heartsModalCount) {
      this.$.heartsModalCount.textContent = `${state.hearts} / ${state.maxHearts} Hearts Remaining`;
    }
    if (this.$.heartsModalTimer) {
      if (state.isFull) {
        this.$.heartsModalTimer.textContent = 'All Hearts Full! Ready for Siege!';
      } else {
        const mins = Math.floor(state.secondsToNext / 60);
        const secs = state.secondsToNext % 60;
        this.$.heartsModalTimer.textContent = `Next Heart in: ${mins}m ${secs < 10 ? '0' : ''}${secs}s`;
      }
    }
    this.$.heartsModal.classList.remove('hidden');
  }

  _updateHeartsHUD() {
    const state = economy.getHeartsState();
    if (this.$.hudHeartsCount) {
      this.$.hudHeartsCount.textContent = `${state.hearts}/${state.maxHearts}`;
    }
    if (this.$.hudHeartsBtn) {
      this.$.hudHeartsBtn.classList.toggle('low-hearts', state.hearts <= 1);
    }
    if (this.$.hudHeartsTimer) {
      if (!state.isFull && state.secondsToNext > 0) {
        const mins = Math.floor(state.secondsToNext / 60);
        const secs = state.secondsToNext % 60;
        this.$.hudHeartsTimer.textContent = `(${mins}:${secs < 10 ? '0' : ''}${secs})`;
      } else {
        this.$.hudHeartsTimer.textContent = '';
      }
    }
  }

  // ─── 🔥 Crown Rush Win-Streak Multiplier ───────────────────────────────────
  _updateStreakHUD() {
    if (!this.$.hudStreakBadge) return;
    if (economy.winStreak >= 1) {
      this.$.hudStreakBadge.classList.remove('hidden');
      const perk = economy.getStreakPerk();
      if (this.$.hudStreakText) {
        this.$.hudStreakText.textContent = `${perk.icon} STREAK ${economy.winStreak}`;
      }
    } else {
      this.$.hudStreakBadge.classList.add('hidden');
    }
  }

  // ─── ⭐ 3-Star Mastery & Royal Star Chest ──────────────────────────────────
  _initStarChestUI() {
    this.$.hudStarChestBtn?.addEventListener('click', () => {
      if (economy.canClaimStarChest()) {
        this._openStarChestModal();
      } else {
        this._showComicReaction(`⭐ ${economy.starChestProgress}/10 Stars! Master more stages!`);
      }
    });

    this.$.starChestClaimBtn?.addEventListener('click', () => {
      const reward = economy.claimStarChest();
      this.$.starChestModal?.classList.add('hidden');
      if (reward) {
        this._triggerFlyingCoins(25);
        this.audio?.playPalaceFanfare();
        this.particles?.createGrandCelebration();
        this._updateWalletDisplays();
        this._updateHUD();
      }
    });

    document.getElementById('star-chest-close-btn')?.addEventListener('click', () => {
      this.$.starChestModal?.classList.add('hidden');
    });
  }

  _openStarChestModal() {
    if (!this.$.starChestModal) return;
    this.$.starChestModal.classList.remove('hidden');
    this.audio?.playPalaceFanfare();
    this.particles?.createGrandCelebration();
  }

  _updateStarChestHUD() {
    if (!this.$.hudStarChestBtn) return;
    if (this.$.hudStarChestTxt) {
      this.$.hudStarChestTxt.textContent = `${economy.starChestProgress}/10`;
    }
    this.$.hudStarChestBtn.classList.toggle('chest-ready', economy.canClaimStarChest());
  }

  // ─── 🌊 Multi-Wave Siege Indicator ────────────────────────────────────────
  _updateWaveBadge() {
    if (!this.$.hudWaveBadge) return;
    if (this.totalWaves > 1) {
      this.$.hudWaveBadge.classList.remove('hidden');
      if (this.$.hudWaveText) {
        this.$.hudWaveText.textContent = `WAVE ${this.currentWave}/${this.totalWaves}`;
      }
    } else {
      this.$.hudWaveBadge.classList.add('hidden');
    }
  }

  // ─── 🏰 My Kingdom Castle Restoration Meta-Game ───────────────────────────
  _initKingdomUI() {
    const openHandler = (e) => {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      this._openKingdomModal();
    };

    const closeHandler = (e) => {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      this._closeKingdomModal();
    };

    ['click', 'touchend'].forEach(evt => {
      this.$.hudKingdomBtn?.addEventListener(evt, openHandler, { passive: false });
      this.$.menuKingdomBtn?.addEventListener(evt, openHandler, { passive: false });
      this.$.winKingdomBtn?.addEventListener(evt, openHandler, { passive: false });
      this.$.kingdomCloseBtn?.addEventListener(evt, closeHandler, { passive: false });
    });

    // Delegated click support for dynamic elements & buttons anywhere in DOM
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('#hud-kingdom-btn, #menu-kingdom-btn, #win-kingdom-btn, .btn-kingdom-menu, .btn-kingdom-win');
      if (btn) {
        e.preventDefault();
        e.stopPropagation();
        this._openKingdomModal();
      }
      if (e.target.closest('#kingdom-close-btn')) {
        e.preventDefault();
        e.stopPropagation();
        this._closeKingdomModal();
      }
    });

    // Area tab clicking
    const tabs = this.$.kingdomTabsRow?.querySelectorAll('.kingdom-tab');
    tabs?.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const areaId = tab.dataset.area;
        economy.kingdom.currentArea = areaId;
        economy._save();
        this._renderKingdomArea(areaId);
      });
    });
  }

  _openKingdomModal() {
    if (!this.$.kingdomModal) return;
    this._wasTimerRunning = this._timerRunning;
    this._timerRunning = false;
    this.physics?.pause();
    this.$.kingdomModal.classList.remove('hidden');
    if (this.$.kingdomStarsAvail) {
      this.$.kingdomStarsAvail.textContent = economy.starsCount;
    }
    const currentArea = economy.kingdom.currentArea || 'throne_room';
    const activeTab = this.$.kingdomTabsRow?.querySelector(`[data-area="${currentArea}"]`);
    if (activeTab) {
      this.$.kingdomTabsRow?.querySelectorAll('.kingdom-tab').forEach(t => t.classList.remove('active'));
      activeTab.classList.add('active');
    }
    this._renderKingdomArea(currentArea);
  }

  _closeKingdomModal() {
    if (!this.$.kingdomModal) return;
    this.$.kingdomModal.classList.add('hidden');
    if (this.state === S.PLAYING) {
      this.physics?.resume();
      if (this._wasTimerRunning) {
        this._timerRunning = true;
      }
    }
  }

  _renderKingdomArea(areaId) {
    if (!this.$.kingdomItemsGrid) return;
    this.$.kingdomItemsGrid.innerHTML = '';

    const catalog = economy.getKingdomCatalog();
    const area = catalog.find(a => a.id === areaId) || catalog[0];

    if (this.$.kingdomAreaTitle) this.$.kingdomAreaTitle.textContent = `${area.icon} ${area.name}`;
    if (this.$.kingdomStarsAvail) this.$.kingdomStarsAvail.textContent = economy.starsCount;

    area.items.forEach(item => {
      const card = document.createElement('div');
      const isRestored = economy.isKingdomItemRestored(item.id);
      card.className = `kingdom-item-card ${isRestored ? 'restored' : ''}`;

      card.innerHTML = `
        <div class="kic-left">
          <div class="kic-icon">${item.icon}</div>
          <div class="kic-details">
            <div class="kic-name">${item.name}</div>
            <div class="kic-perk">✨ ${item.perk}</div>
          </div>
        </div>
        <div class="kic-right">
          ${isRestored
            ? `<div class="kic-restored-tag">✓ RESTORED</div>`
            : `<button class="btn-kic-restore" data-id="${item.id}">⭐ RESTORE (${item.cost})</button>`
          }
        </div>
      `;

      if (!isRestored) {
        const btn = card.querySelector('.btn-kic-restore');
        btn?.addEventListener('click', () => {
          const res = economy.restoreKingdomItem(item.id);
          if (res.success) {
            this.audio?.playVictoryFanfare();
            economy.vibrate([30, 40, 30]);
            this.particles?.createFlowerShower(35);
            this._showComicReaction('RESTORED! 🏰');
            if (res.bonusGold > 0) {
              this._showCombo(`🌳 ROYAL GARDENS COMPLETED! +${res.bonusGold} GOLD COINS! 🪙`);
              this._triggerFlyingCoins(20);
            }
            this._renderKingdomArea(areaId);
            this._updateWalletDisplays();
            this._updateHUD();
          } else {
            alert(res.message);
          }
        });
      }

      this.$.kingdomItemsGrid.appendChild(card);
    });
  }

  // ─── 👑 Royal Fever Mode Activation ─────────────────────────────────────────
  _activateRoyalFever() {
    this._isFeverShot = false;
    const pts = Math.round(500 * economy.getKingdomScoreMultiplier());
    this.score += pts;
    this.audio?.playSparkleBoom?.();
    this.particles?.createFlowerShower(45);
    this._showCombo(`👑 ROYAL COMBO CELEBRATION! +${pts} PTS! ⚡`);
    document.body.classList.add('royal-fever-active');
    setTimeout(() => document.body.classList.remove('royal-fever-active'), 3500);
  }

  _showCombo(text) {
    if (!this.$.combo) return;
    this.$.combo.textContent = text;
    this.$.combo.classList.remove('hidden');
    this.$.combo.style.animation = 'none';
    this.$.combo.offsetHeight;
    this.$.combo.style.animation = '';
    setTimeout(() => this.$.combo?.classList.add('hidden'), 2200);
  }

  _progress(pct, msg) {
    if (this.$.bar) this.$.bar.style.width = `${pct}%`;
    const sub = document.querySelector('.loading-sub');
    if (sub) sub.textContent = msg;
  }

  _delay(ms) { return new Promise(r => setTimeout(r, ms)); }
}

function _startRoyalSmash() {
  // 🔒 VIP Passcode Security Gate Check (Passcode: Biryani)
  if (!window._isVipAuthorized) {
    console.log('[VIP Gate] Protected — waiting for VIP Passcode authorization.');
    return;
  }
  if (window._royalSmashStarted) return;
  window._royalSmashStarted = true;
  try {
    window._game = new RoyalSmash();
  } catch (err) {
    console.error('[RoyalSmash] Startup Fatal Error:', err);
    const sub = document.getElementById('loading-sub');
    if (sub) {
      sub.innerHTML = '⚠️ Startup error: ' + (err.message || err);
      sub.style.color = '#ff6666';
    }
    const btn = document.getElementById('loading-retry-btn');
    if (btn) {
      btn.style.display = 'block';
      btn.textContent = '🔄 RELOAD';
      btn.onclick = () => window.location.reload(true);
    }
  }
}

window._manualStartRoyalSmash = _startRoyalSmash;

if (window._isVipAuthorized) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', _startRoyalSmash);
  } else {
    _startRoyalSmash();
  }
}

