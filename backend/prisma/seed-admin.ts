import { PrismaClient } from '../generated/prisma';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const adminEmail = 'alraaycenter@gmail.com';
  const adminPassword = 'Admin@123456'; // غيّر هذا الباسورد

  // تشفير كلمة المرور
  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  // إنشاء أو تحديث حساب الأدمن
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      role: 'ADMIN',
      password: hashedPassword,
    },
    create: {
      email: adminEmail,
      name: 'Alatian Admin',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });

  console.log('✅ Admin account created/updated:');
  console.log(`   Email: ${admin.email}`);
  console.log(`   Password: ${adminPassword}`);
  console.log(`   Role: ${admin.role}`);
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
