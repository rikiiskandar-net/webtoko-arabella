import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { signUserToken, USER_COOKIE_NAME } from "@/lib/userAuth";

import { z } from "zod";

const registerSchema = z.object({
  name: z.string().min(1, "Nama wajib diisi"),
  email: z.string().email("Format email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter")
});

export async function POST(request) {
  try {
    const body = await request.json();
    const result = registerSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.errors[0].message }, { status: 400 });
    }

    const { name, email, password } = result.data;

    // Cek apakah email sudah terdaftar
    const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (existing) {
      return NextResponse.json({ error: "Email sudah terdaftar, silakan login" }, { status: 409 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Buat user + cart kosong secara bersamaan (transaction)
    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          name: name.trim(),
          email: email.toLowerCase().trim(),
          password: hashedPassword,
        },
      });
      // Buat cart kosong untuk user baru
      await tx.cart.create({ data: { userId: newUser.id } });
      return newUser;
    });

    // Auto-login setelah daftar
    const token = await signUserToken({ userId: user.id, email: user.email, name: user.name });

    const response = NextResponse.json({
      success: true,
      user: { id: user.id, name: user.name, email: user.email }
    }, { status: 201 });

    response.cookies.set(USER_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 hari
    });

    return response;
  } catch (error) {
    console.error("Register Error:", error);
    return NextResponse.json({ error: error.message || "Terjadi kesalahan server" }, { status: 500 });
  }
}
