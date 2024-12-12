import { request } from "sats-connect";
import { DefaultNetworkConfigurations } from "@leather.io/models";

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
  const response = await request("signPsbt", {
    psbt: hex,
    broadcast: false,
    signInputs: {
      [address]: [0],
    },
  });
  if (response.status === "error") {
    throw new Error(`Error signing PSBT`);
  }
  return response.result.psbt;
}
