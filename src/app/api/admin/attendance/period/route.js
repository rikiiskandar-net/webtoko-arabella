import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthSession as getAdminSession } from "@/lib/auth";

// GET active periods for all workers and the worker list
export async function GET(req) {
  try {
    const session = await getAdminSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Fetch all active workers
    const workers = await prisma.worker.findMany({
      where: { isActive: true },
      select: { id: true, name: true, baseWage: true, role: true }
    });

    // Fetch all active worker payroll periods with their attendances
    const activePeriods = await prisma.workerPayrollPeriod.findMany({
      where: { isClosed: false },
      include: {
        worker: {
          select: { name: true, role: true }
        },
        attendances: {
          orderBy: { date: 'desc' }
        }
      }
    });

    // We can flat-map attendances for easy display
    let allAttendances = [];
    activePeriods.forEach(period => {
      period.attendances.forEach(att => {
        allAttendances.push({
          ...att,
          workerName: period.worker.name,
          workerRole: period.worker.role
        });
      });
    });

    // Sort all attendances by date descending
    allAttendances.sort((a, b) => new Date(b.date) - new Date(a.date));

    return NextResponse.json({
      workers,
      activePeriods,
      attendances: allAttendances
    });
  } catch (error) {
    console.error("Error fetching worker payroll periods:", error);
    return NextResponse.json({ error: "Failed to fetch periods" }, { status: 500 });
  }
}
