import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const RATE_LIMIT = 5; // 5 pesanan
const RATE_WINDOW = 15 * 60 * 1000; // per 15 menit
const attempts = new Map();

// Bersihkan cache IP setiap 15 menit
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of attempts) {
    if (now - entry.start > RATE_WINDOW) attempts.delete(ip);
  }
}, 15 * 60 * 1000).unref();

function isRateLimited(ip) {
  const now = Date.now();
  const entry = attempts.get(ip);
  if (!entry || now - entry.start > RATE_WINDOW) {
    attempts.set(ip, { count: 1, start: now });
    return false;
  }
  entry.count++;
  return entry.count > RATE_LIMIT;
}

export async function POST(request) {
  try {
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    if (isRateLimited(ip)) {
      return NextResponse.json({ error: "Sistem mendeteksi terlalu banyak pesanan. Mohon tunggu 15 menit sebelum memesan lagi." }, { status: 429 });
    }

    const body = await request.json();
    const { customerName, customerPhone, address, notes, items, totalPrice } = body;

    if (!customerName || !address || !items || !totalPrice) {
      return NextResponse.json({ error: "Nama, alamat, item, dan total harga wajib diisi" }, { status: 400 });
    }

    const order = await prisma.order.create({
      data: {
        customerName,
        customerPhone: customerPhone || "",
        address,
        notes: notes || "",
        items,
        totalPrice: parseInt(totalPrice),
        status: "pending",
      },
    });

    return NextResponse.json({ success: true, orderId: order.id }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Gagal membuat pesanan" }, { status: 500 });
  }
}
