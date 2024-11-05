"use client";

import { useRouter } from "next/navigation";
import { StatusContainer } from "./core/FlowContainer";
import { Heading, SubText } from "./core/Heading";
import { PrimaryButton, SecondaryButton } from "./core/FlowButtons";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { getRawTransaction } from "@/util/bitcoinClient";
import { useAtom, useAtomValue } from "jotai";
import { emilyUrlAtom } from "@/util/atoms";

type BitcoinTransactionResponse = {
  txid: string;
  hash: string;
  size: number;
  vsize: number;
  weight: number;
  version: number;
  locktime: number;
  vin: {
    txid: string;
    vout: number;
    scriptSig: {
      asm: string;
      hex: string;
    };
    sequence: number;
  }[];
  vout: {
    value: number;
    n: number;
    scriptPubKey: {
      asm: string;
      hex: string;
      reqSigs: number;
      type: string;
      addresses: string[];
    };
  }[];
  blockhash: string;
  confirmations: number;
  time: number;
  blocktime: number;
};

type EmilyDepositResponse = {
  bitcoinTxid: string;
  bitcoinTxOutputIndex: number;
  recipient: string;
  amount: number;
  lastUpdateHeight: number;
  lastUpdateBlockHash: string;
  status: "pending" | "confirmed" | "failed"; // Assuming possible statuses
  statusMessage: string;
  parameters: {
    maxFee: number;
    lockTime: number;
  };
  reclaimScript: string;
  depositScript: string;
};

const Status = () => {
  const [txDetails, setTxDetails] =
    useState<BitcoinTransactionResponse | null>();

  const [emilyDeposit, setEmilyDeposit] =
    useState<EmilyDepositResponse | null>();

  // get the query params from the url
  const router = useRouter();
  const searchParams = useSearchParams();

  const emilyUrl = useAtomValue(emilyUrlAtom);

  useEffect(() => {
    // get the txId from the query params

    const search = searchParams.get("txId");
    // fetch the transacition details from bitcoin rpc and emily
    if (search) {
      fetchTransactionDetails(search);
    }
  }, []);

  const fetchTransactionDetails = async (txId: string) => {
    try {
      const rawTx = await getRawTransaction(txId);
      console.log("rawTx", rawTx);
      if (rawTx) {
        setTxDetails(rawTx);
        handleDetermineIfSbtcDeposit(rawTx);
      } else {
        window.alert("Error fetching transaction details");
      }
    } catch (err) {
      console.log("err", err);
      window.alert("Error fetching transaction details");
    }
  };

  const handleDetermineIfSbtcDeposit = (txInfo: BitcoinTransactionResponse) => {
    console.log("handleDetermineIfSbtcDeposit");
    if (txInfo) {
      // determin if any of the outputs may be a depoist tx
      // this logic will def need to be cleaned up eventaully
      // loop throug the vouts and see if any of scriptPubKey types is "witness_v1_taproot"

      let depositIndex = null;
      for (let i = 0; i < txInfo.vout.length; i++) {
        console.log(
          " txInfo.vout[i].scriptPubKey",
          txInfo.vout[i].scriptPubKey
        );
        if (
          txInfo.vout[i].scriptPubKey &&
          txInfo.vout[i].scriptPubKey.type === "witness_v1_taproot"
        ) {
          depositIndex = txInfo.vout[i].n;
          break;
        }
      }
      if (depositIndex !== null) {
        // fetch the tx status from emily and determine if it is a deposit
        //const
        handleFetchFromEmily(txInfo.txid, depositIndex);
      }
    }
  };

  const handleFetchFromEmily = async (txId: string, vout: number) => {
    try {
      // create a get request to emily to get the tx status
      // call /deposit with body { bitcoinTxid: string, vout: number, url: string }

      // make emily post request
      const emilyGetPayload = {
        bitcoinTxid: txId,
        vout: vout,
        url: emilyUrl,
      };
      // create search params for the url from the payload
      const searchParams = new URLSearchParams(emilyGetPayload as any);

      const response = await fetch(
        `/api/emilyDeposit?${searchParams.toString()}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          //body: JSON.stringify(emilyGetPayload),
        }
      );

      console.log("handleFetchFromEmily -> response", response);

      if (!response.ok) {
        throw new Error("Error with the request");
      }

      const responseData = await response.json();
      console.log("handleFetchFromEmily -> responseData", responseData);

      setEmilyDeposit(responseData);
    } catch (err) {
      console.log("err", err);
      window.alert("Error fetching transaction details");
    }
  };
  return (
    <>
      {txDetails ? (
        <>
          <StatusContainer>
            <>
              <div className="w-full flex flex-row items-center justify-between">
                <Heading>Transaction Status</Heading>
              </div>

              <>
                <div className="flex flex-col  gap-2">
                  <div className="flex flex-col gap-1">
                    <SubText>TxId</SubText>
                    <p className="text-black font-Matter font-semibold text-sm">
                      {txDetails.txid}
                    </p>
                  </div>
                  <div className="flex flex-col gap-1">
                    <SubText>Hash</SubText>
                    <p className="text-black font-Matter font-semibold text-sm">
                      {txDetails.hash}
                    </p>
                  </div>
                  <div className="flex flex-col gap-1">
                    <SubText>Size</SubText>
                    <p className="text-black font-Matter font-semibold text-sm">
                      {txDetails.size}
                    </p>
                  </div>

                  <div className="flex flex-col gap-1">
                    <SubText>vSize</SubText>
                    <p className="text-black font-Matter break-all font-semibold text-sm">
                      {txDetails.vsize}
                    </p>
                  </div>
                  <div className="flex flex-col gap-1">
                    <SubText>Weight</SubText>
                    <p className="text-black font-Matter break-all font-semibold text-sm">
                      {txDetails.weight}
                    </p>
                  </div>
                  <div className="flex flex-col gap-1">
                    <SubText>LockTime</SubText>
                    <p className="text-black font-Matter break-all font-semibold text-sm">
                      {txDetails.locktime}
                    </p>
                  </div>
                  <div className="flex flex-col gap-1">
                    <SubText>Blockhash</SubText>
                    <p className="text-black font-Matter break-all font-semibold text-sm">
                      {txDetails.blockhash}
                    </p>
                  </div>
                  <div className="flex flex-col gap-1">
                    <SubText>Confirmations</SubText>
                    <p className="text-black font-Matter break-all font-semibold text-sm">
                      {txDetails.confirmations}
                    </p>
                  </div>
                  <div className="flex flex-col gap-1">
                    <SubText>Blocktime</SubText>
                    <p className="text-black font-Matter break-all font-semibold text-sm">
                      {txDetails.blocktime}
                    </p>
                  </div>
                  {
                    // vin
                    txDetails.vin.map((vin, index) => {
                      return (
                        <div className="flex flex-col m-2 gap-2" key={index}>
                          <div className="flex flex-col gap-1">
                            <SubText>V In</SubText>
                            <p className="text-black font-Matter break-all font-semibold text-sm">
                              {vin.txid}
                            </p>
                          </div>
                          <div className="flex flex-col gap-1">
                            <SubText>Sequence</SubText>
                            <p className="text-black font-Matter break-all font-semibold text-sm">
                              {vin.sequence}
                            </p>
                          </div>
                          <div className="flex flex-col gap-1">
                            <SubText>Value</SubText>
                            <p className="text-black font-Matter break-all font-semibold text-sm">
                              {vin.scriptSig.hex}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  }
                  {
                    // vout
                    txDetails.vout.map((vout, index) => {
                      return (
                        <div className="flex flex-col m-2 gap-2" key={index}>
                          <div className="flex flex-col gap-1">
                            <SubText>v Out</SubText>
                            <p className="text-black font-Matter break-all font-semibold text-sm">
                              {vout.n}
                            </p>
                          </div>
                          <div className="flex flex-col gap-1">
                            <SubText>Script Pub Key</SubText>
                            <p className="text-black font-Matter break-all font-semibold text-sm">
                              {vout.scriptPubKey.hex}
                            </p>
                          </div>

                          <div className="flex flex-col gap-1">
                            <SubText>Script Pub Key reqSig</SubText>
                            <p className="text-black font-Matter break-all font-semibold text-sm">
                              {vout.scriptPubKey.reqSigs}
                            </p>
                          </div>
                          <div className="flex flex-col gap-1">
                            <SubText>Script Pub Key type</SubText>
                            <p className="text-black font-Matter break-all font-semibold text-sm">
                              {vout.scriptPubKey.type}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  }
                </div>
              </>
            </>
          </StatusContainer>
          {emilyDeposit && (
            <StatusContainer>
              <div className="w-full flex flex-row items-center justify-between">
                <Heading>Emily Transaction Status Status</Heading>
              </div>

              <div className="flex flex-col  gap-2">
                <div className="flex flex-col gap-1">
                  <SubText>Recipient</SubText>
                  <p className="text-black font-Matter font-semibold text-sm">
                    {emilyDeposit.recipient}
                  </p>
                </div>
                <div className="flex flex-col gap-1">
                  <SubText>Amount</SubText>
                  <p className="text-black font-Matter font-semibold text-sm">
                    {emilyDeposit.amount}
                  </p>
                </div>
                <div className="flex flex-col gap-1">
                  <SubText>Status</SubText>
                  <p className="text-black font-Matter font-semibold text-sm">
                    {emilyDeposit.status}
                  </p>
                </div>
                <div className="flex flex-col gap-1">
                  <SubText>Status Message</SubText>
                  <p className="text-black font-Matter font-semibold text-sm">
                    {emilyDeposit.statusMessage}
                  </p>
                </div>
                <div className="flex flex-col gap-1">
                  <SubText>Reclaim Script</SubText>
                  <p className="text-black font-Matter font-semibold text-sm">
                    {emilyDeposit.reclaimScript}
                  </p>
                </div>
                <div className="flex flex-col gap-1">
                  <SubText>Deposit Script</SubText>
                  <p className="text-black font-Matter font-semibold text-sm">
                    {emilyDeposit.depositScript}
                  </p>
                </div>
              </div>
            </StatusContainer>
          )}
        </>
      ) : (
        <SubText>Failed Type</SubText>
      )}
    </>
  );
};

export default Status;

export type HistoryTxProps = {
  txid: string;
  vout: number;
  scriptPubKey: string;
  desc: string;
  amount: number;
  height: number;
};
export const HistoryTx = ({
  txid,
  vout,
  scriptPubKey,
  desc,
  amount,
  height,
}: HistoryTxProps) => {
  // get the query params from the url
  const router = useRouter();

  const handleClick = () => {
    // redirect to the status page
    router.push(`/status?txId=${txid}`);
  };
  return (
    <StatusContainer>
      <>
        <div className="flex flex-col  gap-2">
          <div className="flex flex-col gap-1">
            <SubText>Transaction ID</SubText>
            <p className="text-black font-Matter font-semibold text-sm">
              {txid}
            </p>
          </div>
          <div className="flex flex-col gap-1">
            <SubText>vOut</SubText>
            <p className="text-black font-Matter font-semibold text-sm">
              {vout}
            </p>
          </div>
          <div className="flex flex-col gap-1">
            <SubText>Script Pub Key</SubText>
            <p className="text-black font-Matter font-semibold text-sm">
              {scriptPubKey}
            </p>
          </div>

          <div className="flex flex-col gap-1">
            <SubText>Desc</SubText>
            <p className="text-black font-Matter break-all font-semibold text-sm">
              {desc}
            </p>
          </div>
          <div className="flex flex-col gap-1">
            <SubText>Desc</SubText>
            <p className="text-black font-Matter break-all font-semibold text-sm">
              {desc}
            </p>
          </div>
          <div className="flex flex-col gap-1">
            <SubText>Amount</SubText>
            <p className="text-black font-Matter break-all font-semibold text-sm">
              {amount}
            </p>
          </div>
          <div className="flex flex-col gap-1">
            <SubText>Height</SubText>
            <p className="text-black font-Matter break-all font-semibold text-sm">
              {height}
            </p>
          </div>
          <div className="w-full flex-row flex justify-between items-center">
            <PrimaryButton onClick={() => handleClick()}>
              VIEW DETAILS
            </PrimaryButton>
          </div>
        </div>
      </>
    </StatusContainer>
  );
};
