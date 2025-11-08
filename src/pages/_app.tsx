import React from "react";
import type { AppProps } from "next/app";
import createApp from "@shopify/app-bridge";
import AuthGuard from "@/components/AuthGuard"; // 🔒 AuthGuard’ı içeri al
import '@/styles/dashboard.scss';
import "antd/dist/reset.css"; // (isteğe bağlı: Ant Design reset)

export default function App({ Component, pageProps }: AppProps) {
  const host =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get("host") || ""
      : "";

  const app = host
    ? createApp({
        apiKey: process.env.NEXT_PUBLIC_SHOPIFY_API_KEY!,
        host,
        forceRedirect: true,
      })
    : null;

  // Eğer giriş sayfasındaysa AuthGuard uygulama
  const isLoginPage =
    typeof window !== "undefined" && window.location.pathname === "/login";

  return isLoginPage ? (
    <Component {...pageProps} app={app} />
  ) : (
    <AuthGuard>
      <Component {...pageProps} app={app} />
    </AuthGuard>
  );
}
