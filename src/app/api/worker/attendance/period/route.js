import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getWorkerAuthSession } from "@/lib/workerAuth";

export async function DELETE(req) {
  try {
    const session = await getWorkerAuthSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const periodId = searchParams.get('id');

    if (!periodId) {
      return NextResponse.json({ error: "Missing periodId" }, { status: 400 });
    }

    // Verify ownership and closed status
    const period = await prisma.workerPayrollPeriod.findUnique({
      where: { id: periodId }
    });

    if (!period) {
      return NextResponse.json({ error: "Period not found" }, { status: 404 });
    }

    if (period.workerId !== session.id) {
      return NextResponse.json({ error: "Unauthorized access to period" }, { status: 403 });
    }

    if (!period.isClosed) {
      return NextResponse.json({ error: "Cannot delete an active book" }, { status: 400 });
    }

    // Delete the period. Cascading delete will handle associated attendances.
    await prisma.workerPayrollPeriod.delete({
      where: { id: periodId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting worker payroll period:", error);
    return NextResponse.json({ error: "Failed to delete period" }, { status: 500 });
  }
}
