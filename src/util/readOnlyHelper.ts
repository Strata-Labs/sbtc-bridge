import { fetchCallReadOnlyFunction } from "@stacks/transactions";
import { cvToJSON } from "@stacks/transactions";

import { StacksNetwork } from "@stacks/network";

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
  const options = {
    contractAddress: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS,
    contractName: process.env.NEXT_PUBLIC_CONTRACT_NAME,
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
    console.log("result: ", result);

    return result;
  } catch (err: any) {
    console.log("error: ", options, err);
    throw new Error(err);
  }
};

export default readOnlyHelper;
