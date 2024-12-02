"use server";

import TransferApp from "@/comps/TransferHome";

export default async function Home() {
  return (
    <main className="min-w-screen bg-white  flex items-center flex-col min-h-screen ">
      <TransferApp />
    </main>
  );
}
