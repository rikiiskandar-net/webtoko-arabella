import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import prisma from "@/lib/prisma";

async function await getSession(request) {
  const token = request.cookies.get("auth_token")?.value;
  if (!token) return null;
  return await verifyToken(token);
}

export async function GET(request) {
  const session = await getSession(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const banners = await prisma.heroBanner.findMany({
      orderBy: { sortOrder: "asc" },
    });
    return NextResponse.json(banners);
  } catch (error) {
    console.error("Error fetching admin banners:", error);
    return NextResponse.json({ error: "Gagal mengambil banner" }, { status: 500 });
  }
}

export async function POST(request) {
  const session = await getSession(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await request.json();

    if (!data.image || !data.title) {
      return NextResponse.json({ error: "Image dan title wajib diisi" }, { status: 400 });
    }

    const banner = await prisma.heroBanner.create({ data });
    return NextResponse.json(banner, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Gagal membuat banner" }, { status: 500 });
  }
}
