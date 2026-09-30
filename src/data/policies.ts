import { SUPPORT_EMAIL } from '@/lib/contact';

/** Starter policy copy — have it reviewed before launch. */
export const POLICIES: Record<string, { title: string; sections: [string, string][] }> = {
  shipping: {
    title: 'Shipping & Returns',
    sections: [
      ['Dispatch', 'Orders are packed and dispatched within 24–48 hours on working days. Wedding and custom orders follow the timeline agreed in your quote.'],
      ['Shipping charges', 'Shipping is free on orders above ₹499. A flat ₹49 applies to smaller orders anywhere in India.'],
      ['Delivery time', 'Metro cities usually receive orders in 2–4 working days; other locations in 4–7 working days.'],
      ['Damaged or incorrect items', `Glass occasionally breaks in transit. Share an unboxing photo on WhatsApp or at ${SUPPORT_EMAIL} within 48 hours of delivery and we will replace it free of charge.`],
      ['Returns', 'As mukhvas is a food product, we cannot accept returns of opened jars. Unopened items may be returned within 7 days of delivery for a refund.'],
      ['Refunds', 'Approved refunds are issued to the original payment method within 5–7 working days. COD refunds are made by bank transfer.'],
    ],
  },
  privacy: {
    title: 'Privacy Policy',
    sections: [
      ['What we collect', 'Your name, contact details and delivery address to fulfil orders, plus basic analytics about how the site is used.'],
      ['Payments', 'Online payments are processed by Razorpay. We never see or store your card, UPI or banking credentials.'],
      ['How we use it', 'To deliver orders, send order updates, respond to enquiries and — only if you subscribe — share occasional newsletters.'],
      ['Sharing', 'We share delivery details only with our courier partners. We never sell your data.'],
      ['Your choices', `You can update your details from your account, unsubscribe from emails at any time, or ask us to delete your data by writing to ${SUPPORT_EMAIL}.`],
    ],
  },
  terms: {
    title: 'Terms of Service',
    sections: [
      ['Products', 'Our mukhvas is handmade in small batches; colour and texture may vary slightly between batches. Ingredients are listed on every product page — please check for allergens.'],
      ['Pricing', 'All prices are in Indian Rupees and inclusive of GST. We reserve the right to correct pricing errors and cancel affected orders with a full refund.'],
      ['Orders', 'An order is confirmed once payment succeeds (or, for Cash on Delivery, once placed). We may cancel orders we cannot fulfil, with a full refund.'],
      ['Coupons', 'Coupons cannot be combined, have no cash value and may be withdrawn at any time.'],
      ['Contact', `Questions about these terms? Write to ${SUPPORT_EMAIL}.`],
    ],
  },
};
