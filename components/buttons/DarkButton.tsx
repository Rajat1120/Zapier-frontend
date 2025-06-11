import { ReactNode } from "react";

export const DarkButton = ({
  children,
  onClick,
}: {
  children: ReactNode;
  onClick: () => void;
}) => {
  return (
    <div
      onClick={onClick}
      className={`flex flex-col justify-center px-8 py-2 cursor-pointer hover:bg-[#5449ba] bg-[#695be8] text-white rounded text-center`}
    >
      {children}
    </div>
  );
};
