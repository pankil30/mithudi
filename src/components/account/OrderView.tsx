'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Check, Circle, X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { orderApi } from '@/lib/php';
import { JarSvg } from '@/components/art/Jar';
import { cloudinary } from '@/components/art/ProductMedia';
import { cn, formatDate, formatINR } from '@/lib/format';
import type { Order, OrderStatus } from '@/lib/types';

const STEPS: { status: OrderStatus; label: string }[] = [
  { status: 'CONFIRMED', label: 'Confirmed' },
  { status: 'PACKED', label: 'Packed' },
  { status: 'SHIPPED', label: 'Shipped' },
  { status: 'DELIVERED', label: 'Delivered' },
];

export const STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING: 'Order placed',
  CONFIRMED: 'Confirmed',
  PACKED: 'Packed',
  SHIPPED: 'Shipped',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
};

export function StatusPill({ status }: { status: OrderStatus }) {
  const tone =
    status === 'DELIVERED' ? 'bg-leaf/20 text-leaf-deep' : status === 'CANCELLED' ? 'bg-red-100 text-red-700' : status === 'PENDING' ? 'bg-saffron/20 text-maroon' : 'bg-gold/20 text-maroon';
  return <span className={cn('rounded-full px-3 py-1 text-[11px] font-medium tracking-wide uppercase', tone)}>{STATUS_LABEL[status]}</span>;
}

export function OrderTimeline({ order }: { order: Order }) {
  if (order.status === 'CANCELLED') {
    return (
      <p className="flex items-center gap-2 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
        <X className="h-4 w-4" /> This order was cancelled. Any online payment is refunded to the original method within 5–7 working days.
      </p>
    );
  }
  const reached = STEPS.findIndex((s) => s.status === order.status);
  return (
    <ol className="grid grid-cols-4">
      {STEPS.map((s, i) => {
        const done = reached >= i;
        return (
          <li key={s.status} className="relative flex flex-col items-center text-center">
            {i > 0 && <span className={cn('absolute top-4 right-1/2 h-0.5 w-full', reached >= i ? 'bg-leaf' : 'bg-line')} />}
            <span className={cn('relative z-10 grid h-8 w-8 place-items-center rounded-full', done ? 'bg-leaf text-white' : 'bg-white text-muted ring-1 ring-line')}>
              {done ? <Check className="h-4 w-4" /> : <Circle className="h-2.5 w-2.5" />}
            </span>
            <span className={cn('mt-2 text-xs', done ? 'text-maroon' : 'text-muted')}>{s.label}</span>
          </li>
        );
      })}
    </ol>
  );
}

const CANCELLABLE: OrderStatus[] = ['PENDING', 'CONFIRMED'];

/** orders/cancel.php */
function CancelOrder({ order }: { order: Order }) {
  const qc = useQueryClient();
  const [asking, setAsking] = useState(false);
  const [reason, setReason] = useState('');
  const cancel = useMutation({
    mutationFn: () => orderApi.cancel(order.id, reason.trim()),
    onSuccess: () => {
      toast.success('Order cancelled');
      qc.invalidateQueries({ queryKey: ['order', order.id] });
      qc.invalidateQueries({ queryKey: ['orders'] });
      setAsking(false);
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : 'Could not cancel the order'),
  });
  if (!CANCELLABLE.includes(order.status)) return null;
  if (!asking)
    return (
      <button onClick={() => setAsking(true)} className="text-sm text-red-700 underline underline-offset-4">
        Cancel this order
      </button>
    );
  return (
    <form
      className="flex flex-wrap items-end gap-3 rounded-2xl bg-red-50 p-4"
      onSubmit={(e) => {
        e.preventDefault();
        cancel.mutate();
      }}
    >
      <label className="min-w-48 flex-1 text-sm">
        <span className="label">Reason (optional)</span>
        <input className="input" value={reason} onChange={(e) => setReason(e.target.value)} />
      </label>
      <Button loading={cancel.isPending} className="bg-red-700 hover:bg-red-800">
        Cancel order
      </Button>
      <Button type="button" variant="ghost" onClick={() => setAsking(false)}>
        Keep order
      </Button>
    </form>
  );
}

export function OrderView({ order, hideCancel }: { order: Order; hideCancel?: boolean }) {
  const a = order.shippingAddress;
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="eyebrow">Order {order.orderNumber}</p>
          <p className="mt-1 text-sm text-muted">Placed on {formatDate(order.createdAt)}</p>
        </div>
        <StatusPill status={order.status} />
      </div>
      <OrderTimeline order={order} />
      {order.trackingNumber && (
        <p className="rounded-2xl bg-cream-deep px-4 py-3 text-sm">
          Shipped with <strong>{order.courier}</strong> · Tracking no. <strong>{order.trackingNumber}</strong>
        </p>
      )}
      <ul className="divide-y divide-line rounded-3xl bg-white/70 px-5 ring-1 ring-line">
        {order.items.map((i) => (
          <li key={`${i.sku}-${i.name}`} className="flex items-center gap-4 py-4">
            <div className="h-16 w-14 shrink-0 overflow-hidden rounded-xl bg-sand">
              {i.image ? <img src={cloudinary(i.image, 120)} alt="" className="h-full w-full object-cover" /> : i.art && <JarSvg art={i.art} name={i.name} className="h-full w-full p-1" />}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-serif text-lg leading-tight text-maroon">{i.name}</p>
              <p className="text-xs text-muted">
                {i.variantLabel ? `${i.variantLabel} × ` : '× '}{i.quantity}
              </p>
            </div>
            <span className="text-sm">{formatINR(i.price * i.quantity)}</span>
          </li>
        ))}
      </ul>
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="text-sm">
          <p className="label">Delivering to</p>
          <p className="text-maroon">{order.name}</p>
          <p className="text-muted">
            {a.line1}
            {a.line2 ? `, ${a.line2}` : ''}
            <br />
            {a.city}, {a.state} {a.pincode}
            <br />
            {order.phone}
          </p>
          {order.notes && <p className="mt-3 text-muted italic">“{order.notes}”</p>}
        </div>
        <dl className="space-y-1.5 text-sm">
          <div className="flex justify-between text-muted">
            <dt>Subtotal</dt>
            <dd>{formatINR(order.subtotal)}</dd>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between text-muted">
              <dt>Coupon {order.couponCode}</dt>
              <dd className="text-leaf-deep">− {formatINR(order.discount)}</dd>
            </div>
          )}
          <div className="flex justify-between text-muted">
            <dt>Shipping</dt>
            <dd>{order.shipping ? formatINR(order.shipping) : 'Free'}</dd>
          </div>
          <div className="flex justify-between border-t border-line pt-2 font-serif text-xl text-maroon">
            <dt>Total</dt>
            <dd>{formatINR(order.total)}</dd>
          </div>
          <p className="text-right text-xs text-muted">
            {order.paymentMethod === 'COD' ? 'Cash on Delivery' : 'Paid online'} · {order.paymentStatus.toLowerCase()}
          </p>
        </dl>
      </div>
      {!hideCancel && <CancelOrder order={order} />}
    </div>
  );
}
