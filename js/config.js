// config.js - HYDROFIT Configuration
const CONFIG = {
  // REPLACE WITH YOUR ACTUAL APPS SCRIPT URL
  API_URL: 'https://script.google.com/macros/s/AKfycbxCqhLzK73ERl5btA5J97uy5o0hwqCDNk2yrARqiI5ZfdbBXpT5u4s8x_8lYTL8mIgO6A/exec',
  
  APP_VERSION: '2.0.0',
  POINTS_PER_WORKOUT: 50,
  LEVEL_UP_BASE: 500
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = CONFIG;
}