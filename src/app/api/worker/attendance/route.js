import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getWorkerAuthSession } from "@/lib/workerAuth";

export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    const session = await getWorkerAuthSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { periodId, date, status, notes, baseWage, multiplier, extraPay } = body;

    if (!periodId || !date || !status) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const worker = await prisma.worker.findUnique({
      where: { id: session.id },
      select: { baseWage: true }
    });

    if (!worker) return NextResponse.json({ error: "Worker not found" }, { status: 404 });

    // Convert string to Date (start of day to prevent timezone issues)
    const recordDate = new Date(date);
    recordDate.setUTCHours(0, 0, 0, 0);

    const calcBaseWage = baseWage !== undefined ? Number(baseWage) : Number(worker.baseWage);
    const calcMultiplier = multiplier !== undefined && multiplier !== null ? Number(multiplier) : (status === "Kerja Normal" || status === "Hadir" ? 1.0 : (status === "Kerja 1.5 Hari" ? 1.5 : (status === "Setengah Hari" ? 0.5 : (status === "Lembur Penuh" || status === "Kerja Lembur" ? 2.0 : 0.0))));
    const calcExtraPay = extraPay !== undefined ? Number(extraPay) : 0;
    
    const totalPay = Math.round(calcBaseWage * calcMultiplier) + calcExtraPay;

    const attendance = await prisma.workerAttendance.upsert({
      where: {
        workerId_date_payrollPeriodId: {
          workerId: session.id,
          date: recordDate,
          payrollPeriodId: periodId
        }
      },
      update: {
        status: status,
        baseWage: calcBaseWage,
        multiplier: calcMultiplier,
        extraPay: calcExtraPay,
        totalPay: totalPay,
        notes: notes || ""
      },
      create: {
        payrollPeriodId: periodId,
        workerId: session.id,
        date: recordDate,
        status: status,
        baseWage: calcBaseWage,
        multiplier: calcMultiplier,
        extraPay: calcExtraPay,
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

export async function GET(req) {
  try {
    const session = await getWorkerAuthSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Find active period for this worker
    let activePeriod = await prisma.workerPayrollPeriod.findFirst({
      where: { workerId: session.id, isClosed: false },
      orderBy: { createdAt: 'desc' }
    });

    if (!activePeriod) {
      // Auto-create a period if none exists
      activePeriod = await prisma.workerPayrollPeriod.create({
        data: {
          workerId: session.id,
          startDate: new Date(),
        }
      });

      // Race condition protection: clean up accidental duplicate active periods
      const allActive = await prisma.workerPayrollPeriod.findMany({
        where: { workerId: session.id, isClosed: false },
        orderBy: { createdAt: 'asc' }
      });

      if (allActive.length > 1) {
        const toDelete = allActive.slice(1).map(p => p.id);
        await prisma.workerPayrollPeriod.deleteMany({
          where: { id: { in: toDelete } }
        });
        activePeriod = allActive[0];
      }
    }

    // Get active attendances
    const activeAttendances = await prisma.workerAttendance.findMany({
      where: {
        payrollPeriodId: activePeriod.id,
        workerId: session.id
      },
      orderBy: { date: 'asc' }
    });

    // Get closed periods and their attendances
    const closedPeriods = await prisma.workerPayrollPeriod.findMany({
      where: { workerId: session.id, isClosed: true },
      orderBy: { endDate: 'desc' },
      include: {
        attendances: {
          orderBy: { date: 'asc' }
        }
      }
    });

    const worker = await prisma.worker.findUnique({
      where: { id: session.id },
      select: { baseWage: true }
    });

    return NextResponse.json({
      activePeriod,
      activeAttendances,
      closedPeriods,
      baseWage: worker?.baseWage || 0
    });
  } catch (error) {
    console.error("Error fetching worker attendance:", error);
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const session = await getWorkerAuthSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const attendanceId = searchParams.get('id');

    if (!attendanceId) {
      return NextResponse.json({ error: "Missing attendance ID" }, { status: 400 });
    }

    const attendance = await prisma.workerAttendance.findUnique({
      where: { id: attendanceId },
      include: { payrollPeriod: true }
    });

    if (!attendance) {
      return NextResponse.json({ error: "Attendance not found" }, { status: 404 });
    }

    if (attendance.workerId !== session.id) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
    }

    if (attendance.payrollPeriod.isClosed) {
      return NextResponse.json({ error: "Cannot delete attendance from a closed book" }, { status: 400 });
    }

    await prisma.workerAttendance.delete({
      where: { id: attendanceId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting attendance:", error);
    return NextResponse.json({ error: "Failed to delete attendance" }, { status: 500 });
  }
}
