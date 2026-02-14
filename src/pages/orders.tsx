import React, { useEffect, useState } from 'react';
import { Table, message, Input, Typography, Tag, Alert } from 'antd';
import { WarningOutlined } from '@ant-design/icons';
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
  isMarketplace?: boolean; // ⭐ Yeni
}

export default function OrderListPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [missingAddressCount, setMissingAddressCount] = useState(0);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await getShopifyOrders({ status: 'any', limit: 50 });
      const backendOrders = res.data.data || [];
      
      if (backendOrders.length === 0) {
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

        const hasAddress = !!(order.shipping_address?.address1);
        const isMarketplace = !hasAddress && order.courier?.includes('Marketplace');

        return {
          id: order.id,
          name: order.name || `#${order.id}`,
          total_price: order.total_price || '0',
          shop: order.shop || '',
          shopifyOrderId: `gid://shopify/Order/${order.id}`,
          isMarketplace,
          
          customer: {
            name: order.customer?.name || '',
            email: order.customer?.email || '',
            phone: order.customer?.phone || '',
            cityName: shipment?.city || order.shipping_address?.city || '',
            districtName: shipment?.district || order.shipping_address?.province || '',
            address: shipment?.address || order.shipping_address?.address1 || '',
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

      const missingCount = mergedOrders.filter(o => !o.customer.address).length;
      setMissingAddressCount(missingCount);
      setOrders(mergedOrders);
      
      message.success(`${mergedOrders.length} sipariş yüklendi`);
      if (missingCount > 0) {
        message.warning(`${missingCount} siparişte adres eksik (marketplace)`);
      }
      
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
      dataIndex: 'name',
      render: (name: string, record: Order) => (
        <div>
          {name}
          {record.isMarketplace && (
            <Tag color="orange" style={{ marginLeft: 8 }}>Marketplace</Tag>
          )}
        </div>
      )
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
      width: 300,
      render: (_: any, record: Order) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {!record.customer.address && record.isMarketplace && (
            <Alert
              message="⚠️ Marketplace siparişi - adres manuel girilmeli"
              type="warning"
              showIcon
              style={{ marginBottom: 4, fontSize: 11, padding: '4px 8px' }}
            />
          )}
          <TextArea
            value={record.customer.address}
            autoSize={{ minRows: 1, maxRows: 2 }}
            placeholder="⚠️ Adres girilmedi - lütfen girin"
            status={!record.customer.address ? 'error' : undefined}
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
      <div style={{ marginBottom: 16 }}>
        <h2>Gönderiler</h2>
        {missingAddressCount > 0 && (
          <Alert
            message={`${missingAddressCount} siparişte adres bilgisi eksik`}
            description="Marketplace siparişlerinde adres bilgileri Shopify tarafından gizlenmektedir. Kargo oluşturmadan önce manuel olarak giriniz."
            type="info"
            showIcon
            icon={<WarningOutlined />}
            closable
          />
        )}
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