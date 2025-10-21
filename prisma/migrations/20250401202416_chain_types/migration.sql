/*
  Warnings:

  - You are about to drop the column `pnl_1d` on the `WalletPerformance` table. All the data in the column will be lost.
  - You are about to drop the column `pnl_30d` on the `WalletPerformance` table. All the data in the column will be lost.
  - You are about to drop the column `pnl_7d` on the `WalletPerformance` table. All the data in the column will be lost.
  - Added the required column `pnl_1d_percentage` to the `WalletPerformance` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pnl_30d_percentage` to the `WalletPerformance` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pnl_7d_percentage` to the `WalletPerformance` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "WalletPerformance" DROP COLUMN "pnl_1d",
DROP COLUMN "pnl_30d",
DROP COLUMN "pnl_7d",
ADD COLUMN     "pnl_1d_percentage" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "pnl_30d_percentage" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "pnl_7d_percentage" DOUBLE PRECISION NOT NULL;
