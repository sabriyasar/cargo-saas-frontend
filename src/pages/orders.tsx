import React, { useEffect, useState } from 'react';
import { Table, message, Input } from 'antd';
import AdminLayout from '@/components/Layout';
import MNGShipmentForm from '@/components/MNGShipmentForm';
import createApp from '@shopify/app-bridge';
import { getSessionToken } from '@shopify/app-bridge-utils';
import axios from 'axios';
import { useRouter } from 'next/router';

interface Customer {
  name: string;
  email?: string;
  phone?: string;
  cityName?: string;
  districtName?: string;
  address?: string;
  shop?: string;
}

export interface Order {
  id: string;
  name: string;
  total_price: string;
  customer: Customer;
  trackingNumber?: string;
  labelUrl?: string;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3003';

  useEffect(() => {
    if (!router.isReady) return;

    const host = router.query.host as string;
    if (!host) {
      console.error('Shopify host parametresi yok');
      setLoading(false);
      return;
    }

    const app = createApp({
      apiKey: process.env.NEXT_PUBLIC_SHOPIFY_API_KEY!,
      host,
      forceRedirect: true,
    });

    getSessionToken(app).then(async (token: string) => {
      try {
        const res = await axios.get(`${API_URL}/shopify/orders`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Backend’den gelen siparişleri state’e ata
        setOrders(res.data.data || []);
      } catch (err: any) {
        console.error('Orders fetch hatası:', err.message || err);
        message.error('Siparişler alınamadı');
      } finally {
        setLoading(false);
      }
    });
  }, [router.isReady, router.query.host]);

  const handleShipmentCreated = async (orderId: string, trackingNumber: string, labelUrl: string, shopDomain: string) => {
    setOrders(prev =>
      prev.map(o => (o.id === orderId ? { ...o, trackingNumber, labelUrl } : o))
    );

    try {
      const res = await axios.get(`${API_URL}/shopify/settings/${shopDomain}`);
      const accessToken = res.data.accessToken;
      if (!accessToken) return;

      await axios.post(
        `https://${shopDomain}/admin/api/2025-10/orders/${orderId}/fulfillments.json`,
        { fulfillment: { tracking_number: trackingNumber, notify_customer: true } },
        { headers: { 'X-Shopify-Access-Token': accessToken } }
      );
    } catch (err) {
      console.error('Shopify fulfillment oluşturulamadı:', err);
    }
  };

  const handleEmailChange = (id: string, value: string) => {
    setOrders(prev =>
      prev.map(o => (o.id === id ? { ...o, customer: { ...o.customer, email: value } } : o))
    );
  };

  const columns = [
    { title: 'Sipariş Numarası', dataIndex: 'name', key: 'name' },
    { title: 'Müşteri', dataIndex: ['customer', 'name'], key: 'customer' },
    { 
      title: 'E-Posta', 
      key: 'email', 
      render: (_: any, record: Order) => (
        <Input value={record.customer.email} placeholder="E-posta giriniz" onChange={e => handleEmailChange(record.id, e.target.value)} />
      )
    },
    { title: 'Telefon', dataIndex: ['customer', 'phone'], key: 'phone' },
    { 
      title: 'Adres', 
      key: 'address', 
      render: (_: any, record: Order) => `${record.customer.address}, ${record.customer.districtName}, ${record.customer.cityName}`
    },
    {
      title: 'Takip No',
      key: 'tracking',
      render: (_: any, record: Order) => record.trackingNumber || '-',
    },
    {
      title: 'Kargo',
      key: 'shipment',
      render: (_: any, record: Order) => (
        <MNGShipmentForm
          order={record}
          onShipmentCreated={(orderId, trackingNumber, labelUrl) => handleShipmentCreated(orderId, trackingNumber, labelUrl, record.customer.shop || '')}
        />
      ),
    },
  ];

  return (
    <AdminLayout>
      <h2>Shopify Siparişleri</h2>
      <Table
        rowKey="id"
        columns={columns}
        dataSource={orders}
        loading={loading}
        bordered
        scroll={{ x: 'max-content' }}
      />
    </AdminLayout>
  );
}
