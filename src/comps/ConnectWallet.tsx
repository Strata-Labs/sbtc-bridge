import { motion } from "framer-motion";
import { Heading, SubText } from "./core/Heading";
import Image from "next/image";
import { ArrowRightIcon } from "@heroicons/react/20/solid";
import { bridgeConfigAtom, walletInfoAtom, WalletProvider } from "@/util/atoms";
import {
  checkAvailableWallets,
  getAddressesLeather,
  getAddressesXverse,
} from "@/util/wallet-utils";
import { useAtomValue, useSetAtom } from "jotai";
import { useNotifications } from "@/hooks/use-notifications";
import { NotificationStatusType } from "./Notifications";
import { useEffect, useState } from "react";
import { getAddresses } from "@/util/wallet-utils/src/getAddress";

const WALLET_PROVIDERS = [
  {
    image: "/images/leather.svg",
    name: "Leather",
    walletProvider: WalletProvider.LEATHER,
  },
  {
    image: "/images/xverse.svg",
    name: "Xverse",
    walletProvider: WalletProvider.XVERSE,
  },
];

type ConnectWalletProps = {
  onClose: () => void;
};
const ConnectWallet = ({ onClose }: ConnectWalletProps) => {
  const [availableWallets, setAvailableWallets] = useState<{
    [key in WalletProvider]: boolean;
  }>({
    leather: false,
    xverse: false,
  });
  useEffect(() => {
    checkAvailableWallets().then(setAvailableWallets);
  }, []);
  const setWalletInfo = useSetAtom(walletInfoAtom);
  const { notify } = useNotifications();
  const { WALLET_NETWORK } = useAtomValue(bridgeConfigAtom);
  const handleSelectWallet = async (wallet: WalletProvider) => {
    try {
      let addresses: Awaited<ReturnType<getAddresses>> | null = null;
      switch (wallet) {
        case WalletProvider.LEATHER:
          addresses = await getAddressesLeather();
          break;
        case WalletProvider.XVERSE:
          addresses = await getAddressesXverse();
      }
      const isMainnetAddress =
        addresses.payment.address.startsWith("bc1") ||
        addresses.payment.address.startsWith("3");
      if (WALLET_NETWORK !== "mainnet" && isMainnetAddress) {
        throw new Error(`Please switch to ${WALLET_NETWORK} network`);
      } else if (WALLET_NETWORK === "mainnet" && !isMainnetAddress) {
        throw new Error(
          `Please switch to ${WALLET_NETWORK} network and use a segwit address`,
        );
      }

      setWalletInfo({
        selectedWallet: wallet,
        addresses: addresses,
      });
      onClose();
    } catch (error) {
      if (error instanceof Error) {
        error = error.message;
      }
      notify({
        message: String(error),
        type: NotificationStatusType.ERROR,
        expire: 10000,
      });
    }
  };

  return (
    <motion.div
      initial={{ x: "0", opacity: 0 }}
      animate={{ x: "0", opacity: 1 }}
      onClick={() => onClose()}
      className="fixed inset-0 bg-black text-black bg-opacity-50 flex items-center justify-center md:p-4 z-20"
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: "#FFF5EB",
        }}
        className=" rounded-lg  flex flex-col items-center justify-between p-6 w-full h-screen sm:h-[400px] sm:w-[340px]  shadow-lg"
      >
        <div className="w-full flex flex-col gap-2 items-center justify-center">
          <Heading>Connect Wallet</Heading>
          <SubText>To Start Using the Bridge</SubText>
        </div>
        <Image
          src="/images/StacksBitcoin.svg"
          alt="Stacks Bitcoin"
          width={150}
          height={150}
        />
        <div className="w-full flex flex-col gap-4 items-center justify-center">
          {WALLET_PROVIDERS.filter(
            (provider) => availableWallets[provider.walletProvider],
          ).map((provider, index) => {
            return (
              <div
                key={index}
                onClick={() => handleSelectWallet(provider.walletProvider)}
                className="flex items-center w-full justify-between p-3 hover:bg-gray-100 rounded cursor-pointer transition"
              >
                <div className="flex items-center">
                  <Image
                    className="rounded"
                    src={provider.image}
                    height={48}
                    width={48}
                    alt={provider.name}
                  />
                  <p className="ml-4 text-black font-bold">{provider.name}</p>
                </div>
                <ArrowRightIcon className="h-6 w-6" />
              </div>
            );
          })}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ConnectWallet;
