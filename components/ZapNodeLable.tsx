import Image from "next/image";
import React, { useState } from "react";
import ActionSideBar from "./ActionSideBar";
import { CustomNode, StrictEdge } from "@/lib/type";

export function ZapNodeLabel({
  match,
  index,
  icon,
  type,
  reactFlowParentWrapper,
  setNodes,
  setEdges,
}: {
  match?: { name: string; image: string; id?: string };
  index: number;
  icon: React.ReactNode;
  type: "trigger" | "action";
  reactFlowParentWrapper: React.RefObject<HTMLDivElement | null>;
  setNodes: React.Dispatch<React.SetStateAction<CustomNode[]>>;
  setEdges: React.Dispatch<React.SetStateAction<StrictEdge[]>>;
}) {
  const [showSideBar, setShowSideBar] = useState(false);

  const isEmpty = !match;
  const isDummy = match?.id === "action";

  const backgroundColor = isEmpty || isDummy ? "#eee" : "#ffffff";
  const labelText = type === "trigger" ? "Trigger" : "Action";

  return (
    <>
      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
        <div style={{ display: "flex", gap: "120px" }}>
          <div
            style={{
              fontSize: "8px",
              padding: "2px 6px",
              backgroundColor,
              borderRadius: "4px",
              fontWeight: "bold",
              display: "flex",
              justifyItems: "start",
              gap: "4px",
              width: "fit-content",
              border: "1px solid #cccccc",
            }}
          >
            {match && !isDummy ? (
              <div className="max-h-6 flex items-center gap-1">
                <Image
                  className="max-w-4 max-h-4"
                  height={12}
                  width={12}
                  src={match.image}
                  alt={match.name}
                />
                <span className="font-bold text-nowrap">{match.name}</span>
              </div>
            ) : (
              <div className="flex bg-[#eee] gap-1">
                {icon}
                {labelText}
              </div>
            )}
          </div>
          <div
            className="w-4 h-4 border border-white rounded-xs flex items-center fixed right-[15px] 
          transition-all duration-200 
          hover:bg-[#e7e4f9] hover:border-[#afa7fa]"
          >
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowSideBar(!showSideBar);
              }}
              className="fixed right-4 cursor-pointer"
            >
              <Image
                width={14}
                height={14}
                src={
                  "https://img.icons8.com/?size=100&id=84119&format=png&color=000000"
                }
                alt="menu"
              ></Image>
            </button>
          </div>
        </div>
        <div
          style={{
            fontSize: "10px",
            color: "#666666",
            textAlign: "left",
            fontWeight: "bold",
          }}
        >
          {index + 1}. Select the event that{" "}
          {type === "trigger" ? "starts" : "runs"} your zap
        </div>
      </div>
      {showSideBar && (
        <ActionSideBar
          setShowSideBar={setShowSideBar}
          parentRef={reactFlowParentWrapper}
          index={index}
          setNodes={setNodes}
          setEdges={setEdges}
        />
      )}
    </>
  );
}
