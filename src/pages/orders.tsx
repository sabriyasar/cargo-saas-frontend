import React, { useEffect, useState } from 'react';
import { Table, message, Input } from 'antd';
import AdminLayout from '@/components/Layout';
import MNGShipmentForm from '../components/MNGShipmentForm';
import { getShopifyOrders, getShipmentsByOrderIds } from '@/services/api';
import axios from 'axios';

interface Customer {
  name: string;
  email?: string;
  phone?: string;
  cityName?: string;
  districtName?: string;
  address?: string;
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

interface RawShippingAddress {
  first_name?: string;
  last_name?: string;
  address1?: string;
  city?: string;
  province?: string;
  phone?: string;
}

interface RawCustomer {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  default_address?: RawShippingAddress;
}

interface RawOrder {
  id: string;
  name?: string;
  total_price?: string;
  customer?: RawCustomer;
  shipping_address?: RawShippingAddress;
  phone?: string;
  email?: string;
  created_at?: string;
}

function normalize(str: string) {
  if (!str) return '';
  const lower = str.trim().toLocaleLowerCase('tr-TR'); // Türkçe küçük harf
  return lower.charAt(0).toLocaleUpperCase('tr-TR') + lower.slice(1);
}

export default function OrderListPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3003';

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await getShopifyOrders(); // shop param yok, backend kendi .env'den alıyor
      const rawOrders: RawOrder[] = res.data.data || [];

      const ordersWithAddress: Order[] = rawOrders.map((order: RawOrder) => {
        const customer = order.customer || {};
        const shipping = order.shipping_address || customer.default_address || {};

        return {
          id: order.id.toString(),
          name: order.name || `#${order.id}`,
          total_price: order.total_price || '0',
          customer: {
            name: customer.first_name
              ? `${customer.first_name} ${customer.last_name || ''}`.trim()
              : 'Müşteri Bilgisi Yok',
            phone: customer.phone || shipping.phone || order.phone || '',
            email: customer.email || order.email || '',
            cityName: normalize(shipping.city || ''),
            districtName: normalize(shipping.province || ''),
            address: shipping.address1 || '',
          },
          created_at: order.created_at,
        };
      });

      const orderIds = ordersWithAddress.map(o => o.id).join(',');
      const shipmentRes = await getShipmentsByOrderIds(orderIds);

      const ordersWithShipments = ordersWithAddress.map(order => {
        const shipment = (shipmentRes.data || []).find((s: any) => s.orderId === order.id);
        return {
          ...order,
          trackingNumber: shipment?.trackingNumber,
          labelUrl: shipment?.labelUrl,
        };
      });

      setOrders(ordersWithShipments);
    } catch (err: unknown) {
      if (err instanceof Error) message.error('Siparişler alınamadı: ' + err.message);
      else message.error('Siparişler alınamadı: Bilinmeyen hata');
    } finally {
      setLoading(false);
    }
  };

  const createShopifyFulfillment = async (orderId: string, trackingNumber: string) => {
    try {
      const shopRecord = await axios.get(`${API_URL}/shopify/settings`);
      const accessToken = shopRecord.data.accessToken;
      const shop = shopRecord.data.shop;
      if (!accessToken || !shop) return;

      await axios.post(
        `https://${shop}/admin/api/2025-10/orders/${orderId}/fulfillments.json`,
        {
          fulfillment: {
            tracking_number: trackingNumber,
            notify_customer: true,
          },
        },
        {
          headers: { 'X-Shopify-Access-Token': accessToken },
        }
      );
    } catch (err) {
      console.error('Shopify fulfillment oluşturulamadı:', err);
    }
  };

  const handleShipmentCreated = async (orderId: string, trackingNumber: string, labelUrl: string) => {
    setOrders(prev => prev.map(o => (o.id === orderId ? { ...o, trackingNumber, labelUrl } : o)));
    await createShopifyFulfillment(orderId, trackingNumber);
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
        <Input
          value={record.customer.email}
          placeholder="E-posta giriniz"
          onChange={e => handleEmailChange(record.id, e.target.value)}
        />
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
      render: (_value: unknown, record: Order) => (
        <MNGShipmentForm order={record} onShipmentCreated={handleShipmentCreated} />
      ),
    },
  ];

  return (
    <AdminLayout>
      <h2>Siparişler</h2>
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