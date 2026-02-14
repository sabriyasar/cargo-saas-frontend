import React, { useEffect, useState } from 'react';
import { Table, message, Input, Typography, Alert } from 'antd';
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
  address?: string;
  address2?: string;
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
      const res = await getShopifyOrders({ status: 'any', limit: 50 });
      const backendOrders = res.data.data || [];

      if (!backendOrders.length) {
        message.warning('Sipariş bulunamadı');
        setOrders([]);
        return;
      }

      const orderIds = backendOrders.map((o: any) => o.id).join(',');
      const shipmentRes = await getShipmentsByOrderIds(orderIds);
      const shipments = shipmentRes.data.data || [];

      const mergedOrders: Order[] = backendOrders.map((order: any) => {
        const shipment = shipments.find(
          (s: any) => s.shopifyOrderId === `gid://shopify/Order/${order.id}`
        );

        return {
          id: order.id,
          name: order.name || `#${order.id}`,
          total_price: order.total_price || '0',
          shop: order.shop || '',
          shopifyOrderId: `gid://shopify/Order/${order.id}`,

          customer: {
            name: order.customer?.name || '',
            email: order.customer?.email || '',
            phone: order.customer?.phone || '',
            cityName: order.shipping_address?.city || '',
            districtName: order.shipping_address?.province || '',
            address: order.shipping_address?.address1 || '',
            address2: order.shipping_address?.address2 || '',
            company: order.shipping_address?.company || '',
          },

          trackingNumber: shipment?.trackingNumber || order.trackingNumber || '',
          labelUrl: shipment?.labelUrl || '',
          barcode: shipment?.barcode || '',
        };
      });

      setOrders(mergedOrders);
      message.success(`${mergedOrders.length} sipariş yüklendi`);

    } catch (err: any) {
      console.error('❌ Frontend hata:', err);
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
    { 
      title: 'Sipariş No', 
      dataIndex: 'name'
    },
    {
      title: 'Müşteri',
      render: (_: any, record: Order) => (
        <Input
          value={record.customer.name}
          placeholder="Müşteri adı"
          onChange={e =>
            handleCustomerFieldChange(record.id, 'name', e.target.value)
          }
        />
      ),
    },
    {
      title: 'Adres',
      width: 300,
      render: (_: any, record: Order) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <TextArea
            value={record.customer.address}
            autoSize={{ minRows: 1, maxRows: 2 }}
            placeholder="Adres"
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
          <Input
            value={record.customer.cityName}
            placeholder="Şehir"
            onChange={e =>
              handleCustomerFieldChange(record.id, 'cityName', e.target.value)
            }
          />
          <Input
            value={record.customer.districtName}
            placeholder="İlçe"
            onChange={e =>
              handleCustomerFieldChange(record.id, 'districtName', e.target.value)
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
      <div style={{ marginBottom: 16 }}>
        <h2>Gönderiler</h2>
      </div>
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