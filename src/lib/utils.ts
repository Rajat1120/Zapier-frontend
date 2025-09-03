import axios from "axios";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import ConfigureDocs from "../../components/ConfigureDocs";
import ConfigureSheets from "../../components/ConfigureSheets";
import { Edge } from "@xyflow/react";
import { CustomNode } from "./type";
import ConfigureGmail from "../../components/ConfigureGmail";
import ConfigureNotion from "../../components/ConfigureNotion";
import ConfigureDrive from "../../components/ConfigureDrive";
import ConfigureGmailActions from "../../components/ConfigureGmailActions";

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
  
  const verticalGap = 120;
  const lastNodeId = filteredNodes[filteredNodes.length - 1].id;
  const dummyNodeId = "dummy";
  
  // Make dummy node invisible and non-interactive, but keep edge visible
  const dummyNode = {
    id: dummyNodeId,
    position: { x: 0, y: filteredNodes.length * verticalGap },
    data: { label: "" },
    connectable: false,
    style: { width: 280, height: 70, opacity: 0, pointerEvents: "none" },
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

export function isWordIncluded(str1: string, str2: string) {

  const s1 = str1.toLowerCase().replace(/\s+/g, "");
  const s2 = str2.toLowerCase().replace(/\s+/g, "");
  return s2.includes(s1);
}

export const configureComponentMap = {
  "New Document in folder": ConfigureDocs,
  "New Spreadsheet row": ConfigureSheets,
  "New or Updated Spreadsheet Row": ConfigureSheets,
  "New Worksheet": ConfigureSheets,
  "New Attachment": ConfigureGmail,
  "New Conversation": ConfigureGmail,
  "New Email": ConfigureGmail,
  "New Comment": ConfigureNotion,
  "New Database Item": ConfigureNotion,
  "Updated Database Item": ConfigureNotion,
  "Updated Page": ConfigureNotion,
  "New File": ConfigureDrive,
  "New File in Folder": ConfigureDrive,
  "New Folder": ConfigureDrive,
  "Updated File": ConfigureDrive,
  // Gmail Actions
  "Add label to email": ConfigureGmailActions,
  "Archive Email": ConfigureGmailActions,
  "Delete Email": ConfigureGmailActions,
  
  // Add more mappings as needed
};
