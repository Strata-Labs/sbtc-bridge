"use client";

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
  const result = await fetch(`/api/proxy/adddress/${address}/utxo`);
  return await result.json();
};

// Function to get a raw transaction
export const getRawTransaction = async (
  txid: string,
): Promise<BitcoinTransactionResponse> => {
  const result = await fetch(`/api/proxy/tx/${txid}`);
  return await result.json();
};
