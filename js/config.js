// config.js - HYDROFIT Configuration
const CONFIG = {
  // REPLACE WITH YOUR ACTUAL APPS SCRIPT URL
  API_URL: 'https://script.google.com/macros/s/AKfycbyKr9g1c7n7tSczvE2hcQRjz4m3Q14YINUfKXm4Bb8SM-l2vb2CPQZVYTQb_DIlj50pcw/exec',
  
  APP_VERSION: '2.0.0',
  POINTS_PER_WORKOUT: 50,
  LEVEL_UP_BASE: 500
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = CONFIG;
}