import { DefaultNetworkConfigurations } from "@leather.io/models";
import { networks } from "bitcoinjs-lib";
export default function getBitcoinNetwork(
  walletNetwork?: DefaultNetworkConfigurations,
) {
  let network = networks.bitcoin;
  if (walletNetwork !== "mainnet") {
    network = networks.regtest;
  }
  return network;
}
