'use client';

import type { ReactNode } from 'react';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, Heart, Menu, Search, ShoppingBag, User, X } from 'lucide-react';
import { Logo } from '@/components/brand/Logo';
import { cn } from '@/lib/format';
import { useAuth } from '@/store/auth';
import { cartTotals, useCart } from '@/store/cart';
import { useWishlist } from '@/store/wishlist';
import { collections, mainNav } from './nav';

function IconButton({ label, children, onClick, to, badge }: { label: string; children: ReactNode; onClick?: () => void; to?: string; badge?: number }) {
  const cls = 'relative grid h-10 w-10 place-items-center rounded-full text-maroon transition hover:bg-maroon/5';
  const inner = (
    <>
      {children}
      {!!badge && (
        <motion.span
          key={badge}
          initial={{ scale: 0.4 }}
          animate={{ scale: 1 }}
          className="absolute -top-0.5 -right-0.5 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-saffron px-1 text-[10px] font-semibold text-maroon-deep"
        >
          {badge}
        </motion.span>
      )}
    </>
  );
  return to ? (
    <Link href={to} className={cls} aria-label={label}>
      {inner}
    </Link>
  ) : (
    <button type="button" className={cls} aria-label={label} onClick={onClick}>
      {inner}
    </button>
  );
}

function SearchOverlay({ onClose }: { onClose: () => void }) {
  const [q, setQ] = useState('');
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => {
    input.current?.focus();
  }, []);
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[70] bg-maroon-deep/30 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.form
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -30, opacity: 0 }}
        transition={{ ease: [0.22, 1, 0.36, 1], duration: 0.45 }}
        onClick={(e) => e.stopPropagation()}
        onSubmit={(e) => {
          e.preventDefault();
          if (q.trim()) router.push(`/shop?q=${encodeURIComponent(q.trim())}`);
          onClose();
        }}
        className="bg-cream px-4 pt-6 pb-8 shadow-lift sm:px-10"
      >
        <div className="mx-auto flex max-w-3xl items-center gap-3 border-b border-maroon/20 pb-3">
          <Search className="h-5 w-5 text-muted" />
          <input
            ref={input}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === 'Escape' && onClose()}
            placeholder="Search paan, saffron, gift boxes…"
            className="flex-1 bg-transparent font-serif text-2xl text-maroon outline-none placeholder:text-muted/50 sm:text-3xl"
            aria-label="Search products"
          />
          <button type="button" onClick={onClose} className="rounded-full p-2 hover:bg-maroon/5" aria-label="Close search">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="mx-auto mt-4 flex max-w-3xl flex-wrap gap-2 text-sm">
          <span className="text-muted">Popular:</span>
          {['Paan', 'Saffron', 'Rose', 'Fennel', 'Gift'].map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => {
                router.push(`/shop?q=${t.toLowerCase()}`);
                onClose();
              }}
              className="rounded-full border border-line px-3 py-1 text-maroon hover:border-maroon/40"
            >
              {t}
            </button>
          ))}
        </div>
      </motion.form>
    </motion.div>
  );
}

function MobileMenu({ onClose }: { onClose: () => void }) {
  const user = useAuth((s) => s.user);
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[70] bg-maroon-deep/30 backdrop-blur-sm lg:hidden" onClick={onClose}>
      <motion.nav
        initial={{ x: '-100%' }}
        animate={{ x: 0 }}
        exit={{ x: '-100%' }}
        transition={{ ease: [0.22, 1, 0.36, 1], duration: 0.5 }}
        onClick={(e) => e.stopPropagation()}
        className="grain flex h-full w-[86%] max-w-sm flex-col overflow-y-auto bg-cream px-6 pt-5 pb-8"
        aria-label="Mobile"
      >
        <div className="flex items-center justify-between">
          <Logo compact />
          <button onClick={onClose} className="rounded-full p-2 hover:bg-maroon/5" aria-label="Close menu">
            <X className="h-5 w-5" />
          </button>
        </div>
        <p className="eyebrow mt-8">Collections</p>
        <ul className="mt-3 grid grid-cols-2 gap-2">
          {collections.map((c) => (
            <li key={c.slug}>
              <Link href={`/shop?category=${c.slug}`} onClick={onClose} className="block rounded-2xl bg-white/70 px-3 py-3 ring-1 ring-line">
                <span className="block font-serif text-lg text-maroon">{c.name}</span>
                <span className="text-[11px] text-muted">{c.note}</span>
              </Link>
            </li>
          ))}
        </ul>
        <ul className="mt-6 divide-y divide-line border-y border-line">
          {mainNav.map((n) => (
            <li key={n.to}>
              <Link href={n.to} onClick={onClose} className="block py-3.5 font-serif text-2xl text-maroon">
                {n.label}
              </Link>
            </li>
          ))}
        </ul>
        <div className="mt-auto space-y-2 pt-8 text-sm">
          <Link href="/account" onClick={onClose} className="flex items-center gap-2 text-maroon">
            <User className="h-4 w-4" /> {user ? `Hi, ${user.name.split(' ')[0]}` : 'Sign in / Create account'}
          </Link>
          <Link href="/account?tab=wishlist" onClick={onClose} className="flex items-center gap-2 text-maroon">
            <Heart className="h-4 w-4" /> Wishlist
          </Link>
        </div>
      </motion.nav>
    </motion.div>
  );
}

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menu, setMenu] = useState(false);
  const [search, setSearch] = useState(false);
  const [mega, setMega] = useState(false);
  const pathname = usePathname();
  const lines = useCart((s) => s.lines);
  const setOpen = useCart((s) => s.setOpen);
  const wish = useWishlist((s) => s.slugs.length);
  const count = cartTotals(lines, null).count;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  useEffect(() => {
    setMega(false);
  }, [pathname]);

  return (
    <>
      <header
        className={cn(
          'sticky top-0 z-50 transition-all duration-500',
          scrolled ? 'bg-cream/85 shadow-[0_1px_0_rgb(234_220_205)] backdrop-blur-xl' : 'bg-cream',
        )}
        onMouseLeave={() => setMega(false)}
      >
        <div className={cn('container-x flex items-center justify-between gap-4 transition-all duration-500', scrolled ? 'h-16' : 'h-[76px]')}>
          <div className="flex items-center gap-1 lg:hidden">
            <IconButton label="Open menu" onClick={() => setMenu(true)}>
              <Menu className="h-5 w-5" />
            </IconButton>
            <IconButton label="Search" onClick={() => setSearch(true)}>
              <Search className="h-[18px] w-[18px]" />
            </IconButton>
          </div>

          <Link href="/" aria-label="મીઠુડી મુખવાસ home" className="shrink-0">
            <Logo compact={scrolled} />
          </Link>

          <nav className="hidden items-center gap-7 text-[13px] font-medium tracking-wide text-maroon lg:flex" aria-label="Main">
            <button
              type="button"
              className="flex items-center gap-1 py-6 transition hover:text-saffron-deep"
              onMouseEnter={() => setMega(true)}
              onClick={() => setMega((m) => !m)}
              aria-expanded={mega}
            >
              Collections <ChevronDown className={cn('h-3.5 w-3.5 transition', mega && 'rotate-180')} />
            </button>
            {mainNav.map((n) => (
              <Link
                key={n.to}
                href={n.to}
                onMouseEnter={() => setMega(false)}
                className={cn('link-underline py-1 transition hover:text-saffron-deep', (pathname === n.to || pathname?.startsWith(`${n.to}/`)) && 'text-saffron-deep')}
              >
                {n.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-0.5">
            <span className="hidden lg:block">
              <IconButton label="Search" onClick={() => setSearch(true)}>
                <Search className="h-[18px] w-[18px]" />
              </IconButton>
            </span>
            <span className="hidden sm:block">
              <IconButton label="Account" to="/account">
                <User className="h-[18px] w-[18px]" />
              </IconButton>
            </span>
            <span className="hidden sm:block">
              <IconButton label="Wishlist" to="/account?tab=wishlist" badge={wish}>
                <Heart className="h-[18px] w-[18px]" />
              </IconButton>
            </span>
            <IconButton label={`Open cart, ${count} items`} onClick={() => setOpen(true)} badge={count}>
              <ShoppingBag className="h-[18px] w-[18px]" />
            </IconButton>
          </div>
        </div>

        <AnimatePresence>
          {mega && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-x-0 top-full hidden border-t border-line bg-cream/95 shadow-lift backdrop-blur-xl lg:block"
            >
              <div className="container-x grid grid-cols-5 gap-4 py-8">
                {collections.map((c) => (
                  <Link key={c.slug} href={`/shop?category=${c.slug}`} onClick={() => setMega(false)} className="group rounded-3xl p-5 transition hover:bg-white">
                    <span className="block font-serif text-2xl text-maroon group-hover:text-saffron-deep">{c.name}</span>
                    <span className="mt-1 block text-xs text-muted">{c.note}</span>
                    <span className="mt-4 inline-block text-[11px] tracking-[0.2em] text-saffron-deep uppercase">Explore →</span>
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <AnimatePresence>{menu && <MobileMenu onClose={() => setMenu(false)} />}</AnimatePresence>
      <AnimatePresence>{search && <SearchOverlay onClose={() => setSearch(false)} />}</AnimatePresence>
    </>
  );
}
