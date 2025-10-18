import React, { useEffect, useState } from 'react';
import { Table, message } from 'antd';
import { getShipment } from '@/services/api';

export default function ShipmentList() {
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchShipments(); }, []);

  const fetchShipments = async () => {
    setLoading(true);
    try {
      // API bağlanacak
      const res = await getShipment('all'); // placeholder
      setShipments(res.data);
    } catch (err: any) {
      message.error('Kargolar alınamadı: ' + (err.message || 'Hata'));
    } finally { setLoading(false); }
  };

  const columns = [
    { title: 'Sipariş ID', dataIndex: 'orderId', key: 'orderId' },
    { title: 'Takip No', dataIndex: 'trackingNumber', key: 'trackingNumber' },
    { title: 'Kargo Firması', dataIndex: 'courier', key: 'courier' },
    { title: 'Label', key: 'label', render: (_: any, record: any) => (
      <a href={record.labelUrl} target="_blank" rel="noreferrer">Label Görüntüle</a>
    )}
  ];

  return <Table rowKey="trackingNumber" columns={columns} dataSource={shipments} loading={loading} />;
}
