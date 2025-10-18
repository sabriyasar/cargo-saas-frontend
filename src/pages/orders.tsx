import React from 'react';
import AdminLayout from '@/components/Layout';
import OrderList from '@/components/OrderList';

export default function OrdersPage() {
  return (
    <AdminLayout>
      <h2>Shopify Orders</h2>
      <OrderList />
    </AdminLayout>
  );
}
