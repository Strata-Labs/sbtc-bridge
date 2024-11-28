"use server";
import { env } from "@/env";
import { NextRequest, NextResponse } from "next/server";

const BITCOIND_URL = env.BITCOIND_URL;
// Import your Bitcoin RPC logic

const BASE_PROXY_URL = env.MEMPOOL_API_URL;

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

const rpcUser = env.BITCOIN_RPC_USER_NAME;
const rpcPassword = env.BITCOIN_RPC_PASSWORD;

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
    // good for debugging
    // eslint-disable-next-line no-console
    console.error(`rpcHandlerCore ${method} error:`, err);
    throw new Error(err instanceof Error ? err.message : String(err));
  }
};

export async function POST(req: NextRequest) {
  try {
    // Read the raw body from the request
    const body = req.body ? await req.text() : undefined;

    // Convert headers to a format compatible with `fetch`
    const headers: Record<string, string> = {};
    req.headers.forEach((value, key) => {
      headers[key] = value;
    });

    const res = await rpcHandlerCore(
      RpcMethods.sendRawTransaction,
      [body],
      BITCOIND_URL,
    );

    return NextResponse.json(res);
  } catch (error) {
    // good for debugging
    // eslint-disable-next-line no-console
    console.error("Error in POST handler:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const path = url.pathname.replace("/api/proxy/", ""); // Get the dynamic part of the route

    // if path ends with "/utxo" then we are looking for the utxo of an address

    if (path.endsWith("/utxo")) {
      // Special route for `/transaction/utxo`

      // get teh second to last part of the url

      // get the second to last part of the url
      const address = path.split("/")[1];
      if (!address) {
        return NextResponse.json({ error: "Invalid address" }, { status: 400 });
      }
      const args = ["start", [{ desc: `addr(${address})`, range: 10000 }]];

      const result = await rpcHandlerCore(
        RpcMethods.scantxoutset,
        args,
        BITCOIND_URL,
      );

      const utxos = result.unspents.map((utxo: any) => ({
        txid: utxo.txid,
        vout: utxo.vout,
        status: {
          confirmed: true,
          block_height: result.height, // Use the height from the main RPC result
          block_hash: result.bestblock, // Use the bestblock from the RPC result
          block_time: Math.floor(Date.now() / 1000), // You can replace this with an actual block time if available
        },
        value: Math.round(utxo.amount * 1e8), // Convert BTC amount to satoshis
      }));
      return NextResponse.json(utxos);
    }

    // Proxy all other routes to the base proxy URL
    const proxyUrl = `${BASE_PROXY_URL}${path}`;

    const response = await fetch(proxyUrl, {
      method: req.method,
      headers: req.headers, // Pass along incoming headers
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    // good for debugging
    // eslint-disable-next-line no-console
    console.error("Error in GET handler:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
