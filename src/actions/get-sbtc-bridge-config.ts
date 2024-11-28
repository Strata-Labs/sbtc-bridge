"use server";

import { env } from "@/env";
import { cache } from "react";

export default cache(async function getSbtcBridgeConfig() {
  const EMILY_URL = env.EMILY_URL;
  const WALLET_NETWORK = env.WALLET_NETWORK;
  const SBTC_CONTRACT_DEPLOYER = env.SBTC_CONTRACT_DEPLOYER;
  const SIGNER_AGGREGATE_KEY = env.SIGNER_AGGREGATE_KEY;

  return {
    EMILY_URL,
    WALLET_NETWORK,
    SBTC_CONTRACT_DEPLOYER,
    SIGNER_AGGREGATE_KEY,
  };
});
