import Image from "next/image";
import React from "react";

export function ZapNodeLabel({
  match,
  index,
  icon,
  type,
}: {
  match?: { name: string; image: string; id?: string };
  index: number;
  icon: React.ReactNode;
  type: "trigger" | "action";
}) {
  const isEmpty = !match;
  const isDummy = match?.id === "action";

  const backgroundColor = isEmpty || isDummy ? "#eee" : "#ffffff";
  const labelText = type === "trigger" ? "Trigger" : "Action";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
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
          <>
            <Image height={12} width={12} src={match.image} alt={match.name} />
            <span className="font-bold">{match.name}</span>
          </>
        ) : (
          <div className="flex bg-[#eee] gap-1">
            {icon}
            {labelText}
          </div>
        )}
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
  );
}
