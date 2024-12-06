import * as bip341 from "bitcoinjs-lib/src/payments/bip341";
import * as bitcoin from "bitcoinjs-lib";

import { Taptree } from "bitcoinjs-lib/src/types";
import { hexToUint8Array, uint8ArrayToHexString } from "./regtest/wallet";
import { buildLeafIndexFinalizer, customFinalizer } from "./validateTapLeaf";
import { NUMS_X_COORDINATE } from "./regtest/depositRequest";

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

const fetchUtxosForReclaim = async (address: string) => {
  try {
    const baseUrl = "/api/proxy/address//";

    const productionURL = `${baseUrl}${address}/utxo`;
    const developmentUrl = `/api/utxo?btcAddress=${address}`;

    const url =
      process.env.NODE_ENV === "production" ? productionURL : developmentUrl;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const responseData = await response.json();

    console.log("listUnspentres", responseData);

    if (responseData.result && responseData.result.unspents) {
      return responseData.result.unspents.map((utxo: Utxo) => {
        return {
          txid: utxo.txid,
          vout: utxo.vout,
          scriptPubKey: utxo.scriptPubKey,
          desc: utxo.desc,
          amount: Math.round(utxo.amount * 100000000),
          height: utxo.height,
        };
      });
    } else {
      return [];
    }
  } catch (err) {
    console.error("Error fetching utxos for reclaim:", err);
  }
};

export const selectCoins = (
  utxos: Utxo[],
  requiredAmount: number,
): SelectUtxos => {
  // Sort UTXOs by amount
  const sortedUtxos = utxos.sort((a, b) => a.amount - b.amount);

  let selectedUtxos = [];
  let totalAmount = 0;

  for (const utxo of sortedUtxos) {
    selectedUtxos.push(utxo);
    totalAmount += utxo.amount;

    // Stop when we have enough to cover the required amount
    if (totalAmount >= requiredAmount) {
      break;
    }
  }

  if (totalAmount < requiredAmount) {
    throw new Error("Insufficient funds to cover the required amount.");
  }

  return { selectedUtxos, totalAmount };
};

export const constructUtxoInputForFee = async (
  feeAmount: number,
  address: string,
) => {
  try {
    // get utxo
    const utxos = await fetchUtxosForReclaim(address);

    // construct utxo input for fee
    return selectCoins(utxos, feeAmount);
  } catch (err) {
    console.error("Error constructing UTXO input for fee:", err);
    throw new Error("Error constructing UTXO input for fee");
  }
};

export const finalizePsbt = (psbtHex: string) => {
  try {
    const network = bitcoin.networks.regtest;

    const psbt = bitcoin.Psbt.fromHex(psbtHex, { network });
    //psbt.validateSignaturesOfAllInputs();
    //psbt.finalizeInput(0);
    //psbt.finalizeInput(1);
    //psbt.finalizeAllInputs();

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

function reverseEndian(hexString: string): string {
  // Ensure the input is a valid hexadecimal string
  if (!/^[0-9a-fA-F]*$/.test(hexString) || hexString.length % 2 !== 0) {
    throw new Error("Invalid hex string");
  }

  // Split the string into pairs of two characters, reverse the order, and join them back
  return hexString.match(/.{2}/g)!.reverse().join("");
}

type ReclaimDepositProps = {
  feeAmount: number;
  depositAmount: number;
  lockTime: number;
  depositScript: string;
  reclaimScript: string;
  pubkey: string;
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
  pubkey,
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

  // apend array of uint8array in p2trRes.witness! to a single uint8array

  psbt.addInput({
    hash: txId,
    index: vout,
    //sequence: 0xfffffffd,
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
  console.log("base64", base64);
  console.log("psbtHex", psbtHex);

  return psbtHex;
};
