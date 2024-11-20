"use client";
import { useState } from "react";
import Header from "./Header";
import Image from "next/image";
import Faqs from "./Faqs";
import SelectedSection from "./HomeSelectedHeader";
import DepositFlow from "./Deposit";
import HistoryView from "./HistoryView";
import TransferApp, { TransferAction } from "./TransferHome";
import DevEnvSettings from "./DevEnvSettings";

export enum SECTION {
  DEPOSIT = "DEPOSIT",
  WITHDRAW = "WITHDRAW",
  HISTORY = "HISTORY",
  STATUS = "STATUS",
  TRANSFER = "TRANSFER",
  SETTINGS = "SETTINGS",
}

type SECTION_DATA = {
  title: string;
};

const sectionsMap = new Map<SECTION, SECTION_DATA>();
sectionsMap.set(SECTION.DEPOSIT, { title: "Deposit" });
sectionsMap.set(SECTION.WITHDRAW, { title: "Withdraw" });
sectionsMap.set(SECTION.HISTORY, { title: "History" });
sectionsMap.set(SECTION.TRANSFER, { title: "Transfer" });
sectionsMap.set(SECTION.SETTINGS, { title: "Settings" });

const HomeApp = () => {
  const [selectedSection, setSelectedSection] = useState<SECTION>(
    SECTION.DEPOSIT
  );

  useEffect(() => {
    // emily cors test
  }, []);
  const emilyTest = async () => {
    try {
      const paramsBody = {
        bitcoinTxid: "",
        bitcoinTxOutputIndex: "",
        reclaimScript: "",
        depositScript: "",
      };
      const body = "";
      // Forward the request to the Rust server
      const response = await fetch(`${body}/deposit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(paramsBody),
      });

      // If Rust server responds with an error status
      if (!response.ok) {
        const errorResponse = await response.json();
        console.log(errorResponse);
      }

      // Return the success response from Rust server
      const responseData = await response.json();
    } catch (err) {
      console.log(err);
    }
  };
  const selectedSectionData = sectionsMap.get(selectedSection);

  if (selectedSectionData === undefined) {
    return null;
  }

  return (
    <>
      <Header />
      <div className="flex flex-1 flex-col w-full px-5 gap-6 items-center pt-5">
        <SelectedSection
          section={selectedSection}
          onClickSection={(section) => setSelectedSection(section)}
        />
        <div className="w-screen flex "></div>
        {selectedSection === SECTION.DEPOSIT && <DepositFlow />}
        {selectedSection === SECTION.WITHDRAW && <p>Coming Soon :)</p>}
        {selectedSection === SECTION.HISTORY && <HistoryView />}
        {selectedSection === SECTION.TRANSFER && <TransferAction />}

        {/* <Faqs /> */}
      </div>
    </>
  );
};

export default HomeApp;
