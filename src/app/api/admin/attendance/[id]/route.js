import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthSession as getAdminSession } from "@/lib/auth";

export async function DELETE(req, { params }) {
  try {
    const session = await getAdminSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const attendanceId = params.id;

    const attendance = await prisma.attendance.findUnique({
      where: { id: attendanceId },
      include: { payrollPeriod: true }
    });

    if (!attendance) {
      return NextResponse.json({ error: "Data absen tidak ditemukan" }, { status: 404 });
    }

    if (attendance.adminId !== session.id) {
      return NextResponse.json({ error: "Bukan milik Anda" }, { status: 403 });
    }

    if (attendance.payrollPeriod.isClosed) {
      return NextResponse.json({ error: "Buku gaji sudah ditutup, absen tidak bisa dihapus." }, { status: 400 });
    }

    await prisma.attendance.delete({
      where: { id: attendanceId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting attendance:", error);
    return NextResponse.json({ error: "Gagal menghapus absen" }, { status: 500 });
  }
}
