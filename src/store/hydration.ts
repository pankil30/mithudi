'use client';

import { create } from 'zustand';

/**
 * Persisted stores (cart, auth, wishlist) use `skipHydration` so the server HTML and the first
 * client render match. <AppProviders> rehydrates them after mount and flips this flag.
 */
export const useHydration = create<{ hydrated: boolean; setHydrated: () => void }>()((set) => ({
  hydrated: false,
  setHydrated: () => set({ hydrated: true }),
}));

export const useHydrated = () => useHydration((s) => s.hydrated);
