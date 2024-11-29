"use server";

import StatusApp from "@/comps/StatusApp";
import { Suspense } from "react";

export default async function Home() {
  return (
    <main className="min-w-screen bg-white  flex items-center flex-col min-h-screen ">
      <Suspense fallback={<div>Loading...</div>}>
        <StatusApp />
      </Suspense>
    </main>
  );
}
