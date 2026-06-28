import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { isRateLimited } from "@/lib/rate-limit";

export async function GET(request) {
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  if (isRateLimited(ip)) {
    return NextResponse.json({ error: "Terlalu banyak permintaan. Coba lagi nanti." }, { status: 429 });
  }
  try {
    const config = await prisma.storeConfig.findFirst();
    return NextResponse.json({
      storeName: config?.storeName || "Dapur Arabella",
      waNumber: config?.waNumber || process.env.ADMIN_WA_NUMBER || "",
      description: config?.description || "",
      address: config?.address || "",
      hours: config?.hours || "Tutup pukul 21.00",
      deliveryETA: config?.deliveryETA || "Antar mulai 15 menit",
      instagram: config?.instagram || "",
      email: config?.email || "",
      paymentMethods: config?.paymentMethods || "BCA, Mandiri, GoPay, OVO, ShopeePay",
    });
  } catch {
    return NextResponse.json({
      waNumber: process.env.ADMIN_WA_NUMBER || ""
    });
  }
}
