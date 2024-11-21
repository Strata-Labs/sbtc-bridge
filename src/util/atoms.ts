"use client";

import { atom, createStore } from "jotai";
import { AppConfig, UserSession, UserData } from "@stacks/connect";
import { BITCOIND_URL } from "@/app/api/proxy/[...proxy]/route";

import { StacksNetwork, STACKS_TESTNET } from "@stacks/network";

export const store = createStore();

const undefinedStringCheck = (value: string) => {
  if (value === "undefined") {
    return true;
  }
  return false;
};

// atoms directory
/* 
  - Stacks Network (not cached)
  - Wallet Address (not cached)
  - BridgeSeedPhrase (cached)
  - BridgeAddress (cached)
  - BitcoinDaemonUrl (cached)
  - SignerPubKey (cached)
  - EmilyUrl (cached)
  - DepositMaxFee (cached)
  - ENV
  - showConnectWallet
  - userData 
  - 
*/

const CoreBridgeSeedPhrase = atom<string>("DEPOSIT");
const bridgeSeedPhraseStoreKey = "bridgeSeedPhrase";

export const bridgeSeedPhraseAtom = atom(
  (get) => get(CoreBridgeSeedPhrase),
  (_get, set, update: string) => {
    localStorage.setItem(bridgeSeedPhraseStoreKey, update);
    set(CoreBridgeSeedPhrase, update);
  }
);

bridgeSeedPhraseAtom.onMount = (setAtom) => {
  const bridgeSeedPhrase = localStorage.getItem(bridgeSeedPhraseStoreKey);
  if (bridgeSeedPhrase) {
    if (!undefinedStringCheck(bridgeSeedPhrase)) setAtom(bridgeSeedPhrase);
  }
};

const CoreBridgeAddress = atom<string>("");
const bridgeAddressStoreKey = "bridgeSendersAddress";

export const bridgeAddressAtom = atom(
  (get) => get(CoreBridgeAddress),
  (_get, set, update: string) => {
    localStorage.setItem(bridgeAddressStoreKey, update);
    set(CoreBridgeAddress, update);
  }
);

bridgeAddressAtom.onMount = (setAtom) => {
  const bridgeAddress = localStorage.getItem(bridgeAddressStoreKey);
  if (bridgeAddress) {
    if (!undefinedStringCheck(bridgeAddress)) setAtom(bridgeAddress);
  }
};

export const DEFAULT_BITCOIN_D_URL = BITCOIND_URL;

const CoreBitcoinDaemonUrl = atom<string>(DEFAULT_BITCOIN_D_URL);
const bitcoinDaemonUrlStoreKey = "bitcoinDaemonUrl";

export const bitcoinDaemonUrlAtom = atom(
  (get) => get(CoreBitcoinDaemonUrl),
  (_get, set, update: string) => {
    set(CoreBitcoinDaemonUrl, update);
  }
);

bitcoinDaemonUrlAtom.onMount = (setAtom) => {
  const bitcoinDaemonUrl = localStorage.getItem(bitcoinDaemonUrlStoreKey);
  if (bitcoinDaemonUrl && bitcoinDaemonUrl !== BITCOIND_URL) {
    if (!undefinedStringCheck(bitcoinDaemonUrl)) setAtom(bitcoinDaemonUrl);
  }
};

const CoreSignerPubKey = atom<string>(
  "50929b74c1a04954b78b4b6035e97a5e078a5a0f28ec96d547bfee9ace803ac0"
);
const signerPubKeyStoreKey = "signerPubKey";

export const signerPubKeyAtom = atom(
  (get) => get(CoreSignerPubKey),
  (_get, set, update: string) => {
    localStorage.setItem(bridgeAddressStoreKey, update);
    set(CoreSignerPubKey, update);
  }
);

signerPubKeyAtom.onMount = (setAtom) => {
  const signerPubKey = localStorage.getItem(signerPubKeyStoreKey);
  if (signerPubKey) {
    if (!undefinedStringCheck(signerPubKey)) setAtom(signerPubKey);
  }
};

const CoreEmilyUrl = atom<string>(
  process.env.NEXT_PUBLIC_EMILY_URL || "http://localhost:3031"
);
const emilyUrlStoreKey = "emilyUrl";

export const emilyUrlAtom = atom(
  (get) => get(CoreEmilyUrl),
  (_get, set, update: string) => {
    localStorage.setItem(emilyUrlStoreKey, update);
    set(CoreEmilyUrl, update);
  }
);

emilyUrlAtom.onMount = (setAtom) => {
  const emilyUrl = localStorage.getItem(emilyUrlStoreKey);

  if (emilyUrl && emilyUrl === process.env.EMILY_URL) {
    if (!undefinedStringCheck(emilyUrl)) setAtom(emilyUrl);
  }
};

const CoreDepositMaxFee = atom<number>(80000);
const depositMaxFeeStoreKey = "depositMaxFee";

export const depositMaxFeeAtom = atom(
  (get) => get(CoreDepositMaxFee),
  (_get, set, update: number) => {
    localStorage.setItem(depositMaxFeeStoreKey, update.toString());
    set(CoreDepositMaxFee, update);
  }
);

depositMaxFeeAtom.onMount = (setAtom) => {
  const depositMaxFee = localStorage.getItem(depositMaxFeeStoreKey);
  if (depositMaxFee) {
    if (!undefinedStringCheck(depositMaxFee)) setAtom(parseInt(depositMaxFee));
  }
};

enum ENV {
  MAINNET = "MAINNET",
  TESTNET = "TESTNET",
  DEVENV = "DEVENV",
}

const CoreENV = atom<ENV>(ENV.DEVENV);

export const envAtom = atom(
  (get) => get(CoreENV),
  (_get, set, update: ENV) => {
    set(CoreENV, update);
  }
);

export const isConnectedAtom = atom<boolean>(false);

export const showConnectWalletAtom = atom<boolean>(false);

export const userDataAtom = atom<UserData | null>(null);

export const walletAddressAtom = atom<string | null>(null);

export const stacksNetworkAtom = atom<StacksNetwork>(STACKS_TESTNET);

export enum STACKS_ENV {
  MAINNET = "MAINNET",
  TESTNET = "TESTNET",
}
export const stacksEnvAtom = atom<STACKS_ENV>(STACKS_ENV.TESTNET);
