import { getProviderOrThrow } from "sats-connect";

const checkXverseProvider = async () => {
  try {
    await getProviderOrThrow();
    return true;
  } catch (e) {
    return false;
  }
};
export enum WalletType {
  xverse = "xverse",
  leather = "leather",
}
export const checkAvailableWallets: () => Promise<{
  [key in WalletType]: boolean;
}> = async () => {
  const isLeather = !!window.LeatherProvider;
  const isXverse = await checkXverseProvider();

  return {
    leather: isLeather,
    xverse: isXverse,
  };
};
