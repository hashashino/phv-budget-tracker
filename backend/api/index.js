const express = require('express');
const cors = require('cors');

// Create Express app
const app = express();

// Middleware
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    database: process.env.DATABASE_URL ? 'Connected' : 'Not configured'
  });
});

// Import the real auth routes when database is available
let authRoutes = null;
try {
  // Try to import the real auth routes
  authRoutes = require('../src/routes/auth');
} catch (error) {
  console.log('Auth routes not available, using test endpoints');
}

if (authRoutes && process.env.DATABASE_URL) {
  // Use real auth routes when database is connected
  app.use('/api/auth', authRoutes);
} else {
  // Fallback test routes
  app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    
    if (email && password) {
      res.json({
        user: { email, id: '1', firstName: 'Test', lastName: 'User' },
        token: 'test-token-' + Date.now(),
        refreshToken: 'refresh-token-' + Date.now()
      });
    } else {
      res.status(400).json({ error: 'Email and password required' });
    }
  });

  app.post('/api/auth/register', (req, res) => {
    const { email, password, firstName, lastName } = req.body;
    
    if (email && password && firstName && lastName) {
      res.json({
        user: { email, id: '2', firstName, lastName },
        token: 'test-token-' + Date.now(),
        refreshToken: 'refresh-token-' + Date.now()
      });
    } else {
      res.status(400).json({ error: 'All fields required' });
    }
  });
}

// Default response
app.get('/', (req, res) => {
  res.json({ 
    message: 'PHV Budget Tracker API is running on Vercel!',
    timestamp: new Date().toISOString(),
    database: process.env.DATABASE_URL ? 'Connected' : 'Not configured'
  });
});

module.exports = app;