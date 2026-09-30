'use client';

import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { TableScene } from '@/components/art/Scene';
import { PostCard } from '@/components/home/Sections';
import { ButtonLink } from '@/components/ui/Button';
import { PageHero } from '@/components/ui/PageHero';
import { Reveal } from '@/components/ui/Reveal';
import { posts } from '@/data/journal';
import { localProducts } from '@/lib/catalog';
import { formatDate } from '@/lib/format';

export function JournalIndex() {
  return (
    <>
      <PageHero eyebrow="The Journal" title="Mukhvas tips & after-meal rituals" intro="Stories, storage tips and gifting guides from our kitchen to yours." />
      <div className="container-x grid gap-x-8 gap-y-14 pb-24 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((p, i) => (
          <Reveal key={p.slug} delay={(i % 3) * 0.08}>
            <PostCard post={p} />
          </Reveal>
        ))}
      </div>
    </>
  );
}

export function JournalPost({ slug }: { slug: string }) {
  const post = posts.find((p) => p.slug === slug);
  if (!post) return null;
  const cover = localProducts.find((p) => p.slug === post.coverSlug)!;
  const more = posts.filter((p) => p.slug !== post.slug).slice(0, 3);
  return (
    <article>
      <header className="container-x max-w-3xl pt-10 text-center sm:pt-16">
        <Link href="/journal" className="inline-flex items-center gap-1 text-sm text-muted hover:text-maroon">
          <ChevronLeft className="h-4 w-4" /> All stories
        </Link>
        <p className="eyebrow mt-6">
          {post.category} · {formatDate(post.date)} · {post.readMinutes} min read
        </p>
        <h1 className="mt-4 text-4xl leading-[1.08] font-medium sm:text-6xl">{post.title}</h1>
      </header>
      <div className="container-x mt-10 max-w-5xl">
        <div className="aspect-[16/8] overflow-hidden rounded-[36px] shadow-lift">
          <TableScene jars={[{ art: cover.art, name: cover.name, seed: `${post.slug}-hero` }]} width={1600} height={800} xStart={0.5} tableRatio={0.68} jarScale={0.8} className="h-full w-full" />
        </div>
      </div>
      <div className="container-x max-w-2xl py-14">
        <p className="font-serif text-2xl leading-relaxed text-maroon/90 first-letter:float-left first-letter:mr-3 first-letter:font-serif first-letter:text-7xl first-letter:leading-[0.8] first-letter:text-saffron-deep">
          {post.body[0].text}
        </p>
        {post.body.slice(1).map((b) => (
          <section key={b.heading} className="mt-10">
            {b.heading && <h2 className="text-3xl font-medium">{b.heading}</h2>}
            <p className="mt-3 text-[17px] leading-[1.8] text-ink/80">{b.text}</p>
          </section>
        ))}
        <div className="mt-14 rounded-[28px] bg-cream-deep p-8 text-center">
          <p className="font-serif text-2xl text-maroon">Featured in this story</p>
          <p className="mt-1 text-muted">{cover.name}</p>
          <ButtonLink href={`/product/${cover.slug}`} className="mt-5">
            Shop {cover.name}
          </ButtonLink>
        </div>
      </div>
      <section className="border-t border-line bg-cream-deep/40 py-16">
        <div className="container-x">
          <h2 className="text-center text-4xl">Keep reading</h2>
          <div className="mt-10 grid gap-8 md:grid-cols-3">
            {more.map((p) => (
              <PostCard key={p.slug} post={p} />
            ))}
          </div>
        </div>
      </section>
    </article>
  );
}
