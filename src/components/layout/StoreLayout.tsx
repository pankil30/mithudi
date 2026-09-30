'use client';

import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { AnnouncementBar } from './AnnouncementBar';
import { CartDrawer } from './CartDrawer';
import { Footer } from './Footer';
import { Header } from './Header';
import { WhatsAppButton } from './WhatsAppButton';

/** Storefront chrome: announcement bar, header, footer, cart drawer and WhatsApp button. */
export function StoreLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [pathname]);
  return (
    <div className="flex min-h-dvh flex-col">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:rounded-full focus:bg-maroon focus:px-4 focus:py-2 focus:text-cream">
        Skip to content
      </a>
      <AnnouncementBar />
      <Header />
      <motion.main
        id="main"
        key={pathname}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="flex-1"
      >
        {children}
      </motion.main>
      <Footer />
      <CartDrawer />
      <WhatsAppButton />
    </div>
  );
}
