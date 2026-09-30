'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSearchParamsState } from '@/hooks/useSearchParamsState';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Heart, LayoutDashboard, LogOut, MapPin, Package, Trash2, User as UserIcon } from 'lucide-react';
import { toast } from 'sonner';
import { OrderView, StatusPill } from '@/components/account/OrderView';
import { ProductCard } from '@/components/product/ProductCard';
import { Button, ButtonLink } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { Skeleton } from '@/components/ui/Skeleton';
import { INDIAN_STATES } from '@/data/states';
import { addressApi, authApi, orderApi } from '@/lib/php';
import { cn, formatDate, formatINR } from '@/lib/format';
import { useProducts } from '@/lib/queries';
import type { User } from '@/lib/types';
import { useHydrated } from '@/store/hydration';
import { useAuth } from '@/store/auth';
import { useWishlist } from '@/store/wishlist';

function AuthPanel() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const signIn = useAuth((s) => s.signIn);
  const [params] = useSearchParamsState();
  const router = useRouter();

  async function complete(p: () => Promise<{ token: string; user: User }>) {
    setBusy(true);
    setError('');
    try {
      const { token, user } = await p();
      signIn(token, user);
      toast.success(`Welcome${mode === 'register' ? '' : ' back'}, ${user.name.split(' ')[0]}!`);
      const next = params.get('next');
      if (next?.startsWith('/')) router.replace(next);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card mx-auto max-w-md p-8 sm:p-10">
      <div className="grid grid-cols-2 rounded-full bg-sand p-1 text-sm">
        {(['login', 'register'] as const).map((m) => (
          <button key={m} onClick={() => setMode(m)} className={cn('rounded-full py-2 transition', mode === m ? 'bg-white text-maroon shadow-soft' : 'text-muted')}>
            {m === 'login' ? 'Sign in' : 'Create account'}
          </button>
        ))}
      </div>
      <form
        className="mt-8 space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          const email = form.email.trim();
          complete(() =>
            mode === 'login'
              ? authApi.login(email, form.password)
              : authApi.register({ name: form.name.trim(), email, phone: form.phone.trim(), password: form.password }),
          );
        }}
      >
        {mode === 'register' && <Field label="Full name" autoComplete="name" required minLength={2} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />}
        <Field label="Email" type="email" autoComplete="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        {mode === 'register' && (
          <Field label="Mobile number" type="tel" inputMode="tel" autoComplete="tel" required pattern="[0-9+ ]{10,14}" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        )}
        <Field
          label="Password"
          type="password"
          autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
          required
          minLength={mode === 'register' ? 8 : undefined}
          hint={mode === 'register' ? 'At least 8 characters' : undefined}
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        {error && <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
        <Button size="lg" className="w-full" loading={busy}>
          {mode === 'login' ? 'Sign in' : 'Create account'}
        </Button>
      </form>
      <p className="mt-6 text-center text-xs text-muted">
        Just placed an order as a guest?{' '}
        <Link href="/track" className="text-maroon underline">
          Track it here
        </Link>
      </p>
    </div>
  );
}

function Orders() {
  const { data, isLoading, error } = useQuery({ queryKey: ['orders', 'mine'], queryFn: orderApi.list });
  const [open, setOpen] = useState<string | null>(null);
  if (isLoading) return <Skeleton className="h-40" />;
  if (error) return <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error.message}</p>;
  if (!data?.length)
    return (
      <div className="card p-10 text-center">
        <p className="font-serif text-2xl text-maroon">No orders yet</p>
        <ButtonLink href="/shop" className="mt-5">
          Start shopping
        </ButtonLink>
      </div>
    );
  return (
    <ul className="space-y-4">
      {data.map((o) => (
        <li key={o.id} className="card overflow-hidden">
          <button onClick={() => setOpen(open === o.id ? null : o.id)} className="flex w-full flex-wrap items-center justify-between gap-3 p-5 text-left">
            <span>
              <span className="font-medium text-maroon">{o.orderNumber}</span>
              <span className="block text-xs text-muted">
                {formatDate(o.createdAt)} · {o.itemCount ?? o.items.reduce((s, i) => s + i.quantity, 0)} items · {formatINR(o.total)}
              </span>
            </span>
            <StatusPill status={o.status} />
          </button>
          {open === o.id && (
            <div className="border-t border-line p-5">
              <OrderDetails id={o.id} />
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}

function OrderDetails({ id }: { id: string }) {
  const { data, isLoading, error } = useQuery({ queryKey: ['order', id], queryFn: () => orderApi.details(id) });
  if (isLoading) return <Skeleton className="h-40" />;
  if (error) return <p className="text-sm text-red-700">{error.message}</p>;
  return data ? <OrderView order={data} /> : null;
}

function Wishlist() {
  const slugs = useWishlist((s) => s.slugs);
  const { data = [], isLoading } = useProducts({});
  const items = data.filter((p) => slugs.includes(p.slug));
  if (isLoading) return <Skeleton className="h-40" />;
  if (!items.length)
    return (
      <div className="card p-10 text-center">
        <Heart className="mx-auto h-8 w-8 text-maroon/40" />
        <p className="mt-3 font-serif text-2xl text-maroon">Your wishlist is empty</p>
        <p className="mt-1 text-sm text-muted">Tap the heart on any jar to save it for later.</p>
        <ButtonLink href="/shop" className="mt-5">
          Explore mukhvas
        </ButtonLink>
      </div>
    );
  return (
    <div className="grid grid-cols-1 gap-x-6 gap-y-10 min-[460px]:grid-cols-2 xl:grid-cols-3">
      {items.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}

function Addresses() {
  const qc = useQueryClient();
  const { data = [], isLoading } = useQuery({ queryKey: ['addresses'], queryFn: addressApi.list });
  const [adding, setAdding] = useState(false);
  const [f, setF] = useState({ name: '', phone: '', line1: '', line2: '', city: '', state: 'Gujarat', pincode: '' });
  const add = useMutation({
    mutationFn: () => addressApi.add({ ...f, line2: f.line2 || null, isDefault: data.length === 0 }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['addresses'] });
      setAdding(false);
      toast.success('Address saved');
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : 'Could not save address'),
  });
  const del = useMutation({
    mutationFn: (id: string) => addressApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['addresses'] });
      toast.success('Address removed');
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : 'Could not remove address'),
  });
  if (isLoading) return <Skeleton className="h-40" />;
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        {data.map((a) => (
          <div key={a.id} className="card relative p-5 text-sm">
            {a.isDefault && <span className="absolute top-4 right-4 rounded-full bg-gold/20 px-2 py-0.5 text-[10px] text-maroon uppercase">Default</span>}
            <p className="font-medium text-maroon">{a.name}</p>
            <p className="mt-1 text-muted">
              {a.line1}
              {a.line2 ? `, ${a.line2}` : ''}
              <br />
              {a.city}, {a.state} {a.pincode}
              <br />
              {a.phone}
            </p>
            <button onClick={() => del.mutate(a.id)} disabled={del.isPending} className="mt-3 inline-flex items-center gap-1 text-xs text-muted hover:text-red-600">
              <Trash2 className="h-3.5 w-3.5" /> Remove
            </button>
          </div>
        ))}
      </div>
      {adding ? (
        <form
          className="card grid gap-4 p-6 sm:grid-cols-2"
          onSubmit={(e) => {
            e.preventDefault();
            add.mutate();
          }}
        >
          <Field label="Full name" required value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
          <Field label="Mobile" type="tel" required value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} />
          <Field className="sm:col-span-2" label="House / flat, street" required value={f.line1} onChange={(e) => setF({ ...f, line1: e.target.value })} />
          <Field className="sm:col-span-2" label="Area, landmark" value={f.line2} onChange={(e) => setF({ ...f, line2: e.target.value })} />
          <Field label="City" required value={f.city} onChange={(e) => setF({ ...f, city: e.target.value })} />
          <Field label="PIN code" required inputMode="numeric" maxLength={6} value={f.pincode} onChange={(e) => setF({ ...f, pincode: e.target.value })} />
          <select className="input sm:col-span-2" value={f.state} onChange={(e) => setF({ ...f, state: e.target.value })} aria-label="State">
            {INDIAN_STATES.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
          <div className="flex gap-3 sm:col-span-2">
            <Button loading={add.isPending}>Save address</Button>
            <Button type="button" variant="ghost" onClick={() => setAdding(false)}>
              Cancel
            </Button>
          </div>
        </form>
      ) : (
        <Button variant="outline" onClick={() => setAdding(true)}>
          + Add address
        </Button>
      )}
    </div>
  );
}

function Profile({ user }: { user: User }) {
  const setUser = useAuth((s) => s.setUser);
  useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const u = await authApi.profile();
      if (u.email || u.id) setUser({ ...user, ...u, id: u.id || user.id, role: user.role === 'ADMIN' ? 'ADMIN' : u.role });
      return u;
    },
  });
  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone ?? '');
  const save = useMutation({
    mutationFn: () => authApi.updateProfile({ name, phone: phone || undefined }),
    onSuccess: (u) => {
      setUser(u ? { ...user, ...u, role: user.role } : { ...user, name, phone: phone || null });
      toast.success('Profile updated');
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : 'Could not update profile'),
  });
  return (
    <form
      className="card max-w-lg space-y-4 p-6"
      onSubmit={(e) => {
        e.preventDefault();
        save.mutate();
      }}
    >
      <Field label="Full name" value={name} onChange={(e) => setName(e.target.value)} required />
      <Field label="Email" value={user.email} disabled />
      <Field label="Mobile" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
      <Button loading={save.isPending}>Save changes</Button>
    </form>
  );
}

const TABS = [
  { id: 'orders', label: 'Orders', icon: Package },
  { id: 'wishlist', label: 'Wishlist', icon: Heart },
  { id: 'addresses', label: 'Addresses', icon: MapPin },
  { id: 'profile', label: 'Profile', icon: UserIcon },
] as const;

export default function Account() {
  const { user, signOut } = useAuth();
  const [params, setParams] = useSearchParamsState();
  const tab = (params.get('tab') as (typeof TABS)[number]['id']) || 'orders';
  const hydrated = useHydrated();

  if (!hydrated) {
    return (
      <div className="container-x py-16">
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="bg-gradient-to-b from-cream-deep/70 to-cream py-14 sm:py-20">
        <div className="container-x">
          <div className="mb-10 text-center">
            <p className="eyebrow">My account</p>
            <h1 className="mt-3 text-5xl font-medium">Welcome to the family</h1>
            <p className="mt-3 text-muted">Sign in to track orders, save addresses and keep your wishlist across devices.</p>
          </div>
          <AuthPanel />
          {tab === 'wishlist' && (
            <div className="mt-16">
              <h2 className="mb-8 text-center text-4xl">Saved on this device</h2>
              <Wishlist />
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="container-x py-12 sm:py-16">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">My account</p>
          <h1 className="mt-2 text-5xl font-medium">Namaste, {user.name.split(' ')[0]}</h1>
        </div>
        <div className="flex gap-2">
          {user.role === 'ADMIN' && (
            <ButtonLink href="/admin" variant="gold" size="sm">
              <LayoutDashboard className="h-4 w-4" /> Admin panel
            </ButtonLink>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              signOut();
              toast('Signed out');
            }}
          >
            <LogOut className="h-4 w-4" /> Sign out
          </Button>
        </div>
      </div>
      <div className="no-scrollbar mt-8 flex gap-2 overflow-x-auto border-b border-line">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setParams({ tab: id }, { replace: true })}
            className={cn('flex shrink-0 items-center gap-2 border-b-2 px-4 py-3 text-sm transition', tab === id ? 'border-maroon text-maroon' : 'border-transparent text-muted hover:text-maroon')}
          >
            <Icon className="h-4 w-4" /> {label}
          </button>
        ))}
      </div>
      <div className="mt-8">
        {tab === 'orders' && <Orders />}
        {tab === 'wishlist' && <Wishlist />}
        {tab === 'addresses' && <Addresses />}
        {tab === 'profile' && <Profile user={user} />}
      </div>
    </div>
  );
}
