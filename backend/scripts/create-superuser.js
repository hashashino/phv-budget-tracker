const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createSuperUser() {
  try {
    const email = 'muhammadshalihin@gmail.com';
    const password = 'SuperAdmin123!'; // You should change this after first login
    const hashedPassword = await bcrypt.hash(password, 12);

    // Check if superuser already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      // Update existing user to superuser
      const updatedUser = await prisma.user.update({
        where: { email },
        data: {
          role: 'SUPER_ADMIN',
          isVerified: true,
          isActive: true,
          financialAccessLevel: 4, // TOP_SECRET access level
          updatedAt: new Date()
        }
      });
      
      console.log('✅ Existing user updated to SUPER_ADMIN');
      console.log(`📧 Email: ${updatedUser.email}`);
      console.log(`👤 Name: ${updatedUser.firstName} ${updatedUser.lastName}`);
      console.log(`🔑 Role: ${updatedUser.role}`);
      console.log(`💰 Financial Access Level: ${updatedUser.financialAccessLevel}`);
    } else {
      // Create new superuser
      const superUser = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          firstName: 'Muhammad',
          lastName: 'Shalihin',
          phone: '+6591234567',
          role: 'SUPER_ADMIN',
          isVerified: true,
          isActive: true,
          countryCode: 'SG',
          preferredLanguage: 'en',
          timezone: 'Asia/Singapore',
          financialAccessLevel: 4 // TOP_SECRET access level
        }
      });

      console.log('🚀 SUPER_ADMIN account created successfully!');
      console.log('');
      console.log('📋 Login Credentials:');
      console.log(`📧 Email: ${email}`);
      console.log(`🔐 Password: ${password}`);
      console.log(`👤 Name: ${superUser.firstName} ${superUser.lastName}`);
      console.log(`🔑 Role: ${superUser.role}`);
      console.log(`💰 Financial Access Level: ${superUser.financialAccessLevel}`);
      console.log('');
      console.log('🚨 IMPORTANT: Change the password after first login!');
      console.log('');
      console.log('🔒 Permissions Granted:');
      console.log('✅ Full system access');
      console.log('✅ All financial data access');
      console.log('✅ ACRA reports access');
      console.log('✅ User management');
      console.log('✅ Admin role management');
      console.log('✅ System configuration');
    }

  } catch (error) {
    console.error('❌ Error creating superuser:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

createSuperUser();