import Image from "next/image";
import { useEffect, useRef } from "react";
import useStore from "../store";
import { Action, CustomNode, StrictEdge } from "@/lib/type";
import { useParams } from "next/navigation";
import { updateZap } from "../utils/HelperFunctions";
import { ParamValue } from "next/dist/server/request/params";

interface ActionSideBarProps {
  setShowSideBar: (show: boolean) => void;
  parentRef: React.RefObject<HTMLDivElement | null>; // new prop
  index: number;
  setNodes: React.Dispatch<React.SetStateAction<CustomNode[]>>;
  setEdges: React.Dispatch<React.SetStateAction<StrictEdge[]>>;
}

export default function ActionSideBar({
  setShowSideBar,
  parentRef,
  index,
  setNodes,
  setEdges,
}: ActionSideBarProps) {
  const actionRef = useRef<HTMLDivElement>(null);
  const setActions = useStore((state) => state.setActions);
  const actions = useStore((state) => state.actions);
  const params = useParams();
  useEffect(() => {
    const parent = parentRef.current;

    if (!parent) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        actionRef.current &&
        event.target instanceof Node &&
        !actionRef.current.contains(event.target)
      ) {
        setShowSideBar(false);
      }
    };

    parent.addEventListener("click", handleClickOutside);
    return () => {
      parent.removeEventListener("click", handleClickOutside);
    };
  }, [parentRef, setShowSideBar]);
  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        updateActionsAfterDelete(
          index,
          setNodes,
          setEdges,
          setActions,
          actions,
          setShowSideBar, // Add this parameter
          params.id
        );
      }}
      ref={actionRef}
      className="py-1 hover:text-[#ff0000]   text-xs shadow-2xl fixed left-[245px] hover:bg-[#f9dddd] border rounded-xs border-[#cccccc]    justify-center flex items-center  top-[5px] px-4 bg-white  z-50 "
    >
      <span className="text-nowrap  font-medium flex justify-center items-center gap-x-1  text-[8px]">
        <Image
          height={10}
          width={10}
          alt="Delete icon"
          src={
            "https://img.icons8.com/?size=100&id=68138&format=png&color=000000"
          }
        ></Image>
        Delete
      </span>
    </div>
  );
}

function updateActionsAfterDelete(
  index: number,
  setNodes: React.Dispatch<React.SetStateAction<CustomNode[]>>,
  setEdges: React.Dispatch<React.SetStateAction<StrictEdge[]>>,
  setActions: (val: Action[]) => void,
  actions: Action[],
  setShowSideBar: (show: boolean) => void,
  params: ParamValue
) {
  // Step 1: Remove the action at the specified index
  const updatedActions = actions.filter((action) => action.index !== index);

  // Step 2: Update remaining actions' indexes (shift down those after deleted index)
  const finalActions = updatedActions.map((action) => ({
    actionId: action.actionId,
    metadata: action.metadata,
    sortingOrder: action.sortingOrder,
    index: action.index > index ? action.index - 1 : action.index,
  }));

  // Step 3: Update nodes - remove the node at the specified index
  setNodes((prevNodes) => {
    const filteredNodes = prevNodes.filter(
      (_, nodeIndex) => nodeIndex !== index
    );

    // Recalculate positions and update node IDs to be sequential
    const verticalGap = 100;
    const updatedNodes = filteredNodes.map((node, nodeIndex) => ({
      ...node,
      id: (nodeIndex + 1).toString(),
      position: { x: 0, y: nodeIndex * verticalGap },
    }));

    return updatedNodes;
  });

  // Step 4: Update edges to connect remaining nodes properly
  setEdges(() => {
    const newEdges = [];

    // Get the updated node count (one less than before)
    const nodeCount = actions.length - 1;

    // Create sequential edges between remaining nodes
    for (let i = 0; i < nodeCount - 1; i++) {
      newEdges.push({
        id: `e${i + 1}-${i + 2}`,
        source: (i + 1).toString(),
        target: (i + 2).toString(),
        type: "custom",
      });
    }

    // Add trailing plus node edge if needed (based on your existing pattern)
    if (nodeCount > 0) {
      newEdges.push({
        id: `e${nodeCount}-dummy`,
        source: nodeCount.toString(),
        target: "dummy",
        type: "custom",
      });
    }

    return newEdges;
  });

  // Step 5: Update the actions state
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-ignore
  setActions(finalActions);
  updateZap(params, finalActions);
  // Step 6: Close the sidebar
  setShowSideBar(false);
}
