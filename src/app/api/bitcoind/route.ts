"use server";
import { env } from "@/env";
import { NextRequest, NextResponse } from "next/server";
import {
  rpcHandlerCore,
  RpcMethods,
  RpcRequestParams,
} from "./rpc-handler-core";

type RpcRequest = {
  rpcMethod: RpcMethods;
  params: RpcRequestParams;
};

const bitcoindURL = env.BITCOIND_URL;

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
