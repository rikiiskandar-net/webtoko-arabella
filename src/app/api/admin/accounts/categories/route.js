import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export async function GET(req) {
  try {
    const session = await getAuthSession();
    if (!session || session.role !== "superadmin") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const categories = await prisma.accountCategory.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { accounts: true } }
      }
    });
    
    return NextResponse.json(categories);
  } catch (error) {
    console.error("Error fetching account categories:", error);
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const session = await getAuthSession();
    if (!session || session.role !== "superadmin") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { name, icon } = await req.json();
    if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });

    const existing = await prisma.accountCategory.findUnique({ where: { name } });
    if (existing) return NextResponse.json({ error: "Category name already exists" }, { status: 400 });

    const category = await prisma.accountCategory.create({
      data: { name, icon: icon || "Folder" }
    });

    return NextResponse.json(category);
  } catch (error) {
    console.error("Error creating account category:", error);
    return NextResponse.json({ error: "Failed to create category" }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const session = await getAuthSession();
    if (!session || session.role !== "superadmin") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id, name, icon } = await req.json();
    if (!id || !name) return NextResponse.json({ error: "ID and Name are required" }, { status: 400 });

    const category = await prisma.accountCategory.update({
      where: { id },
      data: { name, icon: icon || "Folder" }
    });

    return NextResponse.json(category);
  } catch (error) {
    console.error("Error updating account category:", error);
    return NextResponse.json({ error: "Failed to update category" }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const session = await getAuthSession();
    if (!session || session.role !== "superadmin") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    
    if (!id) return NextResponse.json({ error: "ID is required" }, { status: 400 });

    await prisma.accountCategory.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting account category:", error);
    return NextResponse.json({ error: "Failed to delete category" }, { status: 500 });
  }
}
