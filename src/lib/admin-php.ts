/**
 * Admin panel ↔ PHP API. Every admin screen calls these functions.
 *
 *   admin/me.php            admin check
 *   admin/dashboard.php     stats
 *   admin/orders.php        list + update status
 *   admin/products.php      list (incl. hidden)      products/create|update|delete.php  (multipart)
 *   admin/categories.php    list + add/update/delete (multipart, image)
 *   admin/coupons.php       list + add/update/toggle/delete
 *   admin/enquiries.php     list + toggle/delete
 *   admin/users.php         customers
 *   admin/upload.php        single image upload
 *
 * All calls send "Authorization: Bearer <token>"; your PHP require_admin() checks it.
 * If one of your existing PHP files uses different param names, change it here only.
 */
import { asArray, mediaUrl, num, php, pick, toCategory, toOrder, toProduct, toUser } from './php';
import type { Order, OrderStatus, Product } from './types';

type Raw = Record<string, any>;
const bool = (v: unknown) => v === true || v === 1 || v === '1' || v === 'true';
const str = (v: unknown, d = '') => (v === null || v === undefined ? d : String(v));

function form(fields: Record<string, unknown>, files: Record<string, File | null | undefined> = {}) {
  const f = new FormData();
  for (const [k, v] of Object.entries(fields)) {
    if (v === undefined || v === null) continue;
    f.append(k, typeof v === 'boolean' ? (v ? '1' : '0') : String(v));
  }
  for (const [k, file] of Object.entries(files)) if (file) f.append(k, file);
  return f;
}

// ───────── auth ─────────
export const adminMe = async () => toUser(await php('admin/me.php', { auth: true }));

// ───────── dashboard ─────────
export interface Stats {
  revenue: number;
  orders: number;
  pending: number;
  customers: number;
  products: number;
  openEnquiries: number;
  lowStock: { id: string; name: string; stock: number }[];
  recentOrders: Order[];
}

export async function adminStats(): Promise<Stats> {
  const d: Raw = (await php('admin/dashboard.php', { auth: true })) ?? {};
  const s: Raw = d.stats ?? d.totals ?? d;
  const open = await php('admin/enquiries.php', { auth: true, query: { handled: 0 }, raw: true })
    .then((j) => num(j?.counts?.open, asArray(j?.data).length))
    .catch(() => 0);
  return {
    revenue: num(pick(s, 'total_revenue', 'revenue', 'total_sales', 'sales')),
    orders: num(pick(s, 'total_orders', 'orders', 'orders_count')),
    pending: num(pick(s, 'pending_orders', 'pending', 'to_fulfil')),
    customers: num(pick(s, 'total_users', 'total_customers', 'customers', 'users')),
    products: num(pick(s, 'total_products', 'products')),
    openEnquiries: open,
    lowStock: asArray(pick(d, 'low_stock', 'low_stock_products', 'lowStock')).map((p: Raw) => ({
      id: str(pick(p, 'id', 'product_id')),
      name: str(pick(p, 'name', 'product_name')),
      stock: num(pick(p, 'stock', 'quantity')),
    })),
    recentOrders: asArray(pick(d, 'recent_orders', 'latest_orders', 'recentOrders')).map(toOrder),
  };
}

// ───────── orders ─────────
const PHP_STATUS: Record<OrderStatus, string> = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PACKED: 'packed',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
};

export interface OrderPage {
  items: Order[];
  total: number;
  pages: number;
}

export async function adminOrders(f: { status?: OrderStatus | ''; q?: string; page?: number }): Promise<OrderPage> {
  const j = await php('admin/orders.php', {
    auth: true,
    raw: true,
    query: { status: f.status ? PHP_STATUS[f.status] : undefined, search: f.q, q: f.q, page: f.page ?? 1 },
  });
  const d = j?.data ?? j;
  const items = asArray(d, 'orders').map((r: Raw) => {
    const o = toOrder(r);
    // admin list rows usually carry the customer on the order row itself
    o.name = o.name || str(pick(r, 'customer_name', 'user_name', 'name'));
    o.email = o.email || str(pick(r, 'customer_email', 'user_email', 'email'));
    o.phone = o.phone || str(pick(r, 'customer_phone', 'user_phone', 'phone'));
    return o;
  });
  const meta: Raw = j?.pagination ?? d?.pagination ?? j?.meta ?? {};
  const total = num(pick(meta, 'total') ?? pick(d, 'total'), items.length);
  const pages = num(pick(meta, 'pages', 'total_pages', 'last_page') ?? pick(d, 'pages', 'total_pages'), 1);
  return { items, total, pages: Math.max(1, pages) };
}

export async function adminOrderDetails(id: string): Promise<Order | null> {
  try {
    const d = await php('admin/orders.php', { auth: true, query: { id, order_id: id, action: 'details' } });
    const raw = pick(d, 'order') ?? (Array.isArray(d) ? d[0] : d);
    if (!raw || typeof raw !== 'object') return null;
    return toOrder({ ...raw, items: pick(raw, 'items', 'order_items') ?? pick(d, 'items', 'order_items') });
  } catch {
    return null;
  }
}

export const adminUpdateOrder = (id: string, f: { status: OrderStatus; courier?: string; trackingNumber?: string; note?: string }) =>
  php('admin/orders.php', {
    auth: true,
    body: {
      action: 'update_status',
      id,
      order_id: id,
      status: PHP_STATUS[f.status],
      courier: f.courier,
      tracking_number: f.trackingNumber,
      note: f.note,
    },
  });

// ───────── products ─────────
export interface AdminProduct extends Product {
  isActive: boolean;
  stock: number;
  categoryId: string;
  price: number;
  discountPrice: number | null;
  weight: string;
}

function toAdminProduct(r: Raw): AdminProduct {
  const p = toProduct(r);
  const price = num(pick(r, 'price', 'mrp'));
  const dp = pick(r, 'discount_price', 'sale_price');
  return {
    ...p,
    isActive: pick(r, 'status', 'is_active', 'active') === undefined ? true : ['1', 'active', 'true'].includes(str(pick(r, 'status', 'is_active', 'active')).toLowerCase()),
    stock: num(pick(r, 'stock', 'stock_quantity', 'quantity')),
    categoryId: str(pick(r, 'category_id')),
    price,
    discountPrice: dp === undefined || num(dp) <= 0 ? null : num(dp),
    weight: str(pick(r, 'weight', 'unit', 'size')),
  };
}

export async function adminProducts(): Promise<AdminProduct[]> {
  const d = await php('admin/products.php', { auth: true, query: { limit: 500 } });
  return asArray(d, 'products').map(toAdminProduct);
}

export async function adminProduct(id: string): Promise<AdminProduct> {
  // admin API returns hidden (status 0) products too; the store API does not
  const d = await php('admin/products.php', { auth: true, query: { id } });
  return toAdminProduct(pick(d, 'product') ?? d);
}

export interface ProductInput {
  name: string;
  categoryId: string;
  description: string;
  price: number;
  discountPrice: number | null;
  stock: number;
  weight: string;
  isActive: boolean;
  isFeatured: boolean;
  image?: File | null;
}

const productFields = (p: ProductInput) => ({
  name: p.name,
  category_id: p.categoryId,
  description: p.description,
  price: p.price,
  discount_price: p.discountPrice ?? '',
  stock: p.stock,
  weight: p.weight,
  is_active: p.isActive,
  status: p.isActive ? 1 : 0,
  is_featured: p.isFeatured,
});

export async function adminCreateProduct(p: ProductInput): Promise<string | null> {
  const j = await php('products/create.php', { auth: true, raw: true, form: form(productFields(p), { image: p.image }) });
  const id = pick(j?.data, 'id', 'product_id') ?? pick(j?.data?.product, 'id') ?? pick(j, 'id', 'product_id');
  return id != null ? String(id) : null;
}

export const adminUpdateProduct = (id: string, p: ProductInput) =>
  php('products/update.php', { auth: true, form: form({ id, product_id: id, ...productFields(p) }, { image: p.image }) });

export const adminDeleteProduct = (id: string) => php('products/delete.php', { auth: true, form: form({ id, product_id: id }) });

// ───────── categories ─────────
// ───────── categories ─────────
//   list   → categories/list.php   (GET,  returns { success, categories: [...] })
//   add    → admin/categories.php  (POST, multipart)
//   update → categories/update.php (POST, multipart: id, name, image?)
//   delete → categories/delete.php (POST: id)
export interface AdminCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string | null;
  productCount: number | null;
}

export async function adminCategories(): Promise<AdminCategory[]> {
  const d = await php('categories/list.php');
  return asArray(d, 'categories').map((r: Raw) => ({
    id: str(pick(r, 'id', 'category_id')),
    name: str(pick(r, 'name', 'category_name')),
    slug: str(pick(r, 'slug')),
    description: str(pick(r, 'description')),
    image: mediaUrl(pick(r, 'image', 'image_url')) || null,
    productCount: pick(r, 'product_count') != null ? num(pick(r, 'product_count')) : null,
  }));
}

export const adminSaveCategory = (c: { id?: string; name: string; description: string; image?: File | null }) =>
  c.id
    ? php('categories/update.php', { auth: true, form: form({ id: c.id, name: c.name }, { image: c.image }) })
    : php('admin/categories.php', { auth: true, form: form({ action: 'add', name: c.name }, { image: c.image }) });

export const adminDeleteCategory = (id: string, moveTo?: string) =>
  php<{ message?: string }>('categories/delete.php', { auth: true, raw: true, form: form({ id, move_to: moveTo }) });

// ───────── coupons ─────────
export interface Coupon {
  id: string;
  code: string;
  description: string;
  type: 'percent' | 'flat';
  value: number;
  minOrder: number;
  maxDiscount: number | null;
  usageLimit: number | null;
  usedCount: number;
  expiresAt: string | null;
  isActive: boolean;
}

export async function adminCoupons(): Promise<Coupon[]> {
  const d = await php('admin/coupons.php', { auth: true });
  return asArray(d).map((r: Raw) => ({
    id: str(r.id),
    code: str(r.code),
    description: str(r.description),
    type: r.type === 'flat' ? 'flat' : 'percent',
    value: num(r.value),
    minOrder: num(r.min_order),
    maxDiscount: r.max_discount == null ? null : num(r.max_discount),
    usageLimit: r.usage_limit == null ? null : num(r.usage_limit),
    usedCount: num(r.used_count),
    expiresAt: r.expires_at ?? null,
    isActive: bool(r.is_active),
  }));
}

export const adminSaveCoupon = (id: string | undefined, c: Omit<Coupon, 'id' | 'usedCount'>) =>
  php('admin/coupons.php', {
    auth: true,
    body: {
      action: id ? 'update' : 'add',
      id,
      code: c.code,
      description: c.description,
      type: c.type,
      value: c.value,
      min_order: c.minOrder,
      max_discount: c.maxDiscount ?? '',
      usage_limit: c.usageLimit ?? '',
      expires_at: c.expiresAt ?? '',
      is_active: c.isActive ? 1 : 0,
    },
  });

export const adminCouponAction = (action: 'toggle' | 'delete', id: string) => php('admin/coupons.php', { auth: true, body: { action, id } });

// ───────── enquiries ─────────
export interface Enquiry {
  id: string;
  type: 'CONTACT' | 'BULK' | 'NEWSLETTER';
  name: string;
  email: string;
  phone: string;
  message: string;
  handled: boolean;
  createdAt: string;
}

export async function adminEnquiries(type: string, handled: '' | '0' | '1'): Promise<Enquiry[]> {
  const d = await php('admin/enquiries.php', { auth: true, query: { type: type || undefined, handled: handled || undefined } });
  return asArray(d).map((r: Raw) => ({
    id: str(r.id),
    type: (['CONTACT', 'BULK', 'NEWSLETTER'].includes(r.type) ? r.type : 'CONTACT') as Enquiry['type'],
    name: str(r.name),
    email: str(r.email),
    phone: str(r.phone),
    message: str(r.message),
    handled: bool(r.handled),
    createdAt: str(r.created_at).replace(' ', 'T'),
  }));
}

export const adminEnquiryAction = (action: 'toggle' | 'delete', id: string) => php('admin/enquiries.php', { auth: true, body: { action, id } });

// ───────── customers ─────────
export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  orderCount: number;
  createdAt: string;
}

export async function adminCustomers(search: string, page: number): Promise<{ items: Customer[]; total: number; pages: number }> {
  const j = await php('admin/users.php', { auth: true, raw: true, query: { search: search || undefined, page } });
  return {
    items: asArray(j?.data).map((r: Raw) => ({
      id: str(r.id),
      name: str(r.name),
      email: str(r.email),
      phone: str(r.phone),
      role: str(r.role, 'customer'),
      orderCount: num(r.order_count),
      createdAt: str(r.created_at).replace(' ', 'T'),
    })),
    total: num(j?.pagination?.total),
    pages: Math.max(1, num(j?.pagination?.pages, 1)),
  };
}

// ───────── upload ─────────
export async function adminUpload(file: File): Promise<{ path: string; url: string }> {
  const d = await php('admin/upload.php', { auth: true, form: form({}, { image: file }) });
  return { path: str(d?.path), url: mediaUrl(d?.path ?? d?.url) };
}
