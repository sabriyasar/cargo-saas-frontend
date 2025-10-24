import React, { ReactNode } from 'react';
import { Layout, Menu } from 'antd';
import { useRouter } from 'next/router';
import {
  AppstoreOutlined,
  ShoppingCartOutlined,
  SyncOutlined,
  UserOutlined
} from '@ant-design/icons';

const { Header, Sider, Content } = Layout;

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter();
  const selectedKey = router.pathname;

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider collapsible>
        <div style={{ height: 64, color: '#fff', fontSize: 20, textAlign: 'center', paddingTop: 16 }}>
          Kargo Paneli
        </div>
        <Menu theme="dark" mode="inline" selectedKeys={[selectedKey]}>
          <Menu.Item key="/" icon={<AppstoreOutlined />} onClick={() => router.push('/')}>
            Dashboard
          </Menu.Item>
          <Menu.Item key="/orders" icon={<ShoppingCartOutlined />} onClick={() => router.push('/orders')}>
            Siparişler
          </Menu.Item>
          <Menu.Item key="/returns" icon={<SyncOutlined />} onClick={() => router.push('/returns')}>
            İadeler
          </Menu.Item>
          <Menu.Item key="/individual-shipment" icon={<UserOutlined />} onClick={() => router.push('/individual-shipment')}>
            Gönderi Oluştur
          </Menu.Item>
          <Menu.Item key="/settings" icon={<UserOutlined />} onClick={() => router.push('/settings')}>
            Ayarlar
          </Menu.Item>
        </Menu>
      </Sider>
      <Layout>
        <Header style={{ background: '#fff', padding: 0 }} />
        <Content style={{ margin: '16px' }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}
