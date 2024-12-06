"use client";
import { useState } from "react";

type FAQItemProps = {
  question: string;
  answer: React.ReactNode;
  index: number;
};

const faqs = [
  {
    question: "What is sBTC?",
    answer:
      "sBTC is a non-custodial 1:1 Bitcoin-backed asset on the Stacks Bitcoin Layer.",
  },
  {
    question: "How does sBTC work?",
    answer: (
      <ol className="list-inside flex flex-col gap-4">
        <li>
          sBTC is a SIP-010 token on the Stacks blockchain that represents
          Bitcoin (BTC) in a 1:1 ratio. sBTC is always backed 1:1 against BTC.
        </li>
        <li>
          The sBTC peg wallet is maintained and managed by a set of sBTC
          signers. This decentralized approach enhances security and reduces
          single points of failure.
        </li>
      </ol>
    ),
  },
  {
    question: "Is my BTC safe?",
    answer: (
      <>
        <p className="text-darkGray font-Matter font-thin mb-4">
          sBTC is always backed 1:1 against BTC, and it’s verifiably secure
          through threshold cryptography. sBTC removes the need for 3rd party
          custodian or trusted setup. Instead, BTC is secured by a decentralized
          signer set.
        </p>
        <ol className="list-decimal list-inside flex flex-col gap-4">
          <li>
            <strong>Bitcoin In, Bitcoin Out:</strong> sBTC is a SIP-010 token on
            the Stacks blockchain that represents Bitcoin (BTC) in a 1:1 ratio.
            sBTC is always backed 1:1 against BTC.
          </li>
          <li>
            <strong>Bitcoin Security:</strong> Stacks and sBTC state
            automatically fork with Bitcoin. As such, all transactions settle to
            Bitcoin with 100% Bitcoin Finality. This protects users against
            certain attacks that could occur via a Bitcoin hard fork. This is a
            critical security measure that aligns sBTC security with Bitcoin.
            <a
              href="https://docs.stacks.co/concepts/block-production/bitcoin-finality"
              target="_blank"
              className="text-blue-600 underline"
            >
              Read more.
            </a>
          </li>
          <li>
            <strong>Trust-Minimized, Decentralized Signer Network:</strong> Most
            tokenized Bitcoin solutions require a set of federated or
            centralized parties to custody the underlying BTC**.** Stacks has
            built sBTC so withdrawals back to BTC are based on a decentralized
            set of over 15 validator nodes, including names like Blockdaemon,
            Kiln, Chorus One, and more.
            <a
              href="https://docs.stacks.co/concepts/block-production/stackers-and-signing"
              target="_blank"
              className="text-blue-600 underline"
            >
              Read more.
            </a>
          </li>
        </ol>
      </>
    ),
  },
  {
    question:
      "What security measures have been put in place to ensure sBTC is safe?",
    answer: (
      <>
        <p className="text-darkGray font-Matter font-thin mb-4">
          Partnerships with top-tier security experts have been established to
          ensure the protocol is fortified at every level:
        </p>
        <ol className="list-decimal list-inside flex flex-col gap-4">
          <li>
            <strong>Asymmetric Research:</strong> Known for their rigorous
            research and protocol audits, Asymmetric brings security expertise
            to sBTC to identify and mitigate potential vulnerabilities.
          </li>
          <li>
            <strong>ImmuneFi:</strong> A robust bug bounty program incentivizes
            ethical hackers to uncover and address potential issues, adding an
            additional layer of defense.
          </li>
          <li>
            <strong>3rd Party Audits:</strong> Independent audit reports will be
            completed for additional security reviews, ensuring the protocol is
            thoroughly vetted by external experts.
          </li>
        </ol>
      </>
    ),
  },
  {
    question: "How long will it take for my BTC deposit to confirm?",
    answer: (
      <>
        <p className="text-darkGray font-Matter font-thin mb-4">
          sBTC facilitates rapid movement between BTC and sBTC.
        </p>
        <ol className="list-inside flex flex-col gap-4">
          <li>
            BTC to sBTC conversion can be completed within 3 Bitcoin blocks.
          </li>
          <li>
            sBTC to BTC conversion can be completed within 6 Bitcoin blocks.
          </li>
        </ol>
      </>
    ),
  },
  {
    question: "Do I get rewards for depositing BTC?",
    answer: (
      <>
        <p className="text-darkGray font-Matter font-thin">
          Yes. Through the sBTC Rewards Program, early sBTC holders will earn
          ~5% APY, paid in BTC.
        </p>
      </>
    ),
  },
  {
    question: "Where does the yield come from?",
    answer: (
      <>
        <ol className="list-inside flex flex-col gap-4">
          <li>
            BTC yield comes from the Stacks Proof of Transfer (PoX) consensus
            mechanism via the sBTC Rewards Program.
          </li>
          <li>
            The sBTC Rewards Program generates BTC yield from stacking STX.
            Under the hood, the program contributes the corresponding Proof of
            Transfer BTC to the sBTC Rewards pool.
          </li>
          <li>
            Users deposit BTC and enroll in the rewards program to earn up to 5%
            APY, plus additional opportunities for yield by deploying sBTC into
            Stacks DeFi protocols.
          </li>
        </ol>
      </>
    ),
  },
  {
    question: "What wallets are supported for sBTC?",
    answer: (
      <>
        <ol className="list-inside flex flex-col gap-4">
          <li>
            <a
              className="text-blue-600 underline"
              href="https://www.xverse.app/"
              target="_blank"
            >
              Xverse
            </a>{" "}
            and{" "}
            <a
              className="text-blue-600 underline"
              href="https://leather.io/"
              target="_blank"
            >
              Leather
            </a>{" "}
            wallets are supported — two leading wallets with seamless
            integrations designed for Bitcoin and Stacks users.
          </li>
          <li>
            We are actively working with institutional custodians, staking
            providers, and other 3rd party wallets to support sBTC. More will be
            announced.
          </li>
        </ol>
      </>
    ),
  },
];

const FAQItem = ({ question, answer, index }: FAQItemProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="">
      <p className="text-darkGray font-Matter font-normal tracking-wider">
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
          <div className=" text-[#605D5D]">{answer}</div>
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
      className="w-full mb-8 flex-col flex border-2 gap-4 border-lightGray rounded-2xl font-Matter "
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
        {faqs.map((faq, index) => (
          <FAQItem
            key={index}
            question={faq.question}
            answer={faq.answer}
            index={index + 1}
          />
        ))}
      </div>
    </div>
  );
};

export default Faqs;
