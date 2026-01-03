import { NextResponse } from 'next/server';

const MOODLE_URL = process.env.MOODLE_URL!;
const MOODLE_TOKEN = process.env.MOODLE_TOKEN!;

async function getRazorpayConfig(courseId: number) {
  // First, check if enrolment exists for this course
  const enrolParams = new URLSearchParams({
    wstoken: MOODLE_TOKEN,
    moodlewsrestformat: 'json',
    wsfunction: 'core_enrol_get_course_enrolment_methods',
    courseid: String(courseId),
  });

  const enrolRes = await fetch(
    `${MOODLE_URL}/webservice/rest/server.php`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: enrolParams,
    }
  );

  const enrolData = await enrolRes.json();
  
  // Check if fee-based enrolment exists
  const paymentEnrol = Array.isArray(enrolData) ? enrolData.find((e: any) => e.type === 'fee') : null;
  
  if (!paymentEnrol) {
    throw new Error('Payment enrolment not configured for this course');
  }

  // If payment enrolment exists, try to get Razorpay config
  const params = new URLSearchParams({
    wstoken: MOODLE_TOKEN,
    moodlewsrestformat: 'json',
    wsfunction: 'paygw_razorpay_get_config_for_js',
    courseid: String(courseId),
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
    throw new Error(data.message);
  }
  return data;
}

export async function POST(req: Request) {
  // Read the request body once
  const body = await req.json();
  const { courseId } = body;

  try {
    // Try HEADLESS (UI checkout)
    const razorpayConfig = await getRazorpayConfig(courseId);

    return NextResponse.json({
      mode: 'HEADLESS',
      razorpayConfig,
    });
  } catch (err) {
    // Ensure Moodle URL doesn't have trailing slash before adding path
    const moodleBaseUrl = (process.env.NEXT_PUBLIC_MOODLE_URL || process.env.MOODLE_URL)?.replace(/\/$/, '') || 'https://your-learning-platform.com';
    // Use the standard enrollment page as fallback since the direct payment gateway path failed
    const fallbackRedirectUrl = `${moodleBaseUrl}/enrol/index.php?id=${courseId}`;

    return NextResponse.json({
      mode: 'REDIRECT',
      redirectUrl: fallbackRedirectUrl,
      reason: (err as Error).message,
    });
  }
}