import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const categories = [
      { name: "Minuman", icon: "CupSoda" },
      { name: "Makanan", icon: "UtensilsCrossed" },
      { name: "Camilan", icon: "Cookie" },
      { name: "Frozen Food", icon: "Snowflake" }
    ];

    const products = [
      { name: "Cireng Salju Isi Ayam Pedas", price: 15000, categoryName: "Camilan", image: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=400&q=80", description: "Cireng renyah di luar, kenyal di dalam dengan isian ayam suwir pedas mercon." },
      { name: "Es Mambo Buah Asli", price: 5000, categoryName: "Minuman", image: "https://images.unsplash.com/photo-1558231065-985f52f85e13?auto=format&fit=crop&w=400&q=80", description: "Es mambo segar terbuat dari 100% buah asli tanpa pemanis buatan." },
      { name: "Bolu Karamel Sarang Semut", price: 45000, isPromo: true, promoPrice: 35000, categoryName: "Makanan", image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=400&q=80", description: "Bolu karamel manis legit dengan tekstur kenyal bersarang. Diskon spesial!" },
      { name: "Dimsum Ayam Udang", price: 25000, categoryName: "Frozen Food", image: "https://images.unsplash.com/photo-1563227812-0ea4c22e6cc8?auto=format&fit=crop&w=400&q=80", description: "Dimsum ayam dan udang full daging (isi 5) lengkap dengan saus." },
      { name: "Keripik Kaca Daun Jeruk", price: 12000, categoryName: "Camilan", image: "https://images.unsplash.com/photo-1599490659213-e2b9527bd087?auto=format&fit=crop&w=400&q=80", description: "Keripik singkong super tipis, renyah, berbalut bumbu pedas gurih." },
      { name: "Pudding Susu Karamel", price: 18000, categoryName: "Camilan", image: "https://images.unsplash.com/photo-1579954115545-a95711ffa7ba?auto=format&fit=crop&w=400&q=80", description: "Pudding susu super lembut dengan siraman saus karamel lumer di mulut." },
      { name: "Es Jeruk Kunci Segar", price: 8000, categoryName: "Minuman", image: "https://images.unsplash.com/photo-1621269389270-4d407fc3660a?auto=format&fit=crop&w=400&q=80", description: "Perasan jeruk kunci asli yang menyegarkan dengan tambahan biji selasih." },
      { name: "Nugget Ayam Wortel (500g)", price: 40000, isPromo: true, promoPrice: 32000, categoryName: "Frozen Food", image: "https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=400&q=80", description: "Nugget homemade tanpa pengawet dengan campuran ayam asli dan wortel." }
    ];

    // 1. Clear existing data
    await prisma.product.deleteMany({});
    await prisma.category.deleteMany({});

    // 2. Insert Categories
    const createdCategories = {};
    for (const cat of categories) {
      const c = await prisma.category.create({ data: cat });
      createdCategories[c.name] = c.id;
    }

    // 3. Insert Products
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

    return NextResponse.json({ success: true, message: `Seeded ${count} products successfully!` });
  } catch (error) {
    console.error("Seeding Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
