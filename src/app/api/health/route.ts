import packageJson from "../../../../package.json";
import { NextRequest, NextResponse } from "next/server";

export async function GET(_: NextRequest) {
  const version = packageJson.version;
  const contracts_deployer = process.env.NEXT_PUBLIC_CONTRACTS_DEPLOYER;

  const result = {
    version: version,
    contracts_deployer: contracts_deployer,
  };

  return NextResponse.json({ result }, { status: 200 });
}
