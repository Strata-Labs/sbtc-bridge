"use client";

import { useNotifications } from "@/hooks/use-notifications";
import {
  bridgeConfigAtom,
  depositMaxFeeAtom,
  showConnectWalletAtom,
  walletInfoAtom,
} from "@/util/atoms";
import { useAtomValue, useSetAtom } from "jotai";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { NotificationStatusType } from "./Notifications";
import { getAggregateKey } from "@/util/get-aggregate-key";
import { principalCV, serializeCVBytes } from "@stacks/transactions";
import {
  createDepositScript,
  createReclaimScript,
} from "@/util/depositRequest";

import {
  bytesToHex as uint8ArrayToHexString,
  hexToBytes as hexToUint8Array,
} from "@stacks/common";
import { FlowContainer } from "./core/FlowContainer";
import { Heading, SubText } from "./core/Heading";
import { InformationCircleIcon } from "@heroicons/react/20/solid";
import { useShortAddress } from "@/hooks/use-short-address";
import { PrimaryButton } from "./core/FlowButtons";
import { useDepositStatus } from "@/hooks/use-deposit-status";
import { DepositStepper } from "./deposit-stepper";
import { getEmilyDepositInfo } from "@/util/tx-utils";
import RecoverReview from "./recover-review";

const RecoverManager = () => {
  const [showStepper, setShowStepper] = useState(false);

  const searchParams = useSearchParams();

  const { notify } = useNotifications();

  const {
    EMILY_URL: emilyUrl,
    WALLET_NETWORK: walletNetwork,
    RECLAIM_LOCK_TIME: lockTime,
  } = useAtomValue(bridgeConfigAtom);

  const walletInfo = useAtomValue(walletInfoAtom);

  const maxFee = useAtomValue(depositMaxFeeAtom);
  const config = useAtomValue(bridgeConfigAtom);

  const setShowConnectWallet = useSetAtom(showConnectWalletAtom);

  const isConnected = useMemo(() => !!walletInfo.selectedWallet, [walletInfo]);

  useEffect(() => {
    checkIfEmilyIsAware();
  }, []);

  const checkIfEmilyIsAware = async () => {
    try {
      const txId = searchParams.get("txId");

      // ensure txId is present
      if (!txId) {
        notify({
          type: NotificationStatusType.ERROR,
          message: "Invalid URL parameters",
        });
        throw new Error("Invalid URL parameters");
      }

      const txInfo = await getEmilyDepositInfo({
        txId,
        emilyURL: emilyUrl!,
      });

      console.log("txInfo", txInfo);

      if (txInfo.reclaimScript) {
        setShowStepper(true);
      }
    } catch (err: any) {
      console.log("checkIfEmilyIsAware", err);
      throw new Error(err);
    }
  };
  const generateScripts = async () => {
    try {
      const stxAddress = searchParams.get("stxAddress");
      const txId = searchParams.get("txId");

      // ensure the user is signed in before proceeding
      if (!walletInfo.selectedWallet) {
        notify({
          type: NotificationStatusType.ERROR,
          message: "Please connect your wallet to proceed",
        });
        throw new Error("User not connected");
      }

      // ensure that the stx address and txId are present
      if (!stxAddress || !txId) {
        notify({
          type: NotificationStatusType.ERROR,
          message: "Invalid URL parameters",
        });
        throw new Error("User not connected");
      }

      const signersAggregatePubKey = (await getAggregateKey()).slice(2);

      // Combine the version and hash into a single Uint8Array
      const serializedAddress = serializeCVBytes(principalCV(stxAddress));

      // get the publicKey from the user payment address
      // user cannot continue if they're not connected
      const paymentAddress = walletInfo.addresses.payment!;

      const reclaimPublicKey = paymentAddress.publicKey;

      // Parse lockTime from env variable
      const parsedLockTime = parseInt(lockTime || "144");

      // Create the reclaim script and convert to Buffer
      const reclaimScript = Buffer.from(
        createReclaimScript(parsedLockTime, reclaimPublicKey),
      );

      const reclaimScriptHex = uint8ArrayToHexString(reclaimScript);

      const signerUint8Array = hexToUint8Array(signersAggregatePubKey!);

      const depositScript = Buffer.from(
        createDepositScript(signerUint8Array, maxFee, serializedAddress),
      );
      // convert buffer to hex
      const depositScriptHexPreHash = uint8ArrayToHexString(depositScript);

      const emilyReqPayload = {
        bitcoinTxid: txId,
        bitcoinTxOutputIndex: 0,
        reclaimScript: reclaimScriptHex,
        depositScript: depositScriptHexPreHash,
      };

      console.log({ emilyReqPayload });
      //console.log({ emilyReqPayloadClient: JSON.stringify(emilyReqPayload) });

      // make emily post request
      const response = await fetch("/api/emilyDeposit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(emilyReqPayload),
      });

      if (!response.ok) {
        notify({
          type: NotificationStatusType.ERROR,
          message: `Issue with Request to Emily`,
        });

        throw new Error("Error with the request");
      }
      notify({
        type: NotificationStatusType.SUCCESS,
        message: `Request successful`,
      });
      setShowStepper(true);
    } catch (err: any) {
      throw new Error(err);
    }
  };

  if (showStepper) {
    return <RecoverReview txId={searchParams.get("txId") || ""} />;
  }

  return (
    <>
      <FlowContainer>
        <>
          <div className="w-full flex flex-row items-center justify-between">
            <Heading>Recover Lost Transaction</Heading>
          </div>
          {/* <div className="flex flex-col  gap-2">
            <div className="flex flex-col gap-1">
              <SubText>Transaction ID</SubText>
              <p className="text-black font-Matter font-semibold text-sm">
                {useShortAddress(searchParams.get("txId") || "")}
              </p>
            </div>
            <div className="flex flex-col gap-1">
              <SubText>Stacks address to transfer to</SubText>
              <p className="text-black font-Matter font-semibold text-sm">
                {useShortAddress(searchParams.get("stxAddress") || "")}
              </p>
            </div>
          </div> */}
          <div className="flex flex-1 ">
            <div className="w-full p-4 bg-lightOrange h-10 rounded-lg flex flex-row items-center justify-center gap-2">
              <InformationCircleIcon className="h-6 w-6 text-orange" />
              <p className="text-orange font-Matter font-semibold text-sm break-keep">
                This send our signers the information lost to be able to reclaim
                your lost script or have your transaction successful deposited
              </p>
            </div>
          </div>
          <div className="w-full flex-row flex justify-between items-center">
            {isConnected ? (
              <PrimaryButton onClick={() => generateScripts()}>
                RECOVER
              </PrimaryButton>
            ) : (
              <button
                type="button"
                onClick={() => setShowConnectWallet(true)}
                className="bg-orange px-4 py-2 rounded-md font-Matter text-xs font-semibold tracking-wide"
              >
                CONNECT WALLET
              </button>
            )}
          </div>
        </>
      </FlowContainer>
    </>
  );
};

export default RecoverManager;
