import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getWorkerAuthSession } from "@/lib/workerAuth";

export async function POST(req) {
  try {
    const session = await getWorkerAuthSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { periodId } = body;

    if (!periodId) {
      return NextResponse.json({ error: "Period ID required" }, { status: 400 });
    }

    // Verify period belongs to worker
    const period = await prisma.workerPayrollPeriod.findUnique({
      where: { id: periodId }
    });

    if (!period || period.workerId !== session.id) {
      return NextResponse.json({ error: "Period not found or unauthorized" }, { status: 404 });
    }

    if (period.isClosed) {
      return NextResponse.json({ error: "Period already closed" }, { status: 400 });
    }

    // Calculate total amount from attendances
    const attendances = await prisma.workerAttendance.findMany({
      where: { payrollPeriodId: periodId }
    });
    const totalAmount = attendances.reduce((sum, att) => sum + att.totalPay, 0);

    // Update period to closed
    const updatedPeriod = await prisma.workerPayrollPeriod.update({
      where: { id: periodId },
      data: {
        isClosed: true,
        endDate: new Date(),
        totalAmount: totalAmount
      }
    });

    // Create a new active period
    await prisma.workerPayrollPeriod.create({
      data: {
        workerId: session.id,
        startDate: new Date(),
      }
    });

    return NextResponse.json({ success: true, period: updatedPeriod });
  } catch (error) {
    console.error("Error closing worker payroll period:", error);
    return NextResponse.json({ error: "Failed to close period" }, { status: 500 });
  }
}
