"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";

import { AnimatePresence } from "framer-motion";
import { useAtom } from "jotai";
import {
  bridgeConfigAtom,
  showConnectWalletAtom,
  walletInfoAtom,
} from "@/util/atoms";

import ConnectWallet from "./ConnectWallet";
import { GetTestnetBTC } from "./get-testnet-btc";
import { useAtomValue } from "jotai";
import { useNotifications } from "@/hooks/use-notifications";
import { NotificationStatusType } from "./Notifications";

// converting to lower case to avoid case sensitive issue

const Header = () => {
  const bridgeConfig = useAtomValue(bridgeConfigAtom);
  const isTestnet =
    bridgeConfig.WALLET_NETWORK?.toLowerCase() === "sbtcTestnet".toLowerCase();

  const { notify } = useNotifications();

  const [walletInfo, setWalletInfo] = useAtom(walletInfoAtom);
  const handleSignOut = () => {
    setWalletInfo({
      selectedWallet: null,
      addresses: {
        payment: null,
        taproot: null,
      },
    });
    notify({
      type: NotificationStatusType.SUCCESS,
      message: `Wallet disconnected`,
    });
  };
  const isConnected = useMemo(() => !!walletInfo.selectedWallet, [walletInfo]);
  const [showConnectWallet, setShowConnectWallet] = useAtom(
    showConnectWalletAtom,
  );

  const renderUserWalletInfo = () => {
    return (
      <>
        {isTestnet && <GetTestnetBTC />}
        <button
          onClick={() => handleSignOut()}
          className="px-4 py-2 rounded-md border-2 border-orange"
        >
          <h3 className="font-Matter text-xs text-orange font-semibold tracking-wide">
            DISCONNECT WALLET
          </h3>
        </button>
      </>
    );
  };
  return (
    <>
      {bridgeConfig.BANNER_CONTENT && (
        <div className="w-screen bg-[#F26969] text-white text-center py-2">
          {bridgeConfig.BANNER_CONTENT}
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
                <h3 className="font-Matter text-xs font-semibold tracking-wide">
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
