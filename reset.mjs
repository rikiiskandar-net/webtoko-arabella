process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import pkg from 'pg';
const { Pool } = pkg;
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcryptjs';

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ 
  connectionString,
  ssl: { rejectUnauthorized: false },
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const hash = await bcrypt.hash('admin123', 12);
  let admin = await prisma.admin.findFirst();
  if (admin) {
    await prisma.admin.update({
      where: { id: admin.id },
      data: { password: hash, isActive: true, username: 'admin' }
    });
    console.log(`Success! Username: admin, Password: admin123`);
  } else {
    console.log('No admin found!');
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
