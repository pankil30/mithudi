'use client';

import { Star } from 'lucide-react';
import { cn } from '@/lib/format';

export function Stars({ value, className, size = 14 }: { value: number; className?: string; size?: number }) {
  return (
    <span className={cn('inline-flex items-center gap-0.5', className)} aria-label={`Rated ${value.toFixed(1)} out of 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} width={size} height={size} className={i <= Math.round(value) ? 'fill-gold text-gold' : 'fill-transparent text-gold/40'} strokeWidth={1.5} />
      ))}
    </span>
  );
}
