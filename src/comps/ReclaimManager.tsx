import { usePathname, useSearchParams } from "next/navigation";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import { FlowContainer } from "./core/FlowContainer";
import { Heading, SubText } from "./core/Heading";
import { useShortAddress } from "@/hooks/use-short-address";
import { InformationCircleIcon } from "@heroicons/react/16/solid";
import { PrimaryButton, SecondaryButton } from "./core/FlowButtons";
import { useAtomValue } from "jotai";
import { userDataAtom } from "@/util/atoms";
import { useNotifications } from "@/hooks/use-notifications";
import { NotificationStatusType } from "./Notifications";
import { constructUtxoInputForFee } from "@/util/reclaimHelper";

enum RECLAIM_STEP {
  LOADING = "LOADING",
  NOT_FOUND = "NOT_FOUND",
  RECLAIM = "RECLAIM",
  CURRENT_STATUS = "CURRENT_STATUS",
}
const ReclaimManager = () => {
  // const router = useRouter();
  // const pathname = usePathname();
  const searchParams = useSearchParams();

  const [step, _setStep] = useState<RECLAIM_STEP>(RECLAIM_STEP.RECLAIM);

  const [depositScript, setDepositScript] = useState<string>("");
  const [reclaimScript, setReclaimScript] = useState<string>("");
  const [amount, setAmount] = useState<number>(0);

  useEffect(() => {
    // get the txId from the query params
    fetchDepositInfoFromEmily();
  }, []);

  const setStep = useCallback((newStep: RECLAIM_STEP) => {
    _setStep(newStep);
  }, []);

  const renderStep = () => {
    switch (step) {
      case RECLAIM_STEP.RECLAIM:
        return <ReclaimDeposit />;
      case RECLAIM_STEP.CURRENT_STATUS:
        return <CurrentStatusReclaim />;
      case RECLAIM_STEP.LOADING:
        return <LoadingInfo />;
      case RECLAIM_STEP.NOT_FOUND:
        return <NotFound />;
      default:
        return null;
    }
  };

  const fetchDepositInfoFromEmily = async () => {
    try {
      // get the depositTxId and outputIndex from the query params
      const depositTxId = searchParams.get("depositTxId");
      const outputIndex = searchParams.get("vout") || 0;

      // we want to get the deposit info from Emily
      /* 
        that means we need the txId of the deposit and optinoal the output index
        - if no output index is found in the search params assume its' 0

        1) fetch the deposit info from Emily
        2) get the reclaim script and deposit script
        3) parse the amount from the deposit script
        4) Display the amount and the reclaim script to the user to confirm 
      */

      const response = await fetch(
        `/api/emilyDeposit?bitcoinTxid=${depositTxId}&vout=${outputIndex}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok) {
        throw new Error("Error with the request");
      }

      const responseData = await response.json();

      console.log("responseData", responseData);
    } catch (err) {}
  };
  return (
    <>
      {renderStep()}
      <div
        style={{
          margin: "16px 0",
        }}
      />
    </>
  );
};

export default ReclaimManager;

const LoadingInfo = () => {
  return <div>LoadingInfo</div>;
};

const NotFound = () => {
  return <div>NotFound</div>;
};

type ReclaimDepositProps = {
  amount: number;
  lockTime: number;
  depositScript: string;
  reclaimScript: string;
};
const ReclaimDeposit = () => {
  const { notify } = useNotifications();

  const userData = useAtomValue(userDataAtom);

  const getUserBtcAddress = () => {
    return "bcrt1q728h29ejjttmkupwdkyu2x4zcmkuc3q29gvwaa";
  };
  const buildReclaimTransaction = async () => {
    try {
      // ensure userData is not empty
      if (!userData) {
        notify({
          type: NotificationStatusType.ERROR,
          message: "Wallet not Connected",
        });
        return;
      }

      console.log("userData", userData);
      // fetch utxo to covert maxFee
      const maxReclaimFee = 1000;

      const btcAddress = getUserBtcAddress();

      const utxo = await constructUtxoInputForFee(maxReclaimFee, btcAddress);
    } catch (err) {
      console.error("Error building reclaim transaction", err);
    }
  };
  return (
    <FlowContainer>
      <>
        <div className="w-full flex flex-row items-center justify-between">
          <Heading>Reclaim Your Deposit</Heading>
        </div>
        <div className="flex flex-col  gap-2">
          <div className="flex flex-col gap-1">
            <SubText>Amount To Reclaim</SubText>
            <p className="text-black font-Matter font-semibold text-sm">
              {100000} sats
            </p>
          </div>
          <div className="flex flex-col gap-1">
            <SubText>Lock Time</SubText>
            <p className="text-black font-Matter font-semibold text-sm">
              {100000} blocks
            </p>
          </div>
          <div className="flex flex-col gap-1">
            <SubText>Bitcoin address to reclaim to</SubText>
            <p className="text-black font-Matter font-semibold text-sm">
              {useShortAddress("addressea;ldjfl;ajsd;")}
            </p>
          </div>
        </div>
        <div className="flex flex-1 ">
          <div className="w-full p-4 bg-lightOrange h-20 rounded-lg flex flex-row items-center justify-center gap-2">
            <InformationCircleIcon className="h-10 w-10 text-orange" />
            <p className="text-orange font-Matter font-semibold text-sm break-keep">
              Please note that deposit wont be able to be reclaimed till after
              enough blocks have passed from It's locktime
            </p>
          </div>
        </div>
        <div className="w-full flex-row flex justify-between items-center">
          <PrimaryButton
            onClick={() => {
              buildReclaimTransaction();
            }}
          >
            RECLAIM
          </PrimaryButton>
        </div>
      </>
    </FlowContainer>
  );
};

const CurrentStatusReclaim = () => {
  return <div>CurrentStatusReclaim</div>;
};
