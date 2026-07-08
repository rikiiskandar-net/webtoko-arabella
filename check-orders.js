const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkOrders() {
  const count = await prisma.order.count();
  console.log('Total Orders in DB:', count);
  if (count > 0) {
    const orders = await prisma.order.findMany();
    console.log(orders);
  }
}

checkOrders().catch(console.error).finally(() => prisma.$disconnect());
