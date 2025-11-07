import React from 'react';
import AdminLayout from '@/components/Layout';
import { Card, Row, Col } from 'antd';

export default function Dashboard() {
  return (
    <AdminLayout>
      <Row gutter={16}>
        <Col span={8}>
          <Card title="Toplam Sipariş" bordered={false}>
            125
          </Card>
        </Col>
        <Col span={8}>
          <Card title="Toplam Kargo" bordered={false}>
            80
          </Card>
        </Col>
        <Col span={8}>
          <Card title="Toplam İade" bordered={false}>
            10
          </Card>
        </Col>
      </Row>
    </AdminLayout>
  );
}