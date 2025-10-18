import React from "react";
import 'antd/dist/reset.css';
import "@/styles/globals.css";
import "@/styles/returnForm.scss";
import "@/styles/returnList.scss";
import type { AppProps } from "next/app";

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}
