// Payment Service for handling various payment scenarios
import { useRouter } from 'next/navigation';
import { getServerSession } from 'next-auth';

// Define payment options interface
interface PaymentOptions {
  courseId: number;
  userId?: number;
  returnUrl?: string;
  paymentMethod?: 'direct' | 'checkout' | 'cart';
  amount?: number;
  currency?: string;
}

// Define payment result interface
interface PaymentResult {
  success: boolean;
  paymentId?: string;
  orderId?: string;
  message?: string;
  redirectUrl?: string;
  mode?: 'HEADLESS' | 'REDIRECT';
}

// Payment service class
class PaymentService {
  private backendUrl: string;
  private returnUrl: string;

  constructor() {
    // Ensure backend URL doesn't have trailing slash
    const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 
                   process.env.NEXT_PUBLIC_MOODLE_URL || 
                   'https://your-learning-platform.com';
    this.backendUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    
    this.returnUrl = typeof window !== 'undefined' 
      ? `${window.location.origin}/api/payment-callback` 
      : '';
  }

  // Direct payment method - tries headless first, falls back to redirect
  async processDirectPayment(options: PaymentOptions): Promise<PaymentResult> {
    try {
      // Verify user session
      const session = await this.getUserSession();
      if (!session?.user) {
        // Redirect to login page if user is not authenticated
        if (typeof window !== 'undefined') {
          window.location.href = `/auth/login?callbackUrl=/cart`;
        }
        
        return {
          success: false,
          message: 'User not authenticated'
        };
      }

      // Try headless checkout first
      try {
        const response = await fetch('/api/payment/start', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            courseId: options.courseId,
            amount: options.amount,
            currency: options.currency
          }),
        });

        const data = await response.json();

        if (data.mode === 'HEADLESS' && data.razorpayConfig) {
          // Open Razorpay in headless mode
          if (typeof window !== 'undefined') {
            this.openRazorpay(data.razorpayConfig, options.courseId);
          }
          
          return {
            success: true,
            mode: 'HEADLESS',
            message: 'Opening Razorpay checkout...'
          };
        } else if (data.mode === 'REDIRECT' && data.redirectUrl) {
          // Fallback to redirect
          if (typeof window !== 'undefined') {
            window.location.href = data.redirectUrl;
          }
          
          return {
            success: true,
            mode: 'REDIRECT',
            redirectUrl: data.redirectUrl,
            message: 'Redirecting to payment gateway...'
          };
        } else {
          throw new Error('Invalid payment response from server');
        }
      } catch (headlessError) {
        console.error('Headless payment failed, falling back to redirect:', headlessError);
        
        // Fallback to redirect if headless fails
        const userToken = (session.user as any)?.token;
        if (!userToken) {
          // Redirect to login if token is not available
          if (typeof window !== 'undefined') {
            window.location.href = `/auth/login?callbackUrl=/cart`;
          }
          
          return {
            success: false,
            message: 'User token not available'
          };
        }

        // Build payment URL with authentication
        const returnUrlWithCourse = `${this.returnUrl}?courseId=${options.courseId}`;
        const paymentUrl = `${this.backendUrl}/login/tokenlogin.php?token=${userToken}&redirect=/enrol/index.php?id=${options.courseId}`;
        
        // Redirect to payment gateway
        if (typeof window !== 'undefined') {
          window.location.href = paymentUrl;
        }

        return {
          success: true,
          mode: 'REDIRECT',
          redirectUrl: paymentUrl,
          message: 'Redirecting to payment gateway...'
        };
      }
    } catch (error) {
      console.error('Direct payment error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Payment processing failed'
      };
    }
  }

  // Open Razorpay in headless mode
  private openRazorpay(config: any, courseId: number) {
    const options = {
      key: config.key_id,
      amount: config.amount,
      currency: config.currency,
      name: 'PremMCX Training Academy',
      order_id: config.order_id,
      handler: async (response: any) => {
        try {
          // Confirm payment with backend
          const confirmRes = await fetch('/api/payment/confirm', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(response),
          });

          if (confirmRes.ok) {
            // Payment confirmed, redirect to success page
            window.location.href = '/my-courses';
          } else {
            const errorData = await confirmRes.json();
            alert('Payment confirmation failed: ' + errorData.error);
          }
        } catch (error) {
          console.error('Payment confirmation error:', error);
          alert('Payment confirmation failed. Please contact support.');
        }
      },
    };

    if (typeof window !== 'undefined' && window.Razorpay) {
      const rzp = new window.Razorpay(options);
      rzp.open();
    } else {
      console.error('Razorpay SDK not loaded');
      alert('Payment system not ready. Please try again later.');
    }
  }

  // Process payment through checkout flow
  async processCheckoutPayment(courseIds: number[]): Promise<PaymentResult> {
    try {
      // Verify user session
      const session = await this.getUserSession();
      if (!session?.user) {
        throw new Error('User not authenticated');
      }

      // Redirect to checkout page
      if (typeof window !== 'undefined') {
        window.location.href = `/checkout`;
      }

      return {
        success: true,
        redirectUrl: '/checkout',
        message: 'Redirecting to checkout...'
      };
    } catch (error) {
      console.error('Checkout payment error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Checkout processing failed'
      };
    }
  }

  // Process payment through cart
  async processCartPayment(): Promise<PaymentResult> {
    try {
      // Verify user session
      const session = await this.getUserSession();
      if (!session?.user) {
        throw new Error('User not authenticated');
      }

      // Redirect to cart page
      if (typeof window !== 'undefined') {
        window.location.href = `/cart`;
      }

      return {
        success: true,
        redirectUrl: '/cart',
        message: 'Redirecting to cart...'
      };
    } catch (error) {
      console.error('Cart payment error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Cart processing failed'
      };
    }
  }

  // Get user session from client-side
  private async getUserSession(): Promise<any> {
    if (typeof window === 'undefined') {
      return null;
    }

    try {
      const response = await fetch('/api/auth/session');
      return await response.json();
    } catch (error) {
      console.error('Error fetching session:', error);
      return null;
    }
  }

  // Verify payment status
  async verifyPayment(paymentId: string): Promise<PaymentResult> {
    try {
      const response = await fetch(`/api/payment/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ paymentId }),
      });

      const result = await response.json();

      return {
        success: result.success,
        message: result.message,
        ...result
      };
    } catch (error) {
      console.error('Payment verification error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Payment verification failed'
      };
    }
  }

  // Create payment order
  async createPaymentOrder(options: PaymentOptions): Promise<PaymentResult> {
    try {
      const response = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          courseIds: [options.courseId],
          amount: options.amount,
          currency: options.currency || 'INR',
          userId: options.userId,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create payment order');
      }

      return {
        success: true,
        orderId: result.orderId,
        paymentId: result.paymentId,
        message: 'Payment order created successfully',
        ...result
      };
    } catch (error) {
      console.error('Payment order creation error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Payment order creation failed'
      };
    }
  }
}

// Create singleton instance
const paymentService = new PaymentService();

// Export the service instance and types
export { paymentService, PaymentService, type PaymentOptions, type PaymentResult };