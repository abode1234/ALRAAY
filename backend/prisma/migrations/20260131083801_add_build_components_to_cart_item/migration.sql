-- DropIndex
DROP INDEX "CartItem_userId_productId_key";

-- AlterTable
ALTER TABLE "CartItem" ADD COLUMN     "buildComponents" JSONB,
ADD COLUMN     "customPrice" DECIMAL(10,2);

-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "buildComponents" JSONB,
ADD COLUMN     "customPrice" DECIMAL(10,2);
