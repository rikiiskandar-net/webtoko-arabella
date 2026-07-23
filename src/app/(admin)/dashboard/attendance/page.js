import { getAuthSession as getAdminSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import AttendanceClient from "./AttendanceClient";

export const metadata = {
  title: 'ABSENKU - Absen Online By Riki Iskandar',
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
