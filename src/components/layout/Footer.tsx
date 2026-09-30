'use client';

import Link from 'next/link';
import { Instagram, Mail, MapPin, Phone, Youtube } from 'lucide-react';
import { Logo } from '@/components/brand/Logo';
import { SUPPORT_EMAIL, WHATSAPP_NUMBER } from '@/lib/contact';
import { NewsletterForm } from './Newsletter';
import { collections } from './nav';

const cols = [
  { title: 'Shop', links: [{ to: '/shop', label: 'All Mukhvas' }, ...collections.map((c) => ({ to: `/shop?category=${c.slug}`, label: c.name }))] },
  {
    title: 'Company',
    links: [
      { to: '/about', label: 'Our Story' },
      { to: '/gifting', label: 'Wedding & Bulk Gifting' },
      { to: '/journal', label: 'Journal' },
      { to: '/contact', label: 'Contact Us' },
    ],
  },
  {
    title: 'Help',
    links: [
      { to: '/account', label: 'My Account' },
      { to: '/track', label: 'Track Order' },
      { to: '/policies/shipping', label: 'Shipping & Returns' },
      { to: '/policies/privacy', label: 'Privacy Policy' },
      { to: '/policies/terms', label: 'Terms of Service' },
    ],
  },
];

export function Footer() {
  return (
    <footer className="relative overflow-hidden bg-maroon-deep text-cream/80">
      <div className="pointer-events-none absolute -top-40 -right-40 h-96 w-96 rounded-full bg-saffron/10 blur-3xl" />
      <div className="container-x relative grid gap-12 pt-16 pb-10 lg:grid-cols-[1.3fr_2fr]">
        <div>
          <Logo light />
          <p className="mt-5 max-w-sm font-serif text-xl leading-snug text-cream/90 italic">Sweet moments. Fresh breath. Made the way our Ba made it.</p>
          <p className="mt-6 text-xs tracking-[0.2em] text-gold uppercase">Join the family</p>
          <div className="mt-3 max-w-sm">
            <NewsletterForm dark />
          </div>
          <div className="mt-6 flex gap-3">
            {[
              { icon: Instagram, href: 'https://instagram.com', label: 'Instagram' },
              { icon: Youtube, href: 'https://youtube.com', label: 'YouTube' },
            ].map(({ icon: Icon, href, label }) => (
              <a key={label} href={href} target="_blank" rel="noreferrer" aria-label={label} className="grid h-10 w-10 place-items-center rounded-full ring-1 ring-cream/20 transition hover:bg-cream hover:text-maroon">
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          {cols.map((c) => (
            <div key={c.title}>
              <p className="text-xs tracking-[0.2em] text-gold uppercase">{c.title}</p>
              <ul className="mt-4 space-y-2.5 text-sm">
                {c.links.map((l) => (
                  <li key={l.to}>
                    <Link href={l.to} className="link-underline transition hover:text-cream">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div className="col-span-2 sm:col-span-1">
            <p className="text-xs tracking-[0.2em] text-gold uppercase">Visit</p>
            <ul className="mt-4 space-y-3 text-sm">
              <li className="flex gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold" /> Navrangpura, Ahmedabad, Gujarat 380009
              </li>
              <li className="flex gap-2">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-gold" /> +{WHATSAPP_NUMBER.replace(/^91/, '91 ')}
              </li>
              <li className="flex gap-2">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-gold" /> {SUPPORT_EMAIL}
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div className="border-t border-cream/10">
        <div className="container-x flex flex-col items-center justify-between gap-3 py-6 text-xs text-cream/50 sm:flex-row">
          <p>
            © {new Date().getFullYear()} <span className="brand-gu" lang="gu">મીઠુડી મુખવાસ</span>. Handmade in Gujarat with love.
          </p>
          <p className="flex items-center gap-3">
            <span>FSSAI Lic. No. — to be added</span>
            <span aria-hidden>·</span>
            <span>Secure payments by Razorpay</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
