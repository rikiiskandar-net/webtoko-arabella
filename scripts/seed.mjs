import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString, ssl: { rejectUnauthorized: false } });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Starting seed...");

  const categories = [
    { name: "Minuman", icon: "CupSoda" },
    { name: "Makanan", icon: "UtensilsCrossed" },
    { name: "Camilan", icon: "Cookie" },
    { name: "Frozen Food", icon: "Snowflake" }
  ];

  const products = [
    { name: "Cireng Salju Isi Ayam Pedas", price: 15000, categoryName: "Camilan", badge: "Bestseller", rating: 4.9, sold: "2.1k", image: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=400&q=80", description: "Cireng renyah di luar, kenyal di dalam dengan isian ayam suwir pedas mercon." },
    { name: "Es Mambo Buah Asli", price: 5000, categoryName: "Minuman", rating: 4.7, sold: "850", image: "https://images.unsplash.com/photo-1558231065-985f52f85e13?auto=format&fit=crop&w=400&q=80", description: "Es mambo segar terbuat dari 100% buah asli tanpa pemanis buatan." },
    { name: "Bolu Karamel Sarang Semut", price: 35000, originalPrice: 45000, isPromo: true, promoPrice: 35000, categoryName: "Makanan", badge: "Promo", rating: 4.8, sold: "1.2k", image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=400&q=80", description: "Bolu karamel manis legit dengan tekstur kenyal bersarang. Diskon spesial!" },
    { name: "Dimsum Ayam Udang", price: 25000, categoryName: "Frozen Food", badge: "Bestseller", rating: 5.0, sold: "3.5k", image: "https://images.unsplash.com/photo-1563227812-0ea4c22e6cc8?auto=format&fit=crop&w=400&q=80", description: "Dimsum ayam dan udang full daging (isi 5) lengkap dengan saus." },
    { name: "Keripik Kaca Daun Jeruk", price: 12000, categoryName: "Camilan", rating: 4.6, sold: "450", image: "https://images.unsplash.com/photo-1599490659213-e2b9527bd087?auto=format&fit=crop&w=400&q=80", description: "Keripik singkong super tipis, renyah, berbalut bumbu pedas gurih." },
    { name: "Pudding Susu Karamel", price: 18000, categoryName: "Camilan", badge: "Baru", rating: 4.9, sold: "230", image: "https://images.unsplash.com/photo-1579954115545-a95711ffa7ba?auto=format&fit=crop&w=400&q=80", description: "Pudding susu super lembut dengan siraman saus karamel lumer di mulut." },
    { name: "Es Jeruk Kunci Segar", price: 8000, categoryName: "Minuman", badge: "Baru", rating: 4.5, sold: "120", image: "https://images.unsplash.com/photo-1621269389270-4d407fc3660a?auto=format&fit=crop&w=400&q=80", description: "Perasan jeruk kunci asli yang menyegarkan dengan tambahan biji selasih." },
    { name: "Nugget Ayam Wortel (500g)", price: 32000, originalPrice: 40000, isPromo: true, promoPrice: 32000, categoryName: "Frozen Food", badge: "Promo", rating: 4.8, sold: "980", image: "https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=400&q=80", description: "Nugget homemade tanpa pengawet dengan campuran ayam asli dan wortel." }
  ];

  await prisma.product.deleteMany({});
  await prisma.category.deleteMany({});
  console.log("Cleared old data");

  const createdCategories = {};
  for (const cat of categories) {
    const c = await prisma.category.create({ data: cat });
    createdCategories[c.name] = c.id;
  }
  console.log("Seeded categories");

  let count = 0;
  for (const p of products) {
    const { categoryName, ...rest } = p;
    await prisma.product.create({
      data: {
        ...rest,
        categoryId: createdCategories[categoryName]
      }
    });
    count++;
  }
  console.log(`Seeded ${count} products successfully!`);

  // Seed default store config
  const existing = await prisma.storeConfig.findFirst();
  if (!existing) {
    await prisma.storeConfig.create({
      data: {
        storeName: "Dapur Arabella",
        waNumber: process.env.ADMIN_WA_NUMBER || "6281234567890",
        description: "Katalog online Dapur Arabella. Temukan berbagai macam hidangan rumahan, camilan, dan frozen food lezat, higienis, dan dibuat dengan hati.",
        address: "",
        hours: "Tutup pukul 21.00",
        deliveryETA: "Antar mulai 15 menit",
        instagram: "",
        email: "",
        paymentMethods: "BCA, Mandiri, GoPay, OVO, ShopeePay"
      }
    });
    console.log("Seeded store config");
  } else {
    console.log("Store config already exists, skipping");
  }

  // Seed default banners
  const bannerCount = await prisma.heroBanner.count();
  if (bannerCount === 0) {
    await prisma.heroBanner.create({
      data: {
        image: "/images/banner1.png",
        badge: "Diskon Spesial 20%",
        title: "Cita Rasa Rumahan,\nKualitas Premium.",
        subtitle: "Nikmati sensasi kelezatan jajanan Nusantara yang dibuat dengan bahan berkualitas dan resep rahasia Dapur Arabella.",
        ctaText: "Eksplor Menu Sekarang",
        sortOrder: 0,
        isActive: true,
      }
    });
    console.log("Seeded default banner");
  } else {
    console.log("Banner already exists, skipping");
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
