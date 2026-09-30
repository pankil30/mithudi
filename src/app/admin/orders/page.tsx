import { Suspense } from 'react';
import AdminOrders from '@/views/admin/Orders';

export default function AdminOrdersPage() {
  return (
    <Suspense>
      <AdminOrders />
    </Suspense>
  );
}
