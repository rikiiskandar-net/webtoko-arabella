import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyUserToken } from "@/lib/userAuth";

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
    const { customerName, customerPhone, address, notes, items, userId } = body;

    let finalCustomerName = customerName;
    let finalAddress = address;
    let finalPhone = customerPhone;
    let finalUserId = userId;

    // Check if there's a token to auto-fill user data
    const token = request.cookies.get("user_token")?.value;
    if (token) {
      try {
        const payload = await verifyUserToken(token);
        if (payload) {
          const user = await prisma.user.findUnique({ where: { id: payload.userId } });
          if (user) {
            finalCustomerName = user.name;
            finalAddress = user.address || finalAddress || "Detail via WhatsApp";
            finalPhone = user.phone || finalPhone || "";
            finalUserId = user.id;
          }
        }
      } catch (err) {
        console.error("Token verification failed in order creation:", err);
      }
    }

    if (!finalCustomerName) finalCustomerName = "Pelanggan Baru (Guest)";
    if (!finalAddress) finalAddress = "Detail via WhatsApp";

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Keranjang belanja wajib diisi" }, { status: 400 });
    }

    // Ambil ID produk unik dari keranjang
    const productIds = items.map(item => item.id).filter(Boolean);
    
    // Ambil data produk asli dari database
    const dbProducts = await prisma.product.findMany({
      where: { id: { in: productIds } }
    });

    let subtotal = 0;
    let discountableTotal = 0;
    const validatedItems = [];

    // Validasi setiap item
    for (const item of items) {
      if (!item.id || !item.qty || item.qty <= 0) continue;
      
      const dbProduct = dbProducts.find(p => p.id === item.id);
      if (dbProduct) {
        // Gunakan promoPrice jika ada
        const basePrice = dbProduct.isPromo && dbProduct.promoPrice ? dbProduct.promoPrice : dbProduct.price;
        
        // Kalkulasi harga varian
        const variants = item.variants || [];
        const extraPrice = variants.reduce((sum, v) => sum + (v.priceMod || 0), 0);
        
        const activePrice = basePrice + extraPrice;
        const lineTotal = activePrice * item.qty;
        
        subtotal += lineTotal;
        if (dbProduct.isWebDiscountable !== false) {
          discountableTotal += lineTotal;
        }

        validatedItems.push({
          id: dbProduct.id,
          name: dbProduct.name,
          qty: item.qty,
          price: activePrice,
          variants: variants
        });
      }
    }

    if (validatedItems.length === 0) {
      return NextResponse.json({ error: "Produk tidak valid atau tidak ditemukan" }, { status: 400 });
    }

    // Kalkulasi diskon web (Rp 1.000 setiap kelipatan Rp 10.000)
    const discountAmount = Math.floor(discountableTotal / 10000) * 1000;
    const calculatedTotal = subtotal - discountAmount;

    const order = await prisma.order.create({
      data: {
        customerName: finalCustomerName,
        customerPhone: finalPhone || "",
        address: finalAddress,
        notes: notes || "",
        items: validatedItems, // Simpan item yang sudah divalidasi server
        totalPrice: calculatedTotal, // Simpan total hasil hitungan server
        status: "pending",
        userId: finalUserId || null, // Hubungkan ke user jika ada
      },
    });

    return NextResponse.json({ success: true, orderId: order.id }, { status: 201 });
  } catch (error) {
    console.error("Order creation error:", error);
    return NextResponse.json({ error: "Gagal membuat pesanan" }, { status: 500 });
  }
}
