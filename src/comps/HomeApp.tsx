"use client";
import { useEffect, useState } from "react";
import Header from "./Header";
import { classNames } from "@/util";
import Image from "next/image";
import Faqs from "./Faqs";
import SelectedSection from "./HomeSelectedHeader";
import DepositFlow from "./Deposit";

export enum SECTION {
  DEPOSIT = "DEPOSIT",
  WITHDRAW = "WITHDRAW",
  HISTORY = "HISTORY",
}

const COLORS = {
  orange: "#FD9D41",
  gray: "#B9B9B9",
  lightGray: "#F5F5F5",
  send: "#F3F2F0",
};

type SECTION_DATA = {
  title: string;
};

const sectionsMap = new Map<SECTION, SECTION_DATA>();
sectionsMap.set(SECTION.DEPOSIT, { title: "Deposit" });
sectionsMap.set(SECTION.WITHDRAW, { title: "Withdraw" });
sectionsMap.set(SECTION.HISTORY, { title: "History" });

const HomeApp = () => {
  const [selectedSection, setSelectedSection] = useState<SECTION>(
    SECTION.DEPOSIT
  );

  const selectedSectionData = sectionsMap.get(selectedSection);

  if (selectedSectionData === undefined) {
    return null;
  }

  if (typeof window == "undefined") {
    return "loading...";
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
        <DepositFlow />

        <Faqs />
      </div>
      <h1>Home</h1>
    </>
  );
};

export default HomeApp;
