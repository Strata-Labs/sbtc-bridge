import { networks, payments, initEccLib } from "bitcoinjs-lib";
import { HDKey } from "@scure/bip32";
import { sha256 } from "@noble/hashes/sha256";
import * as crypto from "crypto";
import bs58check from "bs58check";
import * as ecc from "tiny-secp256k1";

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
export const getP2TR = (seed: string) => {
  const root = createWallet(seed);

  const path = TAPR00T_DERIVE_PATH;
  const derived = root.derive(path);
  if (!derived.publicKey) throw new Error("no private key");

  const buffer = Buffer.from(derived.publicKey);
  // Get the x-only public key (32 bytes)

  const pubkey = derived.publicKey.slice(1); // Remove the 1st byte from compressed public key to get x-only

  // Create P2TR (Taproot) address
  const p2tr = payments.p2tr({
    pubkey,
    network: networks.regtest, // Use networks.bitcoin for mainnet, networks.testnet for testnet
  });

  return p2tr;
};
export function uint8ArrayToHexString(uint8Array: Uint8Array): string {
  return Array.from(uint8Array)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

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
