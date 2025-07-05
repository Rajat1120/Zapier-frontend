/* eslint-disable @typescript-eslint/ban-ts-comment */
"use client";

import { useCallback, useEffect, useState, useRef } from "react";

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

import Sidebar from "./SideBar";

import { useParams, usePathname } from "next/navigation";
import { CustomNode, StrictEdge } from "@/lib/type";
import {
  inActionTable,
  updateZap,
  useShowSideBar,
} from "../utils/HelperFunctions";
import { useQuery } from "@tanstack/react-query";
import { fetchActions, fetchAvailableActions } from "@/lib/api";
import { ZapNodeLabel } from "./ZapNodeLable";

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
  const setShowZapModal = useStore((state) => state.setShowZapModal);
  const showZapModal = useStore((state) => state.showZapModal);
  const [loading, setLoading] = useState<boolean>(true);
  const reactFlowParentWrapper = useRef<HTMLDivElement>(null);
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
      let match;
      const isTrigger = index === 0;

      const selectedAction = selectedActions.find((val) => val.index === index);
      const actionFromZap = actions.find((val) =>
        isTrigger ? val.index === 0 : val.index === index
      );

      // 1. From selected actions
      if (selectedAction) {
        match = AvailableActions.find(
          (available) => available.id === selectedAction.availableActionId
        );
      }
      // 2. From saved actions in DB
      else if (actionFromZap && actionFromZap.actionId !== "action") {
        match = AvailableActions.find(
          (available) => available.id === actionFromZap.actionId
        );
      }

      const label = (
        <ZapNodeLabel
          match={match}
          index={index}
          icon={icon}
          type={isTrigger ? "trigger" : "action"}
          reactFlowParentWrapper={reactFlowParentWrapper}
        />
      );

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
      setSelectedNode(null);
    }
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
  }, []);

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

  const showSideBar = useShowSideBar(selectedNode);

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

  useEffect(() => {
    console.log(showSideBar);
    console.log(selectedNode);
  }, [showSideBar, selectedNode]);

  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  return (
    <ReactFlowProvider>
      <div ref={reactFlowParentWrapper} className="h-full w-full">
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

        {pathName === "/zap/create" && selectedNode && <ZapModal></ZapModal>}
        {params.id && selectedNode && showSideBar && <Sidebar></Sidebar>}
        {selectedNode &&
          inActionTable(selectedNode, setShowZapModal) &&
          showZapModal && <ZapModal></ZapModal>}
      </div>
    </ReactFlowProvider>
  );
}
