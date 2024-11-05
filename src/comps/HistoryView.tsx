"use client";

import { useState } from "react";
import { FlowContainer } from "./core/FlowContainer";
import { FlowForm } from "./core/Form";
import { Heading, SubText } from "./core/Heading";
import { scanTxOutSet } from "@/util/bitcoinClient";
import { HistoryTx, HistoryTxProps } from "./Status";

const HistoryView = () => {
  const [history, setHistory] = useState<HistoryTxProps[]>([
    // {
    //   txid: "asdfasdfasdfasdfasdf",
    //   vout: 0,
    //   scriptPubKey: "",
    //   desc: "",
    //   amount: 0,
    //   height: 0,
    // },
  ]);

  const [totalBitcoinHeld, setTotalBitcoinHeld] = useState<number>(0);

  const handleSubmit = async (value: string | undefined) => {
    try {
      if (value) {
        // call the bitcoin api to get the history of address
        console.log("value", value);
        const history = await scanTxOutSet(value);
        if (history) {
          if (history.unspents === 0) {
            window.alert("No history found for this address");
          }
          const totalBalance = history.unspents.reduce(
            (acc: number, utxo: HistoryTxProps) => acc + utxo.amount,
            0
          );
          console.log("history", history);
          setHistory(history.unspents);
          setTotalBitcoinHeld(totalBalance);
        } else {
          window.alert("Failed to get history for this address");
        }
      }
    } catch (err: any) {
      console.log("err", err);
      throw new Error(err);
    }
  };

  return (
    <>
      <FlowContainer>
        <>
          <div className="w-full flex flex-row items-center justify-between">
            <Heading>Address Tx History</Heading>
          </div>
          <SubText>scantxoutset </SubText>
          {totalBitcoinHeld !== 0 && (
            <SubText>Total Balance {totalBitcoinHeld}</SubText>
          )}

          <FlowForm
            nameKey="SignerPubKey"
            type="text"
            placeholder="Enter the address"
            handleSubmit={(value) => handleSubmit(value)}
          ></FlowForm>
        </>
      </FlowContainer>
      {history.map((tx, index) => {
        return (
          <HistoryTx
            key={index}
            txid={tx.txid}
            vout={tx.vout}
            scriptPubKey={tx.scriptPubKey}
            desc={tx.desc}
            amount={tx.amount}
            height={tx.height}
          />
        );
      })}
    </>
  );
};

export default HistoryView;
