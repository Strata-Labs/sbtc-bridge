import { NextRequest, NextResponse } from "next/server";

interface CreateDepositRequestBody {
  bitcoinTxid: string;
  bitcoinTxOutputIndex: number;
  reclaimScript: string;
  depositScript: string;
  url: string;
}

export async function POST(req: NextRequest) {
  try {
    const body: CreateDepositRequestBody = await req.json();

    const paramsBody = {
      bitcoin_txid: body.bitcoinTxid,
      bitcoin_tx_output_index: body.bitcoinTxOutputIndex,
      reclaim_script: body.reclaimScript,
      deposit_script: body.depositScript,
    };
    // Forward the request to the Rust server
    const response = await fetch(`${body.url}/deposit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(paramsBody),
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
/* 
    const handleFetchFromEmily = async (txId: string, vout: number) => {
    try {
      // create a get request to emily to get the tx status

      const response = await fetch(`${emilyUrl}/deposit/${txId}/${vout}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
    } catch (err) {
      console.log("err", err);
      window.alert("Error fetching transaction details");
    }
  };
  should follow the above
*/

interface fetchFromEmilyRequestBody {
  bitcoinTxid: string;
  vout: number;
  url: string;
}
export async function GET(req: NextRequest) {
  try {
    const body: fetchFromEmilyRequestBody = await req.json();

    const url = `${body.url}/deposit/${body.bitcoinTxid}/${body.vout}`;
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
  } catch (error) {
    console.error("Error forwarding request to Rust server:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
