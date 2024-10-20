import { NextRequest, NextResponse } from "next/server";

interface CreateDepositRequestBody {
  bitcoin_txid: string;
  bitcoin_tx_output_index: number;
  reclaim_script: string;
  deposit_script: string;
}

const RUST_SERVER_URL = "http://localhost:3031/deposit"; // Change this to the actual Rust server URL

export async function POST(req: NextRequest) {
  try {
    const body: CreateDepositRequestBody = await req.json();

    // Forward the request to the Rust server
    const response = await fetch(RUST_SERVER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    // If Rust server responds with an error status
    if (!response.ok) {
      const errorResponse = await response.json();
      return NextResponse.json(
        { error: errorResponse },
        { status: response.status }
      );
    }

    // Return the success response from Rust server
    const responseData = await response.json();
    return NextResponse.json(responseData, { status: 201 });
  } catch (error) {
    console.error("Error forwarding request to Rust server:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
