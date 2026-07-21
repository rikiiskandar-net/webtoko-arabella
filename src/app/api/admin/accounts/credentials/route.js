import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth";
import { encrypt, decrypt } from "@/lib/encryption";

export const dynamic = 'force-dynamic';

export async function GET(req) {
  try {
    const session = await getAuthSession();
    if (!session || session.role !== "superadmin") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get("categoryId");

    let whereClause = {};
    if (categoryId) {
      whereClause.categoryId = categoryId;
    }

    const credentials = await prisma.accountCredential.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      include: {
        category: { select: { name: true, icon: true } }
      }
    });

    // DO NOT decrypt passwords here for Zero-Trust architecture.
    // The password field is removed entirely from the list.
    const safeCredentials = credentials.map(cred => {
      const { password, ...rest } = cred;
      return rest;
    });
    
    return NextResponse.json(safeCredentials);
  } catch (error) {
    console.error("Error fetching account credentials:", error);
    return NextResponse.json({ error: "Failed to fetch credentials" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const session = await getAuthSession();
    if (!session || session.role !== "superadmin") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { categoryId, title, username, password, url, description } = await req.json();
    if (!categoryId || !title || !username || !password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (title.length > 255 || username.length > 255 || (url && url.length > 1000) || (description && description.length > 2000)) {
      return NextResponse.json({ error: "Input melebihi batas maksimal karakter." }, { status: 400 });
    }

    // Encrypt password before saving
    const encryptedPassword = encrypt(password);

    const credential = await prisma.accountCredential.create({
      data: {
        categoryId,
        title,
        username,
        password: encryptedPassword,
        url: url || "",
        description: description || ""
      }
    });

    // Don't send back password on POST response
    const { password: _, ...safeCredential } = credential;
    return NextResponse.json(safeCredential);
  } catch (error) {
    console.error("Error creating account credential:", error);
    if (error.message && error.message.includes("ENCRYPTION_KEY")) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create credential" }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const session = await getAuthSession();
    if (!session || session.role !== "superadmin") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id, categoryId, title, username, password, url, description } = await req.json();
    if (!id || !categoryId || !title || !username) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (title.length > 255 || username.length > 255 || (url && url.length > 1000) || (description && description.length > 2000)) {
      return NextResponse.json({ error: "Input melebihi batas maksimal karakter." }, { status: 400 });
    }

    let updateData = {
      categoryId,
      title,
      username,
      url: url || "",
      description: description || ""
    };

    // Only update password if a new one is provided
    if (password && password.trim() !== "") {
      updateData.password = encrypt(password);
    }

    const credential = await prisma.accountCredential.update({
      where: { id },
      data: updateData
    });

    const { password: _, ...safeCredential } = credential;
    return NextResponse.json(safeCredential);
  } catch (error) {
    console.error("Error updating account credential:", error);
    if (error.message && error.message.includes("ENCRYPTION_KEY")) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to update credential" }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const session = await getAuthSession();
    if (!session || session.role !== "superadmin") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    
    if (!id) return NextResponse.json({ error: "ID is required" }, { status: 400 });

    await prisma.accountCredential.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting account credential:", error);
    return NextResponse.json({ error: "Failed to delete credential" }, { status: 500 });
  }
}
