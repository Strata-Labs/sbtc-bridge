import { PsbtInput, TapLeafScript } from "bip174";
import { witnessStackToScriptWitness } from "bitcoinjs-lib/src/psbt/psbtutils";

export function buildLeafIndexFinalizer(
  tapLeafScript: TapLeafScript,
  leafIndex: number
): (
  inputIndex: number,
  _input: PsbtInput,
  _tapLeafHashToFinalize?: Uint8Array
) => {
  finalScriptWitness: Uint8Array | undefined;
} {
  return (
    inputIndex: number,
    _input: PsbtInput,
    _tapLeafHashToFinalize?: Uint8Array
  ): {
    finalScriptWitness: Uint8Array | undefined;
  } => {
    try {
      const scriptSolution = [
        Uint8Array.from([leafIndex]),
        Uint8Array.from([leafIndex]),
      ];
      const witness = scriptSolution
        .concat(tapLeafScript.script)
        .concat(tapLeafScript.controlBlock);
      return { finalScriptWitness: witnessStackToScriptWitness(witness) };
    } catch (err) {
      throw new Error(`Can not finalize taproot input #${inputIndex}: ${err}`);
    }
  };
}
