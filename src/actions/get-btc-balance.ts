"use server";

import { env } from "@/env";
interface AddressRes {
  address: string;
  chain_stats: ChainStats;
  mempool_stats: MempoolStats;
}

interface ChainStats {
  funded_txo_count: number;
  funded_txo_sum: number;
  spent_txo_count: number;
  spent_txo_sum: number;
  tx_count: number;
}

interface MempoolStats {
  funded_txo_count: number;
  funded_txo_sum: number;
  spent_txo_count: number;
  spent_txo_sum: number;
  tx_count: number;
}

export default async function getBtcBalance(address: string) {
  const res = await fetch(`${env.MEMPOOL_API_URL}/address/${address}`);
  const data = (await res.json()) as AddressRes;
  const balance =
    data.chain_stats.funded_txo_sum - data.chain_stats.spent_txo_sum;
  return balance / 1e8;
}
