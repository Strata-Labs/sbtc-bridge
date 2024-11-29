import getSbtcBridgeConfig from "@/actions/get-sbtc-bridge-config";
import HomeApp from "@/comps/HomeApp";
import { Suspense } from "react";

export default async function Home() {
  const sBTCBridgeConfig = await getSbtcBridgeConfig();
  return (
    <main className="min-w-screen bg-white  flex items-center flex-col min-h-screen ">
      <Suspense fallback={<div>Loading...</div>}>
        <HomeApp config={sBTCBridgeConfig} />
      </Suspense>
    </main>
  );
}
export const dynamic = "force-dynamic";
