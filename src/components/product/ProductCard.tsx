'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ShoppingBag } from 'lucide-react';
import { toast } from 'sonner';
import { ProductMedia } from '@/components/art/ProductMedia';
import { Price } from '@/components/ui/Price';
import { Stars } from '@/components/ui/Stars';
import { cn } from '@/lib/format';
import type { Product } from '@/lib/types';
import { useCart } from '@/store/cart';
import { WishlistButton } from './WishlistButton';

export function ProductCard({ product, priority }: { product: Product; priority?: boolean }) {
  const firstInStock = product.variants.find((v) => v.inStock) ?? product.variants[0];
  const [sku, setSku] = useState(firstInStock?.sku);
  const variant = product.variants.find((v) => v.sku === sku) ?? firstInStock;
  const add = useCart((s) => s.add);
  if (!variant) return null;

  const badge = !variant.inStock ? 'Sold out' : product.isBestSeller ? 'Bestseller' : product.isNew ? 'New' : null;

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="group flex flex-col"
    >
      <Link href={`/product/${product.slug}`} className="relative block overflow-hidden rounded-[28px] bg-sand shadow-soft ring-1 ring-line/60">
        <div className="aspect-[4/5] transition-transform duration-[900ms] ease-out group-hover:scale-[1.05]">
          <ProductMedia product={product} width={600} priority={priority} />
        </div>
        {product.images[1] && (
          <div className="absolute inset-0 opacity-0 transition-opacity duration-700 group-hover:opacity-100">
            <ProductMedia product={product} index={1} width={600} />
          </div>
        )}
        {badge && (
          <span
            className={cn(
              'absolute top-4 left-4 rounded-full px-3 py-1 text-[10px] font-medium tracking-[0.16em] uppercase backdrop-blur',
              badge === 'Sold out' ? 'bg-ink/70 text-cream' : badge === 'New' ? 'bg-leaf/90 text-white' : 'bg-cream/90 text-maroon',
            )}
          >
            {badge}
          </span>
        )}
        <WishlistButton slug={product.slug} name={product.name} className="absolute top-3.5 right-3.5" />
      </Link>

      <div className="flex flex-1 flex-col px-1 pt-4">
        <div className="flex items-center gap-2 text-xs text-muted">
          <Stars value={product.rating} size={12} />
          <span>({product.reviewCount})</span>
        </div>
        <Link href={`/product/${product.slug}`} className="mt-1.5">
          <h3 className="font-serif text-[22px] leading-tight font-medium text-maroon transition group-hover:text-saffron-deep">{product.name}</h3>
        </Link>
        <p className="mt-1 line-clamp-1 text-[13px] text-muted">{product.tagline}</p>

        {product.variants.length > 1 && (
          <div className="mt-3 flex flex-wrap gap-1.5" role="radiogroup" aria-label="Size">
            {product.variants.map((v) => (
              <button
                key={v.sku}
                type="button"
                role="radio"
                aria-checked={v.sku === variant.sku}
                onClick={() => setSku(v.sku)}
                className={cn(
                  'rounded-full border px-2.5 py-1 text-[11px] transition',
                  v.sku === variant.sku ? 'border-maroon bg-maroon text-cream' : 'border-line text-muted hover:border-maroon/40',
                  !v.inStock && 'line-through opacity-50',
                )}
              >
                {v.label}
              </button>
            ))}
          </div>
        )}

        <div className="mt-auto flex items-center justify-between gap-3 pt-4">
          <Price price={variant.price} mrp={variant.mrp} />
          <button
            type="button"
            disabled={!variant.inStock}
            onClick={() => {
              add(product, variant);
              toast.success(`${product.name} (${variant.label}) added to your bag`);
            }}
            className="inline-flex h-10 items-center gap-2 rounded-full bg-maroon px-4 text-[13px] font-medium text-cream shadow-soft transition hover:bg-maroon-deep hover:shadow-lift active:scale-95 disabled:bg-muted/40"
          >
            <ShoppingBag className="h-4 w-4" />
            {variant.inStock ? 'Add to Cart' : 'Sold out'}
          </button>
        </div>
      </div>
    </motion.article>
  );
}

export function ProductCardSkeleton() {
  return (
    <div>
      <div className="aspect-[4/5] animate-pulse rounded-[28px] bg-sand/70" />
      <div className="mt-4 h-4 w-24 animate-pulse rounded bg-sand/70" />
      <div className="mt-2 h-6 w-40 animate-pulse rounded bg-sand/70" />
      <div className="mt-5 h-10 animate-pulse rounded-full bg-sand/70" />
    </div>
  );
}
