import 'dotenv/config';
import { prisma } from '../src/lib/prisma.js';

async function fixPricing() {
  console.log("Starting pricing migration...");
  
  try {
    const products = await prisma.product.findMany();
    let updatedCount = 0;

    for (const p of products) {
      if (p.isPromo && p.promoPrice !== null) {
        console.log(`Updating Promo Product: ${p.name}`);
        console.log(`  - Old: price=${p.price}, promoPrice=${p.promoPrice}, originalPrice=${p.originalPrice}`);
        
        await prisma.product.update({
          where: { id: p.id },
          data: {
            originalPrice: p.price,
            price: p.promoPrice,
            promoPrice: null
          }
        });
        updatedCount++;
      } else {
        if (p.promoPrice !== null) {
           await prisma.product.update({
            where: { id: p.id },
            data: {
              promoPrice: null
            }
          });
          updatedCount++;
        }
      }
    }
    
    console.log(`Pricing migration completed! Updated ${updatedCount} products.`);
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

fixPricing();
