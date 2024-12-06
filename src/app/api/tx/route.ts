import { Waiting_for_the_Sunrise } from "next/font/google";
import { env } from "@/env";
import { NextRequest, NextResponse } from "next/server";

//https://mempool.bitcoin.regtest.hiro.so/api/tx/add6c6aa331a134dbb82227ebae5dd527e6f6713bb8a6c9c98ec01195c44d83d

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const txId = searchParams.get("txId");

    const testNetUrl = "https://mempool.bitcoin.regtest.hiro.so/api/tx/";
    const mainnetUrl = "https://mempool.space/api/tx/";

    const apiUrl =
      env.WALLET_NETWORK === "sbtcTestnet" ? testNetUrl : mainnetUrl;

    // ensure that the btcAddress is not empty
    if (!txId) {
      throw new Error("btcAddress is required");
    }

    const url = `${apiUrl}${txId}`;

    console.log("url", url);

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
      { status: 500 },
    );
  }
}
