"use server";

import { env } from "@/env";

export interface BitcoinTransactionResponse {
  txid: string;
  version: number;
  locktime: number;
  size: number;
  weight: number;
  fee: number;
  vin: Vin[];
  vout: Vout[];
  status: Status;
  order: number;
  vsize: number;
  adjustedVsize: number;
  sigops: number;
  feePerVsize: number;
  adjustedFeePerVsize: number;
  effectiveFeePerVsize: number;
}

interface Vin {
  is_coinbase: boolean;
  prevout: Prevout;
  scriptsig: string;
  scriptsig_asm: string;
  sequence: number;
  txid: string;
  vout: number;
  witness: any[];
  inner_redeemscript_asm: string;
  inner_witnessscript_asm: string;
}

interface Prevout {
  value: number;
  scriptpubkey: string;
  scriptpubkey_address: string;
  scriptpubkey_asm: string;
  scriptpubkey_type: string;
}

interface Vout {
  value: number;
  scriptpubkey: string;
  scriptpubkey_address: string;
  scriptpubkey_asm: string;
  scriptpubkey_type: string;
}

interface Status {
  confirmed: boolean;
  block_height: number;
  block_hash: string;
  block_time: number;
}

export interface AddressUtxos {
  txid: string;
  vout: number;
  scriptPubKey: string;
  status: Status;
  value: number;
}

// Function to scan the UTXO set for an address
export const scanTxOutSet = async (
  address: string,
): Promise<AddressUtxos[]> => {
  const baseURL =
    env.WALLET_NETWORK === "mainnet" ? env.MEMPOOL_API_URL : "/api/proxy";
  const result = await fetch(`${baseURL}/adddress/${address}/utxo`);
  return await result.json();
};

// Function to get a raw transaction
export const getRawTransaction = async (
  txid: string,
): Promise<BitcoinTransactionResponse> => {
  const baseURL =
    env.WALLET_NETWORK === "mainnet" ? env.MEMPOOL_API_URL : "/api/proxy";
  const result = await fetch(`${baseURL}/tx/${txid}`);
  return await result.json();
};

// Function to transmit a raw transaction to the network
export const transmitRawTransaction = async (hex: string): Promise<any> => {
  const baseURL = env.MEMPOOL_API_URL;

  console.log("hex", hex);
  const result = await fetch(`${baseURL}/tx`, {
    method: "POST",
    headers: {
      "Content-Type": "text/plain",
    },
    body: hex,
  });

  const res = await result.text();
  console.log("res", res);

  return res;
};
