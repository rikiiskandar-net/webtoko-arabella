import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth";
import { hashWorkerPassword } from "@/lib/workerAuth";

export async function GET(req) {
  try {
    const session = await getAuthSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const workers = await prisma.worker.findMany({
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(workers);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch workers" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const session = await getAuthSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const data = await req.json();
    if (!data.username || !data.password || !data.name) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const exists = await prisma.worker.findUnique({ where: { username: data.username } });
    if (exists) return NextResponse.json({ error: "Username sudah digunakan" }, { status: 400 });

    const hashedPassword = await hashWorkerPassword(data.password);

    const worker = await prisma.worker.create({
      data: {
        username: data.username,
        password: hashedPassword,
        name: data.name,
        role: data.role || "Pekerja",
        baseWage: data.baseWage || 100000,
        isActive: data.isActive !== undefined ? data.isActive : true
      }
    });

    return NextResponse.json(worker);
  } catch (error) {
    return NextResponse.json({ error: "Failed to create worker" }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const session = await getAuthSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const data = await req.json();
    if (!data.id) return NextResponse.json({ error: "ID missing" }, { status: 400 });

    const updateData = {
      username: data.username,
      name: data.name,
      role: data.role,
      baseWage: data.baseWage,
      isActive: data.isActive
    };

    if (data.password) {
      updateData.password = await hashWorkerPassword(data.password);
    }

    const worker = await prisma.worker.update({
      where: { id: data.id },
      data: updateData
    });

    return NextResponse.json(worker);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update worker" }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const session = await getAuthSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    
    if (!id) return NextResponse.json({ error: "ID missing" }, { status: 400 });

    await prisma.worker.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete worker" }, { status: 500 });
  }
}
