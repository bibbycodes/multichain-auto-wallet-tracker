/*
  Warnings:

  - You are about to drop the `TokenRelationship` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "TokenRelationship" DROP CONSTRAINT "TokenRelationship_token_id_fkey";

-- DropForeignKey
ALTER TABLE "TokenRelationship" DROP CONSTRAINT "TokenRelationship_wallet_id_fkey";

-- DropTable
DROP TABLE "TokenRelationship";

-- CreateTable
CREATE TABLE "Mentions" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "token_address" TEXT NOT NULL,
    "chain_id" TEXT NOT NULL,
    "social_channel_id" TEXT NOT NULL,

    CONSTRAINT "Mentions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TokenToWalletMapping" (
    "id" TEXT NOT NULL,
    "token_id" TEXT NOT NULL,
    "wallet_id" TEXT NOT NULL,
    "type" "TokenRelationshipType" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TokenToWalletMapping_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Mentions" ADD CONSTRAINT "Mentions_social_channel_id_fkey" FOREIGN KEY ("social_channel_id") REFERENCES "SocialChannel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mentions" ADD CONSTRAINT "Mentions_chain_id_fkey" FOREIGN KEY ("chain_id") REFERENCES "Chain"("chain_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mentions" ADD CONSTRAINT "Mentions_token_address_fkey" FOREIGN KEY ("token_address") REFERENCES "Token"("address") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TokenToWalletMapping" ADD CONSTRAINT "TokenToWalletMapping_token_id_fkey" FOREIGN KEY ("token_id") REFERENCES "Token"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TokenToWalletMapping" ADD CONSTRAINT "TokenToWalletMapping_wallet_id_fkey" FOREIGN KEY ("wallet_id") REFERENCES "Wallet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
