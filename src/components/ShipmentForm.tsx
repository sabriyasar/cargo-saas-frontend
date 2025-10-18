import React, { useState } from 'react';
import { Button, Form, message, Select } from 'antd';
import { createShipment } from '../services/api';

const { Option } = Select;

interface Props {
  returnId: string;
}

interface ShipmentFormValues {
  courier: string;
}

const ShipmentForm: React.FC<Props> = ({ returnId }) => {
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: ShipmentFormValues) => {
    setLoading(true);
    try {
      const res = await createShipment({ returnId, courier: values.courier });
      message.success(`Shipment oluşturuldu. Tracking: ${res.data.trackingNumber}`);
    } catch (err: any) {
      message.error('Shipment oluşturulamadı: ' + (err.message || 'Hata'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form layout="inline" onFinish={onFinish} className="shipment-form">
      <Form.Item name="courier" rules={[{ required: true, message: 'Kargo firması seçin' }]}>
        <Select placeholder="Kargo Firması" style={{ width: 180 }}>
          <Option value="MNG">MNG Kargo</Option>
          <Option value="Yurtiçi">Yurtiçi Kargo</Option>
          <Option value="Aras">Aras Kargo</Option>
        </Select>
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit" loading={loading}>
          Gönder
        </Button>
      </Form.Item>
    </Form>
  );
};

export default ShipmentForm;
