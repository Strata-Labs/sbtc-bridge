import { useEffect, useState } from "react";
import Image from "next/image";
import { classNames } from "@/util";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";

/* 
  deposit flow has 3 steps
  1) enter amount you want to deposit
  - can change in what denomination you want to make deposit(satoshi, btc, usd)
  2) enter the stack address they want funds sent to
  3) confirm amount and stacks transaction address
  - create payment request
  - view payment status in history
*/

/* 
  each step will have it's own custom configuration about how to deal with this data and basic parsing 
  - we should create bulding blocks by not try to create dynamic views 
*/

enum DEPOSIT_STEP {
  AMOUNT,
  ADDRESS,
  CONFIRM,
}
const DepositFlow = () => {
  const [step, setStep] = useState(DEPOSIT_STEP.AMOUNT);

  return (
    <div
      style={{
        maxWidth: "800px",
      }}
      className="w-full flex-row flex border-2 gap-4 border-lightGray rounded-2xl "
    >
      <DepositAmount />
    </div>
  );
};

export default DepositFlow;

enum DENOMINATIONS {
  SATS = "SATS",
  BTC = "BTC",
  USD = "USD",
}

const DepositAmount = () => {
  const [value, setValue] = useState("");
  const [isValid, setIsValid] = useState(false);

  const [selectedDenomination, setSelectedDenomination] =
    useState<DENOMINATIONS>(DENOMINATIONS.BTC);

  useEffect(() => {
    if (value !== "" && !value.endsWith("BTC")) {
      setValue(`${value} BTC`);
    }
  }, [value]);
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

  return (
    <>
      <div className="flex flex-1 px-8 p-6 flex-col ">
        <div className="w-full flex flex-row items-center justify-between">
          <h1 className="text-2xl font-Matter font-normal">Deposit</h1>
          <Menu as="div" className="relative inline-block text-left ">
            <MenuButton className="w-24 flex flex-row justify-center items-center h-8 text-sm rounded-2xl  gap-x-1.5  ring-inset ring-gray-300 hover:bg-gray-50 bg-sand">
              {selectedDenomination}
              <ChevronDownIcon
                aria-hidden="true"
                className="-mr-1 h-5 w-5 text-gray-400"
              />
            </MenuButton>
            <MenuItems
              transition
              className="absolute right-0 z-10 mt-2 w-32 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 transition focus:outline-none data-[closed]:scale-95 data-[closed]:transform data-[closed]:opacity-0 data-[enter]:duration-100 data-[leave]:duration-75 data-[enter]:ease-out data-[leave]:ease-in"
            >
              <p
                onClick={() => setSelectedDenomination(DENOMINATIONS.SATS)}
                className="block px-4 py-2 text-sm text-gray-700 data-[focus]:bg-gray-100 data-[focus]:text-gray-900"
              >
                SATS
              </p>
            </MenuItems>
          </Menu>
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
    </>
  );
};
