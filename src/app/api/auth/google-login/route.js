import { NextResponse } from "next/server";
import { OAuth2Client } from "google-auth-library";
import { signToken, seedFirstAdmin } from "@/lib/auth";
import prisma from "@/lib/prisma";

const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
const client = new OAuth2Client(clientId);
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;

export async function POST(request) {
  try {
    const { credential } = await request.json();

    if (!credential) {
      return NextResponse.json({ error: "Token Google tidak ditemukan" }, { status: 400 });
    }

    if (!clientId || !ADMIN_EMAIL) {
      return NextResponse.json({ error: "Sistem Google Login belum dikonfigurasi (Hubungi Developer)" }, { status: 500 });
    }

    // Verifikasi token Google
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: clientId,
    });
    const payload = ticket.getPayload();
    
    if (!payload || !payload.email) {
      return NextResponse.json({ error: "Autentikasi gagal" }, { status: 401 });
    }

    // Cek apakah email sesuai dengan ADMIN_EMAIL
    if (payload.email !== ADMIN_EMAIL) {
      return NextResponse.json({ error: `Maaf, email ${payload.email} tidak memiliki akses Admin.` }, { status: 403 });
    }

    // Pastikan akun superadmin pertama sudah ada
    await seedFirstAdmin();

    // Dapatkan data admin utama untuk session kita
    const admin = await prisma.admin.findFirst({
      where: { role: "superadmin" }
    });

    if (!admin) {
      return NextResponse.json({ error: "Data admin tidak ditemukan di database" }, { status: 500 });
    }
    
    if (!admin.isActive) {
      return NextResponse.json({ error: "Akun admin ini telah dinonaktifkan" }, { status: 403 });
    }

    // Buat JWT token kustom kita sendiri (seamless authentication)
    const token = signToken({
      id: admin.id,
      username: admin.username,
      name: payload.name || admin.name,
      role: admin.role,
    });

    const response = NextResponse.json({ success: true, user: { name: payload.name || admin.name, role: admin.role } });
    
    // Setel cookie seperti manual login
    response.cookies.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24,
    });
    
    return response;
  } catch (error) {
    console.error("Google login error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan sistem saat memproses login Google" }, { status: 500 });
  }
}
