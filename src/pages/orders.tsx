// pages/orders.tsx
import React, { useEffect, useState } from 'react';
import { Table, message, Input } from 'antd';
import AdminLayout from '@/components/Layout';
import MNGShipmentForm from '@/components/MNGShipmentForm';
import createApp from '@shopify/app-bridge';
import { getSessionToken } from '@shopify/app-bridge-utils';
import axios, { AxiosError } from 'axios';
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
  const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3003';

  useEffect(() => {
    const fetchOrders = async () => {
      const hostQuery = (router.query.host as string) || undefined;
      const hostSearch = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('host') : null;
      const hostStored = typeof window !== 'undefined' ? localStorage.getItem('shopify_host') : null;
      const host = hostQuery || hostSearch || hostStored;

      console.log('[OrdersPage] router.isReady:', router.isReady);
      console.log('[OrdersPage] router.query:', router.query);
      console.log('[OrdersPage] hostQuery, hostSearch, hostStored =>', hostQuery, hostSearch, hostStored);

      if (!host) {
        console.error('[OrdersPage] Shopify host parametresi yok - embed app içinde açıldığından emin olun.');
        message.error('Shopify host parametresi yok. Uygulamayı Shopify içinden açın.');
        setLoading(false);
        return;
      }

      try { localStorage.setItem('shopify_host', host); } catch (e) { /* ignore */ }

      let token: string | null = null;
      try {
        const app = createApp({
          apiKey: process.env.NEXT_PUBLIC_SHOPIFY_API_KEY!,
          host,
          forceRedirect: true,
        });
        console.log('[OrdersPage] app-bridge başlatıldı, host=', host);

        token = await getSessionToken(app);
        console.log('[OrdersPage] getSessionToken succeeded. token length:', token?.length ?? 0);

      } catch (err) {
        console.error('[OrdersPage] App Bridge veya token hatası:', err);
        message.error('Shopify session token alınamadı. Konsolu kontrol edin.');
        setLoading(false);
        return;
      }

      try {
        console.log('[OrdersPage] calling backend /shopify/orders with bearer token...');
        const res = await axios.get(`${API_URL}/shopify/orders`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log('[OrdersPage] backend /shopify/orders response status:', res.status);
        console.log('[OrdersPage] backend response body sample:', Array.isArray(res.data.data) ? res.data.data.slice(0,1) : res.data);

        setOrders(res.data.data || []);
      } catch (err: unknown) {
        if (axios.isAxiosError(err)) {
          console.error('[OrdersPage] Orders fetch Axios hatası:', err.response?.status, err.response?.data || err.message);
        } else if (err instanceof Error) {
          console.error('[OrdersPage] Orders fetch Error hatası:', err.message);
        } else {
          console.error('[OrdersPage] Orders fetch bilinmeyen tip:', err);
        }
        message.error('Siparişler alınamadı. Backend loglarını kontrol edin.');
      } finally {
        setLoading(false);
      }
    };

    if (router.isReady) fetchOrders();
  }, [router.isReady]);

  const createShopifyFulfillment = async (orderId: string, trackingNumber: string, shopDomain: string) => {
    try {
      console.log(`[OrdersPage] createShopifyFulfillment for ${orderId} on ${shopDomain}`);
      const shopRecord = await axios.get(`${API_URL}/shopify/settings/${shopDomain}`);
      const accessToken = shopRecord.data.accessToken;
      if (!accessToken) {
        console.warn('[OrdersPage] accessToken bulunamadı');
        return;
      }

      await axios.post(
        `https://${shopDomain}/admin/api/2025-10/orders/${orderId}/fulfillments.json`,
        { fulfillment: { tracking_number: trackingNumber, notify_customer: true } },
        { headers: { 'X-Shopify-Access-Token': accessToken } }
      );
      console.log('[OrdersPage] Shopify fulfillment oluşturuldu:', orderId);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        console.error('[OrdersPage] Shopify fulfillment Axios hatası:', err.response?.data || err.message);
      } else if (err instanceof Error) {
        console.error('[OrdersPage] Shopify fulfillment Error:', err.message);
      } else {
        console.error('[OrdersPage] Shopify fulfillment bilinmeyen tip:', err);
      }
      message.error('Fulfillment oluşturulurken hata oluştu (konsolu kontrol edin).');
    }
  };

  const handleShipmentCreated = async (orderId: string, trackingNumber: string, labelUrl: string, shopDomain?: string) => {
    setOrders(prev => prev.map(o => (o.id === orderId ? { ...o, trackingNumber, labelUrl } : o)));
    if (shopDomain) await createShopifyFulfillment(orderId, trackingNumber, shopDomain);
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
      render: (_: any, record: Order) =>
        `${record.customer.address}, ${record.customer.districtName}, ${record.customer.cityName}`,
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
      render: (_: any, record: Order) => (
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
