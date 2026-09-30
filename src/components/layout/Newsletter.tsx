'use client';

import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { php } from '@/lib/php';
import { cn } from '@/lib/format';

export function NewsletterForm({ dark }: { dark?: boolean }) {
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  if (done) return <p className={cn('text-sm', dark ? 'text-gold-soft' : 'text-leaf-deep')}>Thank you — look out for festive recipes and early access to new blends.</p>;
  return (
    <form
      className={cn('flex items-center gap-2 rounded-full p-1.5 ring-1', dark ? 'bg-white/5 ring-white/15' : 'bg-white ring-line')}
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        try {
          await php('enquiries/add.php', { body: { type: 'NEWSLETTER', email: email.trim() } });
          setDone(true);
        } catch (err) {
          toast.error(err instanceof Error ? err.message : 'Please try again');
        } finally {
          setBusy(false);
        }
      }}
    >
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Your email address"
        aria-label="Email address"
        className={cn('min-w-0 flex-1 bg-transparent px-4 text-sm outline-none', dark ? 'text-cream placeholder:text-cream/40' : 'text-ink placeholder:text-muted/60')}
      />
      <button
        disabled={busy}
        className={cn('grid h-10 w-10 shrink-0 place-items-center rounded-full transition', dark ? 'bg-gold text-maroon-deep hover:bg-gold-soft' : 'bg-maroon text-cream hover:bg-maroon-deep')}
        aria-label="Subscribe"
      >
        <ArrowRight className="h-4 w-4" />
      </button>
    </form>
  );
}
