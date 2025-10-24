import React from 'react';
import AdminLayout from '@/components/Layout';
import SettingsPage from '@/components/Settings';

export default function OrdersPage() {
  return (
    <AdminLayout>
      <h2>Ayarlar</h2>
      <SettingsPage />
    </AdminLayout>
  );
}
