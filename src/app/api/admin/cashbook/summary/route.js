import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthSession as getAdminSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

// GET /api/admin/cashbook/summary?month=7&year=2026
export async function GET(request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const month = parseInt(searchParams.get("month") || new Date().getMonth() + 1);
    const year = parseInt(searchParams.get("year") || new Date().getFullYear());

    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 1);

    const entries = await prisma.cashEntry.findMany({
      where: { date: { gte: start, lt: end } },
      orderBy: { date: "asc" },
    });

    // Group by day using local WIB date YYYY-MM-DD to avoid UTC shift
    const dailySummary = {};
    let totalIncome = 0;
    let totalExpense = 0;

    entries.forEach((entry) => {
      const d = new Date(entry.date);
      const yearStr = d.getFullYear();
      const monthStr = String(d.getMonth() + 1).padStart(2, "0");
      const dateStr = String(d.getDate()).padStart(2, "0");
      const dayKey = `${yearStr}-${monthStr}-${dateStr}`;

      if (!dailySummary[dayKey]) {
        dailySummary[dayKey] = { date: dayKey, income: 0, expense: 0 };
      }
      if (entry.type === "income") {
        dailySummary[dayKey].income += entry.amount;
        totalIncome += entry.amount;
      } else {
        dailySummary[dayKey].expense += entry.amount;
        totalExpense += entry.amount;
      }
    });

    const days = Object.values(dailySummary)
      .map((day) => ({
        ...day,
        net: day.income - day.expense,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    const netBalance = totalIncome - totalExpense;

    return NextResponse.json({
      month,
      year,
      totalIncome,
      totalExpense,
      netBalance,
      balance: netBalance,
      days,
    });
  } catch (error) {
    console.error("GET /api/admin/cashbook/summary error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
