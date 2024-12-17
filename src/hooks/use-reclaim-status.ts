import { getRawTransaction } from "@/actions/bitcoinClient";
import { useEffect, useState } from "react";

export enum ReclaimStatus {
  Pending = "pending",
  Completed = "completed",
  Failed = "failed",
}

export const useReclaimStatus = (txId: string) => {
  // we'll need to fetch this from the bitcoin rpc to get the current status of the tx
  const [reclaimStatus, setReclaimStatus] = useState<ReclaimStatus>(
    ReclaimStatus.Pending,
  );

  useEffect(() => {
    if (txId && reclaimStatus !== ReclaimStatus.Completed) {
      // fetch the status of the reclaim tx from the bitcoin rpc
      // and update the reclaimStatus

      const interval = setInterval(async () => {
        const reclaimTx = (await getRawTransaction(txId))!;
        let status = ReclaimStatus.Pending;

        if (reclaimTx.status.confirmed) {
          status = ReclaimStatus.Completed;
          clearInterval(interval);
        }

        setReclaimStatus(status);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [reclaimStatus, txId]);

  return reclaimStatus;
};
