import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const workers = await prisma.worker.findMany({
      where: { isActive: true },
      select: { username: true, name: true, role: true },
      orderBy: { name: 'asc' }
    });

    return NextResponse.json(workers);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch workers" }, { status: 500 });
  }
}
