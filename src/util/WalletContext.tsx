"use client";

import React, { createContext, useContext, ReactNode } from "react";

import { AppConfig, UserSession } from "@stacks/connect";
import { AuthOptions } from "@stacks/connect-react";
import { useSetAtom } from "jotai";
import {
  isConnectedAtom,
  showConnectWalletAtom,
  userDataAtom,
  walletAddressAtom,
} from "./atoms";
import { NotificationStatusType } from "@/comps/Notifications";
import { useNotifications } from "@/hooks/use-notifications";

interface WalletContextProps {
  options: AuthOptions;
  handleWalletConnected: (address: string) => void;
  handleSignOut: () => void;
}

const appConfig = new AppConfig(["store_write"]);
const userSession = new UserSession({ appConfig });

const WalletContext = createContext<WalletContextProps | undefined>(undefined);

const WalletContextProvider = ({ children }: { children: ReactNode }) => {
  const setIsConnected = useSetAtom(isConnectedAtom);
  const setShowConnectWallet = useSetAtom(showConnectWalletAtom);
  const setUserData = useSetAtom(userDataAtom);
  const setWalletAddress = useSetAtom(walletAddressAtom);

  const { notify } = useNotifications();

  const handleSignOut = () => {
    userSession.signUserOut();
    setIsConnected(false);
    setUserData(null);
    //setWalletAddress("");

    notify({
      type: NotificationStatusType.SUCCESS,
      message: `Wallet disconnected`,
    });
  };

  const authOptions: AuthOptions = {
    redirectTo: "/",
    userSession,
    onFinish: ({ userSession }) => {
      const userData = userSession.loadUserData();

      setIsConnected(true);
      setShowConnectWallet(false);
      setUserData(userData);

      // add event to show user connected

      notify({
        type: NotificationStatusType.SUCCESS,
        message: `Welcome to sBTC Bridge`,
      });
    },
    appDetails: {
      name: "sBTC Bridge",
      icon: "/StacksBitcoin.svg",
    },
  };

  return (
    <WalletContext.Provider
      value={{
        options: authOptions,
        handleWalletConnected: (address: string) => {
          setWalletAddress(address);
        },
        handleSignOut,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

const useWallet = () => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletContextProvider");
  }
  return context;
};

export { WalletContextProvider, useWallet };
