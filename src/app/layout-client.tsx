"use client";

import { Provider } from "jotai";
import { BridgeConfig, store } from "@/util/atoms";

import RenderNotifications from "@/comps/RenderNotifications";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/query/client";
import { Suspense, useEffect } from "react";
import { bridgeConfigAtom } from "@/util/atoms";
import Header from "@/comps/Header";
import Footer from "@/comps/footer";

export default function LayoutClient({
  children,
  config,
}: Readonly<{
  children: React.ReactNode;
  config: BridgeConfig;
}>) {
  useEffect(() => {
    store.set(bridgeConfigAtom, config);
  }, []);

  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <RenderNotifications />
        <main className="min-w-screen bg-white  flex items-center flex-col min-h-screen ">
          <Suspense fallback={<div>Loading...</div>}>
            <Header config={config} />
            {children}
            <Footer />
          </Suspense>
        </main>
      </QueryClientProvider>
    </Provider>
  );
}
