import { NextResponse } from 'next/server';

const MOODLE_URL = process.env.MOODLE_URL!;
const MOODLE_TOKEN = process.env.MOODLE_TOKEN!;

export async function POST(req: Request) {
  try {
    const {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
    } = await req.json();

    const params = new URLSearchParams({
      wstoken: MOODLE_TOKEN,
      moodlewsrestformat: 'json',
      wsfunction: 'paygw_razorpay_create_transaction_complete',
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
    });

    const res = await fetch(
      `${MOODLE_URL}/webservice/rest/server.php`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params,
      }
    );

    const data = await res.json();
    if (data.exception) {
      return NextResponse.json({ error: data.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Payment confirmation error:', error);
    return NextResponse.json({ error: 'Payment confirmation failed' }, { status: 500 });
  }
}