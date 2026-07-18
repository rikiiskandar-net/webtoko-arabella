import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthSession as getAdminSession } from "@/lib/auth";

export async function POST(req) {
  try {
    const session = await getAdminSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const activePeriods = await prisma.workerPayrollPeriod.findMany({
      where: { isClosed: false },
      include: {
        attendances: true
      }
    });

    if (activePeriods.length === 0) {
      return NextResponse.json({ error: "No active periods found" }, { status: 404 });
    }

    const closedPeriods = [];

    // Transaction to safely close all periods
    await prisma.$transaction(async (tx) => {
      for (const period of activePeriods) {
        const totalAmount = period.attendances.reduce((sum, att) => sum + att.totalPay, 0);

        const updated = await tx.workerPayrollPeriod.update({
          where: { id: period.id },
          data: {
            isClosed: true,
            endDate: new Date(),
            totalAmount: totalAmount
          }
        });
        closedPeriods.push(updated);
      }
    });

    return NextResponse.json({ message: "Periods closed successfully", closedPeriods });
  } catch (error) {
    console.error("Error closing worker payroll periods:", error);
    return NextResponse.json({ error: "Failed to close periods" }, { status: 500 });
  }
}
