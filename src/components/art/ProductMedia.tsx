'use client';

import type { Product } from '@/lib/types';
import { cn } from '@/lib/format';
import { ProductScene } from './Scene';

/** Adds Cloudinary delivery transforms (auto format/quality, width) to an upload URL. */
export function cloudinary(url: string, width: number) {
  return url.includes('res.cloudinary.com') && url.includes('/upload/')
    ? url.replace('/upload/', `/upload/f_auto,q_auto,c_limit,w_${width}/`)
    : url;
}

/**
 * Product photography when uploaded; otherwise the illustrated jar scene.
 * `index` picks which uploaded image to show (the gallery uses it).
 */
export function ProductMedia({
  product,
  index = 0,
  className,
  width = 800,
  priority,
}: {
  product: Pick<Product, 'slug' | 'name' | 'art' | 'images'>;
  index?: number;
  className?: string;
  width?: number;
  priority?: boolean;
}) {
  const src = product.images[index];
  if (src) {
    return (
      <img
        src={cloudinary(src, width)}
        srcSet={`${cloudinary(src, Math.round(width / 2))} ${Math.round(width / 2)}w, ${cloudinary(src, width)} ${width}w, ${cloudinary(src, width * 2)} ${width * 2}w`}
        sizes={`(max-width: 640px) 100vw, ${width}px`}
        alt={product.name}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        className={cn('h-full w-full object-cover', className)}
      />
    );
  }
  return <ProductScene art={product.art} name={product.name} seed={`${product.slug}#${index}`} className={cn('h-full w-full', className)} />;
}
