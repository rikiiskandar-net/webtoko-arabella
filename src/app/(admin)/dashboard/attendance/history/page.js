import { getAuthSession as getAdminSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import HistoryClient from "./HistoryClient";

export const metadata = {
  title: 'Riwayat Gaji - Admin Dapur Arabella',
};

export default async function HistoryPage() {
  const session = await getAdminSession();
  
  if (!session) {
    redirect("/login");
  }

  return <HistoryClient />;
}
