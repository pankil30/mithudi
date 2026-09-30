import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/Skeleton';
import { categories } from '@/data/catalog';
import { pageMetadata } from '@/lib/seo';
import Shop from '@/views/Shop';

type Props = { searchParams: Promise<{ category?: string }> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { category: slug } = await searchParams;
  const category = categories.find((c) => c.slug === slug);
  return pageMetadata({
    title: category ? `${category.name} Mukhvas` : 'Shop All Mukhvas',
    description: category?.blurb ?? 'Shop handcrafted Gujarati mukhvas — digestive blends, sweet paan mixes, kids’ favourites and gift boxes in glass jars.',
    path: `/shop${category ? `?category=${category.slug}` : ''}`,
  });
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="container-x py-16"><Skeleton className="h-96" /></div>}>
      <Shop />
    </Suspense>
  );
}
