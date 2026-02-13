import React, { useEffect, useState } from 'react';
import { Table, message, Input, Typography } from 'antd';
import AdminLayout from '@/components/Layout';
import MNGShipmentForm from '../components/MNGShipmentForm';
import { getShopifyOrders, getShipmentsByOrderIds } from '@/services/api';

const { TextArea } = Input;
const { Text } = Typography;

interface Customer {
  name: string;
  email?: string;
  phone?: string;
  cityName?: string;
  districtName?: string;
  address?: string;   // address1 zorunlu
  address2?: string;  // address2 opsiyonel
  company?: string;
}

export interface Order {
  id: string;
  name: string;
  total_price: string;
  shop: string;
  shopifyOrderId: string;
  customer: Customer;
  created_at?: string;
  trackingNumber?: string;
  labelUrl?: string;
  barcode?: string;
}

export default function OrderListPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await getShopifyOrders();
      const backendOrders = res.data.data || [];

      const orderIds = backendOrders.map((o: any) => o.id).join(',');
      const shipmentRes = await getShipmentsByOrderIds(orderIds);
      const shipments = shipmentRes.data.data || [];

      const mergedOrders: Order[] = backendOrders.map((order: any) => {
  const shipment = shipments.find(
    (s: any) => s.orderID === order.orderID
  );

  return {
    id: order.orderID,
    name: order.orderID,
    total_price: order.grandTotal?.toString() || '0',
    shop: order.storeName || '',
    shopifyOrderId: order.ID?.toString() || '',
    customer: {
      name: order.name || '',
      email: '', // Shopify JSON’da yoksa boş
      phone: '', // Shopify JSON’da yoksa boş
      cityName: order.cityName || '',
      districtName: '', // JSON’da yok
      address: order.address || '',
      address2: '', // opsiyonel
      company: '', // opsiyonel
    },
    trackingNumber: shipment?.shipmentNumber || '',
    labelUrl: shipment?.labelUrl || '',
    barcode: shipment?.barcode || '',
    created_at: order.createdAt,
  };
});

      setOrders(mergedOrders);
    } catch (err) {
      console.error(err);
      message.error('Siparişler alınamadı');
    } finally {
      setLoading(false);
    }
  };

  const handleCustomerFieldChange = (
    orderId: string,
    field: keyof Customer,
    value: string
  ) => {
    setOrders(prev =>
      prev.map(o =>
        o.id === orderId
          ? { ...o, customer: { ...o.customer, [field]: value } }
          : o
      )
    );
  };

  const handleShipmentCreated = (
    orderId: string,
    trackingNumber: string,
    labelUrl: string,
    barcode?: string,
    districtName?: string,
    cityName?: string
  ) => {
    setOrders(prev =>
      prev.map(o =>
        o.id === orderId
          ? {
              ...o,
              trackingNumber,
              labelUrl,
              barcode,
              customer: {
                ...o.customer,
                districtName: districtName || o.customer.districtName,
                cityName: cityName || o.customer.cityName,
              },
            }
          : o
      )
    );
  };

  const columns = [
    { title: 'Sipariş No', dataIndex: 'name' },

    {
      title: 'Müşteri',
      render: (_: any, record: Order) => (
        <Input
          value={record.customer.name}
          onChange={e =>
            handleCustomerFieldChange(record.id, 'name', e.target.value)
          }
        />
      ),
    },

    {
      title: 'Kargo Bilgisi',
      render: (_: any, record: Order) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div>
            <strong>Barkod:</strong>{' '}
            {record.barcode ? <Text copyable>{record.barcode}</Text> : 'Yok'}
          </div>
          <div>
            <strong>Takip No:</strong>{' '}
            {record.trackingNumber ? <Text copyable>{record.trackingNumber}</Text> : 'Yok'}
          </div>
        </div>
      ),
    },

    {
      title: 'Adres',
      width: 280,
      render: (_: any, record: Order) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <TextArea
            value={record.customer.address}
            autoSize={{ minRows: 1, maxRows: 2 }}
            placeholder="Adres satırı 1 (zorunlu)"
            onChange={e =>
              handleCustomerFieldChange(record.id, 'address', e.target.value)
            }
          />
          <TextArea
            value={record.customer.address2}
            autoSize={{ minRows: 1, maxRows: 2 }}
            placeholder="Adres satırı 2 (opsiyonel)"
            onChange={e =>
              handleCustomerFieldChange(record.id, 'address2', e.target.value)
            }
          />
        </div>
      ),
    },

    { title: 'Toplam', dataIndex: 'total_price' },

    {
      title: 'Kargo',
      render: (_: any, record: Order) => (
        <MNGShipmentForm order={record} onShipmentCreated={handleShipmentCreated} />
      ),
    },
  ];

  return (
    <AdminLayout>
      <h2>Gönderiler</h2>
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