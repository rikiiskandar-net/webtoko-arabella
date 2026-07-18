import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthSession as getAdminSession } from "@/lib/auth";

export async function POST(req) {
  try {
    const session = await getAdminSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { workerId, date, status, baseWage, multiplier, extraPay, notes } = body;

    if (!workerId || !date || !status) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (Number(baseWage) < 0 || Number(multiplier) < 0 || Number(extraPay) < 0) {
      return NextResponse.json({ error: "Angka tidak boleh negatif" }, { status: 400 });
    }

    // Convert string to Date (start of day to prevent timezone issues)
    const recordDate = new Date(date);
    recordDate.setUTCHours(0, 0, 0, 0);

    const totalPay = Math.round((Number(baseWage) * Number(multiplier)) + Number(extraPay));

    // Get or create active payroll period for this worker
    let activePeriod = await prisma.workerPayrollPeriod.findFirst({
      where: { workerId: workerId, isClosed: false }
    });

    if (!activePeriod) {
      activePeriod = await prisma.workerPayrollPeriod.create({
        data: {
          workerId: workerId,
          startDate: new Date()
        }
      });
    }

    const periodId = activePeriod.id;

    const attendance = await prisma.workerAttendance.upsert({
      where: {
        workerId_date_payrollPeriodId: {
          workerId: workerId,
          date: recordDate,
          payrollPeriodId: periodId
        }
      },
      update: {
        status: status,
        baseWage: Number(baseWage),
        multiplier: Number(multiplier),
        extraPay: Number(extraPay),
        totalPay: totalPay,
        notes: notes || ""
      },
      create: {
        payrollPeriodId: periodId,
        workerId: workerId,
        date: recordDate,
        status: status,
        baseWage: Number(baseWage),
        multiplier: Number(multiplier),
        extraPay: Number(extraPay),
        totalPay: totalPay,
        notes: notes || ""
      }
    });

    return NextResponse.json(attendance);
  } catch (error) {
    console.error("Error saving worker attendance:", error);
    return NextResponse.json({ error: "Failed to save attendance" }, { status: 500 });
  }
}
