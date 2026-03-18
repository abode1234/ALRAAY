-- CreateEnum
CREATE TYPE "BuildOrderStatus" AS ENUM ('NEW', 'PROCESSING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "BannerPosition" AS ENUM ('MAIN_SLIDER', 'SECONDARY_TOP', 'SECONDARY_BOTTOM');

-- DropIndex
DROP INDEX "Banner_isActive_order_idx";

-- AlterTable
ALTER TABLE "Banner" ADD COLUMN     "position" "BannerPosition" NOT NULL DEFAULT 'MAIN_SLIDER';

-- CreateTable
CREATE TABLE "Brand" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameAr" TEXT,
    "logo" TEXT,
    "slug" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Brand_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BuildOrder" (
    "id" TEXT NOT NULL,
    "orderNumber" TEXT NOT NULL,
    "customerPhone" TEXT NOT NULL,
    "customerName" TEXT,
    "customerAddress" TEXT NOT NULL,
    "notes" TEXT,
    "totalAmount" DECIMAL(10,2) NOT NULL,
    "status" "BuildOrderStatus" NOT NULL DEFAULT 'NEW',
    "components" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BuildOrder_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Brand_name_key" ON "Brand"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Brand_slug_key" ON "Brand"("slug");

-- CreateIndex
CREATE INDEX "Brand_isActive_slug_idx" ON "Brand"("isActive", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "BuildOrder_orderNumber_key" ON "BuildOrder"("orderNumber");

-- CreateIndex
CREATE INDEX "BuildOrder_status_createdAt_idx" ON "BuildOrder"("status", "createdAt");

-- CreateIndex
CREATE INDEX "Banner_isActive_position_order_idx" ON "Banner"("isActive", "position", "order");
