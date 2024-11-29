import { AddressPurpose, request, RpcSuccessResponse } from "sats-connect";
import { DefaultNetworkConfigurations } from "@leather.io/models";

import { Address, BtcAddress } from "@leather.io/rpc";
import { getLeatherBTCProviderOrThrow } from "./util/btc-provider";

type Results = {
  /** @description payment address can be native segwit or segwit */
  payment: string;
  /** @description taproot address */
  taproot: string;
};

type getAddresses = (params?: {
  message?: string;
  network?: DefaultNetworkConfigurations;
}) => Promise<Results>;

const getAddressByPurpose = (
  response: RpcSuccessResponse<"wallet_connect">["result"],
  purpose: AddressPurpose,
) => response.addresses.find((item) => item.purpose === purpose)?.address;

export function getWalletAddresses(
  response: RpcSuccessResponse<"wallet_connect">["result"],
) {
  let taproot = getAddressByPurpose(response, AddressPurpose.Ordinals);
  if (!taproot) {
    throw new Error("Taproot address not found");
  }
  let payment = getAddressByPurpose(response, AddressPurpose.Payment);
  if (!payment) {
    throw new Error("Payment address not found");
  }
  return {
    taproot,
    payment,
  };
}

/**
 * @name getAddressXverse
 * @description Get the address for the user
 */
export const getAddressesXverse: getAddresses = async (params) => {
  const response = await request("wallet_connect", {
    message: params?.message,
  });

  if (response.status === "error") {
    throw new Error(response.error.message);
  }

  const result = response.result;
  return getWalletAddresses(result);
};

const extractAddressByType = (
  addresses: Address[],
  addressType: BtcAddress["type"],
) => {
  return addresses.find(
    (address) => address.symbol === "BTC" && address.type === addressType,
  )?.address;
};
/**
 * @name getAddressesLeather
 * @description Get addresses for leather wallet
 */
export const getAddressesLeather: getAddresses = async () => {
  const btc = getLeatherBTCProviderOrThrow();
  const response = await btc.request("getAddresses");

  const { addresses } = response.result;
  const payment = extractAddressByType(addresses, "p2wpkh")!;
  const taproot = extractAddressByType(addresses, "p2tr")!;

  return {
    payment,
    taproot,
  };
};
