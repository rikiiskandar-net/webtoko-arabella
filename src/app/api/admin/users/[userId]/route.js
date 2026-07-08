import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import bcrypt from "bcryptjs";

async function getSession(request) {
  const token = request.cookies.get("auth_token")?.value;
  if (!token) return null;
  return await verifyToken(token);
}

export async function PATCH(request, { params }) {
  const session = await getSession(request);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { userId } = await params;
    const { isActive, name, email, phone, address, password } = await request.json();

    const data = {};
    if (isActive !== undefined) data.isActive = isActive;
    if (name !== undefined) data.name = name;
    if (email !== undefined) data.email = email;
    if (phone !== undefined) data.phone = phone;
    if (address !== undefined) data.address = address;

    if (password && password.trim() !== "") {
      const hashed = await bcrypt.hash(password, 10);
      data.password = hashed;
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data,
      select: { id: true, isActive: true, name: true, email: true, phone: true, address: true }
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Update User Error:", error);
    return NextResponse.json({ error: "Gagal memperbarui pengguna" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const session = await getSession(request);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { userId } = await params;
    await prisma.user.delete({
      where: { id: userId }
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete User Error:", error);
    return NextResponse.json({ error: "Gagal menghapus pengguna" }, { status: 500 });
  }
}
