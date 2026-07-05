import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

function getSession(request) {
  const token = request.cookies.get("auth_token")?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function PATCH(request, { params }) {
  const session = getSession(request);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { userId } = await params;
    const { isActive } = await request.json();

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { isActive },
      select: { id: true, isActive: true }
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Toggle User Error:", error);
    return NextResponse.json({ error: "Gagal mengubah status pengguna" }, { status: 500 });
  }
}
