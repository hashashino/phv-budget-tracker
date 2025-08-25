module.exports = (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Content-Type', 'application/json');
  
  // Handle preflight OPTIONS requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const pathname = req.url || '/';
  
  // Just handle basic routes for now
  if (pathname === '/') {
    return res.status(200).json({
      message: 'PHV Budget Tracker API is working!',
      timestamp: new Date().toISOString()
    });
  }
  
  if (pathname === '/api/health') {
    return res.status(200).json({
      status: 'OK',
      timestamp: new Date().toISOString()
    });
  }
  
  if (pathname === '/api/auth/login' && req.method === 'POST') {
    return res.status(200).json({
      user: { email: 'test@example.com', id: '1', firstName: 'Test', lastName: 'User' },
      token: 'test-token-' + Date.now(),
      refreshToken: 'refresh-token-' + Date.now()
    });
  }
  
  return res.status(404).json({ error: 'Route not found' });
};