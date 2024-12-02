import { PsbtInput, TapLeafScript } from "bip174";
import { witnessStackToScriptWitness } from "bitcoinjs-lib/src/psbt/psbtutils";

export function buildLeafIndexFinalizer(
  tapLeafScript: TapLeafScript,
<<<<<<< HEAD
  leafIndex: number,
): (
  inputIndex: number,
  _input: PsbtInput,
  _tapLeafHashToFinalize?: Uint8Array,
=======
  leafIndex: number
): (
  inputIndex: number,
  _input: PsbtInput,
  _tapLeafHashToFinalize?: Uint8Array
>>>>>>> d36b4bc (feat - reclaim script built and being accepted by mempool)
) => {
  finalScriptWitness: Uint8Array | undefined;
} {
  return (
    inputIndex: number,
    _input: PsbtInput,
<<<<<<< HEAD
    _tapLeafHashToFinalize?: Uint8Array,
=======
    _tapLeafHashToFinalize?: Uint8Array
>>>>>>> d36b4bc (feat - reclaim script built and being accepted by mempool)
  ): {
    finalScriptWitness: Uint8Array | undefined;
  } => {
    try {
<<<<<<< HEAD
      const scriptSolution: any = [];
      const witness = scriptSolution
        .concat(tapLeafScript.script)
        .concat(tapLeafScript.controlBlock);

      console.log("witness", witness);

      console.log("what is going on", witnessStackToScriptWitness(witness));

=======
      const scriptSolution = [
        Uint8Array.from([leafIndex]),
        Uint8Array.from([leafIndex]),
      ];
      const witness = scriptSolution
        .concat(tapLeafScript.script)
        .concat(tapLeafScript.controlBlock);
>>>>>>> d36b4bc (feat - reclaim script built and being accepted by mempool)
      return { finalScriptWitness: witnessStackToScriptWitness(witness) };
    } catch (err) {
      throw new Error(`Can not finalize taproot input #${inputIndex}: ${err}`);
    }
  };
}
