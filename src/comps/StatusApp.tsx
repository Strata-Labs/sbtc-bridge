"use client";

import Faqs from "@/comps/Faqs";
import Header from "@/comps/Header";
import { SECTION } from "@/comps/HomeApp";
import { SectionAction } from "@/comps/HomeSelectedHeader";
import { useState } from "react";
import Status from "./Status";

type SECTION_DATA = {
  title: string;
};

const sectionsMap = new Map<SECTION, SECTION_DATA>();
sectionsMap.set(SECTION.STATUS, { title: "Status" });

const StatusApp = () => {
  const [selectedSection, setSelectedSection] = useState<SECTION>(
    SECTION.STATUS
  );

  const selectedSectionData = sectionsMap.get(selectedSection);

  if (selectedSectionData === undefined) {
    return null;
  }

  return (
    <>
      <Header />
      <div className="flex flex-1 flex-col w-full px-5 gap-6 items-center pt-5">
        <div className="flex  flex-row items-center justify-center">
          <SectionAction
            section={SECTION.STATUS}
            activeSection={selectedSection}
            text="Status"
            onClickSection={() => console.log("")}
          />
        </div>
        <div className="w-screen flex "></div>
        <Status />
        <Faqs />
      </div>
    </>
  );
};

export default StatusApp;
