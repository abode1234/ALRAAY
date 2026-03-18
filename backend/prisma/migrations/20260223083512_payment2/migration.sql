/*
  Warnings:

  - A unique constraint covering the columns `[orderId]` on the table `Payment` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[sindiPayId]` on the table `Payment` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `title` to the `Payment` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'CREATED', 'PAID', 'FAILED', 'EXPIRED', 'CANCELLED');

-- DropIndex
DROP INDEX "Payment_userId_currency_key";

-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "locale" TEXT NOT NULL DEFAULT 'ar',
ADD COLUMN     "metadata" JSONB,
ADD COLUMN     "sindiPayId" INTEGER,
ADD COLUMN     "sindiPayUrl" TEXT,
ADD COLUMN     "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "title" TEXT NOT NULL,
ALTER COLUMN "currency" SET DEFAULT 'IQD';

-- CreateIndex
CREATE UNIQUE INDEX "Payment_orderId_key" ON "Payment"("orderId");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_sindiPayId_key" ON "Payment"("sindiPayId");

-- CreateIndex
CREATE INDEX "Payment_userId_idx" ON "Payment"("userId");

-- CreateIndex
CREATE INDEX "Payment_orderId_idx" ON "Payment"("orderId");

-- CreateIndex
CREATE INDEX "Payment_sindiPayId_idx" ON "Payment"("sindiPayId");
