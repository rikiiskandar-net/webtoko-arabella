import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getWorkerAuthSession } from "@/lib/workerAuth";

export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    const session = await getWorkerAuthSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { periodId, date, amount, reason } = body;

    if (!periodId || !amount || Number(amount) <= 0) {
      return NextResponse.json({ error: "Nominal kasbon harus lebih dari 0" }, { status: 400 });
    }

    // Determine date (default to today if omitted)
    const recordDate = date ? new Date(date) : new Date();
    recordDate.setUTCHours(0, 0, 0, 0);

    const cashbon = await prisma.workerCashbon.create({
      data: {
        payrollPeriodId: periodId,
        workerId: session.id,
        date: recordDate,
        amount: Math.round(Number(amount)),
        reason: reason || ""
      }
    });

    return NextResponse.json(cashbon);
  } catch (error) {
    console.error("Error creating worker cashbon:", error);
    return NextResponse.json({ error: "Gagal menyimpan kasbon" }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const session = await getWorkerAuthSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const cashbonId = searchParams.get('id');

    if (!cashbonId) {
      return NextResponse.json({ error: "ID Kasbon missing" }, { status: 400 });
    }

    const cashbon = await prisma.workerCashbon.findUnique({
      where: { id: cashbonId },
      include: { payrollPeriod: true }
    });

    if (!cashbon || cashbon.workerId !== session.id) {
      return NextResponse.json({ error: "Kasbon tidak ditemukan" }, { status: 404 });
    }

    if (cashbon.payrollPeriod.isClosed) {
      return NextResponse.json({ error: "Kasbon pada periode yang sudah ditutup tidak dapat dihapus" }, { status: 400 });
    }

    await prisma.workerCashbon.delete({
      where: { id: cashbonId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting worker cashbon:", error);
    return NextResponse.json({ error: "Gagal menghapus kasbon" }, { status: 500 });
  }
}
