import { motion } from "framer-motion";
import { SubText } from "./core/Heading";
import { useRef, useState } from "react";
import { classNames } from "@/util";
import { useSetAtom } from "jotai";
import { showTosAtom } from "@/util/atoms";

const TOS = () => {
  const scrollContainerRef = useRef<any>(null);
  const [isScrolledToBottom, setIsScrolledToBottom] = useState(false);

  const setShowTos = useSetAtom(showTosAtom);

  const handleScroll = () => {
    const container = scrollContainerRef.current;
    if (container) {
      const isBottom =
        container.scrollTop + container.clientHeight >= container.scrollHeight;
      setIsScrolledToBottom(isBottom);
    }
  };

  const downloadPDF = () => {
    const link = document.createElement("a");
    link.href = "/documents/Terms of Service.pdf";
    link.download = "BitcoinL2 Labs - Terms of Use.pdf";

    document.body.appendChild(link);
    link.click();
  };

  const handleClick = () => {
    // ensure user has scrolled to the bottom before proceeding

    if (isScrolledToBottom) {
      setShowTos(false);
    }
  };
  return (
    <motion.div
      initial={{ x: "0", opacity: 0 }}
      animate={{ x: "0", opacity: 1 }}
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
        className=" rounded-3xl gap-3 flex flex-col items-center justify-between p-6 w-full h-screen sm:h-[600px] sm:w-[600px]  shadow-lg"
      >
        <div className="flex w-4/5 text-center flex-col items-center justify-center gap-2">
          <h1 className="text-3xl text-black font-Matter font-normal">
            Welcome To The sBTC Bridge
          </h1>
          <div className="bg-orange w-full h-1" />
          <div className="flex flex-col gap-1">
            <SubText>please read the TOS of below before proceeding.</SubText>
            <SubText>
              sBTC is very much early beta software with many risks.
            </SubText>
          </div>
        </div>
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="px-4 py-4  rounded-2xl w-full h-full overflow-y-auto bg-white"
        >
          <p>
            <strong>BitcoinL2 Labs - User Interface Terms of Use</strong>
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
          <p>
            This User Interface is designed to facilitate access to
            blockchain-based services, such as sBTC minting, redemption, and
            transaction management, by connecting you to third-party content and
            services. BitcoinL2 Labs does not control, endorse, or assume
            responsibility for the quality, accuracy, or legality of third-party
            services accessed through this platform. Use is at your discretion
            and risk.
          </p>
          <p>
            <strong>2. Deposits and Withdrawals</strong>
          </p>
          <p>
            At this time, the platform only supports deposits of BTC.
            Withdrawals are not currently available and will be enabled in a
            future update. By using this platform, you acknowledge and accept
            that any BTC deposited cannot be withdrawn until withdrawal
            functionality is introduced. Please plan your deposits accordingly.
          </p>
          <p>
            <strong>3. Disclaimer of Liability</strong>
          </p>
          <ul>
            <li>
              <p>
                <strong>Third-Party Services and Content</strong>: BitcoinL2
                Labs provides access to third-party services as a convenience
                but does not verify, monitor, or guarantee their performance,
                security, or compliance. Engagement with these services is
                subject to their respective terms and conditions.
              </p>
            </li>
            <li>
              <p>
                <strong>Non-Custodial Role</strong>: BitcoinL2 Labs does not
                control or access private keys associated with your digital
                assets. You are solely responsible for the security of your keys
                and wallets.
              </p>
            </li>
            <li>
              <p>
                <strong>No Guarantees</strong>: This interface and associated
                services are provided “as is,” without warranties of any kind.
                BitcoinL2 Labs is not liable for losses resulting from service
                interruptions, blockchain network failures, protocol updates, or
                errors.
              </p>
            </li>
          </ul>
          <p>
            <strong>4. User Responsibilities</strong>
          </p>
          <ul>
            <li>
              <p>
                <strong>Security</strong>: You are responsible for safeguarding
                your private keys, ensuring they remain confidential, and
                protecting your digital wallets from unauthorised access.
              </p>
            </li>
            <li>
              <p>
                <strong>Compliance</strong>: You agree to comply with all
                applicable laws and regulations related to your use of the
                interface and associated blockchain services.
              </p>
            </li>
            <li>
              <p>
                <strong>Due Diligence</strong>: Conduct thorough research and
                seek independent advice before engaging with any third-party
                services or digital assets.
              </p>
            </li>
          </ul>
          <p>
            <strong>5. Intellectual Property</strong>
          </p>
          <p>
            All intellectual property rights in the User Interface and its
            associated content are owned by BitcoinL2 Labs or its licensors.
            Unauthorised copying, modification, or distribution is strictly
            prohibited.
          </p>
          <p>
            <strong>6. Risks</strong>
          </p>
          <p>
            By using this platform, you acknowledge and accept the following
            risks:
          </p>
          <ul>
            <li>
              <p>
                <strong>Blockchain Technology</strong>: Transactions are
                irreversible and subject to network delays, fees, and potential
                vulnerabilities in protocols or third-party applications.
              </p>
            </li>
            <li>
              <p>
                <strong>Market Volatility</strong>: Digital asset values can
                fluctuate significantly. You assume all financial risks related
                to your use of blockchain-based systems.
              </p>
            </li>
            <li>
              <p>
                <strong>Third-Party Interactions</strong>: BitcoinL2 Labs is not
                responsible for losses resulting from fraudulent, unsuitable, or
                otherwise problematic third-party services.
              </p>
            </li>
          </ul>
          <p>
            <strong>7. Modifications and Termination</strong>
          </p>
          <p>BitcoinL2 Labs reserves the right to:</p>
          <ul>
            <li>
              <p>
                Modify, suspend, or terminate access to this interface without
                prior notice.
              </p>
            </li>
            <li>
              <p>
                Update these terms periodically. Continued use constitutes
                acceptance of any changes.
              </p>
            </li>
          </ul>
          <p>
            <strong>8. Limitation of Liability</strong>
          </p>
          <p>
            To the fullest extent permitted by law, BitcoinL2 Labs disclaims all
            liability for:
          </p>
          <ul>
            <li>
              <p>
                Direct, indirect, incidental, or consequential damages arising
                from your use of the User Interface.
              </p>
            </li>
            <li>
              <p>
                Losses related to unauthorised access, data breaches, or errors
                in transactions.
              </p>
            </li>
          </ul>
          <p>
            <strong>9. Disclosure of Financial Incentives</strong>
          </p>
          <p>
            BitcoinL2 Labs provides financial incentives to certain
            cryptocurrency trading firms based on their sBTC trading volume and
            ownership. This aims to enhance liquidity and support sBTC adoption.
            However, incentivised trading may impact market behaviour, including
            price and volume dynamics, and firms may have differing financial
            motivations. To protect competitive interests, BitcoinL2 Labs does
            not disclose the firms’ identities or program details. By engaging
            with the sBTC ecosystem, you accept that these incentives may
            influence trading activity and should conduct due diligence before
            participating.
          </p>
          <p>
            <strong>10. Governing Law</strong>
          </p>
          <p>
            These terms and any disputes arising under them are governed by the
            laws of the Cayman Islands. Any legal actions or proceedings shall
            be exclusively subject to the jurisdiction of the courts of the
            Cayman Islands.
          </p>
          <p>
            <strong>11. Contact and Support</strong>
          </p>
          <p>
            For questions or support, please reach out to us via the contact
            information provided within the interface. Note that BitcoinL2 Labs
            will never request your private keys or passwords through any
            channel.
          </p>
          <p>
            By continuing, you acknowledge that you have read, understood, and
            agreed to these terms. If you do not agree, please discontinue your
            use of the User Interface immediately.
          </p>
        </div>
        <div className="cursor-pointer underline" onClick={() => downloadPDF()}>
          <SubText>download as pdf</SubText>
        </div>

        <button
          type="button"
          onClick={() => handleClick()}
          className="w-full rounded-lg py-3 flex justify-center items-center flex-row bg-orange disabled:opacity-50 disabled:cursor-not-allowed "
        >
          <p
            className={classNames(
              " text-md tracking-wider font-Matter font-bold",
              isScrolledToBottom ? "text-black" : "text-black",
            )}
          >
            {isScrolledToBottom ? "I Agree" : "Scroll to Bottom to Agree"}
          </p>
        </button>
      </motion.div>
    </motion.div>
  );
};

export default TOS;
