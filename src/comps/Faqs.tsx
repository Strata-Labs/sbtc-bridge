"use client";
import { useState } from "react";

type FAQItemProps = {
  question: string;
  answer: string;
  index: number;
};

const FAQItem = ({ question, answer, index }: FAQItemProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="">
      <p className="text-darkGray font-Matter font-normal tracking-wider text-sm">
        {`FAQ ${index}`}
      </p>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="faq-question flex justify-between text-black items-center w-full py-4 text-left text-lg font-medium"
      >
        <span>{question}</span>
        <svg
          className={`faq-icon w-6 h-6 transform transition-transform duration-300 ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M19 9l-7 7-7-7"
          ></path>
        </svg>
      </button>
      <div
        className={` overflow-hidden transition-all duration-300 ${
          isOpen ? "h-max" : "h-0"
        }`}
      >
        <div className="p-6 bg-[#F5F5F5] rounded-xl w-full">
          <p className=" break-normal text-[#605D5D]">{answer}</p>
        </div>
      </div>
    </div>
  );
};

const Faqs = () => {
  return (
    <div
      style={{
        maxWidth: "800px",
      }}
      className="w-full mb-8 flex-col flex border-2 gap-4 border-lightGray rounded-2xl "
    >
      <div className="flex flex-1 gap-4 px-8 p-6 flex-col ">
        <div className="w-full flex flex-row items-center justify-between">
          <h1 className="text-2xl text-black font-Matter font-normal">
            Learn more about sBTC
          </h1>
        </div>
        <p className="text-darkGray font-Matter font-thin text-sm">
          Enter into the world of sBTC with these resources
        </p>
      </div>
      <div className="flex flex-col w-full px-8 p-6 gap-4  mt-5">
        <FAQItem
          question="What does sBTC Enable?"
          answer="There are quite a few interesting unlocks with sBTC, but to simplify, sBTC enables a kind of ‘write’ for Bitcoin. With sBTC you can effectively take your Bitcoin, move it to the L2, and do all kinds of interesting things with it. Critically, smart contracts can interact with sBTC, opening the door for DeFi and really any type of applications you see in other ecosystems, but with the added security benefits of Bitcoin backing it."
          index={1}
        />
        <FAQItem
          question="What makes sBTC different than wBTC, tBTC, and other similar assets?"
          answer="There are other Bitcoin deployed assets on different blockchains with different tradeoffs but most often, these solutions require sending BTC to an intermediary or are reliant on a trusted federation of signers. Open membership and decentralization are key aspects of Bitcoin and will not be compromised on in the final design of sBTC. In addition, sBTC will be the only asset that is secured by 100% of the hash power of Bitcoin itself."
          index={2}
        />
        <FAQItem
          question="How does sBTC work?"
          answer="Note: Some aspects of sBTC are still being designed and subject to change. This page will be updated as various elements become finalized. \n sBTC operates by utilizing a synthetic asset model on the Stacks blockchain. To acquire sBTC, users swap their Bitcoin for sBTC through a smart contract. The value of sBTC is pegged to the value of Bitcoin, allowing users to represent their Bitcoin holdings in the form of sBTC on the Stacks blockchain. This synthetic representation enables users to engage in various DeFi applications, such as lending, borrowing, or trading, while still retaining the benefits and ownership of their underlying Bitcoin. The Stacks blockchain ensures the security and integrity of the sBTC ecosystem, while the value of sBTC remains tied to the value of Bitcoin.
"
          index={3}
        />
      </div>
    </div>
  );
};

export default Faqs;
