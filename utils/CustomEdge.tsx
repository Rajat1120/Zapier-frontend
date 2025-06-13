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
  source,
  target,
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
            fontSize: 12,
            padding: "0px 0px",
            backgroundColor: "#fdf7f2",
            pointerEvents: "all",
            cursor: "pointer",
            zIndex: 1000,
          }}
          onClick={() => {
            const event = new CustomEvent("add-node", {
              detail: { edgeId: id },
            });
            window.dispatchEvent(event);
          }}
        >
          +
        </div>
      </EdgeLabelRenderer>
    </>
  );
};

export default CustomEdge;
