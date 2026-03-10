"use client";

import { useEffect, useState } from "react";
import { addTrailingPlusNode, VERTICAL_GAP } from "./utils";
import {
  Action,
  AvailableAction,
  CustomNode,
  SelectedAction,
  StrictEdge,
  UpdatedAction,
} from "../../src/lib/type";
import useStore from "../../store";
import Image from "next/image";
import { icon } from "./reactFlow";
import { useParams } from "next/navigation";
import { ParamValue } from "next/dist/server/request/params";
import { updateZap } from "../../utils/HelperFunctions";
import { JSX } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

type UseAddNodeParams = {
  nodes: CustomNode[];
  edges: StrictEdge[];
  setNodes: React.Dispatch<React.SetStateAction<CustomNode[]>>;
  setEdges: React.Dispatch<React.SetStateAction<StrictEdge[]>>;
  refetchActions: () => void;
};

export const handleAddNode = (
  event: CustomEvent,
  edges: StrictEdge[],
  nodes: CustomNode[],

  setNodes: React.Dispatch<React.SetStateAction<CustomNode[]>>,
  setEdges: React.Dispatch<React.SetStateAction<StrictEdge[]>>,
  selectedActions: SelectedAction[],
  actions: Action[],
  AvailableActions: AvailableAction[],
  params: ParamValue,
  selectedAction: AvailableAction | null,
  filterNodes: CustomNode[],
  setActions: React.Dispatch<React.SetStateAction<UpdatedAction[]>>,
  setSelectedActions: React.Dispatch<
    React.SetStateAction<SelectedAction[] | null>
  >,
  refetchActions: () => void
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

  const verticalGap = VERTICAL_GAP;

  let newNodes: UpdatedAction[];

  if (newNodeList.length > actions.length && params?.length) {
    setSelectedActions(null);
    newNodes = updateActionsAfterInsert(actions, newNodeList);
    setActions(newNodes);

    async function help() {
      if (!params?.length) return;

      await updateZap(params, newNodes);
      // Removed refetchActions() to prevent timing conflicts during node operations
    }

    help();
  }

  const updatedNodes = newNodeList.map((node, index) => {
    let label: string | JSX.Element;

    if (index === 0) {
      let match;
      if (actions.length) {
        const triggerFromSelectedAction = actions.find(
          (action) => action.index === 0
        );
        if (
          triggerFromSelectedAction &&
          triggerFromSelectedAction.actionId !== "action"
        ) {
          match = AvailableActions.find(
            (available) => triggerFromSelectedAction?.actionId === available.id
          );
        }
      }

      label = (
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <div
            style={{
              fontSize: "8px",
              padding: "2px 6px",
              backgroundColor: `${match ? "#ffffff" : "#eee"}`,
              borderRadius: "4px",
              fontWeight: "bold",
              display: "flex",
              justifyItems: "start",
              gap: "4px",
              width: "fit-content",
              border: "1px solid #cccccc",
            }}
          >
            {match ? (
              <>
                <Image
                  height={12}
                  width={12}
                  src={match.image}
                  alt={match.name}
                />
                <span className="font-bold">{match.name}</span>
              </>
            ) : (
              <div className="flex bg-[#eee] gap-1">{icon}Trigger</div>
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
            {index + 1}. Select the event that starts your zap
          </div>
        </div>
      );

      return {
        ...node,
        data: { label },
        position: { x: 0, y: index * verticalGap },
      };
    }

    if (
      actions.length &&
      actions.some((val) => val.sortingOrder === +node.id) &&
      !selectedActions.some((val) => val.index === index)
    ) {
      const curNode = actions.find((val) => val.index === index);

      const match = AvailableActions.find(
        (available) => curNode?.actionId === available.id
      );

      label = (
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <div
            style={{
              fontSize: "8px",
              padding: "2px 6px",
              backgroundColor: `${
                match ? (match?.id === "action" ? "#eee" : "#ffffff") : "#eee"
              }`,
              borderRadius: "4px",
              fontWeight: "bold",
              display: "flex",
              justifyItems: "start",
              gap: "4px",
              width: "fit-content",
              border: "1px solid #cccccc",
            }}
          >
            {match ? (
              match.id === "action" ? (
                <div className="flex bg-[#eee] gap-1">
                  {icon}
                  {index === 0 ? "Trigger" : "Action"}
                </div>
              ) : (
                <>
                  <Image
                    height={12}
                    width={12}
                    src={match.image}
                    alt={match.name}
                  />
                  <span className="font-bold">{match.name}</span>
                </>
              )
            ) : (
              <div className="flex bg-[#eee] gap-1">{icon}Action</div>
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
            {index + 1}. Select the event that runs your zap
          </div>
        </div>
      );

      return {
        ...node,
        data: { label },
        position: { x: 0, y: index * verticalGap },
      };
    } else if (
      actions.length &&
      !actions.some((val) => val.sortingOrder === +node.id)
    ) {
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
              border: "1px solid #cccccc",
            }}
          >
            <div className="flex bg-[#eee] gap-1">{icon}Action</div>
          </div>
          <div
            style={{
              fontSize: "10px",
              color: "#666666",
              textAlign: "left",
              fontWeight: "bold",
            }}
          >
            {index + 1} Select the event that runs your zap
          </div>
        </div>
      );
      return {
        ...node,
        data: { label },
        position: { x: 0, y: index * verticalGap },
      };
    } else if (
      selectedActions.length &&
      selectedActions.some((val) => val.index === index)
    ) {
      const curSelectedAction = selectedActions.find(
        (val) => val.index === index
      );
      const match = AvailableActions.find(
        (available) => curSelectedAction?.availableActionId === available.id
      );

      label = (
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <div
            style={{
              fontSize: "8px",
              padding: "2px 6px",
              backgroundColor: "#ffffff",
              borderRadius: "4px",
              fontWeight: "bold",
              display: "flex",
              justifyItems: "start",
              gap: "4px",
              width: "fit-content",
              border: "1px solid #cccccc",
            }}
          >
            {selectedAction && match && (
              <>
                <Image
                  height={12}
                  width={12}
                  src={match.image}
                  alt={match.name}
                />
                <span className="font-bold">{match.name}</span>
              </>
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
            {index + 1}. Select the event that starts your zap
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
              border: "1px solid #cccccc",
            }}
          >
            <div className="flex bg-[#eee] gap-1">
              {icon} {index === 0 ? "Trigger" : "Action"}
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
            {index + 1}. Select the event that {index === 0 ? "starts" : "runs"}{" "}
            your zap
          </div>
        </div>
      );
    }

    return {
      ...node,
      data: { label },
      position: { x: 0, y: index * verticalGap },
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

  return newNodeList;
};

export const useAddNode = ({
  nodes,
  edges,
  setNodes,
  setEdges,
  refetchActions,
}: UseAddNodeParams) => {
  const selectedActions = useStore((state) => state.selectedActions);
  const setSelectedActions = useStore((state) => state.setSelectedActions);
  const actions = useStore((state) => state.actions);
  const AvailableActions = useStore((state) => state.AvailableActions);
  const params = useParams();
  const selectedAction = useStore((state) => state.selectedAction);
  const filterNodes = useStore((state) => state.filterNodes);
  const setFilterNodes = useStore((state) => state.setFilterNodes);
  const setActions = useStore((state) => state.setActions);
  useEffect(() => {
    const listener = (event: Event) => {
      const val = handleAddNode(
        event as CustomEvent,
        edges,
        nodes,
        setNodes,
        setEdges,
        selectedActions,
        actions,
        AvailableActions,
        params.id,
        selectedAction,
        filterNodes,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-expect-error
        setActions,
        setSelectedActions,
        refetchActions
      );
      if (val) {
        setFilterNodes(val);
      }
    };

    window.addEventListener("add-node", listener);

    return () => {
      window.removeEventListener("add-node", listener);
    };
  }, [
    nodes,
    edges,
    setNodes,
    setEdges,
    selectedActions,
    AvailableActions,
    actions,
    setActions,
    setSelectedActions,
    params.id,
    selectedAction,
    filterNodes,
    setFilterNodes,
    refetchActions,
  ]);
};

function updateActionsAfterInsert(
  actions: Action[],
  newNodeList: CustomNode[]
) {
  const maxOldId = actions.length; // assuming old IDs were 1-based and sequential
  let insertedIndex = -1;
  let newItem = null;

  // Step 1: Find the index and item of the newly inserted node
  for (let i = 0; i < newNodeList.length; i++) {
    if (+newNodeList[i].id > maxOldId) {
      insertedIndex = i;
      newItem = newNodeList[i];
      break;
    }
  }

  if (insertedIndex === -1 || !newItem) {
    console.log("No new item found");
    return actions;
  }

  // Step 2: Update existing actions' indexes

  const updatedActions = actions.map((action) => {
    return {
      actionId: action.actionId,
      metadata: action.metadata,
      sortingOrder: action.sortingOrder,
      index: action.index >= insertedIndex ? action.index + 1 : action.index,
    };
  });

  // Step 3: Add the new item as an action at the correct position
  const newAction = {
    actionId: "action",
    metadata: JSON.parse("{}"),
    sortingOrder: +newItem.id,
    index: insertedIndex,
  };

  // Step 4: Insert at correct position
  updatedActions.splice(insertedIndex, 0, newAction);

  return updatedActions;
}

export function useTriggerUpdate({
  event,
  zapId,
  metadata
}: {
  event: string | undefined;
  zapId: ParamValue | undefined;
  metadata: { [key: string]: string } | undefined;
}) {
  const queryClient = useQueryClient();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["trigger-event", zapId],
    queryFn: async () => {
      // Block UI interactions during backend fetch
      document.body.style.pointerEvents = "none";
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/trigger/${zapId}`
      );
      document.body.style.pointerEvents = "auto";
      return res.data;
    },
    enabled: !!zapId,
  });

  useEffect(() => {
    if (!zapId || !event) return;
    if (!data || isLoading || isError) return;
    if (data.triggerEvent === event) return; // only update when changed

    const updateTrigger = async () => {
      try {
        useStore.getState().setTriggerUpdating(true);
        document.body.style.pointerEvents = "none";
        await axios.post(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/trigger/${zapId}`,
          {
            triggerEvent: event,
            metadata: {},
          }
        );
        // Optimistically update local store so UI reflects immediately
        const currentMeta = useStore.getState().zapTriggerMeta;
        useStore.getState().setZapTriggerMeta(
          currentMeta
            ? { ...currentMeta, triggerEvent: event }
            : {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                //@ts-ignore
                zapId,
                triggerApp: "",
                triggerEvent: event,
              }
        );
        // Refresh server value in background
        await queryClient.invalidateQueries({ queryKey: ["trigger-event", zapId] });
      } catch (error) {
        console.error("Failed to update trigger:", error);
      } finally {
        document.body.style.pointerEvents = "auto";
        useStore.getState().setTriggerUpdating(false);
      }
    };

    updateTrigger();
  }, [zapId, event, data, isLoading, isError]);

  const [triggerData, setTriggerData] = useState<{
    triggerEvent: string;
    zapId: string;
    triggerApp: string;
  } | null>(null);

  // data query defined above

  useEffect(() => {
    if (data) {
      setTriggerData(data);
    }
  }, [data]);

  // Initialize store with server value on first load so UI enables Continue,
  // but only when trigger updates are allowed (avoid restoring old event after app change)
  useEffect(() => {
    if (!zapId || !data) return;
    const allowHydrate = useStore.getState().updateTrigger;
    if (!allowHydrate) return;
    const currentMeta = useStore.getState().zapTriggerMeta;
    if (!currentMeta || !currentMeta.triggerEvent) {
      useStore.getState().setZapTriggerMeta(
        currentMeta
          ? { ...currentMeta, triggerEvent: data.triggerEvent }
          : {
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              //@ts-ignore
              zapId,
              triggerApp: "",
              triggerEvent: data.triggerEvent,
            }
      );
    }
  }, [zapId, data]);

  return { triggerData, isLoading, isError };
}

export async function updateActionsMetadata({
  zapId,
  metaData,
  index
}: {
  zapId: ParamValue;
  metaData: { [key: string]: unknown };
  index: number | undefined;
}) {
  

  if (typeof index !== "number") return;
  try {
    await axios.post(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/trigger/metadata/${zapId}`,
      {
        metadata: metaData,
        index: index,
      }
    );
  } catch (error) {
    console.error("Failed to update  metadata:", error);
  }
}
