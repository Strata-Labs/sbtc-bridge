import { fetchCallReadOnlyFunction } from "@stacks/transactions";
import { cvToJSON } from "@stacks/transactions";

import { StacksNetwork } from "@stacks/network";
import { bridgeConfigAtom, store } from "./atoms";

type ReadOnlyHelperProps = {
  stacksNetwork: StacksNetwork;
  walletAddress: string;
  functionName: string;
};

const readOnlyHelper = async ({
  functionName,
  stacksNetwork,
  walletAddress,
}: ReadOnlyHelperProps) => {
  const config = store.get(bridgeConfigAtom);
  const options = {
    contractAddress: config.SBTC_CONTRACT_ADDRESS!,
    contractName: config.SBTC_CONTRACT_NAME!,
    functionName: functionName,
    //'get-current-aggregate-pubkey',
    functionArgs: [],
    network: stacksNetwork,
    senderAddress: walletAddress,
  };

  //setLoading(true);
  try {
    const call = await fetchCallReadOnlyFunction(options as any);
    const result = cvToJSON(call).value;

    return result;
  } catch (err: any) {
    throw new Error(err);
  }
};

export default readOnlyHelper;
