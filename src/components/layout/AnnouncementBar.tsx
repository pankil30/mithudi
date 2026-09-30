'use client';

import { commerceRules } from '@/data/catalog';
import { formatINR } from '@/lib/format';

const messages = [
  `Free shipping on orders above ${formatINR(commerceRules.freeShippingAbove)}`,
  'Supari-free · Tobacco-free · Small-batch',
  'Use MITHUDI10 for 10% off your first jar',
  'Wedding & corporate gifting — custom tags available',
];

export function AnnouncementBar() {
  const row = [...messages, ...messages];
  return (
    <div className="overflow-hidden bg-maroon text-cream">
      <div className="flex w-max animate-marquee gap-12 py-2 text-[11px] tracking-[0.18em] uppercase hover:[animation-play-state:paused]">
        {row.map((m, i) => (
          <span key={i} className="flex items-center gap-12 whitespace-nowrap">
            {m}
            <span className="text-gold" aria-hidden>
              ✦
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
