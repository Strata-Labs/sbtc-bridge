"use client";
import { fetchCallReadOnlyFunction, BufferCV } from "@stacks/transactions";
import { bridgeConfigAtom, store } from "./atoms";

export async function getAggregateKey() {
  const { WALLET_NETWORK, SBTC_CONTRACT_DEPLOYER } =
    store.get(bridgeConfigAtom);
  let network: "testnet" | "devnet" | "mainnet" = "mainnet";
  if (
    WALLET_NETWORK === "testnet" ||
    WALLET_NETWORK === "sbtcTestnet" ||
    WALLET_NETWORK === "testnet4" ||
    WALLET_NETWORK === "signet"
  ) {
    network = "testnet";
  }
  if (WALLET_NETWORK === "sbtcDevenv" || WALLET_NETWORK === "devnet") {
    network = "devnet";
  }
  const result = (await fetchCallReadOnlyFunction({
    contractName: "sbtc-registry",
    contractAddress: SBTC_CONTRACT_DEPLOYER!,
    functionName: "get-current-aggregate-pubkey",
    functionArgs: [],
    network: network,
    senderAddress: SBTC_CONTRACT_DEPLOYER!,
  })) as BufferCV;

  return result.value;
}
