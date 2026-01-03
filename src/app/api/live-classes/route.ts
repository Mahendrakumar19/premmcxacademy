import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

interface LiveClass {
  id: string;
  title: string;
  topic: string;
  instructor: string;
  instructorImage?: string;
  startTime: string;
  endTime: string;
  zoomMeetingUrl: string;
  zoomMeetingId: string;
  status: 'upcoming' | 'live' | 'completed';
  description: string;
  maxParticipants?: number;
  currentParticipants?: number;
  courseId?: number;
  recordingUrl?: string;
}

/**
 * GET /api/live-classes
 * Fetch all live classes or filter by status
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get query parameters
    const status = request.nextUrl.searchParams.get('status');
    const courseId = request.nextUrl.searchParams.get('courseId');

    // TODO: Replace with actual database query
    // For now, return mock data
    const liveClasses = getMockLiveClasses();

    // Filter by status if provided
    let filtered = liveClasses;
    if (status) {
      filtered = liveClasses.filter(cls => cls.status === status);
    }

    // Filter by courseId if provided
    if (courseId) {
      filtered = filtered.filter(cls => cls.courseId === parseInt(courseId));
    }

    return NextResponse.json(filtered);
  } catch (error) {
    console.error('Error fetching live classes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch live classes' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/live-classes
 * Create a new live class (admin only)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Validate required fields
    const { title, topic, instructor, startTime, endTime, zoomMeetingUrl, zoomMeetingId, description } = body;

    if (!title || !topic || !instructor || !startTime || !endTime || !zoomMeetingUrl || !zoomMeetingId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // TODO: Save to database
    // For now, return mock response
    const newClass: LiveClass = {
      id: String(Date.now()),
      title,
      topic,
      instructor,
      startTime,
      endTime,
      zoomMeetingUrl,
      zoomMeetingId,
      status: 'upcoming',
      description,
      maxParticipants: body.maxParticipants || 200,
      currentParticipants: 0,
      courseId: body.courseId
    };

    return NextResponse.json(newClass, { status: 201 });
  } catch (error) {
    console.error('Error creating live class:', error);
    return NextResponse.json(
      { error: 'Failed to create live class' },
      { status: 500 }
    );
  }
}

function getMockLiveClasses(): LiveClass[] {
  const now = new Date();
  const upcoming = new Date(now.getTime() + 2 * 60 * 60 * 1000);
  const completed = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const live = new Date(now.getTime() - 30 * 60 * 1000);

  return [
    {
      id: '1',
      title: 'Crude Oil Trading Fundamentals',
      topic: 'Understanding crude oil price movements and technical analysis',
      instructor: 'Raj Kumar',
      instructorImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=raj',
      startTime: upcoming.toISOString(),
      endTime: new Date(upcoming.getTime() + 90 * 60 * 1000).toISOString(),
      zoomMeetingUrl: 'https://zoom.us/j/123456789',
      zoomMeetingId: '123456789',
      status: 'upcoming',
      description: 'Learn advanced techniques for trading crude oil with live market analysis and real-time trading examples.',
      maxParticipants: 200,
      currentParticipants: 142,
      courseId: 1
    },
    {
      id: '2',
      title: 'Natural Gas Price Action Strategy',
      topic: 'Price action trading in natural gas futures',
      instructor: 'Priya Sharma',
      instructorImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=priya',
      startTime: live.toISOString(),
      endTime: new Date(live.getTime() + 120 * 60 * 1000).toISOString(),
      zoomMeetingUrl: 'https://zoom.us/j/987654321',
      zoomMeetingId: '987654321',
      status: 'live',
      description: 'Join us for a live trading session where we analyze natural gas price movements and execute trades in real-time.',
      maxParticipants: 150,
      currentParticipants: 128,
      courseId: 2
    },
    {
      id: '3',
      title: 'Gold Trading Masterclass',
      topic: 'Advanced gold trading strategies',
      instructor: 'Amit Patel',
      instructorImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=amit',
      startTime: completed.toISOString(),
      endTime: new Date(completed.getTime() + 120 * 60 * 1000).toISOString(),
      zoomMeetingUrl: 'https://zoom.us/j/456789123',
      zoomMeetingId: '456789123',
      status: 'completed',
      description: 'Learn professional strategies for trading gold and managing risk in commodity markets.',
      maxParticipants: 100,
      currentParticipants: 87,
      recordingUrl: 'https://example.com/recordings/gold-trading-masterclass'
    }
  ];
}
