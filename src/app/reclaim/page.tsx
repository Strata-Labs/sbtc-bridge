"use server";
import Faqs from "@/comps/Faqs";

import ReclaimManager from "@/comps/ReclaimManager";

export default async function Home() {
  return (
    <>
      <ReclaimManager />
      <Faqs />
    </>
  );
}
