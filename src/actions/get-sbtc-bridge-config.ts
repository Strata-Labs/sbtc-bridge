"use server";

import { env } from "@/env";
import { cache } from "react";

export default cache(async function getSbtcBridgeConfig() {
  const EMILY_URL = env.EMILY_URL;
  const MEMPOOL_API_URL = env.MEMPOOL_API_URL;
  const WALLET_NETWORK = env.WALLET_NETWORK;
  const SBTC_CONTRACT_ADDRESS = env.SBTC_CONTRACT_ADDRESS;
  const SIGNER_AGGREGATE_KEY = env.SIGNER_AGGREGATE_KEY;
  const STACKS_API_URL = env.STACKS_API_URL;

  return {
    EMILY_URL,
    MEMPOOL_API_URL,
    WALLET_NETWORK,
    SBTC_CONTRACT_ADDRESS,
    SIGNER_AGGREGATE_KEY,
    STACKS_API_URL,
  };
});
