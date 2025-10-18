import React from 'react';
import AdminLayout from '@/components/Layout';
import ShipmentList from '@/components/ShipmentList';

export default function ShipmentsPage() {
  return (
    <AdminLayout>
      <h2>MNG Shipments</h2>
      <ShipmentList />
    </AdminLayout>
  );
}
