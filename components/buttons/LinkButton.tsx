"use client";

import { ReactNode } from "react";

export const LinkButton = ({
  children,
  onClick,
}: {
  children: ReactNode;
  onClick: () => void;
}) => {
  return (
    <div
      className="flex justify-center px-2 py-2 font-semibold cursor-default hover:bg-[var(--bgHover)]  text-sm rounded"
      onClick={onClick}
    >
      {children}
    </div>
  );
};
