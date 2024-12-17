"use client";

import { bridgeConfigAtom } from "@/util/atoms";
import { useAtomValue } from "jotai";

import { FlowContainer } from "./core/FlowContainer";
import { Heading, SubText } from "./core/Heading";
import { useShortAddress } from "@/hooks/use-short-address";
import { useDepositStatus } from "@/hooks/use-deposit-status";
import { DepositStepper } from "./deposit-stepper";

const RecoverReview = ({ txId }: { txId: string }) => {
  const { status, recipient, stacksTxId } = useDepositStatus(txId);
  const { WALLET_NETWORK: walletNetwork } = useAtomValue(bridgeConfigAtom);
  return (
    <FlowContainer>
      <>
        <div className="w-full flex flex-row items-center justify-between">
          <Heading>Review Transaction</Heading>
        </div>
        <div className="flex flex-col  gap-2">
          <div className="flex flex-col gap-1">
            <SubText>Stacks address to transfer to</SubText>
            <p className="text-black font-Matter font-semibold text-sm">
              {useShortAddress(recipient)}
            </p>
          </div>
        </div>
        <div className="flex flex-1 items-end">
          <SubText>
            To avoid losing your progress, please keep this page open.
          </SubText>
        </div>
        <div className="flex flex-1 items-end">
          <DepositStepper status={status} txId={txId} />
        </div>

        {stacksTxId && (
          <div className="w-full flex-row flex justify-between items-center">
            <a
              className="w-40 rounded-lg py-3 flex justify-center items-center flex-row bg-orange"
              href={`https://explorer.hiro.so/txid/${stacksTxId}?chain=${
                walletNetwork === "mainnet" ? "mainnet" : "testnet"
              }`}
              target="_blank"
              rel="noreferrer"
            >
              View stacks tx
            </a>
          </div>
        )}
      </>
    </FlowContainer>
  );
};

export default RecoverReview;
