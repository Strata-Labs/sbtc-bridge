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
        {process.env.NEXT_PUBLIC_LIVECHAT_ID && (
          <>
          <script
          dangerouslySetInnerHTML={{
            __html: `
              window.__lc = window.__lc || {};
              window.__lc.license = ${process.env.NEXT_PUBLIC_LIVECHAT_ID};
              window.__lc.integration_name = "manual_onboarding";
              window.__lc.product_name = "livechat";
              ;(function(n,t,c){
                function i(n){return e._h?e._h.apply(null,n):e._q.push(n)}
                var e={_q:[],_h:null,_v:"2.0",
                  on:function(){i(["on",[].slice.call(arguments)])},
                  once:function(){i(["once",[].slice.call(arguments)])},
                  off:function(){i(["off",[].slice.call(arguments)])},
                  get:function(){
                    if(!e._h)throw new Error("[LiveChatWidget] You can't use getters before load.");
                    return i(["get",[].slice.call(arguments)])
                  },
                  call:function(){i(["call",[].slice.call(arguments)])},
                  init:function(){
                    var n=t.createElement("script");
                    n.async=!0,n.type="text/javascript",
                    n.src="https://cdn.livechatinc.com/tracking.js",
                    t.head.appendChild(n)
                  }
                };
                !n.__lc.asyncInit && e.init();
                n.LiveChatWidget = n.LiveChatWidget || e;
              })(window,document);
            `,
          }}
        />
        <noscript>
          <a href={"https://www.livechat.com/chat-with/" + process.env.NEXT_PUBLIC_LIVECHAT_ID + "/"} rel="nofollow">
            Chat with us
          </a>
          , powered by{" "}
          <a
            href="https://www.livechat.com/?welcome"
            rel="noopener nofollow"
            target="_blank"
          >
            LiveChat
          </a>
        </noscript>
        </>
        )}
      </head>
      <body className={inter.className}>
        <LayoutClient config={sBTCBridgeConfig}>{children}</LayoutClient>
      </body>
    </html>
  );
}

export const dynamic = "force-dynamic";
