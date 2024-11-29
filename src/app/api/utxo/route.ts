import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;

    const btcAddress = searchParams.get("btcAddress");

    // ensure that the btcAddress is not empty
    if (!btcAddress) {
      throw new Error("btcAddress is required");
    }

    const url = `https://beta.sbtc-mempool.tech/api/proxy/address/${btcAddress}/utxo`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

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
