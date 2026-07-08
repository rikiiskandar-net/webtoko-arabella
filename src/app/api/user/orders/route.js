import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyUserToken } from "@/lib/userAuth";

export async function GET(request) {
  try {
    const token = request.cookies.get("user_token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await verifyUserToken(token);
    if (!payload) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const orders = await prisma.order.findMany({
      where: { userId: payload.id },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error("Fetch user orders error:", error);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}
