import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const body = await request.json();
    const { productId, userId, rating, comment } = body;

    if (!productId || !userId || !rating || !comment) {
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
