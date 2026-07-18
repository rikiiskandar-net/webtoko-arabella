import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthSession as getAdminSession } from "@/lib/auth";

export async function GET(req) {
  try {
    const session = await getAdminSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const closedPeriods = await prisma.workerPayrollPeriod.findMany({
      where: {
        isClosed: true
      },
      include: {
        worker: {
          select: { name: true, role: true }
        },
        attendances: {
          orderBy: { date: 'asc' }
        }
      },
      orderBy: { endDate: 'desc' }
    });

    return NextResponse.json({ periods: closedPeriods });
  } catch (error) {
    console.error("Error fetching worker attendance history:", error);
    return NextResponse.json({ error: "Failed to fetch history" }, { status: 500 });
  }
}
