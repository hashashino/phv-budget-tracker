-- AlterTable
ALTER TABLE "users" ADD COLUMN     "countryCode" TEXT NOT NULL DEFAULT 'SG',
ADD COLUMN     "preferredLanguage" TEXT NOT NULL DEFAULT 'en',
ADD COLUMN     "timezone" TEXT NOT NULL DEFAULT 'Asia/Singapore';
