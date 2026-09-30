/**
 * PHP API adapter — every call to http://mithudi.mooo.com/api/*.php goes through here.
 *
 * The browser calls /api/<endpoint>.php on the same origin; next.config.ts rewrites it to the PHP
 * server, so there are no CORS or http/https mixed-content problems.
 *
 * PHP responses are mapped to the UI types in ./types (Product, Order, Address …). If a PHP
 * field has a different name, add it to the matching pick(...) list below.
 */
import { localProducts } from './catalog';
import type { Address, Category, JarArt, Order, OrderStatus, Product, ProductFilters, Review, User, Variant } from './types';
import { useAuth } from '@/store/auth';

const BASE = ((process.env.NEXT_PUBLIC_API_URL as string | undefined) || '/api').replace(/\/$/, '');
const BODY_FORMAT = process.env.NEXT_PUBLIC_API_BODY_FORMAT === 'form' ? 'form' : 'json';
/** Stored as the token when the PHP login returns a user but no token. */
export const SESSION_TOKEN = 'php-session';

export class PhpError extends Error {
  constructor(
    message: string,
    public status = 0,
    public payload?: unknown,
  ) {
    super(message);
  }
  get isNetwork() {
    return this.status === 0 || this.status >= 502;
  }
}

type Raw = Record<string, any>;

// ───────────────────────── helpers ─────────────────────────
export const num = (v: unknown, d = 0) => {
  const n = typeof v === 'number' ? v : parseFloat(String(v ?? '').replace(/[^0-9.\-]/g, ''));
  return Number.isFinite(n) ? n : d;
};
const str = (v: unknown, d = '') => (v === null || v === undefined ? d : String(v));
const bool = (v: unknown) => v === true || v === 1 || v === '1' || v === 'true' || v === 'yes';

export function pick(o: Raw | null | undefined, ...keys: string[]): any {
  if (!o || typeof o !== 'object') return undefined;
  for (const k of keys) {
    const v = o[k];
    if (v !== undefined && v !== null && v !== '') return v;
  }
  return undefined;
}

const LIST_KEYS = ['items', 'data', 'products', 'categories', 'orders', 'addresses', 'cart', 'cart_items', 'wishlist', 'reviews', 'list', 'results', 'rows'];
export function asArray(v: any, ...keys: string[]): any[] {
  if (Array.isArray(v)) return v;
  if (v && typeof v === 'object') {
    for (const k of [...keys, ...LIST_KEYS]) {
      if (Array.isArray(v[k])) return v[k];
      if (v[k] && typeof v[k] === 'object') {
        const inner = asArray(v[k]);
        if (inner.length) return inner;
      }
    }
  }
  return [];
}

const list = (v: unknown): string[] =>
  Array.isArray(v) ? v.map(String).filter(Boolean) : typeof v === 'string' ? v.split(/[,\n|]/).map((s) => s.trim()).filter(Boolean) : [];

export const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

export function parseLoose(text: string): any {
  const t = text.trim();
  if (!t) return undefined;
  try {
    return JSON.parse(t);
  } catch {
    // PHP notices/warnings printed before the JSON
    const s = t.search(/[{[]/);
    const e = Math.max(t.lastIndexOf('}'), t.lastIndexOf(']'));
    if (s >= 0 && e > s) {
      try {
        return JSON.parse(t.slice(s, e + 1));
      } catch {}
    }
    return undefined;
  }
}

function failed(j: any) {
  if (!j || typeof j !== 'object' || Array.isArray(j)) return false;
  if (j.success === false || j.status === false || j.status === 0) return true;
  if (typeof j.status === 'string' && ['error', 'failed', 'fail'].includes(j.status.toLowerCase())) return true;
  return !!(j.error && j.success !== true && j.data === undefined);
}

function messageOf(j: any): string {
  const m = j?.message ?? j?.msg ?? j?.error ?? j?.errors;
  if (typeof m === 'string') return m;
  if (Array.isArray(m)) return m.join(', ');
  if (m && typeof m === 'object') return Object.values(m).flat().join(', ');
  return '';
}

// ───────────────────────── request ─────────────────────────
interface Opts {
  method?: 'GET' | 'POST';
  query?: Record<string, unknown>;
  body?: Record<string, unknown>;
  /** send user_id + token; requires sign-in */
  auth?: boolean;
  /** return the whole JSON instead of json.data */
  raw?: boolean;
  /** send multipart/form-data (file uploads); used instead of body */
  form?: FormData;
}

const toParams = (o: Record<string, unknown>) => {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(o)) if (v !== undefined && v !== null && v !== '') p.set(k, typeof v === 'boolean' ? (v ? '1' : '0') : String(v));
  return p;
};

export async function php<T = any>(endpoint: string, opts: Opts = {}): Promise<T> {
  const method = opts.method ?? (opts.body || opts.form ? 'POST' : 'GET');
  const { token, user } = useAuth.getState();
  const query = { ...(opts.query ?? {}) };
  const body = { ...(opts.body ?? {}) };

  if (opts.auth) {
    if (!user && !token) throw new PhpError('Please sign in to continue.', 401);
    if (user?.id) {
      if (method === 'GET') query.user_id ??= user.id;
      else if (opts.form) {
        if (!opts.form.has('user_id')) opts.form.append('user_id', String(user.id));
      } else body.user_id ??= user.id;
    }
  }

  const headers: Record<string, string> = { Accept: 'application/json' };
  if (token && token !== SESSION_TOKEN) headers.Authorization = `Bearer ${token}`;
  let payload: string | FormData | undefined;
  if (opts.form) {
    payload = opts.form; // browser sets the multipart boundary
  } else if (method === 'POST') {
    if (BODY_FORMAT === 'form') {
      headers['Content-Type'] = 'application/x-www-form-urlencoded';
      payload = toParams(body).toString();
    } else {
      headers['Content-Type'] = 'application/json';
      payload = JSON.stringify(body);
    }
  }
  const qs = toParams(query).toString();

  let res: Response;
  try {
    res = await fetch(`${BASE}/${endpoint}${qs ? `?${qs}` : ''}`, { method, headers, body: payload, cache: 'no-store' });
  } catch {
    throw new PhpError('We could not reach the store. Check your connection and try again.', 0);
  }
  const text = await res.text();
  const json = parseLoose(text);
  if (json === undefined) {
    throw new PhpError(res.ok ? 'The store sent an unexpected reply. Please try again.' : 'The store is temporarily unavailable. Please try again shortly.', res.ok ? 500 : res.status, text);
  }
  if (!res.ok || failed(json)) {
    if (res.status === 401 && opts.auth) useAuth.getState().signOut();
    throw new PhpError(messageOf(json) || 'Something went wrong. Please try again.', res.status, json);
  }
  if (opts.raw) return json as T;
  return (json && typeof json === 'object' && !Array.isArray(json) && 'data' in json ? json.data ?? json : json) as T;
}

// ───────────────────────── images & art ─────────────────────────
const ORIGIN = (process.env.NEXT_PUBLIC_PHP_ORIGIN || 'http://mithudi.mooo.com').replace(/\/$/, '');
const ORIGIN_HOST = ORIGIN.replace(/^https?:\/\//, '');
const IMAGE_BASE = (process.env.NEXT_PUBLIC_IMAGE_BASE || '/media/api/').replace(/\/$/, '');

export function mediaUrl(p: unknown): string {
  const s = str(p).trim();
  if (!s) return '';
  if (s.startsWith('data:') || s.startsWith('blob:') || s.startsWith('/media/')) return s;
  const m = s.match(/^https?:\/\/([^/]+)(\/.*)?$/i);
  if (m) return m[1] === ORIGIN_HOST ? `/media${m[2] || '/'}` : s;
  return `${IMAGE_BASE}/${s.replace(/^(\.\.\/)+/, '').replace(/^\.?\//, '')}`;
}

/** Illustrated jar used when a product has no photo: matched by name, else a stable pick. */
export function artFor(name: string, id: string): JarArt {
  const n = name.toLowerCase();
  const match = localProducts.find((p) => n.includes(p.name.toLowerCase()) || p.name.toLowerCase().includes(n));
  if (match) return match.art;
  const h = [...`${id}${name}`].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);
  return localProducts[h % localProducts.length].art;
}

// ───────────────────────── normalizers ─────────────────────────
export function toUser(r: Raw = {}): User {
  const role = str(pick(r, 'role', 'user_type', 'type')).toLowerCase();
  return {
    id: str(pick(r, 'id', 'user_id', 'uid')),
    name: str(pick(r, 'name', 'full_name', 'username', 'first_name'), 'Friend'),
    email: str(pick(r, 'email')),
    phone: pick(r, 'phone', 'mobile', 'phone_number') ?? null,
    role: role === 'admin' || bool(pick(r, 'is_admin')) ? 'ADMIN' : 'CUSTOMER',
  };
}

let catCache: Category[] | null = null;

export function toCategory(r: Raw = {}): Category & { id: string } {
  const name = str(pick(r, 'name', 'category_name', 'title'));
  const id = str(pick(r, 'id', 'category_id'));
  return {
    id,
    slug: str(pick(r, 'slug')) || slugify(name) || id,
    name,
    blurb: str(pick(r, 'description', 'blurb', 'tagline')),
    image: mediaUrl(pick(r, 'image', 'image_url', 'icon')) || null,
    _count: pick(r, 'product_count', 'products_count') != null ? { products: num(pick(r, 'product_count', 'products_count')) } : undefined,
  };
}

function toReview(r: Raw = {}): Review {
  return {
    id: str(pick(r, 'id', 'review_id'), Math.random().toString(36).slice(2)),
    name: str(pick(r, 'user_name', 'name', 'customer_name', 'username'), 'Customer'),
    city: pick(r, 'city') ?? null,
    rating: num(pick(r, 'rating', 'stars'), 5),
    title: pick(r, 'title') ?? null,
    body: str(pick(r, 'comment', 'review', 'body', 'message')),
    verified: bool(pick(r, 'verified', 'is_verified')),
    createdAt: pick(r, 'created_at', 'date'),
  };
}

function priceOf(r: Raw) {
  const base = num(pick(r, 'price', 'mrp', 'original_price', 'regular_price'));
  let sale = pick(r, 'discount_price', 'sale_price', 'offer_price', 'special_price');
  sale = sale === undefined ? null : num(sale);
  const price = sale !== null && sale > 0 && sale < base ? sale : base;
  return { price, mrp: Math.max(base, price) };
}

const gramsOf = (label: string) => {
  const m = label.toLowerCase().match(/([\d.]+)\s*(kg|g|gm|gms|gram)/);
  if (!m) return 0;
  return Math.round(parseFloat(m[1]) * (m[2] === 'kg' ? 1000 : 1));
};

function categorySlugFor(r: Raw): string[] {
  const id = str(pick(r, 'category_id'));
  const name = str(pick(r, 'category_name', 'category'));
  const hit = catCache?.find((c) => (c as any).id === id || (name && c.name.toLowerCase() === name.toLowerCase()));
  if (hit) return [hit.slug];
  if (name) return [slugify(name)];
  return id ? [id] : [];
}

export function toProduct(r: Raw = {}): Product {
  const id = str(pick(r, 'id', 'product_id'));
  const name = str(pick(r, 'name', 'product_name', 'title'));
  const main = pick(r, 'image', 'image_url', 'thumbnail', 'main_image', 'product_image');
  const gallery = asArray(pick(r, 'images', 'gallery', 'product_images')).map((g: any) => (typeof g === 'string' ? g : pick(g, 'image', 'url', 'image_url', 'path')));
  const images = Array.from(new Set([main, ...gallery].map(mediaUrl).filter(Boolean)));
  const stockRaw = pick(r, 'stock', 'stock_quantity', 'quantity', 'qty');
  const label = str(pick(r, 'weight', 'unit', 'size', 'pack_size'), '1 pack');
  const { price, mrp } = priceOf(r);
  const variant: Variant = { id, label, grams: gramsOf(label), price, mrp, sku: id, inStock: stockRaw === undefined ? true : num(stockRaw) > 0 };
  const reviews = asArray(pick(r, 'reviews'));
  return {
    id,
    slug: id,
    name,
    tagline: str(pick(r, 'tagline', 'short_description', 'subtitle')),
    description: str(pick(r, 'description', 'details', 'long_description')),
    ingredients: list(pick(r, 'ingredients')),
    benefits: list(pick(r, 'benefits')),
    howToUse: str(pick(r, 'how_to_use', 'usage')),
    images,
    art: artFor(name, id),
    categories: categorySlugFor(r),
    variants: [variant],
    isBestSeller: bool(pick(r, 'is_bestseller', 'is_best_seller', 'bestseller', 'best_seller', 'is_featured', 'featured')),
    isNew: bool(pick(r, 'is_new', 'new')),
    rating: num(pick(r, 'rating', 'avg_rating', 'average_rating')),
    reviewCount: num(pick(r, 'review_count', 'reviews_count', 'total_reviews'), reviews.length),
  };
}

export function toAddress(r: Raw = {}): Address {
  return {
    id: str(pick(r, 'id', 'address_id')),
    name: str(pick(r, 'full_name', 'name', 'receiver_name')),
    phone: str(pick(r, 'phone', 'mobile')),
    line1: str(pick(r, 'address_line1', 'address_line_1', 'address1', 'address', 'street')),
    line2: pick(r, 'address_line2', 'address_line_2', 'address2', 'area', 'landmark') ?? null,
    city: str(pick(r, 'city')),
    state: str(pick(r, 'state')),
    pincode: str(pick(r, 'pincode', 'pin_code', 'zip', 'postal_code')),
    isDefault: bool(pick(r, 'is_default', 'default')),
  };
}

const STATUS: Record<string, OrderStatus> = {
  pending: 'PENDING', placed: 'PENDING', new: 'PENDING',
  confirmed: 'CONFIRMED', accepted: 'CONFIRMED', processing: 'CONFIRMED',
  packed: 'PACKED', ready: 'PACKED',
  shipped: 'SHIPPED', dispatched: 'SHIPPED', out_for_delivery: 'SHIPPED',
  delivered: 'DELIVERED', completed: 'DELIVERED',
  cancelled: 'CANCELLED', canceled: 'CANCELLED', rejected: 'CANCELLED',
};

export function toOrder(r: Raw = {}): Order {
  const id = str(pick(r, 'id', 'order_id'));
  const items = asArray(pick(r, 'items', 'order_items', 'products')).map((it: Raw) => {
    const p = it.product && typeof it.product === 'object' ? { ...it.product, ...it } : it;
    const pid = str(pick(p, 'product_id', 'id'));
    const nm = str(pick(p, 'product_name', 'name', 'title'));
    return {
      slug: pid,
      name: nm,
      variantLabel: str(pick(p, 'weight', 'unit', 'variant')),
      sku: `${pid}-${Math.random().toString(36).slice(2, 6)}`,
      price: num(pick(p, 'price', 'unit_price', 'discount_price')),
      quantity: num(pick(p, 'quantity', 'qty'), 1),
      image: mediaUrl(pick(p, 'image', 'image_url', 'product_image', 'thumbnail')) || null,
      art: artFor(nm, pid),
    };
  });
  let addr: Raw = {};
  const a = pick(r, 'address', 'shipping_address', 'delivery_address');
  if (a && typeof a === 'object') addr = a;
  else if (typeof a === 'string') {
    try {
      addr = JSON.parse(a);
    } catch {
      addr = { address_line1: a };
    }
  } else addr = r;
  const ad = toAddress(addr);
  const subtotalRaw = pick(r, 'subtotal', 'sub_total');
  const subtotal = subtotalRaw !== undefined ? num(subtotalRaw) : items.reduce((s, i) => s + i.price * i.quantity, 0);
  const pm = str(pick(r, 'payment_method', 'payment_mode'), 'cod').toLowerCase();
  const ps = str(pick(r, 'payment_status'), 'pending').toUpperCase();
  return {
    id,
    orderNumber: str(pick(r, 'order_number', 'order_no', 'order_code'), `#${id}`),
    name: ad.name || str(pick(r, 'name', 'customer_name')),
    email: str(pick(r, 'email')),
    phone: ad.phone || str(pick(r, 'phone', 'mobile')),
    shippingAddress: { line1: ad.line1, line2: ad.line2 ?? undefined, city: ad.city, state: ad.state, pincode: ad.pincode },
    subtotal,
    discount: num(pick(r, 'discount', 'discount_amount', 'coupon_discount')),
    shipping: num(pick(r, 'shipping', 'shipping_charge', 'delivery_charge')),
    total: num(pick(r, 'total', 'total_amount', 'grand_total', 'final_amount', 'amount'), subtotal),
    couponCode: pick(r, 'coupon_code') ?? null,
    paymentMethod: pm === 'cod' || pm.includes('cash') ? 'COD' : 'RAZORPAY',
    paymentStatus: (['PENDING', 'PAID', 'FAILED', 'REFUNDED'].includes(ps) ? ps : 'PENDING') as Order['paymentStatus'],
    status: STATUS[str(pick(r, 'status', 'order_status'), 'pending').toLowerCase().replace(/\s+/g, '_')] ?? 'PENDING',
    courier: pick(r, 'courier', 'courier_name') ?? null,
    trackingNumber: pick(r, 'tracking_number', 'awb', 'tracking_id') ?? null,
    notes: pick(r, 'notes', 'note') ?? null,
    createdAt: str(pick(r, 'created_at', 'order_date', 'date'), new Date().toISOString()).replace(' ', 'T'),
    items,
    events: [],
    itemCount: num(pick(r, 'item_count', 'items_count', 'total_items'), items.reduce((s, i) => s + i.quantity, 0)),
  };
}

// ───────────────────────── endpoints ─────────────────────────
function session(j: any): { token: string; user: User } {
  const d = j?.data ?? j ?? {};
  const token = pick(j, 'token', 'access_token', 'api_token', 'jwt') ?? pick(d, 'token', 'access_token', 'api_token', 'jwt');
  const rawUser = pick(d, 'user', 'customer', 'profile') ?? pick(j, 'user') ?? (pick(d, 'email', 'id', 'user_id') ? d : null);
  if (!rawUser && !token) throw new PhpError('Signed in, but the server did not send back your account.');
  return { token: token ? String(token) : SESSION_TOKEN, user: toUser(rawUser ?? {}) };
}

export const authApi = {
  login: async (email: string, password: string) => session(await php('auth/login.php', { method: 'POST', body: { email, password }, raw: true })),
  register: async (f: { name: string; email: string; phone: string; password: string }) => {
    const j = await php('auth/register.php', { method: 'POST', body: { ...f, confirm_password: f.password }, raw: true });
    try {
      const s = session(j);
      if (s.user.id) return s;
    } catch {}
    // Register didn't sign in — do it now.
    return authApi.login(f.email, f.password);
  },
  profile: async () => {
    const d = await php('auth/profile.php', { auth: true });
    return toUser(pick(d, 'user', 'profile') ?? d);
  },
  updateProfile: async (f: { name: string; phone?: string }) => {
    const d = await php('auth/profile.php', { method: 'POST', auth: true, body: { ...f, action: 'update' } });
    const u = pick(d, 'user', 'profile') ?? d;
    return u && typeof u === 'object' && pick(u, 'email', 'name') ? toUser(u) : null;
  },
};

async function loadCategories(): Promise<Category[]> {
  const d = await php('categories/list.php');
  catCache = asArray(d, 'categories').map(toCategory);
  return catCache;
}

const priceFrom = (p: Product) => Math.min(...p.variants.map((v) => v.price));

export const catalogApi = {
  categories: loadCategories,

  /** Server filters by category + search; price, weight, bestseller and sort run here. */
  async products(f: ProductFilters = {}): Promise<Product[]> {
    const cats = catCache ?? (await loadCategories().catch(() => []));
    const cat = f.category ? cats.find((c) => c.slug === f.category || (c as any).id === f.category || slugify(c.name) === f.category) : undefined;
    if (f.category && !cat) return []; // unknown category
    const d = await php('products/list.php', {
      query: { category_id: (cat as any)?.id, search: f.q, q: f.q, limit: 200, per_page: 200 },
    });
    let items = asArray(d, 'products').map(toProduct);
    const q = f.q?.trim().toLowerCase();
    items = items.filter(
      (p) =>
        (!cat || !p.categories.length || p.categories.includes(cat.slug)) &&
        (!q || p.name.toLowerCase().includes(q) || p.tagline.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)) &&
        (!f.weights?.length || p.variants.some((v) => f.weights!.includes(v.grams))) &&
        (f.minPrice == null || priceFrom(p) >= f.minPrice) &&
        (f.maxPrice == null || priceFrom(p) <= f.maxPrice),
    );
    if (f.bestSeller) {
      const best = items.filter((p) => p.isBestSeller);
      items = best.length ? best : items.slice(0, 8);
    }
    const by: Record<string, (a: Product, b: Product) => number> = {
      'price-asc': (a, b) => priceFrom(a) - priceFrom(b),
      'price-desc': (a, b) => priceFrom(b) - priceFrom(a),
      rating: (a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount,
      new: (a, b) => Number(b.isNew) - Number(a.isNew) || num(b.id) - num(a.id),
    };
    return f.sort && by[f.sort] ? [...items].sort(by[f.sort]) : items;
  },

  async product(id: string): Promise<{ product: Product; reviews: Review[] }> {
    if (!catCache) await loadCategories().catch(() => []);
    const d = await php('products/single.php', { query: { id, product_id: id } });
    const raw = pick(d, 'product') ?? d;
    if (!raw || typeof raw !== 'object' || !pick(raw, 'id', 'product_id', 'name')) throw new PhpError('Product not found', 404);
    const product = toProduct(raw);
    const reviews = asArray(pick(raw, 'reviews') ?? pick(d, 'reviews')).map(toReview);
    const extra = asArray(pick(d, 'images', 'gallery')).map((g: any) => mediaUrl(typeof g === 'string' ? g : pick(g, 'image', 'url', 'image_url'))).filter(Boolean);
    if (extra.length) product.images = Array.from(new Set([...product.images, ...extra]));
    if (reviews.length) {
      product.reviewCount ||= reviews.length;
      product.rating ||= reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
    }
    return { product, reviews };
  },

  addReview: (f: { product_id: string; rating: number; title?: string; body: string }) =>
    php('reviews/add.php', { method: 'POST', auth: true, body: { product_id: f.product_id, rating: f.rating, title: f.title, comment: f.body, review: f.body } }),
};

export interface ServerCartLine {
  cartId: string;
  productId: string;
  name: string;
  image: string | null;
  price: number;
  mrp: number;
  quantity: number;
  label: string;
}

export const cartApi = {
  async list(): Promise<ServerCartLine[]> {
    const d = await php('cart/list.php', { auth: true });
    return asArray(d, 'items', 'cart_items', 'cart').map((r: Raw) => {
      const p = r.product && typeof r.product === 'object' ? { ...r, ...r.product } : r;
      const { price, mrp } = priceOf(p);
      return {
        cartId: str(pick(r, 'cart_id', 'id', 'cart_item_id')),
        productId: str(pick(r, 'product_id') ?? pick(r.product, 'id')),
        name: str(pick(p, 'name', 'product_name', 'title')),
        image: mediaUrl(pick(p, 'image', 'image_url', 'thumbnail', 'product_image')) || null,
        price,
        mrp,
        quantity: Math.max(1, num(pick(r, 'quantity', 'qty'), 1)),
        label: str(pick(p, 'weight', 'unit'), '1 pack'),
      };
    });
  },
  add: (productId: string, quantity: number) => php('cart/add.php', { method: 'POST', auth: true, body: { product_id: productId, quantity } }),
  update: (cartId: string | undefined, productId: string, quantity: number) =>
    php('cart/update.php', { method: 'POST', auth: true, body: { cart_id: cartId, id: cartId, product_id: productId, quantity } }),
  remove: (cartId: string | undefined, productId: string) => php('cart/remove.php', { method: 'POST', auth: true, body: { cart_id: cartId, id: cartId, product_id: productId } }),
};

export const wishlistApi = {
  async list(): Promise<string[]> {
    const d = await php('wishlist/list.php', { auth: true });
    return asArray(d, 'wishlist', 'items').map((r: Raw) => str(pick(r, 'product_id') ?? pick(r.product, 'id') ?? pick(r, 'id')));
  },
  /** wishlist/add.php was not in the endpoint list — create it on the PHP side if missing. */
  add: (productId: string) => php('wishlist/add.php', { method: 'POST', auth: true, body: { product_id: productId } }),
  remove: (productId: string) => php('wishlist/remove.php', { method: 'POST', auth: true, body: { product_id: productId } }),
  async check(productId: string): Promise<boolean> {
    const j = await php('wishlist/check.php', { auth: true, query: { product_id: productId }, raw: true });
    const keys = ['in_wishlist', 'is_wishlisted', 'wishlisted', 'exists', 'is_in_wishlist', 'in_list', 'found'];
    if (typeof j?.data === 'boolean') return j.data;
    const v = pick(j?.data, ...keys) ?? pick(j, ...keys);
    return v === undefined ? false : bool(v);
  },
};

export const addressApi = {
  list: async () => asArray(await php('addresses/list.php', { auth: true }), 'addresses').map(toAddress),
  async add(a: Omit<Address, 'id'>): Promise<string | null> {
    const j = await php('addresses/add.php', {
      method: 'POST',
      auth: true,
      raw: true,
      body: {
        full_name: a.name, name: a.name, phone: a.phone,
        address_line1: a.line1, address: a.line1, address_line2: a.line2 ?? '',
        city: a.city, state: a.state, pincode: a.pincode, is_default: a.isDefault ? 1 : 0,
      },
    });
    const id = pick(j?.data, 'address_id', 'id') ?? pick(j?.data?.address, 'id') ?? pick(j, 'address_id', 'id', 'insert_id');
    return id != null ? String(id) : null;
  },
  remove: (id: string) => php('addresses/delete.php', { method: 'POST', auth: true, body: { address_id: id, id } }),
};

export const orderApi = {
  async create(f: { addressId: string; notes?: string; couponCode?: string }): Promise<string | null> {
    const j = await php('orders/create.php', {
      method: 'POST',
      auth: true,
      raw: true,
      body: { address_id: f.addressId, payment_method: 'cod', notes: f.notes, coupon_code: f.couponCode },
    });
    const d = j?.data ?? {};
    const id = pick(d, 'order_id', 'id') ?? pick(d?.order, 'id', 'order_id') ?? pick(j, 'order_id', 'id');
    return id != null ? String(id) : null;
  },
  list: async () => asArray(await php('orders/list.php', { auth: true }), 'orders').map(toOrder),
  async details(id: string): Promise<Order> {
    const d = await php('orders/details.php', { auth: true, query: { order_id: id, id } });
    const raw = pick(d, 'order') ?? d;
    const o = toOrder({ ...raw, items: pick(raw, 'items', 'order_items') ?? pick(d, 'items', 'order_items'), address: pick(raw, 'address', 'shipping_address') ?? pick(d, 'address', 'shipping_address') });
    if (!o.id) o.id = id;
    return o;
  },
  cancel: (id: string, reason = '') => php('orders/cancel.php', { method: 'POST', auth: true, body: { order_id: id, id, reason } }),
};
