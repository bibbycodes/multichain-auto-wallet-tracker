/*
  Warnings:

  - A unique constraint covering the columns `[address,chain_id]` on the table `TrackedWallet` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "TrackedWallet_wallet_id_address_chain_id_key";

-- CreateIndex
CREATE UNIQUE INDEX "TrackedWallet_address_chain_id_key" ON "TrackedWallet"("address", "chain_id");
