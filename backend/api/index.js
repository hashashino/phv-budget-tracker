// Import the main Express app from compiled dist directory
const app = require('../dist/server.js');

// Export as Vercel serverless function
module.exports = app;