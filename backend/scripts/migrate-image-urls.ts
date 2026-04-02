import { PrismaClient } from '../../generated/prisma';

const prisma = new PrismaClient();

const OLD_DOMAIN = 'srv1318325.hstgr.cloud';
const NEW_DOMAIN = 'alraay.net';

async function migrateImageUrls() {
  console.log(`Replacing "${OLD_DOMAIN}" → "${NEW_DOMAIN}" in all tables...\n`);

  // 1. Update Image.url
  const images = await prisma.image.findMany({
    where: { url: { contains: OLD_DOMAIN } },
  });
  console.log(`Found ${images.length} Image records to update.`);
  for (const img of images) {
    const newUrl = img.url.replace(new RegExp(OLD_DOMAIN, 'g'), NEW_DOMAIN);
    await prisma.image.update({
      where: { id: img.id },
      data: { url: newUrl },
    });
  }
  console.log(`✓ Image.url updated.\n`);

  // 2. Update Banner.imageUrl
  const banners = await prisma.banner.findMany({
    where: { imageUrl: { contains: OLD_DOMAIN } },
  });
  console.log(`Found ${banners.length} Banner records to update.`);
  for (const banner of banners) {
    const newUrl = banner.imageUrl.replace(new RegExp(OLD_DOMAIN, 'g'), NEW_DOMAIN);
    await prisma.banner.update({
      where: { id: banner.id },
      data: { imageUrl: newUrl },
    });
  }
  console.log(`✓ Banner.imageUrl updated.\n`);

  // 3. Update Brand.logo
  const brands = await prisma.brand.findMany({
    where: { logo: { contains: OLD_DOMAIN } },
  });
  console.log(`Found ${brands.length} Brand records to update.`);
  for (const brand of brands) {
    const newLogo = brand.logo!.replace(new RegExp(OLD_DOMAIN, 'g'), NEW_DOMAIN);
    await prisma.brand.update({
      where: { id: brand.id },
      data: { logo: newLogo },
    });
  }
  console.log(`✓ Brand.logo updated.\n`);

  // 4. Update DisplayCategory.icon
  const categories = await prisma.displayCategory.findMany({
    where: { icon: { contains: OLD_DOMAIN } },
  });
  console.log(`Found ${categories.length} DisplayCategory records to update.`);
  for (const cat of categories) {
    const newIcon = cat.icon.replace(new RegExp(OLD_DOMAIN, 'g'), NEW_DOMAIN);
    await prisma.displayCategory.update({
      where: { id: cat.id },
      data: { icon: newIcon },
    });
  }
  console.log(`✓ DisplayCategory.icon updated.\n`);

  console.log('Migration complete!');
}

migrateImageUrls()
  .catch((e) => {
    console.error('Migration failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
