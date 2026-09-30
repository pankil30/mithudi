'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, ImagePlus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button, ButtonLink } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { Skeleton } from '@/components/ui/Skeleton';
import { adminCategories, adminCreateProduct, adminDeleteProduct, adminProduct, adminUpdateProduct, type ProductInput } from '@/lib/admin-php';
import { formatINR, percentOff } from '@/lib/format';
import { AdminTitle } from './AdminLayout';

type Draft = Omit<ProductInput, 'price' | 'discountPrice' | 'stock'> & { price: string; discountPrice: string; stock: string };

const EMPTY: Draft = { name: '', categoryId: '', description: '', price: '', discountPrice: '', stock: '50', weight: '100g', isActive: true, isFeatured: false, image: null };

export default function ProductEdit({ id }: { id: string }) {
  const isNew = id === 'new';
  const router = useRouter();
  const qc = useQueryClient();
  const { data: existing, isLoading, error } = useQuery({ queryKey: ['admin', 'product', id], queryFn: () => adminProduct(id), enabled: !isNew });
  const { data: categories = [] } = useQuery({ queryKey: ['admin', 'categories'], queryFn: adminCategories });
  const [d, setD] = useState<Draft>(EMPTY);
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    if (!existing) return;
    setD({
      name: existing.name,
      categoryId: existing.categoryId,
      description: existing.description,
      price: String(existing.price || ''),
      discountPrice: existing.discountPrice != null ? String(existing.discountPrice) : '',
      stock: String(existing.stock),
      weight: existing.weight,
      isActive: existing.isActive,
      isFeatured: existing.isBestSeller,
      image: null,
    });
    setPreview(existing.images[0] ?? null);
  }, [existing]);

  useEffect(() => {
    if (isNew && !d.categoryId && categories[0]) setD((x) => ({ ...x, categoryId: categories[0].id }));
  }, [isNew, categories, d.categoryId]);

  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setD((x) => ({ ...x, [k]: v }));

  const input = (): ProductInput => ({
    ...d,
    name: d.name.trim(),
    description: d.description.trim(),
    price: Number(d.price),
    discountPrice: d.discountPrice === '' ? null : Number(d.discountPrice),
    stock: Math.max(0, Math.floor(Number(d.stock) || 0)),
  });

  const save = useMutation({
    mutationFn: async () => {
      const p = input();
      if (p.discountPrice != null && p.discountPrice >= p.price) throw new Error('Sale price must be lower than the price');
      if (isNew) return adminCreateProduct(p);
      await adminUpdateProduct(id, p);
      return id;
    },
    onSuccess: (newId) => {
      toast.success(isNew ? 'Product created' : 'Product saved');
      qc.invalidateQueries({ queryKey: ['admin'] });
      qc.invalidateQueries({ queryKey: ['products'] });
      qc.invalidateQueries({ queryKey: ['product'] });
      router.replace(isNew && newId ? `/admin/products/${newId}` : '/admin/products');
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : 'Could not save'),
  });

  const remove = useMutation({
    mutationFn: () => adminDeleteProduct(id),
    onSuccess: () => {
      toast.success('Product deleted');
      qc.invalidateQueries({ queryKey: ['admin'] });
      qc.invalidateQueries({ queryKey: ['products'] });
      router.push('/admin/products');
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : 'Could not delete'),
  });

  function pickImage(file: File | undefined) {
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) return toast.error('Only JPG, PNG or WEBP images');
    if (file.size > 2 * 1024 * 1024) return toast.error('Image must be under 2 MB');
    set('image', file);
    setPreview(URL.createObjectURL(file));
  }

  if (!isNew && isLoading) return <Skeleton className="h-96" />;
  if (!isNew && error) return <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error.message}</p>;

  const price = Number(d.price) || 0;
  const sale = d.discountPrice === '' ? null : Number(d.discountPrice);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        save.mutate();
      }}
    >
      <AdminTitle title={isNew ? 'New product' : d.name || 'Edit product'}>
        <div className="flex flex-wrap gap-2">
          <ButtonLink href="/admin/products" variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4" /> Back
          </ButtonLink>
          {!isNew && (
            <Button type="button" variant="outline" size="sm" loading={remove.isPending} onClick={() => confirm('Delete this product?') && remove.mutate()}>
              <Trash2 className="h-4 w-4" /> Delete
            </Button>
          )}
          <Button size="sm" loading={save.isPending}>
            Save product
          </Button>
        </div>
      </AdminTitle>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <section className="card space-y-4 p-5 sm:p-6">
            <h2 className="text-2xl">Details</h2>
            <Field label="Product name" required value={d.name} onChange={(e) => set('name', e.target.value)} placeholder="Rose Gulkand Fennel" />
            <div>
              <label className="label" htmlFor="desc">
                Description
              </label>
              <textarea id="desc" className="input min-h-32" value={d.description} onChange={(e) => set('description', e.target.value)} placeholder="Taste, ingredients, how to enjoy it…" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label" htmlFor="cat">
                  Category
                </label>
                <select id="cat" className="input" required value={d.categoryId} onChange={(e) => set('categoryId', e.target.value)}>
                  <option value="" disabled>
                    Choose a category
                  </option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <Field label="Pack size" value={d.weight} onChange={(e) => set('weight', e.target.value)} placeholder="100g, 250g, 1 box" />
            </div>
          </section>

          <section className="card space-y-4 p-5 sm:p-6">
            <h2 className="text-2xl">Price & stock</h2>
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Price (MRP) ₹" type="number" min={1} step="0.01" required value={d.price} onChange={(e) => set('price', e.target.value)} />
              <Field label="Sale price ₹ (optional)" type="number" min={1} step="0.01" value={d.discountPrice} onChange={(e) => set('discountPrice', e.target.value)} />
              <Field label="Stock" type="number" min={0} required value={d.stock} onChange={(e) => set('stock', e.target.value)} />
            </div>
            {price > 0 && (
              <p className="text-sm text-muted">
                Customers pay <strong className="text-maroon">{formatINR(sale ?? price)}</strong>
                {sale != null && sale < price && ` · ${percentOff(sale, price)}% off`}
                {sale != null && sale >= price && <span className="text-red-600"> · sale price must be lower than MRP</span>}
              </p>
            )}
          </section>
        </div>

        <div className="space-y-6">
          <section className="card space-y-4 p-5 sm:p-6">
            <h2 className="text-2xl">Image</h2>
            <label className="group relative grid aspect-[4/5] cursor-pointer place-items-center overflow-hidden rounded-2xl border-2 border-dashed border-line bg-sand/40 hover:border-maroon/40">
              {preview ? (
                <img src={preview} alt="" className="absolute inset-0 h-full w-full object-cover" />
              ) : (
                <span className="flex flex-col items-center gap-2 text-sm text-muted">
                  <ImagePlus className="h-8 w-8" /> Add photo
                </span>
              )}
              <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(e) => pickImage(e.target.files?.[0])} />
              {preview && <span className="absolute bottom-3 rounded-full bg-cream/90 px-3 py-1 text-xs text-maroon opacity-0 transition group-hover:opacity-100">Change photo</span>}
            </label>
            <p className="text-xs text-muted">JPG, PNG or WEBP · max 2 MB</p>
          </section>

          <section className="card space-y-3 p-5 sm:p-6">
            <h2 className="text-2xl">Visibility</h2>
            <label className="flex items-center gap-3 text-sm">
              <input type="checkbox" className="h-4 w-4 accent-maroon" checked={d.isActive} onChange={(e) => set('isActive', e.target.checked)} />
              Show in the store
            </label>
            <label className="flex items-center gap-3 text-sm">
              <input type="checkbox" className="h-4 w-4 accent-maroon" checked={d.isFeatured} onChange={(e) => set('isFeatured', e.target.checked)} />
              Bestseller (shown on the home page)
            </label>
          </section>

          <Button className="w-full" size="lg" loading={save.isPending}>
            Save product
          </Button>
        </div>
      </div>
    </form>
  );
}
