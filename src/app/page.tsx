import getSbtcBridgeConfig from "@/actions/get-sbtc-bridge-config";
import HomeApp from "@/comps/HomeApp";

export default async function Home() {
  const sBTCBridgeConfig = await getSbtcBridgeConfig();
  return <HomeApp config={sBTCBridgeConfig} />;
}
export const dynamic = "force-dynamic";
