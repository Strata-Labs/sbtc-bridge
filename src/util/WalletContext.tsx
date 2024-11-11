"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

import { AppConfig, UserSession, UserData } from "@stacks/connect";
import { AuthOptions } from "@stacks/connect-react";
import { useAtom } from "jotai";
import { isConnectedAtom, showConnectWalletAtom, userDataAtom } from "./atoms";

interface WalletContextProps {
  options: AuthOptions;
  handleWalletConnected: (address: string) => void;
  handleSignOut: () => void;
  userSession: UserSession;
}

const appConfig = new AppConfig(["store_write"]);
const userSession = new UserSession({ appConfig });

const WalletContext = createContext<WalletContextProps | undefined>(undefined);

const WalletContextProvider = ({ children }: { children: ReactNode }) => {
  const [isConnected, setIsConnected] = useAtom(isConnectedAtom);
  const [showConnectWallet, setShowConnectWallet] = useAtom(
    showConnectWalletAtom
  );
  const [userData, setUserData] = useAtom(userDataAtom);

  const handleSignOut = () => {
    userSession.signUserOut("/");
    setIsConnected(false);
    setUserData(null);
    //setWalletAddress("");
  };

  const authOptions: AuthOptions = {
    redirectTo: "/",
    userSession,
    onFinish: ({ userSession }) => {
      const userData = userSession.loadUserData();

      setIsConnected(true);
      setShowConnectWallet(false);
      setUserData(userData);
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
          //setWalletAddress(address);
        },
        handleSignOut,
        userSession,
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
