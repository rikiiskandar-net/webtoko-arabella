import { NextResponse } from "next/server";
import { verifyToken, hashPassword } from "@/lib/auth";
import prisma from "@/lib/prisma";

async function await getSession(request) {
  const token = request.cookies.get("auth_token")?.value;
  if (!token) return null;
  return await verifyToken(token);
}

function isSuperAdmin(session) {
  return session && session.role === "superadmin";
}

export async function GET(request) {
  const session = await getSession(request);
  if (!isSuperAdmin(session)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const admins = await prisma.admin.findMany({
    select: { id: true, username: true, name: true, role: true, isActive: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(admins);
}

export async function POST(request) {
  const session = await getSession(request);
  if (!isSuperAdmin(session)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { username, password, name, role } = await request.json();

    if (!username || !password || !name) {
      return NextResponse.json({ error: "Username, password, dan nama wajib diisi" }, { status: 400 });
    }

    const existing = await prisma.admin.findUnique({ where: { username } });
    if (existing) {
      return NextResponse.json({ error: "Username sudah digunakan" }, { status: 409 });
    }

    const admin = await prisma.admin.create({
      data: {
        username,
        password: await hashPassword(password),
        name,
        role: role === "superadmin" ? "superadmin" : "admin",
      },
      select: { id: true, username: true, name: true, role: true, isActive: true, createdAt: true },
    });

    return NextResponse.json(admin, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Gagal membuat admin" }, { status: 500 });
  }
}
