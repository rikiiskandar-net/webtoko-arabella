import { NextResponse } from "next/server";
import { setWorkerAuthCookie, verifyWorkerPassword } from "@/lib/workerAuth";
import prisma from "@/lib/prisma";
import rateLimit from "@/lib/rateLimit";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("Format email tidak valid").min(1, "Email wajib diisi"),
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

    const rateLimitResult = rateLimit(request, { limit: 10, windowMs: 15 * 60 * 1000 });
    if (!rateLimitResult.success) {
      return NextResponse.json({ error: `Terlalu banyak percobaan. Coba lagi dalam ${rateLimitResult.retryAfter} detik.` }, { status: 429 });
    }

    const worker = await prisma.worker.findUnique({ where: { email } });

    if (!worker) {
      return NextResponse.json({ error: "Email atau password salah" }, { status: 401 });
    }

    if (!worker.isActive) {
      return NextResponse.json({ error: "Akun ini telah dinonaktifkan" }, { status: 403 });
    }

    const valid = await verifyWorkerPassword(password, worker.password);
    if (!valid) {
      return NextResponse.json({ error: "Email atau password salah" }, { status: 401 });
    }

    await setWorkerAuthCookie({
      id: worker.id,
      email: worker.email,
      name: worker.name,
      role: worker.role,
    });

    return NextResponse.json({ success: true, user: { name: worker.name, role: worker.role } });
  } catch (error) {
    console.error("Worker login error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}
