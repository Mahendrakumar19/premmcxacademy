import { NextRequest, NextResponse } from 'next/server';
import { getPurchasedCourses } from '@/lib/payment-storage';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userEmail = searchParams.get('email');
    const courseId = searchParams.get('courseId');

    if (!userEmail) {
      return NextResponse.json(
        { error: 'User email is required' },
        { status: 400 }
      );
    }

    const purchasedCourses = getPurchasedCourses(userEmail);

    if (courseId) {
      // Check if specific course is purchased
      const isPurchased = purchasedCourses.includes(parseInt(courseId));
      return NextResponse.json({
        courseId: parseInt(courseId),
        isPurchased,
      });
    }

    // Return all purchased courses for user
    return NextResponse.json({
      userEmail,
      purchasedCourses,
      count: purchasedCourses.length,
    });
  } catch (error) {
    console.error('Error checking purchased courses:', error);
    return NextResponse.json(
      { error: 'Failed to check purchased courses' },
      { status: 500 }
    );
  }
}
