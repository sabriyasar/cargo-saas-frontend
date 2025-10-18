import React, { useEffect, useState } from 'react';
import { Card, Table, Tag, Typography, Button, message } from 'antd';
import { checkReturnOrder, getReturns } from '../services/api';
import ShipmentForm from './ShipmentForm';

const { Title } = Typography;

interface ReturnType {
  _id: string;
  order?: { orderNumber: string };
  customer?: { name: string };
  reason: string;
  status: string;
  shipment?: { trackingNumber: string; labelUrl: string };
}

interface ReturnListProps {
  onBack?: () => void;
}

const ReturnList: React.FC<ReturnListProps> = ({ onBack }) => {
  const [returns, setReturns] = useState<ReturnType[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchReturns();
  }, []);

  const fetchReturns = async () => {
    setLoading(true);
    try {
      const res = await getReturns();
      setReturns(res.data);
    } catch (err: any) {
      message.error('İade listesi alınamadı: ' + (err.message || 'Hata'));
    } finally {
      setLoading(false);
    }
  };

  const checkStatus = async (id: string) => {
    try {
      const res = await checkReturnOrder({ referenceId: id });
      message.info(`Kargo Durumu: ${res.data.statusDescription || JSON.stringify(res.data)}`);
    } catch (err: any) {
      message.error('Durum sorgulanamadı: ' + (err.message || 'Hata'));
    }
  };

  const columns = [
    { title: 'ID', dataIndex: '_id', key: '_id' },
    { 
      title: 'Order', 
      dataIndex: ['order', 'orderNumber'], 
      key: 'order', 
      render: (text: string | undefined) => text || '-' 
    },
    { 
      title: 'Customer', 
      dataIndex: ['customer', 'name'], 
      key: 'customer', 
      render: (text: string | undefined) => text || '-' 
    },
    { title: 'Reason', dataIndex: 'reason', key: 'reason' },
    { 
      title: 'Status', 
      dataIndex: 'status', 
      key: 'status', 
      render: (status: string) => (
        <Tag color={status === 'shipped' ? 'green' : 'blue'}>
          {status === 'shipped' ? 'Kargolandı' : 'Beklemede'}
        </Tag>
      ) 
    },
    {
      title: 'Shipment',
      key: 'shipment',
      render: (_: unknown, record: ReturnType) => record.shipment ? (
        <a href={record.shipment.labelUrl} target="_blank" rel="noreferrer">
          {record.shipment.trackingNumber}
        </a>
      ) : (
        <ShipmentForm returnId={record._id} />
      )
    },
    {
      title: 'Kargo Durumu',
      key: 'check',
      render: (_: unknown, record: ReturnType) => (
        record.shipment ? (
          <Button size="small" onClick={() => checkStatus(record._id)}>
            Durumu Sorgula
          </Button>
        ) : null
      )
    }
  ];

  return (
    <Card
      className="return-list-card"
      title={
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
          <Button type="default" onClick={onBack} style={{ marginBottom: 8 }}>
            ← Yeni İade Talebi
          </Button>
          <Title level={3} style={{ margin: 0 }}>İade Talepleri</Title>
          <div />
        </div>
      }
    >
      <Table 
        rowKey="_id" 
        columns={columns} 
        dataSource={returns} 
        bordered 
        loading={loading}
        scroll={{ x: 'max-content' }}
      />
    </Card>
  );
};

export default ReturnList;
