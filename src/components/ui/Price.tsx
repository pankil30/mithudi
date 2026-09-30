'use client';

import { cn, formatINR, percentOff } from '@/lib/format';

export function Price({ price, mrp, className, large }: { price: number; mrp?: number; className?: string; large?: boolean }) {
  const off = mrp ? percentOff(price, mrp) : 0;
  return (
    <span className={cn('inline-flex flex-wrap items-baseline gap-x-2', className)}>
      <span className={cn('font-medium text-maroon', large ? 'text-3xl font-serif' : 'text-[15px]')}>{formatINR(price)}</span>
      {off > 0 && (
        <>
          <span className={cn('text-muted/70 line-through', large ? 'text-base' : 'text-xs')}>{formatINR(mrp!)}</span>
          <span className={cn('font-medium text-leaf-deep', large ? 'text-sm' : 'text-[11px]')}>{off}% off</span>
        </>
      )}
    </span>
  );
}
