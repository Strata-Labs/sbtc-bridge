import {
  Cl,
  fetchCallReadOnlyFunction,
  ResponseOkCV,
  UIntCV,
} from "@stacks/transactions";
import { StacksNetworkName } from "@stacks/network";

/**
 *
 * @description gets the total sbtc balance of an address this includes both locked and avaialable sbtc
 */
export default async function getSbtcTotalBalance({
  address,
  deployerAddress,
  network,
}: {
  address: string;
  deployerAddress: string;
  network?: StacksNetworkName;
}) {
  const response = (await fetchCallReadOnlyFunction({
    contractAddress: deployerAddress,
    contractName: "sbtc-token",
    functionName: "get-balance",
    functionArgs: [Cl.address(address)],
    network: network,
    senderAddress: address,
  })) as ResponseOkCV<UIntCV>;

  return response.value.value;
}
