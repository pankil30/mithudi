'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Plus, Search } from 'lucide-react';
import { JarSvg } from '@/components/art/Jar';
import { ButtonLink } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { adminCategories, adminProducts } from '@/lib/admin-php';
import { cn, formatINR } from '@/lib/format';
import { AdminTitle } from './AdminLayout';

export default function AdminProducts() {
  const { data = [], isLoading, error } = useQuery({ queryKey: ['admin', 'products'], queryFn: adminProducts });
  const { data: cats = [] } = useQuery({ queryKey: ['admin', 'categories'], queryFn: adminCategories });
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('');
  const catName = (id: string) => cats.find((c) => c.id === id)?.name ?? '';

  const list = useMemo(() => {
    const t = q.trim().toLowerCase();
    return data.filter((p) => (!cat || p.categoryId === cat) && (!t || p.name.toLowerCase().includes(t)));
  }, [data, q, cat]);

  return (
    <>
      <AdminTitle title="Products">
        <ButtonLink href="/admin/products/new" size="sm">
          <Plus className="h-4 w-4" /> New product
        </ButtonLink>
      </AdminTitle>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-muted" />
          <input className="input h-10 py-0 pl-10 text-sm" placeholder="Search products" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <select className="input h-10 py-0 text-sm sm:w-56" value={cat} onChange={(e) => setCat(e.target.value)} aria-label="Category">
          <option value="">All categories</option>
          {cats.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {error && <p className="mb-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error.message}</p>}
      {isLoading ? (
        <Skeleton className="h-96" />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="border-b border-line text-left text-xs tracking-wider text-muted uppercase">
              <tr>
                <th className="px-5 py-3 font-medium">Product</th>
                <th className="px-5 py-3 font-medium">Category</th>
                <th className="px-5 py-3 font-medium">Stock</th>
                <th className="px-5 py-3 font-medium">Price</th>
                <th className="px-5 py-3 text-right font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {list.map((p) => (
                <tr key={p.id} className={cn('hover:bg-white', !p.isActive && 'opacity-60')}>
                  <td className="px-5 py-3">
                    <Link href={`/admin/products/${p.id}`} className="flex items-center gap-3">
                      <span className="h-14 w-12 shrink-0 overflow-hidden rounded-xl bg-sand">
                        {p.images[0] ? <img src={p.images[0]} alt="" className="h-full w-full object-cover" /> : <JarSvg art={p.art} name={p.name} className="h-full w-full p-1" />}
                      </span>
                      <span>
                        <span className="font-medium text-maroon hover:underline">{p.name}</span>
                        <span className="block text-xs text-muted">
                          #{p.id}
                          {p.weight && ` · ${p.weight}`}
                        </span>
                      </span>
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-xs text-muted">{catName(p.categoryId) || '—'}</td>
                  <td className={cn('px-5 py-3', p.stock === 0 ? 'font-medium text-red-600' : p.stock <= 10 ? 'text-saffron-deep' : '')}>{p.stock}</td>
                  <td className="px-5 py-3">
                    {formatINR(p.discountPrice ?? p.price)}
                    {p.discountPrice != null && <span className="ml-1 text-xs text-muted line-through">{formatINR(p.price)}</span>}
                  </td>
                  <td className="px-5 py-3 text-right text-xs">
                    {p.isActive ? <span className="rounded-full bg-leaf/15 px-2.5 py-1 text-leaf-deep">Live</span> : <span className="rounded-full bg-sand px-2.5 py-1">Hidden</span>}
                  </td>
                </tr>
              ))}
              {list.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-muted">
                    {data.length ? 'No products match.' : 'No products yet. Add your first one.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
