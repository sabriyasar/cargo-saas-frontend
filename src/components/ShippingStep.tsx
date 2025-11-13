import React, { useEffect, useState } from 'react';
import { Card, Typography, Row, Col, Button, Table, Space } from 'antd';
import { CrownOutlined, StarOutlined, SmileOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

interface ShippingPlan {
  key: string;
  company: string;
  deliveryTime: string;
  deliveryType: string;
  price: string;
}

// Planlara göre fiyat ve süreler
const shippingRates: Record<string, ShippingPlan[]> = {
  basic: [
    { key: '1', company: 'DHL e-Commerce', deliveryTime: '1-3 iş günü', deliveryType: 'Müşteri adresine teslim', price: '75₺' },
    { key: '2', company: 'Kolay Gelsin', deliveryTime: '1-3 iş günü', deliveryType: 'Müşteri adresine teslim', price: '75₺' },
    { key: '3', company: 'Yurtiçi Kargo', deliveryTime: '1-3 iş günü', deliveryType: 'Müşteri adresine teslim', price: '75₺' },
    { key: '4', company: 'Hepsijet', deliveryTime: '1-3 iş günü', deliveryType: 'Müşteri adresine teslim', price: '75₺' },
  ],
  gold: [
    { key: '1', company: 'DHL e-Commerce', deliveryTime: '1-2 iş günü', deliveryType: 'Müşteri adresine teslim', price: '85₺' },
    { key: '2', company: 'Kolay Gelsin', deliveryTime: '1-2 iş günü', deliveryType: 'Müşteri adresine teslim', price: '85₺' },
    { key: '3', company: 'Yurtiçi Kargo', deliveryTime: '1-2 iş günü', deliveryType: 'Müşteri adresine teslim', price: '85₺' },
    { key: '4', company: 'Hepsijet', deliveryTime: '1-2 iş günü', deliveryType: 'Müşteri adresine teslim', price: '85₺' },
  ],
  premium: [
    { key: '1', company: 'DHL e-Commerce', deliveryTime: '1 iş günü', deliveryType: 'Müşteri adresine teslim', price: '95₺' },
    { key: '2', company: 'Kolay Gelsin', deliveryTime: '1 iş günü', deliveryType: 'Müşteri adresine teslim', price: '95₺' },
    { key: '3', company: 'Yurtiçi Kargo', deliveryTime: '1 iş günü', deliveryType: 'Müşteri adresine teslim', price: '95₺' },
    { key: '4', company: 'Hepsijet', deliveryTime: '1 iş günü', deliveryType: 'Müşteri adresine teslim', price: '95₺' },
  ],
};

interface Props {
  selectedPlan: string;
  setSelectedPlan: (plan: string) => void;
  selectedShipping: string | null;
  setSelectedShipping: (key: string) => void;
}

export default function ShippingStep({ selectedPlan, setSelectedPlan, selectedShipping, setSelectedShipping }: Props) {
  const [shippingData, setShippingData] = useState<ShippingPlan[]>(shippingRates[selectedPlan]);

  useEffect(() => {
    console.log('Plan değişti:', selectedPlan); // log
    setShippingData(shippingRates[selectedPlan]);
    setSelectedShipping('');
  }, [selectedPlan]);

  const columns = [
    { title: 'Kargo Şirketi', dataIndex: 'company', key: 'company' },
    { title: 'Teslimat Süresi', dataIndex: 'deliveryTime', key: 'deliveryTime' },
    { title: 'Teslimat Türü', dataIndex: 'deliveryType', key: 'deliveryType' },
    { title: 'Fiyat', dataIndex: 'price', key: 'price' },
    {
      title: 'Seç',
      key: 'action',
      render: (_: any, record: ShippingPlan) => (
        <Button
          type={selectedShipping === record.key ? 'primary' : 'default'}
          onClick={() => setSelectedShipping(record.key)}
        >
          Seç
        </Button>
      ),
    },
  ];

  return (
    <>
      {/* Sipariş Bilgileri */}
      <Card style={{ marginBottom: 24 }}>
        <Row gutter={16}>
          <Col span={4}><Text strong>Sipariş Numarası</Text><br /><Text>OID-141087-1002</Text></Col>
          <Col span={4}><Text strong>Çıkış Noktası</Text><br /><Text>Kocaeli, TR</Text></Col>
          <Col span={4}><Text strong>Varış Noktası</Text><br /><Text>Kocaeli, TR</Text></Col>
          <Col span={4}><Text strong>Ödeme Türü</Text><br /><Text>Ödendi</Text></Col>
          <Col span={4}><Text strong>Ücrete Esas Ağırlık</Text><br /><Text>1 kg</Text></Col>
        </Row>
      </Card>

      {/* Plan Tipleri */}
      <Card style={{ marginBottom: 24 }}>
        <Title level={5}>Plan Tipleri</Title>
        <Space>
          <Button type={selectedPlan === 'basic' ? 'primary' : 'default'} icon={<SmileOutlined />} onClick={() => setSelectedPlan('basic')}>Basic</Button>
          <Button type={selectedPlan === 'gold' ? 'primary' : 'default'} icon={<CrownOutlined />} onClick={() => setSelectedPlan('gold')}>Gold</Button>
          <Button type={selectedPlan === 'premium' ? 'primary' : 'default'} icon={<StarOutlined />} onClick={() => setSelectedPlan('premium')}>Premium</Button>
        </Space>
      </Card>

      {/* Kargo Şirketleri */}
      <Card>
        <Title level={5}>Kargo Şirketleri</Title>
        <Table columns={columns} dataSource={shippingData} pagination={false} rowKey="key" />
      </Card>
    </>
  );
}
