import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { Form, Input, Button, Card, message } from 'antd';

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Fake kullanıcı bilgileri (ileride API'ye bağlanacak)
  const VALID_USER = {
    username: process.env.NEXT_PUBLIC_LOGIN_USER || 'admin',
    password: process.env.NEXT_PUBLIC_LOGIN_PASS || '12345',
  };

  const onFinish = (values: { username: string; password: string }) => {
    const { username, password } = values;

    if (username === VALID_USER.username && password === VALID_USER.password) {
      localStorage.setItem('isLoggedIn', 'true');
      message.success('Giriş başarılı');
      router.push('/'); // giriş sonrası yönlendirme
    } else {
      message.error('Kullanıcı adı veya şifre hatalı');
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: '#f5f5f5',
      }}
    >
      <Card title="Giriş Yap" style={{ width: 320 }}>
        <Form onFinish={onFinish} layout="vertical">
          <Form.Item
            label="Kullanıcı Adı"
            name="username"
            rules={[{ required: true, message: 'Kullanıcı adını giriniz' }]}
          >
            <Input placeholder="Kullanıcı adı" />
          </Form.Item>

          <Form.Item
            label="Şifre"
            name="password"
            rules={[{ required: true, message: 'Şifreyi giriniz' }]}
          >
            <Input.Password placeholder="Şifre" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading}>
              Giriş Yap
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
