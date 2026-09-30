import ProductEdit from '@/views/admin/ProductEdit';

export default async function AdminProductEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ProductEdit id={id} />;
}
