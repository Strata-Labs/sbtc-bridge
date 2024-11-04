import * as bitcoin from "bitcoinjs-lib";
import { ECPairFactory, ECPairAPI, TinySecp256k1Interface } from "ecpair";

import { listUnspent, scanTxOutSet } from "../bitcoinClient";
import {
  BitcoinNetwork,
  createUnspendableTaprootKey,
  getP2pkh,
  getP2TR,
  getPrivateKeyFromP2tr,
  hexToUint8Array,
  privateKeyToWIF,
  uint8ArrayToHexString,
} from "./wallet";
import { Taptree } from "bitcoinjs-lib/src/types";

import * as bip341 from "bitcoinjs-lib/src/payments/bip341";

import { tapTreeToList } from "bitcoinjs-lib/src/psbt/bip371";

// You need to provide the ECC library. The ECC library must implement
// all the methods of the `TinySecp256k1Interface` interface.
import ecc from "@bitcoinerlab/secp256k1";
const ECPair: ECPairAPI = ECPairFactory(ecc);
//depositRequest.ts;

// Helper function to convert a little-endian 8-byte number to big-endian
const flipEndian = (buffer: Uint8Array): Uint8Array => {
  const flipped = new Uint8Array(buffer.length);
  for (let i = 0; i < buffer.length; i++) {
    flipped[i] = buffer[buffer.length - 1 - i];
  }
  return flipped;
};

export const createDepositScript = (
  signersPubKey: Uint8Array, // Use Uint8Array instead of Buffer
  maxFee: number,
  recipientBytes: Uint8Array // Use Uint8Array instead of Buffer
) => {
  const opDropData = recipientBytes; // Ensure recipientBytes is a Uint8Array

  // maxFee should be BE its in LE rn

  // Convert maxFee to LE buffer (as an 8-byte buffer)
  const LEmaxFee = Buffer.alloc(8);
  LEmaxFee.writeUInt32LE(maxFee, 0); // We use UInt32LE for writing the fee

  // Convert the little-endian maxFee to big-endian
  const BEmaxFee = flipEndian(LEmaxFee);

  console.log("opDropData", opDropData);

  // concat bemaxfee and opdropdata
  const opDropDataTogether = new Uint8Array(
    BEmaxFee.length + opDropData.length
  );
  console.log("BEmaxFee", BEmaxFee);
  opDropDataTogether.set(BEmaxFee);
  console.log("opDropData", opDropData);
  opDropDataTogether.set(opDropData, BEmaxFee.length);

  console.log("signersPubKey", signersPubKey);

  console.log("opDropDataTogether", opDropDataTogether);

  const ting = bitcoin.script.compile([
    opDropDataTogether,
    bitcoin.opcodes.OP_DROP, // OP_DROP
    //bitcoin.script.number.encode(signersPubKey.length), // Push the signer public key length
    signersPubKey, // Push the signer's public key
    bitcoin.opcodes.OP_CHECKSIG, // OP_CHECKSIG
  ]);

  console.log("ting", ting);
  const hexOfTing = uint8ArrayToHexString(ting);
  console.log("hexOfTing", hexOfTing);
  return ting;
};
//the max fee is 8 bytes, big endian

export const createReclaimScript = (
  lockTime: number,
  additionalScriptBytes: Uint8Array // Use Uint8Array for additional script data
): Uint8Array => {
  const { script, opcodes } = bitcoin;

  // Encode lockTime using bitcoin.script.number.encode (ensure minimal encoding)
  const lockTimeEncoded = script.number.encode(lockTime);

  // Combine the script elements into a single Uint8Array
  const lockTimeArray = new Uint8Array(lockTimeEncoded); // Convert Buffer to Uint8Array
  const opCheckSequenceVerify = new Uint8Array([
    opcodes.OP_CHECKSEQUENCEVERIFY,
  ]);

  // Calculate total length of the final Uint8Array
  const totalLength =
    lockTimeArray.length +
    opCheckSequenceVerify.length +
    additionalScriptBytes.length;

  // Create the combined Uint8Array to hold the script
  const reclaimScript = new Uint8Array(totalLength);

  // Set each part of the script
  reclaimScript.set(lockTimeArray, 0); // Set lock time
  reclaimScript.set(opCheckSequenceVerify, lockTimeArray.length); // Set OP_CHECKSEQUENCEVERIFY
  reclaimScript.set(
    additionalScriptBytes,
    lockTimeArray.length + opCheckSequenceVerify.length
  ); // Append additional script

  // Return the combined Uint8Array
  const buildScript = script.compile([
    lockTimeArray,
    opcodes.OP_CHECKSEQUENCEVERIFY,
  ]);
  return buildScript;
};

type DepositRequest = {
  senderPrivKeyWIF: string;
  receiverAddress: string;
  amount: number;
  signersPublicKey: Uint8Array;
  maxFee: number;
  lockTime: number;
  senderAddress: string;
};

// convert uint8array to buffer
const uint8ArrayToBuffer = (uint8Array: Uint8Array) => {
  return Buffer.from(uint8Array);
};

function toXOnly(pubkey: Buffer): Buffer {
  return pubkey.subarray(1, 33);
}

export const createDepositScriptP2TROutput = async (
  senderPrivKeyWIF: string,
  senderAddress: string,
  stxDepositAddress: Uint8Array,
  amount: number,
  signersPublicKey: string,
  maxFee: number,
  lockTime: number
) => {
  try {
    // const internalPubkey = hexToUint8Array(
    //   "50929b74c1a04954b78b4b6035e97a5e078a5a0f28ec96d547bfee9ace803ac0"
    // );

    /* 
      couple steps that make this up - going try to detail in chapters sort of language 
      1. create the reclaim script
      2. create the deposit script
      3. hash the leaf scripts using toHashTree
      4. create an internal public key (tapTweakHash)
      5. create the taprootPubKey 
      6. create the pt2r payment object
      7 basic validation for the payment object
      8. fetch UTXOs for the sender address
      9. add UTXOs as inputs based on the amount being sent
      10. add output for the deposit
      11. calculate a change output if needed
      12. sign and finalize the inputs
      13. extract the raw transaction

    */
    const internalPubkey = hexToUint8Array(signersPublicKey);

    console.log("bip341,again ", bip341);
    const network = bitcoin.networks.regtest;

    // Create the reclaim script and convert to Buffer
    const reclaimScript = Buffer.from(
      createReclaimScript(lockTime, new Uint8Array([]))
    );

    const reclaimScriptHex = uint8ArrayToHexString(reclaimScript);
    console.log("reclaimScriptHex", reclaimScriptHex);

    // Create the deposit script and convert to Buffer
    console.log("stxDepositAddress", stxDepositAddress);
    const recipientBytes = stxDepositAddress;
    const depositScript = Buffer.from(
      createDepositScript(internalPubkey, maxFee, recipientBytes)
    );
    // convert buffer to hex
    const depositScriptHexPreHash = uint8ArrayToHexString(depositScript);
    console.log("depositScriptHexPreHash", depositScriptHexPreHash);
    console.log("depositScript", depositScript);

    // // Hash the leaf scripts using tapLeafHash
    const depositScriptHash = bip341.tapleafHash({ output: depositScript });
    console.log("depositScriptHash", depositScriptHash);
    const depositScriptHashHex = uint8ArrayToHexString(depositScriptHash);
    console.log("depositScriptHashHex", depositScriptHashHex);

    const reclaimScriptHash = bip341.tapleafHash({ output: reclaimScript });
    console.log("reclaimScriptHash", reclaimScriptHash);
    const reclaimScriptHashHex = uint8ArrayToHexString(reclaimScriptHash);
    console.log("reclaimScriptHashHex", reclaimScriptHashHex);
    // Combine the leaf hashes into a Merkle root using tapBranch
    const merkleRoot = bip341.toHashTree([
      { output: depositScript },
      { output: reclaimScript },
    ]);

    const scriptTree: Taptree = [
      {
        output: depositScript,
      },
      {
        output: reclaimScript,
      },
    ];

    console.log("merkleRoot", merkleRoot);

    const merkleRootHex = uint8ArrayToHexString(merkleRoot.hash);
    console.log("merkleRootHex", merkleRootHex);
    // Create an internal public key (replace with actual internal public key if available)

    console.log("internalPubkey", internalPubkey);
    // Create the final taproot public key by tweaking internalPubkey with merkleRoot

    console.log("merkleRoot.hash", merkleRoot.hash);
    // Step 1: Generate the tweak
    const tweak = bip341.tapTweakHash(internalPubkey, merkleRoot.hash);
    console.log("tweak", tweak);
    const tweakHex = uint8ArrayToHexString(tweak);
    console.log("tweakHex", tweakHex);
    // Step 2: Apply the tweak to the internal public key to get the tweaked Taproot output key
    const taprootPubKey = bip341.tweakKey(internalPubkey, tweak);
    console.log("taprootPubKey", taprootPubKey);

    if (taprootPubKey === null) {
      throw new Error("Failed to tweak the internal public key.");
    }
    const taprootPubKeyHex = uint8ArrayToHexString(taprootPubKey.x);

    console.log("taprootPubKeyHex", taprootPubKeyHex);

    // Step 1: Convert the Taproot public key to a P2TR address
    const p2tr: any = bitcoin.payments.p2tr({
      internalPubkey: internalPubkey, // The tweaked Taproot public key
      network: bitcoin.networks.regtest, // Use the correct network (mainnet or testnet)
      scriptTree: scriptTree,
    });

    // key: toXOnly(keypair.publicKey),
    // Validate the output script is correct (P2TR has a specific witness program structure)
    const outputScript = p2tr.output;
    if (outputScript) {
      const isValid = outputScript.length === 34 && outputScript[0] === 0x51; // P2TR is version 1 witness program
      console.log("P2TR Output Script:", outputScript.toString("hex"));
      console.log("Is valid P2TR output:", isValid);
    } else {
      console.error("Failed to generate P2TR output.");
    }

    console.log("p2tr 0x01", p2tr.address);

    // Fetch UTXOs for the sender address
    const utxos: any = [];
    const utxosRes = await scanTxOutSet(senderAddress);

    if (utxosRes) {
      utxosRes.unspents.forEach((utxo: any) => {
        utxos.push({
          txid: utxo.txid,
          vout: utxo.vout,
          amount: BigInt(Math.round(utxo.amount * 100000000)),
          scriptPubKey: utxo.scriptPubKey,
        });
      });
    }

    const psbt = new bitcoin.Psbt({ network });

    // Add UTXOs as inputs
    let totalInput = BigInt(0);
    for (const utxo of utxos) {
      const script = Buffer.from(hexToUint8Array(utxo.scriptPubKey));
      psbt.addInput({
        hash: utxo.txid,
        index: utxo.vout,
        witnessUtxo: {
          script,
          value: BigInt(utxo.amount),
        },
      });
      totalInput += BigInt(utxo.amount);
      if (totalInput >= BigInt(amount) + BigInt(maxFee)) break;
    }

    if (p2tr === undefined && p2tr.address === undefined) {
      throw new Error("Output is undefined");
    }

    console.log("we made it here p2tr", p2tr);

    // Add output for the deposit
    psbt.addOutput({
      value: BigInt(amount),
      address: p2tr.address, // Use the P2TR output script
    });

    // Calculate change and add change output if necessary
    const change = BigInt(totalInput) - BigInt(amount) - BigInt(maxFee);

    console.log("change", change);
    if (change > 0) {
      psbt.addOutput({
        address: senderAddress,
        value: BigInt(change),
      });
    }

    console.log("psbt", psbt);

    const keyPair = ECPair.fromWIF(senderPrivKeyWIF, network);

    // Sign the transaction with the sender's private key
    psbt.signAllInputs(keyPair);

    console.log("post psbt sign");

    // Finalize all inputs
    psbt.finalizeAllInputs();

    // Extract the raw transaction
    const _rawTx = psbt.extractTransaction();

    console.log("rawTx", _rawTx);
    const rawTx = _rawTx.toHex();

    return rawTx;
  } catch (err: any) {
    console.error("createDepositScriptP2TROutput error", err);
    throw new Error(err);
  }
};

/*
1e00000000000003e8051aaf3f91f38aa21ade7e9f95efdbc4201eeb4cf0f87520e89877c40fd5b1ef12c3389f6921cb2c00d4fede6564c01ca759d413aab0b312ac


1e00000000000003e8051aaf3f91f38aa21ade7e9f95efdbc4201eeb4cf0f875201e2cd43aa1993fa0c794bdb6d46bf020b8ac8e94b4ba8ef0afdf4bc7e7c69a18ac

*/
