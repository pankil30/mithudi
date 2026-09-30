'use client';

import { useCallback, useMemo } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

/**
 * Read and write the URL query string, similar to react-router's useSearchParams.
 * Components using this must render inside a <Suspense> boundary.
 */
export function useSearchParamsState() {
  const search = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const params = useMemo(() => new URLSearchParams(search?.toString()), [search]);

  const setParams = useCallback(
    (next: URLSearchParams | Record<string, string>, opts: { replace?: boolean } = {}) => {
      const qs = new URLSearchParams(next).toString();
      const url = qs ? `${pathname}?${qs}` : pathname;
      if (opts.replace) router.replace(url, { scroll: false });
      else router.push(url, { scroll: false });
    },
    [pathname, router],
  );

  return [params, setParams] as const;
}
