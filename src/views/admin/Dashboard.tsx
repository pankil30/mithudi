'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, Clock, IndianRupee, Mail, Package, ShoppingCart, Users } from 'lucide-react';
import { StatusPill } from '@/components/account/OrderView';
import { Skeleton } from '@/components/ui/Skeleton';
import { adminStats } from '@/lib/admin-php';
import { formatDate, formatINR } from '@/lib/format';
import { AdminTitle } from './AdminLayout';

export default function Dashboard() {
  const { data, isLoading, error, refetch } = useQuery({ queryKey: ['admin', 'stats'], queryFn: adminStats });
  if (error)
    return (
      <div className="card p-6">
        <p className="text-red-700">{error.message}</p>
        <button onClick={() => refetch()} className="mt-3 text-sm text-maroon underline">
          Try again
        </button>
      </div>
    );
  if (isLoading || !data) return <Skeleton className="h-96" />;

  const cards = [
    { label: 'Revenue', value: formatINR(data.revenue), icon: IndianRupee },
    { label: 'Orders', value: data.orders, icon: ShoppingCart, to: '/admin/orders' },
    { label: 'Pending orders', value: data.pending, icon: Clock, to: '/admin/orders?status=PENDING' },
    { label: 'Customers', value: data.customers, icon: Users, to: '/admin/customers' },
    { label: 'Products', value: data.products, icon: Package, to: '/admin/products' },
    { label: 'Open enquiries', value: data.openEnquiries, icon: Mail, to: '/admin/enquiries' },
  ];

  return (
    <>
      <AdminTitle title="Dashboard" />
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-6">
        {cards.map(({ label, value, icon: Icon, to }) => {
          const inner = (
            <>
              <Icon className="h-5 w-5 text-saffron-deep" />
              <p className="mt-4 truncate font-serif text-2xl text-maroon sm:text-3xl">{value}</p>
              <p className="text-xs text-muted">{label}</p>
            </>
          );
          return to ? (
            <Link key={label} href={to} className="card p-4 transition hover:shadow-lift sm:p-5">
              {inner}
            </Link>
          ) : (
            <div key={label} className="card p-4 sm:p-5">
              {inner}
            </div>
          );
        })}
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[2fr_1fr]">
        <section className="card overflow-hidden">
          <div className="flex items-center justify-between border-b border-line px-5 py-4">
            <h2 className="text-2xl">Recent orders</h2>
            <Link href="/admin/orders" className="text-sm text-saffron-deep underline">
              All orders
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[480px] text-sm">
              <tbody className="divide-y divide-line">
                {data.recentOrders.map((o) => (
                  <tr key={o.id}>
                    <td className="px-5 py-3">
                      <Link href={`/admin/orders?q=${encodeURIComponent(o.id)}`} className="font-medium text-maroon hover:underline">
                        {o.orderNumber}
                      </Link>
                      <p className="text-xs text-muted">{formatDate(o.createdAt)}</p>
                    </td>
                    <td className="px-5 py-3">{o.name || '—'}</td>
                    <td className="px-5 py-3">{formatINR(o.total)}</td>
                    <td className="px-5 py-3 text-right">
                      <StatusPill status={o.status} />
                    </td>
                  </tr>
                ))}
                {data.recentOrders.length === 0 && (
                  <tr>
                    <td className="px-5 py-8 text-center text-muted">No orders yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="card">
          <div className="flex items-center gap-2 border-b border-line px-5 py-4">
            <AlertTriangle className="h-4 w-4 text-saffron-deep" />
            <h2 className="text-2xl">Low stock</h2>
          </div>
          <ul className="divide-y divide-line text-sm">
            {data.lowStock.map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-3 px-5 py-3">
                <Link href={`/admin/products/${p.id}`} className="hover:text-maroon hover:underline">
                  {p.name}
                </Link>
                <span className={p.stock === 0 ? 'font-medium text-red-600' : 'text-maroon'}>{p.stock}</span>
              </li>
            ))}
            {data.lowStock.length === 0 && <li className="px-5 py-8 text-center text-muted">Everything is well stocked.</li>}
          </ul>
        </section>
      </div>
    </>
  );
}
