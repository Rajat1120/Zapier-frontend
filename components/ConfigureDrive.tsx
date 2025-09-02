import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import React, { useState, useRef } from "react";


import useStore from "../store";
import { isWordIncluded } from "@/lib/utils";
import ConfigureDriveModal from "./ConfigureDriveModal";

function useGetGoogleAccessToken(token: string | null) {
  return useQuery({
    queryKey: ["google-access-token"],
    queryFn: async () => {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/google-token/accessToken`,
        {
          headers: {
            Authorization: token, // convention
          },
        }
      );
      
      // backend should return { accessToken: "..." }
      return res.data.access_token;
    },
    enabled: !!token, // only run if token exists
  });
}

const ConfigureDrive = () => {
  const token = localStorage.getItem("token");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const triggerRef = useRef<HTMLDivElement | null>(null);
  const selectedNode = useStore((state) => state.selectedNode);
   // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-ignore
  const { name } = selectedNode?.data?.label?.props?.match;

  const actions = useStore((state) => state.actions);
  const index = actions.find((action) => isWordIncluded(action.actionId, name))?.index;
  const metadata = actions.find((action) => isWordIncluded(action.actionId, name))?.metadata;
  const folderName = (metadata as { folderName?: string } | undefined)?.folderName;
  const {
    data: googleAccessToken,
    isLoading,
    isError,
    error,
  } = useGetGoogleAccessToken(token);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsModalOpen((val) => !val);
  };

  return (
    <div className="flex p-5  flex-col gap-y-2">
      <span className="text-sm font-semibold text-[#333333]">
        Folder <span className="text-[#ff6666]">*</span>
      </span>
      <div ref={triggerRef} onClick={handleClick} className="flex  justify-between border cursor-pointer hover:border-black text-sm font-semibold transition-all duration-500 p-2">
        <button
          className="border-none cursor-pointer outline-0"
          disabled={isLoading || isUpdating}
        >
          <span className={`${folderName ? "text-black" : "text-[#808080]"}`}>
            {isUpdating
              ? "Saving..."
              : isLoading
              ? "Loading..."
              : isError
              ? "Error fetching token"
              : folderName || "Choose value"}
          </span>
        </button>
        <div>
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
        </div>
      </div>
       {isModalOpen && (
        <ConfigureDriveModal
          setIsModalOpen={setIsModalOpen} 
          googleAccessToken={googleAccessToken} 
          triggerRef={triggerRef} 
          index={index} 
          setIsUpdating={setIsUpdating} 
        />
      )}
    </div>
  );
};

export default ConfigureDrive;
