const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createTestAdmin() {
  try {
    const email = 'admin@test.com';
    const password = 'admin123'; // Simple password for testing
    const hashedPassword = await bcrypt.hash(password, 12);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      // Update existing user
      const updatedUser = await prisma.user.update({
        where: { email },
        data: {
          password: hashedPassword,
          role: 'SUPER_ADMIN',
          isVerified: true,
          isActive: true,
          financialAccessLevel: 4,
          updatedAt: new Date()
        }
      });
      
      console.log('✅ Existing user updated to test admin');
    } else {
      // Create new test admin
      const testAdmin = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          firstName: 'Test',
          lastName: 'Admin',
          phone: '+6591234567',
          role: 'SUPER_ADMIN',
          isVerified: true,
          isActive: true,
          countryCode: 'SG',
          preferredLanguage: 'en',
          timezone: 'Asia/Singapore',
          financialAccessLevel: 4
        }
      });

      console.log('🚀 Test admin created successfully!');
    }

    console.log('');
    console.log('📋 Test Login Credentials:');
    console.log(`📧 Email: ${email}`);
    console.log(`🔐 Password: ${password}`);
    console.log('🔑 Role: SUPER_ADMIN');
    console.log('');

  } catch (error) {
    console.error('❌ Error creating test admin:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

createTestAdmin();