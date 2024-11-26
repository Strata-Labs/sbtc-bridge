import { InformationCircleIcon } from "@heroicons/react/20/solid";

export function InfoAlert({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-1 ">
      <div className="w-full p-4 bg-lightOrange h-10 rounded-lg flex flex-row items-center gap-2">
        <InformationCircleIcon className="h-6 w-6 text-orange" />
        <p className="text-orange font-Matter font-semibold text-sm">
          {children}
        </p>
      </div>
    </div>
  );
}
