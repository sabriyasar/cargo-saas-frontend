import React from "react";
import type { AppProps } from "next/app";
import createApp from "@shopify/app-bridge";

export default function App({ Component, pageProps }: AppProps) {
  const host =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get("host") || ""
      : "";

  const app = host ? createApp({
    apiKey: process.env.NEXT_PUBLIC_SHOPIFY_API_KEY!,
    host,
    forceRedirect: true,
  }) : null;

  return <Component {...pageProps} app={app} />;
}
