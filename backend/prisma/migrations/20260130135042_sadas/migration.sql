-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "compareAtPrice" DECIMAL(10,2),
ADD COLUMN     "isNewArrival" BOOLEAN NOT NULL DEFAULT true;
