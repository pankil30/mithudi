'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Check, RotateCcw, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { adminEnquiries, adminEnquiryAction, type Enquiry } from '@/lib/admin-php';
import { cn, formatDate } from '@/lib/format';
import { AdminTitle } from './AdminLayout';

const TYPES = [
  { id: '', label: 'All' },
  { id: 'BULK', label: 'Bulk / corporate' },
  { id: 'CONTACT', label: 'Contact' },
  { id: 'NEWSLETTER', label: 'Newsletter' },
];

export default function AdminEnquiries() {
  const [type, setType] = useState('');
  const [handled, setHandled] = useState<'' | '0' | '1'>('');
  const qc = useQueryClient();
  const { data = [], error } = useQuery({ queryKey: ['admin', 'enquiries', type, handled], queryFn: () => adminEnquiries(type, handled) });
  const act = useMutation({
    mutationFn: ({ action, id }: { action: 'toggle' | 'delete'; id: string }) => adminEnquiryAction(action, id),
    onSuccess: (_r, v) => {
      if (v.action === 'delete') toast.success('Enquiry deleted');
      qc.invalidateQueries({ queryKey: ['admin'] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : 'Could not update'),
  });
  const toggle = { mutate: (e: Enquiry) => act.mutate({ action: 'toggle', id: e.id }) };
  return (
    <>
      <AdminTitle title="Enquiries">
        <select className="input h-10 w-auto py-0 text-sm" value={handled} onChange={(e) => setHandled(e.target.value as '' | '0' | '1')} aria-label="Status">
          <option value="">Open & handled</option>
          <option value="0">Open only</option>
          <option value="1">Handled only</option>
        </select>
      </AdminTitle>
      {error && <p className="mb-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error.message}</p>}
      <div className="no-scrollbar mb-4 flex gap-2 overflow-x-auto">
        {TYPES.map((t) => (
          <button key={t.id} onClick={() => setType(t.id)} className={cn('shrink-0 rounded-full px-4 py-1.5 text-sm', type === t.id ? 'bg-maroon text-cream' : 'bg-white ring-1 ring-line')}>
            {t.label}
          </button>
        ))}
      </div>
      <ul className="space-y-3">
        {data.map((e) => (
          <li key={e.id} className={cn('card p-5', e.handled && 'opacity-60')}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <span className="rounded-full bg-sand px-2.5 py-0.5 text-[10px] tracking-wider text-maroon uppercase">{e.type}</span>
                <p className="mt-2 font-medium text-maroon">{e.name || e.email}</p>
                <p className="text-xs text-muted">
                  {[e.email, e.phone].filter(Boolean).map((x) => x).join(' · ')} · {formatDate(e.createdAt)}
                </p>
              </div>
              <div className="flex gap-2">
              {e.type !== 'NEWSLETTER' && (
                <button onClick={() => toggle.mutate(e)} className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs ring-1 ring-line hover:bg-white">
                  {e.handled ? (
                    <>
                      <RotateCcw className="h-3.5 w-3.5" /> Reopen
                    </>
                  ) : (
                    <>
                      <Check className="h-3.5 w-3.5" /> Mark handled
                    </>
                  )}
                </button>
              )}
              <button onClick={() => confirm('Delete this enquiry?') && act.mutate({ action: 'delete', id: e.id })} className="rounded-full p-1.5 text-muted ring-1 ring-line hover:text-red-600" aria-label="Delete enquiry">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
              </div>
            </div>
            {e.message && <p className="mt-2 text-sm whitespace-pre-line break-words text-ink/80">{e.message}</p>}
            {e.phone && e.type !== 'NEWSLETTER' && (
              <a href={`https://wa.me/${e.phone.replace(/\D/g, '').replace(/^(?=\d{10}$)/, '91')}`} target="_blank" rel="noreferrer" className="mt-3 inline-block text-xs text-saffron-deep underline">
                Reply on WhatsApp
              </a>
            )}
          </li>
        ))}
        {data.length === 0 && <li className="card p-10 text-center text-muted">Nothing here yet.</li>}
      </ul>
    </>
  );
}
