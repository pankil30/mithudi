// 'use client';

// import { useState } from 'react';
// import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
// import { FolderTree, ImagePlus, Pencil, Plus, Trash2 } from 'lucide-react';
// import { toast } from 'sonner';
// import { Button } from '@/components/ui/Button';
// import { Field } from '@/components/ui/Field';
// import { Skeleton } from '@/components/ui/Skeleton';
// import { adminCategories, adminDeleteCategory, adminSaveCategory, type AdminCategory } from '@/lib/admin-php';
// import { AdminTitle } from './AdminLayout';

// interface Editing {
//   id?: string;
//   name: string;
//   description: string;
//   image: File | null;
//   preview: string | null;
// }

// export default function AdminCategories() {
//   const qc = useQueryClient();
//   const { data = [], isLoading, error } = useQuery({ queryKey: ['admin', 'categories'], queryFn: adminCategories });
//   const [editing, setEditing] = useState<Editing | null>(null);
//     const [deleting, setDeleting] = useState<{ cat: AdminCategory; moveTo: string } | null>(null);

//   const refresh = () => {
//     qc.invalidateQueries({ queryKey: ['admin', 'categories'] });
//     qc.invalidateQueries({ queryKey: ['categories'] });
//   };

//   const save = useMutation({
//     mutationFn: (e: Editing) => adminSaveCategory({ id: e.id, name: e.name.trim(), description: e.description.trim(), image: e.image }),
//     onSuccess: () => {
//       toast.success(editing?.id ? 'Category updated' : 'Category created');
//       setEditing(null);
//       refresh();
//     },
//     onError: (e) => toast.error(e instanceof Error ? e.message : 'Could not save category'),
//   });

//   const del = useMutation({
//     mutationFn: ({ id, moveTo }: { id: string; moveTo?: string }) => adminDeleteCategory(id, moveTo),
//     onSuccess: (r) => {
//       toast.success(r?.message || 'Category deleted');
//       setDeleting(null);
//       refresh();
//       qc.invalidateQueries({ queryKey: ['admin', 'products'] });
//       qc.invalidateQueries({ queryKey: ['products'] });
//     },
//     onError: (e) => toast.error(e instanceof Error ? e.message : 'Could not delete category'),
//   });

//   const askDelete = (c: AdminCategory) => {
//     if (c.productCount) {
//       const other = data.find((x) => x.id !== c.id);
//       if (!other) return toast.error('Create another category first, so its products have somewhere to go.');
//       setDeleting({ cat: c, moveTo: other.id });
//     } else if (confirm(`Delete "${c.name}"?`)) {
//       del.mutate({ id: c.id });
//     }
//   };

//   const edit = (c?: AdminCategory) => setEditing(c ? { id: c.id, name: c.name, description: c.description, image: null, preview: c.image } : { name: '', description: '', image: null, preview: null });

//   return (
//     <>
//       <AdminTitle title="Categories">
//         <Button size="sm" onClick={() => edit()}>
//           <Plus className="h-4 w-4" /> New category
//         </Button>
//       </AdminTitle>

//       {editing && (
//         <form
//           className="card mb-6 grid gap-4 p-5 sm:grid-cols-[140px_1fr] sm:p-6"
//           onSubmit={(e) => {
//             e.preventDefault();
//             save.mutate(editing);
//           }}
//         >
//           <label className="relative grid aspect-square cursor-pointer place-items-center overflow-hidden rounded-2xl border-2 border-dashed border-line bg-sand/40 hover:border-maroon/40">
//             {editing.preview ? <img src={editing.preview} alt="" className="absolute inset-0 h-full w-full object-cover" /> : <ImagePlus className="h-7 w-7 text-muted" />}
//             <input
//               type="file"
//               accept="image/jpeg,image/png,image/webp"
//               className="sr-only"
//               onChange={(e) => {
//                 const f = e.target.files?.[0];
//                 if (!f) return;
//                 if (f.size > 2 * 1024 * 1024) return toast.error('Image must be under 2 MB');
//                 setEditing({ ...editing, image: f, preview: URL.createObjectURL(f) });
//               }}
//             />
//           </label>
//           <div className="space-y-4">
//             <Field label="Name" required value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} placeholder="Gift Boxes" />
//             <div>
//               <label className="label" htmlFor="cdesc">
//                 Description (optional)
//               </label>
//               <textarea id="cdesc" className="input min-h-20" value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} />
//             </div>
//             <div className="flex gap-2">
//               <Button loading={save.isPending}>{editing.id ? 'Save category' : 'Create category'}</Button>
//               <Button type="button" variant="ghost" onClick={() => setEditing(null)}>
//                 Cancel
//               </Button>
//             </div>
//           </div>
//         </form>
//       )}
//             {deleting && (
//         <div className="card mb-6 space-y-4 border border-red-200 p-5 sm:p-6">
//           <p className="text-maroon">
//             <strong>{deleting.cat.name}</strong> has {deleting.cat.productCount} product(s). Move them to:
//           </p>
//           <select className="input sm:max-w-xs" value={deleting.moveTo} onChange={(e) => setDeleting({ ...deleting, moveTo: e.target.value })} aria-label="Move products to">
//             {data
//               .filter((x) => x.id !== deleting.cat.id)
//               .map((x) => (
//                 <option key={x.id} value={x.id}>
//                   {x.name}
//                 </option>
//               ))}
//           </select>
//           <div className="flex flex-wrap gap-2">
//             <Button className="bg-red-700 hover:bg-red-800" loading={del.isPending} onClick={() => del.mutate({ id: deleting.cat.id, moveTo: deleting.moveTo })}>
//               Move products & delete
//             </Button>
//             <Button type="button" variant="ghost" onClick={() => setDeleting(null)}>
//               Cancel
//             </Button>
//           </div>
//         </div>
//       )}

//       {error && <p className="mb-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error.message}</p>}
//       {isLoading ? (
//         <Skeleton className="h-64" />
//       ) : (
//         <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
//           {data.map((c) => (
//             <li key={c.id} className="card flex items-center gap-4 p-4">
//               <span className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-2xl bg-sand">
//                 {c.image ? <img src={c.image} alt="" className="h-full w-full object-cover" /> : <FolderTree className="h-6 w-6 text-maroon/40" />}
//               </span>
//               <div className="min-w-0 flex-1">
//                 <p className="truncate font-medium text-maroon">{c.name}</p>
//                 <p className="truncate text-xs text-muted">{c.productCount != null ? `${c.productCount} products` : c.description || `#${c.id}`}</p>
//               </div>
//               <button className="rounded-full p-2 text-muted hover:text-maroon" aria-label={`Edit ${c.name}`} onClick={() => edit(c)}>
//                 <Pencil className="h-4 w-4" />
//               </button>
//               <button
//                 className="rounded-full p-2 text-muted hover:text-red-600"
//                 aria-label={`Delete ${c.name}`}
//                 disabled={del.isPending}
//                 onClick={() => askDelete(c)}
//               >
//                 <Trash2 className="h-4 w-4" />
//               </button>
//             </li>
//           ))}
//           {data.length === 0 && <li className="card p-10 text-center text-muted sm:col-span-2 xl:col-span-3">No categories yet.</li>}
//         </ul>
//       )}
//     </>
//   );
// }




'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FolderTree, ImagePlus, Pencil, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { Skeleton } from '@/components/ui/Skeleton';
import { adminCategories, adminDeleteCategory, adminSaveCategory, type AdminCategory } from '@/lib/admin-php';
import { num, PhpError } from '@/lib/php';
import { AdminTitle } from './AdminLayout';

interface Editing {
  id?: string;
  name: string;
  description: string;
  image: File | null;
  preview: string | null;
}

export default function AdminCategories() {
  const qc = useQueryClient();
  const { data = [], isLoading, error } = useQuery({ queryKey: ['admin', 'categories'], queryFn: adminCategories });
  const [editing, setEditing] = useState<Editing | null>(null);
  const [deleting, setDeleting] = useState<{ cat: AdminCategory; count: number; moveTo: string } | null>(null);

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ['admin', 'categories'] });
    qc.invalidateQueries({ queryKey: ['categories'] });
  };

  const save = useMutation({
    mutationFn: (e: Editing) => adminSaveCategory({ id: e.id, name: e.name.trim(), description: e.description.trim(), image: e.image }),
    onSuccess: () => {
      toast.success(editing?.id ? 'Category updated' : 'Category created');
      setEditing(null);
      refresh();
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : 'Could not save category'),
  });

  /** Opens the "move products to…" panel. */
  const openMovePanel = (cat: AdminCategory, count: number) => {
    const other = data.find((x) => x.id !== cat.id);
    if (!other) {
      toast.error('Create another category first, so its products have somewhere to go.');
      return;
    }
    setEditing(null);
    setDeleting({ cat, count, moveTo: other.id });
  };

  const del = useMutation({
    mutationFn: ({ id, moveTo }: { id: string; moveTo?: string }) => adminDeleteCategory(id, moveTo),
    onSuccess: (r) => {
      toast.success(r?.message || 'Category deleted');
      setDeleting(null);
      refresh();
      qc.invalidateQueries({ queryKey: ['admin', 'products'] });
      qc.invalidateQueries({ queryKey: ['products'] });
    },
    onError: (e, v) => {
      // 409 = category still has products (maybe hidden ones the list doesn't count) → ask where to move them
      if (e instanceof PhpError && e.status === 409 && !v.moveTo) {
        const cat = data.find((x) => x.id === v.id);
        const count = num((e.payload as { data?: { product_count?: unknown } })?.data?.product_count, 1);
        if (cat) return openMovePanel(cat, count);
      }
      toast.error(e instanceof Error ? e.message : 'Could not delete category');
    },
  });

  const askDelete = (c: AdminCategory) => {
    if (c.productCount) openMovePanel(c, c.productCount);
    else if (confirm(`Delete "${c.name}"?`)) del.mutate({ id: c.id });
  };

  const edit = (c?: AdminCategory) => {
    setDeleting(null);
    setEditing(c ? { id: c.id, name: c.name, description: c.description, image: null, preview: c.image } : { name: '', description: '', image: null, preview: null });
  };

  return (
    <>
      <AdminTitle title="Categories">
        <Button size="sm" onClick={() => edit()}>
          <Plus className="h-4 w-4" /> New category
        </Button>
      </AdminTitle>

      {editing && (
        <form
          className="card mb-6 grid gap-4 p-5 sm:grid-cols-[140px_1fr] sm:p-6"
          onSubmit={(e) => {
            e.preventDefault();
            save.mutate(editing);
          }}
        >
          <label className="relative grid aspect-square cursor-pointer place-items-center overflow-hidden rounded-2xl border-2 border-dashed border-line bg-sand/40 hover:border-maroon/40">
            {editing.preview ? <img src={editing.preview} alt="" className="absolute inset-0 h-full w-full object-cover" /> : <ImagePlus className="h-7 w-7 text-muted" />}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                if (f.size > 2 * 1024 * 1024) return toast.error('Image must be under 2 MB');
                setEditing({ ...editing, image: f, preview: URL.createObjectURL(f) });
              }}
            />
          </label>
          <div className="space-y-4">
            <Field label="Name" required value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} placeholder="Gift Boxes" />
            <div className="flex gap-2">
              <Button loading={save.isPending}>{editing.id ? 'Save category' : 'Create category'}</Button>
              <Button type="button" variant="ghost" onClick={() => setEditing(null)}>
                Cancel
              </Button>
            </div>
          </div>
        </form>
      )}

      {deleting && (
        <div className="card mb-6 space-y-4 border border-red-200 p-5 sm:p-6">
          <p className="text-maroon">
            <strong>{deleting.cat.name}</strong> has {deleting.count} product(s). Move them to:
          </p>
          <select className="input sm:max-w-xs" value={deleting.moveTo} onChange={(e) => setDeleting({ ...deleting, moveTo: e.target.value })} aria-label="Move products to">
            {data
              .filter((x) => x.id !== deleting.cat.id)
              .map((x) => (
                <option key={x.id} value={x.id}>
                  {x.name}
                </option>
              ))}
          </select>
          <div className="flex flex-wrap gap-2">
            <Button type="button" className="bg-red-700 hover:bg-red-800" loading={del.isPending} onClick={() => del.mutate({ id: deleting.cat.id, moveTo: deleting.moveTo })}>
              Move products & delete
            </Button>
            <Button type="button" variant="ghost" onClick={() => setDeleting(null)}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {error && <p className="mb-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error.message}</p>}
      {isLoading ? (
        <Skeleton className="h-64" />
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {data.map((c) => (
            <li key={c.id} className="card flex items-center gap-4 p-4">
              <span className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-2xl bg-sand">
                {c.image ? <img src={c.image} alt="" className="h-full w-full object-cover" /> : <FolderTree className="h-6 w-6 text-maroon/40" />}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-maroon">{c.name}</p>
                <p className="truncate text-xs text-muted">{c.productCount != null ? `${c.productCount} live products` : `#${c.id}`}</p>
              </div>
              <button className="rounded-full p-2 text-muted hover:text-maroon" aria-label={`Edit ${c.name}`} onClick={() => edit(c)}>
                <Pencil className="h-4 w-4" />
              </button>
              <button className="rounded-full p-2 text-muted hover:text-red-600" aria-label={`Delete ${c.name}`} disabled={del.isPending} onClick={() => askDelete(c)}>
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
          {data.length === 0 && <li className="card p-10 text-center text-muted sm:col-span-2 xl:col-span-3">No categories yet.</li>}
        </ul>
      )}
    </>
  );
}