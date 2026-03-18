/*
  Warnings:

  - A unique constraint covering the columns `[buildId,productId]` on the table `BuildComponent` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "BuildComponent_buildId_category_key";

-- AlterTable
ALTER TABLE "BuildComponent" ADD COLUMN     "quantity" INTEGER NOT NULL DEFAULT 1;

-- CreateIndex
CREATE INDEX "BuildComponent_buildId_category_idx" ON "BuildComponent"("buildId", "category");

-- CreateIndex
CREATE UNIQUE INDEX "BuildComponent_buildId_productId_key" ON "BuildComponent"("buildId", "productId");
