"use server";

import { env } from "@/env";
import {
  fetchCallReadOnlyFunction,
  type ResponseOkCV,
  type UIntCV,
} from "@stacks/transactions";
import { type StacksNetworkName } from "@stacks/network";
export default async function getCurrentSbtcSupply() {
  const response = (await fetchCallReadOnlyFunction({
    contractAddress: env.SBTC_CONTRACT_DEPLOYER!,
    contractName: "sbtc-token",
    functionName: "get-total-supply",
    functionArgs: [],
    network:
      env.WALLET_NETWORK === "sbtcDevenv"
        ? "devnet"
        : (env.WALLET_NETWORK as StacksNetworkName),
    senderAddress: env.SBTC_CONTRACT_DEPLOYER!,
  })) as ResponseOkCV<UIntCV>;

  return response;
}
