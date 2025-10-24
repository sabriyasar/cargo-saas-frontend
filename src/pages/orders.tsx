// pages/orders.tsx
import React, { useEffect, useState } from 'react';
import AdminLayout from '@/components/Layout';
import OrderList from '@/components/OrderList';
import { useRouter } from 'next/router';
import createApp from '@shopify/app-bridge';
import { getSessionToken } from '@shopify/app-bridge-utils';
import axios from 'axios';

export default function OrdersPage() {
  const [shop, setShop] = useState<string>('');
  const router = useRouter();

  useEffect(() => {
    if (!router.isReady) return;

    const host = router.query.host as string;
    if (!host) {
      console.error('Shopify host parametresi yok');
      return;
    }

    const app = createApp({
      apiKey: process.env.NEXT_PUBLIC_SHOPIFY_API_KEY!,
      host,
      forceRedirect: true,
    });

    // 🔹 JWT ile backend çağrısı
    getSessionToken(app).then(async (token: string) => {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/shopify/orders`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        // Backend shop domain’i döndürecek
        setShop(res.data.shop);
      } catch (err) {
        console.error('Orders fetch hatası:', err);
      }
    });
  }, [router.isReady, router.query.host]);

  return (
    <AdminLayout>
      <h2>Shopify Siparişleri</h2>
      {shop ? <OrderList shop={shop} /> : <p>Loading shop info...</p>}
    </AdminLayout>
  );
}
