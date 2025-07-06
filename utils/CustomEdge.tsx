import React from "react";
import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  EdgeProps,
} from "@xyflow/react";

const CustomEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  style = {},
  markerEnd,
}: EdgeProps) => {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
  });

  // Render "+" button for all edges (including trailing/dummy edge)
  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />
      <EdgeLabelRenderer>
        <div
          style={{
            position: "absolute",
            transform: "translate(-50%, -50%)",
            top: labelY,
            left: labelX,
            zIndex: 1000,
            pointerEvents: "all",
          }}
        >
          <div
            className="rounded-full bg-[#fdf7f2] hover:bg-[#695be8]  h-4 w-4 hover:scale-110 transition-all hover:text-white flex items-center justify-center text-xs font-bold cursor-pointer relative"
            onClick={() => {
              const event = new CustomEvent("add-node", {
                detail: { edgeId: id },
              });
              window.dispatchEvent(event);
            }}
            onMouseEnter={(e) => {
              const tooltip = e.currentTarget.querySelector(
                ".tooltip"
              ) as HTMLElement | null;
              if (tooltip) tooltip.style.opacity = "1";
            }}
            onMouseLeave={(e) => {
              const tooltip = e.currentTarget.querySelector(
                ".tooltip"
              ) as HTMLElement | null;
              if (tooltip) tooltip.style.opacity = "0";
            }}
          >
            +
            <div
              className="tooltip"
              style={{
                position: "absolute",
                top: "25%",
                left: "230%",
                transform: "translateX(-50%)",
                backgroundColor: "black",
                color: "white",
                padding: "2px 4px",
                borderRadius: "2px",
                fontSize: "6px",
                whiteSpace: "nowrap",
                pointerEvents: "none",
                opacity: 0,
                transition: "opacity 0.2s ease",
              }}
            >
              Add step
            </div>
          </div>
        </div>
      </EdgeLabelRenderer>
    </>
  );
};

export default CustomEdge;
