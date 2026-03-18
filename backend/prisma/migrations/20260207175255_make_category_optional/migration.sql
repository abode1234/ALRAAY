/*
  Warnings:

  - The `categories` column on the `Brand` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `category` column on the `BuildComponent` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `backendCategory` on the `DisplayCategory` table. All the data in the column will be lost.
  - The `category` column on the `Product` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Brand" DROP COLUMN "categories",
ADD COLUMN     "categories" TEXT[];

-- AlterTable
ALTER TABLE "BuildComponent" DROP COLUMN "category",
ADD COLUMN     "category" TEXT;

-- AlterTable
ALTER TABLE "DisplayCategory" DROP COLUMN "backendCategory";

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "category",
ADD COLUMN     "category" TEXT;

-- DropEnum
DROP TYPE "Category";

-- CreateIndex
CREATE INDEX "BuildComponent_buildId_category_idx" ON "BuildComponent"("buildId", "category");

-- CreateIndex
CREATE INDEX "Product_name_brand_category_idx" ON "Product"("name", "brand", "category");
