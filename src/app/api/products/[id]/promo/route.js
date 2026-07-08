import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

async function checkAuth(request) {
  const token = request.cookies.get("auth_token")?.value;
  if (!token) return false;
  return await verifyToken(token) !== null;
}

export async function PATCH(request, { params }) {
  if (!(await checkAuth(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const { isPromo } = await request.json();

    const product = await prisma.product.update({
      where: { id },
      data: { isPromo }
    });

    return NextResponse.json({ success: true, product });
  } catch (error) {
    console.error("Error toggling promo:", error);
    return NextResponse.json({ error: "Gagal mengubah status promo" }, { status: 500 });
  }
}
