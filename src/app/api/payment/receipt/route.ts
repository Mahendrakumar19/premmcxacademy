import { NextRequest, NextResponse } from 'next/server';

// In production, fetch this from database
// For now, we'll retrieve from Razorpay
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID!;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET!;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');
    const paymentId = searchParams.get('paymentId');

    if (!orderId || !paymentId) {
      return NextResponse.json(
        { error: 'Missing order or payment ID' },
        { status: 400 }
      );
    }

    // Fetch payment details from Razorpay
    const authHeader = Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString('base64');

    const paymentResponse = await fetch(`https://api.razorpay.com/v1/payments/${paymentId}`, {
      method: 'GET',
      headers: {
        Authorization: `Basic ${authHeader}`,
      },
    });

    if (!paymentResponse.ok) {
      throw new Error('Failed to fetch payment details from Razorpay');
    }

    const paymentData = await paymentResponse.json();

    // Fetch order details
    const orderResponse = await fetch(`https://api.razorpay.com/v1/orders/${orderId}`, {
      method: 'GET',
      headers: {
        Authorization: `Basic ${authHeader}`,
      },
    });

    if (!orderResponse.ok) {
      throw new Error('Failed to fetch order details from Razorpay');
    }

    const orderData = await orderResponse.json();

    // Extract course information from order notes
    const courseIds = orderData.notes?.courseIds
      ? orderData.notes.courseIds.split(',').map((id: string) => parseInt(id.trim()))
      : [];
    const userEmail = orderData.notes?.userEmail || '';
    const userName = orderData.notes?.userName || '';

    // For now, create mock course data
    // In production, fetch actual course details from database
    const courses = courseIds.map((id: number) => ({
      id,
      name: `Course ${id}`,
      price: Math.round(orderData.amount / 100 / courseIds.length),
    }));

    const subtotal = Math.round(orderData.amount / 100 / 1.18);
    const gst = Math.round(subtotal * 0.18);
    const total = Math.round(orderData.amount / 100);

    return NextResponse.json({
      orderId,
      paymentId,
      date: new Date(paymentData.created_at * 1000).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      subtotal,
      gst,
      total,
      courses,
      userEmail,
      userName,
      status: paymentData.status === 'captured' ? 'completed' : paymentData.status,
      razorpaySignature: paymentData.id,
    });
  } catch (error) {
    console.error('Receipt fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch receipt details' },
      { status: 500 }
    );
  }
}
