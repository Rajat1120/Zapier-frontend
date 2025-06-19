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
            style={{
              position: "relative",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 16,
              height: 16,
              borderRadius: "50%",
              backgroundColor: "#fdf7f2",
              fontSize: 10,
              fontWeight: "bold",
              cursor: "pointer",
              transition: "transform 0.2s ease",
            }}
            onClick={() => {
              const event = new CustomEvent("add-node", {
                detail: { edgeId: id },
              });
              window.dispatchEvent(event);
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(1.2)";
              const tooltip = e.currentTarget.querySelector(
                ".tooltip"
              ) as HTMLElement | null;
              if (tooltip) tooltip.style.opacity = "1";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)";
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
