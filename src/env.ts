// MUST NOT BE USED BY CLIENT
import "server-only";
import { DefaultNetworkConfigurations } from "@leather.io/models";
export const env = {
  BITCOIND_URL: process.env.BITCOIND_URL || "http://localhost:18443",
  EMILY_URL: process.env.EMILY_URL,
  MEMPOOL_API_URL: (
    process.env.MEMPOOL_API_URL || "http://localhost:8083/api"
  ).replace(/\/$/, ""),
  PUBLIC_MEMPOOL_URL: (
    process.env.PUBLIC_MEMPOOL_URL || "http://localhost:8083"
  ).replace(/\/$/, ""),

  BITCOIN_RPC_USER_NAME: process.env.BITCOIN_RPC_USER_NAME || "devnet",
  BITCOIN_RPC_PASSWORD: process.env.BITCOIN_RPC_PASSWORD || "devnet",
  WALLET_NETWORK: (process.env.WALLET_NETWORK || "sbtcDevenv") as
    | DefaultNetworkConfigurations
    | undefined,
  SBTC_CONTRACT_DEPLOYER: process.env.SBTC_CONTRACT_DEPLOYER,
  BANNER_CONTENT: process.env.BANNER_CONTENT,
  RECLAIM_LOCK_TIME: process.env.RECLAIM_LOCK_TIME,
  MINIMUM_DEPOSIT_AMOUNT_IN_SATS: Number(
    process.env.MINIMUM_DEPOSIT_AMOUNT_IN_SATS || 1000,
  ),
};
