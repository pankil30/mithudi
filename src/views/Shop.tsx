'use client';

import { useMemo, useState } from 'react';
import { useSearchParamsState } from '@/hooks/useSearchParamsState';
import { AnimatePresence, motion } from 'framer-motion';
import { SlidersHorizontal, X } from 'lucide-react';
import { ProductCard, ProductCardSkeleton } from '@/components/product/ProductCard';
import { Button } from '@/components/ui/Button';
import { Ornament } from '@/components/ui/SectionHeading';
import { cn } from '@/lib/format';
import { useCategories, useProducts } from '@/lib/queries';
import type { ProductFilters } from '@/lib/types';

const PRICE_RANGES = [
  { id: 'u150', label: 'Under ₹150', min: undefined, max: 149 },
  { id: '150-300', label: '₹150 – ₹300', min: 150, max: 300 },
  { id: '300-600', label: '₹300 – ₹600', min: 301, max: 600 },
  { id: 'o600', label: 'Above ₹600', min: 601, max: undefined },
] as const;

const WEIGHTS = [100, 150, 200, 250, 300, 400];

const SORTS = [
  { id: 'featured', label: 'Featured' },
  { id: 'rating', label: 'Top rated' },
  { id: 'new', label: 'New arrivals' },
  { id: 'price-asc', label: 'Price: low to high' },
  { id: 'price-desc', label: 'Price: high to low' },
] as const;

function Filters({ params, set }: { params: URLSearchParams; set: (k: string, v: string | null) => void }) {
  const { data: categories = [] } = useCategories();
  const category = params.get('category');
  const price = params.get('price');
  const weights = params.get('weights')?.split(',').filter(Boolean) ?? [];
  const opt = 'flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm transition';
  return (
    <div className="space-y-8">
      <div>
        <p className="eyebrow">Category</p>
        <ul className="mt-3 space-y-0.5">
          <li>
            <button className={cn(opt, !category ? 'bg-maroon text-cream' : 'text-ink hover:bg-maroon/5')} onClick={() => set('category', null)}>
              All mukhvas
            </button>
          </li>
          {categories.map((c) => (
            <li key={c.slug}>
              <button className={cn(opt, category === c.slug ? 'bg-maroon text-cream' : 'text-ink hover:bg-maroon/5')} onClick={() => set('category', c.slug)}>
                {c.name}
                <span className={cn('text-xs', category === c.slug ? 'text-cream/70' : 'text-muted')}>{c._count?.products}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <p className="eyebrow">Price</p>
        <ul className="mt-3 space-y-2">
          {PRICE_RANGES.map((r) => (
            <li key={r.id}>
              <label className="flex cursor-pointer items-center gap-3 text-sm">
                <input type="radio" name="price" className="h-4 w-4 accent-maroon" checked={price === r.id} onChange={() => set('price', r.id)} />
                {r.label}
              </label>
            </li>
          ))}
        </ul>
        {price && (
          <button className="mt-2 text-xs text-saffron-deep underline" onClick={() => set('price', null)}>
            Clear price
          </button>
        )}
      </div>
      <div>
        <p className="eyebrow">Jar size</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {WEIGHTS.map((w) => {
            const on = weights.includes(String(w));
            return (
              <button
                key={w}
                aria-pressed={on}
                onClick={() => set('weights', (on ? weights.filter((x) => x !== String(w)) : [...weights, String(w)]).join(',') || null)}
                className={cn('rounded-full border px-3.5 py-1.5 text-sm transition', on ? 'border-maroon bg-maroon text-cream' : 'border-line hover:border-maroon/40')}
              >
                {w} g
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function Shop() {
  const [params, setParams] = useSearchParamsState();
  const [drawer, setDrawer] = useState(false);
  const { data: categories = [] } = useCategories();

  const filters: ProductFilters = useMemo(() => {
    const range = PRICE_RANGES.find((r) => r.id === params.get('price'));
    return {
      category: params.get('category') || undefined,
      q: params.get('q') || undefined,
      minPrice: range?.min,
      maxPrice: range?.max,
      weights: params.get('weights')?.split(',').map(Number).filter(Boolean),
      sort: (params.get('sort') as ProductFilters['sort']) || 'featured',
    };
  }, [params]);

  const { data: products, isLoading, isFetching } = useProducts(filters);
  const category = categories.find((c) => c.slug === filters.category);
  const set = (k: string, v: string | null) => {
    const next = new URLSearchParams(params);
    if (v) next.set(k, v);
    else next.delete(k);
    setParams(next, { replace: true });
  };
  const activeCount = ['price', 'weights'].filter((k) => params.get(k)).length + (filters.category ? 1 : 0);

  const title = filters.q ? `Results for “${filters.q}”` : category?.name ?? 'All Mukhvas';
  return (
    <>
      <section className="bg-gradient-to-b from-cream-deep/80 to-cream">
        <div className="container-x py-14 text-center sm:py-20">
          <p className="eyebrow">The Collection</p>
          <h1 className="mt-3 text-5xl font-medium sm:text-6xl">{title}</h1>
          <Ornament className="mx-auto mt-5" />
          <p className="mx-auto mt-5 max-w-xl text-muted">{category?.blurb ?? 'Every blend is roasted in small batches, supari-free, and sealed in a glass jar worth keeping.'}</p>
          <div className="no-scrollbar -mx-4 mt-8 flex gap-2 overflow-x-auto px-4 sm:justify-center">
            {[{ slug: '', name: 'All' }, ...categories].map((c) => {
              const on = (filters.category ?? '') === c.slug;
              return (
                <button
                  key={c.slug || 'all'}
                  onClick={() => set('category', c.slug || null)}
                  className={cn('shrink-0 rounded-full px-5 py-2 text-sm transition', on ? 'bg-maroon text-cream shadow-soft' : 'bg-white text-maroon ring-1 ring-line hover:ring-maroon/30')}
                >
                  {c.name}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <div className="container-x grid gap-10 pb-24 lg:grid-cols-[240px_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-24">
            <Filters params={params} set={set} />
          </div>
        </aside>

        <div>
          <div className="mb-8 flex items-center justify-between gap-3 border-b border-line pb-4">
            <p className="text-sm text-muted">
              {isLoading ? 'Loading…' : `${products?.length ?? 0} ${products?.length === 1 ? 'product' : 'products'}`}
              {filters.q && (
                <button className="ml-3 inline-flex items-center gap-1 rounded-full bg-sand px-2.5 py-0.5 text-xs text-maroon" onClick={() => set('q', null)}>
                  “{filters.q}” <X className="h-3 w-3" />
                </button>
              )}
            </p>
            <div className="flex items-center gap-2">
              <button onClick={() => setDrawer(true)} className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm ring-1 ring-line lg:hidden">
                <SlidersHorizontal className="h-4 w-4" /> Filters {activeCount > 0 && <span className="rounded-full bg-maroon px-1.5 text-[10px] text-cream">{activeCount}</span>}
              </button>
              <label className="sr-only" htmlFor="sort">
                Sort by
              </label>
              <select id="sort" value={filters.sort} onChange={(e) => set('sort', e.target.value === 'featured' ? null : e.target.value)} className="rounded-full bg-white px-4 py-2 text-sm ring-1 ring-line outline-none">
                {SORTS.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className={cn('grid grid-cols-1 gap-x-6 gap-y-12 transition-opacity min-[460px]:grid-cols-2 xl:grid-cols-3', isFetching && !isLoading && 'opacity-60')}>
            {isLoading
              ? Array.from({ length: 6 }, (_, i) => <ProductCardSkeleton key={i} />)
              : products?.map((p, i) => <ProductCard key={p.id} product={p} priority={i < 3} />)}
          </div>
          {!isLoading && products?.length === 0 && (
            <div className="rounded-3xl bg-white/70 px-6 py-16 text-center ring-1 ring-line">
              <p className="font-serif text-3xl text-maroon">Nothing matches just yet</p>
              <p className="mt-2 text-muted">Try removing a filter or searching for something else.</p>
              <Button variant="outline" className="mt-6" onClick={() => setParams({}, { replace: true })}>
                Clear all filters
              </Button>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {drawer && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[80] bg-maroon-deep/30 lg:hidden" onClick={() => setDrawer(false)}>
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ ease: [0.22, 1, 0.36, 1], duration: 0.45 }}
              onClick={(e) => e.stopPropagation()}
              className="absolute inset-x-0 bottom-0 max-h-[85dvh] overflow-y-auto rounded-t-[32px] bg-cream px-6 pt-4 pb-8"
            >
              <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-maroon/20" />
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-3xl">Filters</h2>
                <button onClick={() => setParams(params.get('q') ? { q: params.get('q')! } : {}, { replace: true })} className="text-sm text-saffron-deep underline">
                  Clear all
                </button>
              </div>
              <Filters params={params} set={set} />
              <Button className="mt-8 w-full" size="lg" onClick={() => setDrawer(false)}>
                Show {products?.length ?? 0} products
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
