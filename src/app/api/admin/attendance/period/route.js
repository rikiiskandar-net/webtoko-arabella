import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthSession as getAdminSession } from "@/lib/auth";

// GET active period for the admin
export async function GET(req) {
  try {
    const session = await getAdminSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    let activePeriod = await prisma.payrollPeriod.findFirst({
      where: { adminId: session.id, isClosed: false },
      include: {
        attendances: {
          orderBy: { date: 'desc' }
        }
      }
    });

    if (!activePeriod) {
      // Auto create a new one
      activePeriod = await prisma.payrollPeriod.create({
        data: {
          adminId: session.id,
          startDate: new Date(),
        },
        include: {
          attendances: true
        }
      });
    }

    // Also get the admin's base wage
    const admin = await prisma.admin.findUnique({
      where: { id: session.id },
      select: { baseWage: true }
    });

    return NextResponse.json({
      period: activePeriod,
      baseWage: admin?.baseWage || 120000
    });
  } catch (error) {
    console.error("Error fetching payroll period:", error);
    return NextResponse.json({ error: "Failed to fetch period" }, { status: 500 });
  }
}
