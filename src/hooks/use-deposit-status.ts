import { useEffect, useState } from "react";
import { useAtomValue } from "jotai";
import { getEmilyDepositInfo } from "@/util/tx-utils";
import { bridgeConfigAtom } from "@/util/atoms";
import {
  getCurrentBlockHeight,
  getRawTransaction,
} from "@/actions/bitcoinClient";

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
  const { EMILY_URL: emilyUrl, RECLAIM_LOCK_TIME } =
    useAtomValue(bridgeConfigAtom);

  useEffect(() => {
    if (
      txId &&
      transferTxStatus !== DepositStatus.Completed &&
      transferTxStatus !== DepositStatus.Failed
    ) {
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

  useEffect(() => {
    const check = async () => {
      const info = await getRawTransaction(txId);
      if (info.status.confirmed) {
        const currentBlockHeight = await getCurrentBlockHeight();
        const unlockBlock =
          Number(RECLAIM_LOCK_TIME || 144) + info.status.block_height;
        const isPastLockTime = currentBlockHeight > unlockBlock;
        if (isPastLockTime) {
          setTransferTxStatus(DepositStatus.Failed);
          clearInterval(interval);
        }
      }
    };
    check();
    const interval = setInterval(check, 5000);
    return () => clearInterval(interval);
  }, [RECLAIM_LOCK_TIME, txId]);

  return transferTxStatus;
}
