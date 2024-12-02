export function getStacksNetwork(walletNetwork?: string) {
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
