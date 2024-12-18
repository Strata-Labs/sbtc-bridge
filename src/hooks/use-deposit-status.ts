import { useEffect, useMemo, useState } from "react";
import { useAtomValue } from "jotai";
import { getEmilyDepositInfo } from "@/util/tx-utils";
import { bridgeConfigAtom } from "@/util/atoms";
import {
  getCurrentBlockHeight,
  getRawTransaction,
  getTxRbf,
} from "@/actions/bitcoinClient";
import { Cl, PrincipalCV } from "@stacks/transactions";
import { useRouter } from "next/navigation";
import { useEmilyDeposit } from "@/util/use-emily-deposit";

export enum DepositStatus {
  PendingConfirmation = "pending",
  PendingMint = "accepted",
  Completed = "confirmed",
  Failed = "Failed",
}

export function useDepositStatus(txId: string) {
  const router = useRouter();
  const { notifyEmily } = useEmilyDeposit();
  const [transferTxStatus, setTransferTxStatus] = useState<DepositStatus>(
    DepositStatus.PendingConfirmation,
  );
  const [emilyResponse, setEmilyResponse] = useState<Awaited<
    ReturnType<typeof getEmilyDepositInfo>
  > | null>(null);
  const [statusResponse, setStatusResponse] = useState<Awaited<
    ReturnType<typeof getRawTransaction>
  > | null>(null);

  const { EMILY_URL: emilyUrl, RECLAIM_LOCK_TIME } =
    useAtomValue(bridgeConfigAtom);

  const recipient = useMemo(() => {
    return emilyResponse?.recipient || "";
  }, [emilyResponse]);

  const stacksTxId = useMemo(() => {
    return (
      (emilyResponse?.status === DepositStatus.Completed &&
        emilyResponse.fulfillment.StacksTxid) ||
      ""
    );
  }, [emilyResponse]);

  useEffect(() => {
    if (
      txId &&
      transferTxStatus !== DepositStatus.Completed &&
      transferTxStatus !== DepositStatus.Failed
    ) {
      const check = async () => {
        const info = await getRawTransaction(txId);
        const txInfo = await getEmilyDepositInfo({
          txId,
          emilyURL: emilyUrl!,
        });
        if (!info) {
          const rbf = await getTxRbf(txId);
          const rbfTxId = (rbf as any).replacements.tx.txid;

          const emilyReqPayload = {
            bitcoinTxid: rbfTxId as string,
            bitcoinTxOutputIndex: 0,
            reclaimScript: txInfo.reclaimScript,
            depositScript: txInfo.depositScript,
          };
          await notifyEmily(emilyReqPayload);
          return router.push(`/?txId=${rbfTxId}&step=3`);
        }
        setStatusResponse(info);
        if (info.status.confirmed) {
          setEmilyResponse(txInfo);

          if (txInfo.status === DepositStatus.Completed) {
            setTransferTxStatus(DepositStatus.Completed);
            clearInterval(interval);
            return;
          }
          const currentBlockHeight = await getCurrentBlockHeight();
          const unlockBlock =
            Number(RECLAIM_LOCK_TIME || 144) + info.status.block_height - 1;
          const isPastLockTime = currentBlockHeight >= unlockBlock;
          if (isPastLockTime) {
            setTransferTxStatus(DepositStatus.Failed);
            clearInterval(interval);
            return;
          }

          setTransferTxStatus(txInfo.status as DepositStatus);
        }
      };
      check();
      const interval = setInterval(check, 5000);
      return () => clearInterval(interval);
    }
  }, [
    RECLAIM_LOCK_TIME,
    emilyUrl,
    notifyEmily,
    router,
    transferTxStatus,
    txId,
  ]);

  return {
    status: transferTxStatus,
    recipient: recipient && (Cl.deserialize(recipient) as PrincipalCV).value,
    stacksTxId: stacksTxId,
    statusResponse,
  };
}
