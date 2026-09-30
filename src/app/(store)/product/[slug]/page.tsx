import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { JsonLd } from '@/components/seo/JsonLd';
import { pageMetadata, siteUrl } from '@/lib/seo';
import { getProduct } from '@/lib/server-data';
import Product from '@/views/Product';

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (product === undefined) return pageMetadata({ title: 'Mukhvas', path: `/product/${slug}` });
  if (!product) return pageMetadata({ title: 'Page not found', noindex: true });
  return pageMetadata({
    title: product.name,
    description: `${product.tagline} ${product.description}`.slice(0, 158),
    path: `/product/${product.slug}`,
    image: product.images[0],
  });
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (product === null) notFound();
  // API unreachable from the server — the client page still loads the product.
  if (!product) return <Product slug={slug} />;
  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: product.name,
          description: product.description,
          image: product.images.length ? product.images : undefined,
          brand: { '@type': 'Brand', name: 'મીઠુડી મુખવાસ' },
          aggregateRating: { '@type': 'AggregateRating', ratingValue: product.rating, reviewCount: product.reviewCount },
          offers: product.variants.map((v) => ({
            '@type': 'Offer',
            sku: v.sku,
            name: v.label,
            price: v.price,
            priceCurrency: 'INR',
            availability: v.inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
            url: `${siteUrl}/product/${product.slug}`,
          })),
        }}
      />
      <Product slug={slug} />
    </>
  );
}
