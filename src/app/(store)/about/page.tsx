import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';
import About from '@/views/About';

export const metadata: Metadata = pageMetadata({
  title: 'Our Story',
  description: 'The story of મીઠુડી મુખવાસ — a Gujarati family’s homemade mukhvas recipes, slow-made in small batches and packed in beautiful glass jars.',
  path: '/about',
});

export default function AboutPage() {
  return <About />;
}
