import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthSession as getAdminSession } from "@/lib/auth";

// POST close the active period
export async function POST(req) {
  try {
    const session = await getAdminSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const activePeriod = await prisma.payrollPeriod.findFirst({
      where: { adminId: session.id, isClosed: false },
      include: {
        attendances: true
      }
    });

    if (!activePeriod) {
      return NextResponse.json({ error: "No active period found" }, { status: 404 });
    }

    // Calculate total amount
    const totalAmount = activePeriod.attendances.reduce((sum, att) => sum + att.totalPay, 0);

    const updatedPeriod = await prisma.payrollPeriod.update({
      where: { id: activePeriod.id },
      data: {
        isClosed: true,
        endDate: new Date(),
        totalAmount: totalAmount
      }
    });

    return NextResponse.json(updatedPeriod);
  } catch (error) {
    console.error("Error closing payroll period:", error);
    return NextResponse.json({ error: "Failed to close period" }, { status: 500 });
  }
}
