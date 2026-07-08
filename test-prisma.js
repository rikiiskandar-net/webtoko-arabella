const { prisma } = require('./src/lib/prisma');

async function check() {
  const count = await prisma.user.count();
  console.log("Users:", count);
}

check().catch(console.error).finally(() => prisma.$disconnect());
