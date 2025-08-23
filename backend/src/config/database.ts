import { PrismaClient } from '@prisma/client';
import { logger } from '@/utils/logger';

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

const prisma =
  globalThis.__prisma ||
  new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
  });

if (process.env.NODE_ENV === 'development') {
  globalThis.__prisma = prisma;
}

export { prisma };
export default prisma;