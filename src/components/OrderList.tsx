import React, { useEffect, useState } from 'react';
import { Table, message, Input } from 'antd';
import MNGShipmentForm from './MNGShipmentForm';
import { getShopifyOrders, getShipmentsByOrderIds } from '@/services/api';

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

// 🔹 Normalize fonksiyonu
function normalize(str: string) {
  if (!str) return '';
  return str.trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();
}

export default function OrderList() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await getShopifyOrders();
  
      console.log('🔹 Shopify’dan gelen ham veri:', res.data.data); // Burada görebilirsin
  
      const ordersWithAddress = (res.data.data || []).map((order: any) => ({
        ...order,
        customer: {
          ...order.customer,
          phone: order.customer.phone || '',
          cityName: normalize(order.customer.cityName || ''),
          districtName: normalize(order.customer.districtName || ''),
          address: order.customer.address || '',
          email: order.customer.email || '',
        },
      }));
  
      console.log('🔹 Normalize edilmiş siparişler:', ordersWithAddress);
  
      // MongoDB’den shipment verilerini al
      const orderIds = ordersWithAddress.map((o: any) => o.id).join(',');
      const shipmentRes = await getShipmentsByOrderIds(orderIds);
  
      const ordersWithShipments = ordersWithAddress.map((order: any) => {
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

  const handleShipmentCreated = (orderId: string, trackingNumber: string, labelUrl: string) => {
    setOrders(prev =>
      prev.map(o => o.id === orderId ? { ...o, trackingNumber, labelUrl } : o)
    );
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
      )
    },
    { title: 'Telefon', dataIndex: ['customer', 'phone'], key: 'phone' },
    { 
      title: 'Adres', 
      key: 'address', 
      render: (_: any, record: Order) => 
        `${record.customer.address}, ${record.customer.districtName}, ${record.customer.cityName}`
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
        <MNGShipmentForm 
          order={record} 
          onShipmentCreated={handleShipmentCreated} 
        />
      ),
    },
  ];

  return (
    <Table
      rowKey="id"
      columns={columns}
      dataSource={orders}
      loading={loading}
      bordered
      scroll={{ x: 'max-content' }}
    />
  );
}
