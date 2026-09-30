import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';
import { JournalIndex } from '@/views/Journal';

export const metadata: Metadata = pageMetadata({
  title: 'Journal',
  description: 'Mukhvas tips, after-meal rituals and gifting guides from the મીઠુડી મુખવાસ kitchen.',
  path: '/journal',
});

export default function JournalPage() {
  return <JournalIndex />;
}
