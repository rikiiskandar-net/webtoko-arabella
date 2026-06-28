import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { isRateLimited } from "@/lib/rate-limit";

export async function GET(request) {
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  if (isRateLimited(ip)) {
    return NextResponse.json({ error: "Terlalu banyak permintaan. Coba lagi nanti." }, { status: 429 });
  }
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: "asc" },
      take: 50,
    });

    const mapped = [
      { id: "Semua", name: "Semua", icon: "Grid2x2" },
      ...categories.map((c) => ({
        id: c.name,
        name: c.name,
        icon: c.icon,
      })),
    ];

    return NextResponse.json(mapped);
  } catch (error) {
    console.error("Error fetching store categories:", error);
    return NextResponse.json({ error: "Gagal mengambil kategori" }, { status: 500 });
  }
}
