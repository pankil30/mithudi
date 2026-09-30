/**
 * Server-side product fetch for metadata / JSON-LD, straight from the PHP API.
 * Returns a minimal product (or null if the API says it doesn't exist).
 */
import type { Product } from './types';

const ORIGIN = (process.env.API_PROXY_TARGET || 'http://mithudi.mooo.com').replace(/\/$/, '');

export async function getProduct(slug: string): Promise<Product | null | undefined> {
  try {
    const res = await fetch(`${ORIGIN}/api/products/single.php?id=${encodeURIComponent(slug)}&product_id=${encodeURIComponent(slug)}`, {
      next: { revalidate: 300 },
      signal: AbortSignal.timeout(4000),
    });
    const text = await res.text();
    const start = text.search(/[{[]/);
    const json = start >= 0 ? JSON.parse(text.slice(start)) : null;
    if (!json || json.success === false || json.status === false || res.status === 404) return null;
    const { toProduct } = await import('./php');
    const raw = json.data?.product ?? json.data ?? json.product ?? json;
    if (!raw?.id && !raw?.product_id && !raw?.name) return null;
    return toProduct(raw);
  } catch {
    return undefined; // API unreachable — let the client page load it
  }
}

export async function getProductIds(): Promise<string[]> {
  try {
    const res = await fetch(`${ORIGIN}/api/products/list.php?limit=500`, { next: { revalidate: 3600 }, signal: AbortSignal.timeout(4000) });
    const text = await res.text();
    const json = JSON.parse(text.slice(Math.max(0, text.search(/[{[]/))));
    const d = json.data ?? json;
    const arr: any[] = Array.isArray(d) ? d : d.products ?? d.items ?? [];
    return arr.map((p) => String(p.id ?? p.product_id)).filter(Boolean);
  } catch {
    return [];
  }
}
