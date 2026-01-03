import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getUserCourses } from '@/lib/moodle-api';

interface SessionUser {
  id: string;
  token: string;
  name?: string;
  email?: string;
}

interface Session {
  user?: SessionUser;
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions as any) as Session | null;
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = parseInt(session.user.id);
    const token = session.user.token;

    // Fetch enrolled courses from Moodle in real-time
    const courses = await getUserCourses(userId, token);

    // Map to a simple payments-like structure if possible
    const payments = (courses || []).map((c: any) => ({
      id: `course_${c.id}`,
      courseId: c.id,
      courseName: c.fullname,
      amount: c.cost ? parseFloat(c.cost) : 0,
      status: c.cost && parseFloat(c.cost) > 0 ? 'completed' : 'free',
      timestamp: Date.now() / 1000
    }));

    return NextResponse.json({ payments });
  } catch (error) {
    console.error('Error fetching payment history:', error);
    return NextResponse.json({ error: 'Failed to fetch payment history' }, { status: 500 });
  }
}
