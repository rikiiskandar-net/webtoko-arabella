import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not defined in environment variables!");
}

// Hapus sslmode dari URL karena konflik dengan ssl option di Pool.
// pg versi terbaru treat sslmode=require sebagai verify-full,
// sehingga rejectUnauthorized:false di Pool config jadi tidak mempan.
const dbUrl = new URL(connectionString);
dbUrl.searchParams.delete('sslmode');
const cleanUrl = dbUrl.toString();

const pool = new Pool({ 
  connectionString: cleanUrl,
  ssl: { rejectUnauthorized: false },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});
const adapter = new PrismaPg(pool);

const globalForPrisma = global;

export const prisma = globalForPrisma.prisma || new PrismaClient({ adapter });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
