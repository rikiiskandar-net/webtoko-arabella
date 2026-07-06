import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import prisma from "@/lib/prisma";

function getSession(request) {
  const token = request.cookies.get("auth_token")?.value;
  if (!token) return null;
  return verifyToken(token);
}

// PUT /api/products/[id]
export async function PUT(request, { params }) {
  const session = getSession(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { id } = await params;
    const data = await request.json();
    
    // Validate required fields if they are being updated
    const updateData = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.price !== undefined) updateData.price = parseInt(data.price);
    if (data.description !== undefined) updateData.description = data.description;
    if (data.image !== undefined) updateData.image = data.image;
    if (data.images !== undefined) updateData.images = data.images;
    if (data.variants !== undefined) updateData.variants = data.variants;
    if (data.isPromo !== undefined) updateData.isPromo = data.isPromo;
    if (data.isWebDiscountable !== undefined) updateData.isWebDiscountable = data.isWebDiscountable;
    updateData.promoPrice = null;
    if (data.originalPrice !== undefined) updateData.originalPrice = data.originalPrice ? parseInt(data.originalPrice) : null;
    if (data.badge !== undefined) updateData.badge = data.badge || null;
    if (data.rating !== undefined) updateData.rating = parseFloat(data.rating);
    if (data.sold !== undefined) updateData.sold = data.sold;
    if (data.categoryId !== undefined) updateData.categoryId = data.categoryId;

    const product = await prisma.product.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }
}

// DELETE /api/products/[id]
export async function DELETE(request, { params }) {
  const session = getSession(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    
    await prisma.product.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}
