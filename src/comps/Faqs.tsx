"use client";
import { useEffect, useState } from "react";
import Header from "./Header";
import { classNames } from "@/util";
import Image from "next/image";

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

const Faqs = () => {
  return (
    <div
      style={{
        maxWidth: "800px",
      }}
      className="w-full flex-col flex border-2 gap-4 border-lightGray rounded-2xl "
    >
      <div className="flex flex-1 gap-4 px-8 p-6 flex-col ">
        <div className="w-full flex flex-row items-center justify-between">
          <h1 className="text-2xl font-Matter font-normal">
            Learn more about sBTC
          </h1>
        </div>
        <p className="text-darkGray font-Matter font-thin text-sm">
          Enter into the world of sBTC with these resources
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
  );
};

export default Faqs;
