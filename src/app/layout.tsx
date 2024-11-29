"use client";

import { Inter } from "next/font/google";

import "./globals.css";

import { Provider } from "jotai";
import { store } from "@/util/atoms";

import RenderNotifications from "@/comps/RenderNotifications";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <Provider store={store}>
        <RenderNotifications />
        <body className={inter.className}>{children}</body>
      </Provider>
    </html>
  );
}
