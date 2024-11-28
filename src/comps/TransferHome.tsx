"use client";

import {
  getRawTransaction,
  scanTxOutSet,
  sendRawTransaction,
} from "@/util/bitcoinClient";
import { FlowContainer } from "./core/FlowContainer";
import { FlowFormDynamic, NameKeysInfo } from "./core/Form";
import { Heading, SubText } from "./core/Heading";
import Header from "./Header";
import * as bitcoin from "bitcoinjs-lib";
import ecc from "@bitcoinerlab/secp256k1";
import { ECPairFactory, ECPairAPI } from "ecpair";
import { useEffect } from "react";

import { useSetAtom } from "jotai";
import { bridgeConfigAtom } from "@/util/atoms";
import getSbtcBridgeConfig from "@/actions/get-sbtc-bridge-config";

const ECPair: ECPairAPI = ECPairFactory(ecc);

const network = bitcoin.networks.regtest;

const TransferApp = () => {
  const setConfig = useSetAtom(bridgeConfigAtom);
  useEffect(() => {
    getSbtcBridgeConfig().then(setConfig);
  }, [setConfig]);
  return (
    <>
      <Header />
      <div className="flex flex-1 flex-col w-full px-5 gap-6 items-center pt-5">
        <div className="flex  flex-row items-center justify-center"></div>
        <div className="w-screen flex "></div>
        <TransferAction />
      </div>
    </>
  );
};

export default TransferApp;

const data: NameKeysInfo[] = [
  {
    nameKey: "receiverAddy",
    type: "text",
    initValue: "",
    placeholder: "Enter the address",
  },
  {
    nameKey: "amount",
    type: "number",
    initValue: "",
    placeholder: "Enter the amount",
  },
];
const senderAddy = "miEJtNKa3ASpA19v5ZhvbKTEieYjLpzCYT";
export const TransferAction = () => {
  const handleSubmit = async (value: any) => {
    try {
      const amount = parseInt(value.amount) || 0;
      const receiverAddy = value.receiverAddy || "";

      const senderPrivateKey = Buffer.from(
        "9e446f6b0c6a96cf2190e54bcd5a8569c3e386f091605499464389b8d4e0bfc2",
        "hex",
      );
      const senderKeyPair = ECPair.fromPrivateKey(senderPrivateKey, {
        network,
      });

      if (senderAddy === undefined) throw new Error("Invalid sender address");

      const utxosRes = await scanTxOutSet(senderAddy);
      console.log("utxosRes", utxosRes);

      if (utxosRes.unspent === 0)
        throw new Error(`No UTXOs available for address ${senderAddy}`);

      let totalInput = 0;
      utxosRes.unspents.sort((a: any, b: any) => a.height - b.height);
      const inputs = [];
      for (const utxo of utxosRes.unspents) {
        const rawTxHex = await getRawTransaction(utxo.txid); // Fetch raw transaction hex
        console.log("TransferAction -> Raw Transaction Hex:", rawTxHex);
        inputs.push({
          txid: utxo.txid,
          vout: utxo.vout,
          amount: utxo.amount,
          rawTxHex: rawTxHex.hex, // Store raw transaction hex for signing
          height: utxo.height,
        });
        totalInput += utxo.amount;
        if (totalInput >= amount) break;
      }

      if (totalInput < amount) throw new Error("Insufficient funds");

      const fee = 0.0002; // Adjust fee as needed
      const change = totalInput - amount - fee;

      const psbt = new bitcoin.Psbt({ network });

      console.log("inputs", inputs);
      // Add inputs with nonWitnessUtxo for legacy address
      inputs.forEach((input) => {
        psbt.addInput({
          hash: input.txid,
          index: input.vout,
          nonWitnessUtxo: Buffer.from(input.rawTxHex, "hex"), // Use nonWitnessUtxo for legacy inputs
        });
      });

      // Add output to the receiver
      psbt.addOutput({
        address: receiverAddy,
        value: BigInt(Math.floor(amount * 1e8)), // Convert to satoshis
      });

      // Add change output if there's leftover
      if (change > 0) {
        psbt.addOutput({
          address: senderAddy,
          value: BigInt(Math.floor(change * 1e8)), // Convert to satoshis
        });
      }

      // Sign all inputs with the private key
      inputs.forEach((_, index) => {
        psbt.signInput(index, senderKeyPair);
      });

      // Finalize and extract the transaction
      psbt.finalizeAllInputs();
      const signedTx = psbt.extractTransaction().toHex();
      console.log("Signed Transaction Hex:", signedTx);

      // Send the transaction to the Bitcoin network
      const txId = await sendRawTransaction(signedTx);
      console.log("Transaction ID:", txId);

      return txId;
    } catch (err) {
      console.log("err", err);
    }
  };
  return (
    <FlowContainer>
      <>
        <div className="w-full flex flex-row items-center justify-between">
          <Heading>Transfer Between Address</Heading>
        </div>
        <div className="flex flex-col gap-1">
          <SubText>Sender Address</SubText>
          <p className="text-black font-Matter font-semibold text-sm">
            {senderAddy}
          </p>
        </div>
        <FlowFormDynamic
          nameKeys={data}
          handleSubmit={(value) => handleSubmit(value)}
        />
      </>
    </FlowContainer>
  );
};
