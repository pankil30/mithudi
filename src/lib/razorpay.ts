import type { PaymentParams } from './types';

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open(): void; on(event: string, cb: (r: any) => void): void };
  }
}

let loader: Promise<void> | null = null;

function loadCheckout() {
  if (window.Razorpay) return Promise.resolve();
  loader ??= new Promise<void>((resolve, reject) => {
    const s = document.createElement('script');
    s.src = 'https://checkout.razorpay.com/v1/checkout.js';
    s.onload = () => resolve();
    s.onerror = () => {
      loader = null;
      reject(new Error('Could not load Razorpay. Check your connection and try again.'));
    };
    document.body.appendChild(s);
  });
  return loader;
}

export interface RazorpaySuccess {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

/** Opens Razorpay Checkout. Resolves on success, resolves `null` if the customer closes it, rejects on failure. */
export async function openRazorpay(p: PaymentParams, orderNumber: string): Promise<RazorpaySuccess | null> {
  await loadCheckout();
  return new Promise((resolve, reject) => {
    const rzp = new window.Razorpay!({
      key: p.keyId,
      amount: p.amount,
      currency: p.currency,
      order_id: p.razorpayOrderId,
      name: 'મીઠુડી મુખવાસ',
      description: `Order ${orderNumber}`,
      prefill: { name: p.name, email: p.email, contact: p.phone },
      notes: { orderNumber },
      theme: { color: '#5C2C2C' },
      handler: (r: RazorpaySuccess) => resolve(r),
      modal: { ondismiss: () => resolve(null), confirm_close: true },
    });
    rzp.on('payment.failed', (r: any) => reject(new Error(r?.error?.description || 'Payment failed. Please try again.')));
    rzp.open();
  });
}
