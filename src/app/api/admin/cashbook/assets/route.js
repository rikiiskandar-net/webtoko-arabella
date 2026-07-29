import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthSession as getAdminSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const assets = await prisma.familyAsset.findMany({
      orderBy: { createdAt: "desc" },
    });

    // Compute Category & Net Worth Summaries
    let totalEmasRp = 0;
    let totalEmasGram = 0;
    let totalSapiRp = 0;
    let totalSapiEkor = 0;
    let totalTabungan = 0;
    let totalHutang = 0;
    let totalPiutang = 0;

    assets.forEach((item) => {
      const cat = (item.category || "").toUpperCase();
      const val = (Number(item.amount) || 0) * (Number(item.quantity) || 1);

      if (cat === "EMAS") {
        totalEmasRp += val;
        totalEmasGram += Number(item.quantity) || 0;
      } else if (cat === "SAPI") {
        totalSapiRp += val;
        totalSapiEkor += Number(item.quantity) || 0;
      } else if (cat === "TABUNGAN") {
        totalTabungan += val;
      } else if (cat === "HUTANG") {
        totalHutang += val;
      } else if (cat === "PIUTANG") {
        totalPiutang += val;
      }
    });

    const netWorth = (totalEmasRp + totalSapiRp + totalTabungan + totalPiutang) - totalHutang;

    return NextResponse.json({
      assets,
      summary: {
        totalEmasRp,
        totalEmasGram,
        totalSapiRp,
        totalSapiEkor,
        totalTabungan,
        totalHutang,
        totalPiutang,
        netWorth,
      },
    });
  } catch (error) {
    console.error("Error fetching family assets:", error);
    return NextResponse.json({ error: "Gagal mengambil data aset keluarga" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { category, name, quantity, unit, amount, notes } = body;

    if (!category || !name || amount === undefined || amount === null) {
      return NextResponse.json({ error: "Kategori, Nama Item, dan Nominal Wajib diisi" }, { status: 400 });
    }

    const validCategories = ["EMAS", "SAPI", "TABUNGAN", "HUTANG", "PIUTANG"];
    const normalizedCategory = category.toUpperCase();
    if (!validCategories.includes(normalizedCategory)) {
      return NextResponse.json({ error: "Kategori aset tidak valid" }, { status: 400 });
    }

    const newAsset = await prisma.familyAsset.create({
      data: {
        category: normalizedCategory,
        name: name.trim(),
        quantity: quantity !== undefined && quantity !== null ? Number(quantity) : 1.0,
        unit: unit ? unit.trim() : (normalizedCategory === "EMAS" ? "gram" : normalizedCategory === "SAPI" ? "ekor" : "unit"),
        amount: Math.round(Number(amount)),
        notes: notes ? notes.trim() : "",
      },
    });

    return NextResponse.json(newAsset);
  } catch (error) {
    console.error("Error creating family asset:", error);
    return NextResponse.json({ error: "Gagal menambahkan data aset" }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { id, category, name, quantity, unit, amount, notes } = body;

    if (!id || !name || amount === undefined || amount === null) {
      return NextResponse.json({ error: "ID, Nama Item, dan Nominal Wajib diisi" }, { status: 400 });
    }

    const updated = await prisma.familyAsset.update({
      where: { id },
      data: {
        category: category ? category.toUpperCase() : undefined,
        name: name.trim(),
        quantity: quantity !== undefined && quantity !== null ? Number(quantity) : 1.0,
        unit: unit ? unit.trim() : "unit",
        amount: Math.round(Number(amount)),
        notes: notes ? notes.trim() : "",
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating family asset:", error);
    return NextResponse.json({ error: "Gagal memperbarui data aset" }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID Aset required" }, { status: 400 });
    }

    await prisma.familyAsset.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting family asset:", error);
    return NextResponse.json({ error: "Gagal menghapus data aset" }, { status: 500 });
  }
}
