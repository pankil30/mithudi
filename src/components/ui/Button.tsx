'use client';

import { forwardRef, type ButtonHTMLAttributes } from 'react';
import Link from 'next/link';
import type { ComponentProps } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/format';

type Variant = 'primary' | 'gold' | 'outline' | 'ghost' | 'light';
type Size = 'sm' | 'md' | 'lg';

const base =
  'relative inline-flex items-center justify-center gap-2 rounded-full font-medium tracking-wide transition-all duration-300 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 select-none';

const variants: Record<Variant, string> = {
  primary: 'bg-maroon text-cream shadow-soft hover:bg-maroon-deep hover:shadow-lift',
  gold: 'bg-gold text-maroon-deep shadow-soft hover:bg-[#bf9a5c] hover:shadow-lift',
  outline: 'border border-maroon/25 text-maroon hover:border-maroon hover:bg-maroon hover:text-cream',
  ghost: 'text-maroon hover:bg-maroon/5',
  light: 'bg-cream text-maroon hover:bg-white shadow-soft',
};

const sizes: Record<Size, string> = {
  sm: 'h-9 px-4 text-[13px]',
  md: 'h-11 px-6 text-sm',
  lg: 'h-13 px-8 text-[15px] py-3.5',
};

export function buttonClass(variant: Variant = 'primary', size: Size = 'md', className?: string) {
  return cn(base, variants[variant], sizes[size], className);
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant, size, loading, className, children, disabled, ...rest },
  ref,
) {
  return (
    <button ref={ref} className={buttonClass(variant, size, className)} disabled={disabled || loading} {...rest}>
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
});

export function ButtonLink({ variant, size, className, ...rest }: ComponentProps<typeof Link> & { variant?: Variant; size?: Size }) {
  return <Link className={buttonClass(variant, size, className)} {...rest} />;
}
