'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { adminCouponAction, adminCoupons, adminSaveCoupon, type Coupon } from '@/lib/admin-php';
import { formatDate, formatINR } from '@/lib/format';
import { AdminTitle } from './AdminLayout';

interface Form {
  code: string;
  type: 'percent' | 'flat';
  value: number | string;
  minOrder: number | string;
  maxDiscount: number | string;
  usageLimit: number | string;
  description: string;
  expiresAt: string;
  isActive: boolean;
}

const BLANK: Form = { code: '', type: 'percent', value: 10, minOrder: 0, maxDiscount: '', usageLimit: '', description: '', expiresAt: '', isActive: true };

export default function AdminCoupons() {
  const qc = useQueryClient();
  const { data = [], error } = useQuery({ queryKey: ['admin', 'coupons'], queryFn: adminCoupons });
  const [editing, setEditing] = useState<{ id?: string; form: Form } | null>(null);

  const save = useMutation({
    mutationFn: ({ id, form }: { id?: string; form: Form }) =>
      adminSaveCoupon(id, {
        code: form.code,
        description: form.description,
        type: form.type,
        isActive: form.isActive,
        value: +form.value,
        minOrder: +form.minOrder || 0,
        maxDiscount: form.maxDiscount === '' ? null : +form.maxDiscount,
        usageLimit: form.usageLimit === '' ? null : +form.usageLimit,
        expiresAt: form.expiresAt ? `${form.expiresAt} 23:59:59` : null,
      }),
    onSuccess: () => {
      toast.success('Coupon saved');
      setEditing(null);
      qc.invalidateQueries({ queryKey: ['admin', 'coupons'] });
      qc.invalidateQueries({ queryKey: ['offers'] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : 'Could not save coupon'),
  });
  const act = useMutation({
    mutationFn: ({ action, id }: { action: 'toggle' | 'delete'; id: string }) => adminCouponAction(action, id),
    onSuccess: (_r, v) => {
      toast.success(v.action === 'delete' ? 'Coupon deleted' : 'Coupon updated');
      qc.invalidateQueries({ queryKey: ['admin', 'coupons'] });
      qc.invalidateQueries({ queryKey: ['offers'] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : 'Could not update coupon'),
  });

  const f = editing?.form;
  const upd = (k: keyof Form, v: string | number | boolean) => setEditing((e) => e && { ...e, form: { ...e.form, [k]: v } });

  return (
    <>
      <AdminTitle title="Coupons">
        <Button size="sm" onClick={() => setEditing({ form: { ...BLANK } })}>
          <Plus className="h-4 w-4" /> New coupon
        </Button>
      </AdminTitle>

      {error && <p className="mb-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error.message}</p>}
      {f && (
        <form
          className="card mb-6 grid gap-4 p-6 sm:grid-cols-3"
          onSubmit={(e) => {
            e.preventDefault();
            save.mutate(editing!);
          }}
        >
          <Field label="Code" required minLength={3} maxLength={30} value={f.code} onChange={(e) => upd('code', e.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g, ''))} />
          <div>
            <label className="label" htmlFor="ctype">
              Type
            </label>
            <select id="ctype" className="input" value={f.type} onChange={(e) => upd('type', e.target.value)}>
              <option value="percent">Percentage off</option>
              <option value="flat">Flat ₹ off</option>
            </select>
          </div>
          <Field label={f.type === 'percent' ? 'Percent' : 'Amount ₹'} type="number" min={1} max={f.type === 'percent' ? 100 : undefined} required value={f.value} onChange={(e) => upd('value', e.target.value)} />
          <Field label="Minimum order ₹" type="number" min={0} value={f.minOrder} onChange={(e) => upd('minOrder', e.target.value)} />
          <Field label="Max discount ₹ (optional)" type="number" min={1} value={f.maxDiscount} onChange={(e) => upd('maxDiscount', e.target.value)} />
          <Field label="Usage limit (optional)" type="number" min={1} value={f.usageLimit} onChange={(e) => upd('usageLimit', e.target.value)} />
          <Field className="sm:col-span-2" label="Description (shown to customers)" value={f.description} onChange={(e) => upd('description', e.target.value)} />
          <Field label="Expires on (optional)" type="date" value={f.expiresAt} onChange={(e) => upd('expiresAt', e.target.value)} />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" className="h-4 w-4 accent-maroon" checked={f.isActive} onChange={(e) => upd('isActive', e.target.checked)} /> Active
          </label>
          <div className="flex gap-2 sm:col-span-3">
            <Button loading={save.isPending}>Save coupon</Button>
            <Button type="button" variant="ghost" onClick={() => setEditing(null)}>
              Cancel
            </Button>
          </div>
        </form>
      )}

      <div className="card overflow-x-auto">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="border-b border-line text-left text-xs tracking-wider text-muted uppercase">
            <tr>
              {['Code', 'Discount', 'Min order', 'Used', 'Expires', 'Status', ''].map((h) => (
                <th key={h} className="px-5 py-3 font-medium">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {data.map((c) => (
              <tr key={c.id}>
                <td className="px-5 py-3">
                  <span className="font-medium tracking-wider text-maroon">{c.code}</span>
                  <p className="text-xs text-muted">{c.description}</p>
                </td>
                <td className="px-5 py-3">
                  {c.type === 'percent' ? `${c.value}%` : formatINR(c.value)}
                  {c.maxDiscount ? <span className="text-xs text-muted"> (max {formatINR(c.maxDiscount)})</span> : null}
                </td>
                <td className="px-5 py-3">{formatINR(c.minOrder)}</td>
                <td className="px-5 py-3">
                  {c.usedCount}
                  {c.usageLimit ? ` / ${c.usageLimit}` : ''}
                </td>
                <td className="px-5 py-3 text-xs">{c.expiresAt ? formatDate(c.expiresAt) : '—'}</td>
                <td className="px-5 py-3 text-xs">
                  <button onClick={() => act.mutate({ action: 'toggle', id: c.id })} title="Click to switch on / off">
                    {c.isActive ? <span className="rounded-full bg-leaf/15 px-2.5 py-1 text-leaf-deep">Active</span> : <span className="rounded-full bg-sand px-2.5 py-1">Off</span>}
                  </button>
                </td>
                <td className="px-5 py-3 text-right whitespace-nowrap">
                  <button
                    className="rounded-full p-2 text-muted hover:text-maroon"
                    aria-label={`Edit ${c.code}`}
                    onClick={() =>
                      setEditing({
                        id: c.id,
                        form: {
                          code: c.code,
                          type: c.type,
                          value: c.value,
                          minOrder: c.minOrder,
                          description: c.description,
                          isActive: c.isActive,
                          maxDiscount: c.maxDiscount ?? '',
                          usageLimit: c.usageLimit ?? '',
                          expiresAt: c.expiresAt ? c.expiresAt.slice(0, 10) : '',
                        },
                      })
                    }
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button className="rounded-full p-2 text-muted hover:text-red-600" aria-label={`Delete ${c.code}`} onClick={() => confirm(`Delete ${c.code}?`) && act.mutate({ action: 'delete', id: c.id })}>
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
            {data.length === 0 && (
              <tr>
                <td colSpan={7} className="px-5 py-12 text-center text-muted">
                  No coupons yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
