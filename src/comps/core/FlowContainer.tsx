import Image from "next/image";

type FlowContainerProps = {
  children: React.ReactNode;
};
export const FlowContainer = ({ children }: FlowContainerProps) => {
  return (
    <div
      style={{
        maxWidth: "800px",
      }}
      className="w-full flex-row flex border-2 gap-4 border-lightGray rounded-2xl "
    >
      <div className="flex flex-1 px-8 p-6  gap-3 flex-col ">{children}</div>
      <div
        style={{
          backgroundColor: "rgba(253, 157, 65, 0.1)",

          width: "320px",
        }}
        className="flex flex-col items-center justify-center flex-1"
      >
        <Image
          src="/images/StacksBitcoin.svg"
          alt="Icon"
          width={150}
          height={150}
        />
      </div>
    </div>
  );
};
