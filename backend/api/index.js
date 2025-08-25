module.exports = (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight OPTIONS requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const url = new URL(req.url, 'https://' + req.headers.host);
  const pathname = url.pathname;
  const method = req.method;

  // Parse JSON body for POST requests
  let body = '';
  if (method === 'POST') {
    return new Promise((resolve) => {
      req.on('data', chunk => {
        body += chunk.toString();
      });
      req.on('end', () => {
        let parsedBody = {};
        try {
          parsedBody = JSON.parse(body);
        } catch (e) {
          // Invalid JSON
        }
        handleRequest(req, res, pathname, method, parsedBody);
        resolve();
      });
    });
  }
  
  handleRequest(req, res, pathname, method, {});
};

function handleRequest(req, res, pathname, method, body) {
  res.setHeader('Content-Type', 'application/json');

  // Root route
  if (pathname === '/' && method === 'GET') {
    return res.status(200).json({
      message: 'PHV Budget Tracker API is running on Vercel!',
      timestamp: new Date().toISOString(),
      database: process.env.DATABASE_URL ? 'Connected' : 'Not configured'
    });
  }

  // Health check
  if (pathname === '/api/health' && method === 'GET') {
    return res.status(200).json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      database: process.env.DATABASE_URL ? 'Connected' : 'Not configured'
    });
  }

  // Debug route
  if (pathname === '/api/debug' && method === 'GET') {
    return res.status(200).json({
      environment: process.env.NODE_ENV,
      database: !!process.env.DATABASE_URL,
      message: 'Backend is working'
    });
  }

  // Login endpoint
  if (pathname === '/api/auth/login' && method === 'POST') {
    const { email, password } = body;
    
    if (email && password) {
      return res.status(200).json({
        user: { email, id: '1', firstName: 'Test', lastName: 'User' },
        token: 'test-token-' + Date.now(),
        refreshToken: 'refresh-token-' + Date.now()
      });
    } else {
      return res.status(400).json({ error: 'Email and password required' });
    }
  }

  // Register endpoint
  if (pathname === '/api/auth/register' && method === 'POST') {
    const { email, password, firstName, lastName } = body;
    
    if (email && password && firstName && lastName) {
      return res.status(200).json({
        user: { email, id: '2', firstName, lastName },
        token: 'test-token-' + Date.now(),
        refreshToken: 'refresh-token-' + Date.now()
      });
    } else {
      return res.status(400).json({ error: 'All fields required' });
    }
  }

  // 404 for unmatched routes
  return res.status(404).json({ error: 'Route not found' });
}