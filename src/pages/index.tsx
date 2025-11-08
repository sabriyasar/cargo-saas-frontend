import React from 'react';
import AdminLayout from '@/components/Layout';
import { Card, Row, Col } from 'antd';
import {
  ClockCircleOutlined,
  CarOutlined,
  CheckCircleOutlined,
  RollbackOutlined,
  CloseCircleOutlined,
  UnorderedListOutlined
} from '@ant-design/icons';

export default function Dashboard() {
  const cards = [
    { title: 'Kargo Oluşturulmayı Bekleyenler', value: 12, className: 'pending', icon: <ClockCircleOutlined /> },
    { title: 'Kargo Teslim Bekleyenler', value: 25, className: 'waiting', icon: <CarOutlined /> },
    { title: 'Teslim Edilen Kargolar', value: 80, className: 'delivered', icon: <CheckCircleOutlined /> },
    { title: 'İade Gelen Kargolar', value: 10, className: 'returned', icon: <RollbackOutlined /> },
    { title: 'İptal Edilen Kargolar', value: 5, className: 'cancelled', icon: <CloseCircleOutlined /> },
    { title: 'Tüm Kargolar', value: 132, className: 'all', icon: <UnorderedListOutlined /> },
  ];

  return (
    <AdminLayout>
      <Row gutter={[16, 16]}>
        {cards.map((card, idx) => (
          <Col key={idx} xs={24} sm={12} md={8}>
            <Card className={`dashboard-card ${card.className}`} bordered={false}>
              <div className="card-icon">{card.icon}</div>
              <div className="card-title">{card.title}</div>
              <div className="card-value">{card.value}</div>
            </Card>
          </Col>
        ))}
      </Row>
    </AdminLayout>
  );
}
