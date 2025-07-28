import { useGetDriveFolders, useHasServiceAccess } from "@/lib/api";
import React, { useEffect, useState } from "react";
import useStore from "../store";
import Image from "next/image";
import { updateActionsMetadata } from "@/lib/CustomHook";
import { useParams } from "next/navigation";

const Configure = () => {
  const selectedNode = useStore((state) => state.selectedNode);
  const [tokenVal, setTokenVal] = useState("");
  const [showFolders, setShowFolders] = useState(false);
  const [inputVal, setInputVal] = useState("");
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-ignore
  const { name } = selectedNode?.data?.label?.props?.match;
  const token = localStorage.getItem("token");
  const { data, isLoading } = useHasServiceAccess(name, token);
  const email = data?.email;
  const params = useParams();
  const zapId = params.id;

  const actions = useStore((state) => state.actions);

  useEffect(() => {
    const trigger = actions.find((action) => action.index === 0);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-expect-error
    setInputVal(trigger?.metadata?.folderName || "");
  }, [actions]);

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
      <div className="p-4 flex flex-col space-y-4">
        <div>
          <span className="text-sm font-semibold">Drive</span>
          <input
            value={isLoading ? "Loading..." : email}
            className="h-10 mt-2 text-sm font-semibold p-4 w-full border"
            type="text"
          />
        </div>
        <div className="relative">
          <span className="text-sm font-semibold">Folder</span>
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
                          onClick={() => {
                            setInputVal(val.name);
                            setShowFolders(false);
                            updateActionsMetadata({
                              zapId,
                              metaData: {
                                folderId: val.id,
                                folderName: val.name,
                              },
                            });
                          }}
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
            className="flex items-center border  cursor-pointer border-[#d7d3c9] p-2 mt-2 w-full justify-between"
          >
            <div className="w-full flex items-center">
              <span className="px-2 text-sm font-semibold">
                {inputVal ? inputVal : null}
              </span>
            </div>
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
          </button>
        </div>
      </div>
    </div>
  );
};

export default Configure;
