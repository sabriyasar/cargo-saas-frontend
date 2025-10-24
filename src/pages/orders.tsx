import React, { useEffect, useState } from 'react';
import AdminLayout from '@/components/Layout';
import OrderList from '@/components/OrderList';
import { useRouter } from 'next/router';
import createApp from '@shopify/app-bridge';
import { getSessionToken } from '@shopify/app-bridge-utils';

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

    getSessionToken(app).then((token: string) => {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const shopDomain = payload['https://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'];
        setShop(shopDomain);
      } catch (err) {
        console.error('Shop bilgisini JWT’den çıkaramadık', err);
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
