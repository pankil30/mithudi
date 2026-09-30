import type { Metadata } from 'next';

/** Per-page metadata helpers for the Next.js Metadata API. */
export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://mithudi.in').replace(/\/$/, '');
export const BRAND = 'મીઠુડી મુખવાસ';
export const DEFAULT_TITLE = `${BRAND} — Handcrafted Gujarati Mukhvas`;
export const DEFAULT_DESCRIPTION =
  'Small-batch, supari-free Gujarati mukhvas in beautiful glass jars. Digestive blends, sweet paan mixes and luxury gift boxes, made the traditional way.';

export function pageMetadata({
  title,
  description,
  path,
  image,
  noindex,
}: {
  title?: string;
  description?: string;
  path?: string;
  image?: string;
  noindex?: boolean;
}): Metadata {
  const full = title ? `${title} | ${BRAND}` : DEFAULT_TITLE;
  return {
    title: { absolute: full },
    ...(description && { description }),
    ...(path != null && { alternates: { canonical: `${siteUrl}${path}` } }),
    openGraph: {
      title: full,
      ...(description && { description }),
      ...(path != null && { url: `${siteUrl}${path}` }),
      ...(image && { images: [image] }),
    },
    ...(noindex && { robots: { index: false, follow: false } }),
  };
}
