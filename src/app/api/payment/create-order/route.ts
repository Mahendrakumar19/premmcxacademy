import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Razorpay from 'razorpay';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { courseIds, amount, currency = 'INR', userEmail, userName } = await request.json();

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400 }
      );
    }

    if (!userEmail) {
      return NextResponse.json(
        { error: 'User email is required' },
        { status: 400 }
      );
    }

    // Initialize Razorpay with credentials from environment
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });

    // Amount should be in paise for Razorpay
    const amountInPaise = Math.round(amount * 100);

    console.log('🔧 Creating Razorpay order...');
    console.log('📌 Course IDs:', courseIds);
    console.log('💰 Amount:', amount, currency);
    
    // Create Razorpay order
    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: currency,
      receipt: `receipt-${Date.now()}-${session.user.email}`,
      notes: {
        courseIds: courseIds.join(','),
        userEmail: userEmail,
        userName: userName,
        source: 'lms-nextjs',
      },
    });

    console.log('✅ Razorpay order created:', order.id);

    return NextResponse.json({
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt,
      status: order.status,
    });
  } catch (error: any) {
    console.error('❌ Order creation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create order' },
      { status: 500 }
    );
  }
}
