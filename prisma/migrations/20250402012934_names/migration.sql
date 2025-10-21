/*
  Warnings:

  - You are about to drop the column `type` on the `TrackedWallet` table. All the data in the column will be lost.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "TrackedWalletType" ADD VALUE 'SMART_MONEY';
ALTER TYPE "TrackedWalletType" ADD VALUE 'WHALE';
ALTER TYPE "TrackedWalletType" ADD VALUE 'DEV';
ALTER TYPE "TrackedWalletType" ADD VALUE 'INSIDER';

-- AlterTable
ALTER TABLE "TrackedWallet" DROP COLUMN "type",
ADD COLUMN     "types" "TrackedWalletType"[];
