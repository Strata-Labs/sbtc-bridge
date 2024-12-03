import * as bip341 from "bitcoinjs-lib/src/payments/bip341";
import * as bitcoin from "bitcoinjs-lib";

import { Taptree } from "bitcoinjs-lib/src/types";
import { hexToUint8Array, uint8ArrayToHexString } from "./regtest/wallet";
import { buildLeafIndexFinalizer } from "./validateTapLeaf";
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

const createControlBlock = (
  internalPubKey: Uint8Array,
  siblingHash: Uint8Array,
): Uint8Array => {
  if (internalPubKey.length !== 32) {
    throw new Error("Invalid internal public key: Must be 32 bytes.");
  }

  const versionByte = new Uint8Array([0xc0]);

  const controlBlock = new Uint8Array(
    versionByte.length + internalPubKey.length + siblingHash.length,
  );

  controlBlock.set(versionByte, 0);

  controlBlock.set(internalPubKey, versionByte.length);

  controlBlock.set(siblingHash, versionByte.length + internalPubKey.length);

  return controlBlock;
};

export const finalizePsbt = (psbtHex: string) => {
  try {
    const network = bitcoin.networks.regtest;

    const psbt = bitcoin.Psbt.fromHex(psbtHex, { network });
    //psbt.validateSignaturesOfAllInputs();
    //psbt.finalizeInput(0);
    psbt.finalizeInput(1);
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
type ReclaimDepositProps = {
  amount: number;
  lockTime: number;
  depositScript: string;
  reclaimScript: string;
  pubkey: string;
  txId: string;
  vout: number;
  selectedUtxos: Utxo[];
  bitcoinReturnAddress: string;
};

export const constructPsbtForReclaim = ({
  amount,
  lockTime,
  depositScript,
  reclaimScript,
  pubkey,
  txId,
  vout,
  selectedUtxos,
  bitcoinReturnAddress,
}: ReclaimDepositProps) => {
  console.log("reclaimScript", reclaimScript);
  const uInt8DepositScript = hexToUint8Array(depositScript);
  const uInt8ReclaimScript = hexToUint8Array(reclaimScript);

  console.log("uInt8ReclaimScript", uInt8ReclaimScript);

  console.log("amount", amount);
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

  const merkleRootHash = merkleeTree.hash;
  console.log("merkleRootHash", merkleRootHash);

  // convert merkleRootHash to hex
  const merkleRootHashHex = uint8ArrayToHexString(merkleRootHash);
  console.log("merkleRootHashHex", merkleRootHashHex);

  const siblingHash = bip341.tapleafHash({ output: uInt8DepositScript });
  console.log("siblingHash", siblingHash);

  const reclaimTapScriptLeaf = bip341.tapleafHash({
    output: uInt8ReclaimScript,
  });

  console.log("reclaimTapScriptLeaf", reclaimTapScriptLeaf);
  const controlBlock = createControlBlock(
    hexToUint8Array(pubkey),
    reclaimTapScriptLeaf,
  );
  console.log("controlBlock", controlBlock);

  const network = bitcoin.networks.regtest;
  const psbt = new bitcoin.Psbt({ network });

  // const paramsTest = {
  //   hash: txId,
  //   index: vout,
  //   witnessUtxo: {
  //     script: bitcoin.script.compile([bitcoin.opcodes.OP_1, merkleRootHash]),
  //     value: BigInt(0),
  //   },
  //   tapLeafScript: [
  //     {
  //       leafVersion: 0xc0,
  //       script: reclaimTapScriptLeaf,
  //       controlBlock: controlBlock,
  //     },
  //   ],
  // };

  // console.log("paramsTest", paramsTest);
  // send bitcoin to your self

  const p2trRes = bitcoin.payments.p2tr({
    internalPubkey: NUMS_X_COORDINATE,
    scriptTree,
    redeem: {
      output: uInt8ReclaimScript,
      redeemVersion: 192,
    },
    network: network,
  });

  console.log("p2trRes", p2trRes);
  console.log("p2trRes output", p2trRes.output);

  console.log(uint8ArrayToHexString(p2trRes.output!));

  console.log("p2trRes redeem", p2trRes.redeem);
  console.log("witness", p2trRes.witness);
  if (!p2trRes.output || !p2trRes.redeem) {
    throw new Error("Failed to construct P2TR output.");
  }

  const taprootOutputScript = bitcoin.script.compile([
    bitcoin.opcodes.OP_1,
    merkleeTree.hash,
  ]);

  const wtfisgoingOn = bitcoin.script.compile([
    0x51,
    bitcoin.opcodes.OP_CHECKSEQUENCEVERIFY,
  ]);

  console.log("wtfisgoingOn", wtfisgoingOn);

  const test4 = bitcoin.script.compile([81, 178]);
  console.log("pretest4", test4);

  console.log("test4", bitcoin.script.toASM(test4));

  console.log("taprootOutputScript", taprootOutputScript);

  // ensure the taproot output script is correct
  console.log("test", bitcoin.script.toASM(taprootOutputScript));

  console.log("test2", bitcoin.script.toASM(p2trRes.witness!));

  console.log("control", p2trRes.witness![1]);

  const tapLeafScript = {
    leafVersion: p2trRes.redeemVersion || 192,
    script: uInt8ReclaimScript,
    controlBlock: p2trRes.witness![1],
  };

  console.log("tapLeafScript", tapLeafScript);

  console.log("second test", p2trRes.witness![1]);
  console.log("controlBlock", controlBlock);

  // apend array of uint8array in p2trRes.witness! to a single uint8array

  psbt.addInput({
    hash: txId,
    index: vout,
    witnessUtxo: {
      script: test4,
      value: BigInt(0),
    },
    tapLeafScript: [tapLeafScript],
  });

  console.log("psbt post add input", psbt);

  console.log(uint8ArrayToHexString(psbt.data.inputs[0].witnessUtxo?.script!));
  console.log(
    "one more test",
    bitcoin.script.toASM(psbt.data.inputs[0].witnessUtxo?.script!),
  );

  const leafIndexFinalizerFn = buildLeafIndexFinalizer(tapLeafScript, 0);

  console.log("leafIndexFinalizerFn", leafIndexFinalizerFn);
  psbt.finalizeInput(0, leafIndexFinalizerFn);
  console.log("psbt", psbt);

  // Add the fee payer inputs

  let totalInput = BigInt(0);
  for (const utxo of selectedUtxos) {
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
  }

  const change = BigInt(totalInput) - BigInt(amount);

  console.log("change", change);
  if (change > 0) {
    console.log("addOutput", change);
    psbt.addOutput({
      address: bitcoinReturnAddress,
      value: BigInt(change),
    });
  }

  console.log("psbt json");

  //const tx = psbt.extractTransaction();
  //console.log("tx", tx);
  const psbtHex = psbt.toHex();
  const base64 = psbt.toBase64();
  console.log("base64", base64);
  console.log("psbtHex", psbtHex);

  return psbtHex;
};
