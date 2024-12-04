import { Inter } from "next/font/google";

import "./globals.css";
import LayoutClient from "./layout-client";
import getSbtcBridgeConfig from "@/actions/get-sbtc-bridge-config";

const inter = Inter({ subsets: ["latin"] });

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const sBTCBridgeConfig = await getSbtcBridgeConfig();
  return (
    <html lang="en">
      <head>
        <title>sBTC Bridge</title>
        <meta name="description" content="sBTC Bridge" />
        <meta property="og:title" content="sBTC Bridge" />
        <meta property="og:description" content="sBTC Bridge" />
        <meta property="og:site_name" content="sBTC Bridge" />
        <meta property="og:image:alt" content="sBTC Bridge" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@stacks" />
        <meta name="twitter:title" content="sBTC Bridge" />
        <meta name="twitter:description" content="sBTC Bridge" />
        <meta name="twitter:image" content="/images/icon.png" />
        <meta name="twitter:image:alt" content="sBTC Bridge" />
      </head>
      <body className={inter.className}>
        <LayoutClient config={sBTCBridgeConfig}>{children}</LayoutClient>
      </body>
    </html>
  );
}
