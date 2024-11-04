"use client";

import { useRouter } from "next/navigation";
import { StatusContainer } from "./core/FlowContainer";
import { Heading, SubText } from "./core/Heading";
import { PrimaryButton, SecondaryButton } from "./core/FlowButtons";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { getRawTransaction } from "@/util/bitcoinClient";

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

const Status = () => {
  const [txDetails, setTxDetails] =
    useState<BitcoinTransactionResponse | null>();
  // get the query params from the url
  const router = useRouter();
  const searchParams = useSearchParams();
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
      } else {
        window.alert("Error fetching transaction details");
      }
    } catch (err) {
      console.log("err", err);
      window.alert("Error fetching transaction details");
    }
  };
  return (
    <StatusContainer>
      <>
        <div className="w-full flex flex-row items-center justify-between">
          <Heading>Transaction Status</Heading>
        </div>
        {txDetails ? (
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
                        <SubText>Script Pub Key Address</SubText>
                        <p className="text-black font-Matter break-all font-semibold text-sm">
                          {vout.scriptPubKey.addresses[0]}
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
              <div className="w-full flex-row flex justify-between items-center">
                <SecondaryButton onClick={() => console.log()}>
                  BACK
                </SecondaryButton>
                <PrimaryButton onClick={() => console.log()}>
                  VIEW
                </PrimaryButton>
              </div>
            </div>
          </>
        ) : (
          <SubText>Transaction Type</SubText>
        )}
      </>
    </StatusContainer>
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
