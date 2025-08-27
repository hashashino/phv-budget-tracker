// Register TypeScript compiler for runtime
require('ts-node/register');

// Import the main Express app from TypeScript source
const app = require('../src/server.ts');

// Export as Vercel serverless function
module.exports = app;