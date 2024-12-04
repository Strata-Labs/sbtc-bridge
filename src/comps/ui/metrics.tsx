import getCurrentSbtcSupply from "@/actions/get-current-sbtc-supply";
import getTokenPrice from "@/util/get-token-price";
import { useQuery } from "@tanstack/react-query";

export default function Metrics() {
  const { data: totalCirculatingSupply } = useQuery({
    queryKey: ["totalCirculatingSupply"],
    queryFn: () => getCurrentSbtcSupply(),
    select: (data) => {
      return Number(data.value.value) / 1e8;
    },
  });
  const { data: totalValueLocked } = useQuery({
    queryKey: ["tvl"],
    queryFn: () => getTokenPrice("bitcoin"),
    select: (data) => {
      return totalCirculatingSupply && totalCirculatingSupply * data;
    },
  });
  return (
    <div className="bg-white pl-8 w-full flex flex-col justify-center font-Matter">
      <p className="text-darkGray text-sm">
        Circulating Supply: {totalCirculatingSupply ?? "..."} sBTC
      </p>
      <p className="text-darkGray text-sm">
        TVL: ${totalValueLocked ? totalValueLocked.toLocaleString() : "..."}
      </p>
    </div>
  );
}
