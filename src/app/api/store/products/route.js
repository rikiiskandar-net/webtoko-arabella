import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { isRateLimited } from "@/lib/rate-limit";

const BADGE_COLORS = {
  Promo: "var(--red)",
  Bestseller: "var(--accent)",
  Baru: "var(--primary)",
};

export async function GET(request) {
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  if (isRateLimited(ip)) {
    return NextResponse.json({ error: "Terlalu banyak permintaan. Coba lagi nanti." }, { status: 429 });
  }

  try {
    const products = await prisma.product.findMany({
      include: { category: true },
      orderBy: { createdAt: "desc" },
      take: 200,
    });

    const mapped = products.map((p) => ({
      id: p.id,
      name: p.name,
      price: p.price,
      promoPrice: p.isPromo ? p.promoPrice : null,
      originalPrice: p.originalPrice || null,
      isPromo: p.isPromo || false,
      category: p.category.name,
      badge: p.badge || "",
      badgeColor: p.badge ? BADGE_COLORS[p.badge] || "var(--primary)" : "",
      image: p.image,
      description: p.description,
      rating: p.rating,
      sold: p.sold,
    }));

    return NextResponse.json(mapped);
  } catch (error) {
    console.error("Error fetching store products:", error);
    return NextResponse.json({ error: "Gagal mengambil produk" }, { status: 500 });
  }
}
