import { DepositStatus, useDepositStatus } from "@/hooks/use-deposit-status";
import { CheckCircleIcon } from "@heroicons/react/24/outline";

import { useMemo } from "react";

function Step({
  name,
  index,
  currentStep,
  lastStep,
}: {
  name: string;
  index: number;
  currentStep: number;
  lastStep: number;
}) {
  const isCurrentStep = index === currentStep;
  const isCompleted = index < currentStep;
  const isPending = index > currentStep;
  let statusClassName = "";
  let nameClassName = "";
  if (isCompleted) {
    statusClassName = "bg-orange border-orange text-white";
    nameClassName = "text-orange";
  } else if (isCurrentStep) {
    statusClassName = "bg-lightOrange border-orange text-orange";
    nameClassName = "text-orange";
  } else if (isPending) {
    statusClassName = "bg-white border-black text-black";
    nameClassName = "text-black";
  }

  let wrapperClassName =
    "after:content-['']  after:w-full after:h-0.5  after:bg-orange after:inline-block after:absolute lg:after:top-5 after:top-3 after:left-6";
  if (lastStep === index) {
    wrapperClassName = "";
  }

  return (
    <li
      className={`font-Matter flex w-full relative text-orange ${wrapperClassName}`}
    >
      <div className="block whitespace-nowrap z-10">
        <span
          className={`w-6 h-6 border-2 rounded-full flex justify-center items-center mx-auto mb-3 text-sm lg:w-10 lg:h-10 ${statusClassName}`}
        >
          {index + 1}
        </span>
        <span className={nameClassName}>{name}</span>
      </div>
    </li>
  );
}
export function DepositStepper({ txId }: { txId: string }) {
  const status = useDepositStatus(txId);

  const currentStep = useMemo(() => {
    const steps = [
      DepositStatus.PendingConfirmation,
      DepositStatus.PendingMint,
      "",
      DepositStatus.Completed,
    ];
    return steps.findIndex((step) => step === status);
  }, [status]);
  return (
    <div className="flex flex-col gap-4 w-full ">
      {status !== DepositStatus.Completed ? (
        <div
          className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-e-transparent align-[-0.125em] text-surface motion-reduce:animate-[spin_1.5s_linear_infinite] dark:text-orange"
          role="status"
        ></div>
      ) : (
        <CheckCircleIcon className="text-green-600 w-12" />
      )}
      <ol className="flex items-center w-full text-xs text-gray-900 font-medium sm:text-base text-black">
        <Step currentStep={currentStep} index={0} name="Pending" lastStep={2} />
        <Step currentStep={currentStep} index={1} name="Minting" lastStep={2} />
        <Step
          currentStep={currentStep}
          index={2}
          name="Completed"
          lastStep={2}
        />
      </ol>
    </div>
  );
}
