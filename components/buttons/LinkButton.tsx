"use client";

import { ReactNode } from "react";

export const LinkButton = ({
  children,
  onClick,
  cursor,
}: {
  children: ReactNode;
  onClick: () => void;
  cursor?: string;
}) => {
  return (
    <div
      className={`flex ${cursor} justify-center px-2 py-2 font-semibold  hover:bg-[var(--bgHover)]  text-sm rounded`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};
