import { NextResponse } from "next/server";
import { getWorkerAuthSession } from "@/lib/workerAuth";
import prisma from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getWorkerAuthSession();
  
  if (!session) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  try {
    const worker = await prisma.worker.findUnique({
      where: { id: session.id },
      select: { id: true, email: true, name: true, role: true, phone: true, address: true, baseWage: true }
    });

    if (!worker) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    return NextResponse.json({
      authenticated: true,
      user: worker
    });
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
