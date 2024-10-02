import { useFormik } from "formik";
import { PrimaryButton } from "./FlowButtons";
// this is supposed to be as reusable as possible given all the flows are very similar in order and action
type FlowFormProps = {
  nameKey: string;
  placeholder: string;
  initialValue?: string;
  handleSubmit: (value: string | undefined) => void;
  type?: "text" | "number";
  children?: React.ReactNode;
};
// tailwind div that reset all default form styles

export const FlowForm = ({
  nameKey,
  placeholder,
  initialValue,
  handleSubmit,
  type,
  children,
}: FlowFormProps) => {
  const formik = useFormik({
    initialValues: {
      [nameKey]: initialValue,
    },
    onSubmit: (values) => {
      console.log(values);
      handleSubmit(values[nameKey]);
    },
  });

  return (
    <form
      className="w-full flex flex-1 flex-col gap-14 justify-end"
      onSubmit={formik.handleSubmit}
    >
      <div className="relative ">
        <input
          type={type}
          name={nameKey}
          placeholder={placeholder}
          value={formik.values[nameKey]}
          onChange={formik.handleChange}
          className={`w-full py-2 border-b-2 bg-transparent text-xl text-black focus:outline-none placeholder-gray-300 ${
            formik.isValid ? "border-orange" : "border-midGray"
          } transition-colors duration-500`}
        />
      </div>
      <div className="w-full flex-row flex justify-between items-center">
        {children}
        <PrimaryButton
          type="submit"
          onClick={formik.handleSubmit}
          isValid={formik.isValid}
        >
          NEXT
        </PrimaryButton>
      </div>
    </form>
  );
};
