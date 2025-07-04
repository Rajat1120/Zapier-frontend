"use client";

import { JSX, useCallback, useEffect, useState, useRef } from "react";

import type { Connection, Node } from "@xyflow/react";

import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  Background,
  Controls,
  NodeChange,
  EdgeChange,
  ReactFlow,
  useReactFlow,
  ReactFlowProvider,
} from "@xyflow/react";

import "@xyflow/react/dist/style.css";
import Authentication from "../utils/Authentication";
import ZapModal from "./ZapModal";
import CustomEdge from "../utils/CustomEdge";

import useStore from "../store";
import { addTrailingPlusNode } from "@/lib/utils";
import { generateInitialNodes, icon } from "@/lib/reactFlow";
import { useAddNode } from "@/lib/CustomHook";
import Image from "next/image";
import Sidebar from "./SideBar";

import { useParams, usePathname } from "next/navigation";
import { CustomNode, StrictEdge } from "@/lib/type";
import { updateZap } from "../utils/HelperFunctions";
import { useQuery } from "@tanstack/react-query";
import { fetchActions, fetchAvailableActions } from "@/lib/api";

const initialEdges = [{ id: "e1-2", source: "1", target: "2", type: "custom" }];

const edgeTypes = {
  custom: CustomEdge,
};

export default function ActionsList() {
  const [error, setError] = useState<string | null>(null);

  const [nodes, setNodes] = useState<CustomNode[]>(generateInitialNodes(2));
  const [edges, setEdges] = useState<StrictEdge[]>(initialEdges);
  const [newNodes, setNewNodes] = useState<CustomNode[]>([]);

  const setSelectedNode = useStore((state) => state.setSelectedNode);
  const setSelectedActions = useStore((state) => state.setSelectedActions);
  const setSelectedAction = useStore((state) => state.setSelectedAction);
  const setAvailableActions = useStore((state) => state.setAvailableActions);
  const setActions = useStore((state) => state.setActions);
  const actions = useStore((state) => state.actions);
  const filterNodes = useStore((state) => state.filterNodes);
  const setFilterNodes = useStore((state) => state.setFilterNodes);
  const AvailableActions = useStore((state) => state.AvailableActions);
  const selectedNode = useStore((state) => state.selectedNode);
  const selectedAction = useStore((state) => state.selectedAction);
  const selectedActions = useStore((state) => state.selectedActions);

  const [loading, setLoading] = useState<boolean>(true);

  const [curNodeIdx, setCurNodeIdx] = useState<number | null>(null);
  const params = useParams();

  const pathName = usePathname();

  const {
    data: fetchedActions,
    error: actionsError,
    isLoading: actionsLoading,
    refetch: refetchActions,
  } = useQuery({
    queryKey: ["actions", params.id],
    queryFn: () => fetchActions(params.id),
    refetchOnMount: true,
    enabled: !!params.id,
    staleTime: 100,

    refetchOnReconnect: true, // refetch on reconnect
  });

  const {
    data: availableActionsData,
    error: availableActionsError,
    isLoading: availableActionsLoading,
  } = useQuery({
    queryKey: ["availableActions"],
    queryFn: fetchAvailableActions,
    staleTime: 1000 * 60 * 60,
  });

  useEffect(() => {
    if (actions.length) {
      setFilterNodes(generateInitialNodes(actions.length));
    }
  }, [actions, setFilterNodes]);

  useEffect(() => {
    setNewNodes(filterNodes);
  }, [filterNodes, nodes]);

  useEffect(() => {
    setSelectedAction(null);
    setSelectedActions(null);
  }, [setSelectedAction, setSelectedActions]);

  useEffect(() => {
    if (selectedActions.length) {
      const updatedActions = actions.map((action) => {
        const match = selectedActions.find((val) => val.index === action.index);
        if (match) {
          return {
            ...action,
            actionId: match.availableActionId,
          };
        }
        return action; // keep as-is
      });
      updateZap(params.id, updatedActions);
      setActions(updatedActions);
      refetchActions();
    }
  }, [params.id, selectedActions, setActions, refetchActions]);

  useEffect(() => {
    const updatedNodes = newNodes.map((node, index) => {
      let label: string | JSX.Element;

      if (index === 0) {
        let match;

        if (
          selectedActions.length &&
          selectedActions.some((val) => val.index === 0)
        ) {
          const triggerFromSelectedAction = selectedActions.find(
            (action) => action.index === 0
          );
          match = AvailableActions.find(
            (available) =>
              triggerFromSelectedAction?.availableActionId === available.id
          );
        } else if (actions.length) {
          const triggerFromSelectedAction = actions.find(
            (action) => action.index === 0
          );
          if (
            triggerFromSelectedAction &&
            triggerFromSelectedAction.actionId !== "action"
          ) {
            match = AvailableActions.find(
              (available) =>
                triggerFromSelectedAction?.actionId === available.id
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
                  <span className="font-bold">{match.name} </span>
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
              {index + 1}. Select the event that runs your zap
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
              {index + 1}. Select the event that{" "}
              {index === 0 ? "starts" : "runs"} your zap
            </div>
          </div>
        );
      }

      return {
        ...node,
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
    if (updatedNodes.length && updatedEdges.length) {
      addTrailingPlusNode(updatedNodes, updatedEdges);
      setNodes(updatedNodes);
      setEdges(updatedEdges);
    }

    if (selectedAction && selectedNode && curNodeIdx !== null) {
      setSelectedActions({
        name: selectedAction.name,
        sortingOrder: String(
          newNodes.findIndex((val) => val.id === selectedNode.id) + 1
        ),
        metadata: {},
        availableActionId: selectedAction.id,
        index: curNodeIdx,
      });
    }

    setSelectedNode(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    selectedAction,
    setSelectedActions,
    setSelectedNode,

    actions,
    newNodes,
    nodes.length,
    AvailableActions,
    selectedActions,
    filterNodes.length,
  ]);

  useAddNode({ nodes, edges, setNodes, setEdges, refetchActions });

  useEffect(() => {
    const verticalGap = 100;
    const updatedNodes = nodes.map((node, index) => ({
      ...node,
      position: { x: 0, y: index * verticalGap },
    }));

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function inActionTable(selectedNode: Node) {
    const labelChildren =
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      selectedNode?.data?.label?.props?.children?.[0]?.props?.children?.props
        ?.children?.[2] ??
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      selectedNode?.data?.label?.props?.children?.[0]?.props?.children?.props
        ?.children?.[1];
    if (labelChildren === "Action" || labelChildren === "Trigger") {
      console.log("it's Action or Trigger");
      return true;
    } else {
      return false;
    }
  }

  const findCurNodeIdx = useCallback(
    (node: Node) => {
      return nodes.findIndex((val) => val.id === node.id);
    },
    [nodes]
  );

  useEffect(() => {
    if (Array.isArray(fetchedActions)) setActions(fetchedActions);
    if (actionsError) setError(actionsError.message);
    setLoading(actionsLoading);
  }, [fetchedActions, actionsError, actionsLoading, setActions]);

  useEffect(() => {
    if (Array.isArray(availableActionsData))
      setAvailableActions(availableActionsData);
    if (availableActionsError) setError(availableActionsError.message);
    setLoading(availableActionsLoading);
  }, [
    availableActionsData,
    availableActionsError,
    availableActionsLoading,
    setAvailableActions,
  ]);

  const onNodesChange = useCallback(
    (changes: NodeChange<CustomNode>[]) =>
      setNodes((nds) =>
        applyNodeChanges(changes, nds).map((node, idx) => ({
          ...node,
          style: node.style ?? nds[idx]?.style ?? { width: 240, height: 60 },
        }))
      ),
    []
  );
  const onEdgesChange = useCallback(
    (
      changes: EdgeChange<{
        id: string;
        source: string;
        target: string;
        type: string;
      }>[]
    ) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    []
  );

  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  return (
    <ReactFlowProvider>
      <div className="h-full w-full">
        <div className="h-12 fixed top-0 z-10 w-full border-b-[0.5px] py-2 px-12 bg-[#fdf7f2] border-b-black flex items-center justify-end  ">
          <button className="bg-[#695be8] text-white font-bold px-2 py-1  rounded cursor-pointer">
            {params.id ? "Edit zap" : "Publish"}
          </button>
        </div>
        {loading ? <span>Loaidng...</span> : null}
        <Authentication></Authentication>
        <div ref={reactFlowWrapper} style={{ height: "100%", width: "100%" }}>
          <ReactFlow
            nodes={nodes}
            onNodesChange={onNodesChange}
            edges={edges}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodesDraggable={false}
            edgeTypes={edgeTypes}
            fitView
            onNodeClick={(_, node) => {
              setSelectedNode(node);
              setCurNodeIdx(findCurNodeIdx(node));
            }}
            zoomOnScroll={false}
          >
            {(() => {
              const PanWrapper = () => {
                const { setViewport, getViewport } = useReactFlow();

                useEffect(() => {
                  const handleWheel = (event: WheelEvent) => {
                    if (event.ctrlKey) return;
                    event.preventDefault();

                    const { x, y, zoom } = getViewport();
                    setViewport({
                      x: x - event.deltaX,
                      y: y - event.deltaY,
                      zoom,
                    });
                  };

                  const wrapper = reactFlowWrapper.current;
                  if (wrapper) {
                    wrapper.addEventListener("wheel", handleWheel, {
                      passive: false,
                    });
                  }

                  return () => {
                    if (wrapper) {
                      wrapper.removeEventListener("wheel", handleWheel);
                    }
                  };
                }, [getViewport, setViewport]);

                return null;
              };

              return <PanWrapper />;
            })()}
            <Background />
            <Controls />
          </ReactFlow>
        </div>

        {error && <p>Error: {error}</p>}

        {pathName === "/zap/create" && selectedNode && (
          <ZapModal
            actions={actions}
            AvailableActions={AvailableActions}
          ></ZapModal>
        )}
        {params.id && selectedNode && !inActionTable(selectedNode) ? (
          <Sidebar></Sidebar>
        ) : (
          <ZapModal
            actions={actions}
            AvailableActions={AvailableActions}
          ></ZapModal>
        )}
      </div>
    </ReactFlowProvider>
  );
}
