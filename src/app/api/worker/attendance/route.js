import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getWorkerAuthSession } from "@/lib/workerAuth";

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
    const calcMultiplier = multiplier !== undefined ? Number(multiplier) : (status === "Kerja Normal" || status === "Hadir" ? 1.0 : (status === "Setengah Hari" ? 0.5 : (status === "Lembur Penuh" ? 2.0 : 0.0)));
    const calcExtraPay = extraPay !== undefined ? Number(extraPay) : 0;
    
    const totalPay = Math.round(calcBaseWage * calcMultiplier) + calcExtraPay;

    const attendance = await prisma.workerAttendance.upsert({
      where: {
        workerId_date: {
          workerId: session.id,
          date: recordDate
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

    const worker = await prisma.worker.findUnique({
      where: { id: session.id },
      select: { baseWage: true }
    });

    return NextResponse.json({
      activePeriod,
      attendances,
      baseWage: worker?.baseWage || 0
    });
  } catch (error) {
    console.error("Error fetching worker attendance:", error);
    return NextResponse.json({ error: "Failed to fetch attendance" }, { status: 500 });
  }
}
