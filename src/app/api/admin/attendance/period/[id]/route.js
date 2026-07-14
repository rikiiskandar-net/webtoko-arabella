import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthSession as getAdminSession } from "@/lib/auth";

export async function DELETE(req, { params }) {
  try {
    const session = await getAdminSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id: periodId } = await params;

    const period = await prisma.payrollPeriod.findUnique({
      where: { id: periodId }
    });

    if (!period) {
      return NextResponse.json({ error: "Buku gaji tidak ditemukan" }, { status: 404 });
    }

    if (period.adminId !== session.id) {
      return NextResponse.json({ error: "Bukan milik Anda" }, { status: 403 });
    }

    // Delete attendances first to avoid foreign key constraint errors
    await prisma.attendance.deleteMany({
      where: { payrollPeriodId: periodId }
    });

    await prisma.payrollPeriod.delete({
      where: { id: periodId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting history period:", error);
    return NextResponse.json({ error: "Gagal menghapus riwayat gaji" }, { status: 500 });
  }
}
