"use client";

import packageJson from '../../../package.json';

export default function Health() {
  const version = packageJson.version;
  const contracts_deployer = process.env.NEXT_PUBLIC_CONTRACTS_DEPLOYER;

  const result = {
    version: version,
    contracts_deployer: contracts_deployer
  };

  return JSON.stringify(result, null, 2);
};
