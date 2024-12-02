import * as bip341 from "bitcoinjs-lib/src/payments/bip341";
import * as bitcoin from "bitcoinjs-lib";

import { Taptree } from "bitcoinjs-lib/src/types";
import { buildLeafIndexFinalizer } from "./validateTapLeaf";
import { NUMS_X_COORDINATE } from "./regtest/depositRequest";
import { hexToBytes as hexToUint8Array } from "@stacks/common";
type Utxo = {
  txid: string;
  vout: number;
  scriptPubKey: string;
  desc: string;
  amount: number;
  height: number;
};
type SelectUtxos = {
  selectedUtxos: Utxo[];
  totalAmount: number;
};

export const finalizePsbt = (psbtHex: string) => {
  try {
    const network = bitcoin.networks.regtest;

    const psbt = bitcoin.Psbt.fromHex(psbtHex, { network });

    console.log("finalizePsbt - psbt", psbt);
    console.log("hex", psbt.extractTransaction().toHex());

    console.log(
      "test asm",
      bitcoin.script.toASM(psbt.data.inputs[0].finalScriptWitness!),
    );

    return psbt.extractTransaction().toHex();
  } catch (err) {
    console.error("Error finalizing PSBT:", err);
    throw new Error("Error finalizing PSBT");
  }
};

export const createTransactionFromHex = (hex: string) => {
  const transaction = bitcoin.Transaction.fromHex(hex);
  return transaction;
};
type ReclaimDepositProps = {
  feeAmount: number;
  depositAmount: number;

  lockTime: number;
  depositScript: string;
  reclaimScript: string;
  txId: string;
  vout: number;

  bitcoinReturnAddress: string;
};

export const constructPsbtForReclaim = ({
  depositAmount,
  feeAmount,

  lockTime,
  depositScript,
  reclaimScript,

  txId,
  vout,

  bitcoinReturnAddress,
}: ReclaimDepositProps) => {
  const uInt8DepositScript = hexToUint8Array(depositScript);
  const uInt8ReclaimScript = hexToUint8Array(reclaimScript);

  const scriptTree: Taptree = [
    {
      output: uInt8DepositScript,
    },
    {
      output: uInt8ReclaimScript,
    },
  ];

  const merkleeTree = bip341.toHashTree([
    { output: uInt8DepositScript },
    { output: uInt8ReclaimScript },
  ]);

  // Ensure Merkle is computed
  if (!merkleeTree || !merkleeTree.hash) {
    throw new Error("Failed to compute Merkle root.");
  }

  const network = bitcoin.networks.regtest;
  const psbt = new bitcoin.Psbt({ network });

  const p2trRes = bitcoin.payments.p2tr({
    internalPubkey: NUMS_X_COORDINATE,
    scriptTree,
    redeem: {
      output: uInt8ReclaimScript,
      redeemVersion: 192,
    },

    network: network,
  });

  if (!p2trRes.output || !p2trRes.redeem) {
    throw new Error("Failed to construct P2TR output.");
  }

  const tapLeafScript = {
    leafVersion: p2trRes.redeemVersion || 192,
    script: uInt8ReclaimScript,
    controlBlock: p2trRes.witness![p2trRes.witness!.length - 1],
  };

  psbt.addInput({
    hash: txId,
    index: vout,
    sequence: lockTime,

    witnessUtxo: {
      script: p2trRes.output,
      value: BigInt(depositAmount),
    },
    tapLeafScript: [tapLeafScript],
  });

  const leafIndexFinalizerFn = buildLeafIndexFinalizer(tapLeafScript, lockTime);
  psbt.finalizeInput(0, leafIndexFinalizerFn);

  // Add the fee payer inputs

  const change = BigInt(depositAmount) - BigInt(feeAmount);

  psbt.addOutput({
    address: bitcoinReturnAddress,
    value: BigInt(change),
  });

  const psbtHex = psbt.toHex();
  const base64 = psbt.toBase64();

  return psbtHex;
};
