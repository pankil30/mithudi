'use client';

import type { ReactNode } from 'react';
import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { ArrowUpRight, FolderTree, LayoutDashboard, LogOut, Mail, Package, ShoppingCart, Tag, Users } from 'lucide-react';
import { Logo } from '@/components/brand/Logo';
import { adminMe } from '@/lib/admin-php';
import { PhpError } from '@/lib/php';
import { cn } from '@/lib/format';
import { Skeleton } from '@/components/ui/Skeleton';
import { useHydrated } from '@/store/hydration';
import { useAuth } from '@/store/auth';

const NAV = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/orders', label: 'Orders', icon: ShoppingCart },
  { to: '/admin/products', label: 'Products', icon: Package },
  { to: '/admin/categories', label: 'Categories', icon: FolderTree },
  { to: '/admin/customers', label: 'Customers', icon: Users },
  { to: '/admin/coupons', label: 'Coupons', icon: Tag },
  { to: '/admin/enquiries', label: 'Enquiries', icon: Mail },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { user, signOut, setUser } = useAuth();
  const pathname = usePathname() ?? '/admin';
  const router = useRouter();
  const hydrated = useHydrated();
  // Re-check with the server (admin/me.php) — the stored user could be stale or not an admin.
  const me = useQuery({ queryKey: ['admin', 'me'], queryFn: adminMe, enabled: !!user, retry: false });
  useEffect(() => {
    if (me.data && user && (me.data.role !== user.role || me.data.name !== user.name)) setUser({ ...user, ...me.data });
  }, [me.data, user, setUser]);
  const notAdmin = me.error instanceof PhpError && (me.error.status === 403 || me.error.status === 401);

  useEffect(() => {
    if (hydrated && !user) router.replace(`/account?next=${encodeURIComponent(pathname)}`);
  }, [hydrated, user, pathname, router]);

  if (!hydrated || !user || (me.isLoading && user.role !== 'ADMIN'))
    return (
      <div className="grid min-h-dvh place-items-center bg-cream">
        <Skeleton className="h-10 w-48" />
      </div>
    );
  if (notAdmin || (user.role !== 'ADMIN' && !me.data))
    return (
      <div className="grid min-h-dvh place-items-center bg-cream p-6 text-center">
        <div>
          <h1 className="text-4xl">Admins only</h1>
          <p className="mt-2 text-muted">This area is for store administrators. Sign in with the admin account.</p>
          <button onClick={signOut} className="mt-4 text-sm text-maroon underline">
            Sign out
          </button>
          <Link href="/" className="mt-6 inline-block text-maroon underline">
            Back to the store
          </Link>
        </div>
      </div>
    );

  return (
    <div className="min-h-dvh bg-[#FAF4EE] lg:grid lg:grid-cols-[240px_1fr]">
      <aside className="sticky top-0 z-30 flex items-center gap-2 border-b border-line bg-cream px-4 py-3 lg:h-dvh lg:flex-col lg:items-stretch lg:border-r lg:border-b-0 lg:px-4 lg:py-6">
        <Link href="/admin" className="hidden px-2 lg:block">
          <Logo compact />
          <span className="mt-1 block pl-11 text-[10px] tracking-[0.25em] text-muted uppercase">Admin</span>
        </Link>
        <nav className="no-scrollbar flex flex-1 gap-1 overflow-x-auto lg:mt-8 lg:flex-col" aria-label="Admin">
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <Link
              key={to}
              href={to}
              className={cn('flex shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition', (end ? pathname === to : pathname.startsWith(to)) ? 'bg-maroon text-cream' : 'text-maroon hover:bg-maroon/5')}
            >
              <Icon className="h-4 w-4" /> {label}
            </Link>
          ))}
        </nav>
        <button onClick={signOut} className="shrink-0 rounded-xl p-2.5 text-muted hover:text-maroon lg:hidden" aria-label="Sign out">
          <LogOut className="h-4 w-4" />
        </button>
        <div className="hidden space-y-1 border-t border-line pt-4 text-sm lg:block">
          <Link href="/" className="flex items-center gap-2 rounded-xl px-3 py-2 text-muted hover:text-maroon">
            <ArrowUpRight className="h-4 w-4" /> View store
          </Link>
          <button onClick={signOut} className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-muted hover:text-maroon">
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      </aside>
      <main className="min-w-0 p-4 sm:p-8">
        {children}
      </main>
    </div>
  );
}

export function AdminTitle({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
      <h1 className="text-4xl font-medium">{title}</h1>
      {children}
    </div>
  );
}
