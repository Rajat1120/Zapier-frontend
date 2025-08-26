import { useHasServiceAccess } from "@/lib/api";
import React, { useEffect, useState } from "react";
import useStore from "../store";

import ConfigureDocsModal from "./ConfigureDocsModal";
import { isWordIncluded } from "@/lib/utils";

const ConfigureDocs = () => {
  const selectedNode = useStore((state) => state.selectedNode);

  const [showFolders, setShowFolders] = useState(false);
  const [inputVal, setInputVal] = useState("root");
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-ignore
  const { name } = selectedNode?.data?.label?.props?.match;
  const token = localStorage.getItem("token");
  const { data, isLoading } = useHasServiceAccess(name, token);
  const email = data?.email;

  
  
  const actions = useStore((state) => state.actions);
  const index = actions.find((action) => isWordIncluded(action.actionId, name))?.index;
  
  


  useEffect(() => {
    const trigger = actions.find((action) => action.index === 0);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-expect-error
    setInputVal(trigger?.metadata?.folderName || "root");
  }, [actions]);

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
            <ConfigureDocsModal
              index={index }
              setShowFolders={setShowFolders}
              setInputVal={setInputVal}
            ></ConfigureDocsModal>
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

export default ConfigureDocs;
