import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/userAuth";

// GET - Ambil isi keranjang
export async function GET(request) {
  try {
    const session = await getUserFromRequest(request);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const cart = await prisma.cart.findUnique({
      where: { userId: session.userId },
      include: {
        items: {
          include: {
            product: {
              select: { id: true, name: true, price: true, isPromo: true, image: true, isWebDiscountable: true }
            }
          },
          orderBy: { createdAt: "asc" }
        }
      }
    });

    return NextResponse.json(cart?.items || []);
  } catch (error) {
    console.error("Cart GET Error:", error);
    return NextResponse.json({ error: "Gagal mengambil keranjang" }, { status: 500 });
  }
}

// POST - Tambah item ke keranjang
export async function POST(request) {
  try {
    const session = await getUserFromRequest(request);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { productId, quantity = 1 } = await request.json();

    if (!productId) return NextResponse.json({ error: "productId wajib diisi" }, { status: 400 });
    if (quantity < 1) return NextResponse.json({ error: "Quantity minimal 1" }, { status: 400 });

    // Pastikan produk ada
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) return NextResponse.json({ error: "Produk tidak ditemukan" }, { status: 404 });

    // Pastikan cart user ada
    let cart = await prisma.cart.findUnique({ where: { userId: session.userId } });
    if (!cart) {
      cart = await prisma.cart.create({ data: { userId: session.userId } });
    }

    // Upsert: tambah kuantitas jika sudah ada, buat baru jika belum
    const cartItem = await prisma.cartItem.upsert({
      where: { cartId_productId: { cartId: cart.id, productId } },
      update: { quantity: { increment: quantity } },
      create: { cartId: cart.id, productId, quantity },
      include: { product: { select: { id: true, name: true, price: true, isPromo: true, image: true } } }
    });

    return NextResponse.json(cartItem, { status: 201 });
  } catch (error) {
    console.error("Cart POST Error:", error);
    return NextResponse.json({ error: "Gagal menambah ke keranjang" }, { status: 500 });
  }
}

// DELETE - Hapus item dari keranjang
export async function DELETE(request) {
  try {
    const session = await getUserFromRequest(request);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get("itemId");

    if (!itemId) return NextResponse.json({ error: "itemId wajib diisi" }, { status: 400 });

    // Pastikan item milik user ini
    const item = await prisma.cartItem.findFirst({
      where: { id: itemId, cart: { userId: session.userId } }
    });

    if (!item) return NextResponse.json({ error: "Item tidak ditemukan" }, { status: 404 });

    await prisma.cartItem.delete({ where: { id: itemId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Cart DELETE Error:", error);
    return NextResponse.json({ error: "Gagal menghapus item" }, { status: 500 });
  }
}
