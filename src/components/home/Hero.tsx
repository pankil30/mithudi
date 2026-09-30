'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Leaf, ShieldCheck, Sparkles } from 'lucide-react';
import { TableScene } from '@/components/art/Scene';
import { ButtonLink } from '@/components/ui/Button';
import { localProducts } from '@/lib/catalog';

const heroJars = ['royal-paan-mukhvas', 'kesar-pista-royale', 'rose-gulkand-fennel'].map((slug) => {
  const p = localProducts.find((x) => x.slug === slug)!;
  return { art: p.art, name: p.name, seed: p.slug };
});

const ease = [0.22, 1, 0.36, 1] as const;

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.12]);
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '12%']);

  return (
    <section ref={ref} className="relative isolate overflow-hidden">
      <motion.div style={{ scale, y }} className="absolute inset-0 -z-10">
        <motion.div initial={{ opacity: 0, scale: 1.06 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.6, ease }} className="h-full w-full">
          <TableScene jars={heroJars} xStart={0.57} xSpan={0.35} className="hidden h-full w-full lg:block" />
          <TableScene
            jars={heroJars}
            width={600}
            height={1000}
            xStart={0.27}
            xSpan={0.46}
            tableRatio={0.8}
            jarScale={0.52}
            align="xMidYMax"
            className="h-full w-full lg:hidden"
          />
        </motion.div>
      </motion.div>
      {/* soft overlay: cream wash for legible type on the left, fading into the photograph */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-cream/90 via-cream/60 to-cream/10 lg:bg-gradient-to-r lg:from-cream lg:from-25% lg:via-cream/70 lg:via-40% lg:to-transparent lg:to-58%" />
      <div className="grain absolute inset-0 -z-10 opacity-60" />

      <div className="container-x flex min-h-[88svh] items-start pt-14 pb-[46vh] sm:pt-20 lg:min-h-[86vh] lg:items-center lg:py-24">
        <div className="max-w-xl">
          <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.8, ease }} className="eyebrow">
            Handcrafted in Gujarat · Small-batch
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 1, ease }}
            className="brand-gu mt-5 text-[56px] leading-[1.02] font-bold text-maroon sm:text-7xl lg:text-[88px]"
            lang="gu"
          >
            મીઠુડી
            <br />
            <span className="text-saffron-deep">મુખવાસ</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.9, ease }}
            className="mt-5 font-serif text-3xl text-maroon italic sm:text-4xl"
          >
            Sweet Moments. Fresh Breath.
          </motion.p>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.75, duration: 0.9 }} className="mt-5 max-w-md text-[15px] leading-relaxed text-muted sm:text-base">
            Roasted fennel, fragrant gulkand and Kashmiri saffron — family recipes, slow-made in small batches and sealed in glass jars worth keeping.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9, duration: 0.8, ease }} className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href="/shop" size="lg">
              Shop the Collection
            </ButtonLink>
            <ButtonLink href="/gifting" size="lg" variant="outline" className="bg-cream/60 backdrop-blur">
              Explore Gifting
            </ButtonLink>
          </motion.div>
          <motion.ul initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.1, duration: 1 }} className="mt-9 flex flex-wrap gap-x-6 gap-y-2 text-[13px] text-maroon/80">
            <li className="flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-leaf-deep" /> Supari & tobacco-free
            </li>
            <li className="flex items-center gap-1.5">
              <Leaf className="h-4 w-4 text-leaf-deep" /> No artificial preservatives
            </li>
            <li className="flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-leaf-deep" /> Reusable glass jars
            </li>
          </motion.ul>
        </div>
      </div>
    </section>
  );
}
