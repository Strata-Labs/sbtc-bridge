"use client";

import { bridgeConfigAtom } from "@/util/atoms";
import getSbtcTotalBalance from "@/util/get-sbtc-balance";
import { getStacksNetwork } from "@/util/get-stacks-network";
import { useQuery } from "@tanstack/react-query";
import { useAtomValue } from "jotai";

export default function SBTCBalance({ address }: { address: string }) {
  const { SBTC_CONTRACT_DEPLOYER, WALLET_NETWORK } =
    useAtomValue(bridgeConfigAtom);
  const { data } = useQuery({
    queryKey: ["sbtc-balance", address],
    queryFn: async () => {
      return await getSbtcTotalBalance({
        address,
        deployerAddress: SBTC_CONTRACT_DEPLOYER!,
        network: getStacksNetwork(WALLET_NETWORK),
      });
    },
  });
  return (
    <div className="flex flex-col items-center justify-center">
      <div className="text-center font-bold text-darkGray">
        {data !== undefined ? Number(data) / 1e8 : "..."} sBTC
      </div>
    </div>
  );
}
