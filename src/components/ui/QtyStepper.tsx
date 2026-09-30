'use client';

import { Minus, Plus } from 'lucide-react';
import { cn } from '@/lib/format';

export function QtyStepper({ value, onChange, max = 20, small, className }: { value: number; onChange: (n: number) => void; max?: number; small?: boolean; className?: string }) {
  const btn = cn('grid place-items-center rounded-full text-maroon transition hover:bg-maroon/5 disabled:opacity-30', small ? 'h-7 w-7' : 'h-10 w-10');
  return (
    <div className={cn('inline-flex items-center rounded-full border border-line bg-white', className)}>
      <button type="button" className={btn} onClick={() => onChange(value - 1)} aria-label="Decrease quantity">
        <Minus className="h-3.5 w-3.5" />
      </button>
      <span className={cn('text-center font-medium tabular-nums', small ? 'w-6 text-sm' : 'w-8')} aria-live="polite">
        {value}
      </span>
      <button type="button" className={btn} onClick={() => onChange(value + 1)} disabled={value >= max} aria-label="Increase quantity">
        <Plus className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
