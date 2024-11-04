import { classNames } from "@/util";

type ButtonProps = {
  children: React.ReactNode;
  onClick: () => void;
  isValid?: boolean;
  type?: "button" | "submit" | "reset";
};
export const PrimaryButton = ({
  children,
  onClick,
  isValid = true,
  type = "button",
}: ButtonProps) => {
  return (
    <button
      type={type}
      className="w-40 rounded-lg py-3 flex justify-center items-center flex-row bg-orange"
      onClick={onClick}
    >
      <p
        className={classNames(
          " text-md tracking-wider font-Matter font-bold",
          isValid ? "text-black" : "text-black"
        )}
      >
        {children}
      </p>
    </button>
  );
};

export const SecondaryButton = ({
  children,
  onClick,
  isValid = true,
  type = "button",
}: ButtonProps) => {
  return (
    <button
      onClick={onClick}
      type={type}
      className="w-40 rounded-lg py-3 flex justify-center items-center flex-row bg-lightOrange"
    >
      <p
        className={classNames(
          " text-lg tracking-wider font-Matter font-semibold",
          isValid ? "text-black" : "text-black"
        )}
      >
        {children}
      </p>
    </button>
  );
};
