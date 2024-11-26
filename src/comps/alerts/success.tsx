import { CheckCircleIcon } from "@heroicons/react/20/solid";

export function SuccessAlert({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-1 ">
      <div className="w-full p-4 bg-green-100 h-10 rounded-lg flex flex-row items-center gap-2">
        <CheckCircleIcon className="h-6 w-6 text-green-600" />
        <p className="text-green-600 font-Matter font-semibold text-sm">
          {children}
        </p>
      </div>
    </div>
  );
}
