'use client';

import type { ReactNode } from 'react';
import { cn } from '@/lib/format';
import { Reveal } from './Reveal';

export function Ornament({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 12" className={cn('h-3 w-28 text-gold', className)} aria-hidden>
      <path d="M0 6h46M74 6h46" stroke="currentColor" strokeWidth="0.8" />
      <path d="M60 1l5 5-5 5-5-5z" fill="currentColor" />
      <circle cx="50" cy="6" r="1.4" fill="currentColor" />
      <circle cx="70" cy="6" r="1.4" fill="currentColor" />
    </svg>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  intro,
  align = 'center',
  className,
}: {
  eyebrow?: string;
  title: ReactNode;
  intro?: ReactNode;
  align?: 'center' | 'left';
  className?: string;
}) {
  return (
    <Reveal className={cn('max-w-2xl', align === 'center' ? 'mx-auto text-center' : '', className)}>
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h2 className="mt-3 text-4xl leading-[1.05] font-medium sm:text-5xl">{title}</h2>
      <Ornament className={cn('mt-5', align === 'center' ? 'mx-auto' : '')} />
      {intro && <p className="mt-5 text-[15px] leading-relaxed text-muted sm:text-base">{intro}</p>}
    </Reveal>
  );
}
