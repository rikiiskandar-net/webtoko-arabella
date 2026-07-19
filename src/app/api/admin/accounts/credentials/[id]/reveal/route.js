import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth";
import { decrypt } from "@/lib/encryption";

export const dynamic = 'force-dynamic';

export async function GET(req, { params }) {
  try {
    const session = await getAuthSession();
    if (!session || session.role !== "superadmin") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    if (!id) return NextResponse.json({ error: "ID is required" }, { status: 400 });

    const credential = await prisma.accountCredential.findUnique({
      where: { id }
    });

    if (!credential) {
      return NextResponse.json({ error: "Credential not found" }, { status: 404 });
    }

    const decryptedPassword = decrypt(credential.password);
    
    return NextResponse.json({ password: decryptedPassword });
  } catch (error) {
    console.error("Error revealing password:", error);
    return NextResponse.json({ error: "Failed to reveal password" }, { status: 500 });
  }
}
