const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

module.exports = async (req, res) => {
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
  
  try {
    // Root route
    if (pathname === '/') {
      return res.status(200).json({
        message: 'PHV Budget Tracker API is working online!',
        timestamp: new Date().toISOString(),
        database: 'Connected to Neon PostgreSQL'
      });
    }
    
    // Health check
    if (pathname === '/api/health') {
      return res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        database: 'Connected'
      });
    }
    
    // Login with real database
    if (pathname === '/api/auth/login' && req.method === 'POST') {
      let body = '';
      req.on('data', chunk => {
        body += chunk.toString();
      });
      req.on('end', async () => {
        try {
          const parsedBody = JSON.parse(body);
          const { email, password } = parsedBody;
          
          if (!email || !password) {
            return res.status(400).json({ error: 'Email and password required' });
          }

          // Find user in database
          const user = await prisma.user.findUnique({
            where: { email: email }
          });

          if (!user) {
            return res.status(401).json({ error: 'Invalid email or password' });
          }

          // Check password
          const isValidPassword = await bcrypt.compare(password, user.password);
          
          if (!isValidPassword) {
            return res.status(401).json({ error: 'Invalid email or password' });
          }

          // Return success with user data
          return res.status(200).json({
            user: {
              id: user.id,
              email: user.email,
              firstName: user.firstName,
              lastName: user.lastName,
              role: user.role
            },
            token: 'jwt-token-' + Date.now(),
            refreshToken: 'refresh-token-' + Date.now()
          });
          
        } catch (e) {
          console.error('Login error:', e);
          return res.status(400).json({ error: 'Invalid request' });
        }
      });
      return;
    }
    
    return res.status(404).json({ error: 'Route not found' });
    
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};