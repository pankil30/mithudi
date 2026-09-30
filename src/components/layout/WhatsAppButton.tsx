'use client';

import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { whatsappLink } from '@/lib/contact';
import { cn } from '@/lib/format';


export function WhatsAppButton() {
  const pathname = usePathname() ?? '';
  if (pathname.startsWith('/admin') || pathname.startsWith('/checkout')) return null;
  // Product pages have a sticky add-to-cart bar on mobile; lift the button above it.
  const lifted = pathname.startsWith('/product/');
  return (
    <motion.a
      href={whatsappLink('Hi! I have a question about મીઠુડી મુખવાસ.')}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat with us on WhatsApp"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 1.2, type: 'spring', stiffness: 260, damping: 18 }}
      whileHover={{ scale: 1.08 }}
      className={cn(
        'group fixed right-4 z-40 flex items-center gap-2 rounded-full bg-[#25D366] p-3.5 text-white shadow-lift sm:right-6',
        lifted ? 'bottom-24 lg:bottom-6' : 'bottom-5 sm:bottom-6',
      )}
    >
      <svg viewBox="0 0 32 32" className="h-6 w-6" fill="currentColor" aria-hidden>
        <path d="M16.04 3C9.4 3 4 8.36 4 14.97c0 2.11.56 4.17 1.62 5.99L4 29l8.25-1.6a12.1 12.1 0 0 0 3.79.61h.01C22.68 28 28 22.64 28 16.03 28 9.4 22.68 3 16.04 3Zm0 22.9c-1.23 0-2.44-.24-3.57-.7l-.26-.1-4.9.95.98-4.73-.17-.28a9.9 9.9 0 0 1-1.52-5.27c0-5.5 4.47-9.97 9.95-9.97 5.47 0 9.93 4.47 9.93 9.98 0 5.66-4.46 10.12-10.44 10.12Zm5.46-7.42c-.3-.15-1.77-.87-2.04-.97-.28-.1-.48-.15-.68.15-.2.3-.78.97-.96 1.17-.17.2-.35.22-.65.07a8.2 8.2 0 0 1-2.4-1.48 9 9 0 0 1-1.66-2.07c-.17-.3 0-.46.13-.61.13-.13.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2.05-.38-.02-.53-.08-.15-.68-1.64-.93-2.24-.25-.59-.5-.5-.68-.51h-.58c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.49s1.07 2.89 1.22 3.09c.15.2 2.1 3.2 5.08 4.49.71.3 1.27.49 1.7.63.72.23 1.37.2 1.88.12.58-.09 1.77-.72 2.02-1.42.25-.7.25-1.3.18-1.42-.08-.13-.28-.2-.58-.35Z" />
      </svg>
      <span className="hidden max-w-0 overflow-hidden text-sm font-medium whitespace-nowrap transition-all duration-500 group-hover:max-w-40 sm:inline">Chat with us</span>
    </motion.a>
  );
}
