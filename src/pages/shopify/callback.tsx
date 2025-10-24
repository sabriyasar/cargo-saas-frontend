// pages/shopify/callback.tsx
import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';

const BACKEND_URL = "https://cargo-saas-backend.onrender.com";

export default function ShopifyCallback() {
  const router = useRouter();

  useEffect(() => {
    const { shop, code, state } = router.query;
    const savedState = localStorage.getItem("shopify_oauth_state");

    if (!shop || !code || !state) return;
    if (state !== savedState) {
      alert("State uyuşmadı!");
      return;
    }

    // Token alma request'i backend'e gönder
    axios.post(`${BACKEND_URL}/shopify/token`, { shop, code })
      .then(() => {
        alert("Shopify OAuth başarılı!");
        router.push(`/orders?shop=${shop}`);
      })
      .catch(err => {
        console.error(err);
        alert("OAuth başarısız");
      });
  }, [router.query]);

  return <p>Processing OAuth callback...</p>;
}
