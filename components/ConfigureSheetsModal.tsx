import React, { useEffect, useRef, useState } from "react";
import { updateActionsMetadata } from "@/lib/CustomHook";
import { useParams } from "next/navigation";
import useStore from "../store";

type GoogleFile = {
  id: string;
  name: string;
  rowCount?: number;
};

async function fetchSpreadsheets(accessToken: string | null): Promise<GoogleFile[]> {
  if (!accessToken) return [];
  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=mimeType='application/vnd.google-apps.spreadsheet' and trashed=false&fields=files(id,name)&pageSize=1000`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    }
  );
  const data = await res.json();
  return data.files || [];
}

async function fetchWorksheets(accessToken: string | null, spreadsheetId: string | null): Promise<GoogleFile[]> {
  if (!accessToken || !spreadsheetId) return [];
  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=sheets(properties(sheetId,title,gridProperties(rowCount)))`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    }
  );
  const data = await res.json();
  const sheets = data.sheets || [];
  return sheets.map((s: any) => ({ id: String(s.properties.sheetId), name: s.properties.title, rowCount: s.properties.gridProperties?.rowCount || 1 }));
}

async function fetchColumns(
  accessToken: string | null,
  spreadsheetId: string | null,
  worksheetName: string | null
): Promise<string[]> {
  if (!accessToken || !spreadsheetId || !worksheetName) return [];
  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(
      `${worksheetName}!1:1`
    )}?majorDimension=ROWS`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    }
  );
  const data = await res.json();
  const values: string[][] = data.values || [[]];
  const headers = values[0] || [];
  return headers.filter((h) => typeof h === "string" && h.trim().length > 0);
}

const ConfigureSheetsModal = ({
  setIsModalOpen,
  googleAccessToken,
  triggerRef,
  index,
  setIsUpdating,
  mode,
  selectedSpreadsheet,
  selectedWorksheetName,
  currentEvent,
}: {
  setIsModalOpen: (isOpen: boolean) => void;
  googleAccessToken: string | null;
  triggerRef: React.RefObject<HTMLDivElement | null>;
  index: number | undefined;
  setIsUpdating: (updating: boolean) => void;
  mode: "spreadsheet" | "worksheet" | "column";
  selectedSpreadsheet: { id: string; name: string } | null;
  selectedWorksheetName: string | null;
  currentEvent: string;
}) => {
  const modalContentRef = useRef<HTMLDivElement | null>(null);
  const params = useParams();
  const zapId = params.id;
  const actions = useStore((state) => state.actions);
  const setActions = useStore((state) => state.setActions);

  const [spreadsheets, setSpreadsheets] = useState<GoogleFile[]>([]);
  const [worksheets, setWorksheets] = useState<GoogleFile[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (
        modalContentRef.current &&
        event.target instanceof Node &&
        !modalContentRef.current.contains(event.target) &&
        !triggerRef?.current?.contains(event.target)
      ) {
        setIsModalOpen(false);
      }
    };

    window.addEventListener("mousedown", handleClickOutside, true);
    window.addEventListener("click", handleClickOutside, true);
    window.addEventListener("touchstart", handleClickOutside, true);

    return () => {
      window.removeEventListener("mousedown", handleClickOutside, true);
      window.removeEventListener("click", handleClickOutside, true);
      window.removeEventListener("touchstart", handleClickOutside, true);
    };
  }, [setIsModalOpen, triggerRef]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        document.body.style.pointerEvents = "none";
        setLoading(true);
        if (mode === "spreadsheet") {
          const files = await fetchSpreadsheets(googleAccessToken);
          if (!cancelled) setSpreadsheets(files);
        } else if (mode === "worksheet") {
          const ws = await fetchWorksheets(googleAccessToken, selectedSpreadsheet?.id || null);
          if (!cancelled) setWorksheets(ws);
        } else if (mode === "column") {
          const cols = await fetchColumns(
            googleAccessToken,
            selectedSpreadsheet?.id || null,
            selectedWorksheetName || null
          );
          if (!cancelled) setColumns(cols);
        }
      } finally {
        if (!cancelled) setLoading(false);
        document.body.style.pointerEvents = "auto";
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [googleAccessToken, mode, selectedSpreadsheet?.id, selectedWorksheetName]);

  const persistSpreadsheet = async (file: GoogleFile) => {
    setIsModalOpen(false);
    try {
      setIsUpdating(true);
      document.body.style.pointerEvents = "none";
      await updateActionsMetadata({
        zapId,
        metaData: {
          spreadsheetId: file.id,
          spreadsheetName: file.name,
          worksheetId: null as unknown as string,
          worksheetName: null as unknown as string,
          triggerColumnName: null as unknown as string,
          triggerEventSnapshot: currentEvent,
        },
        index,
      });
      if (typeof index === "number") {
        const newMeta = {
          spreadsheetId: file.id,
          spreadsheetName: file.name,
          worksheetId: null,
          worksheetName: null,
          triggerColumnName: null,
          triggerEventSnapshot: currentEvent,
        } as unknown as JSON;
        setActions(
          actions.map((a) => (a.index === index ? { ...a, metadata: newMeta } : a))
        );
      }
    } finally {
      setIsUpdating(false);
      document.body.style.pointerEvents = "auto";
    }
  };

  const persistWorksheet = async (worksheet: GoogleFile) => {
    if (!selectedSpreadsheet) return;
    setIsModalOpen(false);
    try {
      setIsUpdating(true);
      document.body.style.pointerEvents = "none";
      await updateActionsMetadata({
        zapId,
        metaData: {
          spreadsheetId: selectedSpreadsheet.id,
          spreadsheetName: selectedSpreadsheet.name,
          worksheetId: worksheet.id,
          worksheetName: worksheet.name,
          triggerColumnName: null as unknown as string,
          rowCount: worksheet.rowCount,
          triggerEventSnapshot: currentEvent,
        },
        index,
      });
      if (typeof index === "number") {
        const newMeta = {
          spreadsheetId: selectedSpreadsheet.id,
          spreadsheetName: selectedSpreadsheet.name,
          worksheetId: worksheet.id,
          worksheetName: worksheet.name,
          triggerColumnName: null,
          rowCount: worksheet.rowCount,
          triggerEventSnapshot: currentEvent,
        } as unknown as JSON;
        setActions(
          actions.map((a) => (a.index === index ? { ...a, metadata: newMeta } : a))
        );
      }
    } finally {
      setIsUpdating(false);
      document.body.style.pointerEvents = "auto";
    }
  };

  const persistColumn = async (columnName: string) => {
    if (!selectedSpreadsheet || !selectedWorksheetName) return;
    setIsModalOpen(false);
    try {
      setIsUpdating(true);
      document.body.style.pointerEvents = "none";
      await updateActionsMetadata({
        zapId,
        metaData: {
          spreadsheetId: selectedSpreadsheet.id,
          spreadsheetName: selectedSpreadsheet.name,
          worksheetName: selectedWorksheetName,
          triggerColumnName: columnName,
          triggerEventSnapshot: currentEvent,
        },
        index,
      });
      if (typeof index === "number") {
        const newMeta = {
          spreadsheetId: selectedSpreadsheet.id,
          spreadsheetName: selectedSpreadsheet.name,
          worksheetName: selectedWorksheetName,
          triggerColumnName: columnName,
          triggerEventSnapshot: currentEvent,
        } as unknown as JSON;
        setActions(
          actions.map((a) => (a.index === index ? { ...a, metadata: newMeta } : a))
        );
      }
    } finally {
      setIsUpdating(false);
      document.body.style.pointerEvents = "auto";
    }
  };

  return (
    <div
      ref={modalContentRef}
      className="absolute shadow-2xl right-full mr-2 top-40 border w-96 bg-white z-10 rounded-md flex flex-col"
    >
      <div className="flex items-center justify-between mb-4 border-b border-gray-100 px-4 py-4">
        <span className="text-sm font-bold">
          {mode === "spreadsheet" && "Select a spreadsheet"}
          {mode === "worksheet" && "Select a worksheet"}
          {mode === "column" && "Select a column"}
        </span>
        <button
          onClick={() => setIsModalOpen(false)}
          className="text-gray-500 hover:text-gray-700 h-10 w-10 cursor-pointer text-lg font-bold"
        >
          ×
        </button>
      </div>
      <div className="px-4 pb-4 max-h-96 overflow-y-auto">
        {(mode === "worksheet" && !selectedSpreadsheet) && (
          <p className="text-sm text-gray-500">Select a spreadsheet first.</p>
        )}
        {(mode === "column" && (!selectedSpreadsheet || !selectedWorksheetName)) && (
          <p className="text-sm text-gray-500">Select a spreadsheet and worksheet first.</p>
        )}
        <ul className="space-y-1">
          {loading && (
            <li className="p-2 text-sm rounded border-b border-gray-100 last:border-b-0 bg-gray-200 animate-pulse h-12" />
          )}
          {!loading && mode === "spreadsheet" && spreadsheets.map((file) => (
            <li
              key={file.id}
              onClick={() => persistSpreadsheet(file)}
              className="p-2 text-sm hover:bg-gray-100 rounded cursor-pointer border-b border-gray-100 last:border-b-0"
            >
              <div className="flex items-center gap-2">
                <div className="min-w-4 min-h-4 border-2 border-gray-400 rounded-full" />
                <div className="flex flex-col">
                  <span className="font-medium">{file.name}</span>
                  <span className="text-xs text-gray-500">{`ID: ${file.id}`}</span>
                </div>
              </div>
            </li>
          ))}
          {!loading && mode === "worksheet" && worksheets.map((sheet) => (
            <li
              key={sheet.id}
              onClick={() => persistWorksheet(sheet)}
              className="p-2 text-sm hover:bg-gray-100 rounded cursor-pointer border-b border-gray-100 last:border-b-0"
            >
              <div className="flex items-center gap-2">
                <div className="min-w-4 min-h-4 border-2 border-gray-400 rounded-full" />
                <div className="flex flex-col">
                  <span className="font-medium">{sheet.name}</span>
                  <span className="text-xs text-gray-500">{`ID: ${sheet.id}`}</span>
                </div>
              </div>
            </li>
          ))}
          {!loading && mode === "column" && columns.map((col) => (
            <li
              key={col}
              onClick={() => persistColumn(col)}
              className="p-2 text-sm hover:bg-gray-100 rounded cursor-pointer border-b border-gray-100 last:border-b-0"
            >
              <div className="flex items-center gap-2">
                <div className="min-w-4 min-h-4 border-2 border-gray-400 rounded-full" />
                <div className="flex flex-col">
                  <span className="font-medium">{col}</span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ConfigureSheetsModal;


