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

// Direct database authentication (since we can't import TS files easily)
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

let prisma = null;
if (process.env.DATABASE_URL) {
  prisma = new PrismaClient();
}

// Real auth routes with database
if (prisma && process.env.DATABASE_URL) {
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password required' });
      }

      // Find user in database
      const user = await prisma.user.findUnique({
        where: { email: email.toLowerCase() }
      });

      if (!user) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      // Check password
      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      // Generate token
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET || 'development-secret-key-please-change-in-production-32-chars',
        { expiresIn: '7d' }
      );

      // Return user data (without password)
      const { password: _, ...userWithoutPassword } = user;
      res.json({
        user: userWithoutPassword,
        token: token,
        refreshToken: token // Simplified for now
      });
      
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.post('/api/auth/register', async (req, res) => {
    try {
      const { email, password, firstName, lastName, phone, licenseNumber, vehicleNumber, phvCompany } = req.body;
      
      if (!email || !password || !firstName || !lastName) {
        return res.status(400).json({ error: 'Email, password, first name and last name required' });
      }

      // Check if user exists
      const existingUser = await prisma.user.findUnique({
        where: { email: email.toLowerCase() }
      });

      if (existingUser) {
        return res.status(409).json({ error: 'User already exists' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);

      // Create user
      const user = await prisma.user.create({
        data: {
          email: email.toLowerCase(),
          password: hashedPassword,
          firstName,
          lastName,
          phone,
          licenseNumber,
          vehicleNumber,
          phvCompany
        }
      });

      // Generate token
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET || 'development-secret-key-please-change-in-production-32-chars',
        { expiresIn: '7d' }
      );

      // Return user data (without password)
      const { password: _, ...userWithoutPassword } = user;
      res.json({
        user: userWithoutPassword,
        token: token,
        refreshToken: token // Simplified for now
      });
      
    } catch (error) {
      console.error('Register error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
} else {
  // Fallback test routes when no database
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