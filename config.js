// Backend API configuration
const API_CONFIG = {
  // Change this to your deployed backend URL in production
  BASE_URL: 'http://localhost:3000',
  ENDPOINTS: {
    REGISTER: '/api/auth/register',
    LOGIN: '/api/auth/login',
    VERIFY: '/api/auth/verify',
    ANALYZE: '/api/analysis/analyze',
    ASK: '/api/analysis/ask',
    USAGE: '/api/analysis/usage'
  }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = API_CONFIG;
}
