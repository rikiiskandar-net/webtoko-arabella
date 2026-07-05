const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    // 1. Connection ping
    const start = Date.now();
    await prisma.$queryRawUnsafe('SELECT 1');
    const latency = Date.now() - start;
    console.log('Latency:', latency, 'ms');

    // 2. DB Size
    const dbSizeResult = await prisma.$queryRawUnsafe(`
      SELECT pg_database_size(current_database()) as size_bytes;
    `);
    const dbSizeBytes = Number(dbSizeResult[0].size_bytes);
    console.log('DB Size:', (dbSizeBytes / 1024 / 1024).toFixed(2), 'MB');

    // 3. Storage Size (this might fail if the postgres user for prisma doesn't have access to storage schema)
    try {
      const storageResult = await prisma.$queryRawUnsafe(`
        SELECT sum(metadata->>'size')::bigint as total_bytes FROM storage.objects;
      `);
      const storageBytes = Number(storageResult[0].total_bytes || 0);
      console.log('Storage Size:', (storageBytes / 1024 / 1024).toFixed(2), 'MB');
    } catch (err) {
      console.log('Could not read storage schema:', err.message);
    }
    
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
