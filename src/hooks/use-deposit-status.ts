import { useEffect, useState } from "react";
import { useAtomValue } from "jotai";
import { getEmilyDepositInfo } from "@/util/tx-utils";
import { bridgeConfigAtom } from "@/util/atoms";

export enum DepositStatus {
  PendingConfirmation = "pending",
  PendingMint = "accepted",
  Completed = "confirmed",
  Failed = "Failed",
}

export function useDepositStatus(txId: string) {
  const [transferTxStatus, setTransferTxStatus] = useState<DepositStatus>(
    DepositStatus.PendingConfirmation,
  );

  const { EMILY_URL: emilyUrl } = useAtomValue(bridgeConfigAtom);

  useEffect(() => {
    if (txId && transferTxStatus !== DepositStatus.Completed) {
      const interval = setInterval(async () => {
        const txInfo = await getEmilyDepositInfo({
          txId,
          emilyURL: emilyUrl!,
        });
        setTransferTxStatus(txInfo.status as DepositStatus);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [emilyUrl, transferTxStatus, txId]);

  return transferTxStatus;
}
