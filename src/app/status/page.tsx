"use server";

import StatusApp from "@/comps/StatusApp";

export default async function Home() {
  return (
    <main className="min-w-screen bg-white  flex items-center flex-col min-h-screen ">
      <StatusApp />
    </main>
  );
}
