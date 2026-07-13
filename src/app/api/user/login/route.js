import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { signUserToken, USER_COOKIE_NAME } from "@/lib/userAuth";

import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("Format email tidak valid"),
  password: z.string().min(1, "Password wajib diisi")
});

export async function POST(request) {
  try {
    const body = await request.json();
    const result = loginSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.errors[0].message }, { status: 400 });
    }

    const { email, password } = result.data;

    // Cari user
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (!user) {
      return NextResponse.json({ error: "Email atau password salah" }, { status: 401 });
    }

    if (!user.isActive) {
      return NextResponse.json({ error: "Akun Anda telah dinonaktifkan. Hubungi admin." }, { status: 403 });
    }

    // Verifikasi password
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return NextResponse.json({ error: "Email atau password salah" }, { status: 401 });
    }

    // Buat token
    const token = await signUserToken({ userId: user.id, email: user.email, name: user.name });

    const response = NextResponse.json({
      success: true,
      user: { id: user.id, name: user.name, email: user.email, avatar: user.avatar }
    });

    response.cookies.set(USER_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error(error);
    const errorDetails = typeof error === 'object' && error !== null 
      ? JSON.stringify(error, Object.getOwnPropertyNames(error))
      : String(error);
    return NextResponse.json({ error: errorDetails }, { status: 500 });
  }
}
