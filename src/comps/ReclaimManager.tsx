import { usePathname, useSearchParams } from "next/navigation";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import { FlowContainer, FlowLoaderContainer } from "./core/FlowContainer";
import { Heading, SubText } from "./core/Heading";
import { useShortAddress } from "@/hooks/use-short-address";
import { InformationCircleIcon } from "@heroicons/react/16/solid";
import { PrimaryButton, SecondaryButton } from "./core/FlowButtons";
import { useAtomValue } from "jotai";
import { bridgeConfigAtom, walletInfoAtom } from "@/util/atoms";
import { useNotifications } from "@/hooks/use-notifications";
import { NotificationStatusType } from "./Notifications";
import {
  constructPsbtForReclaim,
  constructUtxoInputForFee,
  finalizePsbt,
} from "@/util/reclaimHelper";
import { SignatureHash } from "@leather.io/rpc";
import { useAtom } from "jotai";

enum RECLAIM_STEP {
  LOADING = "LOADING",
  NOT_FOUND = "NOT_FOUND",
  RECLAIM = "RECLAIM",
  CANT_RECLAIM = "CANT_RECLAIM",
  CURRENT_STATUS = "CURRENT_STATUS",
}

type EmilyDepositTransactionType = {
  bitcoinTxid: string;
  bitcoinTxOutputIndex: number;
  recipient: string;
  amount: number;
  lastUpdateHeight: number;
  lastUpdateBlockHash: string;
  status: string;
  statusMessage: string;
  parameters: {
    maxFee: number;
    lockTime: number;
  };
  reclaimScript: string;
  depositScript: string;
  fulfillment: {
    BitcoinTxid: string;
    BitcoinTxIndex: number;
    StacksTxid: string;
    BitcoinBlockHash: string;
    BitcoinBlockHeight: number;
    BtcFee: number;
  };
};

const ReclaimManager = () => {
  // const router = useRouter();
  // const pathname = usePathname();
  const searchParams = useSearchParams();

  const { notify } = useNotifications();

  const [step, _setStep] = useState<RECLAIM_STEP>(RECLAIM_STEP.LOADING);

  const [emilyDepositTransaction, setEmilyDepositTransaction] =
    useState<EmilyDepositTransactionType | null>(null);

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
        // ensure we have the deposit transaction
        if (!emilyDepositTransaction) {
          notify({
            type: NotificationStatusType.ERROR,
            message: "Something went wrong",
          });
          _setStep(RECLAIM_STEP.NOT_FOUND);
          return null;
        }
        return (
          <ReclaimDeposit
            amount={amount}
            depositTransaction={emilyDepositTransaction}
          />
        );
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

  const fetchDepositAmount = async () => {
    try {
      //https://beta.sbtc-mempool.tech/api/proxy/tx/2e568e4c514906a917d3a6a229b16e10e4922f36e3f7d20135292213053f7750
      const depositTxId = searchParams.get("depositTxId");
      const voutIndex = searchParams.get("vout") || 0;
      // ensure we have the depositTxId
      if (!depositTxId) {
        notify({
          type: NotificationStatusType.ERROR,
          message: "No deposit transaction found",
        });
        setStep(RECLAIM_STEP.NOT_FOUND);
        return;
      }

      const url = `/api/tx?txId=${depositTxId}`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Error with the request");
      }

      const responseData = await response.json();

      // get the amount from vout array
      const vout = responseData.vout;

      const depositAmount = vout[voutIndex].value;

      const amount = depositAmount / 1e8;

      setAmount(amount);
      console.log("fetchDepositAmount - amount", amount);
    } catch (err) {
      console.error("Error fetching deposit amount", err);
      //setStep(RECLAIM_STEP.NOT_FOUND);
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
        },
      );
      if (!response.ok) {
        throw new Error("Error with the request");
      }

      const responseData = await response.json();

      console.log("responseData", responseData);

      setAmount(amount);

      setEmilyDepositTransaction(responseData);

      const emilyRes = responseData as EmilyDepositTransactionType;

      if (emilyRes.status === "pending") setStep(RECLAIM_STEP.RECLAIM);

      fetchDepositAmount();
    } catch (err) {
      console.error("Error fetching deposit info from Emily", err);
      setStep(RECLAIM_STEP.NOT_FOUND);
    }
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
  return (
    <FlowContainer>
      <div className="flex h-full flex-col gap-2 items-center justify-center">
        <div
          className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-e-transparent align-[-0.125em] text-surface motion-reduce:animate-[spin_1.5s_linear_infinite] dark:text-orange"
          role="status"
        ></div>
        <SubText>Loading Info</SubText>
      </div>
    </FlowContainer>
  );
};

const NotFound = () => {
  return (
    <FlowContainer>
      <>
        <div className="w-full flex flex-row items-center justify-between">
          <Heading>Transaction could not be found</Heading>
        </div>
        <div className="flex flex-1 ">
          <div className="w-full p-4 bg-lightOrange h-24 rounded-lg flex flex-row items-center justify-center gap-2">
            <InformationCircleIcon className="h-10 w-10 text-orange" />
            <p className="text-orange font-Matter font-semibold text-sm break-keep">
              The transaction you are looking for could not be found. Please
              check the transaction details and try again. If you believe this
              is an error please contact a team member.
            </p>
          </div>
        </div>
      </>
    </FlowContainer>
  );
};

const CantReclaim = () => {
  return (
    <FlowContainer>
      <>
        <div className="w-full flex flex-row items-center justify-between">
          <Heading>Can't Reclaim Deposit</Heading>
        </div>
        <div className="flex flex-1 ">
          <div className="w-full p-4 bg-lightOrange h-24 rounded-lg flex flex-row items-center justify-center gap-2">
            <InformationCircleIcon className="h-10 w-10 text-orange" />
            <p className="text-orange font-Matter font-semibold text-sm break-keep">
              This deposit can't be reclaimed since it's been minted for sBTC
              and deposited into the Stacks chain.
            </p>
          </div>
        </div>
      </>
    </FlowContainer>
  );
};
type ReclaimDepositProps = {
  amount: number;
  depositTransaction: EmilyDepositTransactionType;
};
interface SignPsbtRequestParams {
  hex: string;
  allowedSighash?: SignatureHash[];
  signAtIndex?: number | number[];
  network?: string;
  account?: number;
  broadcast?: boolean;
}

const ReclaimDeposit = ({
  amount,
  depositTransaction,
}: ReclaimDepositProps) => {
  const { notify } = useNotifications();
  const [walletInfo, setWalletInfo] = useAtom(walletInfoAtom);

  const { WALLET_NETWORK: walletNetwork } = useAtomValue(bridgeConfigAtom);

  const signerPubKey =
    "4ea6e657117bc8168254b8943e55a65997c71b3994e1e2915002a9da0c22ee1e";
  //const userData = useAtomValue(userDataAtom);

  const getUserBtcAddress = () => {
    return "bcrt1q728h29ejjttmkupwdkyu2x4zcmkuc3q29gvwaa";
  };
  const buildReclaimTransaction = async () => {
    try {
      // ensure userData is not empty
      // if (!userData) {
      //   notify({
      //     type: NotificationStatusType.ERROR,
      //     message: "Wallet not Connected",
      //   });
      //   return;
      // }

      //console.log("userData", userData);
      // fetch utxo to covert maxFee
      const maxReclaimFee = 5000;

      const btcAddress = getUserBtcAddress();

      const unsignedTxHex = constructPsbtForReclaim({
        depositAmount: amount * 1e8,
        feeAmount: maxReclaimFee,
        lockTime: depositTransaction.parameters.lockTime,
        depositScript: depositTransaction.depositScript,
        reclaimScript: depositTransaction.reclaimScript,
        pubkey: signerPubKey || "",
        txId: depositTransaction.bitcoinTxid,
        vout: depositTransaction.bitcoinTxOutputIndex,
        bitcoinReturnAddress: btcAddress,
      });

      console.log("unsignedTxHex", unsignedTxHex);

      // sign the transaction through api
      const signPsbtRequestParams: SignPsbtRequestParams = {
        hex: unsignedTxHex,
        network: walletNetwork,
        //signAtIndex: [0, 1],
        broadcast: true,
      };

      const response = await window.LeatherProvider?.request(
        "signPsbt",
        signPsbtRequestParams,
      );

      console.log("response", response);
      if (response && response.result) {
        console.log("response", response);

        const signedTxHex = response.result.hex;

        const finalizedTxHex = finalizePsbt(signedTxHex);

        console.log("finalizedTxHex", finalizedTxHex);
      }
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
              {amount} BTC
            </p>
          </div>
          <div className="flex flex-col gap-1">
            <SubText>Lock Time</SubText>
            <p className="text-black font-Matter font-semibold text-sm">
              {depositTransaction.parameters.lockTime} blocks
            </p>
          </div>
          <div className="flex flex-col gap-1">
            <SubText>Bitcoin address to reclaim to</SubText>
            <p className="text-black font-Matter font-semibold text-sm">
              {useShortAddress(
                walletInfo
                  ? walletInfo.addresses.payment?.address
                  : "Loading...",
              )}
            </p>
          </div>
        </div>
        <div className="flex flex-1 ">
          <div className="w-full p-4 bg-lightOrange h-20 rounded-lg flex flex-row items-center justify-center gap-2">
            <InformationCircleIcon className="h-10 w-10 text-orange" />
            <p className="text-orange font-Matter font-semibold text-sm break-keep">
              Please note that deposit wont be able to be reclaimed till after
              enough blocks have passed from it's locktime
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
  const [showLoader, setShowLoader] = useState<boolean>(false);

  return (
    <FlowLoaderContainer showLoader={showLoader}>
      <>
        <div className="w-full flex flex-row items-center justify-between">
          <Heading>Review Reclaim Transaction</Heading>
        </div>
        <div className="flex flex-col  gap-2">
          <div className="flex flex-col gap-1">
            <SubText>Amount selected to Reclaim</SubText>
          </div>
        </div>
      </>
    </FlowLoaderContainer>
  );
};
