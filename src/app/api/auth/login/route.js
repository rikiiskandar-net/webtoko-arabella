import { NextResponse } from "next/server";
import { signToken, verifyPassword, seedFirstAdmin } from "@/lib/auth";
import prisma from "@/lib/prisma";
import rateLimit from "@/lib/rateLimit";


import { z } from "zod";

const loginSchema = z.object({
  username: z.string().min(1, "Username wajib diisi"),
  password: z.string().min(1, "Password wajib diisi")
});

export async function POST(request) {
  try {
    const body = await request.json();
    const result = loginSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.errors[0].message }, { status: 400 });
    }

    const { username, password } = result.data;

    const rateLimitResult = rateLimit(request, { limit: 5, windowMs: 15 * 60 * 1000 });
    if (!rateLimitResult.success) {
      return NextResponse.json({ error: `Terlalu banyak percobaan. Coba lagi dalam ${rateLimitResult.retryAfter} detik.` }, { status: 429 });
    }

    await seedFirstAdmin();

    const admin = await prisma.admin.findUnique({ where: { username } });

    if (!admin) {
      return NextResponse.json({ error: "Username atau password salah" }, { status: 401 });
    }

    if (!admin.isActive) {
      return NextResponse.json({ error: "Akun ini telah dinonaktifkan" }, { status: 403 });
    }

    const valid = await verifyPassword(password, admin.password);
    if (!valid) {
      return NextResponse.json({ error: "Username atau password salah" }, { status: 401 });
    }

    const token = await signToken({
      id: admin.id,
      username: admin.username,
      name: admin.name,
      role: admin.role,
    });

    const response = NextResponse.json({ success: true, user: { name: admin.name, role: admin.role } });
    response.cookies.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24,
    });
    return response;
  } catch {
    return NextResponse.json({ error: "Terjadi kesalahan" }, { status: 500 });
  }
}
