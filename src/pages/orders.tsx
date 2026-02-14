import React, { useEffect, useState } from 'react';
import { Table, message, Input, Typography } from 'antd';
import AdminLayout from '@/components/Layout';
import MNGShipmentForm from '../components/MNGShipmentForm';
import { getShopifyOrders, getShipmentsByOrderIds } from '@/services/api';

const { TextArea } = Input;

export interface Customer {
  firstName?: string;
  lastName?: string;
  name?: string;      
  email?: string;
  phone?: string;
  cityName?: string;  
  districtName?: string;
  address?: string;
  address2?: string;
  company?: string;
  customerId?: string | number;
  zip?: string; // Shopify'dan gelirse burada tutabiliriz
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
            firstName: order.customer?.firstName || '',
            lastName: order.customer?.lastName || '',
            name: order.customer?.name || '', // MNGShipmentForm için kullanılabilir
            email: order.customer?.email || '',
            phone: order.customer?.phone || '',
            cityName: order.shipping_address?.city || '',
            districtName: order.shipping_address?.province || '',
            address: order.shipping_address?.address1 || '',
            address2: order.shipping_address?.address2 || '',
            company: order.shipping_address?.company || '',
            customerId: order.customer?.id || '',
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
    { title: 'Sipariş No', dataIndex: 'name' },
    {
      title: 'Müşteri',
      render: (_: any, record: Order) => (
        <div style={{ display: 'flex', gap: 8 }}>
          <Input
            value={record.customer.firstName || ''}
            placeholder="Ad"
            onChange={e =>
              handleCustomerFieldChange(record.id, 'firstName', e.target.value)
            }
          />
          <Input
            value={record.customer.lastName || ''}
            placeholder="Soyad"
            onChange={e =>
              handleCustomerFieldChange(record.id, 'lastName', e.target.value)
            }
          />
        </div>
      ),
    },
    {
  title: 'Adres',
  width: 400,
  render: (_: any, record: Order) => {
    const c = record.customer;

    // Tek string olarak tüm adres
    const fullAddress = [
      c.address || '',
      c.address2 || '',
      c.districtName || '',
      c.cityName || '',
      c.zip || ''
    ]
      .filter(Boolean)
      .join(', ');

    return (
      <TextArea
        value={fullAddress}
        autoSize={{ minRows: 2, maxRows: 4 }}
        placeholder="Adres"
        onChange={e =>
          handleCustomerFieldChange(record.id, 'address', e.target.value)
        }
      />
    );
  },
},
    { title: 'Toplam', dataIndex: 'total_price' },
    {
  title: 'Kargo',
  render: (_: any, record: Order) => (
    <MNGShipmentForm
      order={{
        ...record,
        customer: {
          // MNG sadece name, cityName, districtName, address, email, phone kullanıyor
          name: '', 
          cityName: record.customer.cityName || '',
          districtName: record.customer.districtName || '',
          email: record.customer.email || '',
          phone: record.customer.phone || '',
          address: record.customer.address || '',
        },
      }}
      onShipmentCreated={handleShipmentCreated}
    />
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