import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import { Provider } from "jotai";
import { store } from "@/util/atoms";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "sBTC Bridge",
  description: "sBTC Bridge",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <Provider store={store}>
        <body className={inter.className}>{children}</body>
      </Provider>
    </html>
  );
}
