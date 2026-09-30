'use client';

import { useState } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { adminCustomers } from '@/lib/admin-php';
import { cn, formatDate } from '@/lib/format';
import { AdminTitle } from './AdminLayout';

export default function AdminCustomers() {
  const [search, setSearch] = useState('');
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const { data, isLoading, isFetching, error } = useQuery({
    queryKey: ['admin', 'customers', q, page],
    queryFn: () => adminCustomers(q, page),
    placeholderData: keepPreviousData,
  });

  return (
    <>
      <AdminTitle title="Customers">
        <form
          className="relative w-full sm:w-auto"
          onSubmit={(e) => {
            e.preventDefault();
            setQ(search.trim());
            setPage(1);
          }}
        >
          <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-muted" />
          <input className="input h-10 w-full py-0 pl-10 text-sm sm:w-64" placeholder="Name, email or phone" value={search} onChange={(e) => setSearch(e.target.value)} />
        </form>
      </AdminTitle>

      {error && <p className="mb-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error.message}</p>}
      {isLoading ? (
        <Skeleton className="h-72" />
      ) : (
        <div className={cn('card overflow-x-auto transition-opacity', isFetching && 'opacity-60')}>
          <table className="w-full min-w-[640px] text-sm">
            <thead className="border-b border-line text-left text-xs tracking-wider text-muted uppercase">
              <tr>
                <th className="px-5 py-3 font-medium">Customer</th>
                <th className="px-5 py-3 font-medium">Phone</th>
                <th className="px-5 py-3 font-medium">Orders</th>
                <th className="px-5 py-3 font-medium">Joined</th>
                <th className="px-5 py-3 text-right font-medium">Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {data?.items.map((c) => (
                <tr key={c.id}>
                  <td className="px-5 py-3">
                    <p className="font-medium text-maroon">{c.name}</p>
                    <a href={`mailto:${c.email}`} className="text-xs text-muted hover:underline">
                      {c.email}
                    </a>
                  </td>
                  <td className="px-5 py-3">{c.phone ? <a href={`tel:${c.phone}`}>{c.phone}</a> : '—'}</td>
                  <td className="px-5 py-3">{c.orderCount}</td>
                  <td className="px-5 py-3 text-xs">{c.createdAt ? formatDate(c.createdAt) : '—'}</td>
                  <td className="px-5 py-3 text-right text-xs">
                    <span className={cn('rounded-full px-2.5 py-1', c.role === 'admin' ? 'bg-gold/20 text-maroon' : 'bg-sand')}>{c.role}</span>
                  </td>
                </tr>
              ))}
              {data?.items.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-muted">
                    No customers found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
      {(data?.pages ?? 1) > 1 && (
        <div className="mt-4 flex items-center justify-end gap-2 text-sm">
          <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage(page - 1)}>
            Previous
          </Button>
          <span className="text-muted">
            Page {page} of {data?.pages} · {data?.total} customers
          </span>
          <Button size="sm" variant="outline" disabled={page >= (data?.pages ?? 1)} onClick={() => setPage(page + 1)}>
            Next
          </Button>
        </div>
      )}
    </>
  );
}
