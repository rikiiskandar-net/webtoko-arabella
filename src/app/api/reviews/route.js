import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/userAuth';

export async function POST(request) {
  try {
    const session = await getUserFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { productId, rating, comment } = body;
    const userId = session.userId; // Use ID from verified session

    if (!productId || !rating || !comment) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const review = await prisma.productReview.create({
      data: {
        productId,
        userId,
        rating: parseInt(rating),
        comment,
      }
    });

    // Update the average rating on the Product
    const allReviews = await prisma.productReview.findMany({
      where: { productId },
      select: { rating: true }
    });

    const averageRating = allReviews.reduce((acc, curr) => acc + curr.rating, 0) / allReviews.length;

    await prisma.product.update({
      where: { id: productId },
      data: { rating: parseFloat(averageRating.toFixed(1)) }
    });

    return NextResponse.json({ success: true, review });
  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json({ error: 'Failed to submit review' }, { status: 500 });
  }
}
