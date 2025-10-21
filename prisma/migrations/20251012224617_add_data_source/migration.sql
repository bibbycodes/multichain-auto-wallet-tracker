-- CreateEnum
CREATE TYPE "TokenDataSource" AS ENUM ('BIRDEYE', 'GMGN', 'MORALIS');

-- AlterTable
ALTER TABLE "Token" ADD COLUMN     "data_source" "TokenDataSource" NOT NULL DEFAULT 'BIRDEYE';
