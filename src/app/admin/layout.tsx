import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { pageMetadata } from '@/lib/seo';
import AdminLayout from '@/views/admin/AdminLayout';

export const metadata: Metadata = pageMetadata({ title: 'Admin', noindex: true });

export default function AdminRootLayout({ children }: { children: ReactNode }) {
  return <AdminLayout>{children}</AdminLayout>;
}
