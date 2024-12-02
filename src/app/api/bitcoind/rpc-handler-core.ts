import "server-only";
import { env } from "@/env";

const rpcUser = env.BITCOIN_RPC_USER_NAME;
const rpcPassword = env.BITCOIN_RPC_PASSWORD;
//  supported prc methods
export enum RpcMethods {
  sendRawTransaction = "sendrawtransaction",
  scantxoutset = "scantxoutset",
  getRawTransaction = "getrawtransaction",
}

export type RpcRequestParams = any[];
export const rpcHandlerCore = async (
  method: RpcMethods,
  params: RpcRequestParams,
  bitcoinDUrl: string,
): Promise<any> => {
  const headers = {
    "Content-Type": "application/json",
    Authorization:
      "Basic " + Buffer.from(`${rpcUser}:${rpcPassword}`).toString("base64"),
  };

  const body = JSON.stringify({
    jsonrpc: "1.0",
    id: `${method}-${Date.now()}`,
    method: method,
    params,
  });

  try {
    const response = await fetch(bitcoinDUrl, {
      method: "POST",
      headers: headers,
      body: body,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.result;
  } catch (err) {
    console.error(`rpcHandlerCore ${method} error:`, err);
    throw new Error(err instanceof Error ? err.message : String(err));
  }
};
