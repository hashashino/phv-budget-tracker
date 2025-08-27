// Import the main Express app
const app = require('../src/server.js');

// Export as Vercel serverless function
// Updated to trigger redeployment
module.exports = app;