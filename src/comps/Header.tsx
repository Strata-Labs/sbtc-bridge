import Image from "next/image";

const Header = () => {
  return (
    <header className="w-screen py-6 flex items-center justify-center">
      <div
        style={{
          maxWidth: "1200px",
        }}
        className="flex-1  flex-row flex items-center justify-between"
      >
        <div className="">
          <Image
            src="/images/StacksNav.svg"
            alt="Stacks Logo"
            width={100}
            height={100}
          />
        </div>
        <div className="flex flex-row gap-10 items-center">
          <h5 className="font-Matter text-xs tracking-wide ">LEARN MORE</h5>
          <h4 className="font-Matter text-xs tracking-wide ">HISTORY</h4>
          <button className=" bg-orange  px-4 py-2 rounded-md">
            <h3 className="font-Matter text-xs font-semibold	 tracking-wide">
              CONNECT WALLET
            </h3>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
