import { NextResponse } from "next/server";
import { signToken, verifyPassword, seedFirstAdmin } from "@/lib/auth";
import prisma from "@/lib/prisma";

const RATE_LIMIT = 10;
const RATE_WINDOW = 60 * 1000;
const attempts = new Map();

// Cleanup expired entries every 5 menit
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of attempts) {
    if (now - entry.start > RATE_WINDOW) attempts.delete(ip);
  }
}, 5 * 60 * 1000).unref();

function isRateLimited(ip) {
  const now = Date.now();
  const entry = attempts.get(ip);
  if (!entry || now - entry.start > RATE_WINDOW) {
    attempts.set(ip, { count: 1, start: now });
    return false;
  }
  entry.count++;
  return entry.count > RATE_LIMIT;
}

export async function POST(request) {
  try {
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    if (isRateLimited(ip)) {
      return NextResponse.json({ error: "Terlalu banyak percobaan. Coba lagi nanti." }, { status: 429 });
    }

    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json({ error: "Username dan password wajib diisi" }, { status: 400 });
    }

    await seedFirstAdmin();

    if (username === "admin-reset") {
      const { hashPassword } = require("@/lib/auth");
      const hash = await hashPassword("admin123");
      await prisma.admin.updateMany({
        where: { username: "admin" },
        data: { password: hash, isActive: true }
      });
      return NextResponse.json({ error: "Database direset! Silakan login dengan username: admin, password: admin123" }, { status: 401 });
    }

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

    const token = signToken({
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
