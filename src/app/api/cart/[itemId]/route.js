import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/userAuth";

// PATCH - Update kuantitas item
export async function PATCH(request, { params }) {
  try {
    const session = await getUserFromRequest(request);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { itemId } = await params;
    const { quantity } = await request.json();

    if (!quantity || quantity < 1) {
      return NextResponse.json({ error: "Quantity minimal 1" }, { status: 400 });
    }

    // Pastikan item milik user ini
    const item = await prisma.cartItem.findFirst({
      where: { id: itemId, cart: { userId: session.userId } }
    });

    if (!item) return NextResponse.json({ error: "Item tidak ditemukan" }, { status: 404 });

    const updated = await prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity },
      include: { product: { select: { id: true, name: true, price: true, promoPrice: true, isPromo: true, image: true } } }
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("CartItem PATCH Error:", error);
    return NextResponse.json({ error: "Gagal update kuantitas" }, { status: 500 });
  }
}
