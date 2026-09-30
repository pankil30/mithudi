import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';
import Gifting from '@/views/Gifting';

export const metadata: Metadata = pageMetadata({
  title: 'Wedding & Bulk Gifting',
  description: 'Mukhvas wedding favours, Diwali hampers and corporate gift boxes with custom tags. Pan-India delivery from મીઠુડી મુખવાસ.',
  path: '/gifting',
});

export default function GiftingPage() {
  return <Gifting />;
}
