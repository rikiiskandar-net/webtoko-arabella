import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthSession as getAdminSession } from "@/lib/auth";

export async function POST(req) {
  try {
    const session = await getAdminSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { periodId, date, status, baseWage, multiplier, extraPay, notes } = body;

    if (!periodId || !date || !status) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Convert string to Date (start of day to prevent timezone issues)
    const recordDate = new Date(date);
    recordDate.setUTCHours(0, 0, 0, 0);

    const totalPay = Math.round((Number(baseWage) * Number(multiplier)) + Number(extraPay));

    const attendance = await prisma.attendance.upsert({
      where: {
        adminId_date: {
          adminId: session.id,
          date: recordDate
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
        adminId: session.id,
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
    console.error("Error saving attendance:", error);
    return NextResponse.json({ error: "Failed to save attendance" }, { status: 500 });
  }
}
