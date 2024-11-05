"use client";

import { atom, createStore } from "jotai";

export const store = createStore();

const undefinedStringCheck = (value: string) => {
  if (value === "undefined") {
    return true;
  }
  return false;
};

// atoms directory
/* 
  - BridgeSeedPhrase (cached)
  - BridgeAddress (cached)
  - BitcoinDaemonUrl (cached)
  - SignerPubKey (cached)
  - EmilyUrl (cached)
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

const DEFAULT_BITCOIN_D_URL = "http://bitcoin:18443";

const CoreBitcoinDaemonUrl = atom<string>(DEFAULT_BITCOIN_D_URL);
const bitcoinDaemonUrlStoreKey = "bitcoinDaemonUrl";

export const bitcoinDaemonUrlAtom = atom(
  (get) => get(CoreBitcoinDaemonUrl),
  (_get, set, update: string) => {
    localStorage.setItem(bitcoinDaemonUrlStoreKey, update);
    set(CoreBitcoinDaemonUrl, update);
  }
);

bitcoinDaemonUrlAtom.onMount = (setAtom) => {
  const bitcoinDaemonUrl = localStorage.getItem(bitcoinDaemonUrlStoreKey);
  if (bitcoinDaemonUrl) {
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

const CoreEmilyUrl = atom<string>("http://localhost:3031");
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
  if (emilyUrl) {
    if (!undefinedStringCheck(emilyUrl)) setAtom(emilyUrl);
  }
};
