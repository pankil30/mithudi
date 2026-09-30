'use client';

import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ChevronLeft, Lock, Truck, Wallet } from 'lucide-react';
import { toast } from 'sonner';
import { LineThumb } from '@/components/layout/CartDrawer';
import { CouponBox } from '@/components/layout/CouponBox';
import { FreeShippingProgress } from '@/components/layout/FreeShippingProgress';
import { Button, ButtonLink } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { addressApi, orderApi } from '@/lib/php';
import { INDIAN_STATES } from '@/data/states';
import { cn, formatINR } from '@/lib/format';
import type { Address } from '@/lib/types';
import { Skeleton } from '@/components/ui/Skeleton';
import { useHydrated } from '@/store/hydration';
import { useAuth } from '@/store/auth';
import { cartTotals, useCart } from '@/store/cart';

interface Form {
  name: string;
  email: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  pincode: string;
  notes: string;
}

const EMPTY: Form = { name: '', email: '', phone: '', line1: '', line2: '', city: '', state: 'Gujarat', pincode: '', notes: '' };

export function rememberOrder(orderNumber: string, phone: string) {
  try {
    sessionStorage.setItem(`mm-order-${orderNumber}`, phone);
  } catch {
    /* storage unavailable — the confirmation page falls back to asking for the phone */
  }
}

export default function Checkout() {
  const { lines, coupon, clear } = useCart();
  const totals = cartTotals(lines, coupon);
  const user = useAuth((s) => s.user);
  const router = useRouter();
  const hydrated = useHydrated();
  const [form, setForm] = useState<Form>(EMPTY);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const qc = useQueryClient();

  const { data: addresses = [] } = useQuery({ queryKey: ['addresses'], queryFn: addressApi.list, enabled: !!user });
  const [addressId, setAddressId] = useState<string | 'new'>('new');

  useEffect(() => {
    if (user) setForm((f) => ({ ...f, name: f.name || user.name, email: f.email || user.email, phone: f.phone || user.phone || '' }));
  }, [user]);
  useEffect(() => {
    const def = addresses.find((a) => a.isDefault) ?? addresses[0];
    if (def && addressId === 'new' && !form.line1) pickAddress(def);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addresses]);

  function pickAddress(a: Address) {
    setAddressId(a.id);
    setForm((f) => ({ ...f, name: a.name, phone: a.phone, line1: a.line1, line2: a.line2 ?? '', city: a.city, state: a.state, pincode: a.pincode }));
  }

  const upd = (k: keyof Form) => (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    if (['name', 'phone', 'line1', 'line2', 'city', 'state', 'pincode'].includes(k)) setAddressId('new');
  };

  /** addresses/add.php → address id (falls back to finding it in addresses/list.php). */
  async function ensureAddressId(): Promise<string> {
    if (addressId !== 'new') return addressId;
    const input = { name: form.name.trim(), phone: form.phone.trim(), line1: form.line1.trim(), line2: form.line2.trim() || null, city: form.city.trim(), state: form.state, pincode: form.pincode.trim(), isDefault: addresses.length === 0 };
    const id = await addressApi.add(input);
    qc.invalidateQueries({ queryKey: ['addresses'] });
    if (id) return id;
    const fresh = await addressApi.list();
    const found = [...fresh].reverse().find((a) => a.line1 === input.line1 && a.pincode === input.pincode) ?? fresh[fresh.length - 1];
    if (!found) throw new Error('Could not save the delivery address. Please try again.');
    return found.id;
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      // make sure the PHP cart has exactly these lines before placing the order
      await useCart.getState().syncOnSignIn();
      if (!useCart.getState().lines.length) throw new Error('Your bag is empty.');
      const address = await ensureAddressId();
      const orderId = await orderApi.create({ addressId: address, notes: form.notes.trim() || undefined, couponCode: totals.discount > 0 ? coupon?.code : undefined });
      clear();
      qc.invalidateQueries({ queryKey: ['orders'] });
      toast.success('Order placed');
      router.replace(orderId ? `/order/${orderId}` : '/account?tab=orders');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      setBusy(false);
    }
  }

  if (!hydrated) {
    return (
      <div className="container-x py-16">
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container-x py-24 text-center">
        <h1 className="text-5xl">Sign in to checkout</h1>
        <p className="mt-3 text-muted">Your bag is saved. Sign in or create an account to place your order and track it.</p>
        <ButtonLink href="/account?next=/checkout" className="mt-8">
          Sign in / Create account
        </ButtonLink>
      </div>
    );
  }

  if (lines.length === 0) {
    return (
      <div className="container-x py-24 text-center">
        <h1 className="text-5xl">Your bag is empty</h1>
        <p className="mt-3 text-muted">Add a jar or two and come back — we’ll keep the kettle on.</p>
        <ButtonLink href="/shop" className="mt-8">
          Continue shopping
        </ButtonLink>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-b from-cream-deep/60 to-cream">
      <div className="container-x py-8 sm:py-12">
        <Link href="/shop" className="inline-flex items-center gap-1 text-sm text-muted hover:text-maroon">
          <ChevronLeft className="h-4 w-4" /> Continue shopping
        </Link>
        <h1 className="mt-3 text-5xl font-medium">Checkout</h1>

        {(
          <form onSubmit={submit} className="mt-8 grid gap-8 lg:grid-cols-[1fr_420px] lg:gap-12">
            <div className="space-y-6">
              <section className="card p-6 sm:p-8">
                <h2 className="text-3xl">Contact</h2>
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <Field label="Email" type="email" autoComplete="email" required value={form.email} onChange={upd('email')} />
                  <Field label="Mobile number" type="tel" autoComplete="tel" inputMode="tel" required value={form.phone} onChange={upd('phone')} hint="For delivery updates on WhatsApp / SMS" />
                </div>
              </section>

              <section className="card p-6 sm:p-8">
                <h2 className="text-3xl">Delivery address</h2>
                {addresses.length > 0 && (
                  <div className="mt-5 grid gap-2 sm:grid-cols-2">
                    {addresses.map((a) => (
                      <button
                        type="button"
                        key={a.id}
                        onClick={() => pickAddress(a)}
                        className={cn('rounded-2xl border p-4 text-left text-sm transition', addressId === a.id ? 'border-maroon ring-1 ring-maroon' : 'border-line hover:border-maroon/40')}
                      >
                        <span className="font-medium text-maroon">{a.name}</span>
                        <span className="block text-muted">
                          {a.line1}, {a.city} {a.pincode}
                        </span>
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => {
                        setAddressId('new');
                        setForm((f) => ({ ...f, line1: '', line2: '', city: '', pincode: '' }));
                      }}
                      className={cn('rounded-2xl border border-dashed p-4 text-sm text-maroon', addressId === 'new' ? 'border-maroon' : 'border-line')}
                    >
                      + New address
                    </button>
                  </div>
                )}
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <Field className="sm:col-span-2" label="Full name" autoComplete="name" required value={form.name} onChange={upd('name')} />
                  <Field className="sm:col-span-2" label="House / flat, street" autoComplete="address-line1" required value={form.line1} onChange={upd('line1')} />
                  <Field className="sm:col-span-2" label="Area, landmark (optional)" autoComplete="address-line2" value={form.line2} onChange={upd('line2')} />
                  <Field label="City" autoComplete="address-level2" required value={form.city} onChange={upd('city')} />
                  <Field label="PIN code" autoComplete="postal-code" inputMode="numeric" pattern="[1-9][0-9]{5}" maxLength={6} required value={form.pincode} onChange={upd('pincode')} />
                  <div className="sm:col-span-2">
                    <label className="label" htmlFor="state">
                      State
                    </label>
                    <select id="state" className="input" value={form.state} onChange={upd('state')} autoComplete="address-level1">
                      {INDIAN_STATES.map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>
                {addressId === 'new' && <p className="mt-4 text-xs text-muted">This address will be saved to your account.</p>}
                <div className="mt-5">
                  <label className="label" htmlFor="notes">
                    Gift message or delivery note (optional)
                  </label>
                  <textarea id="notes" className="input min-h-20" maxLength={500} value={form.notes} onChange={upd('notes')} placeholder="e.g. Happy Diwali, with love from the Shahs!" />
                </div>
              </section>

              <section className="card p-6 sm:p-8">
                <h2 className="text-3xl">Payment</h2>
                <div className="mt-5">
                  <div className="flex items-center gap-4 rounded-2xl border border-maroon bg-maroon/[0.03] p-4 ring-1 ring-maroon">
                    <Wallet className="h-5 w-5 text-saffron-deep" />
                    <span>
                      <span className="block font-medium text-maroon">Cash on Delivery</span>
                      <span className="text-xs text-muted">Pay when your order arrives</span>
                    </span>
                  </div>
                </div>
              </section>
            </div>

            <aside className="lg:sticky lg:top-24 lg:self-start">
              <div className="card space-y-5 p-6 sm:p-7">
                <h2 className="text-3xl">Order summary</h2>
                <ul className="max-h-72 space-y-4 overflow-y-auto pr-1">
                  {lines.map((l) => (
                    <li key={l.sku} className="flex items-center gap-3">
                      <div className="relative">
                        <LineThumb line={l} className="h-16 w-14" />
                        <span className="absolute -top-1.5 -right-1.5 grid h-5 min-w-5 place-items-center rounded-full bg-maroon px-1 text-[10px] text-cream">{l.quantity}</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-serif text-lg leading-tight text-maroon">{l.name}</p>
                        <p className="text-xs text-muted">{l.variantLabel}</p>
                      </div>
                      <span className="text-sm">{formatINR(l.price * l.quantity)}</span>
                    </li>
                  ))}
                </ul>
                <FreeShippingProgress subtotal={totals.subtotal} />
                <CouponBox subtotal={totals.subtotal} />
                <dl className="space-y-2 border-t border-line pt-4 text-sm">
                  <div className="flex justify-between text-muted">
                    <dt>Subtotal</dt>
                    <dd className="text-ink">{formatINR(totals.subtotal)}</dd>
                  </div>
                  {totals.discount > 0 && (
                    <div className="flex justify-between text-muted">
                      <dt>Coupon ({coupon!.code})</dt>
                      <dd className="text-leaf-deep">− {formatINR(totals.discount)}</dd>
                    </div>
                  )}
                  <div className="flex justify-between text-muted">
                    <dt className="flex items-center gap-1.5">
                      <Truck className="h-3.5 w-3.5" /> Shipping
                    </dt>
                    <dd className={totals.shipping ? 'text-ink' : 'text-leaf-deep'}>{totals.shipping ? formatINR(totals.shipping) : 'Free'}</dd>
                  </div>
                  <div className="flex items-baseline justify-between border-t border-line pt-3">
                    <dt className="font-serif text-2xl text-maroon">Total</dt>
                    <dd className="font-serif text-3xl text-maroon">{formatINR(totals.total)}</dd>
                  </div>
                </dl>
                {error && <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
                <Button size="lg" className="w-full" loading={busy}>
                  <Lock className="h-4 w-4" /> Place order
                </Button>
                <p className="text-center text-[11px] text-muted">By placing your order you agree to our terms & privacy policy.</p>
              </div>
            </aside>
          </form>
        )}
      </div>

    </div>
  );
}
