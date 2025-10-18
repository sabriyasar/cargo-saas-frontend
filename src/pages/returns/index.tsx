import React from 'react';
import AdminLayout from '@/components/Layout';
import ReturnList from '@/components/ReturnList';

export default function ReturnsPage() {
  return (
    <AdminLayout>
      <h2>Returns</h2>
      <ReturnList />
    </AdminLayout>
  );
}
