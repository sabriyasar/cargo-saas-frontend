import React, { useEffect, useState } from 'react';
import { Table, message } from 'antd';
import AdminLayout from '@/components/Layout';
import axios from 'axios';

interface Shop {
  _id: string;
  shop: string;
  createdAt?: string;
  updatedAt?: string;
}

export default function ShopsPage() {
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3003';

  useEffect(() => {
    const fetchShops = async () => {
      try {
        const res = await axios.get(`${API_URL}/shopify/list`);
        setShops(res.data.data || []);
      } catch (err: any) {
        console.error('Shop list fetch hatası:', err.message || err);
        message.error('Mağaza listesi alınamadı');
      } finally {
        setLoading(false);
      }
    };

    fetchShops();
  }, []);

  const columns = [
    { title: 'Mağaza', dataIndex: 'shop', key: 'shop' },
    { title: 'Kayıt Tarihi', dataIndex: 'createdAt', key: 'createdAt' },
    { title: 'Güncelleme Tarihi', dataIndex: 'updatedAt', key: 'updatedAt' },
  ];

  return (
    <AdminLayout>
      <h2>Aktif Shopify Mağazaları</h2>
      <Table
        rowKey="_id"
        columns={columns}
        dataSource={shops}
        loading={loading}
        bordered
      />
    </AdminLayout>
  );
}
