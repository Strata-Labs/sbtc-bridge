import {
  MaxFeeAmountView,
  SetBitcoinDUrl,
  SetEmilyUrl,
  SetSeedPhraseForDeposit,
  SetSignerPubkey,
} from "./Deposit";

const DevEnvSettings = () => {
  return (
    <>
      <SetSignerPubkey />
      {/* <SetSeedPhraseForDeposit /> */}
      <SetBitcoinDUrl />
      <SetEmilyUrl />
      <MaxFeeAmountView />
    </>
  );
};

export default DevEnvSettings;
