import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { toast } from 'sonner';
import { wishlistApi } from '@/lib/php';
import { useAuth } from './auth';

interface WishlistState {
  /** PHP product ids */
  slugs: string[];
  toggle: (slug: string) => void;
  /** After sign-in: push local hearts to the account (wishlist/add.php) and adopt the server list. */
  sync: () => Promise<void>;
  reset: () => void;
}

export const useWishlist = create<WishlistState>()(
  persist(
    (set, get) => ({
      slugs: [],
      toggle: (slug) => {
        const has = get().slugs.includes(slug);
        set({ slugs: has ? get().slugs.filter((s) => s !== slug) : [slug, ...get().slugs] });
        if (useAuth.getState().user) {
          (has ? wishlistApi.remove(slug) : wishlistApi.add(slug)).catch((e) => {
            // roll back
            set({ slugs: has ? [slug, ...get().slugs] : get().slugs.filter((s) => s !== slug) });
            toast.error(e instanceof Error ? e.message : 'Could not update wishlist');
          });
        }
      },
      sync: async () => {
        try {
          const server = await wishlistApi.list();
          const local = get().slugs.filter((s) => !server.includes(s));
          await Promise.all(local.map((s) => wishlistApi.add(s).catch(() => {})));
          set({ slugs: Array.from(new Set([...server, ...local])) });
        } catch {
          // keep the local list if the API is unavailable
        }
      },
      reset: () => set({ slugs: [] }),
    }),
    { name: 'mithudi-wishlist', skipHydration: true },
  ),
);
