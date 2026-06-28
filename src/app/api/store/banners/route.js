import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { isRateLimited } from "@/lib/rate-limit";

export async function GET(request) {
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  if (isRateLimited(ip)) {
    return NextResponse.json({ error: "Terlalu banyak permintaan. Coba lagi nanti." }, { status: 429 });
  }
  try {
    const banners = await prisma.heroBanner.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    });
    return NextResponse.json(banners);
  } catch (error) {
    console.error("Error fetching store banners:", error);
    return NextResponse.json({ error: "Gagal mengambil banner" }, { status: 500 });
  }
}
