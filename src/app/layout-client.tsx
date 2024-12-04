"use client";

import { Provider } from "jotai";
import { store } from "@/util/atoms";

import RenderNotifications from "@/comps/RenderNotifications";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/query/client";
import { Suspense } from "react";

export default function LayoutClient({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <RenderNotifications />
        <main className="min-w-screen bg-white  flex items-center flex-col min-h-screen ">
          <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
        </main>
      </QueryClientProvider>
    </Provider>
  );
}
