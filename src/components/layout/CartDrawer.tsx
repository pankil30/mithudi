'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { ShoppingBag, Trash2, X } from 'lucide-react';
import { JarSvg } from '@/components/art/Jar';
import { cloudinary } from '@/components/art/ProductMedia';
import { Button, ButtonLink } from '@/components/ui/Button';
import { QtyStepper } from '@/components/ui/QtyStepper';
import { formatINR } from '@/lib/format';
import { cartTotals, useCart, type CartLine } from '@/store/cart';
import { CouponBox } from './CouponBox';
import { FreeShippingProgress } from './FreeShippingProgress';

export function LineThumb({ line, className = 'h-20 w-16' }: { line: Pick<CartLine, 'image' | 'art' | 'name'>; className?: string }) {
  return (
    <div className={`${className} shrink-0 overflow-hidden rounded-2xl bg-gradient-to-b from-sand to-cream-deep ring-1 ring-line`}>
      {line.image ? (
        <img src={cloudinary(line.image, 160)} alt="" className="h-full w-full object-cover" loading="lazy" />
      ) : (
        <JarSvg art={line.art} name={line.name} className="h-full w-full p-1.5" />
      )}
    </div>
  );
}

export function CartDrawer() {
  const { lines, open, setOpen, setQty, remove, coupon } = useCart();
  const totals = cartTotals(lines, coupon);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname, setOpen]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [open, setOpen]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[80]" role="dialog" aria-modal="true" aria-label="Your cart">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-maroon-deep/35 backdrop-blur-[2px]" onClick={() => setOpen(false)} />
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ ease: [0.22, 1, 0.36, 1], duration: 0.55 }}
            className="grain absolute top-0 right-0 flex h-full w-full max-w-md flex-col bg-cream shadow-lift"
          >
            <div className="flex items-center justify-between border-b border-line px-6 py-5">
              <h2 className="text-3xl font-medium">
                Your Bag <span className="font-sans text-sm text-muted">({totals.count})</span>
              </h2>
              <button onClick={() => setOpen(false)} className="rounded-full p-2 hover:bg-maroon/5" aria-label="Close cart">
                <X className="h-5 w-5" />
              </button>
            </div>

            {lines.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
                <div className="grid h-20 w-20 place-items-center rounded-full bg-sand">
                  <ShoppingBag className="h-8 w-8 text-maroon/60" />
                </div>
                <p className="mt-5 font-serif text-2xl text-maroon">Your bag is waiting</p>
                <p className="mt-2 text-sm text-muted">A spoonful of something sweet after every meal — start with our bestsellers.</p>
                <ButtonLink href="/shop" className="mt-6">
                  Browse the collection
                </ButtonLink>
              </div>
            ) : (
              <>
                <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
                  <FreeShippingProgress subtotal={totals.subtotal} />
                  <ul className="divide-y divide-line">
                    <AnimatePresence initial={false}>
                      {lines.map((l) => (
                        <motion.li key={l.sku} layout exit={{ opacity: 0, x: 40 }} className="flex gap-4 py-4">
                          <Link href={`/product/${l.slug}`}>
                            <LineThumb line={l} />
                          </Link>
                          <div className="flex min-w-0 flex-1 flex-col">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <Link href={`/product/${l.slug}`} className="font-serif text-lg leading-tight text-maroon hover:text-saffron-deep">
                                  {l.name}
                                </Link>
                                <p className="text-xs text-muted">{l.variantLabel}</p>
                              </div>
                              <button onClick={() => remove(l.sku)} className="rounded-full p-1.5 text-muted hover:bg-maroon/5 hover:text-maroon" aria-label={`Remove ${l.name}`}>
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                            <div className="mt-auto flex items-center justify-between pt-2">
                              <QtyStepper small value={l.quantity} onChange={(n) => setQty(l.sku, n)} />
                              <span className="text-sm font-medium text-maroon">{formatINR(l.price * l.quantity)}</span>
                            </div>
                          </div>
                        </motion.li>
                      ))}
                    </AnimatePresence>
                  </ul>
                  <CouponBox subtotal={totals.subtotal} />
                </div>
                <div className="space-y-2 border-t border-line bg-white/60 px-6 pt-4 pb-6 text-sm">
                  <Row label="Subtotal" value={formatINR(totals.subtotal)} />
                  {totals.discount > 0 && <Row label={`Coupon (${coupon!.code})`} value={`− ${formatINR(totals.discount)}`} green />}
                  <Row label="Shipping" value={totals.shipping ? formatINR(totals.shipping) : 'Free'} green={!totals.shipping} />
                  <div className="flex items-baseline justify-between pt-2">
                    <span className="font-serif text-xl text-maroon">Total</span>
                    <span className="font-serif text-2xl text-maroon">{formatINR(totals.total)}</span>
                  </div>
                  {totals.savings > 0 && <p className="text-right text-xs text-leaf-deep">You save {formatINR(totals.savings + totals.discount)} on MRP</p>}
                  <Button size="lg" className="mt-3 w-full" onClick={() => router.push('/checkout')}>
                    Checkout securely
                  </Button>
                  <p className="text-center text-[11px] text-muted">Cash on Delivery · Sign in required at checkout</p>
                </div>
              </>
            )}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}

function Row({ label, value, green }: { label: string; value: string; green?: boolean }) {
  return (
    <div className="flex justify-between text-muted">
      <span>{label}</span>
      <span className={green ? 'text-leaf-deep' : 'text-ink'}>{value}</span>
    </div>
  );
}
