"use client";

import { JSX, useCallback, useEffect, useState, useRef } from "react";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

import type { Connection } from "@xyflow/react";

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
import handleZapCreate from "../utils/HelperFunctions";
import { useParams, usePathname, useRouter } from "next/navigation";
import { Action, CustomNode, SelectedAction, StrictEdge } from "@/lib/type";

const initialEdges = [{ id: "e1-2", source: "1", target: "2", type: "custom" }];

const edgeTypes = {
  custom: CustomEdge,
};

export default function ActionsList() {
  const [error, setError] = useState<string | null>(null);

  const [nodes, setNodes] = useState<CustomNode[]>(generateInitialNodes(2));
  const [edges, setEdges] = useState<StrictEdge[]>(initialEdges);

  const setSelectedNode = useStore((state) => state.setSelectedNode);
  const setSelectedActions = useStore((state) => state.setSelectedActions);
  const setAvailableActions = useStore((state) => state.setAvailableActions);
  const setActions = useStore((state) => state.setActions);
  const actions = useStore((state) => state.actions);
  const filterNodes = useStore((state) => state.filterNodes);
  const setFilterNodes = useStore((state) => state.setFilterNodes);
  const AvailableActions = useStore((state) => state.AvailableActions);
  const selectedNode = useStore((state) => state.selectedNode);
  const selectedAction = useStore((state) => state.selectedAction);
  const selectedActions = useStore((state) => state.selectedActions);
  const setZapTrigger = useStore((state) => state.setZapTrigger);
  const params = useParams();
  const router = useRouter();
  let trigger: SelectedAction | Action | null = null;

  if (selectedActions.length) {
    trigger =
      selectedActions.find((action: SelectedAction) => action.index === 0) ||
      null;
  }
  if (params.id) {
    trigger = actions.find((action: Action) => action.index === 0) || trigger;
  }

  useEffect(() => {
    if (actions.length) {
      setFilterNodes(
        generateInitialNodes(actions.length).filter((n) => n.id !== "dummy")
      );
    } else {
      setFilterNodes(nodes.filter((n) => n.id !== "dummy"));
    }
  }, [actions.length]);

  useEffect(() => {
    const updatedNodes = filterNodes.map((node, index) => {
      let label: string | JSX.Element;

      if (trigger && trigger.index === index) {
        const inSelectedAction = selectedActions?.some(
          (val) => val.index === trigger.index
        );
        const triggerFromSelectedAction = selectedActions?.find(
          (val) => val.index === trigger.index
        );
        let match;
        if (inSelectedAction) {
          match = AvailableActions.find(
            (available) =>
              triggerFromSelectedAction?.availableActionId === available.id
          );
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
                <>{icon} Trigger</>
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
              {trigger.index + 1}. Select the event that starts your zap
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
        params.id &&
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
                  match?.id === "action" ? "#eee" : "#ffffff"
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
              {match &&
                (match.id === "action" ? (
                  <div className="flex bg-[#eee] gap-1">
                    {icon} {index === 0 ? "Trigger" : "Action"}
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
                ))}
            </div>
            <div
              style={{
                fontSize: "10px",
                color: "#666666",
                textAlign: "left",
                fontWeight: "bold",
              }}
            >
              {node.id}. Select the event that runs your zap
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
        label = node.data.label;
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

    if (selectedAction && selectedNode) {
      setSelectedActions({
        name: selectedAction.name,
        sortingOrder: String(
          filterNodes.findIndex((val) => val.id === selectedNode.id) + 1
        ),
        metadata: {},
        availableActionId: selectedAction.id,
        index: filterNodes.findIndex((val) => val.id === selectedNode.id),
      });
    }

    if (trigger) {
      setZapTrigger(trigger);
    }

    async function getVal() {
      if (selectedActions.length && !params.id) {
        const newActions = filterNodes.map((node, index) => {
          const matchedAction = selectedActions.find(
            (val) => Number(val.sortingOrder) === Number(index + 1)
          );
          if (matchedAction) {
            return { ...matchedAction, sortingOrder: node.id, index };
          } else {
            return {
              name: "Action",
              availableActionId: "action",
              metadata: {},
              sortingOrder: node.id,
              index,
            };
          }
        });

        const val = await handleZapCreate(trigger, newActions);

        if (val) {
          router.push(val);
        }
      }
    }
    getVal();
    setSelectedNode(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    selectedAction,
    setSelectedActions,
    setSelectedNode,
    trigger,
    actions,
    AvailableActions,
    selectedActions,
    filterNodes.length,
  ]);

  useAddNode({ nodes, edges, setNodes, setEdges });

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

  useEffect(() => {
    const fetchActions = async () => {
      const supabase = createClientComponentClient();
      const { data, error } = await supabase
        .from("Action")
        .select("*")
        .eq("zapId", params.id); //

      if (error) setError(error.message);
      else setActions(data);
    };

    const fetchAvailableActions = async () => {
      const supabase = createClientComponentClient();
      const { data, error } = await supabase
        .from("AvailableActions")
        .select("*"); //

      if (error) setError(error.message);
      else setAvailableActions(data);
    };

    fetchAvailableActions();

    if (params.id) fetchActions();
  }, [params.id, setActions, setAvailableActions]);

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

  const pathName = usePathname();

  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  return (
    <ReactFlowProvider>
      <div className="h-full w-full">
        <div className="h-12 fixed top-0 z-10 w-full border-b-[0.5px] py-2 px-12 bg-[#fdf7f2] border-b-black flex items-center justify-end  ">
          <button className="bg-[#695be8] text-white font-bold px-2 py-1  rounded cursor-pointer">
            {params.id ? "Edit zap" : "Publish"}
          </button>
        </div>
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
            onNodeClick={(_, node) => setSelectedNode(node)}
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
        {selectedNode && inActionTable(selectedNode.id, actions) && (
          <ZapModal
            actions={actions}
            selectedNode={selectedNode}
            setSelectedNode={setSelectedNode}
            AvailableActions={AvailableActions}
          ></ZapModal>
        )}
        {pathName === "/zap/create" && selectedNode && (
          <ZapModal
            actions={actions}
            selectedNode={selectedNode}
            setSelectedNode={setSelectedNode}
            AvailableActions={AvailableActions}
          ></ZapModal>
        )}
        {params.id &&
          selectedNode &&
          !inActionTable(selectedNode.id, actions) && <Sidebar></Sidebar>}
      </div>
    </ReactFlowProvider>
  );
}

function inActionTable(id: string, actions: Action[]) {
  const node = actions.find((val: Action) => val.sortingOrder === Number(id));
  return Boolean(node?.actionId === "action");
}
