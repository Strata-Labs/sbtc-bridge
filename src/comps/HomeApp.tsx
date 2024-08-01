"use client";
import { useEffect, useState } from "react";
import Header from "./Header";
import { classNames } from "@/util";
import Image from "next/image";

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
        className="faq-question flex justify-between items-center w-full py-4 text-left text-lg font-medium"
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
          <p className="text-[#605D5D]">{answer}</p>
        </div>
      </div>
    </div>
  );
};

const sectionTextStyle = (isActive: boolean) =>
  isActive ? "text-black  font-semibold" : "text-gray font-normal";
const sectionStyle = (isActive: boolean) =>
  isActive ? " border-orange" : " border-gray";

type SectionActionProps = {
  section: SECTION;
  onClickSection: (section: SECTION) => void;
  activeSection: SECTION;
  text: string;
};
const SectionAction = ({
  section,
  activeSection,
  text,
  onClickSection,
}: SectionActionProps) => {
  return (
    <div
      onClick={() => onClickSection(section)}
      className={classNames(
        "w-32 cursor-pointer h-14 flex flex-row items-center justify-center border-b-2",
        sectionStyle(section === activeSection)
      )}
    >
      <h1
        className={classNames(
          " text-2xl",
          sectionTextStyle(section === activeSection)
        )}
      >
        {text}
      </h1>
    </div>
  );
};

type SectionSelection = {
  section: SECTION;
  onClickSection: (section: SECTION) => void;
};
const SelectedSection = ({ section, onClickSection }: SectionSelection) => {
  const handleClickSection = (section: SECTION) => {
    onClickSection(section);
  };
  return (
    <div className="flex  flex-row items-center justify-center">
      <SectionAction
        section={SECTION.DEPOSIT}
        activeSection={section}
        text="Deposit"
        onClickSection={handleClickSection}
      />
      <SectionAction
        section={SECTION.WITHDRAW}
        activeSection={section}
        text="Withdraw"
        onClickSection={handleClickSection}
      />
      <SectionAction
        section={SECTION.HISTORY}
        activeSection={section}
        text="History"
        onClickSection={handleClickSection}
      />
    </div>
  );
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

  const [value, setValue] = useState("");
  const [isValid, setIsValid] = useState(false);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    const btcRegex = /^[0-9]+(\.[0-9]{1,8})? BTC$/;

    let inputValue = event.target.value.replace(/ BTC$/, ""); // Remove existing " BTC"
    // ensure that the user can add numbers past "btc"
    inputValue = inputValue.replace(/[^0-9.]/g, "");

    setIsValid(validateInput(inputValue));
    setValue(inputValue);
  };

  const validateInput = (input: string) => {
    // Add your validation logic here
    return input.length > 0;
  };

  useEffect(() => {
    if (value !== "" && !value.endsWith("BTC")) {
      setValue(`${value} BTC`);
    }
  }, [value]);

  if (selectedSectionData === undefined) {
    return null;
  }

  return (
    <>
      <Header />
      <div className="flex flex-1 flex-col w-full gap-6 items-center pt-5">
        <SelectedSection
          section={selectedSection}
          onClickSection={(section) => setSelectedSection(section)}
        />
        <div className="w-screen flex "></div>
        <div
          style={{
            maxWidth: "800px",
          }}
          className="w-full flex-row flex border-2 gap-4 border-lightGray rounded-2xl "
        >
          <div className="flex flex-1 px-8 p-6 flex-col ">
            <div className="w-full flex flex-row items-center justify-between">
              <h1 className="text-2xl font-Matter font-normal">
                {selectedSectionData?.title}
              </h1>
              <div className="w-16 h-8 rounded-2xl bg-sand" />
            </div>
            <p className="text-darkGray font-Matter font-thin text-sm">
              Convert BTC into sBTC
            </p>
            <div className="w-full flex mt-16 flex-col gap-14 justify-start ">
              <div className="relative ">
                <input
                  type="text"
                  placeholder="Enter BTC amount to transfer"
                  value={value}
                  onChange={handleChange}
                  className={`w-full py-2 border-b-2 bg-transparent text-2xl text-black focus:outline-none placeholder-gray-300 ${
                    isValid ? "border-orange" : "border-midGray"
                  } transition-colors duration-500`}
                />
              </div>
              <button className="w-52 rounded-lg py-3 flex justify-center items-center flex-row bg-orange">
                <p
                  className={classNames(
                    " text-lg tracking-wider font-Matter font-semibold",
                    isValid ? "text-black" : "text-black"
                  )}
                >
                  NEXT
                </p>
              </button>
            </div>
          </div>
          <div
            style={{
              backgroundColor: "rgba(253, 157, 65, 0.1)",
              height: "320px",
              width: "320px",
            }}
            className="flex flex-col items-center justify-center"
          >
            <Image
              src="/images/StacksBitcoin.svg"
              alt="Icon"
              width={150}
              height={150}
            />
          </div>
        </div>
        <div
          style={{
            maxWidth: "800px",
          }}
          className="w-full flex-col flex border-2 gap-4 border-lightGray rounded-2xl "
        >
          <div className="flex flex-1 px-8 p-6 flex-col ">
            <div className="w-full flex flex-row items-center justify-between">
              <h1 className="text-2xl font-Matter font-normal">
                Learn more about sBTCyarn
              </h1>
            </div>
            <p className="text-darkGray font-Matter font-thin text-sm">
              Convert BTC into sBTC
            </p>
          </div>
          <div className="flex flex-col w-full px-8 p-6 gap-4  mt-5">
            <FAQItem
              question="What is sBTC?"
              answer="sBTC is a synthetic asset that represents the price of Bitcoin on the Stacks blockchain."
              index={1}
            />
            <FAQItem
              question="What is sBTC?"
              answer="sBTC is a synthetic asset that represents the price of Bitcoin on the Stacks blockchain."
              index={2}
            />
            <FAQItem
              question="What is sBTC?"
              answer="sBTC is a synthetic asset that represents the price of Bitcoin on the Stacks blockchain."
              index={3}
            />
          </div>
        </div>
      </div>
      <h1>Home</h1>
    </>
  );
};

export default HomeApp;
