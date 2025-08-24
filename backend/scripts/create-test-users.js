const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const testUsers = [
  {
    email: 'test.user@example.com',
    password: 'Password123!',
    role: 'USER',
    firstName: 'Test',
    lastName: 'User',
  },
  {
    email: 'test.support@example.com',
    password: 'Password123!',
    role: 'CUSTOMER_SUPPORT',
    firstName: 'Test',
    lastName: 'Support',
  },
  {
    email: 'test.ops@example.com',
    password: 'Password123!',
    role: 'OPERATIONS_ADMIN',
    firstName: 'Test',
    lastName: 'Ops',
  },
  {
    email: 'test.tech@example.com',
    password: 'Password123!',
    role: 'TECHNICAL_ADMIN',
    firstName: 'Test',
    lastName: 'Tech',
  },
  {
    email: 'test.finance@example.com',
    password: 'Password123!',
    role: 'FINANCE_MANAGER',
    firstName: 'Test',
    lastName: 'Finance',
  },
  {
    email: 'test.superadmin@example.com',
    password: 'Password123!',
    role: 'SUPER_ADMIN',
    firstName: 'Test',
    lastName: 'SuperAdmin',
  },
];

const roleToFinancialLevel = {
  USER: 1,
  CUSTOMER_SUPPORT: 2,
  OPERATIONS_ADMIN: 1,
  TECHNICAL_ADMIN: 0,
  FINANCE_MANAGER: 3,
  SUPER_ADMIN: 4,
};

async function createTestUsers() {
  console.log('🚀 Starting test user creation...');

  for (const userData of testUsers) {
    try {
      const existingUser = await prisma.user.findUnique({
        where: { email: userData.email },
      });

      if (existingUser) {
        console.log(`- 🧑‍💻 User ${userData.email} already exists. Skipping.`);
        continue;
      }

      const hashedPassword = await bcrypt.hash(userData.password, 12);

      const newUser = await prisma.user.create({
        data: {
          email: userData.email,
          password: hashedPassword,
          role: userData.role,
          firstName: userData.firstName,
          lastName: userData.lastName,
          phone: '+6588888888',
          isVerified: true,
          isActive: true,
          countryCode: 'SG',
          preferredLanguage: 'en',
          timezone: 'Asia/Singapore',
          financialAccessLevel: roleToFinancialLevel[userData.role] ?? 0,
        },
      });

      console.log(`- ✅ Created ${newUser.role} user: ${newUser.email}`);

    } catch (error) {
      console.error(`- ❌ Error creating user ${userData.email}:`, error);
    }
  }

  console.log('🏁 Test user creation finished.');
}

createTestUsers()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });