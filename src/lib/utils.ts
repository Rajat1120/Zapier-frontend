import axios from "axios";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

import { Edge } from "@xyflow/react";
import { CustomNode } from "./type";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function createZap({
  selectedTrigger,
  selectedActions,
  router,
}: {
  selectedTrigger: { id: string };
  selectedActions: Array<{ availableActionId: string; metadata: unknown }>;
  router: { push: (path: string) => void };
}): Promise<() => Promise<void>> {
  return async () => {
    if (!selectedTrigger?.id) {
      return;
    }

    await axios.post(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/zap`,
      {
        availableTriggerId: selectedTrigger.id,
        triggerMetadata: {},
        actions: selectedActions.map((a) => ({
          availableActionId: a.availableActionId,
          actionMetadata: a.metadata,
        })),
      },
      {
        headers: {
          Authorization: localStorage.getItem("token"),
        },
      }
    );

    router.push("/dashboard");
  };
}

export const addTrailingPlusNode = (
  nodeList: CustomNode[],
  edgeList: Edge[]
) => {
  // Always remove any existing dummy node and its edges before adding new one
  const filteredNodes = nodeList.filter((n) => n.id !== "dummy");
  const filteredEdges = edgeList.filter(
    (e) => e.source !== "dummy" && e.target !== "dummy"
  );
  const verticalGap = 100;
  const lastNodeId = filteredNodes[filteredNodes.length - 1].id;
  const dummyNodeId = "dummy";
  // Make dummy node invisible and non-interactive, but keep edge visible
  const dummyNode = {
    id: dummyNodeId,
    position: { x: 0, y: filteredNodes.length * verticalGap },
    data: { label: "" },
    connectable: false,
    style: { width: 240, height: 60, opacity: 0, pointerEvents: "none" },
  };
  filteredNodes.push(dummyNode);
  filteredEdges.push({
    id: `e${lastNodeId}-${dummyNodeId}`,
    source: lastNodeId,
    target: dummyNodeId,
    type: "custom",
  });
  // Mutate the arrays in place
  nodeList.length = 0;
  edgeList.length = 0;
  nodeList.push(...filteredNodes);
  edgeList.push(...filteredEdges);
};
