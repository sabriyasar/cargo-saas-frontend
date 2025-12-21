import React, { ReactNode } from 'react';
import { Layout, Menu, Button } from 'antd';
import { useRouter } from 'next/router';
import {
  AppstoreOutlined,
  ShopOutlined,
  ShoppingCartOutlined,
  SyncOutlined,
  UserOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import CreditLoadDropdown from './CreditLoadDropdown';

const { Header, Sider, Content } = Layout;

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter();
  const selectedKey = router.pathname;

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    router.push('/login');
  };

  return (
    <Layout className="admin-layout">
      <Sider
        collapsible
        collapsedWidth={80} // dar hali
        breakpoint="lg" // lg altı otomatik collapse
      >
        <div className="logo">Kargo Paneli</div>
        <Menu theme="dark" mode="inline" selectedKeys={[selectedKey]}>
          <Menu.Item key="/" icon={<AppstoreOutlined />} onClick={() => router.push('/')}>
            Dashboard
          </Menu.Item>
          <Menu.Item key="/orders" icon={<ShoppingCartOutlined />} onClick={() => router.push('/orders')}>
            Gönderiler
          </Menu.Item>
          <Menu.Item key="/returns" icon={<SyncOutlined />} onClick={() => router.push('/returns')}>
            İadeler
          </Menu.Item>
          <Menu.Item key="/individual-shipment" icon={<UserOutlined />} onClick={() => router.push('/individual-shipment')}>
            Gönderi Oluştur
          </Menu.Item>
          <Menu.Item key="/shopify-shops" icon={<ShopOutlined />} onClick={() => router.push('/shopify-shops')}>
            Shopify Mağazaları
          </Menu.Item>
          <Menu.Item key="/settings" icon={<UserOutlined />} onClick={() => router.push('/settings')}>
            Ayarlar
          </Menu.Item>
        </Menu>
      </Sider>

      <Layout>
        <Header className="admin-header">
          <div className="header-buttons">
            <CreditLoadDropdown />
            <Button
              type="primary"
              danger
              icon={<LogoutOutlined />}
              onClick={handleLogout}
              className="logout-btn"
            >
              Çıkış Yap
            </Button>
          </div>
        </Header>

        <Content className="admin-content">{children}</Content>
      </Layout>
    </Layout>
  );
}
