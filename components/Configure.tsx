import { useGetDriveFolders, useHasServiceAccess } from "@/lib/api";
import React, { useEffect, useState } from "react";
import useStore from "../store";
import Image from "next/image";

const Configure = () => {
  const selectedNode = useStore((state) => state.selectedNode);
  const [tokenVal, setTokenVal] = useState("");
  const [showFolders, setShowFolders] = useState(false);

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-ignore
  const { name } = selectedNode?.data?.label?.props?.match;
  const token = localStorage.getItem("token");
  const { data, isLoading } = useHasServiceAccess(name, token);
  const email = data?.email;

  useEffect(() => {
    if (token) {
      setTokenVal(token);
    }
  }, [token]);

  const { gettingFolders, driveFolders } = useGetDriveFolders({
    token: tokenVal,
    enabled: !!tokenVal,
  });

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
        <div className="relative">
          <span>Folder</span>
          {!showFolders ? null : (
            <div className="absolute right-full mr-2 top-8 border w-80 py-4 px-2 bg-white z-10">
              {gettingFolders ? (
                "Loading..."
              ) : (
                <>
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-4 text-sm font-bold">
                      Select value for Folder
                    </span>
                    <button
                      onClick={() => setShowFolders(false)}
                      className="px-4 cursor-pointer  rounded-md"
                    >
                      <Image
                        alt="Close"
                        height={16}
                        width={16}
                        src={
                          "https://img.icons8.com/?size=100&id=88571&format=png&color=000000"
                        }
                      ></Image>
                    </button>
                  </div>
                  <div className="flex  max-h-94 overflow-scroll flex-col">
                    {driveFolders?.map(
                      (val: { name: string; id: string }, i: string) => (
                        <div
                          className="flex cursor-pointer hover:bg-[#efedfe] px-4 py-2 flex-col"
                          key={i}
                        >
                          <span className="text-sm font-semibold">
                            {val.name}
                          </span>
                          <span className="text-sm text-[#808080] font-medium text-nowrap overflow-hidden">{`id:${val.id}`}</span>
                        </div>
                      )
                    )}
                  </div>
                </>
              )}
            </div>
          )}
          <button
            onClick={() => setShowFolders(!showFolders)}
            className="flex items-center border cursor-pointer border-[#d7d3c9] p-2 mt-2 w-full justify-between"
          >
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
