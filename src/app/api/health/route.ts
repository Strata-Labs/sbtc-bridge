"use server";

import { env } from "@/env";
import packageJson from "../../../../package.json";
import { NextRequest, NextResponse } from "next/server";

export async function GET(_: NextRequest) {
  return NextResponse.json(
    {
      result: {
        version: packageJson.version,
        contracts_deployer: env.SBTC_CONTRACT_DEPLOYER,
      },
    },
    { status: 200 },
  );
}
