import type { MetadataRoute } from 'next';
import { categories } from '@/data/catalog';
import { getProductIds } from '@/lib/server-data';
import { posts } from '@/data/journal';
import { siteUrl } from '@/lib/seo';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const productIds = await getProductIds();
  const paths = [
    '/',
    '/shop',
    '/gifting',
    '/about',
    '/contact',
    '/journal',
    '/track',
    ...categories.map((c) => `/shop?category=${c.slug}`),
    ...productIds.map((id) => `/product/${id}`),
    ...posts.map((p) => `/journal/${p.slug}`),
    '/policies/shipping',
    '/policies/privacy',
    '/policies/terms',
  ];
  return paths.map((p) => ({ url: `${siteUrl}${p}` }));
}
