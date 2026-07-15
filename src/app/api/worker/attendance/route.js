import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getWorkerAuthSession } from "@/lib/workerAuth";

export async function POST(req) {
  try {
    const session = await getWorkerAuthSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { periodId, date, status, notes } = body;

    if (!periodId || !date || !status) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Get worker's current base wage
    const worker = await prisma.worker.findUnique({
      where: { id: session.id },
      select: { baseWage: true }
    });

    if (!worker) return NextResponse.json({ error: "Worker not found" }, { status: 404 });

    // Convert string to Date (start of day to prevent timezone issues)
    const recordDate = new Date(date);
    recordDate.setUTCHours(0, 0, 0, 0);

    // If they clock in (Hadir), they get their base wage. Otherwise 0.
    const multiplier = status === "Hadir" ? 1.0 : (status === "Setengah Hari" ? 0.5 : 0.0);
    const totalPay = Math.round(Number(worker.baseWage) * multiplier);

    const attendance = await prisma.workerAttendance.upsert({
      where: {
        workerId_date: {
          workerId: session.id,
          date: recordDate
        }
      },
      update: {
        status: status,
        baseWage: Number(worker.baseWage),
        multiplier: multiplier,
        extraPay: 0,
        totalPay: totalPay,
        notes: notes || ""
      },
      create: {
        payrollPeriodId: periodId,
        workerId: session.id,
        date: recordDate,
        status: status,
        baseWage: Number(worker.baseWage),
        multiplier: multiplier,
        extraPay: 0,
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

    const { searchParams } = new URL(req.url);
    const month = parseInt(searchParams.get('month') || String(new Date().getMonth()));
    const year = parseInt(searchParams.get('year') || String(new Date().getFullYear()));

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
    }

    // Get attendance for the requested month/year
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0);

    const attendances = await prisma.workerAttendance.findMany({
      where: {
        workerId: session.id,
        date: {
          gte: startDate,
          lte: endDate,
        }
      },
      orderBy: { date: 'asc' }
    });

    return NextResponse.json({
      activePeriod,
      attendances
    });
  } catch (error) {
    console.error("Error fetching worker attendance:", error);
    return NextResponse.json({ error: "Failed to fetch attendance" }, { status: 500 });
  }
}
