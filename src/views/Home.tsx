'use client';

import { Hero } from '@/components/home/Hero';
import { BestSellers, Collections, GiftingBanner, InstagramGallery, JournalPreview, PromiseStrip, Reviews, Ritual, StoryTeaser } from '@/components/home/Sections';

export default function Home() {
  return (
    <>
      <Hero />
      <PromiseStrip />
      <Collections />
      <BestSellers />
      <StoryTeaser />
      <Ritual />
      <Reviews />
      <GiftingBanner />
      <InstagramGallery />
      <JournalPreview />
    </>
  );
}
