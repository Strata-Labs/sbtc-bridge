import * as bitcoin from "bitcoinjs-lib";
import * as bip32 from "bip32";
import { ECPairFactory, ECPairAPI, TinySecp256k1Interface } from "ecpair";
import * as crypto from "crypto";

import { sha256 } from "@noble/hashes/sha256";

import { listUnspent } from "./rpcCommands";
import {
  BitcoinNetwork,
  getP2pkh,
  getP2TR,
  getPrivateKeyFromP2tr,
  privateKeyToWIF,
  uint8ArrayToHexString,
} from "./wallet";

// You need to provide the ECC library. The ECC library must implement
// all the methods of the `TinySecp256k1Interface` interface.
const tinysecp: TinySecp256k1Interface = require("tiny-secp256k1");
const ECPair: ECPairAPI = ECPairFactory(tinysecp);
//depositRequest.ts;

const createDepositScript = (
  signersPubKey: Uint8Array, // Use Uint8Array instead of Buffer
  maxFee: number,
  recipientBytes: Uint8Array // Use Uint8Array instead of Buffer
) => {
  const opDropData = recipientBytes; // Ensure recipientBytes is a Uint8Array

  const ting = bitcoin.script.compile([
    76,
    opDropData.length, // Push the OP_DROP data length
    opDropData, // The drop data
    bitcoin.opcodes.OP_DROP, // OP_DROP
    bitcoin.script.number.encode(signersPubKey.length), // Push the signer public key length
    signersPubKey, // Push the signer's public key
    bitcoin.opcodes.OP_CHECKSIG, // OP_CHECKSIG
  ]);

  return ting;
};

const createReclaimScript = (
  lockTime: number,
  additionalScriptBytes: Uint8Array // Use Uint8Array instead of Buffer
): Uint8Array => {
  // Reclaim script: OP_PUSH lockTime OP_CHECKSEQUENCEVERIFY OP_DROP (optional)

  // Convert lockTime to an encoded number as Uint8Array
  const lockTimeEncoded = bitcoin.script.number.encode(lockTime);

  // Compile the initial script without concatenating yet
  const scriptElements = [
    ...lockTimeEncoded, // Spread the lock time Uint8Array into an array of numbers
    bitcoin.opcodes.OP_CHECKSEQUENCEVERIFY, // OP_CHECKSEQUENCEVERIFY
    bitcoin.opcodes.OP_DROP, // Optional OP_DROP
  ];

  // Concatenate everything into one Uint8Array
  const combinedScript = new Uint8Array(
    scriptElements.length + additionalScriptBytes.length
  );

  combinedScript.set(scriptElements, 0); // Set the initial script elements
  combinedScript.set(additionalScriptBytes, scriptElements.length); // Append the additional script bytes

  // Return the complete combined script
  return bitcoin.script.compile(combinedScript);
};

const createP2WSHScript = (script: Uint8Array, network: bitcoin.Network) => {
  console.log("wut");
  console.log(sha256.create().update(script).digest());

  console.log("wtf", sha256("test"));

  const witnessProgram = new Uint8Array(34);
  // Step 3: Set the first byte to 0x00 (version)
  witnessProgram[0] = 0x00;

  // Step 4: Set the second byte to 0x20 (length of the hash, which is 32 bytes)
  witnessProgram[1] = 0x20;

  const scriptHash = sha256.create().update(script).digest();

  witnessProgram.set(scriptHash, 2);

  // add
  const p2wsh = bitcoin.payments.p2wsh({
    redeem: { output: witnessProgram },
    network,
  }).output;
  console.log("p2wsh", p2wsh);

  return p2wsh;
};

export const createAndSignTaprootTransactionWithScripts = async (
  senderPrivKeyWIF: string,
  receiverAddress: string,
  amount: number,
  signersPublicKey: Uint8Array,
  maxFee: number,
  lockTime: number,
  senderAddress: string
): Promise<string> => {
  const network = bitcoin.networks.regtest;

  const keyPair = ECPair.fromWIF(senderPrivKeyWIF, network);

  // Fetch UTXOs for the sender address
  const utxos = await listUnspent({
    minconf: 0,
    maxconf: 9999999,
    addresses: [senderAddress],
  });

  console.log("utxos", utxos);
  const psbt = new bitcoin.Psbt({ network });

  // Add UTXOs as inputs
  let totalInput = 0;
  for (const utxo of utxos) {
    psbt.addInput({
      hash: utxo.txid,
      index: utxo.vout,
      witnessUtxo: {
        script: Buffer.from(utxo.scriptPubKey, "hex"),
        value: utxo.amount,
      },
    });
    totalInput += utxo.amount;
    if (totalInput >= amount + maxFee) break;
  }

  console.log("totalInput", totalInput);
  console.log("test here");
  console.log("inputs", psbt.data.inputs);
  // Create recipient bytes for the deposit script
  const recipientBytes = new TextEncoder().encode(receiverAddress);
  //  Buffer.from(receiverAddress, "utf8"); // Example encoding for recipient address bytes

  console.log("0x2");
  // Create the deposit script
  const depositScript = createDepositScript(
    signersPublicKey,
    maxFee,
    recipientBytes
  );

  console.log("depositScript", depositScript);
  console.log("0x3");

  console.log("0x4");

  // Hash the deposit script to create the P2WSH output
  const depositP2WSH = createP2WSHScript(depositScript, network);

  console.log("depositP2WSH", depositP2WSH);

  // Create the reclaim script (lock time + additional script bytes)
  const reclaimScript = createReclaimScript(lockTime, new Uint8Array([]));

  // Hash the reclaim script to create the P2WSH output
  const reclaimP2WSH = createP2WSHScript(reclaimScript, network);

  if (!depositP2WSH || !reclaimP2WSH) {
    throw new Error("Failed to create P2WSH output");
  }

  // Add the deposit output with the deposit script
  psbt.addOutput({
    script: depositP2WSH, // P2WSH output for the deposit script
    value: BigInt(amount),
  });

  console.log("0x5");

  // Add the reclaim output with the reclaim script
  psbt.addOutput({
    script: reclaimScript, // P2WSH output for the reclaim script
    value: BigInt(amount),
  });

  // Add change output back to sender if necessary
  const change = totalInput - amount - maxFee;
  if (change > 0) {
    psbt.addOutput({
      address: senderAddress, // Change goes back to the sender
      value: BigInt(change),
    });
  }

  console.log("psbt", psbt);
  // Sign the transaction using the sender's private key
  psbt.signAllInputs(keyPair);

  // Finalize all inputs
  psbt.finalizeAllInputs();

  // Extract the raw transaction
  const rawTx = psbt.extractTransaction().toHex();
  return rawTx;
};
