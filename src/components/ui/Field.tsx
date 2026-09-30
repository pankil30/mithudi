'use client';

import { forwardRef, useId, type InputHTMLAttributes, type TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/format';

export const Field = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement> & { label: string; hint?: string; error?: string }>(
  function Field({ label, hint, error, className, id, ...rest }, ref) {
    const auto = useId();
    const fid = id ?? auto;
    return (
      <div className={className}>
        <label htmlFor={fid} className="label">
          {label}
          {rest.required && <span className="text-saffron-deep"> *</span>}
        </label>
        <input ref={ref} id={fid} className={cn('input', error && 'border-red-400')} aria-invalid={!!error} {...rest} />
        {(error || hint) && <p className={cn('mt-1.5 text-xs', error ? 'text-red-600' : 'text-muted')}>{error || hint}</p>}
      </div>
    );
  },
);

export function TextArea({ label, className, id, ...rest }: TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string }) {
  const auto = useId();
  const fid = id ?? auto;
  return (
    <div className={className}>
      <label htmlFor={fid} className="label">
        {label}
      </label>
      <textarea id={fid} className="input min-h-28 resize-y" {...rest} />
    </div>
  );
}
