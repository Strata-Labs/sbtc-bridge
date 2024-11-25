import Image from "next/image";
import Link from "next/link";
import { AppConfig, UserSession } from "@stacks/connect";
import { useEffect, useState } from "react";

import { STACKS_MAINNET, STACKS_TESTNET } from "@stacks/network";

const appConfig = new AppConfig(["store_write"]);
const userSession = new UserSession({ appConfig });
import { AnimatePresence } from "framer-motion";

import { useAtom, useAtomValue, useSetAtom } from "jotai";
import {
  isConnectedAtom,
  showConnectWalletAtom,
  signerPubKeyAtom,
  STACKS_ENV,
  stacksEnvAtom,
  userDataAtom,
  walletAddressAtom,
} from "@/util/atoms";

import ConnectWallet from "./ConnectWallet";
import { useWallet } from "@/util/WalletContext";
import readOnlyHelper from "@/util/readOnlyHelper";
import { hexToUint8Array, uint8ArrayToHexString } from "@/util/regtest/wallet";

const Header = () => {
  const [userData, setUserData] = useAtom(userDataAtom);
  const [walletAddress, setWalletAddress] = useAtom(walletAddressAtom);
  const stacksEnv = useAtomValue(stacksEnvAtom);

  const setSignerPubkey = useSetAtom(signerPubKeyAtom);

  const { handleSignOut } = useWallet();

  const [showConnectWallet, setShowConnectWallet] = useAtom(
    showConnectWalletAtom
  );

  const [isConnected, setIsConnected] = useAtom(isConnectedAtom);

  // useEffect ot check if user is signed in

  useEffect(() => {
    if (userSession.isUserSignedIn()) {
      const userData = userSession.loadUserData();
      console.log("userData", userData);

      let stxWalletAddress = "";
      if (stacksEnv === STACKS_ENV.TESTNET) {
        // check what wallet provider
        if (
          userData.profile.walletProvider === "leather" ||
          userData.profile.walletProvider === "hiro"
        ) {
          stxWalletAddress = userData.profile.stxAddress.testnet;
        }
      }

      if (stxWalletAddress) {
        setUserData(userData);
        setIsConnected(true);
        setWalletAddress(stxWalletAddress);
      } else {
        // show notification something went wrong getting wallet address
      }
    }
  }, []);

  useEffect(() => {
    if (isConnected && walletAddress) {
      fetchSignerAggregateAddress();
    }
  }, [isConnected, walletAddress]);

  const fetchSignerAggregateAddress = async () => {
    try {
      console.log("process.env", process.env);
      const stacksNetwork =
        stacksEnv === STACKS_ENV.TESTNET ? STACKS_TESTNET : STACKS_MAINNET;
      const readOnlyHelperRes = await readOnlyHelper({
        stacksNetwork: stacksNetwork,
        walletAddress: walletAddress || "",
        functionName: "get-current-aggregate-pubkey",
      });

      const uint8FormatRes = hexToUint8Array(readOnlyHelperRes);

      console.log("uint8FormatRes", uint8FormatRes);

      // remove the first byte of test

      const xOnlyuInt = uint8FormatRes.slice(1);

      console.log("xOnlyuInt", xOnlyuInt);

      // convert uint8array to hex
      const xOnlyHex = uint8ArrayToHexString(xOnlyuInt);

      console.log("xOnlyHex", xOnlyHex);

      setSignerPubkey(xOnlyHex);
    } catch (err) {
      console.error(err);
    }
  };

  const renderUserWalletInfo = () => {
    return (
      <button
        onClick={() => handleSignOut()}
        className="   px-4 py-2 rounded-md border-2 border-orange"
      >
        <h3 className="font-Matter text-xs text-orange font-semibold	 tracking-wide">
          DISCONNECT WALLET
        </h3>
      </button>
    );
  };
  return (
    <>
      {process.env.NODE_ENV !== "production" && (
        <div className="w-screen bg-red-500 text-white text-center py-2">
          This is a testnet release
        </div>
      )}
      <header className="w-screen py-6 flex items-center justify-center">
        <div
          style={{
            maxWidth: "1200px",
          }}
          className="flex-1 px-4 flex-row flex items-center justify-between"
        >
          <Link href="/">
            <div className="">
              <Image
                src="/images/StacksNav.svg"
                alt="Stacks Logo"
                width={100}
                height={100}
              />
            </div>
          </Link>
          <div className="flex flex-row gap-10 items-center">
            {/* <h5 className="font-Matter text-xs text-black tracking-wide ">
              LEARN MORE
            </h5>
            <h4 className="font-Matter text-xs text-black tracking-wide ">
              HISTORY
            </h4> */}
            {isConnected ? (
              renderUserWalletInfo()
            ) : (
              <button
                onClick={() => setShowConnectWallet(true)}
                className=" bg-orange  px-4 py-2 rounded-md"
              >
                <h3 className="font-Matter text-xs font-semibold	 tracking-wide">
                  CONNECT WALLET
                </h3>
              </button>
            )}
          </div>
        </div>
      </header>
      <AnimatePresence>
        {showConnectWallet && (
          <ConnectWallet onClose={() => setShowConnectWallet(false)} />
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;
