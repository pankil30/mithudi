'use client';

import { useState } from 'react';
import { useSearchParamsState } from '@/hooks/useSearchParamsState';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/Skeleton';
import { AnimatePresence, motion } from 'framer-motion';
import { Search, X } from 'lucide-react';
import { toast } from 'sonner';
import { OrderView, STATUS_LABEL, StatusPill } from '@/components/account/OrderView';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { adminOrderDetails, adminOrders, adminUpdateOrder } from '@/lib/admin-php';
import { cn, formatDate, formatINR } from '@/lib/format';
import type { Order, OrderStatus } from '@/lib/types';
import { AdminTitle } from './AdminLayout';

const STATUSES: OrderStatus[] = ['PENDING', 'CONFIRMED', 'PACKED', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

function OrderPanel({ order: row, onClose }: { order: Order; onClose: () => void }) {
  const qc = useQueryClient();
  // full order (items + address) if admin/orders.php supports ?id=…, else the list row
  const { data: full, isLoading } = useQuery({ queryKey: ['admin', 'order', row.id], queryFn: () => adminOrderDetails(row.id) });
  const order: Order = full && (full.items.length || !row.items.length) ? { ...row, ...full, name: full.name || row.name, phone: full.phone || row.phone, email: full.email || row.email } : row;
  const [status, setStatus] = useState<OrderStatus>(order.status);
  const [courier, setCourier] = useState(order.courier ?? '');
  const [tracking, setTracking] = useState(order.trackingNumber ?? '');
  const [note, setNote] = useState('');
  const save = useMutation({
    mutationFn: () => adminUpdateOrder(row.id, { status, courier: courier || undefined, trackingNumber: tracking || undefined, note: note || undefined }),
    onSuccess: () => {
      toast.success('Order updated');
      qc.invalidateQueries({ queryKey: ['admin'] });
      onClose();
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : 'Update failed'),
  });
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-ink/30" onClick={onClose}>
      <motion.aside
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ ease: [0.22, 1, 0.36, 1], duration: 0.45 }}
        onClick={(e) => e.stopPropagation()}
        className="absolute top-0 right-0 h-full w-full max-w-xl overflow-y-auto bg-cream p-6 shadow-lift"
      >
        <div className="mb-4 flex justify-end">
          <button onClick={onClose} className="rounded-full p-2 hover:bg-maroon/5" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>
        {isLoading ? <Skeleton className="h-64" /> : <OrderView order={order} hideCancel />}
        <p className="mt-4 text-sm text-muted">
          {order.email}
          {order.events.length > 0 && ' · History: ' + order.events.map((e) => `${STATUS_LABEL[e.status]}${e.note ? ` (${e.note})` : ''}`).join(' → ')}
        </p>
        <form
          className="card mt-6 grid gap-4 p-5 sm:grid-cols-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (status === 'CANCELLED' && order.status !== 'CANCELLED' && !confirm('Cancel this order?')) return;
            save.mutate();
          }}
        >
          <div className="sm:col-span-2">
            <label className="label" htmlFor="status">
              Status
            </label>
            <select id="status" className="input" value={status} onChange={(e) => setStatus(e.target.value as OrderStatus)} disabled={order.status === 'CANCELLED'}>
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABEL[s]}
                </option>
              ))}
            </select>
          </div>
          <Field label="Courier" value={courier} onChange={(e) => setCourier(e.target.value)} placeholder="Delhivery, Blue Dart…" />
          <Field label="Tracking number" value={tracking} onChange={(e) => setTracking(e.target.value)} />
          <Field className="sm:col-span-2" label="Note (internal / timeline)" value={note} onChange={(e) => setNote(e.target.value)} />
          <Button className="sm:col-span-2" loading={save.isPending} disabled={order.status === 'CANCELLED'}>
            Save changes
          </Button>
        </form>
      </motion.aside>
    </motion.div>
  );
}

export default function AdminOrders() {
  const [params, setParams] = useSearchParamsState();
  const status = params.get('status') ?? '';
  const q = params.get('q') ?? '';
  const [search, setSearch] = useState(q);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Order | null>(null);
  const { data, isFetching, isLoading, error } = useQuery({
    queryKey: ['admin', 'orders', status, q, page],
    queryFn: () => adminOrders({ status: status as OrderStatus | '', q, page }),
    placeholderData: keepPreviousData,
  });
  const set = (k: string, v: string) => {
    const next = new URLSearchParams(params);
    if (v) next.set(k, v);
    else next.delete(k);
    setParams(next, { replace: true });
    setPage(1);
  };
  const pages = data?.pages ?? 1;

  return (
    <>
      <AdminTitle title="Orders">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            set('q', search.trim());
          }}
          className="relative w-full sm:w-auto"
        >
          <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-muted" />
          <input className="input h-10 w-full py-0 pl-10 text-sm sm:w-64" placeholder="Order no., name, phone, email" value={search} onChange={(e) => setSearch(e.target.value)} />
        </form>
      </AdminTitle>
      <div className="no-scrollbar mb-4 flex gap-2 overflow-x-auto">
        {['', ...STATUSES].map((s) => (
          <button key={s || 'all'} onClick={() => set('status', s)} className={cn('shrink-0 rounded-full px-4 py-1.5 text-sm', status === s ? 'bg-maroon text-cream' : 'bg-white ring-1 ring-line')}>
            {s ? STATUS_LABEL[s as OrderStatus] : 'All'}
          </button>
        ))}
      </div>
      {error && <p className="mb-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error.message}</p>}
      {isLoading && <Skeleton className="h-72" />}
      <div className={cn('card overflow-x-auto transition-opacity', isFetching && 'opacity-60', isLoading && 'hidden')}>
        <table className="w-full min-w-[720px] text-sm">
          <thead className="border-b border-line text-left text-xs tracking-wider text-muted uppercase">
            <tr>
              <th className="px-5 py-3 font-medium">Order</th>
              <th className="px-5 py-3 font-medium">Customer</th>
              <th className="px-5 py-3 font-medium">Items</th>
              <th className="px-5 py-3 font-medium">Total</th>
              <th className="px-5 py-3 font-medium">Payment</th>
              <th className="px-5 py-3 text-right font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {data?.items.map((o) => (
              <tr key={o.id} onClick={() => setSelected(o)} className="cursor-pointer hover:bg-white">
                <td className="px-5 py-3">
                  <p className="font-medium text-maroon">{o.orderNumber}</p>
                  <p className="text-xs text-muted">{formatDate(o.createdAt)}</p>
                </td>
                <td className="px-5 py-3">
                  {o.name || '—'}
                  <p className="text-xs text-muted">{[o.phone, o.shippingAddress.city].filter(Boolean).join(' · ')}</p>
                </td>
                <td className="px-5 py-3">{o.itemCount ?? o.items.reduce((s, i) => s + i.quantity, 0)}</td>
                <td className="px-5 py-3">{formatINR(o.total)}</td>
                <td className="px-5 py-3 text-xs">
                  {o.paymentMethod === 'COD' ? 'COD' : 'Online'} · <span className={o.paymentStatus === 'PAID' ? 'text-leaf-deep' : 'text-muted'}>{o.paymentStatus.toLowerCase()}</span>
                </td>
                <td className="px-5 py-3 text-right">
                  <StatusPill status={o.status} />
                </td>
              </tr>
            ))}
            {data?.items.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-12 text-center text-muted">
                  No orders found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {pages > 1 && (
        <div className="mt-4 flex items-center justify-end gap-2 text-sm">
          <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage(page - 1)}>
            Previous
          </Button>
          <span className="text-muted">
            Page {page} of {pages}
          </span>
          <Button size="sm" variant="outline" disabled={page >= pages} onClick={() => setPage(page + 1)}>
            Next
          </Button>
        </div>
      )}
      <AnimatePresence>{selected && <OrderPanel order={selected} onClose={() => setSelected(null)} />}</AnimatePresence>
    </>
  );
}
