'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ChevronDown, ChevronRight, Leaf, PackageCheck, ShieldCheck, ShoppingBag, Sparkles, Truck, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { JarSvg } from '@/components/art/Jar';
import { ProductMedia } from '@/components/art/ProductMedia';
import { ProductCard } from '@/components/product/ProductCard';
import { WishlistButton } from '@/components/product/WishlistButton';
import { Button } from '@/components/ui/Button';
import { Price } from '@/components/ui/Price';
import { QtyStepper } from '@/components/ui/QtyStepper';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Skeleton } from '@/components/ui/Skeleton';
import { Stars } from '@/components/ui/Stars';
import { catalogApi, PhpError } from '@/lib/php';
import { cn, formatDate, formatINR } from '@/lib/format';
import { useProduct, useProductReviews, useProducts } from '@/lib/queries';
import type { Product as P } from '@/lib/types';
import { useAuth } from '@/store/auth';
import { useCart } from '@/store/cart';
import NotFound from './NotFound';

function Gallery({ product }: { product: P }) {
  const slides = product.images.length
    ? product.images.map((_, i) => ({ kind: 'image' as const, i }))
    : [{ kind: 'scene' as const, i: 0 }, { kind: 'jar' as const, i: 1 }, { kind: 'scene' as const, i: 2 }];
  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState<{ x: number; y: number } | null>(null);
  const slide = slides[active];

  const render = (s: (typeof slides)[number], thumb = false) =>
    s.kind === 'jar' ? (
      <div className="grid h-full w-full place-items-center" style={{ background: `radial-gradient(circle at 50% 40%, #fff, ${product.art.wash})` }}>
        <JarSvg art={product.art} name={product.name} className={thumb ? 'h-[80%]' : 'h-[78%] drop-shadow-2xl'} />
      </div>
    ) : (
      <ProductMedia product={product} index={s.i} width={thumb ? 200 : 1000} priority={!thumb && s.i === 0} />
    );

  return (
    <div className="flex flex-col-reverse gap-3 sm:flex-row sm:gap-4">
      <div className="no-scrollbar flex gap-3 overflow-x-auto sm:flex-col">
        {slides.map((s, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            aria-label={`Show image ${i + 1}`}
            className={cn('aspect-[4/5] w-20 shrink-0 overflow-hidden rounded-2xl ring-2 transition sm:w-24', i === active ? 'ring-maroon' : 'ring-transparent opacity-70 hover:opacity-100')}
          >
            {render(s, true)}
          </button>
        ))}
      </div>
      <div
        className="relative aspect-[4/5] flex-1 cursor-zoom-in overflow-hidden rounded-[32px] bg-sand shadow-soft ring-1 ring-line/60"
        onMouseMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          setZoom({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
        }}
        onMouseLeave={() => setZoom(null)}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="h-full w-full transition-transform duration-300 ease-out"
            style={zoom ? { transform: 'scale(1.6)', transformOrigin: `${zoom.x}% ${zoom.y}%` } : undefined}
          >
            {render(slide)}
          </motion.div>
        </AnimatePresence>
        <WishlistButton slug={product.slug} name={product.name} className="absolute top-4 right-4 h-11 w-11" />
      </div>
    </div>
  );
}

function Accordion({ title, children, defaultOpen }: { title: string; children: ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(!!defaultOpen);
  return (
    <div className="border-b border-line">
      <button onClick={() => setOpen(!open)} className="flex w-full items-center justify-between py-5 text-left" aria-expanded={open}>
        <span className="font-serif text-xl text-maroon">{title}</span>
        <ChevronDown className={cn('h-5 w-5 text-muted transition-transform duration-300', open && 'rotate-180')} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.35 }} className="overflow-hidden">
            <div className="pb-6 text-[15px] leading-relaxed text-muted">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ReviewForm({ slug, onDone }: { slug: string; onDone: () => void }) {
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const qc = useQueryClient();
  const m = useMutation({
    mutationFn: () => catalogApi.addReview({ product_id: slug, rating, title: title || undefined, body }),
    onSuccess: () => {
      toast.success('Thank you for your review!');
      qc.invalidateQueries({ queryKey: ['reviews', slug] });
      qc.invalidateQueries({ queryKey: ['product', slug] });
      onDone();
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : 'Could not post review'),
  });
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        m.mutate();
      }}
      className="card space-y-4 p-6"
    >
      <div>
        <p className="label">Your rating</p>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button type="button" key={n} onClick={() => setRating(n)} aria-label={`${n} stars`} className={cn('text-2xl transition', n <= rating ? 'text-gold' : 'text-gold/30')}>
              ★
            </button>
          ))}
        </div>
      </div>
      <input className="input" placeholder="Title (optional)" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={120} />
      <textarea className="input min-h-28" placeholder="What did you love about it?" value={body} onChange={(e) => setBody(e.target.value)} required minLength={10} />
      <Button loading={m.isPending}>Post review</Button>
    </form>
  );
}

function ReviewsSection({ product }: { product: P }) {
  const { data: reviews = [] } = useProductReviews(product.slug);
  const user = useAuth((s) => s.user);
  const [writing, setWriting] = useState(false);
  return (
    <section id="reviews" className="container-x scroll-mt-24 py-20">
      <div className="grid gap-12 lg:grid-cols-[320px_1fr]">
        <div>
          <p className="eyebrow">Reviews</p>
          <h2 className="mt-3 text-4xl font-medium">What families say</h2>
          <div className="mt-6 flex items-end gap-3">
            <span className="font-serif text-6xl text-maroon">{product.rating.toFixed(1)}</span>
            <div className="pb-2">
              <Stars value={product.rating} size={16} />
              <p className="mt-1 text-xs text-muted">Based on {product.reviewCount} reviews</p>
            </div>
          </div>
          <div className="mt-6">
            {user ? (
              !writing && (
                <Button variant="outline" onClick={() => setWriting(true)}>
                  Write a review
                </Button>
              )
            ) : (
              <Link href="/account" className="text-sm text-saffron-deep underline">
                Sign in to write a review
              </Link>
            )}
          </div>
        </div>
        <div className="space-y-6">
          {writing && <ReviewForm slug={product.slug} onDone={() => setWriting(false)} />}
          {reviews.length === 0 && !writing && <p className="text-muted">Be the first to review this blend.</p>}
          {reviews.map((r) => (
            <article key={r.id} className="border-b border-line pb-6">
              <div className="flex items-center justify-between gap-4">
                <Stars value={r.rating} />
                {r.createdAt && <span className="text-xs text-muted">{formatDate(r.createdAt)}</span>}
              </div>
              {r.title && <h3 className="mt-3 font-serif text-xl text-maroon">{r.title}</h3>}
              <p className="mt-2 leading-relaxed text-ink/80">{r.body}</p>
              <p className="mt-3 text-sm text-muted">
                <span className="font-medium text-maroon">{r.name}</span>
                {r.city && ` · ${r.city}`}
                {r.verified && <span className="ml-2 rounded-full bg-leaf/15 px-2 py-0.5 text-[11px] text-leaf-deep">Verified buyer</span>}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Product({ slug }: { slug: string }) {
  const { data: product, isLoading, error } = useProduct(slug);
  const { data: related = [] } = useProducts({ category: product?.categories[0] });
  const add = useCart((s) => s.add);
  const router = useRouter();
  const [sku, setSku] = useState<string>();
  const [qty, setQty] = useState(1);
  const ctaRef = useRef<HTMLDivElement>(null);
  const [showSticky, setShowSticky] = useState(false);

  useEffect(() => {
    setSku(undefined);
    setQty(1);
  }, [slug]);

  useEffect(() => {
    const el = ctaRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setShowSticky(!e.isIntersecting && e.boundingClientRect.top < 0), { threshold: 0 });
    io.observe(el);
    return () => io.disconnect();
  }, [product]);

  if (error instanceof PhpError && error.status === 404) return <NotFound />;
  if (error)
    return (
      <div className="container-x py-24 text-center">
        <p className="font-serif text-2xl text-maroon">{error.message}</p>
        <button onClick={() => location.reload()} className="mt-4 text-sm text-saffron-deep underline">
          Try again
        </button>
      </div>
    );
  if (isLoading || !product) {
    return (
      <div className="container-x grid gap-10 py-10 lg:grid-cols-2">
        <Skeleton className="aspect-[4/5] rounded-[32px]" />
        <div className="space-y-4">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-14 w-3/4" />
          <Skeleton className="h-24" />
          <Skeleton className="h-14" />
        </div>
      </div>
    );
  }

  const variant = product.variants.find((v) => v.sku === sku) ?? product.variants.find((v) => v.inStock) ?? product.variants[0];
  const addToCart = () => {
    add(product, variant, qty);
    toast.success(`${product.name} (${variant.label}) added to your bag`);
  };
  const buyNow = () => {
    add(product, variant, qty);
    useCart.getState().setOpen(false);
    router.push('/checkout');
  };
  const per100 = variant.grams && variant.grams % 100 === 0 && !product.categories.includes('gift-boxes') ? Math.round((variant.price / variant.grams) * 100) : null;

  return (
    <>
      <nav className="container-x flex items-center gap-1.5 pt-6 text-xs text-muted" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-maroon">
          Home
        </Link>
        <ChevronRight className="h-3 w-3" />
        <Link href="/shop" className="hover:text-maroon">
          Shop
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-maroon">{product.name}</span>
      </nav>

      <section className="container-x grid gap-10 py-8 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
        <div className="lg:sticky lg:top-24 lg:self-start">
          <Gallery product={product} />
        </div>

        <div>
          <div className="flex flex-wrap gap-2">
            {product.isBestSeller && <span className="rounded-full bg-gold/20 px-3 py-1 text-[10px] tracking-[0.16em] text-maroon uppercase">Bestseller</span>}
            {product.isNew && <span className="rounded-full bg-leaf/20 px-3 py-1 text-[10px] tracking-[0.16em] text-leaf-deep uppercase">New</span>}
            <span className="rounded-full bg-sand px-3 py-1 text-[10px] tracking-[0.16em] text-maroon uppercase">Supari-free</span>
          </div>
          <h1 className="mt-4 text-5xl leading-[1.02] font-medium sm:text-6xl">{product.name}</h1>
          <a href="#reviews" className="mt-3 inline-flex items-center gap-2 text-sm text-muted hover:text-maroon">
            <Stars value={product.rating} /> {product.rating.toFixed(1)} · {product.reviewCount} reviews
          </a>
          <p className="mt-4 font-serif text-2xl text-maroon/80 italic">{product.tagline}</p>

          <div className="mt-6 flex items-baseline gap-3">
            <Price price={variant.price} mrp={variant.mrp} large />
          </div>
          <p className="mt-1 text-xs text-muted">
            Inclusive of all taxes{per100 ? ` · ${formatINR(per100)} per 100 g` : ''}
          </p>

          <div className="mt-8">
            <p className="label">{product.categories.includes('gift-boxes') ? 'Pack' : 'Jar size'}</p>
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
              {product.variants.map((v) => {
                const on = v.sku === variant.sku;
                return (
                  <button
                    key={v.sku}
                    disabled={!v.inStock}
                    onClick={() => setSku(v.sku)}
                    aria-pressed={on}
                    className={cn(
                      'relative rounded-2xl border p-3.5 text-left transition',
                      on ? 'border-maroon bg-maroon/[0.04] ring-1 ring-maroon' : 'border-line bg-white hover:border-maroon/40',
                      !v.inStock && 'opacity-50',
                    )}
                  >
                    <span className="block font-medium text-maroon">{v.label}</span>
                    <span className="text-sm text-muted">{v.inStock ? formatINR(v.price) : 'Sold out'}</span>
                    {v.mrp > v.price && v.inStock && <span className="absolute top-2 right-2.5 text-[10px] font-medium text-leaf-deep">-{Math.round(((v.mrp - v.price) / v.mrp) * 100)}%</span>}
                  </button>
                );
              })}
            </div>
          </div>

          <div ref={ctaRef} className="mt-6 flex flex-wrap items-center gap-3">
            <QtyStepper value={qty} onChange={(n) => setQty(Math.max(1, n))} />
            <Button size="lg" className="flex-1" onClick={addToCart} disabled={!variant.inStock}>
              <ShoppingBag className="h-4 w-4" /> {variant.inStock ? 'Add to Cart' : 'Sold out'}
            </Button>
            <Button size="lg" variant="gold" className="w-full sm:w-auto" onClick={buyNow} disabled={!variant.inStock}>
              <Zap className="h-4 w-4" /> Buy it now
            </Button>
          </div>

          <ul className="mt-6 grid gap-3 rounded-3xl bg-cream-deep/70 p-5 text-sm text-maroon sm:grid-cols-3">
            <li className="flex items-center gap-2">
              <Truck className="h-4 w-4 text-leaf-deep" /> Free shipping over ₹499
            </li>
            <li className="flex items-center gap-2">
              <PackageCheck className="h-4 w-4 text-leaf-deep" /> Dispatched in 24–48 h
            </li>
            <li className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-leaf-deep" /> COD available
            </li>
          </ul>

          <div className="mt-8 border-t border-line">
            <Accordion title="Description" defaultOpen>
              <p>{product.description}</p>
            </Accordion>
            <Accordion title="Ingredients">
              <ul className="flex flex-wrap gap-2">
                {product.ingredients.map((i) => (
                  <li key={i} className="rounded-full bg-white px-3 py-1.5 text-sm text-maroon ring-1 ring-line">
                    {i}
                  </li>
                ))}
              </ul>
            </Accordion>
            <Accordion title="Benefits">
              <ul className="space-y-2.5">
                {product.benefits.map((b) => (
                  <li key={b} className="flex gap-3">
                    <Leaf className="mt-1 h-4 w-4 shrink-0 text-leaf-deep" /> {b}
                  </li>
                ))}
              </ul>
            </Accordion>
            <Accordion title="How to use">
              <p>{product.howToUse}</p>
            </Accordion>
          </div>
        </div>
      </section>

      <section className="border-y border-line bg-cream-deep/50">
        <div className="container-x grid gap-6 py-12 sm:grid-cols-3">
          {[
            { icon: Leaf, t: 'Honest ingredients', d: 'Whole seeds, real saffron, slow-set gulkand. Nothing to hide.' },
            { icon: Sparkles, t: 'Freshly roasted', d: 'Each batch is roasted and packed within the same week.' },
            { icon: ShieldCheck, t: 'Supari & tobacco-free', d: 'Safe for the whole family, including the little ones.' },
          ].map(({ icon: Icon, t, d }) => (
            <div key={t} className="flex gap-4">
              <Icon className="mt-1 h-6 w-6 shrink-0 text-saffron-deep" strokeWidth={1.5} />
              <div>
                <p className="font-serif text-xl text-maroon">{t}</p>
                <p className="mt-1 text-sm text-muted">{d}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <ReviewsSection product={product} />

      {related.filter((p) => p.slug !== product.slug).length > 0 && (
        <section className="bg-gradient-to-b from-cream to-cream-deep/60 py-20">
          <div className="container-x">
            <SectionHeading eyebrow="Pairs beautifully with" title="You may also love" />
            <div className="mt-12 grid grid-cols-1 gap-x-6 gap-y-12 min-[460px]:grid-cols-2 lg:grid-cols-4">
              {related
                .filter((p) => p.slug !== product.slug)
                .slice(0, 4)
                .map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
            </div>
          </div>
        </section>
      )}

      <AnimatePresence>
        {showSticky && (
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            transition={{ ease: [0.22, 1, 0.36, 1], duration: 0.4 }}
            className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-cream/95 px-4 pt-3 pb-[max(12px,env(safe-area-inset-bottom))] shadow-lift backdrop-blur-xl lg:hidden"
          >
            <div className="flex items-center gap-3">
              <div className="min-w-0 flex-1">
                <p className="truncate font-serif text-lg leading-tight text-maroon">{product.name}</p>
                <p className="text-xs text-muted">
                  {variant.label} · <span className="font-medium text-maroon">{formatINR(variant.price)}</span>
                </p>
              </div>
              <Button onClick={addToCart} disabled={!variant.inStock}>
                <ShoppingBag className="h-4 w-4" /> Add to Cart
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
