"use client";
import { useState } from "react";
import Header from "./Header";
import Faqs from "./Faqs";
import SelectedSection from "./HomeSelectedHeader";
import DepositFlow from "./Deposit";
import HistoryView from "./HistoryView";
import { TransferAction } from "./TransferHome";
import LandingAnimation from "./core/LandingAnimation";
import { usePathname, useRouter } from "next/navigation";
import { BridgeConfig, bridgeConfigAtom } from "@/util/atoms";
import { useSetAtom } from "jotai";

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

const HomeApp = ({ config }: { config: BridgeConfig }) => {
  const [selectedSection, _setSelectedSection] = useState<SECTION>(
    SECTION.DEPOSIT,
  );
  const setConfig = useSetAtom(bridgeConfigAtom);
  setConfig(config);
  const pathname = usePathname();
  const router = useRouter();

  const setSelectedSection = (section: SECTION) => {
    _setSelectedSection(section);

    router.push(pathname);
  };

  const selectedSectionData = sectionsMap.get(selectedSection);

  if (selectedSectionData === undefined) {
    return null;
  }

  return (
    <>
      <Header />
      <LandingAnimation>
        <SelectedSection
          section={selectedSection}
          onClickSection={(section) => setSelectedSection(section)}
        />
        <div className="w-screen flex "></div>
        {selectedSection === SECTION.DEPOSIT && <DepositFlow />}
        {selectedSection === SECTION.WITHDRAW && <p>Coming Soon :)</p>}
        {selectedSection === SECTION.HISTORY && <HistoryView />}
        {selectedSection === SECTION.TRANSFER && <TransferAction />}
      </LandingAnimation>
      <Faqs />
    </>
  );
};

export default HomeApp;
