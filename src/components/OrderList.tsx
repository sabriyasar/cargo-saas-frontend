import React, { useEffect, useState } from 'react';
import { Table, message } from 'antd';
import MNGShipmentForm from './MNGShipmentForm';
import { getShopifyOrders } from '@/services/api';

// 🔹 Tip tanımı
interface Order {
  id: string;
  name: string;
  total_price: string;
  customer: { name: string };
}

export default function OrderList() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchOrders(); }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await getShopifyOrders();
      setOrders(res.data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        message.error('Siparişler alınamadı: ' + err.message);
      } else {
        message.error('Siparişler alınamadı: Bilinmeyen hata');
      }
    } finally { setLoading(false); }
  };

  const columns = [
    { title: 'Sipariş Numarası', dataIndex: 'name', key: 'name' },
    { title: 'Müşteri', dataIndex: ['customer','name'], key: 'customer' },
    { title: 'Toplam', dataIndex: 'total_price', key: 'total' },
    { 
      title: 'Kargo', key: 'shipment',
      render: (_value: unknown, record: Order) => <MNGShipmentForm order={record} />
    }
  ];

  return <Table rowKey="id" columns={columns} dataSource={orders} loading={loading} />;
}
