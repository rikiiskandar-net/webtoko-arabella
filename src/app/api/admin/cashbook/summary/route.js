import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/admin/cashbook/summary?month=7&year=2026
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const month = parseInt(searchParams.get("month") || new Date().getMonth() + 1);
    const year = parseInt(searchParams.get("year") || new Date().getFullYear());

    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 1);

    const entries = await prisma.cashEntry.findMany({
      where: { date: { gte: start, lt: end } },
      orderBy: { date: "asc" },
    });

    // Group by day
    const dailySummary = {};
    let totalIncome = 0;
    let totalExpense = 0;

    entries.forEach((entry) => {
      const dayKey = new Date(entry.date).toISOString().split("T")[0];
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

    const days = Object.values(dailySummary).sort((a, b) => a.date.localeCompare(b.date));

    return NextResponse.json({
      month,
      year,
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
      days,
    });
  } catch (error) {
    console.error("GET /api/admin/cashbook/summary error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
