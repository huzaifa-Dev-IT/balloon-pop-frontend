// platform.js - Platform UI & Navigation
// Handles: Dashboard, Game Launch, Auth, Toasts

(function() {
  'use strict';
  
  const config = window.PLATFORM_CONFIG;
  let currentUser = null;
  let currentGame = null;
  
  // DOM Elements
  const els = {
    dashboard: document.getElementById('dashboard-view'),
    gameView: document.getElementById('game-view'),
    gameStage: document.getElementById('game-stage'),
    gamesList: document.getElementById('games-list'),
    loginModal: document.getElementById('login-modal'),
    usernameInput: document.getElementById('username-input'),
    loginBtn: document.getElementById('login-btn'),
    authUi: document.getElementById('auth-ui'),
    loginTrigger: document.getElementById('login-trigger'),
    uiUser: document.getElementById('ui-user'),
    uiCoins: document.getElementById('ui-coins'),
    gameCoins: document.getElementById('game-coins'),
    gameTitle: document.getElementById('game-title'),
    backBtn: document.getElementById('back-btn'),
    toast: document.getElementById('toast')
  };
  
  // 🔔 Toast Notification
  function toast(msg, type = 'info') {
    els.toast.textContent = msg;
    els.toast.className = `toast show ${type === 'error' ? 'error' : ''}`;
    setTimeout(() => els.toast.classList.remove('show'), 3000);
  }
  
  // 🔐 Auth Functions
  async function login(username) {
    try {
      const res = await fetch(`${config.API_BASE}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username })
      });
      const data = await res.json();
      if (data.success) {
        currentUser = data.user;
        localStorage.setItem('nexus_user', username);
        updateAuthUI();
        els.loginModal.classList.remove('active');
        toast(data.message || 'Welcome!', 'success');
        return true;
      }
      toast(data.message || 'Login failed', 'error');
      return false;
    } catch (e) {
      toast('Network error. Check connection.', 'error');
      return false;
    }
  }
  
  function updateAuthUI() {
    if (!currentUser) return;
    els.authUi.style.display = 'flex';
    els.loginTrigger.style.display = 'none';
    els.uiUser.textContent = currentUser.username;
    els.uiCoins.textContent = `🪙 ${currentUser.coins}`;
    els.gameCoins.textContent = `🪙 ${currentUser.coins}`;
  }
  
  function logout() {
    currentUser = null;
    localStorage.removeItem('nexus_user');
    location.reload();
  }
  
  // 🎮 Game Functions
  function renderGames() {
    if (!els.gamesList) return;
    els.gamesList.innerHTML = config.GAMES.map(game => `
      <div class="game-card" data-game-id="${game.id}">
        <div class="card-thumb" style="background: linear-gradient(45deg, ${game.color}22, ${game.color}44)">
          ${game.icon}
        </div>
        <div class="card-info">
          <h3>${game.name}</h3>
          <p>${game.description}</p>
          <div>${game.tags.map(t => `<span class="tag">${t}</span>`).join('')}</div>
        </div>
      </div>
    `).join('');
    
    // Add click listeners
    document.querySelectorAll('.game-card').forEach(card => {
      card.addEventListener('click', () => {
        const gameId = card.dataset.gameId;
        launchGame(gameId);
      });
    });
  }
  
  async function launchGame(gameId) {
    const game = config.GAMES.find(g => g.id === gameId);
    if (!game) return toast('Game not found', 'error');
    
    // Check auth
    if (!currentUser) {
      els.loginModal.classList.add('active');
      return;
    }
    
    currentGame = game;
    els.gameTitle.textContent = game.name;
    
    // Switch views
    els.dashboard.classList.remove('active');
    els.gameView.classList.add('active');
    
    // Load game script dynamically
    try {
      await loadGameScript(game.file);
      // Initialize game if it has init function
      if (window[game.id + '_init'] && typeof window[game.id + '_init'] === 'function') {
        window[game.id + '_init']({ user: currentUser, config });
      }
      toast(`🎮 Loading ${game.name}...`, 'success');
    } catch (e) {
      toast('Failed to load game', 'error');
      console.error(e);
    }
  }
  
  function loadGameScript(filename) {
    return new Promise((resolve, reject) => {
      if (document.querySelector(`script[src="${filename}"]`)) {
        resolve();
        return;
      }
      const script = document.createElement('script');
      script.src = filename;
      script.onload = resolve;
      script.onerror = reject;
      document.body.appendChild(script);
    });
  }
  
  function closeGame() {
    // Call game cleanup if exists
    if (currentGame && window[currentGame.id + '_cleanup'] && typeof window[currentGame.id + '_cleanup'] === 'function') {
      window[currentGame.id + '_cleanup']();
    }
    
    els.gameView.classList.remove('active');
    els.dashboard.classList.add('active');
    els.gameStage.innerHTML = ''; // Clear game container
    currentGame = null;
  }
  
  // 💾 Save Progress (Global function for games to use)
  window.platformSaveProgress = async function(gameId, data) {
    if (!currentUser) return null;
    try {
      const res = await fetch(`${config.API_BASE}/user/${currentUser.username}/save-progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, gameId })
      });
      return await res.json();
    } catch (e) {
      console.error('Save failed:', e);
      return null;
    }
  };
  
  // 🎨 Skin Unlock (Global function)
  window.platformUnlockSkin = async function(skinId, cost) {
    if (!currentUser) return { success: false, error: 'Not logged in' };
    try {
      const res = await fetch(`${config.API_BASE}/user/${currentUser.username}/unlock-skin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ skinId, cost })
      });
      const result = await res.json();
      if (result.success && currentUser) {
        currentUser.coins = result.newCoins;
        currentUser.unlockedSkins = result.unlockedSkins;
        updateAuthUI();
      }
      return result;
    } catch (e) {
      return { success: false, error: 'Network error' };
    }
  };
  
  // 🎮 Event Listeners
  function setupEvents() {
    // Login
    els.loginBtn?.addEventListener('click', async () => {
      const username = els.usernameInput?.value.trim();
      if (!username || username.length < 3) {
        toast('Username must be 3+ characters', 'error');
        return;
      }
      els.loginBtn.disabled = true;
      els.loginBtn.textContent = 'Connecting...';
      await login(username);
      els.loginBtn.disabled = false;
      els.loginBtn.textContent = '🚀 Enter Platform';
    });
    
    // Back button
    els.backBtn?.addEventListener('click', closeGame);
    
    // Logout
    document.querySelector('[data-action="logout"]')?.addEventListener('click', logout);
    
    // Keyboard: ESC to close game
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && currentGame) closeGame();
    });
  }
  
  // 🚀 Init
  function init() {
    // Load saved user
    const savedUser = localStorage.getItem('nexus_user');
    if (savedUser) {
      // Auto-login (silent)
      login(savedUser).then(success => {
        if (!success) localStorage.removeItem('nexus_user');
      });
    }
    
    renderGames();
    setupEvents();
    
    // Hide login modal if user already loaded
    if (currentUser) {
      els.loginModal.classList.remove('active');
    }
    
    console.log('🎮 NexusPlay Platform Ready');
  }
  
  // Expose global functions
  window.platform = {
    toast,
    getUser: () => currentUser,
    getCurrentGame: () => currentGame,
    closeGame,
    launchGame
  };
  
  // Start when DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();