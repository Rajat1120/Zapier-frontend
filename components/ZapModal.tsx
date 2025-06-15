import { useEffect, useRef } from "react";

import type { Action } from "@/app/zap/[id]/page";

type Props = {
  actions: Action[];
  selectedNode: any;
  setSelectedNode: (node: any) => void;
  AvailableActions: Action[];
};

export default function ZapModal({
  actions,
  selectedNode,
  setSelectedNode,
  AvailableActions,
}: Props) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        setSelectedNode(null);
      }
    };
    window.addEventListener("mousedown", handleClickOutside);
    return () => {
      window.removeEventListener("mousedown", handleClickOutside);
    };
  }, [setSelectedNode]);
  if (!selectedNode) return null;
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.3)", // optional semi-transparent backdrop
        zIndex: 999,
      }}
    >
      <div
        ref={modalRef}
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          maxHeight: "70%",
          maxWidth: "60%",
          overflowY: "auto",
          transform: "translate(-50%, -50%)",
          backgroundColor: "white",
          border: "1px solid #ccc",
          padding: "16px",
          borderRadius: "8px",
          zIndex: 1000,
          minWidth: "300px",
        }}
      >
        <h3 style={{ marginBottom: "8px" }}>Node Details</h3>
        <pre>{}</pre>
      </div>
    </div>
  );
}
