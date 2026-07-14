import { getAuthSession as getAdminSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import AttendanceClient from "./AttendanceClient";

export const metadata = {
  title: 'Absensi & Gaji - Admin Dapur Arabella',
};

export default async function AttendancePage() {
  const session = await getAdminSession();
  
  if (!session) {
    redirect("/login");
  }

  return (
    <AttendanceClient adminId={session.id} adminName={session.name} />
  );
}
