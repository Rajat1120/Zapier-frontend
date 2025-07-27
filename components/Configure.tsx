import { useHasServiceAccess } from "@/lib/api";
import React from "react";
import useStore from "../store";

const Configure = () => {
  const selectedNode = useStore((state) => state.selectedNode);
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-ignore
  const { name } = selectedNode?.data?.label?.props?.match;
  const token = localStorage.getItem("token");
  const { data, isLoading } = useHasServiceAccess(name, token);
  const email = data?.email;
  return (
    <div className="h-full">
      <div className="p-4">
        <div>
          <span>Drive</span>
          <input
            value={isLoading ? "Loading..." : email}
            className="h-10 p-4 w-full border"
            type="text"
          />
        </div>
        <div>
          <span>Folder</span>
          <button className="flex items-center border cursor-pointer border-[#d7d3c9]  p-2 mt-2 w-full justify-between">
            <div className="w-full"></div>
            <svg
              width="20"
              height="20"
              viewBox="0 0 32 32"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
            >
              <path
                stroke="#535358"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 20l7 7 7-7M23 12l-7-7-7 7"
              ></path>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Configure;
