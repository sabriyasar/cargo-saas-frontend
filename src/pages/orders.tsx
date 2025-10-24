// pages/orders.tsx
import React, { useEffect, useState } from 'react';
import { Table, message, Input } from 'antd';
import AdminLayout from '@/components/Layout';
import MNGShipmentForm from '@/components/MNGShipmentForm';
import { getShopifyOrders } from '@/services/api';
import { getSessionToken } from '@shopify/app-bridge-utils';
import createApp from '@shopify/app-bridge';
import { useRouter } from 'next/router';

interface Customer {
  name: string;
  email?: string;
  phone?: string;
  cityName?: string;
  districtName?: string;
  address?: string;
  shop?: string; // shop domain backend’den geliyorsa
}

export interface Order {
  id: string;
  name: string;
  total_price: string;
  currency?: string;
  order_status_url?: string;
  line_items?: { title: string; quantity: number }[];
  customer: Customer;
  created_at?: string;
  trackingNumber?: string;
  labelUrl?: string;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    const fetchOrders = async () => {
      const host =
        (router.query.host as string) ||
        (typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('host') : null);

      console.log('[OrdersPage] router.isReady:', router.isReady);
      console.log('[OrdersPage] router.query:', router.query);
      console.log('[OrdersPage] host:', host);

      if (!host) {
        console.error('[OrdersPage] Shopify host parametresi yok');
        message.error('Shopify host parametresi yok. Uygulamayı Shopify içinden açın.');
        setLoading(false);
        return;
      }

      // App Bridge başlat
      const app = createApp({
        apiKey: process.env.NEXT_PUBLIC_SHOPIFY_API_KEY!,
        host,
        forceRedirect: true,
      });

      let token: string;
      try {
        token = await getSessionToken(app);
        console.log('[OrdersPage] JWT token alındı. Length:', token.length);
      } catch (err) {
        console.error('[OrdersPage] getSessionToken error:', err);
        message.error('Shopify session token alınamadı');
        setLoading(false);
        return;
      }

      // Backend çağrısı
      try {
        console.log('[OrdersPage] getShopifyOrders çağrılıyor:', host);
        const res = await getShopifyOrders(host);
        console.log('[OrdersPage] getShopifyOrders result sample:', Array.isArray(res.data.data) ? res.data.data.slice(0,1) : res.data);

        setOrders(res.data.data || []);
      } catch (err: any) {
        console.error('[OrdersPage] Orders fetch hatası:', err?.response?.status, err?.response?.data || err.message || err);
        message.error('Siparişler alınamadı. Backend loglarına bakın.');
      } finally {
        setLoading(false);
      }
    };

    if (router.isReady) fetchOrders();
  }, [router.isReady, router.query.host]);

  const handleShipmentCreated = (orderId: string, trackingNumber: string, labelUrl: string, shopDomain?: string) => {
    console.log(`[OrdersPage] handleShipmentCreated for order ${orderId}, tracking ${trackingNumber}`);
    setOrders(prev => prev.map(o => (o.id === orderId ? { ...o, trackingNumber, labelUrl } : o)));
    // Shopify fulfillment servisi eklenebilir
  };

  const handleEmailChange = (id: string, value: string) => {
    setOrders(prev => prev.map(o => (o.id === id ? { ...o, customer: { ...o.customer, email: value } } : o)));
  };

  const columns = [
    { title: 'Sipariş Numarası', dataIndex: 'name', key: 'name' },
    { title: 'Müşteri', dataIndex: ['customer', 'name'], key: 'customer' },
    {
      title: 'E-Posta',
      key: 'email',
      render: (_: any, record: Order) => (
        <Input value={record.customer.email} placeholder="E-posta giriniz" onChange={e => handleEmailChange(record.id, e.target.value)} />
      ),
    },
    { title: 'Telefon', dataIndex: ['customer', 'phone'], key: 'phone' },
    {
      title: 'Adres',
      key: 'address',
      render: (_: any, record: Order) => `${record.customer.address}, ${record.customer.districtName}, ${record.customer.cityName}`,
    },
    { title: 'Toplam', dataIndex: 'total_price', key: 'total' },
    {
      title: 'Takip No',
      key: 'tracking',
      render: (_: any, record: Order) => record.trackingNumber || '-',
    },
    {
      title: 'Kargo',
      key: 'shipment',
      render: (_value: unknown, record: Order) => (
        <MNGShipmentForm order={record} onShipmentCreated={(orderId, trackingNumber, labelUrl) => handleShipmentCreated(orderId, trackingNumber, labelUrl, record.customer.shop)} />
      ),
    },
  ];

  return (
    <AdminLayout>
      <h2>Shopify Siparişleri</h2>
      <Table rowKey="id" columns={columns} dataSource={orders} loading={loading} bordered scroll={{ x: 'max-content' }} />
    </AdminLayout>
  );
}
