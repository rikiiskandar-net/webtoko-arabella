import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request) {
  try {
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
