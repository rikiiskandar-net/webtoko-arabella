import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import dotenv from "dotenv";
dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const config = await prisma.storeConfig.findFirst();
  if (!config) {
    console.log("StoreConfig not found, creating...");
    await prisma.storeConfig.create({
      data: {
        storeName: "Dapur Arabella",
        waNumber: "6281234567890",
        instagram: "dapurarabella",
        facebook: "https://facebook.com/dapurarabella",
        email: "hello@dapurarabella.com",
        paymentMethods: "Bank Transfer, BNI, BCA, Mandiri, OVO, DANA, GoPay, QRIS",
      },
    });
  } else {
    console.log("Updating existing StoreConfig:", config.id);
    console.log("Current paymentMethods:", config.paymentMethods);
    console.log("Current instagram:", config.instagram);
    await prisma.storeConfig.update({
      where: { id: config.id },
      data: {
        paymentMethods: "Bank Transfer, BNI, BCA, Mandiri, OVO, DANA, GoPay, QRIS",
        instagram: config.instagram || "dapurarabella",
        facebook: config.facebook || "https://facebook.com/dapurarabella",
        email: config.email || "hello@dapurarabella.com",
      },
    });
  }
  const updated = await prisma.storeConfig.findFirst();
  console.log("Updated config:", JSON.stringify(updated, null, 2));
  console.log("DONE!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
