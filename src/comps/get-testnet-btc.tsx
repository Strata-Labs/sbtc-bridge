"use client";
import { walletInfoAtom } from "@/util/atoms";
import { useAtomValue } from "jotai";
import { useState } from "react";
import { NotificationStatusType } from "./Notifications";
import { getHiroTestnetBtc } from "@/actions/get-testnet-btc";
import { useNotifications } from "@/hooks/use-notifications";

export function GetTestnetBTC() {
  const [isLoading, setIsLoading] = useState(false);
  const { notify } = useNotifications();
  const { addresses } = useAtomValue(walletInfoAtom);
  const notifyError = (message: string) => {
    notify({
      type: NotificationStatusType.ERROR,
      message,
    });
  };

  const notifySuccess = (message: string) => {
    notify({
      type: NotificationStatusType.SUCCESS,
      message,
    });
  };
  const getTestnetBtc = async () => {
    setIsLoading(true);
    let address = "";
    try {
      if (!addresses.payment) {
        return notifyError(`No native segwit address found`);
      }
      address = addresses.payment.address;
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
