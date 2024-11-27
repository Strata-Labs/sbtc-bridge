"use client";
import { eventsAtom } from "@/util/atoms";
import { useSetAtom } from "jotai";
import { useState } from "react";
import { NotificationStatusType } from "./Notifications";
import { getHiroTestnetBtc } from "@/actions/get-testnet-btc";

export function GetTestnetBTC() {
  const [isLoading, setIsLoading] = useState(false);
  const setEvents = useSetAtom(eventsAtom);
  const notifyError = (message: string) => {
    setEvents([
      {
        id: "1",
        type: NotificationStatusType.ERROR,
        title: message,
      },
    ]);
  };

  const notifySuccess = (message: string) => {
    setEvents([
      {
        id: "1",
        type: NotificationStatusType.SUCCESS,
        title: message,
      },
    ]);
  };
  const getTestnetBtc = async () => {
    setIsLoading(true);
    let address = "";
    try {
      const res = await window.LeatherProvider?.request("getAddresses");
      const nativeSegwit = res?.result.addresses.find((address) => {
        return address.type === "p2wpkh";
      });

      if (!nativeSegwit) {
        return notifyError(`No native segwit address found`);
      }
      address = nativeSegwit.address;
    } catch (error) {
      setIsLoading(false);

      return notifyError(`Error getting address`);
    }
    try {
      await getHiroTestnetBtc(address);
      notifySuccess(`0.5 BTC has been sent to your wallet!`);
    } catch (error) {
      notifyError(`Error sending BTC`);
      setIsLoading(false);
    }

    // clear notifications after 5 seconds
    await new Promise((resolve) => setTimeout(resolve, 5000));
    setEvents([]);
  };

  return (
    <button
      disabled={isLoading}
      onClick={getTestnetBtc}
      className="bg-orange border-2 border-orange px-4 py-2 rounded-md font-Matter text-xs font-semibold tracking-wide uppercase disabled:opacity-50 disabled:cursor-not-allowed"
    >
      Get Testnet BTC
    </button>
  );
}
