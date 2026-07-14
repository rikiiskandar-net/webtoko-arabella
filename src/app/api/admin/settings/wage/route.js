import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthSession as getAdminSession } from "@/lib/auth";

export async function PUT(req) {
  try {
    const session = await getAdminSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { baseWage } = body;

    if (baseWage === undefined) {
      return NextResponse.json({ error: "Base wage required" }, { status: 400 });
    }

    await prisma.admin.update({
      where: { id: session.id },
      data: { baseWage: Number(baseWage) }
    });

    return NextResponse.json({ success: true, baseWage: Number(baseWage) });
  } catch (error) {
    console.error("Error updating base wage:", error);
    return NextResponse.json({ error: "Failed to update base wage" }, { status: 500 });
  }
}
