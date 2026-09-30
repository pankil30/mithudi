'use client';

import { cn } from '@/lib/format';

export const Skeleton = ({ className }: { className?: string }) => <div className={cn('animate-pulse rounded-2xl bg-sand/70', className)} />;
