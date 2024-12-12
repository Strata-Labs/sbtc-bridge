"use server";
import { env } from "@/env";
import { NextRequest, NextResponse } from "next/server";
import {
  getUtxosBitcoinDaemon,
  rpcHandlerCore,
  RpcMethods,
} from "./rpc-handler-core";

const { MEMPOOL_API_URL } = env;
// Import your Bitcoin RPC logic

export async function POST(req: NextRequest) {
  try {
    if (env.WALLET_NETWORK === "mainnet") {
      return NextResponse.json(
        { error: "Mainnet not supported" },
        { status: 400 },
      );
    }
    // Read the raw body from the request
    const body = req.body ? await req.text() : undefined;

    // Convert headers to a format compatible with `fetch`
    const headers: Record<string, string> = {};
    req.headers.forEach((value, key) => {
      headers[key] = value;
    });

    const res = await rpcHandlerCore(RpcMethods.sendRawTransaction, [body]);

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
    if (env.WALLET_NETWORK === "mainnet") {
      return NextResponse.json(
        { error: "Mainnet not supported" },
        { status: 400 },
      );
    }
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

      const utxos = await getUtxosBitcoinDaemon(address);
      return NextResponse.json(utxos);
    }

    // Proxy all other routes to the base proxy URL
    const proxyUrl = `${MEMPOOL_API_URL}/${path}`;
    const response = await fetch(proxyUrl, {
      method: req.method,
      headers: req.headers, // Pass along incoming headers
    });

    if (response.headers.get("content-type")?.includes("application/json")) {
      const data = await response.json();
      return NextResponse.json(data, { status: response.status });
    }

    if (response.ok) return response;

    return NextResponse.redirect(response.url);
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
