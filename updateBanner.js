const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const banners = await prisma.heroBanner.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' }
  });

  if (banners.length > 0) {
    const targetBanner = banners[0];
    await prisma.heroBanner.update({
      where: { id: targetBanner.id },
      data: {
        badge: '🔥 EKSKLUSIF ORDER VIA WEB',
        title: 'Belanja Makin Banyak, Makin Untung!',
        subtitle: 'Potongan Langsung Rp 1.000 berlaku kelipatan tiap belanja Rp 10.000. Tanpa batas maksimal! Siapkan stok camilan di kulkas Anda sekarang.',
        ctaText: 'Ambil Diskonnya Sekarang 👇'
      }
    });
    console.log('Banner updated successfully!');
  } else {
    console.log('No active banners found to update.');
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
