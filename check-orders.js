const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
require('dotenv').config();

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ 
  connectionString,
  ssl: { rejectUnauthorized: false }
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function check() {
  const dbSizeResult = await prisma.$queryRawUnsafe(`
      SELECT pg_database_size(current_database()) as size_bytes;
    `);
  console.log("Result:", dbSizeResult);
  console.log("size_bytes:", dbSizeResult[0].size_bytes);
  console.log("type:", typeof dbSizeResult[0].size_bytes);
}

check().catch(console.error).finally(() => { prisma.$disconnect(); pool.end(); });
