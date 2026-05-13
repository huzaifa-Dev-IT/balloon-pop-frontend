// config.js - Platform Configuration
// Copy-paste ready. Bas deploy ke baad verify karo.

window.PLATFORM_CONFIG = {
  // 🔗 Backend URLs (Render)
  API_BASE: 'https://balloon-pop-online.onrender.com/api',
  SOCKET_URL: 'https://balloon-pop-online.onrender.com',
  
  // 🎮 Games Database (Future games yahan add karna)
  GAMES: [
    {
      id: 'balloon_pop',
      name: 'Balloon Pop Jumper',
      description: 'Pop balloons, avoid spikes & lasers!',
      icon: '🎈',
      tags: ['Arcade', 'Multiplayer', 'Skill'],
      file: 'game-balloon.js', // Game script file name
      color: '#ec4899'
    }
    // 🔹 Naya game add karne ka format:
    // {
    //   id: 'car_racer',
    //   name: 'Neon Racer',
    //   description: 'Coming soon...',
    //   icon: '🏎️',
    //   tags: ['Racing', 'Coming Soon'],
    //   file: 'game-racer.js',
    //   color: '#3b82f6'
    // }
  ],
  
  // 🎨 Platform Theme
  theme: {
    primary: '#8b5cf6',
    accent: '#06b6d4',
    bg: '#0b0e14',
    card: '#121725'
  }
};