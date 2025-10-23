-- CreateEnum
CREATE TYPE "AlertType" AS ENUM ('PRICE_UPDATE', 'SIGNAL');

-- AlterTable
ALTER TABLE "Alert" ADD COLUMN     "type" "AlertType" NOT NULL DEFAULT 'SIGNAL';
