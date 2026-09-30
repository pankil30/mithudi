import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { localReviews } from './catalog';
import { asArray, catalogApi, php, PhpError } from './php';
import type { ProductFilters, Review } from './types';

export const useProducts = (filters: ProductFilters = {}) =>
  useQuery({
    queryKey: ['products', filters],
    queryFn: () => catalogApi.products(filters),
    placeholderData: keepPreviousData,
    staleTime: 60_000,
  });

const useProductDetail = (slug: string | undefined) =>
  useQuery({
    queryKey: ['product', slug],
    enabled: !!slug,
    queryFn: () => catalogApi.product(slug!),
    retry: (count, e) => !(e instanceof PhpError && e.status === 404) && count < 2,
    staleTime: 60_000,
  });

export const useProduct = (slug: string | undefined) => {
  const q = useProductDetail(slug);
  return { ...q, data: q.data?.product };
};

export const useProductReviews = (slug: string | undefined) => {
  const q = useProductDetail(slug);
  return { ...q, data: q.data?.reviews };
};

export const useCategories = () =>
  useQuery({
    queryKey: ['categories'],
    queryFn: catalogApi.categories,
    staleTime: 5 * 60_000,
  });

/** No PHP endpoint for store-wide reviews — the home page shows the bundled testimonials. */
export const useFeaturedReviews = () =>
  useQuery({
    queryKey: ['reviews', 'featured'],
    queryFn: async (): Promise<Review[]> => localReviews.map(({ product: _p, ...r }) => r),
    staleTime: Infinity,
  });

/** coupons/offers.php — active coupons shown as chips in the cart. */
export const useOffers = () =>
  useQuery({
    queryKey: ['offers'],
    queryFn: async () =>
      asArray(await php('coupons/offers.php')).map((o: any) => ({ code: String(o.code), description: String(o.description ?? ''), minOrder: Number(o.min_order ?? 0) })),
    staleTime: 5 * 60_000,
  });
