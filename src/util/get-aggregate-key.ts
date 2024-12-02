"use client";
import { fetchCallReadOnlyFunction, BufferCV } from "@stacks/transactions";
import { bridgeConfigAtom, store } from "./atoms";
import { getStacksNetwork } from "./get-stacks-network";

export async function getAggregateKey() {
  const { WALLET_NETWORK, SBTC_CONTRACT_DEPLOYER } =
    store.get(bridgeConfigAtom);
  const network = getStacksNetwork(WALLET_NETWORK);

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
