import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import prisma from "@/lib/prisma";

function getSession(request) {
  const token = request.cookies.get("auth_token")?.value;
  if (!token) return null;
  return verifyToken(token);
}

// GET /api/products
export async function GET(request) {
  const session = getSession(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const products = await prisma.product.findMany({
      include: { category: true },
      orderBy: { createdAt: 'desc' },
      take: 200,
    });
    return NextResponse.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json({ error: "Gagal mengambil produk" }, { status: 500 });
  }
}

// POST /api/products
export async function POST(request) {
  const session = getSession(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await request.json();
    
    // Validate required fields
    if (!data.name || !data.price || !data.categoryId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const product = await prisma.product.create({
      data: {
        name: data.name,
        price: parseInt(data.price),
        description: data.description || "",
        image: data.image || "/images/placeholder.jpg",
        isPromo: data.isPromo || false,
        promoPrice: data.promoPrice ? parseInt(data.promoPrice) : null,
        originalPrice: data.originalPrice ? parseInt(data.originalPrice) : null,
        badge: data.badge || null,
        rating: data.rating ? parseFloat(data.rating) : 0,
        sold: data.sold || "0",
        categoryId: data.categoryId
      }
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json({ error: "Gagal membuat produk" }, { status: 500 });
  }
}
