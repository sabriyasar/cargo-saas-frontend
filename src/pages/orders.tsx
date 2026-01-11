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
  address?: string;
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

interface RawShippingAddress {
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
  shop?: string; // 👈 backend’ten geliyor
}

function normalize(str: string) {
  if (!str) return '';
  const lower = str.trim().toLocaleLowerCase('tr-TR');
  return lower.charAt(0).toLocaleUpperCase('tr-TR') + lower.slice(1);
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
      const rawOrders: RawOrder[] = res.data.data || [];

      const ordersWithAddress: Order[] = rawOrders.map(order => {
        const customer = order.customer ?? {};
        const shipping =
          order.shipping_address ??
          customer.default_address ??
          {};

        return {
          id: String(order.id),
          shopifyOrderId: String(order.id),
          name: order.name || `#${order.id}`,
          total_price: order.total_price || '0',
          shop: order.shop || '', // 🔴 ZORUNLU
          customer: {
            name:
              customer.first_name || customer.last_name
                ? `${customer.first_name || ''} ${customer.last_name || ''}`.trim()
                : 'Müşteri Bilgisi Yok',
            phone:
              customer.phone ||
              shipping.phone ||
              order.phone ||
              '',
            email:
              customer.email ||
              order.email ||
              '',
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
        const shipment = (shipmentRes.data || []).find(
          (s: any) => String(s.orderId) === order.id
        );

        return {
          ...order,
          trackingNumber: shipment?.trackingNumber,
          labelUrl: shipment?.labelUrl,
          barcode: shipment?.barcode,
          customer: {
            ...order.customer,
            districtName: shipment?.district || order.customer.districtName,
            cityName: shipment?.city || order.customer.cityName,
          },
        };
      });

      setOrders(ordersWithShipments);
    } catch (err) {
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
            {record.barcode ? (
              <Text copyable>{record.barcode}</Text>
            ) : (
              'Yok'
            )}
          </div>

          <div>
            <strong>Takip No:</strong>{' '}
            {record.trackingNumber ? (
              <Text copyable>{record.trackingNumber}</Text>
            ) : (
              'Yok'
            )}
          </div>
        </div>
      ),
    },

    {
      title: 'Adres',
      width: 280,
      render: (_: any, record: Order) => (
        <TextArea
          value={record.customer.address}
          autoSize={{ minRows: 2, maxRows: 4 }}
          onChange={e =>
            handleCustomerFieldChange(record.id, 'address', e.target.value)
          }
        />
      ),
    },

    { title: 'Toplam', dataIndex: 'total_price' },

    {
      title: 'Kargo',
      render: (_: any, record: Order) => (
        <MNGShipmentForm
          order={record} // 🔴 shop artık burada
          onShipmentCreated={handleShipmentCreated}
        />
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
