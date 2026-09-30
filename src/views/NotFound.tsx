'use client';

import { JarSvg } from '@/components/art/Jar';
import { ButtonLink } from '@/components/ui/Button';
import { localProducts } from '@/lib/catalog';

export default function NotFound() {
  const p = localProducts.find((x) => x.slug === 'rainbow-candy-fennel')!;
  return (
    <div className="container-x flex flex-col items-center py-20 text-center">
      <JarSvg art={p.art} name={p.name} className="w-40 -rotate-12 drop-shadow-xl" />
      <p className="eyebrow mt-8">404</p>
      <h1 className="mt-3 text-5xl font-medium">This jar is empty</h1>
      <p className="mt-3 max-w-md text-muted">The page you’re looking for has moved or never existed. Let’s get you back to something sweet.</p>
      <div className="mt-8 flex gap-3">
        <ButtonLink href="/">Back home</ButtonLink>
        <ButtonLink href="/shop" variant="outline">
          Shop mukhvas
        </ButtonLink>
      </div>
    </div>
  );
}
