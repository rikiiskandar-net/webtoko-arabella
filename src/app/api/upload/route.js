import { NextResponse } from 'next/server';
import { uploadProductImage } from '@/lib/storage';
import { verifyToken } from "@/lib/auth";

function getSession(request) {
  const token = request.cookies.get("auth_token")?.value;
  if (!token) return null;
  return verifyToken(token);
}

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"];
const MAX_SIZE = 2 * 1024 * 1024; // 2MB

export async function POST(request) {
  const session = getSession(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await request.formData();
    const file = data.get('file');

    if (!file || typeof file !== 'object' || !('size' in file)) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({
        error: `Tipe file tidak didukung. Gunakan: ${ALLOWED_TYPES.map(t => t.replace('image/', '')).join(', ')}`
      }, { status: 400 });
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "Ukuran file maksimal 2MB" }, { status: 400 });
    }

    const url = await uploadProductImage(file);

    return NextResponse.json({ url });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Gagal mengunggah file" }, { status: 500 });
  }
}
