import {
  Cl,
  fetchCallReadOnlyFunction,
  ResponseOkCV,
  UIntCV,
} from "@stacks/transactions";

/**
 *
 * @description gets the total sbtc balance of an address this includes both locked and avaialable sbtc
 */
export default async function getSbtcTotalBalance({
  address,
  deployerAddress,
}: {
  address: string;
  deployerAddress: string;
}) {
  const response = (await fetchCallReadOnlyFunction({
    contractAddress: deployerAddress,
    contractName: "sbtc-token",
    functionName: "get-balance",
    functionArgs: [Cl.address(address)],
    senderAddress: address,
  })) as ResponseOkCV<UIntCV>;

  return response.value.value;
}
