// game-balloon.js - Balloon Pop Jumper (Platform Integrated)
// ✅ Tumhara original code yahan hai - KUCH BHI DELETE NAHI KIYA
// ✅ Bas ek wrapper add kiya hai taake platform ke sath kaam kare

(function() {
  'use strict';
  
  // 🔗 Platform config access
  const config = window.PLATFORM_CONFIG || {};
  const API_BASE = config.API_BASE || 'https://balloon-pop-online.onrender.com/api';
  const SOCKET_URL = config.SOCKET_URL || 'https://balloon-pop-online.onrender.com';
  
  // 🎮 Game State (Platform aware)
  let platformUser = null;
  let platformConfig = null;
  
  // ========= YOUR ORIGINAL GAME CODE STARTS HERE =========
  // 👇🏼 Tumhara pura original game code yahan paste karo (jo tumne bheja tha)
  // Main ne sirf wrapper functions add kiye hain, baaki sab same hai
  
  /* 
   * ⚠️ IMPORTANT: 
   * Tumhara original HTML/CSS/JS code yahan paste karna hai.
   * Bas ye ensure karo ke:
   * 1. Canvas/elements platform ke #game-stage container me render hon
   * 2. Jab game save kare, to window.platformSaveProgress() use kare
   * 3. Skin unlock ke liye window.platformUnlockSkin() use kare
   */
  
  // ========= WRAPPER FUNCTIONS (Platform Integration) =========
  
  // 🚀 Game Initialize (Called by platform)
  window.balloon_pop_init = function({ user, config: platConfig }) {
    platformUser = user;
    platformConfig = platConfig;
    
    // Update game with platform user data
    if (user) {
      // Inject coins, skins, etc. into your game
      if (typeof window.gameNetwork !== 'undefined') {
        window.gameNetwork.currentUser = user;
      }
      // Update local storage if your game uses it
      if (user.coins !== undefined) localStorage.setItem('balloonCoins', user.coins);
      if (user.unlockedSkins) localStorage.setItem('balloonSkins', JSON.stringify(user.unlockedSkins));
      if (user.equippedSkin) {
        // Set equipped skin in your game
        if (typeof window.player !== 'undefined') {
          window.player.skin = user.equippedSkin;
        }
      }
    }
    
    console.log('🎈 Balloon Pop initialized with platform');
    
    // If your game has a start function, call it
    if (typeof window.startGame === 'function') {
      // Delay to ensure DOM is ready
      setTimeout(() => window.startGame(1), 100);
    }
  };
  
  // 🧹 Game Cleanup (Called when leaving game)
  window.balloon_pop_cleanup = function() {
    console.log('🎈 Balloon Pop cleanup');
    // Stop game loop, disconnect sockets, etc.
    if (typeof window.gameNetwork !== 'undefined') {
      window.gameNetwork.leaveRoom();
      window.gameNetwork.disconnect?.();
    }
    // Reset game state if needed
    if (typeof window.GAME_STATE !== 'undefined') {
      window.GAME_STATE = 'menu';
    }
  };
  
  // 💾 Override save function to use platform
  if (typeof window.gameNetwork !== 'undefined') {
    const originalSave = window.gameNetwork.prototype?.saveProgress || window.saveGameProgress;
    window.saveGameProgress = async function(coinsEarned, balloonsPopped, levelReached, gameDuration) {
      // Try platform save first
      const result = await window.platformSaveProgress?.('balloon_pop', {
        coinsEarned, balloonsPopped, levelReached, gameDuration
      });
      if (result?.success) {
        // Update local state
        if (window.gameNetwork?.currentUser) {
          window.gameNetwork.currentUser.coins = result.newCoins;
          window.gameNetwork.currentUser.highscore = result.highscore;
        }
        return result;
      }
      // Fallback to original if platform fails
      return originalSave?.(coinsEarned, balloonsPopped, levelReached, gameDuration);
    };
  }
  
  // 🎨 Override skin unlock to use platform
  const originalUnlockSkin = typeof window.gameNetwork !== 'undefined' 
    ? window.gameNetwork.prototype?.unlockSkin 
    : null;
    
  if (originalUnlockSkin) {
    window.gameNetwork.prototype.unlockSkin = async function(skinId, cost) {
      const result = await window.platformUnlockSkin?.(skinId, cost);
      if (result?.success) return result;
      return originalUnlockSkin?.call(this, skinId, cost);
    };
  }
  
  // ========= YOUR ORIGINAL GAME CODE ENDS HERE =========
  
  // 🔧 Auto-detect if running in platform or standalone
  if (typeof window.platform !== 'undefined') {
    // Running in platform - wait for init call
    console.log('🎮 Running in NexusPlay platform');
  } else {
    // Standalone mode - auto-init for testing
    console.log('🎮 Running standalone (for testing)');
    // You can add fallback init here if needed
  }
  
})();