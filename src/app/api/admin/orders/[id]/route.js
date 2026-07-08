import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import prisma from "@/lib/prisma";

async function getSession(request) {
  const token = request.cookies.get("auth_token")?.value;
  if (!token) return null;
  return await verifyToken(token);
}

export async function PUT(request, { params }) {
  const session = await getSession(request);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json({ error: "Status wajib diisi" }, { status: 400 });
    }

    const order = await prisma.order.update({
      where: { id: id },
      data: { status },
    });
    return NextResponse.json(order);
  } catch (error) {
    console.error("Order update error:", error);
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const session = await getSession(request);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    await prisma.order.delete({ where: { id: id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Order delete error:", error);
    return NextResponse.json({ error: "Failed to delete order" }, { status: 500 });
  }
}
