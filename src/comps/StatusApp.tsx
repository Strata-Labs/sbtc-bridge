"use client";

import Faqs from "@/comps/Faqs";
import Header from "@/comps/Header";
import { SECTION } from "@/comps/HomeApp";
import { SectionAction } from "@/comps/HomeSelectedHeader";
import Status from "./Status";
import getSbtcBridgeConfig from "@/actions/get-sbtc-bridge-config";
import { useEffect } from "react";
import { useSetAtom } from "jotai";
import { bridgeConfigAtom } from "@/util/atoms";

type SECTION_DATA = {
  title: string;
};

const sectionsMap = new Map<SECTION, SECTION_DATA>();
sectionsMap.set(SECTION.STATUS, { title: "Status" });

const StatusApp = () => {
  const selectedSectionData = sectionsMap.get(SECTION.STATUS);
  const setConfig = useSetAtom(bridgeConfigAtom);
  useEffect(() => {
    getSbtcBridgeConfig().then(setConfig);
  }, [setConfig]);
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
            activeSection={SECTION.STATUS}
            text="Status"
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
