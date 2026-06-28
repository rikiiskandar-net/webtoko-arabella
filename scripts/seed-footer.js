const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

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
  console.log("DONE! StoreConfig updated successfully.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
