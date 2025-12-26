import { NextRequest, NextResponse } from 'next/server';
import { enrollUserInCourse } from '@/lib/moodle-api';

export async function POST(request: NextRequest) {
  try {
    const { courseId, userId } = await request.json();

    if (!courseId || !userId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Enroll user in the course
    await enrollUserInCourse(userId, courseId, 5); // 5 = student role

    // Log enrollment (in a real app, save to database)
    console.log('Free course enrollment:', {
      userId,
      courseId,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      courseId,
    });
  } catch (error) {
    console.error('Enrollment error:', error);
    return NextResponse.json(
      { success: false, error: 'Enrollment failed' },
      { status: 500 }
    );
  }
}
