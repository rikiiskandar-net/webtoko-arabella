import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import prisma from "@/lib/prisma";

function getSession(request) {
  const token = request.cookies.get("auth_token")?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function PUT(request, { params }) {
  const session = getSession(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = params;
    const data = await request.json();

    const existing = await prisma.heroBanner.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Banner tidak ditemukan" }, { status: 404 });
    }

    const banner = await prisma.heroBanner.update({
      where: { id },
      data,
    });

    return NextResponse.json(banner);
  } catch {
    return NextResponse.json({ error: "Gagal memperbarui banner" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const session = getSession(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = params;

    const existing = await prisma.heroBanner.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Banner tidak ditemukan" }, { status: 404 });
    }

    await prisma.heroBanner.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Gagal menghapus banner" }, { status: 500 });
  }
}
