"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { classNames } from "@/util";
import { c32addressDecode } from "c32check";

import { Menu, MenuButton, MenuItems } from "@headlessui/react";
import {
  ChevronDownIcon,
  InformationCircleIcon,
} from "@heroicons/react/20/solid";

import { FlowContainer } from "@/comps/core/FlowContainer";
import { Heading, SubText } from "@/comps/core/Heading";
import { FlowForm } from "@/comps/core/Form";
import { PrimaryButton, SecondaryButton } from "./core/FlowButtons";
import { createDepositTx } from "../util/regtest/lib";
import {
  getP2WSH,
  hexToUint8Array,
  uint8ArrayToHexString,
} from "@/util/regtest/wallet";
import {
  createDepositAddress,
  createDepositScript,
  createReclaimScript,
} from "@/util/regtest/depositRequest";
import { useAtom, useAtomValue } from "jotai";
import {
  bitcoinDaemonUrlAtom,
  bridgeAddressAtom,
  bridgeSeedPhraseAtom,
  depositMaxFeeAtom,
  emilyUrlAtom,
  ENV,
  envAtom,
  eventsAtom,
  signerPubKeyAtom,
  userDataAtom,
} from "@/util/atoms";
import { useRouter } from "next/navigation";
import { NotificationStatusType } from "./Notifications";
import { createAddress } from "@stacks/transactions";

import { DepositStatus, useDepositStatus } from "@/hooks/use-deposit-status";
import { InfoAlert } from "@/comps/alerts/info";
import { SuccessAlert } from "@/comps/alerts/success";
import { useShortAddress } from "@/hooks/use-short-address";
import { useNotifications } from "@/hooks/use-notifications";
/*
  deposit flow has 3 steps
  1) enter amount you want to deposit
  - can change in what denomination you want to make deposit(satoshi, btc, usd)
  2) enter the stack address they want funds sent to
  3) confirm amount and stacks transaction address
  - create payment request
  - view payment status in history
*/

/*
  each step will have it's own custom configuration about how to deal with this data and basic parsing
  - we should create bulding blocks by not try to create dynamic views
*/

enum DEPOSIT_STEP {
  AMOUNT,
  ADDRESS,
  CONFIRM,
  REVIEW,
}

export const SetSeedPhraseForDeposit = () => {
  const [bridgeSeedPhrase, setBridgeSeedPhrase] = useAtom(bridgeSeedPhraseAtom);

  const handleSubmit = (value: string | undefined) => {
    if (value) {
      // set value to local storage

      setBridgeSeedPhrase(value);
    }
  };

  return (
    <>
      <FlowContainer>
        <>
          <div className="w-full flex flex-row items-center justify-between">
            <Heading>Set Seed Phrase</Heading>
          </div>
          <SubText>Set the seed phrase this RegTest wallet will use </SubText>
          <FlowForm
            nameKey="seedPhrase"
            type="text"
            initialValue={bridgeSeedPhrase}
            placeholder="Enter string to use as seed phrase"
            handleSubmit={(value) => handleSubmit(value)}
          ></FlowForm>
        </>
      </FlowContainer>
      <GenerateBechWallet key={bridgeSeedPhrase} />
    </>
  );
};

export const SetBitcoinDUrl = () => {
  const [bitcoinDaemonUrl, setBitcoinDaemonUrl] = useAtom(bitcoinDaemonUrlAtom);

  const handleSubmit = (value: string | undefined) => {
    if (value) {
      // set value to local storage

      setBitcoinDaemonUrl(value);
    }
  };

  return (
    <>
      <FlowContainer>
        <>
          <div className="w-full flex flex-row items-center justify-between">
            <Heading>Set Bitcoin Dameon Url </Heading>
          </div>
          <SubText>Set the RPC url: {bitcoinDaemonUrl} </SubText>
          <FlowForm
            nameKey="rpcUrl"
            type="text"
            initialValue={bitcoinDaemonUrl}
            placeholder="Enter string to use as rpc url"
            handleSubmit={(value) => handleSubmit(value)}
          ></FlowForm>
        </>
      </FlowContainer>
    </>
  );
};

export const SetEmilyUrl = () => {
  const [emilyUrl, setEmilyUrl] = useAtom(emilyUrlAtom);

  const handleSubmit = (value: string | undefined) => {
    if (value) {
      // set value to local storage

      setEmilyUrl(value);
    }
  };

  return (
    <>
      <FlowContainer>
        <>
          <div className="w-full flex flex-row items-center justify-between">
            <Heading>Set Emily API Url </Heading>
          </div>
          <SubText>Set the Emily url: {emilyUrl} </SubText>
          <FlowForm
            nameKey="rpcUrl"
            type="text"
            initialValue={emilyUrl}
            placeholder="Enter string to use as rpc url"
            handleSubmit={(value) => handleSubmit(value)}
          ></FlowForm>
        </>
      </FlowContainer>
    </>
  );
};

type SetSignerPubkeyProps = {};
export const SetSignerPubkey = () => {
  const [signerPubKey, setSignerPubkey] = useAtom(signerPubKeyAtom);

  const handleSubmit = (value: string | undefined) => {
    if (value) {
      // set value to local storage
      setSignerPubkey(value);
    }
  };

  return (
    <>
      <FlowContainer>
        <>
          <div className="w-full flex flex-row items-center justify-between">
            <Heading>Set Signer Pub Key</Heading>
          </div>
          <SubText>Signer PubKey {signerPubKey} </SubText>
          <FlowForm
            nameKey="SignerPubKey"
            type="text"
            initialValue={signerPubKey}
            placeholder="Enter the signer public key"
            handleSubmit={(value) => handleSubmit(value)}
          ></FlowForm>
        </>
      </FlowContainer>
    </>
  );
};

export const MaxFeeAmountView = () => {
  const [maxFee, setMaxFee] = useAtom(depositMaxFeeAtom);

  const handleSubmit = (value: string | undefined) => {
    if (value) {
      // set value to local storage
      // ensure that the value is a number
      setMaxFee(parseInt(value));
    }
  };

  return (
    <>
      <FlowContainer>
        <>
          <div className="w-full flex flex-row items-center justify-between">
            <Heading>Deposit Max Fee</Heading>
          </div>
          <SubText>Max Fee {maxFee} </SubText>
          <FlowForm
            nameKey="maxFee"
            type="text"
            initialValue={maxFee + ""}
            placeholder="Enter the Max Fee"
            handleSubmit={(value) => handleSubmit(value)}
          ></FlowForm>
        </>
      </FlowContainer>
    </>
  );
};

const GenerateBechWallet = () => {
  const bridgeSeedPhrase = useAtomValue(bridgeSeedPhraseAtom);
  const [bridgeAddress, setBridgeAddress] = useAtom(bridgeAddressAtom);

  const handleSubmit = () => {
    // set value to local storage

    if (bridgeSeedPhrase) {
      const p2wsh = getP2WSH(bridgeSeedPhrase);

      if (p2wsh) {
        setBridgeAddress(p2wsh.address as any);
        // set value to local storage to fetch later
      }
    } else {
      // window alert

      window.alert("Please set the seed phrase first");
    }
  };

  return (
    <FlowContainer>
      <>
        <div className="w-full flex flex-row items-center justify-between">
          <Heading>Generate Address from Seed</Heading>
        </div>
        <SubText>Seed Phrase: {bridgeSeedPhrase} </SubText>
        {bridgeAddress !== "" && <SubText>Address : {bridgeAddress} </SubText>}
        <div className="flex-1" />
        <div className="w-full flex-row flex justify-between items-center">
          <PrimaryButton onClick={() => handleSubmit()}>GENERATE</PrimaryButton>
        </div>
      </>
    </FlowContainer>
  );
};

/*
  basic structure of a flow step
  1) heading with sometime a action item to the right of the heading
  2) subtext to give context to the user with the possibility of tags
  3) form to collect data or the final step which is usually reviewing all data before submitting (or even revewing post submission)
  4) buttons to navigate between steps
*/
type DepositFlowStepProps = {
  setStep: (step: DEPOSIT_STEP) => void;
};

type DepositFlowAmountProps = DepositFlowStepProps & {
  setAmount: (amount: number) => void;
};
const DepositFlowAmount = ({ setStep, setAmount }: DepositFlowAmountProps) => {
  const handleSubmit = (value: string | undefined) => {
    if (value) {
      setAmount(parseInt(value));
      setStep(DEPOSIT_STEP.ADDRESS);
    }
  };
  return (
    <FlowContainer>
      <>
        <div className="w-full flex flex-row items-center justify-between">
          <Heading>Deposit</Heading>
        </div>
        <SubText>Convert BTC into sBTC</SubText>
        <FlowForm
          nameKey="amount"
          type="number"
          placeholder="BTC amount to transfer (in sats)"
          handleSubmit={(value) => handleSubmit(value)}
        ></FlowForm>
      </>
    </FlowContainer>
  );
};

type DepositFlowAddressProps = DepositFlowStepProps & {
  setStxAddress: (address: string) => void;
};

const DepositFlowAddress = ({
  setStep,
  setStxAddress,
}: DepositFlowAddressProps) => {
  const stacksNetwork = useAtomValue(envAtom);

  const { notify } = useNotifications();
  const validateStxAddress = (address: string) => {
    // validate the address

    try {
      // check length
      if (address.length < 38 || address.length > 41) {
        return false;
      }

      const MAINNET_PREFIX = ["SP", "SM"];
      const TESTNET_PREFIX = ["ST", "SN"];
      const validPrefix =
        stacksNetwork === ENV.MAINNET ? MAINNET_PREFIX : TESTNET_PREFIX;

      if (!validPrefix.some((prefix) => address.startsWith(prefix))) {
        return false;
      }

      // check if valid for network
      createAddress(address);

      return true;
    } catch (err) {
      return false;
    }
  };
  const handleSubmit = (value: string | undefined) => {
    if (value) {
      // ensure that the value is a valid stacks address based on the network and length
      if (validateStxAddress(value)) {
        setStxAddress(value);
        setStep(DEPOSIT_STEP.CONFIRM);
      } else {
        notify({
          type: NotificationStatusType.ERROR,
          message: `Invalid Stacks Address`,
        });
      }
    }
  };
  return (
    <FlowContainer>
      <>
        <div className="w-full flex flex-row items-center justify-between">
          <Heading>Deposit</Heading>
        </div>
        <SubText>Amount selected to transfer</SubText>
        <FlowForm
          nameKey="address"
          type="text"
          placeholder="Enter Stacks address to transfer to"
          handleSubmit={(value) => handleSubmit(value)}
        >
          <SecondaryButton
            onClick={() => setStep(DEPOSIT_STEP.AMOUNT)}
            isValid={true}
          >
            PREV
          </SecondaryButton>
        </FlowForm>
      </>
    </FlowContainer>
  );
};

type DepositFlowConfirmProps = DepositFlowStepProps & {
  amount: number;
  stxAddress: string;
  handleUpdatingTransactionInfo: (info: TransactionInfo) => void;
};

type EmilyDepositCreationType = {
  bitcoinTxid: string;
  bitcoinTxOutputIndex: number;
  reclaimScript: string;
  depositScript: string;
};

const DepositFlowConfirm = ({
  setStep,
  amount,
  stxAddress,
  handleUpdatingTransactionInfo,
}: DepositFlowConfirmProps) => {
  const bridgeSeedPhrase = useAtomValue(bridgeSeedPhraseAtom);
  const bridgeAddress = useAtomValue(bridgeAddressAtom);
  const { notify } = useNotifications();
  const signerPubKey = process.env.NEXT_PUBLIC_SIGNER_AGGREGATE_KEY || "";

  const emilyUrl = useAtomValue(emilyUrlAtom);

  const maxFee = useAtomValue(depositMaxFeeAtom);

  const userData = useAtomValue(userDataAtom);

  const handleNextClick = async () => {
    try {
      if (userData === null) {
        throw new Error("User data is not set");
      }
      console.log("DepositFlowConfirm - handle next step");
      console.log("createPTRAddress", createDepositTx);

      // serialize the stx address
      const [version, hash] = c32addressDecode(stxAddress);
      // Convert the version to a 1-byte Uint8Array
      const versionArray = new Uint8Array([version]);

      // Convert the public key hash (hex string) to Uint8Array
      const hashArray = Uint8Array.from(Buffer.from(hash, "hex"));

      // Combine the version and hash into a single Uint8Array
      const serializedAddress = new Uint8Array(
        1 + versionArray.length + hashArray.length,
      );
      serializedAddress.set(hexToUint8Array("0x05"), 0);
      serializedAddress.set(versionArray, 1);
      serializedAddress.set(hashArray, 1 + versionArray.length);

      console.log("serializedAddress", serializedAddress);
      console.log(
        "serializedAddressHex",
        uint8ArrayToHexString(serializedAddress),
      );
      const lockTime = 6000;

      const senderSeedPhrase = bridgeSeedPhrase;

      // Create the reclaim script and convert to Buffer
      const reclaimScript = Buffer.from(
        createReclaimScript(lockTime, new Uint8Array([])),
      );

      const reclaimScriptHex = uint8ArrayToHexString(reclaimScript);
      console.log("reclaimScriptHex", reclaimScriptHex);

      const signerUint8Array = hexToUint8Array(signerPubKey);

      const depositScript = Buffer.from(
        createDepositScript(signerUint8Array, maxFee, serializedAddress),
      );
      // convert buffer to hex
      const depositScriptHexPreHash = uint8ArrayToHexString(depositScript);
      const p2trAddress = createDepositAddress(
        serializedAddress,
        signerPubKey,
        maxFee,
        lockTime,
      );

      /*
      const txHex = await createDepositTx(
        serializedAddress,
        senderSeedPhrase,
        signerPubKey,
        amount,
        maxFee,
        lockTime
      );
      */

      // check the wallet provider from user data
      let txId = "";
      let txHex = "";

      if (
        userData.profile.walletProvider === "hiro-wallet" ||
        userData.profile.walletProvider === "leather"
      ) {
        console.log("leahter send walelt info");
        console.log("amount", amount);
        console.log("p2trAddress", p2trAddress);
        console.log(window.LeatherProvider);

        const sendParams = {
          recipients: [
            {
              address: p2trAddress,
              amount: `${amount}`,
            },
          ],
          network: process.env.NEXT_PUBLIC_WALLET_NETWORK || "sbtcTestnet",
        };
        console.log("send params", sendParams);
        const response = await window.LeatherProvider?.request(
          "sendTransfer",
          sendParams,
        );

        console.log("response", response);
        if (response && response.result) {
          const _txId = response.result.txid.replace(/^"|"$/g, ""); // Remove leading and trailing quotes
          txId = _txId;
        }
      } else if (userData.profile.walletProvider === "xverse") {
        // get the txId from the xverse wallet
        if (!window.XverseProviders) {
          throw new Error("XverseProviders not found");
        }
        const response = await window.XverseProviders.request("sendTransfer", {
          recipients: [
            {
              address: p2trAddress,
              amount: Number(amount),
            },
          ],
        });
        if (response.status === "success") {
          // handle success
          txId = response.txId;
        } else {
          // handle error
          notify({
            type: NotificationStatusType.ERROR,
            message: `Issue with Transaction`,
          });

          throw new Error("Error with the transaction");
        }
      } else {
        throw new Error("Wallet provider not supported");
      }

      console.log("testThing", txHex);
      if (txId === "") {
        notify({
          type: NotificationStatusType.ERROR,
          message: `Issue with Transaction`,
        });

        throw new Error("Error with the transaction");
      }

      console.log("txId", txId);
      const emilyReqPayload = {
        bitcoinTxid: txId,
        bitcoinTxOutputIndex: 0,
        reclaimScript: reclaimScriptHex,
        depositScript: depositScriptHexPreHash,
        url: emilyUrl,
      };

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
        message: `Successful Deposit request`,
      });
      setStep(DEPOSIT_STEP.REVIEW);
      handleUpdatingTransactionInfo({
        hex: txHex,
        txId: txId,
      });
    } catch (error) {
      console.log("error", error);
    } finally {
    }
  };
  const handlePrevClick = () => {
    setStep(DEPOSIT_STEP.ADDRESS);
  };

  return (
    <FlowContainer>
      <>
        <div className="w-full flex flex-row items-center justify-between">
          <Heading>Deposit</Heading>
        </div>
        <div className="flex flex-col  gap-2">
          <div className="flex flex-col gap-1">
            <SubText>Amount selected to Transfer</SubText>
            <p className="text-black font-Matter font-semibold text-sm">
              {amount} sats
            </p>
          </div>
          <div className="flex flex-col gap-1">
            <SubText>Stacks address to transfer to</SubText>
            <p className="text-black font-Matter font-semibold text-sm">
              {useShortAddress(stxAddress)}
            </p>
          </div>
        </div>
        <div className="flex flex-1 ">
          <div className="w-full p-4 bg-lightOrange h-10 rounded-lg flex flex-row items-center justify-center gap-2">
            <InformationCircleIcon className="h-6 w-6 text-orange" />
            <p className="text-orange font-Matter font-semibold text-sm break-keep">
              Please verify the information before proceeding
            </p>
          </div>
        </div>
        <div className="w-full flex-row flex justify-between items-center">
          <SecondaryButton onClick={() => handlePrevClick()}>
            PREV
          </SecondaryButton>
          <PrimaryButton onClick={() => handleNextClick()}>NEXT</PrimaryButton>
        </div>
      </>
    </FlowContainer>
  );
};

type TransactionInfo = {
  hex: string;
  txId: string;
};
type DepositFlowReviewProps = DepositFlowStepProps & {
  transactionInfo: TransactionInfo;
  amount: number;
  stxAddress: string;
};

const DepositFlowReview = ({
  setStep,
  transactionInfo,
  amount,
  stxAddress,
}: DepositFlowReviewProps) => {
  const router = useRouter();

  console.log("transactionInfo", transactionInfo);
  const handleNextClick = () => {
    // open a new tab with this link https://www.bitscript.app/transactions?transaction=020000000001019aa9ec88a9a964451673b2e7d0ac0f9309b7acb8e6b87d6a1215d2f3e5de2dde0000000000ffffffff010200000000000000225120fb32fece50b22877384d8e0a242ebc7a12603a7f937839f7c136ebe6af8b0be302483045022100a2ab485e3ca3100f80460bb8bea191edb39487656a3470f1a4a6fe5e51842fed02201e831e1990f9c6c8a8c1b0d51104391f46a5c4f5a7fbfeaf9ec4b7c3c0d2bed3012102fc8961e2839d574c7c23f3c177825dcdc230745be96db02237431e17307832e100000000&env=MAINNET
    console.log("DepositFlowReview - handle next step");

    var urlLink = `https://www.bitscript.app/transactions?transaction=${transactionInfo.hex}&env=TESTNET`;
    window.open(urlLink, "_blank");
  };

  const handleTxStatusClick = () => {
    // go to status?txid=transactionInfo.txId
    router.push(`/status?txId=${transactionInfo.txId}`);
  };

  const depositStatus = useDepositStatus(transactionInfo.txId);
  return (
    <FlowContainer>
      <>
        <div className="w-full flex flex-row items-center justify-between">
          <Heading>Review Transaction</Heading>
        </div>
        <div className="flex flex-col  gap-2">
          <div className="flex flex-col gap-1">
            <SubText>Amount selected to Transfer</SubText>
            <p className="text-black font-Matter font-semibold text-sm">
              {amount} sats
            </p>
          </div>
          <div className="flex flex-col gap-1">
            <SubText>Stacks address to transfer to</SubText>
            <p className="text-black font-Matter font-semibold text-sm">
              {useShortAddress(stxAddress)}
            </p>
          </div>
        </div>
        <div className="flex flex-1 items-end">
          {depositStatus === DepositStatus.PendingConfirmation && (
            <InfoAlert>Processing your bitcoin transfer...</InfoAlert>
          )}
          {depositStatus === DepositStatus.PendingMint && (
            <div className="flex flex-col gap-3">
              <SuccessAlert>Bitcoin transfer successful!</SuccessAlert>
              <InfoAlert>Your sBTC tokens are being minted...</InfoAlert>
            </div>
          )}
          {depositStatus === DepositStatus.Completed && (
            <SuccessAlert>sBTC minted successfully!</SuccessAlert>
          )}
        </div>

        {/* <div className="w-full flex-row flex justify-between items-center">
          <PrimaryButton onClick={() => handleNextClick()}>
            VIEW TX INFO
          </PrimaryButton>
          <PrimaryButton onClick={() => handleTxStatusClick()}>
            VIEW STATUS
          </PrimaryButton>
        </div> */}
      </>
    </FlowContainer>
  );
};

const DepositFlow = () => {
  const [step, setStep] = useState(DEPOSIT_STEP.AMOUNT);

  const [stxAddress, _setStxAddress] = useState("");
  const [amount, _setAmount] = useState(0);
  const [transactionInfo, setTransactionInfo] = useState<TransactionInfo>({
    hex: "",
    txId: "",
  });

  console.log("step", step);
  const handleUpdateStep = (newStep: DEPOSIT_STEP) => {
    console.log("newstep", newStep);
    setStep(newStep);
  };

  const setStxAddress = (address: string) => {
    _setStxAddress(address);
  };

  const setAmount = (amount: number) => {
    _setAmount(amount);
  };

  const handleUpdatingTransactionInfo = (info: TransactionInfo) => {
    setTransactionInfo(info);
  };
  const renderStep = () => {
    switch (step) {
      case DEPOSIT_STEP.AMOUNT:
        return (
          <DepositFlowAmount setAmount={setAmount} setStep={handleUpdateStep} />
        );
      case DEPOSIT_STEP.ADDRESS:
        return (
          <DepositFlowAddress
            setStxAddress={setStxAddress}
            setStep={handleUpdateStep}
          />
        );
      case DEPOSIT_STEP.CONFIRM:
        return (
          <DepositFlowConfirm
            setStep={handleUpdateStep}
            amount={amount}
            stxAddress={stxAddress}
            handleUpdatingTransactionInfo={handleUpdatingTransactionInfo}
          />
        );
      case DEPOSIT_STEP.REVIEW:
        return (
          <DepositFlowReview
            transactionInfo={transactionInfo}
            amount={amount}
            stxAddress={stxAddress}
            setStep={handleUpdateStep}
          />
        );
      default:
        return <div> Something went wrong</div>;
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

export default DepositFlow;

enum DENOMINATIONS {
  SATS = "SATS",
  BTC = "BTC",
  USD = "USD",
}

const DepositAmount = () => {
  const [value, setValue] = useState("");
  const [isValid, setIsValid] = useState(false);

  const [selectedDenomination, setSelectedDenomination] =
    useState<DENOMINATIONS>(DENOMINATIONS.BTC);

  useEffect(() => {
    if (value !== "" && !value.endsWith("BTC")) {
      setValue(`${value} BTC`);
    }
  }, [value]);
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    const btcRegex = /^[0-9]+(\.[0-9]{1,8})? BTC$/;

    let inputValue = event.target.value.replace(/ BTC$/, ""); // Remove existing " BTC"
    // ensure that the user can add numbers past "btc"
    inputValue = inputValue.replace(/[^0-9.]/g, "");

    setIsValid(validateInput(inputValue));
    setValue(inputValue);
  };

  const validateInput = (input: string) => {
    // Add your validation logic here
    return input.length > 0;
  };

  return (
    <>
      <div className="flex flex-1 px-8 p-6 flex-col ">
        <div className="w-full flex flex-row items-center justify-between">
          <h1 className="text-2xl font-Matter font-normal">Deposit</h1>
          <Menu as="div" className="relative inline-block text-left ">
            <MenuButton className="w-24 flex flex-row justify-center items-center h-8 text-sm rounded-2xl  gap-x-1.5  ring-inset ring-gray-300 hover:bg-gray-50 bg-sand">
              {selectedDenomination}
              <ChevronDownIcon
                aria-hidden="true"
                className="-mr-1 h-5 w-5 text-gray-400"
              />
            </MenuButton>
            <MenuItems
              transition
              className="absolute right-0 z-10 mt-2 w-32 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 transition focus:outline-none data-[closed]:scale-95 data-[closed]:transform data-[closed]:opacity-0 data-[enter]:duration-100 data-[leave]:duration-75 data-[enter]:ease-out data-[leave]:ease-in"
            >
              <p
                onClick={() => setSelectedDenomination(DENOMINATIONS.SATS)}
                className="block px-4 py-2 text-sm text-gray-700 data-[focus]:bg-gray-100 data-[focus]:text-gray-900"
              >
                SATS
              </p>
              <p
                onClick={() => setSelectedDenomination(DENOMINATIONS.BTC)}
                className="block px-4 py-2 text-sm text-gray-700 data-[focus]:bg-gray-100 data-[focus]:text-gray-900"
              >
                BTC
              </p>
              <p
                onClick={() => setSelectedDenomination(DENOMINATIONS.USD)}
                className="block px-4 py-2 text-sm text-gray-700 data-[focus]:bg-gray-100 data-[focus]:text-gray-900"
              >
                USD
              </p>
            </MenuItems>
          </Menu>
        </div>
        <p className="text-darkGray font-Matter font-thin text-sm">
          Convert BTC into sBTC
        </p>
        <div className="w-full flex mt-16 flex-col gap-14 justify-start ">
          <div className="relative ">
            <input
              type="text"
              placeholder="Enter BTC amount to transfer"
              value={value}
              onChange={handleChange}
              className={`w-full py-2 border-b-2 bg-transparent text-2xl text-black focus:outline-none placeholder-gray-300 ${
                isValid ? "border-orange" : "border-midGray"
              } transition-colors duration-500`}
            />
          </div>
          <button className="w-52 rounded-lg py-3 flex justify-center items-center flex-row bg-orange">
            <p
              className={classNames(
                " text-lg tracking-wider font-Matter font-semibold",
                isValid ? "text-black" : "text-black",
              )}
            >
              NEXT
            </p>
          </button>
        </div>
      </div>
      <div
        style={{
          backgroundColor: "rgba(253, 157, 65, 0.1)",
          height: "320px",
          width: "320px",
        }}
        className="flex flex-col items-center justify-center"
      >
        <Image
          src="/images/StacksBitcoin.svg"
          alt="Icon"
          width={150}
          height={150}
        />
      </div>
    </>
  );
};
