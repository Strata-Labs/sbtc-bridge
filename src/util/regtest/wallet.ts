import bitcoin, { networks, payments, initEccLib } from "bitcoinjs-lib";
import { HDKey } from "@scure/bip32";
import { sha256 } from "@noble/hashes/sha256";
import * as crypto from "crypto";
import bs58check from "bs58check";
import ecc from "@bitcoinerlab/secp256k1";

initEccLib(ecc);

// so basically i need to be able to manage the wallets of the users from a point the seed?
// but what i don't follow is how am i going to manage creating multi addresses

// okay so yeah we do know and we'll have to find a way to be able to track and know what is snet where

const createWallet = (seed: string) => {
  // when we create/manage

  const seedBuffer = Buffer.from(seed);

  // convert string seed to buffer
  const sha256Hash = crypto.createHash("sha256").update(seedBuffer).digest();

  // create HD wallet from seed buffer
  const root = HDKey.fromMasterSeed(sha256Hash);

  return root;
};

const getAddressInfo = (masterWallet: HDKey, path: string) => {};

export const getP2pkh = (seed: string) => {
  const root = createWallet(seed);
  //console.log("root", root);

  const path = "m/44/1/0/0/1";
  const derived = root.derive(path);
  if (!derived.publicKey) throw new Error("no private key");

  const buffer = Buffer.from(derived.publicKey);

  const p2pkh = payments.p2pkh({
    pubkey: buffer,
    network: networks.regtest,
  });

  //console.log("p2pkh", p2pkh);
  return p2pkh.address;
};

const TAPR00T_DERIVE_PATH = "m/86'/0'/0'/0/0";

// Helper function to convert full public key to X-only public key
function toXOnly(pubkey: Uint8Array) {
  return pubkey.slice(1, 33);
}

export const getP2TR = (seed: string) => {
  const root = createWallet(seed);

  if (root === null) {
    throw new Error("Failed to create wallet");
  }

  const derived = root.derive(TAPR00T_DERIVE_PATH);
  // Generate the public key
  const p2trRes = payments.p2tr({
    internalPubkey: toXOnly(root.publicKey || ([] as any)), // Taproot needs X-only pubkey
    network: networks.regtest,
  });

  return p2trRes;
};

// NUMS X-coordinate (32 bytes)
const NUMS_X_COORDINATE = Buffer.from([
  0x50, 0x92, 0x9b, 0x74, 0xc1, 0xa0, 0x49, 0x54, 0xb7, 0x8b, 0x4b, 0x60, 0x35,
  0xe9, 0x7a, 0x5e, 0x07, 0x8a, 0x5a, 0x0f, 0x28, 0xec, 0x96, 0xd5, 0x47, 0xbf,
  0xee, 0x9a, 0xce, 0x80, 0x3a, 0xc0,
]);

// Create an XOnlyPublicKey from NUMS_X_COORDINATE
export function createUnspendableTaprootKey() {
  try {
    if (ecc.isPrivate(NUMS_X_COORDINATE)) {
      const xOnlyPubKey = ecc.xOnlyPointFromScalar(NUMS_X_COORDINATE);
      return xOnlyPubKey;
    } else {
      throw new Error("NUMS_X_COORDINATE is not a valid private key");
    }
  } catch (err: any) {
    throw new Error("Failed to create unspendable Taproot key: " + err.message);
  }
}

export const getP2WSH = (seed: string) => {
  const root = createWallet(seed);

  const path = TAPR00T_DERIVE_PATH;
  const derived = root.derive(path);
  if (!derived.publicKey) throw new Error("no private key");

  const buffer = Buffer.from(derived.publicKey);

  const p2pkh = payments.p2pkh({
    pubkey: buffer,
    network: networks.regtest,
  });

  const p2wpkh = payments.p2wpkh({
    pubkey: buffer,
    network: networks.regtest,
  });

  const p2wsh = payments.p2wsh({
    redeem: p2wpkh,
    network: networks.regtest,
  });

  return p2wpkh;
};

export function uint8ArrayToHexString(uint8Array: Uint8Array): string {
  return Array.from(uint8Array)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export function hexToUint8Array(hexString: string): Uint8Array {
  // Remove any leading "0x" from the hex string if it exists
  if (hexString.startsWith("0x")) {
    hexString = hexString.slice(2);
  }

  // Check if hexString has an even length, pad with '0' if not
  if (hexString.length % 2 !== 0) {
    hexString = "0" + hexString;
  }

  const bytes = new Uint8Array(hexString.length / 2);
  for (let i = 0; i < hexString.length; i += 2) {
    bytes[i / 2] = parseInt(hexString.substr(i, 2), 16);
  }
  return bytes;
}

export const getPrivateKeysFromSeed = (seed: string) => {
  const root = createWallet(seed);

  const path = TAPR00T_DERIVE_PATH;
  const derived = root.derive(path);
  if (!derived.privateKey) throw new Error("no private key");

  return uint8ArrayToHexString(derived.privateKey);
};

export const getPrivateKeyFromP2tr = (seed: string) => {
  const root = createWallet(seed);

  const path = TAPR00T_DERIVE_PATH;
  const derived = root.derive(path);
  if (!derived.privateKey) throw new Error("no private key");

  return uint8ArrayToHexString(derived.privateKey);
};

export type BitcoinNetwork = "mainnet" | "testnet" | "regtest";

export function privateKeyToWIF(
  privateKeyHex: string,
  network: BitcoinNetwork
): string {
  // Use 0x80 for mainnet, 0xef for testnet and regtest
  const versionByte = network === "mainnet" ? 0x80 : 0xef; // 0xEF for both testnet and regtest

  // Convert the private key hex to a Uint8Array
  const privateKeyWithVersion = new Uint8Array(1 + privateKeyHex.length / 2);
  privateKeyWithVersion[0] = versionByte;

  // Set the private key bytes
  privateKeyWithVersion.set(Buffer.from(privateKeyHex, "hex"), 1);

  // If you're using compressed keys, add the compression flag (0x01)
  const compressed = true;
  const extendedKey = compressed
    ? Buffer.concat([privateKeyWithVersion, Buffer.from([0x01])])
    : privateKeyWithVersion;

  // Encode with Base58Check (which adds the checksum)
  return bs58check.encode(extendedKey);
}
