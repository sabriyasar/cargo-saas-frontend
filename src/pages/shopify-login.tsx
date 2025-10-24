// pages/shopify-login.tsx
import React, { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function ShopifyLogin() {
  const router = useRouter();

  useEffect(() => {
    // 🔹 router query hazır değilse bekle
    if (!router.isReady) return;

    const shop = router.query.shop as string;
    if (!shop) {
      alert("Shop parametresi eksik");
      return;
    }

    const state = Math.random().toString(36).substring(2, 15); // basit state
    localStorage.setItem("shopify_oauth_state", state);

    const redirectUri = encodeURIComponent(
      "https://cargo-saas-frontend.vercel.app/shopify/callback"
    );

    const scopes = "read_products,write_orders,read_orders,write_fulfillments";

    const installUrl = `https://${shop}/admin/oauth/authorize?client_id=${process.env.NEXT_PUBLIC_SHOPIFY_API_KEY}&scope=${scopes}&redirect_uri=${redirectUri}&state=${state}&grant_options[]=per-user`;

    // Shopify OAuth yönlendirmesi
    window.location.href = installUrl;
  }, [router.isReady, router.query.shop]); // 🔹 dependency array güncellendi

  return <p>Redirecting to Shopify...</p>;
}
