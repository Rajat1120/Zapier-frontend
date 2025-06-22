import { useEffect } from "react";
import { addTrailingPlusNode } from "./utils";
import { CustomNode, StrictEdge } from "../../components/ActionList";
import useStore from "../../store";

type UseAddNodeParams = {
  nodes: CustomNode[];
  edges: StrictEdge[];
  setNodes: React.Dispatch<React.SetStateAction<CustomNode[]>>;
  setEdges: React.Dispatch<React.SetStateAction<StrictEdge[]>>;
};

export const handleAddNode = (
  event: CustomEvent,
  edges: StrictEdge[],
  nodes: CustomNode[],

  setNodes: React.Dispatch<React.SetStateAction<CustomNode[]>>,
  setEdges: React.Dispatch<React.SetStateAction<StrictEdge[]>>,
  selectedActions: { sortingOrder: string | number; name: string }[]
) => {
  const { edgeId } = event?.detail;
  const edgeToSplit = edges?.find((e) => e.id === edgeId);
  if (!edgeToSplit) return;

  // Remove existing dummy node and all edges involving dummy
  const filteredNodes = nodes.filter((n) => n.id !== "dummy");

  const { source, target } = edgeToSplit;

  const newNodeId = (filteredNodes.length + 1).toString();

  const sourceIndex = filteredNodes.findIndex((n) => n.id === source);
  const targetIndex = filteredNodes.findIndex((n) => n.id === target);

  // Allow dummy target for trailing edge
  const isTrailing = target === "dummy";
  if (sourceIndex === -1 || (!isTrailing && targetIndex === -1)) return;

  const newNode = {
    id: newNodeId,
    position: { x: 0, y: 0 }, // temporary
    data: { label: newNodeId },
    connectable: false,
    style: { width: 240, height: 60 },
  };

  const newNodeList = [...filteredNodes];

  const insertIndex = isTrailing
    ? sourceIndex + 1
    : Math.max(sourceIndex, targetIndex);
  newNodeList.splice(insertIndex, 0, newNode);

  const verticalGap = 100;
  const updatedNodes = newNodeList.map((node, index) => {
    const isSelected = selectedActions.find(
      (val) => Number(val.sortingOrder) === Number(node.id)
    );

    //if already selected , only update the label
    if (isSelected) {
      const originalLabel = node.data.label;

      // Clone the two children only if originalLabel is a valid React element
      if (
        typeof originalLabel === "object" &&
        originalLabel !== null &&
        "props" in originalLabel &&
        Array.isArray(originalLabel.props.children)
      ) {
        const [topDiv, bottomDiv] = originalLabel.props.children;

        // Replace the number inside the second child
        const newBottomDiv = {
          ...bottomDiv,
          props: {
            ...bottomDiv.props,
            children: [
              `${index + 1}`,
              ". Select the event that starts your zap",
            ],
          },
        };

        const newLabel = {
          ...originalLabel,
          props: {
            ...originalLabel.props,
            children: [topDiv, newBottomDiv],
          },
        };

        return {
          ...node,
          position: { x: 0, y: index * verticalGap },
          data: { ...node.data, label: newLabel },
        };
      }
    }

    const label = updateLabel(node.id, index);

    return {
      ...node,
      position: { x: 0, y: index * verticalGap },
      data: { label },
    };
  });

  const updatedEdges = [];

  for (let i = 0; i < updatedNodes.length - 1; i++) {
    updatedEdges.push({
      id: `e${updatedNodes[i].id}-${updatedNodes[i + 1].id}`,
      source: updatedNodes[i].id,
      target: updatedNodes[i + 1].id,
      type: "custom",
    });
  }

  addTrailingPlusNode(updatedNodes, updatedEdges);
  
  setNodes(updatedNodes);
  setEdges(updatedEdges);
};

export const useAddNode = ({
  nodes,
  edges,
  setNodes,
  setEdges,
}: UseAddNodeParams) => {
  const selectedActions = useStore((state) => state.selectedActions);

  useEffect(() => {
    const listener = (event: Event) => {
      
      handleAddNode(
        event as CustomEvent,
        edges,
        nodes,
        setNodes,
        setEdges,
        selectedActions
      );
    };

    window.addEventListener("add-node", listener);

    return () => {
      window.removeEventListener("add-node", listener);
    };
  }, [nodes, edges, setNodes, setEdges, selectedActions]);
};

function updateLabel(id: string, index: number) {
  let label;
  if (id === "1") {
    label = (
      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
        <div
          style={{
            fontSize: "8px",
            padding: "2px 6px",
            backgroundColor: "#eee",
            borderRadius: "4px",
            fontWeight: "bold",
            display: "flex",
            justifyItems: "start",
            gap: "4px",
            width: "fit-content",
            border: "1px solid black",
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            height="14"
            width="14"
            color="GrayWarm8"
            name="miscBolt"
          >
            <path
              fill="#2D2E2E"
              d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Zm4.87-11L11 18v-5H7.13L13 6v5h3.87Z"
            ></path>
          </svg>
          Trigger
        </div>
        <div
          style={{
            fontSize: "10px",
            color: "#666666",
            textAlign: "left",
            fontWeight: "bold",
          }}
        >
          1. Select the event that starts your zap
        </div>
      </div>
    );
  } else {
    label = (
      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
        <div
          style={{
            fontSize: "8px",
            padding: "2px 6px",
            backgroundColor: "#eee",
            borderRadius: "4px",
            fontWeight: "bold",
            display: "flex",
            justifyItems: "start",
            gap: "4px",
            width: "fit-content",
            border: "1px solid black",
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            height="14"
            width="14"
            color="GrayWarm8"
            name="miscBolt"
          >
            <path
              fill="#2D2E2E"
              d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Zm4.87-11L11 18v-5H7.13L13 6v5h3.87Z"
            ></path>
          </svg>
          Action
        </div>
        <div
          style={{
            fontSize: "10px",
            color: "#666666",
            textAlign: "left",
            fontWeight: "bold",
          }}
        >
          {index + 1}. Select the event for your zap to run
        </div>
      </div>
    );
  }

  return label;
}
