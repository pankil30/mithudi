import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';
import Contact from '@/views/Contact';

export const metadata: Metadata = pageMetadata({
  title: 'Contact Us',
  description: 'Questions about an order, bulk gifting or wedding favours? Reach મીઠુડી મુખવાસ on WhatsApp, email or our contact form.',
  path: '/contact',
});

export default function ContactPage() {
  return <Contact />;
}
