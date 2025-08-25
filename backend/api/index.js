// Simple Vercel serverless function (no Express)
module.exports = (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle OPTIONS requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Handle different routes
  if (req.url === '/health' || req.url === '/api/health') {
    res.status(200).json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      url: req.url,
      method: req.method
    });
    return;
  }

  // Default response
  res.status(200).json({ 
    message: 'PHV Budget Tracker API is running on Vercel!',
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString()
  });
};