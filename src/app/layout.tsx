"use client";

import { Inter } from "next/font/google";
import { Connect } from "@stacks/connect-react";

import "./globals.css";

import { Provider } from "jotai";
import { store } from "@/util/atoms";
import { useWallet, WalletContextProvider } from "@/util/WalletContext";
import { Suspense } from "react";

const inter = Inter({ subsets: ["latin"] });

const Layout = ({ children }: { children: React.ReactNode }) => {
  const { options } = useWallet();

  return <Connect authOptions={options}>{children}</Connect>;
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <Provider store={store}>
        <WalletContextProvider>
          <Layout>
            <Suspense fallback={<div>Loading...</div>}>
              <body className={inter.className}>{children}</body>
            </Suspense>
          </Layout>
        </WalletContextProvider>
      </Provider>
    </html>
  );
}
