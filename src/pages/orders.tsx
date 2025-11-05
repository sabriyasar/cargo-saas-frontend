// pages/orders.tsx
import React from 'react';
import AdminLayout from '@/components/Layout';
import OrderList from '@/components/OrderList';

export default function OrdersPage() {
  return (
    <AdminLayout>
      <h2>Shopify Siparişleri</h2>
      <OrderList />
    </AdminLayout>
  );
}


/* PUBLIC APP

// pages/orders.tsx
import React, { useEffect, useState } from 'react';
import AdminLayout from '@/components/Layout';
import OrderList from '@/components/OrderList';
import { useRouter } from 'next/router';

export default function OrdersPage() {
  const router = useRouter();
  const [shop, setShop] = useState<string>('');

  useEffect(() => {
    if (router.isReady) {
      const shopParam = router.query.shop;
      if (typeof shopParam === 'string') setShop(shopParam);
    }
  }, [router.isReady, router.query.shop]);

  return (
    <AdminLayout>
      <h2>Shopify Siparişleri</h2>
      {shop ? <OrderList shop={shop} /> : <p>Shop parametresi yok</p>}
    </AdminLayout>
  );
}
 */