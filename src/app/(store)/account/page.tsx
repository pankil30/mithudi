import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/Skeleton';
import { pageMetadata } from '@/lib/seo';
import Account from '@/views/Account';

export const metadata: Metadata = pageMetadata({ title: 'My account', path: '/account', noindex: true });

export default function AccountPage() {
  return (
    <Suspense fallback={<div className="container-x py-16"><Skeleton className="h-96" /></div>}>
      <Account />
    </Suspense>
  );
}
