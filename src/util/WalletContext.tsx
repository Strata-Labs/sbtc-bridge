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
import { useAtom, useSetAtom } from "jotai";
import {
  eventsAtom,
  isConnectedAtom,
  showConnectWalletAtom,
  userDataAtom,
  walletAddressAtom,
} from "./atoms";
import { NotificationStatusType } from "@/comps/Notifications";

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

  const [events, setEvents] = useAtom(eventsAtom);

  const handleSignOut = () => {
    userSession.signUserOut();
    setIsConnected(false);
    setUserData(null);
    //setWalletAddress("");

    const _events = [...events];
    _events.push({
      id: _events.length + 1 + "",
      type: NotificationStatusType.SUCCESS,
      title: `Wallet disconnected`,
    });

    setEvents(_events);
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
      const _events = [...events];
      _events.push({
        id: _events.length + 1 + "",
        type: NotificationStatusType.SUCCESS,
        title: `Welcome to sBTC Bridge`,
      });

      setEvents(_events);
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
