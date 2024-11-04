import { useRouter } from "next/navigation";
import { StatusContainer } from "./core/FlowContainer";
import { Heading, SubText } from "./core/Heading";
import { PrimaryButton, SecondaryButton } from "./core/FlowButtons";

const Status = () => {
  // get the query params from the url
  const router = useRouter();

  return (
    <StatusContainer>
      <>
        <div className="w-full flex flex-row items-center justify-between">
          <Heading>Transaction Status</Heading>
        </div>
        <div className="flex flex-col  gap-2">
          <div className="flex flex-col gap-1">
            <SubText>Transaction Type</SubText>
            <p className="text-black font-Matter font-semibold text-sm">
              Deposit
            </p>
          </div>
          <div className="flex flex-col gap-1">
            <SubText>Deposit Status</SubText>
            <p className="text-black font-Matter font-semibold text-sm">
              Confirmed in STX chain
            </p>
          </div>
          <div className="flex flex-col gap-1">
            <SubText>Stacks address to transfer to</SubText>
            <p className="text-black font-Matter font-semibold text-sm">
              ST29XVH2WM204GCA37JXTXH0PZRAE3YRQMQ6BX2A7
            </p>
          </div>

          <div className="flex flex-col gap-1">
            <SubText>Signer PubKey</SubText>
            <p className="text-black font-Matter break-all font-semibold text-sm">
              signer pub
            </p>
          </div>
          <div className="w-full flex-row flex justify-between items-center">
            <SecondaryButton onClick={() => console.log()}>
              BACK
            </SecondaryButton>
            <PrimaryButton onClick={() => console.log()}>VIEW</PrimaryButton>
          </div>
        </div>
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

  const handleClick = () => {};
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
            <PrimaryButton onClick={() => console.log()}>
              VIEW DETAILS
            </PrimaryButton>
          </div>
        </div>
      </>
    </StatusContainer>
  );
};
