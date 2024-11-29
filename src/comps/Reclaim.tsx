"use client";

import { BridgeConfig, bridgeConfigAtom } from "@/util/atoms";
import { useSetAtom } from "jotai";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import Header from "./Header";
import ReclaimManager from "./ReclaimManager";

const Reclaim = ({ config }: { config: BridgeConfig }) => {
  const setConfig = useSetAtom(bridgeConfigAtom);

  useEffect(() => {
    setConfig(config);
  }, []);

  return (
    <>
      <Header />
      <div className="w-screen flex "></div>
      <ReclaimManager />
    </>
  );
};

export default Reclaim;
