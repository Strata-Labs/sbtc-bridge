import { useConnect } from "@stacks/connect-react";
import { motion } from "framer-motion";
import { Heading, SubText } from "./core/Heading";
import Image from "next/image";
import { ArrowRightIcon } from "@heroicons/react/20/solid";

enum WalletProvider {
  LEATHER = "Leather",
  XVERSE = "Xverse",
}

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

const resolveProvider = (wallet: WalletProvider) => {
  if (wallet === WalletProvider.XVERSE && window.XverseProviders) {
    return window.XverseProviders?.StacksProvider;
  } else if (wallet === WalletProvider.LEATHER && window.LeatherProvider) {
    return window.LeatherProvider;
  } else {
    return null;
  }
};

type ConnectWalletProps = {
  onClose: () => void;
};
const ConnectWallet = ({ onClose }: ConnectWalletProps) => {
  const { doOpenAuth } = useConnect();

  const handleSelectWallet = async (wallet: WalletProvider) => {
    try {
      const provider = resolveProvider(wallet);
      if (provider) {
        doOpenAuth(true, undefined, provider);
      } else {
        throw new Error("Provider not found");
      }
    } catch (error) {
      console.error("Error during authentication process:", error);
    }
  };

  return (
    <motion.div
      initial={{ x: "0", opacity: 0 }}
      animate={{ x: "0", opacity: 1 }}
      onClick={() => onClose()}
      className="fixed inset-0 bg-black text-black bg-opacity-50 flex items-center justify-center md:p-4 z-50"
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: "#FFF5EB",
        }}
        className=" rounded-lg  flex flex-col items-center justify-between p-6 w-full h-screen lg:h-[400px] lg:w-[340px]  shadow-lg"
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
          {WALLET_PROVIDERS.map((provider, index) => {
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
