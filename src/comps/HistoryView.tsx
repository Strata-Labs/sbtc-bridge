"use client";

import { useState } from "react";
import { FlowContainer } from "./core/FlowContainer";
import { FlowForm } from "./core/Form";
import { Heading, SubText } from "./core/Heading";
import { scanTxOutSet } from "@/util/bitcoinClient";
import { HistoryTx, HistoryTxProps } from "./Status";
import { useAtom } from "jotai";
import { eventsAtom } from "@/util/atoms";
import { NotificationStatusType } from "./Notifications";

const HistoryView = () => {
  const [events, setEvents] = useAtom(eventsAtom);

  const [history, setHistory] = useState<HistoryTxProps[]>([]);

  const [totalBitcoinHeld, setTotalBitcoinHeld] = useState<number>(0);

  const handleSubmit = async (value: string | undefined) => {
    const _events = [...events];
    try {
      if (value) {
        // call the bitcoin api to get the history of address

        const history = await scanTxOutSet(value);
        if (history) {
          if (history.unspents === 0) {
            //window.alert("No history found for this address");

            _events.push({
              id: _events.length + 1 + "",
              type: NotificationStatusType.ERROR,
              title: `No history found for this address`,
            });

            setEvents(_events);
          }
          const totalBalance = history.unspents.reduce(
            (acc: number, utxo: HistoryTxProps) => acc + utxo.amount,
            0
          );

          setHistory(history.unspents);
          setTotalBitcoinHeld(totalBalance);
        } else {
          _events.push({
            id: _events.length + 1 + "",
            type: NotificationStatusType.ERROR,
            title: `Could not get history`,
          });
          setEvents(_events);
        }
      }
    } catch (err: any) {
      _events.push({
        id: _events.length + 1 + "",
        type: NotificationStatusType.ERROR,
        title: `Could not get history`,
      });
      setEvents(_events);
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
      <div className="mb-5" />
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
