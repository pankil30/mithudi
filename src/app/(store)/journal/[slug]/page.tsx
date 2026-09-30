import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { JsonLd } from '@/components/seo/JsonLd';
import { posts } from '@/data/journal';
import { pageMetadata, siteUrl } from '@/lib/seo';
import { JournalPost } from '@/views/Journal';

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = posts.find((p) => p.slug === slug);
  if (!post) return {};
  return pageMetadata({ title: post.title, description: post.excerpt, path: `/journal/${post.slug}` });
}

export default async function JournalPostPage({ params }: Props) {
  const { slug } = await params;
  const post = posts.find((p) => p.slug === slug);
  if (!post) notFound();
  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'BlogPosting',
          headline: post.title,
          datePublished: post.date,
          description: post.excerpt,
          publisher: { '@type': 'Organization', name: 'મીઠુડી મુખવાસ' },
          mainEntityOfPage: `${siteUrl}/journal/${post.slug}`,
        }}
      />
      <JournalPost slug={slug} />
    </>
  );
}
