import React, { useState } from 'react';
import { Button, Select, message } from 'antd';
import { createMNGShipment } from '@/services/api';

const { Option } = Select;

// 🔹 Order tipi
interface Order {
  id: string;
  name: string;
  total_price: string;
  customer: { name: string };
}

interface Props {
  order: Order;
}

export default function MNGShipmentForm({ order }: Props) {
  const [loading, setLoading] = useState(false);
  const [courier, setCourier] = useState('');

  const handleCreateShipment = async () => {
    if (!courier) return message.warning('Kargo firması seçin');
    setLoading(true);
    try {
      const res = await createMNGShipment({ orderId: order.id, courier });
      message.success(`Kargo oluşturuldu. Takip No: ${res.data.trackingNumber}`);
    } catch (err: any) {
      message.error('Kargo oluşturulamadı: ' + (err.message || 'Hata'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display:'flex', gap:8 }}>
      <Select style={{ width:150 }} placeholder="Kargo Firması" onChange={setCourier}>
        <Option value="MNG">MNG</Option>
      </Select>
      <Button type="primary" onClick={handleCreateShipment} loading={loading}>
        Gönder
      </Button>
    </div>
  );
}
