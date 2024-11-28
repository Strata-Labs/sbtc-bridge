"use server";

import getSbtcBridgeConfig from "@/actions/get-sbtc-bridge-config";
import HomeApp from "@/comps/HomeApp";

export default async function Home() {
  const sBTCBridgeConfig = await getSbtcBridgeConfig();
  return (
    <main className="min-w-screen bg-white  flex items-center flex-col min-h-screen ">
      <HomeApp config={sBTCBridgeConfig} />
    </main>
  );
}
