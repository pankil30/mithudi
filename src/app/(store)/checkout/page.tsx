import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';
import Checkout from '@/views/Checkout';

export const metadata: Metadata = pageMetadata({ title: 'Checkout', noindex: true });

export default function CheckoutPage() {
  return <Checkout />;
}
