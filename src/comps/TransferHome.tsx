"use client";

import { FlowContainer } from "./core/FlowContainer";
import { FlowFormDynamic, NameKeysInfo } from "./core/Form";
import { Heading, SubText } from "./core/Heading";
import { devenvFaucetTransfer } from "@/actions/devenv-faucet-transfer";

const TransferApp = () => {
  return (
    <>
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
          handleSubmit={(value) =>
            devenvFaucetTransfer({
              amount: value.amount,
              receiverAddy: value.receiverAddy,
            })
          }
        />
      </>
    </FlowContainer>
  );
};
