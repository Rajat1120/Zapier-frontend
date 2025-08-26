import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import React, { useState, useRef } from "react";
import ConfigureModal from "./ConfigureModal";

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


export function useGetGmailLabels(googleAccessToken: string | null) {
  return useQuery({
    queryKey: ["gmail-labels"],
    queryFn: async () => {
      const res = await axios.get(
        "https://gmail.googleapis.com/gmail/v1/users/me/labels",
        {
          headers: {
            Authorization: `Bearer ${googleAccessToken}`,
          },
        }
      );

      if (!res.data?.labels) {
        throw new Error("No labels found");
      }

      return res.data.labels; // will be an array of labels
    },
    enabled: !!googleAccessToken, // only run when token exists
  });
}

const ConfigureGmail = () => {
  const token = localStorage.getItem("token");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const triggerRef = useRef<HTMLDivElement | null>(null);

  
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
        Label or mailbox <span className="text-[#ff6666]">*</span>
      </span>
      <div ref={triggerRef} onClick={handleClick} className="flex  justify-between border cursor-pointer hover:border-black text-sm font-semibold transition-all duration-500 p-2">
        <button
         
          className="border-none cursor-pointer outline-0"
          disabled={isLoading}
        >
          <span className="text-[#808080]">
            {isLoading
              ? "Loading..."
              : isError
              ? "Error fetching token"
              : "Choose value"}
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
        <ConfigureModal  setIsModalOpen={setIsModalOpen} googleAccessToken={googleAccessToken} triggerRef={triggerRef} />
      )}
     
    </div>
    
  );
};

export default ConfigureGmail;