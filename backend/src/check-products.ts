
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const count = await prisma.product.count();
  console.log(`Total Products: ${count}`);
  
  if (count > 0) {
    const products = await prisma.product.findMany({ take: 5 });
    console.log('Sample Products:');
    products.forEach(p => console.log(`- ${p.name} (isNewArrival: ${p.isNewArrival})`));
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
