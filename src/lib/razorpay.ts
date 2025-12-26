// Razorpay payment integration for course enrollment

export interface RazorpayOrderOptions {
  amount: number; // in paise (₹1 = 100 paise)
  currency: string;
  receipt: string;
  notes?: {
    courseId: string;
    userId: string;
    courseName: string;
  };
}

export interface RazorpayPaymentOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill?: {
    name: string;
    email: string;
    contact: string;
  };
  notes?: {
    courseId: string;
    userId: string;
  };
  theme?: {
    color: string;
  };
  handler: (response: RazorpayResponse) => void;
  modal?: {
    ondismiss: () => void;
  };
}

export interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve(false);
      return;
    }

    // Check if already loaded
    if ((window as any).Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export const initiateRazorpayPayment = async (
  options: RazorpayPaymentOptions
): Promise<void> => {
  const scriptLoaded = await loadRazorpayScript();
  
  if (!scriptLoaded) {
    throw new Error('Razorpay SDK failed to load. Please check your internet connection.');
  }

  const razorpay = new (window as any).Razorpay(options);
  razorpay.open();
};
