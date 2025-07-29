import { useGetDriveFolders } from "@/lib/api";
import { updateActionsMetadata } from "@/lib/CustomHook";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

interface ConfigureSidebarProps {
  setShowFolders: (show: boolean) => void;
  setInputVal: (value: string) => void;
}

const ConfigureSidebar = ({
  setShowFolders,
  setInputVal,
}: ConfigureSidebarProps) => {
  const [tokenVal, setTokenVal] = useState("");
  const token = localStorage.getItem("token");
  const params = useParams();
  const eventSideBarRef = useRef<HTMLDivElement | null>(null);
  const zapId = params.id;
  const { gettingFolders, driveFolders } = useGetDriveFolders({
    token: tokenVal,
    enabled: !!tokenVal,
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        eventSideBarRef.current &&
        event.target instanceof Node &&
        !eventSideBarRef.current.contains(event.target)
      ) {
        setShowFolders(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [setShowFolders]);

  useEffect(() => {
    if (token) {
      setTokenVal(token);
    }
  }, [token]);
  return (
    <div
      ref={eventSideBarRef}
      className="absolute shadow-2xl right-full mr-2 top-8 border w-80 py-4 px-2 bg-white z-10"
    >
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
                  <span className="text-sm font-semibold">{val.name}</span>
                  <span className="text-sm text-[#808080] font-medium text-nowrap overflow-hidden">{`id:${val.id}`}</span>
                </div>
              )
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ConfigureSidebar;
