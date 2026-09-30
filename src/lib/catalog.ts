/**
 * Offline fallback built from the shared catalogue, used only when the API is unreachable so the
 * storefront still browses. Checkout always goes through the API.
 */
import { categories as rawCategories, products as rawProducts, reviews as rawReviews } from '@/data/catalog';
import { fromPrice } from './format';
import type { Category, Product, ProductFilters, Review } from './types';

export const localProducts: Product[] = rawProducts.map((p) => ({
  ...p,
  id: p.slug,
  images: [],
  variants: p.variants.map((v) => ({ id: v.sku, label: v.label, grams: v.grams, price: v.price, mrp: v.mrp, sku: v.sku, inStock: v.stock > 0 })),
}));

export const localCategories: Category[] = rawCategories.map((c) => ({
  ...c,
  _count: { products: rawProducts.filter((p) => p.categories.includes(c.slug)).length },
}));

export const localReviews: Review[] = rawReviews.map((r, i) => ({
  id: `local-${i}`,
  name: r.name,
  city: r.city,
  rating: r.rating,
  title: r.title,
  body: r.body,
  verified: true,
  product: { slug: r.productSlug, name: rawProducts.find((p) => p.slug === r.productSlug)?.name ?? '' },
}));

/** Mirrors CatalogService.list on the API. */
export function filterLocal(f: ProductFilters): Product[] {
  const q = f.q?.trim().toLowerCase();
  let items = localProducts.filter(
    (p) =>
      (!f.category || p.categories.includes(f.category)) &&
      (!f.bestSeller || p.isBestSeller) &&
      (!q || p.name.toLowerCase().includes(q) || p.tagline.toLowerCase().includes(q) || p.ingredients.some((i) => i.toLowerCase() === q)) &&
      (!f.weights?.length || p.variants.some((v) => f.weights!.includes(v.grams))) &&
      (f.minPrice == null || fromPrice(p) >= f.minPrice) &&
      (f.maxPrice == null || fromPrice(p) <= f.maxPrice),
  );
  const by: Record<string, (a: Product, b: Product) => number> = {
    'price-asc': (a, b) => fromPrice(a) - fromPrice(b),
    'price-desc': (a, b) => fromPrice(b) - fromPrice(a),
    rating: (a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount,
    new: (a, b) => Number(b.isNew) - Number(a.isNew),
    featured: (a, b) => Number(b.isBestSeller) - Number(a.isBestSeller) || b.reviewCount - a.reviewCount,
  };
  items = [...items].sort(by[f.sort ?? 'featured']);
  return items;
}
