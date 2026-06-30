const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const hash = await bcrypt.hash('admin123', 12);
  let admin = await prisma.admin.findFirst();
  if (admin) {
    await prisma.admin.update({
      where: { id: admin.id },
      data: { password: hash, isActive: true, username: 'admin' }
    });
    console.log(`Password reset successfully! Username: admin, Password: admin123`);
  } else {
    console.log('No admin found! Creating one...');
    await prisma.admin.create({
      data: {
        username: 'admin',
        password: hash,
        name: 'Admin Utama',
        role: 'superadmin'
      }
    });
    console.log(`Admin created successfully! Username: admin, Password: admin123`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
