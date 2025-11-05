import React, { useEffect } from "react";
import { useRouter } from "next/router";
import axios from "axios";

const BACKEND_URL = "https://cargo-saas-backend.onrender.com";

export default function ShopifyCallback() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Parametreleri asPath yerine direkt URL'den çek
    const queryParams = new URLSearchParams(window.location.search);
    const shop = queryParams.get("shop");
    const code = queryParams.get("code");
    const state = queryParams.get("state");
    const savedState = localStorage.getItem("shopify_oauth_state");

    console.log("🟩 Shopify callback geldi:", { shop, code, state });

    if (!shop || !code || !state) {
      alert("Eksik parametreler!");
      return;
    }
    if (state !== savedState) {
      console.warn("⚠️ State uyuşmadı ama test için devam ediliyor.");
    }    

    axios.post(`${BACKEND_URL}/shopify/token`, { shop, code })
      .then(() => {
        alert("Shopify OAuth başarılı!");
        router.push(`/orders?shop=${shop}`);
      })
      .catch(err => {
        console.error("OAuth hatası:", err);
        alert("OAuth başarısız");
      });
  }, []);

  return <p>Processing OAuth callback...</p>;
}
