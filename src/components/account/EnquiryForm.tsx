'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Field, TextArea } from '@/components/ui/Field';
import { php } from '@/lib/php';
import { cn } from '@/lib/format';

type Kind = 'CONTACT' | 'BULK' | 'WEDDING';

export function EnquiryForm({ kinds, className }: { kinds: Kind[]; className?: string }) {
  const [type, setType] = useState<Kind>(kinds[0]);
  const [f, setF] = useState({ name: '', email: '', phone: '', company: '', eventDate: '', quantity: '', city: '', message: '' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => setF({ ...f, [k]: e.target.value });

  if (sent) {
    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={cn('card p-10 text-center', className)}>
        <CheckCircle2 className="mx-auto h-12 w-12 text-leaf" />
        <p className="mt-4 font-serif text-3xl text-maroon">Thank you, {f.name.split(' ')[0]}!</p>
        <p className="mt-2 text-muted">We’ve received your message and will get back to you within one working day.</p>
      </motion.div>
    );
  }

  const labels: Record<Kind, string> = { CONTACT: 'General enquiry', BULK: 'Bulk / corporate', WEDDING: 'Wedding gifting' };
  return (
    <form
      className={cn('card grid gap-4 p-6 sm:grid-cols-2 sm:p-8', className)}
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        setError('');
        try {
          // enquiries/add.php stores CONTACT / BULK / NEWSLETTER + one message field,
          // so wedding & bulk details are folded into the message.
          const extra = [
            type === 'WEDDING' && 'Wedding gifting enquiry',
            f.company && `Company: ${f.company}`,
            f.eventDate && `Event date: ${f.eventDate}`,
            f.quantity && `Quantity: ${f.quantity}`,
            f.city && `City: ${f.city}`,
          ].filter(Boolean);
          await php('enquiries/add.php', {
            body: {
              type: type === 'CONTACT' ? 'CONTACT' : 'BULK',
              name: f.name.trim(),
              email: f.email.trim(),
              phone: f.phone.trim(),
              message: [...extra, f.message.trim()].filter(Boolean).join('\n'),
            },
          });
          setSent(true);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Could not send your message');
        } finally {
          setBusy(false);
        }
      }}
    >
      {kinds.length > 1 && (
        <div className="flex flex-wrap gap-2 sm:col-span-2">
          {kinds.map((k) => (
            <button
              type="button"
              key={k}
              onClick={() => setType(k)}
              className={cn('rounded-full px-4 py-2 text-sm transition', type === k ? 'bg-maroon text-cream' : 'bg-white text-maroon ring-1 ring-line')}
            >
              {labels[k]}
            </button>
          ))}
        </div>
      )}
      <Field label="Your name" required value={f.name} onChange={set('name')} autoComplete="name" />
      <Field label="Email" type="email" required value={f.email} onChange={set('email')} autoComplete="email" />
      <Field label="Mobile / WhatsApp" type="tel" value={f.phone} onChange={set('phone')} autoComplete="tel" />
      {type === 'BULK' && <Field label="Company" value={f.company} onChange={set('company')} autoComplete="organization" />}
      {type === 'WEDDING' && <Field label="Event date" type="date" value={f.eventDate} onChange={set('eventDate')} />}
      {type !== 'CONTACT' && (
        <>
          <Field label="Approx. quantity" placeholder="e.g. 250 mini jars" value={f.quantity} onChange={set('quantity')} />
          <Field label="Delivery city" value={f.city} onChange={set('city')} />
        </>
      )}
      <TextArea
        className="sm:col-span-2"
        label={type === 'CONTACT' ? 'Message' : 'Tell us about your occasion'}
        required={type === 'CONTACT'}
        value={f.message}
        onChange={set('message')}
        placeholder={type === 'WEDDING' ? 'Functions, colour palette, custom tag text…' : ''}
      />
      {error && <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700 sm:col-span-2">{error}</p>}
      <Button size="lg" loading={busy} className="sm:col-span-2 sm:justify-self-start">
        {type === 'CONTACT' ? 'Send message' : 'Request a quote'}
      </Button>
    </form>
  );
}
