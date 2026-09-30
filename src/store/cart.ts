import { commerceRules } from '@/data/catalog';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { toast } from 'sonner';
import { artFor, cartApi, type ServerCartLine } from '@/lib/php';
import type { JarArt, Product, Variant } from '@/lib/types';
import { useAuth } from './auth';

export interface CartLine {
  sku: string; // = PHP product id
  slug: string;
  name: string;
  variantLabel: string;
  price: number;
  mrp: number;
  quantity: number;
  image: string | null;
  art: JarArt;
  /** PHP cart row id, once the line is saved on the server */
  cartId?: string;
}

export interface AppliedCoupon {
  code: string;
  discount: number;
  subtotal: number;
}

interface CartState {
  lines: CartLine[];
  open: boolean;
  coupon: AppliedCoupon | null;
  syncing: boolean;
  add: (product: Product, variant: Variant, quantity?: number) => void;
  setQty: (sku: string, quantity: number) => void;
  remove: (sku: string) => void;
  clear: () => void;
  setOpen: (open: boolean) => void;
  setCoupon: (c: AppliedCoupon | null) => void;
  /** Replace local lines with the PHP cart (cart/list.php). */
  pull: () => Promise<void>;
  /** After sign-in: send guest lines to the PHP cart, then pull. */
  syncOnSignIn: () => Promise<void>;
}

export const MAX_QTY = 20;

const signedIn = () => !!useAuth.getState().user;
const fail = (e: unknown) => toast.error(e instanceof Error ? e.message : 'Could not update your bag');

function fromServer(s: ServerCartLine, prev?: CartLine): CartLine {
  return {
    sku: s.productId,
    slug: s.productId,
    name: s.name || prev?.name || 'Mukhvas',
    variantLabel: s.label || prev?.variantLabel || '',
    price: s.price || prev?.price || 0,
    mrp: s.mrp || prev?.mrp || s.price,
    quantity: s.quantity,
    image: s.image ?? prev?.image ?? null,
    art: prev?.art ?? artFor(s.name, s.productId),
    cartId: s.cartId,
  };
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      lines: [],
      open: false,
      coupon: null,
      syncing: false,

      add: (product, variant, quantity = 1) => {
        set((s) => {
          const existing = s.lines.find((l) => l.sku === variant.sku);
          const lines = existing
            ? s.lines.map((l) => (l.sku === variant.sku ? { ...l, quantity: Math.min(MAX_QTY, l.quantity + quantity) } : l))
            : [
                ...s.lines,
                {
                  sku: variant.sku,
                  slug: product.slug,
                  name: product.name,
                  variantLabel: variant.label,
                  price: variant.price,
                  mrp: variant.mrp,
                  quantity: Math.min(MAX_QTY, quantity),
                  image: product.images[0] ?? null,
                  art: product.art,
                },
              ];
          return { lines, open: true };
        });
        if (signedIn()) cartApi.add(variant.sku, quantity).catch(fail).finally(() => get().pull());
      },

      setQty: (sku, quantity) => {
        const line = get().lines.find((l) => l.sku === sku);
        if (quantity <= 0) return get().remove(sku);
        const q = Math.min(MAX_QTY, quantity);
        set((s) => ({ lines: s.lines.map((l) => (l.sku === sku ? { ...l, quantity: q } : l)) }));
        if (signedIn() && line) cartApi.update(line.cartId, sku, q).catch(fail).finally(() => get().pull());
      },

      remove: (sku) => {
        const line = get().lines.find((l) => l.sku === sku);
        set((s) => ({ lines: s.lines.filter((l) => l.sku !== sku) }));
        if (signedIn() && line) cartApi.remove(line.cartId, sku).catch(fail).finally(() => get().pull());
      },

      clear: () => set({ lines: [], coupon: null }),
      setOpen: (open) => set({ open }),
      setCoupon: (coupon) => set({ coupon }),

      pull: async () => {
        if (!signedIn()) return;
        try {
          const server = await cartApi.list();
          const prev = get().lines;
          set({ lines: server.map((s) => fromServer(s, prev.find((l) => l.sku === s.productId))) });
        } catch {
          /* keep local lines if the API is unavailable */
        }
      },

      syncOnSignIn: async () => {
        if (!signedIn() || get().syncing) return;
        set({ syncing: true });
        try {
          const server = await cartApi.list().catch(() => [] as ServerCartLine[]);
          const missing = get().lines.filter((l) => !server.some((s) => s.productId === l.sku));
          for (const l of missing) await cartApi.add(l.sku, l.quantity).catch(() => {});
          await get().pull();
        } finally {
          set({ syncing: false });
        }
      },
    }),
    { name: 'mithudi-cart', skipHydration: true, partialize: (s) => ({ lines: s.lines, coupon: s.coupon }) },
  ),
);

export function cartTotals(lines: CartLine[], coupon: AppliedCoupon | null) {
  const subtotal = lines.reduce((s, l) => s + l.price * l.quantity, 0);
  const savings = lines.reduce((s, l) => s + Math.max(0, l.mrp - l.price) * l.quantity, 0);
  const count = lines.reduce((s, l) => s + l.quantity, 0);
  const discount = coupon && coupon.subtotal === subtotal ? coupon.discount : 0;
  const shipping = subtotal === 0 || subtotal >= commerceRules.freeShippingAbove ? 0 : commerceRules.shippingFee;
  return { subtotal, savings, count, discount, shipping, total: subtotal - discount + shipping };
}
