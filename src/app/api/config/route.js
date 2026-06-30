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
      aboutTitle: config?.aboutTitle || "Berawal dari Camilan Sehat untuk Anak",
      aboutDescription: config?.aboutDescription || "Dapur Arabella memang baru seumur jagung, tapi kecintaan kami pada masakan rumahan sudah ada sejak lama. Semuanya berawal dari hobi memasak dan keisengan membuatkan camilan sore yang aman untuk anak-anak di rumah. Ternyata, saat tetangga ikut mencicipi, mereka sangat menyukainya dan mulai ikut memesan!\n\nDari dorongan merekalah Dapur Arabella akhirnya lahir. Karena pada dasarnya masakan ini kami buat untuk keluarga sendiri, kami sangat cerewet soal kebersihan dan pantang menggunakan bahan pengawet.",
      aboutPoints: config?.aboutPoints || "Tanpa Bahan Pengawet,Bahan Bumbu Pilihan,Kebersihan Terjamin,Dibuat Terbatas (Fresh)",
      aboutBadgeNumber: config?.aboutBadgeNumber || "100%",
      aboutBadgeText: config?.aboutBadgeText || "Buatan\nTangan",
      aboutImage: config?.aboutImage || "/images/about_us.jpg",
    });
  } catch {
    return NextResponse.json({
      waNumber: process.env.ADMIN_WA_NUMBER || ""
    });
  }
}
