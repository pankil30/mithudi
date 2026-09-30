'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, BadgeCheck, Flame, Gift, HandHeart, Instagram, Leaf, Quote, Truck } from 'lucide-react';
import { JarSvg } from '@/components/art/Jar';
import { ProductMedia } from '@/components/art/ProductMedia';
import { ProductScene, TableScene } from '@/components/art/Scene';
import { ProductCard, ProductCardSkeleton } from '@/components/product/ProductCard';
import { ButtonLink } from '@/components/ui/Button';
import { Reveal } from '@/components/ui/Reveal';
import { Ornament, SectionHeading } from '@/components/ui/SectionHeading';
import { Stars } from '@/components/ui/Stars';
import { posts } from '@/data/journal';
import { localProducts } from '@/lib/catalog';
import { cn, formatDate } from '@/lib/format';
import { useFeaturedReviews, useProducts } from '@/lib/queries';

const art = (slug: string) => localProducts.find((p) => p.slug === slug)!;

/* ── Promise strip ────────────────────────────────── */

export function PromiseStrip() {
  const items = [
    { icon: HandHeart, title: 'Made by hand', text: 'Roasted in small batches' },
    { icon: Leaf, title: 'Supari-free', text: 'No tobacco, ever' },
    { icon: BadgeCheck, title: 'Pure ingredients', text: 'No artificial preservatives' },
    { icon: Truck, title: 'Free shipping', text: 'On orders above ₹499' },
  ];
  return (
    <section className="border-y border-line bg-cream-deep/60">
      <div className="container-x grid grid-cols-2 gap-y-6 py-8 lg:grid-cols-4">
        {items.map(({ icon: Icon, title, text }, i) => (
          <Reveal key={title} delay={i * 0.08} className="flex items-center gap-3.5 sm:justify-center">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white text-saffron-deep ring-1 ring-line">
              <Icon className="h-5 w-5" strokeWidth={1.6} />
            </span>
            <span>
              <span className="block font-serif text-lg leading-tight text-maroon">{title}</span>
              <span className="text-xs text-muted">{text}</span>
            </span>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ── Featured collections ─────────────────────────── */

const featured = [
  { slug: 'premium', name: 'Premium', line: 'Saffron, silver varq & rose', product: 'kesar-pista-royale', span: 'lg:col-span-2 lg:row-span-2' },
  { slug: 'digestive', name: 'Digestive', line: 'Roasted seeds that settle', product: 'classic-sauf-dhana-dal', span: '' },
  { slug: 'sweet', name: 'Sweet', line: 'Gulkand, paan & candy', product: 'rose-gulkand-fennel', span: '' },
  { slug: 'kids', name: 'Kids', line: 'Colourful & gentle', product: 'rainbow-candy-fennel', span: '' },
  { slug: 'gift-boxes', name: 'Gift Boxes', line: 'Keepsakes for every occasion', product: 'heritage-trio-gift-box', span: '' },
];

export function Collections() {
  return (
    <section className="container-x py-20 sm:py-28">
      <SectionHeading eyebrow="Featured Collections" title="A jar for every table" intro="From everyday digestive blends to heirloom gift hampers — find the mukhvas that feels like home." />
      <div className="mt-14 grid auto-rows-[260px] grid-cols-2 gap-3 sm:gap-5 lg:auto-rows-[280px] lg:grid-cols-4">
        {featured.map((c, i) => {
          const p = art(c.product);
          const big = i === 0;
          return (
            <Reveal key={c.slug} delay={i * 0.08} className={cn(c.span, big && 'col-span-2 row-span-2')}>
              <Link href={`/shop?category=${c.slug}`} className="group relative block h-full overflow-hidden rounded-[28px] shadow-soft ring-1 ring-line/60">
                <div className="absolute inset-0 transition-transform duration-[1200ms] ease-out group-hover:scale-[1.06]">
                  <ProductScene art={p.art} name={p.name} seed={`${p.slug}-collection`} className="h-full w-full" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-maroon-deep/75 via-maroon-deep/5 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-5 sm:p-6">
                  <div>
                    <h3 className={cn('font-serif leading-none font-medium text-cream', big ? 'text-4xl sm:text-5xl' : 'text-2xl sm:text-3xl')}>{c.name}</h3>
                    <p className="mt-1.5 text-xs text-cream/80 sm:text-sm">{c.line}</p>
                  </div>
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-cream/90 text-maroon transition-all duration-500 group-hover:bg-gold group-hover:text-maroon-deep">
                    <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                  </span>
                </div>
              </Link>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}

/* ── Best sellers ─────────────────────────────────── */

export function BestSellers() {
  const { data, isLoading } = useProducts({ bestSeller: true });
  return (
    <section className="bg-gradient-to-b from-cream to-cream-deep/70 py-20 sm:py-28">
      <div className="container-x">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row sm:items-end">
          <SectionHeading align="left" eyebrow="Loved by families" title="Our Best Sellers" className="text-center sm:text-left" />
          <ButtonLink href="/shop" variant="outline" className="shrink-0">
            View all mukhvas <ArrowRight className="h-4 w-4" />
          </ButtonLink>
        </div>
        <div className="mt-12 grid grid-cols-1 gap-x-6 gap-y-12 min-[460px]:grid-cols-2 lg:grid-cols-4">
          {isLoading ? Array.from({ length: 4 }, (_, i) => <ProductCardSkeleton key={i} />) : data?.slice(0, 4).map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </div>
    </section>
  );
}

/* ── Our story ────────────────────────────────────── */

export function StoryTeaser() {
  const story = ['classic-sauf-dhana-dal', 'ajwain-hing-digestive'].map((s) => ({ art: art(s).art, name: art(s).name, seed: `${s}-story` }));
  return (
    <section className="container-x grid items-center gap-12 py-20 sm:py-28 lg:grid-cols-2 lg:gap-20">
      <Reveal className="relative">
        <div className="aspect-[4/5] overflow-hidden rounded-[36px] shadow-lift sm:aspect-[5/5]">
          <TableScene jars={story} width={900} height={1000} xStart={0.3} xSpan={0.4} tableRatio={0.7} jarScale={0.9} className="h-full w-full" />
        </div>
        <div className="absolute -right-3 -bottom-6 max-w-[220px] rounded-3xl bg-cream p-5 shadow-lift ring-1 ring-line sm:-right-8">
          <p className="brand-gu text-2xl font-bold text-maroon" lang="gu">
            મીઠુડી
          </p>
          <p className="mt-1 text-xs leading-relaxed text-muted">An affectionate Gujarati word for someone sweet — the way Ba greeted every guest at her door.</p>
        </div>
      </Reveal>
      <Reveal delay={0.1}>
        <p className="eyebrow">Our Story</p>
        <h2 className="mt-3 text-4xl leading-[1.05] font-medium sm:text-5xl">From Ba’s brass dani to your dining table</h2>
        <Ornament className="mt-5" />
        <div className="mt-6 space-y-4 text-[15px] leading-relaxed text-muted sm:text-base">
          <p>
            It began in a sunlit Ahmedabad kitchen, where fennel was roasted in a heavy iron kadai until the whole house smelled of it. Every guest left with a spoonful of mukhvas — and usually a little
            steel dabba to take home.
          </p>
          <p>
            <span className="brand-gu font-semibold text-maroon" lang="gu">
              મીઠુડી મુખવાસ
            </span>{' '}
            keeps those recipes exactly as they were — small batches, honest ingredients, no shortcuts — and packs them in glass jars as beautiful as the ritual deserves.
          </p>
        </div>
        <dl className="mt-8 grid grid-cols-3 gap-4 border-y border-line py-6">
          {[
            ['14', 'Signature blends'],
            ['5 kg', 'Largest roasting batch'],
            ['0', 'Supari or tobacco'],
          ].map(([n, l]) => (
            <div key={l}>
              <dt className="font-serif text-4xl text-maroon">{n}</dt>
              <dd className="mt-1 text-xs text-muted">{l}</dd>
            </div>
          ))}
        </dl>
        <ButtonLink href="/about" variant="outline" className="mt-8">
          Read our story <ArrowRight className="h-4 w-4" />
        </ButtonLink>
      </Reveal>
    </section>
  );
}

/* ── Ritual ───────────────────────────────────────── */

export function Ritual() {
  const steps = [
    { icon: Flame, title: 'Slow-roasted', text: 'Seeds are roasted a few kilos at a time and pulled the moment they turn fragrant.' },
    { icon: HandHeart, title: 'Hand-blended', text: 'Gulkand, saffron and dry fruits are folded in by hand, never by machine.' },
    { icon: Gift, title: 'Sealed in glass', text: 'Packed the same week into airtight glass jars you’ll want to keep.' },
  ];
  return (
    <section className="relative overflow-hidden bg-maroon py-20 text-cream sm:py-28">
      <div className="grain absolute inset-0 opacity-40" />
      <div className="pointer-events-none absolute -top-24 -left-24 h-80 w-80 rounded-full bg-saffron/15 blur-3xl" />
      <div className="container-x relative">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-[11px] font-medium tracking-[0.28em] text-gold uppercase">The Mithudi way</p>
          <h2 className="mt-3 text-4xl leading-[1.05] font-medium text-cream sm:text-5xl">Made slowly, the way it should be</h2>
          <Ornament className="mx-auto mt-5" />
        </Reveal>
        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {steps.map(({ icon: Icon, title, text }, i) => (
            <Reveal key={title} delay={i * 0.12} className="rounded-[28px] bg-white/[0.04] p-8 ring-1 ring-white/10 backdrop-blur">
              <span className="font-serif text-6xl text-gold/40">0{i + 1}</span>
              <Icon className="mt-4 h-6 w-6 text-saffron" strokeWidth={1.5} />
              <h3 className="mt-4 text-3xl text-cream">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-cream/70">{text}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Gifting banner ───────────────────────────────── */

export function GiftingBanner() {
  const box = art('heritage-trio-gift-box');
  const hamper = art('festive-brass-hamper');
  return (
    <section className="container-x py-20 sm:py-28">
      <Reveal className="relative grid items-center overflow-hidden rounded-[40px] bg-gradient-to-br from-[#F3E2D0] via-cream-deep to-[#EFD9C8] ring-1 ring-line lg:grid-cols-2">
        <div className="relative z-10 p-8 sm:p-14">
          <p className="eyebrow">Weddings · Diwali · Corporate</p>
          <h2 className="mt-3 text-4xl leading-[1.05] font-medium sm:text-5xl">Gifts that end every celebration sweetly</h2>
          <p className="mt-5 max-w-md text-[15px] leading-relaxed text-muted">
            Keepsake boxes, brass hampers and mini jars with custom tags — packed by hand, delivered across India. Special pricing from 25 boxes.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href="/gifting">Plan your gifting</ButtonLink>
            <ButtonLink href="/shop?category=gift-boxes" variant="outline">
              Shop gift boxes
            </ButtonLink>
          </div>
        </div>
        <div className="relative flex h-80 items-end justify-center gap-2 sm:h-[420px]">
          <div className="absolute inset-x-10 bottom-10 h-10 rounded-[50%] bg-maroon/15 blur-2xl" />
          <motion.div initial={{ y: 30, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }} transition={{ duration: 1 }} className="relative -mr-8 w-44 sm:w-60">
            <JarSvg art={box.art} name={box.name} className="w-full drop-shadow-xl" />
          </motion.div>
          <motion.div initial={{ y: 50, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }} transition={{ duration: 1, delay: 0.15 }} className="relative mb-8 w-52 sm:w-72">
            <JarSvg art={hamper.art} name={hamper.name} className="w-full drop-shadow-2xl" />
          </motion.div>
        </div>
      </Reveal>
    </section>
  );
}

/* ── Reviews carousel ─────────────────────────────── */

export function Reviews() {
  const { data = [] } = useFeaturedReviews();
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const n = data.length;
  useEffect(() => {
    if (!n || paused) return;
    const t = setInterval(() => setI((x) => (x + 1) % n), 6000);
    return () => clearInterval(t);
  }, [n, paused]);
  if (!n) return null;
  const r = data[i % n];

  return (
    <section className="bg-cream-deep/70 py-20 sm:py-28" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <div className="container-x">
        <SectionHeading eyebrow="Kind words" title="From our family’s tables" />
        <div className="relative mx-auto mt-12 max-w-3xl">
          <Quote className="mx-auto h-10 w-10 text-gold/50" />
          <div className="relative mt-4 min-h-[230px] sm:min-h-[200px]" aria-live="polite">
            <AnimatePresence mode="wait">
              <motion.figure
                key={r.id}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -14 }}
                transition={{ duration: 0.5 }}
                className="text-center"
              >
                <Stars value={r.rating} size={16} className="justify-center" />
                {r.title && <p className="mt-4 font-serif text-2xl text-maroon italic">“{r.title}”</p>}
                <blockquote className="mt-3 font-serif text-xl leading-relaxed text-ink/80 sm:text-2xl">{r.body}</blockquote>
                <figcaption className="mt-6 text-sm">
                  <span className="font-medium text-maroon">{r.name}</span>
                  {r.city && <span className="text-muted"> · {r.city}</span>}
                  {r.product && (
                    <Link href={`/product/${r.product.slug}`} className="mt-1 block text-xs tracking-wider text-saffron-deep uppercase hover:underline">
                      {r.product.name}
                    </Link>
                  )}
                </figcaption>
              </motion.figure>
            </AnimatePresence>
          </div>
          <div className="mt-8 flex items-center justify-center gap-4">
            <button onClick={() => setI((x) => (x - 1 + n) % n)} className="grid h-11 w-11 place-items-center rounded-full ring-1 ring-line transition hover:bg-white" aria-label="Previous review">
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div className="flex gap-1.5">
              {data.map((d, k) => (
                <button key={d.id} onClick={() => setI(k)} aria-label={`Review ${k + 1}`} className={cn('h-1.5 rounded-full transition-all', k === i % n ? 'w-6 bg-maroon' : 'w-1.5 bg-maroon/20')} />
              ))}
            </div>
            <button onClick={() => setI((x) => (x + 1) % n)} className="grid h-11 w-11 place-items-center rounded-full ring-1 ring-line transition hover:bg-white" aria-label="Next review">
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Instagram gallery ────────────────────────────── */

const gallery = ['rose-gulkand-fennel', 'heritage-trio-gift-box', 'kesar-pista-royale', 'rainbow-candy-fennel', 'meetha-paan-bites', 'til-gud-crunch'];

export function InstagramGallery() {
  return (
    <section className="py-20 sm:py-28">
      <div className="container-x">
        <SectionHeading eyebrow="@mithudimukhvas" title="Moments from your tables" intro="Tag us in your after-meal rituals, festive thalis and gifting hauls for a chance to be featured." />
      </div>
      <div className="no-scrollbar mt-12 flex snap-x gap-3 overflow-x-auto px-4 sm:gap-4 lg:grid lg:grid-cols-6 lg:overflow-visible lg:px-10">
        {gallery.map((slug, i) => {
          const p = art(slug);
          return (
            <Reveal key={slug} delay={i * 0.06} className="w-[62vw] shrink-0 snap-center sm:w-[36vw] lg:w-auto">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className={cn('group relative block overflow-hidden rounded-[24px]', i % 2 ? 'aspect-[4/5] lg:mt-10' : 'aspect-[4/5]')}
                aria-label={`${p.name} on Instagram`}
              >
                <div className="h-full w-full transition-transform duration-[1200ms] group-hover:scale-110">
                  <ProductMedia product={{ ...p, slug: `${p.slug}-ig` }} width={400} />
                </div>
                <div className="absolute inset-0 grid place-items-center bg-maroon-deep/0 transition duration-500 group-hover:bg-maroon-deep/40">
                  <Instagram className="h-7 w-7 scale-75 text-cream opacity-0 transition duration-500 group-hover:scale-100 group-hover:opacity-100" />
                </div>
              </a>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}

/* ── Journal preview ──────────────────────────────── */

export function JournalPreview() {
  return (
    <section className="border-t border-line bg-cream-deep/40 py-20 sm:py-28">
      <div className="container-x">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row sm:items-end">
          <SectionHeading align="left" eyebrow="The Journal" title="Mukhvas tips & rituals" className="text-center sm:text-left" />
          <ButtonLink href="/journal" variant="outline" className="shrink-0">
            Read the journal <ArrowRight className="h-4 w-4" />
          </ButtonLink>
        </div>
        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {posts.slice(0, 3).map((post, i) => (
            <Reveal key={post.slug} delay={i * 0.1}>
              <PostCard post={post} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function PostCard({ post }: { post: (typeof posts)[number] }) {
  const p = art(post.coverSlug);
  return (
    <Link href={`/journal/${post.slug}`} className="group block">
      <div className="aspect-[16/11] overflow-hidden rounded-[24px] ring-1 ring-line/60">
        <div className="h-full w-full transition-transform duration-[1200ms] group-hover:scale-105">
          <TableScene jars={[{ art: p.art, name: p.name, seed: `${post.slug}-cover` }]} width={1100} height={760} xStart={0.5} tableRatio={0.66} jarScale={0.78} className="h-full w-full" />
        </div>
      </div>
      <p className="mt-5 text-[11px] tracking-[0.2em] text-saffron-deep uppercase">
        {post.category} · {formatDate(post.date)}
      </p>
      <h3 className="mt-2 font-serif text-2xl leading-snug text-maroon transition group-hover:text-saffron-deep">{post.title}</h3>
      <p className="mt-2 line-clamp-2 text-sm text-muted">{post.excerpt}</p>
    </Link>
  );
}
