'use client';

import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MotionConfig } from 'framer-motion';
import { Toaster } from 'sonner';
import { useAuth } from '@/store/auth';
import { useCart } from '@/store/cart';
import { useHydration } from '@/store/hydration';
import { useWishlist } from '@/store/wishlist';

/**
 * Restores cart / auth / wishlist from localStorage after the first client render.
 * Rendered before the page so its effect runs before any other component can write to a store
 * (a write before rehydration would overwrite the saved data).
 */
function StoreHydrator() {
  useEffect(() => {
    useAuth.persist.rehydrate();
    useCart.persist.rehydrate();
    useWishlist.persist.rehydrate();
    useHydration.getState().setHydrated();
  }, []);
  return null;
}

export function AppProviders({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () => new QueryClient({ defaultOptions: { queries: { refetchOnWindowFocus: false, retry: 1 } } }),
  );
  // Signed in: merge guest cart + wishlist into the PHP account. Signed out: clear them.
  useEffect(
    () =>
      useAuth.subscribe((s, prev) => {
        if (s.user && s.user.id !== prev.user?.id) {
          useCart.getState().syncOnSignIn();
          useWishlist.getState().sync();
        }
        if (!s.user && prev.user) {
          useCart.getState().clear();
          useWishlist.getState().reset();
          queryClient.clear();
        }
      }),
    [queryClient],
  );

  // Returning visitor already signed in (stores were rehydrated by <StoreHydrator> just before
  // this effect): refresh cart + wishlist from PHP once.
  useEffect(() => {
    if (!useAuth.getState().user) return;
    useCart.getState().syncOnSignIn();
    useWishlist.getState().sync();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <MotionConfig reducedMotion="user">
        <StoreHydrator />
        {children}
        <Toaster
          position="top-center"
          toastOptions={{ style: { background: '#FDF8F3', color: '#5C2C2C', border: '1px solid #EADCCD', borderRadius: 18, fontFamily: 'Outfit, sans-serif' } }}
        />
      </MotionConfig>
    </QueryClientProvider>
  );
}
