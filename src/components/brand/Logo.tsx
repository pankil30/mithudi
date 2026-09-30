'use client';

import { cn } from '@/lib/format';

/** Emblem: a lotus-topped jar in a gold ring. */
export function Emblem({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden>
      <circle cx="24" cy="24" r="22.5" fill="none" stroke="#C9A66B" strokeWidth="1.2" />
      <circle cx="24" cy="24" r="19.5" fill="#5C2C2C" />
      <path d="M24 9c2.2 2.3 2.2 4.8 0 7-2.2-2.2-2.2-4.7 0-7Z" fill="#E8A87C" />
      <path d="M24 16c-2.6-.6-4.6-2.2-5.4-4.6 2.6.2 4.6 1.8 5.4 4.6Zm0 0c2.6-.6 4.6-2.2 5.4-4.6-2.6.2-4.6 1.8-5.4 4.6Z" fill="#C9A66B" />
      <rect x="17" y="18" width="14" height="3" rx="1.2" fill="#C9A66B" />
      <path d="M16 23.5c0-1.3.9-2 2.2-2h11.6c1.3 0 2.2.7 2.2 2V34c0 2.6-2 4-4.6 4h-6.8c-2.6 0-4.6-1.4-4.6-4Z" fill="#FDF8F3" />
      <circle cx="20.5" cy="31" r="1.3" fill="#8BA888" />
      <circle cx="25" cy="34" r="1.3" fill="#E8A87C" />
      <circle cx="27.8" cy="29" r="1.3" fill="#C9A66B" />
      <circle cx="22.8" cy="27.5" r="1" fill="#B8456B" />
    </svg>
  );
}

export function Logo({ className, light, compact }: { className?: string; light?: boolean; compact?: boolean }) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <Emblem className={compact ? 'h-8 w-8' : 'h-9 w-9 sm:h-10 sm:w-10'} />
      <span
        className={cn('brand-gu leading-none font-bold whitespace-nowrap', compact ? 'text-xl' : 'text-[22px] sm:text-2xl', light ? 'text-cream' : 'text-maroon')}
        lang="gu"
      >
        મીઠુડી <span className={light ? 'text-gold-soft' : 'text-saffron-deep'}>મુખવાસ</span>
      </span>
    </span>
  );
}
