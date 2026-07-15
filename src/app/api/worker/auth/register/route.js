import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import rateLimit from "@/lib/rateLimit";
import { z } from "zod";
import bcrypt from "bcryptjs";

const registerSchema = z.object({
  name: z.string().min(1, "Nama wajib diisi").max(50),
  email: z.string().email("Format email tidak valid").min(1, "Email wajib diisi"),
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

    const rateLimitResult = rateLimit(request, { limit: 5, windowMs: 15 * 60 * 1000 });
    if (!rateLimitResult.success) {
      return NextResponse.json({ error: `Terlalu banyak percobaan. Coba lagi dalam ${rateLimitResult.retryAfter} detik.` }, { status: 429 });
    }

    const existingWorker = await prisma.worker.findUnique({ where: { email } });

    if (existingWorker) {
      return NextResponse.json({ error: "Email sudah terdaftar" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const worker = await prisma.worker.create({
      data: {
        name,
        email,
        password: hashedPassword,
        isActive: true,
        baseWage: 0, // Default wage is 0 until admin sets it
        role: "Pekerja"
      }
    });

    return NextResponse.json({ success: true, workerId: worker.id }, { status: 201 });
  } catch (error) {
    console.error("Worker register error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan sistem" }, { status: 500 });
  }
}
