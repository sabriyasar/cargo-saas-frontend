import React, { useState } from 'react';
import { Form, Input, Button, message, Card, Typography } from 'antd';
import { createReturn } from '@/services/api';

const { Title, Paragraph } = Typography;

interface ReturnFormProps {
  onShowList?: () => void;
}

const ReturnForm: React.FC<ReturnFormProps> = ({ onShowList }) => {
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      await createReturn(values);
      message.success('✅ İade talebi başarıyla oluşturuldu');
    } catch (err: any) {
      message.error('❌ İade talebi oluşturulamadı: ' + (err.message || 'Hata'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card
      className="return-form-card"
      title={<Title level={3} style={{ margin: 0 }}>Yeni İade Talebi</Title>}
      extra={
        <Button type="primary" danger onClick={onShowList}>
  İade Talepleri
</Button>

      }
    >
      <Paragraph>Lütfen sipariş bilgilerinizi ve iade sebebini giriniz.</Paragraph>

      <Form layout="vertical" onFinish={onFinish}>
        <Form.Item label="Order ID" name="order" rules={[{ required: true }]}>
          <Input placeholder="Sipariş numarası" />
        </Form.Item>

        <Form.Item label="Customer ID" name="customer">
          <Input placeholder="Müşteri numarası (opsiyonel)" />
        </Form.Item>

        <Form.Item label="Reason" name="reason" rules={[{ required: true }]}>
          <Input.TextArea placeholder="İade sebebi" rows={3} />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block>
            İade Talebi Oluştur
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default ReturnForm;
