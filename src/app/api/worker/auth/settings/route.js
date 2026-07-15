import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getWorkerAuthSession, setWorkerAuthCookie, hashWorkerPassword } from "@/lib/workerAuth";

export const dynamic = 'force-dynamic';

export async function PUT(req) {
  try {
    const session = await getWorkerAuthSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { email, password } = body;

    if (!email) {
      return NextResponse.json({ error: "Email wajib diisi" }, { status: 400 });
    }

    // Check if new email is already used by another worker
    if (email !== session.email) {
      const existing = await prisma.worker.findUnique({ where: { email } });
      if (existing) {
        return NextResponse.json({ error: "Email sudah digunakan pekerja lain" }, { status: 400 });
      }
    }

    const updateData = { email };

    if (password && password.trim() !== "") {
      updateData.password = await hashWorkerPassword(password);
    }

    const updatedWorker = await prisma.worker.update({
      where: { id: session.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        role: true,
        baseWage: true,
      }
    });

    // Refresh the auth cookie so the session stays active with the new email
    await setWorkerAuthCookie({
      id: updatedWorker.id,
      email: updatedWorker.email,
      name: updatedWorker.name,
      role: updatedWorker.role
    });

    return NextResponse.json({ success: true, user: updatedWorker });
  } catch (error) {
    console.error("Worker settings error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}
