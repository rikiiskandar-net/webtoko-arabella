import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthSession as getAdminSession } from "@/lib/auth";

export async function DELETE(req, { params }) {
  try {
    const session = await getAdminSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id: attendanceId } = await params;

    const attendance = await prisma.workerAttendance.findUnique({
      where: { id: attendanceId },
      include: { payrollPeriod: true }
    });

    if (!attendance) {
      return NextResponse.json({ error: "Data absen tidak ditemukan" }, { status: 404 });
    }

    if (attendance.payrollPeriod.isClosed) {
      return NextResponse.json({ error: "Buku gaji sudah ditutup, absen tidak bisa dihapus." }, { status: 400 });
    }

    await prisma.workerAttendance.delete({
      where: { id: attendanceId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting worker attendance:", error);
    return NextResponse.json({ error: "Gagal menghapus absen" }, { status: 500 });
  }
}
