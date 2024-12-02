"use server";

import { env } from "@/env";
import { cache } from "react";
import { DefaultNetworkConfigurations } from "@leather.io/models";

export default cache(async function getSbtcBridgeConfig() {
  const EMILY_URL = env.EMILY_URL;
  const WALLET_NETWORK = env.WALLET_NETWORK as
    | DefaultNetworkConfigurations
    | undefined;
  const SBTC_CONTRACT_DEPLOYER = env.SBTC_CONTRACT_DEPLOYER;
  const SIGNER_AGGREGATE_KEY = env.SIGNER_AGGREGATE_KEY;
  const BANNER_CONTENT = env.BANNER_CONTENT;
  const RECLAIM_LOCK_TIME = env.RECLAIM_LOCK_TIME;

  return {
    EMILY_URL,
    WALLET_NETWORK,
    SBTC_CONTRACT_DEPLOYER,
    SIGNER_AGGREGATE_KEY,
    BANNER_CONTENT,
    RECLAIM_LOCK_TIME,
  };
});
