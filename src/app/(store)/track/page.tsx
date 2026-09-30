import type { Metadata } from 'next';
import { Suspense } from 'react';
import { pageMetadata } from '@/lib/seo';
import { TrackOrder } from '@/views/Order';

export const metadata: Metadata = pageMetadata({ title: 'Track your order', path: '/track' });

export default function TrackPage() {
  return (
    <Suspense>
      <TrackOrder />
    </Suspense>
  );
}
