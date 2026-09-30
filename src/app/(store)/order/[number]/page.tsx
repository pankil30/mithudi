import type { Metadata } from 'next';
import { Suspense } from 'react';
import { pageMetadata } from '@/lib/seo';
import { OrderConfirmation } from '@/views/Order';

export const metadata: Metadata = pageMetadata({ title: 'Thank you', noindex: true });

export default async function OrderPage({ params }: { params: Promise<{ number: string }> }) {
  const { number } = await params;
  return (
    <Suspense>
      <OrderConfirmation number={decodeURIComponent(number)} />
    </Suspense>
  );
}
