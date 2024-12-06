import * as bitcoin from "bitcoinjs-lib";

import { PsbtInput, TapLeafScript } from "bip174";
import { witnessStackToScriptWitness } from "bitcoinjs-lib/src/psbt/psbtutils";

export function buildLeafIndexFinalizer(
  tapLeafScript: TapLeafScript,
  leafIndex: number,
): (
  inputIndex: number,
  _input: PsbtInput,
  _tapLeafHashToFinalize?: Uint8Array,
) => {
  finalScriptWitness: Uint8Array | undefined;
} {
  return (
    inputIndex: number,
    _input: PsbtInput,
    _tapLeafHashToFinalize?: Uint8Array,
  ): {
    finalScriptWitness: Uint8Array | undefined;
  } => {
    try {
      const lockTimeEncoded = bitcoin.script.number.encode(2);

      const scriptSolution = [Uint8Array.from(lockTimeEncoded)];
      const witness = scriptSolution
        .concat(tapLeafScript.script)
        .concat(tapLeafScript.controlBlock);

      console.log("witness", witness);

      console.log("what is going on", witnessStackToScriptWitness(witness));

      return { finalScriptWitness: witnessStackToScriptWitness(witness) };
    } catch (err) {
      throw new Error(`Can not finalize taproot input #${inputIndex}: ${err}`);
    }
  };
}
