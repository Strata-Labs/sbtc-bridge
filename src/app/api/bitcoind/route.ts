"use server";
import { env } from "@/env";
import { NextRequest, NextResponse } from "next/server";

//  supported prc methods
enum RpcMethods {
  generateToAddress = "generatetoaddress",
  getBlockChainInfo = "getblockchaininfo",
  listUnspent = "listunspent",
  createWallet = "createwallet",
  loadWallet = "loadwallet",
  getNewAddress = "getnewaddress",
  getAddressesByLabel = "getaddressesbylabel",
  listLabels = "listlabels",
  listWallets = "listwallets",
  getWalletInfo = "getwalletinfo",
  unloadWallet = "unloadwallet",
  createRawTransaction = "createrawtransaction",
  signRawTransactionWithWallet = "signrawtransactionwithwallet",
  sendRawTransaction = "sendrawtransaction",
  decodeRawTransaction = "decoderawtransaction",
  getTransaction = "gettransaction",
  dumpPrivKey = "dumpprivkey",
  listaddressgroupings = "listaddressgroupings",
  getAddressInfo = "getaddressinfo",
  getWalletDescriptor = "listdescriptors",
  importprivkey = "importprivkey",
  importaddress = "importaddress",
  scantxoutset = "scantxoutset",
  testMempoolAccept = "testmempoolaccept",
  getBlockHash = "getblockhash",
  getBlock = "getblock",
  getRawTransaction = "getrawtransaction",
}

type RpcRequestParams = any[];
type RpcRequest = {
  rpcMethod: RpcMethods;
  params: RpcRequestParams;
};

const rpcUser = env.BITCOIN_RPC_USER_NAME;
const rpcPassword = env.BITCOIN_RPC_PASSWORD;
const bitcoindURL = env.BITCOIND_URL;

const rpcHandlerCore = async (
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

export async function POST(req: NextRequest) {
  try {
    const { rpcMethod, params }: RpcRequest = await req.json();

    if (!rpcMethod || !Object.values(RpcMethods).includes(rpcMethod)) {
      return NextResponse.json(
        { error: "Invalid RPC method" },
        { status: 400 },
      );
    }

    const result = await rpcHandlerCore(rpcMethod, params, bitcoindURL);
    return NextResponse.json(
      { result },
      {
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": "*", // Adjust the origin as needed
        },
      },
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
