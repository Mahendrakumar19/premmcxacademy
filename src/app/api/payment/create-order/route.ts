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

    // Validate environment variables
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      console.error('❌ Missing Razorpay credentials in environment variables');
      return NextResponse.json(
        { error: 'Payment gateway is not configured. Please contact support.' },
        { status: 500 }
      );
    }

    const { courseIds, amount, currency = 'INR', userEmail, userName } = await request.json();

    if (!courseIds || !Array.isArray(courseIds) || courseIds.length === 0) {
      return NextResponse.json(
        { error: 'At least one course must be selected' },
        { status: 400 }
      );
    }

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
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    // Amount should be in paise for Razorpay
    const amountInPaise = Math.round(amount * 100);

    if (amountInPaise < 1) {
      return NextResponse.json(
        { error: 'Amount must be at least ₹0.01' },
        { status: 400 }
      );
    }

    console.log('🔧 Creating Razorpay order...');
    console.log('📌 Course IDs:', courseIds);
    console.log('💰 Amount:', amount, currency);
    console.log('👤 Email:', userEmail);
    
    // Create Razorpay order
    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: currency,
      receipt: `receipt-${Date.now()}-${session.user.email}`,
      notes: {
        courseIds: courseIds.join(','),
        userEmail: userEmail,
        userName: userName || 'Unknown',
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
    console.error('❌ Order creation error:', {
      message: error.message,
      code: error.code,
      statusCode: error.statusCode,
      description: error.description,
      details: error.details,
    });
    
    let userMessage = 'Failed to create order';
    
    if (error.message?.includes('Unauthorized')) {
      userMessage = 'Invalid payment gateway credentials';
    } else if (error.message?.includes('timeout') || error.message?.includes('ECONNREFUSED')) {
      userMessage = 'Payment gateway is temporarily unavailable. Please try again.';
    } else if (error.statusCode === 400) {
      userMessage = error.description || 'Invalid payment details provided';
    }
    
    return NextResponse.json(
      { error: userMessage },
      { status: 500 }
    );
  }
}
