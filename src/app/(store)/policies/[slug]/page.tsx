import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { pageMetadata } from '@/lib/seo';
import { POLICIES } from '@/data/policies';
import Policies from '@/views/Policies';

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return Object.keys(POLICIES).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const policy = POLICIES[slug];
  return policy ? pageMetadata({ title: policy.title, path: `/policies/${slug}` }) : {};
}

export default async function PolicyPage({ params }: Props) {
  const { slug } = await params;
  if (!POLICIES[slug]) notFound();
  return <Policies slug={slug} />;
}
