import * as bitcoin from "bitcoinjs-lib";
import { ECPairFactory, ECPairAPI } from "ecpair";

import { scanTxOutSet } from "@/actions/bitcoinClient";
import {
  bytesToHex as uint8ArrayToHexString,
  hexToBytes as hexToUint8Array,
} from "@stacks/common";

import { Taptree } from "bitcoinjs-lib/src/types";

import * as bip341 from "bitcoinjs-lib/src/payments/bip341";

import ecc from "@bitcoinerlab/secp256k1";
const ECPair: ECPairAPI = ECPairFactory(ecc);
bitcoin.initEccLib(ecc);

export const NUMS_X_COORDINATE = new Uint8Array([
  0x50, 0x92, 0x9b, 0x74, 0xc1, 0xa0, 0x49, 0x54, 0xb7, 0x8b, 0x4b, 0x60, 0x35,
  0xe9, 0x7a, 0x5e, 0x07, 0x8a, 0x5a, 0x0f, 0x28, 0xec, 0x96, 0xd5, 0x47, 0xbf,
  0xee, 0x9a, 0xce, 0x80, 0x3a, 0xc0,
]);

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
  signersPubKey: Uint8Array,
  maxFee: number,
  recipientBytes: Uint8Array,
) => {
  const opDropData = recipientBytes;

  // maxFee should be BE its in LE rn

  // Convert maxFee to LE buffer (as an 8-byte buffer)
  const LEmaxFee = Buffer.alloc(8);
  // We use UInt32LE for writing the fee
  LEmaxFee.writeUInt32LE(maxFee, 0);

  // Convert the little-endian maxFee to big-endian
  const BEmaxFee = flipEndian(LEmaxFee);

  // Concat maxfee and opdropdata
  const opDropDataTogether = new Uint8Array(
    BEmaxFee.length + opDropData.length,
  );
  opDropDataTogether.set(BEmaxFee);
  opDropDataTogether.set(opDropData, BEmaxFee.length);

  const ting = bitcoin.script.compile([
    opDropDataTogether,
    bitcoin.opcodes.OP_DROP,
    signersPubKey,
    bitcoin.opcodes.OP_CHECKSIG,
  ]);

  return ting;
};
//the max fee is 8 bytes, big endian

export const createReclaimScript = (
  lockTime: number,
  additionalScriptBytes: Uint8Array,
): Uint8Array => {
  const { script, opcodes } = bitcoin;

  // Encode lockTime using bitcoin.script.number.encode (ensure minimal encoding)
  const lockTimeEncoded = script.number.encode(lockTime);

  // Combine the script elements into a single Uint8Array
  const lockTimeArray = new Uint8Array(lockTimeEncoded);
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
  reclaimScript.set(lockTimeArray, 0);
  reclaimScript.set(opCheckSequenceVerify, lockTimeArray.length);
  reclaimScript.set(
    additionalScriptBytes,
    lockTimeArray.length + opCheckSequenceVerify.length,
  ); // Append additional script

  // Return the combined Uint8Array
  const buildScript = script.compile([
    lockTimeArray,
    opcodes.OP_CHECKSEQUENCEVERIFY,
  ]);
  return buildScript;
};

export const createDepositAddress = (
  stxAddress: Uint8Array,
  signerPubKey: string,
  maxFee: number,
  lockTime: number,
  network: bitcoin.networks.Network,
): string => {
  const internalPubkey = hexToUint8Array(signerPubKey);

  // Create the reclaim script and convert to Buffer
  const reclaimScript = Buffer.from(
    createReclaimScript(lockTime, new Uint8Array([])),
  );

  // Create the deposit script and convert to Buffer

  const recipientBytes = stxAddress;
  const depositScript = Buffer.from(
    createDepositScript(internalPubkey, maxFee, recipientBytes),
  );
  // convert buffer to hex

  //  Hash the leaf scripts using tapLeafHash

  const reclaimScriptHash = bip341.tapleafHash({ output: reclaimScript });
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

  const tweak = bip341.tapTweakHash(NUMS_X_COORDINATE, merkleRoot.hash);

  console.log("tweak", tweak);
  const tweakHex = uint8ArrayToHexString(tweak);
  console.log("tweakHex", tweakHex);
  // Step 2: Apply the tweak to the internal public key to get the tweaked Taproot output key

  const taprootPubKey = bip341.tweakKey(NUMS_X_COORDINATE, tweak);
  console.log("taprootPubKey", taprootPubKey);

  if (taprootPubKey === null) {
    throw new Error("Failed to tweak the internal public key.");
  }
  const taprootPubKeyHex = uint8ArrayToHexString(taprootPubKey.x);

  console.log("taprootPubKeyHex", taprootPubKeyHex);

  // Step 1: Convert the Taproot public key to a P2TR address
  const p2tr = bitcoin.payments.p2tr({
    internalPubkey: NUMS_X_COORDINATE, // The tweaked Taproot public key
    network: network,
    scriptTree: scriptTree,
  }) as bitcoin.Payment;

  // ensure

  // key: toXOnly(keypair.publicKey),
  // Validate the output script is correct (P2TR has a specific witness program structure)
  const outputScript = p2tr.output;
  if (outputScript) {
    const isValid = outputScript.length === 34 && outputScript[0] === 0x51; // P2TR is version 1 witness program
    if (!isValid) {
      throw new Error("P2TR output is invalid.");
    }
  } else {
    throw new Error("Failed to generate P2TR output.");
  }

  console.log("p2tr 0x01", p2tr.address);
  if (p2tr === undefined) {
    throw new Error("Output is undefined");
  }

  if (p2tr?.address === undefined) {
    console.log("Address is undefined");
  }

  if ("address" in p2tr && typeof p2tr.address === "string") {
    console.log("Address exists:", p2tr.address);
    return p2tr.address;
  } else {
    throw new Error("Could not create address");
  }
};

export const createDepositScriptP2TROutput = async (
  senderPrivKeyWIF: string,
  senderAddress: string,
  stxDepositAddress: Uint8Array,
  amount: number,
  signersPublicKey: string,
  maxFee: number,
  lockTime: number,
  network: bitcoin.networks.Network,
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

    const p2trAddress = createDepositAddress(
      stxDepositAddress,
      signersPublicKey,
      maxFee,
      lockTime,
      network,
    );

    // Fetch UTXOs for the sender address
    const utxos: any = [];
    const utxosRes = await scanTxOutSet(senderAddress);

    if (utxosRes) {
      utxosRes.forEach((utxo: any) => {
        utxos.push({
          txid: utxo.txid,
          vout: utxo.vout,
          amount: BigInt(Math.round(utxo.amount * 100000000)),
          scriptPubKey: utxo.scriptPubKey,
          height: utxo.height,
        });
      });
    }

    utxos.sort((a: any, b: any) => a.height - b.height);
    console.log("utxos", utxos);
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

    // Add output for the deposit
    psbt.addOutput({
      value: BigInt(amount),
      address: p2trAddress, // Use the P2TR output script
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
