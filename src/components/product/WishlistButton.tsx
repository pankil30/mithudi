'use client';

import { Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/format';
import { useWishlist } from '@/store/wishlist';

export function WishlistButton({ slug, name, className }: { slug: string; name: string; className?: string }) {
  const active = useWishlist((s) => s.slugs.includes(slug));
  const toggle = useWishlist((s) => s.toggle);
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.85 }}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(slug);
      }}
      aria-pressed={active}
      aria-label={active ? `Remove ${name} from wishlist` : `Save ${name} to wishlist`}
      className={cn('grid h-9 w-9 place-items-center rounded-full bg-cream/85 text-maroon shadow-soft backdrop-blur transition hover:bg-white', className)}
    >
      <Heart className={cn('h-4 w-4 transition', active && 'fill-[#C44569] text-[#C44569]')} strokeWidth={1.8} />
    </motion.button>
  );
}
