'use client';

import { HandHeart, Leaf, Recycle, Sparkles } from 'lucide-react';
import { TableScene } from '@/components/art/Scene';
import { ButtonLink } from '@/components/ui/Button';
import { PageHero } from '@/components/ui/PageHero';
import { Reveal } from '@/components/ui/Reveal';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { localProducts } from '@/lib/catalog';

const jars = (slugs: string[], tag: string) =>
  slugs.map((s) => {
    const p = localProducts.find((x) => x.slug === s)!;
    return { art: p.art, name: p.name, seed: `${s}-${tag}` };
  });

const chapters = [
  {
    eyebrow: 'The kitchen',
    title: 'It started with a kadai and a lot of fennel',
    text: 'Our Ba roasted mukhvas every Sunday in a heavy iron kadai — fennel first, then dhana dal, then a squeeze of lemon and a pinch of salt. The whole lane knew the smell. No guest left her home without a spoonful, and most left with a little steel dabba of their own.',
    jars: jars(['classic-sauf-dhana-dal', 'ajwain-hing-digestive'], 'kitchen'),
  },
  {
    eyebrow: 'The recipes',
    title: 'Written in the margins of a notebook',
    text: 'Her recipes lived in a cloth-bound notebook: how long to roast, when to add the gulkand, which fennel to buy at Manek Chowk. We have kept every one exactly as written — and added a few new ones the grandchildren begged for, like Chocolate Sauf.',
    jars: jars(['royal-paan-mukhvas', 'rose-gulkand-fennel'], 'recipes'),
  },
  {
    eyebrow: 'The jar',
    title: 'Tradition, in packaging worth keeping',
    text: 'Mukhvas deserved better than plastic pouches. So every blend is sealed in a glass jar with a brass-tone lid — beautiful on a dining table, perfect for gifting, and made to be refilled and reused for years.',
    jars: jars(['kesar-pista-royale', 'heritage-trio-gift-box', 'til-gud-crunch'], 'jar'),
  },
];

export default function About() {
  return (
    <>
      <PageHero
        eyebrow="Our Story"
        title={
          <>
            A homemade tradition, <em className="text-saffron-deep">beautifully</em> kept
          </>
        }
        intro={
          <>
            <span className="brand-gu font-semibold text-maroon" lang="gu">
              મીઠુડી
            </span>{' '}
            is what our Ba called anyone she loved — sweet one. It felt like the only right name for the mukhvas she made for them.
          </>
        }
      />

      <div className="container-x space-y-24 py-16 sm:space-y-32 sm:py-24">
        {chapters.map((c, i) => (
          <section key={c.title} className="grid items-center gap-10 lg:grid-cols-2 lg:gap-20">
            <Reveal className={i % 2 ? 'lg:order-2' : ''}>
              <div className="aspect-[5/4] overflow-hidden rounded-[36px] shadow-lift">
                <TableScene jars={c.jars} width={1000} height={800} xStart={c.jars.length > 2 ? 0.25 : 0.33} xSpan={c.jars.length > 2 ? 0.5 : 0.34} tableRatio={0.66} jarScale={0.9} className="h-full w-full" />
              </div>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="eyebrow">
                Chapter {i + 1} · {c.eyebrow}
              </p>
              <h2 className="mt-3 text-4xl leading-[1.05] font-medium sm:text-5xl">{c.title}</h2>
              <p className="mt-6 text-[15px] leading-relaxed text-muted sm:text-lg">{c.text}</p>
            </Reveal>
          </section>
        ))}
      </div>

      <section className="bg-maroon py-20 text-cream sm:py-28">
        <div className="container-x">
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className="text-[11px] tracking-[0.28em] text-gold uppercase">What we promise</p>
            <h2 className="mt-3 text-4xl text-cream sm:text-5xl">Four things we will never compromise on</h2>
          </Reveal>
          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Leaf, t: 'Purity', d: 'Whole seeds, real saffron and dry fruits. No supari, no tobacco, no artificial preservatives.' },
              { icon: HandHeart, t: 'Small batches', d: 'Roasted a few kilos at a time so every batch is pulled at exactly the right moment.' },
              { icon: Sparkles, t: 'Freshness', d: 'Packed within the same week it is roasted, and sealed airtight in glass.' },
              { icon: Recycle, t: 'Keepsake packaging', d: 'Glass jars and keepsake boxes designed to be reused long after the last spoonful.' },
            ].map(({ icon: Icon, t, d }, i) => (
              <Reveal key={t} delay={i * 0.08} className="rounded-[28px] bg-white/[0.04] p-7 ring-1 ring-white/10">
                <Icon className="h-6 w-6 text-saffron" strokeWidth={1.5} />
                <h3 className="mt-5 text-3xl text-cream">{t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-cream/70">{d}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="container-x py-20 text-center sm:py-28">
        <SectionHeading eyebrow="Come to the table" title="Taste the recipes for yourself" intro="Start with the blend that started it all, or send a jar to someone who deserves a sweet moment." />
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <ButtonLink href="/product/classic-sauf-dhana-dal" size="lg">
            Try Classic Sauf Dhana Dal
          </ButtonLink>
          <ButtonLink href="/gifting" variant="outline" size="lg">
            Send a gift
          </ButtonLink>
        </div>
      </section>
    </>
  );
}
