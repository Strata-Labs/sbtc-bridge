import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;

    const btcAddress = searchParams.get("btcAddress");
    const txId = searchParams.get("txId");
    // ensure that the btcAddress is not empty
    if (!btcAddress || txId) {
      throw new Error("btcAddress is required");
    }

    const response = await fetch(
      "https://beta.sbtc-mempool.tech/api/bitcoind",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          rpcMethod: "scantxoutset",
          params: ["start", [{ desc: `addr(${btcAddress})`, range: 10000 }]],
        }),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch transaction details");
    }

    const responseData = await response.json();
    return NextResponse.json(responseData, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
