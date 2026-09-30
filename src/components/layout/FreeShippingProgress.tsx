'use client';

import { commerceRules } from '@/data/catalog';
import { motion } from 'framer-motion';
import { Truck } from 'lucide-react';
import { formatINR } from '@/lib/format';

export function FreeShippingProgress({ subtotal }: { subtotal: number }) {
  const target = commerceRules.freeShippingAbove;
  const remaining = Math.max(0, target - subtotal);
  const pct = Math.min(100, (subtotal / target) * 100);
  return (
    <div className="rounded-2xl bg-white/70 p-3.5 ring-1 ring-line">
      <p className="flex items-center gap-2 text-[13px] text-maroon">
        <Truck className="h-4 w-4 text-leaf-deep" />
        {remaining > 0 ? (
          <span>
            You’re <strong className="font-semibold">{formatINR(remaining)}</strong> away from free shipping
          </span>
        ) : (
          <span className="font-medium text-leaf-deep">Yay! Your order ships free.</span>
        )}
      </p>
      <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-sand">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-saffron to-leaf"
          initial={false}
          animate={{ width: `${pct}%` }}
          transition={{ type: 'spring', stiffness: 120, damping: 20 }}
        />
      </div>
    </div>
  );
}
