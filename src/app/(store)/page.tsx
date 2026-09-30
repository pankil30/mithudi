import type { Metadata } from 'next';
import { JsonLd } from '@/components/seo/JsonLd';
import { pageMetadata, siteUrl } from '@/lib/seo';
import Home from '@/views/Home';

export const metadata: Metadata = pageMetadata({
  description:
    'Small-batch, supari-free Gujarati mukhvas in beautiful glass jars. Digestive blends, sweet paan mixes and luxury gift boxes — Sweet Moments. Fresh Breath.',
  path: '/',
});

export default function HomePage() {
  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: 'મીઠુડી મુખવાસ',
          url: siteUrl,
          logo: `${siteUrl}/favicon.svg`,
          sameAs: ['https://instagram.com'],
        }}
      />
      <Home />
    </>
  );
}
