import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { callMoodleAPI } from '@/lib/moodle-api';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { courseIds, amount, currency, userId } = await request.json();

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400 }
      );
    }

    const paymentToken = process.env.MOODLE_PAYMENT_TOKEN;

    console.log('🔧 Fetching Razorpay config from Moodle...');
    console.log('📌 Course IDs:', courseIds);
    console.log('💰 Amount:', amount, currency);
    
    // Get Razorpay configuration from Moodle ONLY - no fallback to env
    const razorpayConfig = await callMoodleAPI(
      'paygw_razorpay_get_config_for_js',
      {
        component: 'enrol_fee',
        paymentarea: 'fee',
        itemid: courseIds[0]
      },
      paymentToken
    );

    console.log('📦 Razorpay config response:', razorpayConfig);

    // Check if response has error
    if (razorpayConfig?.exception || razorpayConfig?.errorcode) {
      console.error('❌ Moodle Razorpay not configured:', razorpayConfig.message);
      
      // If payment gateway is not configured, return a flag to use direct enrollment
      // This allows the frontend to handle the situation gracefully
      return NextResponse.json({
        orderId: `direct-${Date.now()}-${userId}`,
        amount: amount,
        currency: currency || 'INR',
        razorpayKeyId: null, // No key available
        directEnrollment: true, // Flag to indicate direct enrollment should be used
        message: 'Payment gateway not configured in Moodle. Will use direct enrollment.'
      });
    }

    if (!razorpayConfig || !razorpayConfig.apikey) {
      console.error('❌ Razorpay API key missing in Moodle config');
      return NextResponse.json(
        { error: 'Razorpay API key not found. Please check Moodle payment gateway settings.' },
        { status: 500 }
      );
    }

    // Create Razorpay order using Moodle's configuration
    const orderData = {
      amount: amount,
      currency: currency || 'INR',
      receipt: `order_${Date.now()}_${userId}`,
      notes: {
        courseIds: courseIds.join(','),
        userId: userId,
        source: 'lms-nextjs',
      },
    };

    const authHeader = Buffer.from(`${razorpayConfig.apikey}:${razorpayConfig.apisecret}`).toString('base64');

    console.log('📝 Creating Razorpay order...');
    const response = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${authHeader}`,
      },
      body: JSON.stringify(orderData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ Razorpay order creation failed:', errorData);
      throw new Error(errorData.error?.description || 'Failed to create Razorpay order');
    }

    const order = await response.json();
    console.log('✅ Razorpay order created:', order.id);

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      razorpayKeyId: razorpayConfig.apikey,
    });
  } catch (error: any) {
    console.error('❌ Order creation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create order' },
      { status: 500 }
    );
  }
}
