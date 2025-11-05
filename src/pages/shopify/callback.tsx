// pages/shopify/callback.tsx
import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';

const BACKEND_URL = "https://cargo-saas-backend.onrender.com";

export default function ShopifyCallback() {
  const router = useRouter();

  useEffect(() => {
    if (!router.isReady) return; // router.query hazır değilse çık

    const { shop, code, state } = router.query;
    const savedState = localStorage.getItem("shopify_oauth_state");

    if (!shop || !code || !state) {
      console.warn("⚠️ Eksik query parametreleri:", { shop, code, state });
      return;
    }

    if (state !== savedState) {
      alert("State uyuşmadı!");
      return;
    }

    console.log("✅ Shopify callback alındı:", { shop, code });

    axios.post(`${BACKEND_URL}/shopify/token`, { shop, code })
      .then(() => {
        alert("✅ Shopify OAuth başarılı!");
        router.push(`/orders?shop=${shop}`);
      })
      .catch(err => {
        console.error("❌ OAuth hatası:", err);
        alert("OAuth başarısız");
      });
  }, [router.isReady, router.query]);

  return <p>Processing OAuth callback...</p>;
}
