"use server";

import { cache } from "react";

export default cache(async function getSbtcBridgeConfig() {
  const EMILY_URL = process.env.EMILY_URL;
  const MEMPOOL_API_URL = process.env.MEMPOOL_API_URL;
  const WALLET_NETWORK = process.env.WALLET_NETWORK;
  const SBTC_CONTRACT_ADDRESS = process.env.SBTC_CONTRACT_ADDRESS;
  const SIGNER_AGGREGATE_KEY = process.env.SIGNER_AGGREGATE_KEY;
  const STACKS_API_URL = process.env.STACKS_API_URL;

  return {
    EMILY_URL,
    MEMPOOL_API_URL,
    WALLET_NETWORK,
    SBTC_CONTRACT_ADDRESS,
    SIGNER_AGGREGATE_KEY,
    STACKS_API_URL,
  };
});
