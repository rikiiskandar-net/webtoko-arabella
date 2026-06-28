import { NextResponse } from "next/server";
import { verifyToken, hashPassword } from "@/lib/auth";
import prisma from "@/lib/prisma";

function getSession(request) {
  const token = request.cookies.get("auth_token")?.value;
  if (!token) return null;
  return verifyToken(token);
}

function isSuperAdmin(session) {
  return session && session.role === "superadmin";
}

export async function PUT(request, { params }) {
  const session = getSession(request);
  if (!isSuperAdmin(session)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { id } = params;
    const data = await request.json();

    const existing = await prisma.admin.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Admin tidak ditemukan" }, { status: 404 });
    }

    if (existing.role === "superadmin" && data.role !== "superadmin" && session.id !== id) {
      return NextResponse.json({ error: "Tidak bisa menurunkan role superadmin" }, { status: 400 });
    }

    const updateData = {};
    if (data.name) updateData.name = data.name;
    if (data.role) updateData.role = data.role === "superadmin" ? "superadmin" : "admin";
    if (typeof data.isActive === "boolean") updateData.isActive = data.isActive;
    if (data.password) updateData.password = await hashPassword(data.password);

    const admin = await prisma.admin.update({
      where: { id },
      data: updateData,
      select: { id: true, username: true, name: true, role: true, isActive: true, createdAt: true },
    });

    return NextResponse.json(admin);
  } catch {
    return NextResponse.json({ error: "Gagal memperbarui admin" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const session = getSession(request);
  if (!isSuperAdmin(session)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { id } = params;

    const admin = await prisma.admin.findUnique({ where: { id } });
    if (!admin) {
      return NextResponse.json({ error: "Admin tidak ditemukan" }, { status: 404 });
    }

    if (admin.role === "superadmin") {
      return NextResponse.json({ error: "Tidak bisa menghapus superadmin" }, { status: 400 });
    }

    await prisma.admin.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Gagal menghapus admin" }, { status: 500 });
  }
}
