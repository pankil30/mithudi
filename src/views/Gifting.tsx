'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Briefcase, ChevronDown, Flower2, Gift, Heart, Sparkles } from 'lucide-react';
import { EnquiryForm } from '@/components/account/EnquiryForm';
import { TableScene } from '@/components/art/Scene';
import { ProductCard, ProductCardSkeleton } from '@/components/product/ProductCard';
import { ButtonLink } from '@/components/ui/Button';
import { Reveal } from '@/components/ui/Reveal';
import { Ornament, SectionHeading } from '@/components/ui/SectionHeading';
import { localProducts } from '@/lib/catalog';
import { cn } from '@/lib/format';
import { useProducts } from '@/lib/queries';

const heroJars = ['wedding-favour-minis', 'festive-brass-hamper', 'rose-gulkand-fennel'].map((s) => {
  const p = localProducts.find((x) => x.slug === s)!;
  return { art: p.art, name: p.name, seed: `${s}-gifting` };
});

const occasions = [
  { icon: Heart, t: 'Weddings', d: 'Mini jars for mehendi & sangeet, trousseau jars and bridal hampers with custom tags.' },
  { icon: Sparkles, t: 'Diwali & festivals', d: 'Brass hampers and keepsake boxes that families look forward to every year.' },
  { icon: Briefcase, t: 'Corporate', d: 'Logo tags, branded sleeves and pan-India delivery to every employee or client.' },
  { icon: Flower2, t: 'Baby showers & poojas', d: 'Gentle, supari-free blends in pastel packaging for intimate celebrations.' },
];

const faqs = [
  { q: 'What is the minimum order for custom tags?', a: 'Custom printed tags start at 50 mini jars or 25 gift boxes. For smaller quantities we add a handwritten note card free of charge.' },
  { q: 'How far in advance should I order?', a: 'We recommend 3 weeks for weddings and corporate orders with custom branding, and 7–10 days for standard gift boxes.' },
  { q: 'Do you deliver to multiple addresses?', a: 'Yes. Share a spreadsheet of addresses and we’ll dispatch individually across India with tracking for each parcel.' },
  { q: 'Can I get a sample before ordering in bulk?', a: 'Absolutely — we send a sample box at cost, adjusted against your final order.' },
  { q: 'Is GST invoicing available?', a: 'Yes, we provide GST invoices for all corporate and bulk orders.' },
];

function Faq({ dark }: { dark?: boolean }) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className={cn('divide-y border-y', dark ? 'divide-white/10 border-white/10' : 'divide-line border-line')}>
      {faqs.map((f, i) => (
        <div key={f.q}>
          <button onClick={() => setOpen(open === i ? null : i)} className="flex w-full items-center justify-between gap-4 py-5 text-left" aria-expanded={open === i}>
            <span className={cn('font-serif text-xl', dark ? 'text-cream' : 'text-maroon')}>{f.q}</span>
            <ChevronDown className={cn('h-5 w-5 shrink-0 transition', dark ? 'text-cream/60' : 'text-muted', open === i && 'rotate-180')} />
          </button>
          <AnimatePresence initial={false}>
            {open === i && (
              <motion.p initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className={cn('overflow-hidden pb-5', dark ? 'text-cream/70' : 'text-muted')}>
                {f.a}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}

export default function Gifting() {
  const { data, isLoading } = useProducts({ category: 'gift-boxes' });
  return (
    <>
      <section className="relative isolate overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <TableScene jars={heroJars} className="hidden h-full w-full lg:block" />
          <TableScene jars={heroJars} width={600} height={1000} xStart={0.27} xSpan={0.46} tableRatio={0.82} jarScale={0.5} align="xMidYMax" className="h-full w-full lg:hidden" />
        </div>
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-cream/95 via-cream/70 to-cream/0 lg:bg-gradient-to-r lg:from-cream lg:via-cream/80 lg:to-transparent" />
        <div className="container-x flex min-h-[80svh] items-start pt-16 pb-[44vh] lg:min-h-[70vh] lg:items-center lg:py-24">
          <div className="max-w-xl">
            <p className="eyebrow">Wedding · Festive · Corporate gifting</p>
            <h1 className="mt-4 text-5xl leading-[1.02] font-medium sm:text-7xl">Gifts that end every celebration sweetly</h1>
            <Ornament className="mt-6" />
            <p className="mt-6 text-[15px] leading-relaxed text-muted sm:text-lg">From 25 keepsake boxes to 2,000 wedding favours — handpacked, custom-tagged and delivered across India.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href="#enquire" size="lg" onClick={(e) => { e.preventDefault(); document.getElementById('enquire')?.scrollIntoView({ behavior: 'smooth' }); }}>
                Request a quote
              </ButtonLink>
              <ButtonLink href="/shop?category=gift-boxes" variant="outline" size="lg" className="bg-cream/60">
                Shop gift boxes
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>

      <section className="container-x py-20 sm:py-28">
        <SectionHeading eyebrow="Occasions" title="Made for every milestone" />
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {occasions.map(({ icon: Icon, t, d }, i) => (
            <Reveal key={t} delay={i * 0.08} className="card p-7 transition hover:-translate-y-1 hover:shadow-lift">
              <span className="grid h-12 w-12 place-items-center rounded-full bg-sand text-saffron-deep">
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="mt-5 text-3xl">{t}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{d}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="bg-gradient-to-b from-cream-deep/70 to-cream py-20 sm:py-28">
        <div className="container-x">
          <SectionHeading eyebrow="Ready to gift" title="Our gift collection" />
          <div className="mt-12 grid grid-cols-1 gap-x-6 gap-y-12 min-[460px]:grid-cols-2 lg:grid-cols-3">
            {isLoading ? Array.from({ length: 3 }, (_, i) => <ProductCardSkeleton key={i} />) : data?.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      </section>

      <section className="container-x py-20 sm:py-28">
        <SectionHeading eyebrow="How it works" title="Four easy steps" />
        <ol className="mt-12 grid gap-5 md:grid-cols-4">
          {[
            ['Tell us about it', 'Share your date, quantity and budget using the form below.'],
            ['Get a tailored quote', 'We reply within one working day with options and a sample offer.'],
            ['Approve your design', 'Pick blends, packaging and tag text — we send a digital proof.'],
            ['We pack & deliver', 'Handpacked and shipped to one venue or a thousand doorsteps.'],
          ].map(([t, d], i) => (
            <Reveal key={t} delay={i * 0.08} className="relative rounded-[28px] bg-white/70 p-7 ring-1 ring-line">
              <span className="font-serif text-5xl text-gold">0{i + 1}</span>
              <h3 className="mt-3 text-2xl">{t}</h3>
              <p className="mt-2 text-sm text-muted">{d}</p>
            </Reveal>
          ))}
        </ol>
      </section>

      <section id="enquire" className="scroll-mt-24 bg-maroon py-20 sm:py-28">
        <div className="container-x grid gap-12 lg:grid-cols-[1fr_1.4fr]">
          <div className="text-cream">
            <Gift className="h-8 w-8 text-gold" />
            <h2 className="mt-4 text-4xl text-cream sm:text-5xl">Plan your gifting</h2>
            <p className="mt-4 max-w-md text-cream/70">Tell us about your celebration and we’ll put together options within one working day. Special pricing from 25 boxes.</p>
            <div className="mt-10 text-cream">
              <p className="mb-2 text-xs tracking-[0.2em] text-gold uppercase">Frequently asked</p>
              <Faq dark />
            </div>
          </div>
          <EnquiryForm kinds={['WEDDING', 'BULK']} className="bg-cream" />
        </div>
      </section>
    </>
  );
}
