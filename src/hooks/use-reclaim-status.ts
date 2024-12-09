import { use, useEffect, useState } from "react";
import { useAtomValue } from "jotai";
import { getReclaimInfo } from "@/util/tx-utils";

export enum ReclaimStatus {
  Pending = "pending",
  Completed = "completed",
  Failed = "failed",
}

const MOCKED_RES = {
  txid: "d73b7725925c612a1bfbe3cffb19d1c64b350fafd41a81a154767490a3edb837",
  version: 2,
  locktime: 0,
  size: 235,
  weight: 610,
  fee: 513620,
  vin: [
    {
      is_coinbase: false,
      prevout: {
        value: 50000000,
        scriptpubkey: "0014f28f75173292d7bb702e6d89c51aa2c6edcc440a",
        scriptpubkey_address: "bcrt1q728h29ejjttmkupwdkyu2x4zcmkuc3q29gvwaa",
        scriptpubkey_asm:
          "OP_0 OP_PUSHBYTES_20 f28f75173292d7bb702e6d89c51aa2c6edcc440a",
        scriptpubkey_type: "v0_p2wpkh",
      },
      scriptsig: "",
      scriptsig_asm: "",
      sequence: 0,
      txid: "b6c463ade61ebb4fa1cd072606b169954f550ee98b3b76168cb0dc7998298177",
      vout: 0,
      witness: [
        "3045022100e5f4b21c770d9d267798523b7eadfe4cc08255855197a7ac7fb6b148ae8c60cf022041a39678f8705e05f6e8b062068e966484e4c9212b20d764db3dcfe1d385c06201",
        "03e70c4feef2699f3108124aff8faaca6ab911824c94c974694ebd98bacdf8700a",
      ],
      inner_redeemscript_asm: "",
      inner_witnessscript_asm: "",
    },
  ],
  vout: [
    {
      value: 1000000,
      scriptpubkey:
        "5120effe1ce285fc0a82ddf45220385eb4b3ac86743c7fbbd2aacc9847476a5f26b8",
      scriptpubkey_address:
        "bcrt1pallpec59ls9g9h052gsrsh45kwkgvapu07aa92kvnpr5w6jly6uq0rj85m",
      scriptpubkey_asm:
        "OP_PUSHNUM_1 OP_PUSHBYTES_32 effe1ce285fc0a82ddf45220385eb4b3ac86743c7fbbd2aacc9847476a5f26b8",
      scriptpubkey_type: "v1_p2tr",
    },
    {
      value: 48486380,
      scriptpubkey: "0014f28f75173292d7bb702e6d89c51aa2c6edcc440a",
      scriptpubkey_address: "bcrt1q728h29ejjttmkupwdkyu2x4zcmkuc3q29gvwaa",
      scriptpubkey_asm:
        "OP_0 OP_PUSHBYTES_20 f28f75173292d7bb702e6d89c51aa2c6edcc440a",
      scriptpubkey_type: "v0_p2wpkh",
    },
  ],
  status: {
    confirmed: true,
    block_height: 74997,
    block_hash:
      "08f2219ea0194b2dfe8780864730cc6f198b1dd562746955a63702026adb49a5",
    block_time: 1732914373,
  },
  order: 934866339,
  vsize: 153,
  adjustedVsize: 152.5,
  sigops: 1,
  feePerVsize: 3368,
  adjustedFeePerVsize: 3368,
  effectiveFeePerVsize: 3368,
};

export const useReclaimStatus = (txId: string) => {
  // we'll need to fetch this from the bitcoin rpc to get the current status of the tx
  const [reclaimStatus, setReclaimStatus] = useState<ReclaimStatus>(
    ReclaimStatus.Pending,
  );

  useEffect(() => {
    if (txId && reclaimStatus !== ReclaimStatus.Completed) {
      // fetch the status of the reclaim tx from the bitcoin rpc
      // and update the reclaimStatus
      // setReclaimStatus(ReclaimStatus.Completed);

      const interval = setInterval(async () => {
        const reclaimTx = await getReclaimInfo({
          reclaimTxId: txId,
        });

        let status = ReclaimStatus.Pending;
        if (reclaimTx.status.confirmed) {
          status = ReclaimStatus.Completed;
        }

        setReclaimStatus(status);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [txId]);

  return reclaimStatus;
};
