import { motion } from "framer-motion";
import { SubText } from "./core/Heading";
import { useRef, useState } from "react";
import { classNames } from "@/util";
import { useSetAtom } from "jotai";
import { showTosAtom } from "@/util/atoms";

type LedgerWarningProps = {
  onClose: () => void;
  handleAccept: () => void;
};

const LedgerWarning = ({ onClose, handleAccept }: LedgerWarningProps) => {
  const handleUserAccept = () => {
    handleAccept();
  };

  return (
    <motion.div
      initial={{ x: "0", opacity: 0 }}
      animate={{ x: "0", opacity: 1 }}
      onClick={onClose}
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
        className=" rounded-3xl gap-3 flex flex-col items-center justify-between p-6 w-full h-screen sm:h-[400px] sm:w-[600px]  shadow-lg"
      >
        <div className="flex w-4/5 text-center flex-col items-center justify-center gap-2">
          <h1 className="text-3xl text-black font-Matter font-normal">
            Leger Wallet Warning
          </h1>
          <div className="bg-orange w-full h-1" />
          <div className="flex flex-col gap-1">
            <SubText>please read the our Ledger wallet warning</SubText>
            <SubText>This is very important.</SubText>
          </div>
        </div>
        <div className="px-4 py-4  rounded-2xl w-full h-full overflow-y-auto bg-white">
          <p>
            <strong>Warning Warning </strong>
          </p>
          <p>
            Welcome to the BitcoinL2 Labs User Interface. By accessing or using
            this interface, you agree to the following terms and conditions,
            which govern your use of this platform and its associated services.
            Please read carefully before proceeding.
          </p>
          <p>
            <strong>1. Purpose and Scope</strong>
          </p>
        </div>
        <button
          type="button"
          onClick={() => handleUserAccept()}
          className="w-full rounded-lg py-3 flex justify-center items-center flex-row bg-orange disabled:opacity-50 disabled:cursor-not-allowed "
        >
          <p
            className={classNames(
              " text-md tracking-wider font-Matter font-bold",
              "text-black",
            )}
          >
            I acknowledge I'm not using a Ledger wallet
          </p>
        </button>
      </motion.div>
    </motion.div>
  );
};

export default LedgerWarning;
