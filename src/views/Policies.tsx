'use client';

import Link from 'next/link';
import { PageHero } from '@/components/ui/PageHero';
import { POLICIES } from '@/data/policies';
import { cn } from '@/lib/format';

export default function Policies({ slug }: { slug: string }) {
  const policy = POLICIES[slug];
  if (!policy) return null;
  return (
    <>
      <PageHero eyebrow="Policies" title={policy.title} />
      <div className="container-x grid max-w-5xl gap-10 pb-24 md:grid-cols-[200px_1fr]">
        <nav className="flex gap-2 md:flex-col" aria-label="Policies">
          {Object.entries(POLICIES).map(([k, p]) => (
            <Link key={k} href={`/policies/${k}`} className={cn('rounded-full px-4 py-2 text-sm', k === slug ? 'bg-maroon text-cream' : 'text-maroon hover:bg-maroon/5')}>
              {p.title}
            </Link>
          ))}
        </nav>
        <div className="space-y-8">
          {policy.sections.map(([h, t]) => (
            <section key={h}>
              <h2 className="text-3xl">{h}</h2>
              <p className="mt-2 leading-relaxed text-muted">{t}</p>
            </section>
          ))}
        </div>
      </div>
    </>
  );
}
