import {
  MaxFeeAmountView,
  SetBitcoinDUrl,
  SetEmilyUrl,
  SetSignerPubkey,
} from "./Deposit";

const DevEnvSettings = () => {
  return (
    <>
      <SetSignerPubkey />
      <SetBitcoinDUrl />
      <SetEmilyUrl />
      <MaxFeeAmountView />
    </>
  );
};

export default DevEnvSettings;
