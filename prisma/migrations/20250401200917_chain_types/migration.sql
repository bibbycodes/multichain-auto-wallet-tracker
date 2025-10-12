/*
  Warnings:

  - Changed the type of `chain_type` on the `Chain` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Chain" DROP COLUMN "chain_type",
ADD COLUMN     "chain_type" "ChainType" NOT NULL;
