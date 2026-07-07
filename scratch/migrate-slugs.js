process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ 
  connectionString,
  ssl: { rejectUnauthorized: false },
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

function generateSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

async function main() {
  console.log("Fetching products to generate slugs...");
  const products = await prisma.product.findMany();
  
  for (const product of products) {
    if (product.slug) {
      console.log(`Skipping ${product.name}, already has slug: ${product.slug}`);
      continue;
    }
    
    let slug = generateSlug(product.name);
    let isUnique = false;
    let suffix = 1;
    let finalSlug = slug;
    
    while (!isUnique) {
      const existing = await prisma.product.findFirst({ where: { slug: finalSlug } });
      if (existing && existing.id !== product.id) {
        finalSlug = `${slug}-${suffix}`;
        suffix++;
      } else {
        isUnique = true;
      }
    }
    
    await prisma.product.update({
      where: { id: product.id },
      data: { slug: finalSlug }
    });
    console.log(`Updated ${product.name} -> ${finalSlug}`);
  }
  
  console.log("Migration complete!");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
