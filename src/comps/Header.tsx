import Image from "next/image";
import Link from "next/link";
import { AppConfig, UserSession } from "@stacks/connect";
import { useEffect } from "react";

const appConfig = new AppConfig(["store_write"]);
const userSession = new UserSession({ appConfig });
import { AnimatePresence } from "framer-motion";
import { useAtom, useSetAtom } from "jotai";
import {
  isConnectedAtom,
  showConnectWalletAtom,
  userDataAtom,
} from "@/util/atoms";

import ConnectWallet from "./ConnectWallet";
import { useWallet } from "@/util/WalletContext";
import { GetTestnetBTC } from "./get-testnet-btc";

// converting to lower case to avoid case sensitive issue
const isTestnet =
  process.env.NEXT_PUBLIC_WALLET_NETWORK?.toLowerCase() ===
  "sbtcTestnet".toLowerCase();

const Header = () => {
  const setUserData = useSetAtom(userDataAtom);

  const { handleSignOut } = useWallet();

  const [showConnectWallet, setShowConnectWallet] = useAtom(
    showConnectWalletAtom,
  );

  const [isConnected, setIsConnected] = useAtom(isConnectedAtom);
  useEffect(() => {
    if (userSession.isUserSignedIn()) {
      const userData = userSession.loadUserData();
      setUserData(userData);
      setIsConnected(true);
      // add event to show user connected
    }
  }, []);

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
      {process.env.NODE_ENV !== "production" && (
        <div className="w-screen bg-[#F26969] text-white text-center py-2">
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
