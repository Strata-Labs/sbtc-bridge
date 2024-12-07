import { DefaultNetworkConfigurations } from "@leather.io/models";
export function getStacksNetwork(walletNetwork?: DefaultNetworkConfigurations) {
  let network: "testnet" | "devnet" | "mainnet" = "mainnet";
  if (
    walletNetwork === "testnet" ||
    walletNetwork === "sbtcTestnet" ||
    walletNetwork === "testnet4" ||
    walletNetwork === "signet"
  ) {
    network = "testnet";
  }
  if (walletNetwork === "sbtcDevenv" || walletNetwork === "devnet") {
    network = "devnet";
  }
  return network;
}
