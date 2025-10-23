import React from 'react';
import AdminLayout from '@/components/Layout';
import OrderList from '@/components/OrderList';
import IndividualShipment from '@/components/IndividualShipment';

export default function OrdersPage() {
  return (
    <AdminLayout>
      <h2>Bireysel Gönderim</h2>
      <IndividualShipment />
    </AdminLayout>
  );
}
