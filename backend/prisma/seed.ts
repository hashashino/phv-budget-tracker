import { PrismaClient, CategoryType, PlatformType, VehicleType, FuelType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seed...');

  // Create default user
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  const user = await prisma.user.upsert({
    where: { email: 'demo@phvbudget.com' },
    update: {},
    create: {
      email: 'demo@phvbudget.com',
      password: hashedPassword,
      firstName: 'Demo',
      lastName: 'User',
      phone: '+6591234567',
      licenseNumber: 'TD1234567Z',
      vehicleNumber: 'SLU1234Z',
      phvCompany: 'Grab',
      isVerified: true,
    },
  });

  console.log('Created demo user:', user.email);

  // Create default expense categories
  const expenseCategories = [
    { name: 'Fuel', color: '#FF6B6B', icon: 'gas-station' },
    { name: 'Vehicle Maintenance', color: '#4ECDC4', icon: 'car-repair' },
    { name: 'Insurance', color: '#45B7D1', icon: 'shield' },
    { name: 'Food & Beverages', color: '#FFA07A', icon: 'utensils' },
    { name: 'Parking', color: '#98D8C8', icon: 'parking' },
    { name: 'ERP/Tolls', color: '#F7DC6F', icon: 'road' },
    { name: 'Phone Bill', color: '#BB8FCE', icon: 'phone' },
    { name: 'Car Rental', color: '#85C1E9', icon: 'car' },
    { name: 'Cleaning', color: '#82E0AA', icon: 'spray-can' },
    { name: 'Others', color: '#D5DBDB', icon: 'ellipsis-h' },
  ];

  for (const category of expenseCategories) {
    await prisma.category.upsert({
      where: {
        name_userId_type: {
          name: category.name,
          userId: user.id,
          type: CategoryType.EXPENSE,
        },
      },
      update: {},
      create: {
        ...category,
        type: CategoryType.EXPENSE,
        userId: user.id,
        isDefault: true,
      },
    });
  }

  console.log('Created default expense categories');

  // Create default PHV platforms
  const platforms = [
    { name: 'Grab', type: PlatformType.GRAB, commission: 0.20 },
    { name: 'Gojek', type: PlatformType.GOJEK, commission: 0.20 },
    { name: 'Ryde', type: PlatformType.RYDE, commission: 0.15 },
    { name: 'TADA', type: PlatformType.TADA, commission: 0.10 },
  ];

  for (const platform of platforms) {
    await prisma.pHVPlatform.upsert({
      where: {
        userId_name: {
          userId: user.id,
          name: platform.name,
        },
      },
      update: {},
      create: {
        ...platform,
        userId: user.id,
      },
    });
  }

  console.log('Created default PHV platforms');

  // Create sample vehicle
  await prisma.vehicle.upsert({
    where: {
      userId_plateNumber: {
        userId: user.id,
        plateNumber: 'SLU1234Z',
      },
    },
    update: {},
    create: {
      make: 'Toyota',
      model: 'Prius',
      year: 2020,
      plateNumber: 'SLU1234Z',
      type: VehicleType.SEDAN,
      fuelType: FuelType.HYBRID,
      fuelCapacity: 45.0,
      fuelEfficiency: 25.0,
      userId: user.id,
    },
  });

  console.log('Created sample vehicle');

  // Create sample expenses
  const fuelCategory = await prisma.category.findFirst({
    where: { name: 'Fuel', userId: user.id, type: CategoryType.EXPENSE },
  });

  const maintenanceCategory = await prisma.category.findFirst({
    where: { name: 'Vehicle Maintenance', userId: user.id, type: CategoryType.EXPENSE },
  });

  if (fuelCategory && maintenanceCategory) {
    const sampleExpenses = [
      {
        amount: 65.50,
        description: 'Petrol top-up at Shell',
        date: new Date('2024-01-15'),
        location: 'Shell Station Orchard',
        categoryId: fuelCategory.id,
        gstAmount: 4.34,
      },
      {
        amount: 250.00,
        description: 'Car service and oil change',
        date: new Date('2024-01-10'),
        location: 'Toyota Service Centre',
        categoryId: maintenanceCategory.id,
        gstAmount: 16.58,
      },
    ];

    for (const expense of sampleExpenses) {
      await prisma.expense.create({
        data: {
          ...expense,
          userId: user.id,
        },
      });
    }

    console.log('Created sample expenses');
  }

  // Create sample earnings
  const grabPlatform = await prisma.pHVPlatform.findFirst({
    where: { name: 'Grab', userId: user.id },
  });

  const vehicle = await prisma.vehicle.findFirst({
    where: { userId: user.id },
  });

  if (grabPlatform && vehicle) {
    const sampleEarnings = [
      {
        amount: 180.50,
        grossAmount: 225.63,
        netAmount: 180.50,
        commission: 45.13,
        tips: 12.00,
        date: new Date('2024-01-15'),
        startTime: new Date('2024-01-15T06:00:00'),
        endTime: new Date('2024-01-15T14:00:00'),
        distance: 120.5,
        trips: 8,
        workingHours: 8.0,
        fuelCost: 25.00,
        platformId: grabPlatform.id,
        vehicleId: vehicle.id,
      },
      {
        amount: 165.75,
        grossAmount: 207.19,
        netAmount: 165.75,
        commission: 41.44,
        tips: 8.50,
        date: new Date('2024-01-14'),
        startTime: new Date('2024-01-14T06:30:00'),
        endTime: new Date('2024-01-14T13:30:00'),
        distance: 95.3,
        trips: 6,
        workingHours: 7.0,
        fuelCost: 20.00,
        platformId: grabPlatform.id,
        vehicleId: vehicle.id,
      },
    ];

    for (const earning of sampleEarnings) {
      await prisma.earning.create({
        data: {
          ...earning,
          userId: user.id,
        },
      });
    }

    console.log('Created sample earnings');
  }

  console.log('Database seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });