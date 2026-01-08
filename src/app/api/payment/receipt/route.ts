import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const orderId = request.nextUrl.searchParams.get('orderId');
    const paymentId = request.nextUrl.searchParams.get('paymentId');

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    // In a real application, you would fetch this from your database
    // For now, we'll construct it from session data
    // This is a simplified version - you should store payment details in a database

    const receiptData = {
      orderId,
      paymentId: paymentId || 'FREE',
      date: new Date().toISOString(),
      status: 'completed',
      userId: session.user?.id,
      userName: session.user?.name,
      userEmail: session.user?.email,
      courses: [], // This should be fetched from your database
      totalAmount: 0,
      currency: 'INR',
      paymentMethod: paymentId ? 'Online' : 'Free Enrollment',
    };

    return NextResponse.json(receiptData);
  } catch (error) {
    console.error('Error fetching receipt:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payment receipt' },
      { status: 500 }
    );
  }
}
