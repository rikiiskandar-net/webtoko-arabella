import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth";
import { encrypt } from "@/lib/encryption";

export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    const session = await getAuthSession();
    if (!session || session.role !== "superadmin") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { accounts } = await req.json();
    if (!accounts || !Array.isArray(accounts)) {
      return NextResponse.json({ error: "Invalid payload format" }, { status: 400 });
    }

    if (accounts.length > 100) {
      return NextResponse.json({ error: "Maksimal 100 akun dalam satu kali import untuk mencegah beban server (DoS)." }, { status: 413 });
    }

    // accounts format: [{ email, password, categoryName, notes }]
    let successCount = 0;
    
    // We process sequentially to ensure categories are handled correctly without race conditions
    for (const acc of accounts) {
      if (!acc.email || !acc.password || !acc.categoryName) continue;
      
      const catName = acc.categoryName.trim();
      
      // Find or create category (case-insensitive & trim spaces)
      let category = await prisma.accountCategory.findFirst({
        where: { 
          name: { equals: catName, mode: 'insensitive' } 
        }
      });
      
      if (!category) {
        category = await prisma.accountCategory.create({
          data: { name: catName, icon: "Folder" }
        });
      }
      
      const encryptedPassword = encrypt(acc.password);
      
      await prisma.accountCredential.create({
        data: {
          categoryId: category.id,
          title: acc.email, // Using email as title by default for bulk
          username: acc.email,
          password: encryptedPassword,
          description: acc.notes || "",
          url: ""
        }
      });
      
      successCount++;
    }

    return NextResponse.json({ success: true, count: successCount });
  } catch (error) {
    console.error("Error in bulk import credentials:", error);
    return NextResponse.json({ error: "Failed to process bulk import" }, { status: 500 });
  }
}
