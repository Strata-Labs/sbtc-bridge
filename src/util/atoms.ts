"use client";

import { atom, createStore } from "jotai";
import { UserData } from "@stacks/connect";
import { NotificationEventType } from "@/comps/Notifications";
import getSbtcBridgeConfig from "@/actions/get-sbtc-bridge-config";

export const store = createStore();

export type BridgeConfig = Awaited<ReturnType<typeof getSbtcBridgeConfig>>;

export const bridgeConfigAtom = atom<BridgeConfig>({
  EMILY_URL: undefined,
  WALLET_NETWORK: undefined,
  SBTC_CONTRACT_DEPLOYER: undefined,
  SIGNER_AGGREGATE_KEY: undefined,
});
export const depositMaxFeeAtom = atom(80000);

export enum ENV {
  MAINNET = "MAINNET",
  TESTNET = "TESTNET",
  DEVENV = "DEVENV",
}

export const envAtom = atom(ENV.TESTNET);

export const isConnectedAtom = atom<boolean>(false);

export const showConnectWalletAtom = atom<boolean>(false);

export const userDataAtom = atom<UserData | null>(null);

export const walletAddressAtom = atom<string | null>(null);

export const eventsAtom = atom<NotificationEventType[]>([]);
