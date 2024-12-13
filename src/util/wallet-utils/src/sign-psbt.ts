import { request } from "sats-connect";
import { DefaultNetworkConfigurations } from "@leather.io/models";
import { hexToBytes, bytesToHex } from "@stacks/common";

type SignPSBTParams = {
  hex: string;
  network?: DefaultNetworkConfigurations;
  address: string;
};
export async function signPSBTLeather({ hex, network }: SignPSBTParams) {
  const response = await window.LeatherProvider?.request("signPsbt", {
    network,
    hex,
    broadcast: false,
  });
  if (!response) {
    throw new Error(`Error signing PSBT`);
  }
  return response.result.hex;
}

export async function signPSBTXverse({ hex, address }: SignPSBTParams) {
  const bytes = hexToBytes(hex);
  const base64 = btoa(String.fromCharCode(...bytes));

  const response = await request("signPsbt", {
    psbt: base64,
    broadcast: false,
    signInputs: {
      [address]: [0],
    },
  });
  if (response.status === "error") {
    throw new Error(`Error signing PSBT`);
  }

  return bytesToHex(
    Uint8Array.from(atob(response.result.psbt), (c) => c.charCodeAt(0)),
  );
}
