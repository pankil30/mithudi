import type { Metadata } from 'next';
import { StoreLayout } from '@/components/layout/StoreLayout';
import { pageMetadata } from '@/lib/seo';
import NotFound from '@/views/NotFound';

export const metadata: Metadata = pageMetadata({ title: 'Page not found', noindex: true });

export default function NotFoundPage() {
  return (
    <StoreLayout>
      <NotFound />
    </StoreLayout>
  );
}
