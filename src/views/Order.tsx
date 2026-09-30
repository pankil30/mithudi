'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSearchParamsState } from '@/hooks/useSearchParamsState';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { OrderView } from '@/components/account/OrderView';
import { Button, ButtonLink } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { Skeleton } from '@/components/ui/Skeleton';
import { orderApi } from '@/lib/php';
import { useAuth } from '@/store/auth';
import { useHydrated } from '@/store/hydration';

/** orders/details.php — needs the signed-in user. */
function useOrderDetails(id: string | undefined) {
  const user = useAuth((s) => s.user);
  return useQuery({
    queryKey: ['order', id],
    enabled: !!id && !!user,
    queryFn: () => orderApi.details(id!),
    retry: false,
  });
}

function SignInNotice({ next }: { next: string }) {
  return (
    <div className="card mx-auto mt-10 max-w-xl p-8 text-center">
      <p className="font-serif text-2xl text-maroon">Sign in to see your order</p>
      <p className="mt-2 text-sm text-muted">Orders are linked to your account.</p>
      <ButtonLink href={`/account?next=${encodeURIComponent(next)}`} className="mt-6">
        Sign in
      </ButtonLink>
    </div>
  );
}

/** Thank-you page shown right after checkout (/order/<order id>). */
export function OrderConfirmation({ number }: { number: string }) {
  const hydrated = useHydrated();
  const user = useAuth((s) => s.user);
  const { data: order, isLoading, error } = useOrderDetails(number);

  if (!hydrated)
    return (
      <div className="container-x max-w-3xl py-20">
        <Skeleton className="h-64" />
      </div>
    );
  if (!user)
    return (
      <div className="container-x max-w-3xl py-14">
        <SignInNotice next={`/order/${number}`} />
      </div>
    );
  return (
    <div className="bg-gradient-to-b from-cream-deep/70 to-cream">
      <div className="container-x max-w-3xl py-14 sm:py-20">
        <div className="text-center">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 14 }} className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-leaf text-white shadow-lift">
            <Check className="h-10 w-10" strokeWidth={2.5} />
          </motion.div>
          <p className="eyebrow mt-8">Thank you</p>
          <h1 className="mt-3 text-5xl font-medium sm:text-6xl">Your order is placed</h1>
          <p className="mx-auto mt-4 max-w-md text-muted">We’re roasting, packing and sealing your jars with care. You can follow it any time from My account → Orders.</p>
        </div>
        <div className="card mt-12 p-6 sm:p-8">
          {isLoading && <Skeleton className="h-64" />}
          {error && <p className="text-sm text-red-700">{error.message}</p>}
          {order && <OrderView order={order} />}
        </div>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <ButtonLink href="/shop">Continue shopping</ButtonLink>
          <ButtonLink href="/account?tab=orders" variant="outline">
            View my orders
          </ButtonLink>
        </div>
      </div>
    </div>
  );
}

/** Track an order by its number (orders/details.php). */
export function TrackOrder({ initialNumber = '' }: { initialNumber?: string }) {
  const [params] = useSearchParamsState();
  const hydrated = useHydrated();
  const user = useAuth((s) => s.user);
  const [number, setNumber] = useState(initialNumber || params.get('number') || '');
  const [query, setQuery] = useState<string | undefined>(undefined);
  const { data: order, isFetching, error } = useOrderDetails(query);

  return (
    <div className="container-x max-w-3xl py-14 sm:py-20">
      <div className="text-center">
        <p className="eyebrow">Order status</p>
        <h1 className="mt-3 text-5xl font-medium">Track your order</h1>
        <p className="mt-3 text-muted">Enter your order number, or see all orders in <Link href="/account?tab=orders" className="text-maroon underline">My account</Link>.</p>
      </div>
      {hydrated && !user ? (
        <SignInNotice next="/track" />
      ) : (
        <form
          className="card mx-auto mt-10 grid max-w-md gap-4 p-6 sm:grid-cols-[1fr_auto] sm:items-end"
          onSubmit={(e) => {
            e.preventDefault();
            setQuery(number.trim().replace(/^#/, ''));
          }}
        >
          <Field label="Order number" placeholder="e.g. 42" required value={number} onChange={(e) => setNumber(e.target.value)} />
          <Button loading={isFetching}>Track</Button>
        </form>
      )}
      {error && <p className="mt-6 text-center text-sm text-red-700">{error.message || 'Could not find that order'}</p>}
      {order && (
        <div className="card mt-10 p-6 sm:p-8">
          <OrderView order={order} />
        </div>
      )}
    </div>
  );
}
