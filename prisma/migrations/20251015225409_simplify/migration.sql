/*
  Warnings:

  - You are about to drop the column `token_id` on the `SocialChannel` table. All the data in the column will be lost.
  - You are about to drop the column `link` on the `WalletSwaps` table. All the data in the column will be lost.
  - You are about to drop the `LiquidityPool` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TokenDistribution` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TokenHolding` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TokenToWalletMapping` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_TokenDistributionToWallet` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `market_cap` to the `Mentions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `price` to the `Mentions` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "LiquidityPool" DROP CONSTRAINT "LiquidityPool_chain_id_fkey";

-- DropForeignKey
ALTER TABLE "LiquidityPool" DROP CONSTRAINT "LiquidityPool_token_address_fkey";

-- DropForeignKey
ALTER TABLE "TokenDistribution" DROP CONSTRAINT "TokenDistribution_chain_id_fkey";

-- DropForeignKey
ALTER TABLE "TokenDistribution" DROP CONSTRAINT "TokenDistribution_token_id_fkey";

-- DropForeignKey
ALTER TABLE "TokenHolding" DROP CONSTRAINT "TokenHolding_token_id_fkey";

-- DropForeignKey
ALTER TABLE "TokenHolding" DROP CONSTRAINT "TokenHolding_wallet_id_fkey";

-- DropForeignKey
ALTER TABLE "TokenToWalletMapping" DROP CONSTRAINT "TokenToWalletMapping_token_id_fkey";

-- DropForeignKey
ALTER TABLE "TokenToWalletMapping" DROP CONSTRAINT "TokenToWalletMapping_wallet_id_fkey";

-- DropForeignKey
ALTER TABLE "_TokenDistributionToWallet" DROP CONSTRAINT "_TokenDistributionToWallet_A_fkey";

-- DropForeignKey
ALTER TABLE "_TokenDistributionToWallet" DROP CONSTRAINT "_TokenDistributionToWallet_B_fkey";

-- AlterTable
ALTER TABLE "Mentions" ADD COLUMN     "market_cap" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "price" DOUBLE PRECISION NOT NULL;

-- AlterTable
ALTER TABLE "SocialChannel" DROP COLUMN "token_id";

-- AlterTable
ALTER TABLE "WalletSwaps" DROP COLUMN "link";

-- DropTable
DROP TABLE "LiquidityPool";

-- DropTable
DROP TABLE "TokenDistribution";

-- DropTable
DROP TABLE "TokenHolding";

-- DropTable
DROP TABLE "TokenToWalletMapping";

-- DropTable
DROP TABLE "_TokenDistributionToWallet";

-- CreateTable
CREATE TABLE "Alert" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "token_id" TEXT NOT NULL,
    "token_address" TEXT NOT NULL,
    "social_platform" "SocialPlatform" NOT NULL,
    "market_cap" DOUBLE PRECISION NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Alert_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Alert_id_key" ON "Alert"("id");

-- AddForeignKey
ALTER TABLE "Alert" ADD CONSTRAINT "Alert_token_address_fkey" FOREIGN KEY ("token_address") REFERENCES "Token"("address") ON DELETE RESTRICT ON UPDATE CASCADE;
