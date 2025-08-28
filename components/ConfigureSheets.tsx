import React, { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import useStore from "../store";
import { isWordIncluded } from "@/lib/utils";
import ConfigureSheetsModal from "./ConfigureSheetsModal";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

function useGetGoogleAccessToken(token: string | null) {
  return useQuery({
    queryKey: ["google-access-token"],
    queryFn: async () => {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/google-token/accessToken`,
        {
          headers: {
            Authorization: token,
          },
        }
      );
      return res.data.access_token;
    },
    enabled: !!token,
  });
}

const ConfigureSheets = () => {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdatingSpreadsheet, setIsUpdatingSpreadsheet] = useState(false);
  const [isUpdatingWorksheet, setIsUpdatingWorksheet] = useState(false);
  const [isUpdatingColumn, setIsUpdatingColumn] = useState(false);
  const spreadsheetTriggerRef = useRef<HTMLDivElement | null>(null);
  const worksheetTriggerRef = useRef<HTMLDivElement | null>(null);
  const columnTriggerRef = useRef<HTMLDivElement | null>(null);
  const [activeMode, setActiveMode] = useState<"spreadsheet" | "worksheet" | "column">("spreadsheet");
  const selectedNode = useStore((state) => state.selectedNode);
  const zapTriggerMeta = useStore((state) => state.zapTriggerMeta);
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-ignore
  const { name } = selectedNode?.data?.label?.props?.match;

  const actions = useStore((state) => state.actions);
  const index = actions.find((action) => isWordIncluded(action.actionId, name))?.index;
  const matchedAction = typeof index === "number"
    ? actions.find((action) => action.index === index)
    : actions.find((action) => isWordIncluded(action.actionId, name));
  const metadata = matchedAction?.metadata;
  const actionEventFromAction = matchedAction?.actionEvent || null;
  const actionEventFromTrigger = zapTriggerMeta?.triggerEvent || null;
  const effectiveEvent = (actionEventFromTrigger || actionEventFromAction || "").toString();
  const normalizedActionEvent = effectiveEvent.toLowerCase().trim();
  const spreadsheetId = (metadata as { spreadsheetId?: string } | undefined)?.spreadsheetId;
  const spreadsheetName = (metadata as { spreadsheetName?: string } | undefined)?.spreadsheetName;
  const worksheetId = (metadata as { worksheetId?: string } | undefined)?.worksheetId;
  const worksheetName = (metadata as { worksheetName?: string } | undefined)?.worksheetName;
  const triggerColumnName = (metadata as { triggerColumnName?: string } | undefined)?.triggerColumnName;

  const { data: googleAccessToken, isLoading, isError } = useGetGoogleAccessToken(token);
  const previousEventRef = useRef<string | null>(null);
  const params = useParams();

  const openSpreadsheetModal = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveMode("spreadsheet");
    setIsModalOpen(true);
  };

  const openWorksheetModal = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveMode("worksheet");
    setIsModalOpen(true);
  };

  const openColumnModal = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveMode("column");
    setIsModalOpen(true);
  };

  // Reset metadata when trigger event changes
  useEffect(() => {
    if (!normalizedActionEvent) return;
    // Only reset if the event actually changed after initial mount
    if (previousEventRef.current === null) {
      previousEventRef.current = normalizedActionEvent;
      return;
    }
    if (previousEventRef.current === normalizedActionEvent) return;
    previousEventRef.current = normalizedActionEvent;
    if (typeof index !== "number") return;
    // Clear metadata locally
    const setActions = useStore.getState().setActions;
    const currentActions = useStore.getState().actions;
    const clearedMeta = {} as unknown as JSON;
    setActions(
      currentActions.map((a) => (a.index === index ? { ...a, metadata: clearedMeta } : a))
    );
    // Clear in DB
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore
    import("@/lib/CustomHook").then(({ updateActionsMetadata }) => {
      const paramsZapId = params.id;
      if (!paramsZapId) return;
      // send empty object so backend overwrites prior values
      void updateActionsMetadata({
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-ignore
        zapId: paramsZapId,
        metaData: {},
        index,
      });
    });
  }, [normalizedActionEvent, index, params.id]);

  return (
    <div className="flex p-5 flex-col gap-y-2">
      <span className="text-sm font-semibold text-[#333333]">
        Spreadsheet <span className="text-[#ff6666]">*</span>
      </span>
      <div
        ref={spreadsheetTriggerRef}
        onClick={openSpreadsheetModal}
        className="flex justify-between border cursor-pointer hover:border-black text-sm font-semibold transition-all duration-500 p-2"
      >
        <button className="border-none cursor-pointer outline-0" disabled={isLoading || isUpdatingSpreadsheet}>
          <span className={`${spreadsheetName ? "text-black" : "text-[#808080]"}`}>
            {isUpdatingSpreadsheet ? "Saving..." : isLoading ? "Loading..." : isError ? "Error" : spreadsheetName || "Choose value"}
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
      {/* Show Worksheet only when trigger is NOT "New worksheet" and NOT empty */}
      {normalizedActionEvent !== "new worksheet" && (
        <>
          <span className="text-sm font-semibold text-[#333333]">
            Worksheet <span className="text-[#ff6666]">*</span>
          </span>
          <div
            ref={worksheetTriggerRef}
            onClick={(e) => {
              if (!spreadsheetId) return; // require spreadsheet first
              openWorksheetModal(e);
            }}
            className="flex justify-between border cursor-pointer hover:border-black text-sm font-semibold transition-all duration-500 p-2"
          >
            <button className="border-none cursor-pointer outline-0" disabled={isLoading || isUpdatingWorksheet || !spreadsheetId}>
              <span className={`${worksheetName ? "text-black" : "text-[#808080]"}`}>
                {isUpdatingWorksheet ? "Saving..." : isLoading ? "Loading..." : isError ? "Error" : worksheetName || "Choose value"}
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
        </>
      )}

      {/* Show Trigger Column only when NOT "New worksheet" and NOT "New spreadsheet row" */}
      {normalizedActionEvent !== "new worksheet" && normalizedActionEvent !== "new spreadsheet row" && (
        <>
          <span className="text-sm font-semibold text-[#333333] mt-2">
            Trigger Column <span className="text-[#ff6666]">*</span>
          </span>
          <div
            ref={columnTriggerRef}
            onClick={(e) => {
              if (!spreadsheetId || !worksheetName) return; // require both first
              openColumnModal(e);
            }}
            className="flex justify-between border cursor-pointer hover:border-black text-sm font-semibold transition-all duration-500 p-2"
          >
            <button className="border-none cursor-pointer outline-0" disabled={isLoading || isUpdatingColumn || !spreadsheetId || !worksheetName}>
              <span className={`${triggerColumnName ? "text-black" : "text-[#808080]"}`}>
                {isUpdatingColumn ? "Saving..." : isLoading ? "Loading..." : isError ? "Error" : triggerColumnName || "Choose value"}
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
        </>
      )}

      {isModalOpen && (
        <ConfigureSheetsModal
          setIsModalOpen={setIsModalOpen}
          googleAccessToken={googleAccessToken}
          triggerRef={activeMode === "spreadsheet" ? spreadsheetTriggerRef : activeMode === "worksheet" ? worksheetTriggerRef : columnTriggerRef}
          index={index}
          setIsUpdating={activeMode === "spreadsheet" ? setIsUpdatingSpreadsheet : activeMode === "worksheet" ? setIsUpdatingWorksheet : setIsUpdatingColumn}
          mode={activeMode}
          selectedSpreadsheet={spreadsheetId && spreadsheetName ? { id: spreadsheetId, name: spreadsheetName } : null}
          selectedWorksheetName={worksheetName || null}
          currentEvent={effectiveEvent}
        />
      )}
    </div>
  );
};

export default ConfigureSheets;
