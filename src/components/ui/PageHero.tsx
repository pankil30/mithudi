'use client';

import type { ReactNode } from 'react';
import { Ornament } from './SectionHeading';

export function PageHero({ eyebrow, title, intro, children }: { eyebrow: string; title: ReactNode; intro?: ReactNode; children?: ReactNode }) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-cream-deep to-cream">
      <div className="pointer-events-none absolute -top-24 left-1/2 h-72 w-[42rem] -translate-x-1/2 rounded-full bg-saffron/15 blur-3xl" />
      <div className="container-x relative py-16 text-center sm:py-24">
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="mx-auto mt-4 max-w-3xl text-5xl leading-[1.02] font-medium sm:text-7xl">{title}</h1>
        <Ornament className="mx-auto mt-6" />
        {intro && <p className="mx-auto mt-6 max-w-2xl text-[15px] leading-relaxed text-muted sm:text-lg">{intro}</p>}
        {children}
      </div>
    </section>
  );
}
