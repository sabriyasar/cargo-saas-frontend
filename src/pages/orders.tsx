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
    // 1️⃣ Backend'den siparişleri çek
    const res = await getShopifyOrders({ status: 'any', limit: 50 });
    
    console.log('🔍 API Yanıtı:', res.data); // Debug için
    
    const backendOrders = res.data.data || [];
    
    if (backendOrders.length === 0) {
      message.warning('Sipariş bulunamadı');
      setOrders([]);
      return;
    }

    // 2️⃣ Shipment bilgilerini çek
    const orderIds = backendOrders.map((o: any) => o.id).join(',');
    const shipmentRes = await getShipmentsByOrderIds(orderIds);
    const shipments = shipmentRes.data.data || [];

    // 3️⃣ Merge et - NULL-SAFE
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
          company: order.shipping_address?.company || ''
        },

        trackingNumber: shipment?.trackingNumber || order.trackingNumber || '',
        labelUrl: shipment?.labelUrl || '',
        barcode: shipment?.barcode || '',
        courier: shipment?.courier || order.courier || '',
        
        created_at: order.created_at
      };
    });

    console.log('✅ Merge edilmiş siparişler:', mergedOrders.length);
    setOrders(mergedOrders);
    message.success(`${mergedOrders.length} sipariş yüklendi`);
    
  } catch (err: any) {
    console.error('❌ Frontend hata:', err);
    
    // Detaylı hata mesajı
    if (err.response?.data?.message) {
      message.error(`Hata: ${err.response.data.message}`);
    } else if (err.message) {
      message.error(`Hata: ${err.message}`);
    } else {
      message.error('Siparişler alınamadı');
    }
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