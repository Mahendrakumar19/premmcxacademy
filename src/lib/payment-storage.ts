/**
 * Payment Storage System
 * Stores payment records locally (localStorage) or in database
 * Can be replaced with actual database later
 */

export interface PaymentRecord {
  orderId: string;
  paymentId: string;
  userEmail: string;
  courseIds: number[];
  amount: number;
  status: 'completed' | 'failed' | 'pending';
  timestamp: string;
}

// In-memory storage for server-side (for now)
// TODO: Replace with actual database (Prisma, MongoDB, etc.)
const paymentRecords: PaymentRecord[] = [];

/**
 * Store a payment record
 */
export function storePayment(payment: PaymentRecord): void {
  paymentRecords.push(payment);
  console.log('✅ Payment stored:', payment);
}

/**
 * Get all payments for a user
 */
export function getPaymentsByEmail(userEmail: string): PaymentRecord[] {
  return paymentRecords.filter(p => p.userEmail === userEmail && p.status === 'completed');
}

/**
 * Get all purchased course IDs for a user
 */
export function getPurchasedCourses(userEmail: string): number[] {
  const payments = getPaymentsByEmail(userEmail);
  const courseIds = new Set<number>();
  
  payments.forEach(payment => {
    payment.courseIds.forEach(courseId => courseIds.add(courseId));
  });
  
  return Array.from(courseIds);
}

/**
 * Check if user has purchased a course
 */
export function hasPurchasedCourse(userEmail: string, courseId: number): boolean {
  const purchasedCourses = getPurchasedCourses(userEmail);
  return purchasedCourses.includes(courseId);
}

/**
 * Get total spent by user
 */
export function getTotalSpentByUser(userEmail: string): number {
  const payments = getPaymentsByEmail(userEmail);
  return payments.reduce((total, payment) => total + payment.amount, 0);
}

/**
 * Get payment by order ID
 */
export function getPaymentByOrderId(orderId: string): PaymentRecord | undefined {
  return paymentRecords.find(p => p.orderId === orderId);
}

/**
 * Get payment by payment ID
 */
export function getPaymentByPaymentId(paymentId: string): PaymentRecord | undefined {
  return paymentRecords.find(p => p.paymentId === paymentId);
}

/**
 * Get all payments (admin only)
 */
export function getAllPayments(): PaymentRecord[] {
  return paymentRecords;
}

/**
 * Get payment stats
 */
export function getPaymentStats() {
  const totalPayments = paymentRecords.filter(p => p.status === 'completed').length;
  const totalRevenue = paymentRecords
    .filter(p => p.status === 'completed')
    .reduce((total, p) => total + p.amount, 0);
  const uniqueUsers = new Set(paymentRecords.map(p => p.userEmail)).size;
  
  return {
    totalPayments,
    totalRevenue,
    uniqueUsers,
    averageOrderValue: totalPayments > 0 ? totalRevenue / totalPayments : 0,
  };
}
