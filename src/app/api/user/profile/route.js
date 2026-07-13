import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/userAuth";
import { uploadProductImage } from "@/lib/storage";

// GET - Ambil profil user
export async function GET(request) {
  try {
    const session = await getUserFromRequest(request);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { id: true, name: true, email: true, phone: true, address: true, avatar: true, createdAt: true }
    });

    if (!user) return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 });

    return NextResponse.json(user);
  } catch (error) {
    console.error("Profile GET Error:", error);
    return NextResponse.json({ error: error.message || "Terjadi kesalahan server" }, { status: 500 });
  }
}

// PATCH - Update profil user
export async function PATCH(request) {
  try {
    const session = await getUserFromRequest(request);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const contentType = request.headers.get("content-type") || "";

    let updateData = {};

    if (contentType.includes("multipart/form-data")) {
      // Upload foto avatar
      const formData = await request.formData();
      const file = formData.get("avatar");

      if (!file || typeof file !== "object") {
        return NextResponse.json({ error: "File tidak ditemukan" }, { status: 400 });
      }

      const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
      if (!ALLOWED_TYPES.includes(file.type)) {
        return NextResponse.json({ error: "Format foto harus JPG, PNG, atau WebP" }, { status: 400 });
      }

      if (file.size > 2 * 1024 * 1024) {
        return NextResponse.json({ error: "Ukuran foto maksimal 2MB" }, { status: 400 });
      }

      const avatarUrl = await uploadProductImage(file);
      updateData.avatar = avatarUrl;
    } else {
      // Update data teks (nama, alamat, telepon)
      const body = await request.json();
      const { name, phone, address } = body;

      if (name !== undefined) {
        if (!name.trim()) return NextResponse.json({ error: "Nama tidak boleh kosong" }, { status: 400 });
        updateData.name = name.trim();
      }
      if (phone !== undefined) updateData.phone = phone.trim();
      if (address !== undefined) updateData.address = address.trim();
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.userId },
      data: updateData,
      select: { id: true, name: true, email: true, phone: true, address: true, avatar: true }
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Profile PATCH Error:", error);
    return NextResponse.json({ error: error.message || "Terjadi kesalahan server" }, { status: 500 });
  }
}
