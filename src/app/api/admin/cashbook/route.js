import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/admin/cashbook — list entries filtered by date or month
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date"); // e.g. "2026-07-06"
    const month = searchParams.get("month"); // e.g. "7"
    const year = searchParams.get("year"); // e.g. "2026"

    let where = {};

    if (date) {
      const d = new Date(date);
      const start = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      const end = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1);
      where.date = { gte: start, lt: end };
    } else if (month && year) {
      const m = parseInt(month) - 1;
      const y = parseInt(year);
      const start = new Date(y, m, 1);
      const end = new Date(y, m + 1, 1);
      where.date = { gte: start, lt: end };
    }

    const entries = await prisma.cashEntry.findMany({
      where,
      orderBy: { date: "desc" },
    });

    return NextResponse.json(entries);
  } catch (error) {
    console.error("GET /api/admin/cashbook error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// POST /api/admin/cashbook — create a new entry
export async function POST(request) {
  try {
    const body = await request.json();
    const { type, amount, description, date } = body;

    if (!type || !amount || !description) {
      return NextResponse.json({ error: "type, amount, description wajib diisi" }, { status: 400 });
    }

    const entry = await prisma.cashEntry.create({
      data: {
        type,
        amount: parseInt(amount),
        description,
        date: date ? new Date(date) : new Date(),
      },
    });

    return NextResponse.json(entry, { status: 201 });
  } catch (error) {
    console.error("POST /api/admin/cashbook error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
