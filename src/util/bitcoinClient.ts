"use client";

type RpcResponse = {
  result: any;
};

// Generic function to make API requests to your Bitcoin RPC API route
const rpcRequest = async (
  rpcMethod: string,
  params: any[] = [],
): Promise<any> => {
  const response = await fetch("/api/bitcoind", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      rpcMethod,
      params,
    }),
  });

  const data: RpcResponse = await response.json();
  return data.result;
};

// Function to scan the UTXO set for an address
export const scanTxOutSet = async (address: string): Promise<any> => {
  return await rpcRequest("scantxoutset", [
    "start",
    [{ desc: `addr(${address})`, range: 10000 }],
  ]);
};

// Function to get a raw transaction
export const getRawTransaction = async (txid: string): Promise<any> => {
  return await rpcRequest("getrawtransaction", [txid, true]);
};
