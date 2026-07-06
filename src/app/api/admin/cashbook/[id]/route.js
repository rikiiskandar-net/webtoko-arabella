import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// PUT /api/admin/cashbook/[id] — update entry
export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { type, amount, description, date } = body;

    const data = {};
    if (type) data.type = type;
    if (amount) data.amount = parseInt(amount);
    if (description !== undefined) data.description = description;
    if (date) data.date = new Date(date);

    const entry = await prisma.cashEntry.update({
      where: { id },
      data,
    });

    return NextResponse.json(entry);
  } catch (error) {
    console.error("PUT /api/admin/cashbook/[id] error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// DELETE /api/admin/cashbook/[id] — delete entry
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    await prisma.cashEntry.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/admin/cashbook/[id] error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
