/*
  Warnings:

  - A unique constraint covering the columns `[chain_id]` on the table `Chain` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `pair_address` to the `Token` table without a default value. This is not possible if the table is not empty.
  - Added the required column `total_supply` to the `Token` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `TrackedWallet` table without a default value. This is not possible if the table is not empty.
  - Added the required column `num_1x_profitable_trades` to the `WalletPerformance` table without a default value. This is not possible if the table is not empty.
  - Added the required column `num_2x_profitable_trades` to the `WalletPerformance` table without a default value. This is not possible if the table is not empty.
  - Added the required column `num_5x_profitable_trades` to the `WalletPerformance` table without a default value. This is not possible if the table is not empty.
  - Added the required column `num_losses` to the `WalletPerformance` table without a default value. This is not possible if the table is not empty.
  - Added the required column `num_wins` to the `WalletPerformance` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pnl_1d` to the `WalletPerformance` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pnl_30d` to the `WalletPerformance` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pnl_7d` to the `WalletPerformance` table without a default value. This is not possible if the table is not empty.
  - Added the required column `realized_profit` to the `WalletPerformance` table without a default value. This is not possible if the table is not empty.
  - Added the required column `total_profit` to the `WalletPerformance` table without a default value. This is not possible if the table is not empty.
  - Added the required column `unrealized_profit` to the `WalletPerformance` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TrackedWalletType" AS ENUM ('INSTITUTIONAL', 'KOL', 'SCAMMER', 'BOT');

-- DropForeignKey
ALTER TABLE "Token" DROP CONSTRAINT "Token_chain_id_fkey";

-- DropForeignKey
ALTER TABLE "TokenDistribution" DROP CONSTRAINT "TokenDistribution_chain_id_fkey";

-- DropForeignKey
ALTER TABLE "TrackedWallet" DROP CONSTRAINT "TrackedWallet_chain_id_fkey";

-- DropForeignKey
ALTER TABLE "TrendingToken" DROP CONSTRAINT "TrendingToken_chain_id_fkey";

-- DropForeignKey
ALTER TABLE "Wallet" DROP CONSTRAINT "Wallet_chain_id_fkey";

-- DropForeignKey
ALTER TABLE "WalletPerformance" DROP CONSTRAINT "WalletPerformance_chain_id_fkey";

-- AlterTable
ALTER TABLE "Token" ADD COLUMN     "pair_address" TEXT NOT NULL,
ADD COLUMN     "total_supply" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "TrackedWallet" ADD COLUMN     "type" "TrackedWalletType" NOT NULL;

-- AlterTable
ALTER TABLE "WalletPerformance" ADD COLUMN     "num_1x_profitable_trades" INTEGER NOT NULL,
ADD COLUMN     "num_2x_profitable_trades" INTEGER NOT NULL,
ADD COLUMN     "num_5x_profitable_trades" INTEGER NOT NULL,
ADD COLUMN     "num_losses" INTEGER NOT NULL,
ADD COLUMN     "num_wins" INTEGER NOT NULL,
ADD COLUMN     "pnl_1d" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "pnl_30d" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "pnl_7d" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "realized_profit" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "total_profit" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "unrealized_profit" DOUBLE PRECISION NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Chain_chain_id_key" ON "Chain"("chain_id");

-- AddForeignKey
ALTER TABLE "Token" ADD CONSTRAINT "Token_chain_id_fkey" FOREIGN KEY ("chain_id") REFERENCES "Chain"("chain_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Wallet" ADD CONSTRAINT "Wallet_chain_id_fkey" FOREIGN KEY ("chain_id") REFERENCES "Chain"("chain_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrackedWallet" ADD CONSTRAINT "TrackedWallet_chain_id_fkey" FOREIGN KEY ("chain_id") REFERENCES "Chain"("chain_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WalletPerformance" ADD CONSTRAINT "WalletPerformance_chain_id_fkey" FOREIGN KEY ("chain_id") REFERENCES "Chain"("chain_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TokenDistribution" ADD CONSTRAINT "TokenDistribution_chain_id_fkey" FOREIGN KEY ("chain_id") REFERENCES "Chain"("chain_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrendingToken" ADD CONSTRAINT "TrendingToken_chain_id_fkey" FOREIGN KEY ("chain_id") REFERENCES "Chain"("chain_id") ON DELETE RESTRICT ON UPDATE CASCADE;
