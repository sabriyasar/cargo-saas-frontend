import React, { useEffect, useState } from 'react';
import { Form, Input, Button, message } from 'antd';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3003';

export default function SettingsPage() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [shop, setShop] = useState<string | null>(null);

  // 🔹 window kontrolü ile shop parametresi al
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlShop = new URLSearchParams(window.location.search).get('shop');
      setShop(urlShop);
    }
  }, []);

  // 🔹 Mevcut ayarları çek
  useEffect(() => {
    if (!shop) return;

    axios.get(`${API_URL}/shopify/settings/${shop}`)
      .then(res => {
        if (res.data.success) {
          form.setFieldsValue(res.data.data);
        }
      })
      .catch(err => console.error(err));
  }, [shop, form]);

  const onFinish = async (values: any) => {
    if (!shop) return message.error('Shop parametresi yok');

    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/shopify/settings/update-api`, { shop, ...values });
      if (res.data.success) message.success(res.data.message);
      else message.error(res.data.message || 'Kaydedilemedi');
    } catch (err: any) {
      console.error(err);
      message.error('Kaydedilemedi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form form={form} onFinish={onFinish} layout="vertical">
      <Form.Item 
        label="API Key" 
        name="apiKey" 
        rules={[{ required: true, message: 'API Key gerekli' }]}
      >
        <Input />
      </Form.Item>

      <Form.Item 
        label="API Secret" 
        name="apiSecret" 
        rules={[{ required: true, message: 'API Secret gerekli' }]}
      >
        <Input />
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" loading={loading}>
          Kaydet
        </Button>
      </Form.Item>
    </Form>
  );
}
