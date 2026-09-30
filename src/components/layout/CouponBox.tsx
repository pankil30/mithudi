'use client';

import { useEffect, useState } from 'react';
import { Check, Tag, X } from 'lucide-react';
import { php } from '@/lib/php';
import { formatINR } from '@/lib/format';
import { useOffers } from '@/lib/queries';
import { useCart } from '@/store/cart';

/**
 * Turn on with NEXT_PUBLIC_ENABLE_COUPONS=1 once orders/create.php applies coupon_code to the order
 * total — otherwise customers would see a discount they are not charged for.
 */
const ENABLED = process.env.NEXT_PUBLIC_ENABLE_COUPONS === '1';

export function CouponBox({ subtotal }: { subtotal: number }) {
  if (!ENABLED) return null;
  return <CouponBoxInner subtotal={subtotal} />;
}

/** Applies a coupon against the current subtotal (coupons/validate.php); re-validates when the cart changes. */
function CouponBoxInner({ subtotal }: { subtotal: number }) {
  const coupon = useCart((s) => s.coupon);
  const setCoupon = useCart((s) => s.setCoupon);
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const offers = useOffers().data ?? [];

  async function apply(c: string, quiet = false) {
    if (!c.trim()) return;
    setBusy(true);
    setError('');
    try {
      const res = await php<{ code: string; discount: number }>('coupons/validate.php', { body: { code: c.trim(), subtotal } });
      setCoupon({ code: res.code, discount: res.discount, subtotal });
      setCode('');
    } catch (e) {
      if (quiet) setCoupon(null);
      setError(e instanceof Error ? e.message : 'Could not apply coupon');
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    if (coupon && coupon.subtotal !== subtotal && subtotal > 0) apply(coupon.code, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subtotal]);

  if (coupon && coupon.subtotal === subtotal) {
    return (
      <div className="flex items-center justify-between rounded-2xl border border-dashed border-leaf bg-leaf/10 px-4 py-3 text-sm">
        <span className="flex items-center gap-2 text-leaf-deep">
          <Check className="h-4 w-4" />
          <strong>{coupon.code}</strong> applied — you save {formatINR(coupon.discount)}
        </span>
        <button onClick={() => setCoupon(null)} className="rounded-full p-1 text-muted hover:bg-white" aria-label="Remove coupon">
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          apply(code);
        }}
        className="flex gap-2"
      >
        <div className="relative flex-1">
          <Tag className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="Coupon code"
            className="input h-11 py-0 pl-10 text-sm uppercase"
            aria-label="Coupon code"
          />
        </div>
        <button disabled={busy || !code} className="h-11 rounded-2xl bg-maroon px-5 text-sm font-medium text-cream disabled:opacity-40">
          {busy ? '…' : 'Apply'}
        </button>
      </form>
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
      {offers.length > 0 && (
        <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto">
          {offers.map((o) => (
            <button
              key={o.code}
              type="button"
              onClick={() => apply(o.code)}
              className="shrink-0 rounded-xl border border-dashed border-gold bg-gold/5 px-3 py-2 text-left text-[11px] leading-snug text-maroon transition hover:bg-gold/15"
            >
              <strong className="tracking-wider">{o.code}</strong>
              <span className="block text-muted">{o.description}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
