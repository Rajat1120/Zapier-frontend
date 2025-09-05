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

const generateEdges = (nodes: CustomNode[]): StrictEdge[] => {
  const edges: StrictEdge[] = [];
  for (let i = 0; i < nodes.length - 1; i++) {
    edges.push({
      id: `e${nodes[i].id}-${nodes[i + 1].id}`,
      source: nodes[i].id,
      target: nodes[i + 1].id,
      type: "custom",
    });
  }
  return edges;
};

export default function ActionsList() {
  const [error, setError] = useState<string | null>(null);

  const [nodes, setNodes] = useState<CustomNode[]>(generateInitialNodes(2));
  const [edges, setEdges] = useState<StrictEdge[]>(initialEdges);
  const [newNodes, setNewNodes] = useState<CustomNode[]>([]);
  const reactFlowInstanceRef = useRef<{
    getViewport: () => { x: number; y: number; zoom: number };
    setViewport: (vp: { x: number; y: number; zoom: number }) => void;
  } | null>(null);

  const setSelectedNode = useStore((state) => state.setSelectedNode);
  const setSelectedActions = useStore((state) => state.setSelectedActions);
  // const setSelectedAction = useStore((state) => state.setSelectedAction); // Removed unused variable
  const setUpdateTrigger = useStore((state) => state.setUpdateTrigger);
  const setAvailableActions = useStore((state) => state.setAvailableActions);
  const setActions = useStore((state) => state.setActions);
  const actions = useStore((state) => state.actions);
  const filterNodes = useStore((state) => state.filterNodes);
  const setFilterNodes = useStore((state) => state.setFilterNodes);
  const AvailableActions = useStore((state) => state.AvailableActions);
  const selectedNode = useStore((state) => state.selectedNode);
  const selectedAction = useStore((state) => state.selectedAction);
  const selectedActions = useStore((state) => state.selectedActions);
  const setZapTriggerMeta = useStore((state) => state.setZapTriggerMeta);
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
    // Only update filterNodes if the count actually changes
    const currentCount = filterNodes.length;
    const requiredCount = Math.max(actions.length, 2);
    
    if (currentCount !== requiredCount) {
      setFilterNodes(generateInitialNodes(requiredCount));
    }
  }, [actions, setFilterNodes, filterNodes.length]);

  useEffect(() => {
    const triggerNode = selectedActions.find((node) => node.index === 0);

    if (triggerNode) {
      const triggerNodeInActions = actions.find((node) => node.index === 0);
      if (triggerNode.availableActionId !== triggerNodeInActions?.actionId) {
        setZapTriggerMeta(null);
        setUpdateTrigger(false);
      }
    }
  }, [actions, selectedActions, setUpdateTrigger, setZapTriggerMeta]);

  useEffect(() => {
    setNewNodes(filterNodes);
  }, [filterNodes]);

  // Ensure nodes are always properly initialized - consolidated logic
  useEffect(() => {
    if (!nodes || nodes.length === 0) {
      const initialNodes = generateInitialNodes(Math.max(actions.length, 2));
      const initialEdges = generateEdges(initialNodes);
      
      // Only call addTrailingPlusNode once
      const nodesWithTrailing = [...initialNodes];
      const edgesWithTrailing = [...initialEdges];
      addTrailingPlusNode(nodesWithTrailing, edgesWithTrailing);
      
      setNodes(nodesWithTrailing);
      setEdges(edgesWithTrailing);
    }
  }, [nodes, actions, setNodes, setEdges]);

  // Remove the problematic useEffect that clears selectedActions on every render
  // useEffect(() => {
  //   setSelectedAction(null);
  //   setSelectedActions(null);
  // }, [setSelectedAction, setSelectedActions]);

  useEffect(() => {
    if (selectedActions.length && actions.length > 0) {
      const updatedActions = actions.map((action) => {
        const match = selectedActions.find((val) => val.index === action.index);
        if (match) {
          return {
            ...action,
            actionId: match.availableActionId,
            actionEvent: null,
            metadata: {} as JSON,
          };
        }
        return action; // keep as-is
      });
      updateZap(params.id, updatedActions);
      setActions(updatedActions);
      // Removed refetchActions() to prevent immediate server fetches during node operations
      // Add delayed refetch mechanism
      setTimeout(() => {
        refetchActions();
      }, 2000);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id, selectedActions, setActions, refetchActions]);

  // Removed updateNodesAndEdges function as it was causing duplicate addTrailingPlusNode calls

  
  

  useEffect(() => {
    const verticalGap = 120;
    
    // Ensure we always have nodes to work with
    if (!newNodes || newNodes.length === 0) {
      // If newNodes is empty, fall back to current actions or generate default nodes
      const fallbackCount = Math.max(actions.length, 2);
      const fallbackNodes = generateInitialNodes(fallbackCount);
      setNewNodes(fallbackNodes);
      return;
    }
    
    // Ensure newNodes has the correct number of nodes
    const expectedCount = Math.max(actions.length, 2);
    if (newNodes.length !== expectedCount) {
      const correctedNodes = generateInitialNodes(expectedCount);
      setNewNodes(correctedNodes);
      return;
    }
    

    
    const updatedNodes = newNodes.map((node, index) => {
      let match;
      const isTrigger = index === 0;

      const selectedAction = selectedActions.find((val) => val.index === index);
      const actionFromZap = actions.find((val) =>
        isTrigger ? val.index === 0 : val.index === index
      );

      if (selectedAction) {
        match = AvailableActions.find(
          (available) => available.id === selectedAction.availableActionId
        );
      } else if (actionFromZap && actionFromZap.actionId !== "action") {
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
          setNodes={setNodes}
          setEdges={setEdges}
        />
      );
      return {
        ...node,
        data: { label },
        position: { x: 0, y: index * verticalGap },
        style: { width: 280, height: 70 },
      };
    });

    if (!updatedNodes.length) return;
    
    // Always ensure trailing node and edges are present
    const nodesWithTrailing = [...updatedNodes];
    const edgesWithTrailing = generateEdges(nodesWithTrailing);
    
    // Create fresh copies to prevent mutation of React state
    const freshNodes = [...nodesWithTrailing];
    const freshEdges = [...edgesWithTrailing];
    addTrailingPlusNode(freshNodes, freshEdges);
    
    setNodes(freshNodes);
    setEdges(freshEdges);
  }, [
    newNodes,
    actions,
    AvailableActions,
    selectedActions,
  ]);

  useEffect(() => {
    if (selectedAction && selectedNode && curNodeIdx !== null) {
      setSelectedActions({
        name: selectedAction.name,
        sortingOrder: String(curNodeIdx + 1),
        metadata: {},
        availableActionId: selectedAction.id,
        index: curNodeIdx,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAction, setSelectedActions, setSelectedNode]);

  // Ensure sidebar stays open and reflects updated node data after app change
  useEffect(() => {
    if (selectedNode) {
      const refreshed = nodes.find((n) => n.id === selectedNode.id);
      if (refreshed) {
        setSelectedNode(refreshed as unknown as Node);
      } else {
        // If the selected node no longer exists, clear the selection
        setSelectedNode(null);
      }
    }
  }, [actions, selectedActions, nodes, selectedNode, setSelectedNode]);

  useAddNode({ nodes, edges, setNodes, setEdges, refetchActions });

  const findCurNodeIdx = useCallback(
    (node: Node) => {
      const index = nodes.findIndex((val) => val.id === node.id);
      return index >= 0 ? index : null;
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
          style: node.style ?? nds[idx]?.style ?? { width: 280, height: 70 },
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
            onInit={(instance) => {
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              reactFlowInstanceRef.current = instance;
            }}
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
              
              // Only open ZapModal if the node doesn't have a match (is a new/empty node)
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              //@ts-ignore
              const type = node?.data?.label?.props?.match;
              if (!type) {
                setShowZapModal(true);
              }
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
        {params.id && selectedNode && showSideBar && (
          <Sidebar curNodeIdx={curNodeIdx}></Sidebar>
        )}
        {selectedNode &&
          inActionTable(selectedNode, setShowZapModal) &&
          showZapModal && <ZapModal></ZapModal>}
      </div>
    </ReactFlowProvider>
  );
}
