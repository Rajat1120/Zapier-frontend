"use client";

import { useRouter } from "next/navigation";
import { JSX } from "react";
import Image from "next/image";
import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  Background,
  Connection,
  Controls,
  EdgeChange,
  NodeChange,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import Authentication from "../../../../utils/Authentication";
import { useCallback, useEffect, useRef, useState } from "react";
import { generateInitialNodes, icon } from "@/lib/reactFlow";
import { CustomNode, StrictEdge } from "@/lib/type";
import useStore from "../../../../store";
import CustomEdge from "../../../../utils/CustomEdge";
import ZapModal from "../../../../components/ZapModal";
import { addTrailingPlusNode } from "@/lib/utils";
import { useAddNode } from "@/lib/CustomHookZapCreate";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import handleZapCreate from "../../../../utils/HelperFunctions";

const initialEdges = [{ id: "e1-2", source: "1", target: "2", type: "custom" }];

const edgeTypes = {
  custom: CustomEdge,
};

export default function CreateNewZap() {
  const router = useRouter();
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes] = useState<CustomNode[]>(generateInitialNodes(2));
  const [edges, setEdges] = useState<StrictEdge[]>(initialEdges);
  const setSelectedNode = useStore((state) => state.setSelectedNode);
  const selectedNode = useStore((state) => state.selectedNode);
  const AvailableActions = useStore((state) => state.AvailableActions);
  const setAvailableActions = useStore((state) => state.setAvailableActions);
  const [error, setError] = useState<string | null>(null);
  const selectedAction = useStore((state) => state.selectedAction);
  const setSelectedAction = useStore((state) => state.setSelectedAction);
  const setSelectedActions = useStore((state) => state.setSelectedActions);
  const selectedActions = useStore((state) => state.selectedActions);
  const [curNodeIdx, setCurNodeIdx] = useState<number | null>(null);
  useEffect(() => {
    if (selectedNode) {
      setSelectedAction(null);
    }
    if (selectedAction && selectedNode && curNodeIdx !== null) {
      setSelectedActions({
        name: selectedAction.name,
        sortingOrder: String(
          nodes.findIndex((val) => val.id === selectedNode.id) + 1
        ),
        metadata: {},
        availableActionId: selectedAction.id,
        index: curNodeIdx,
      });
      setSelectedNode(null);
    }
  }, [
    selectedNode,
    selectedAction,
    nodes,
    setSelectedActions,
    setSelectedAction,
    curNodeIdx,
    setSelectedNode,
  ]);

  useEffect(() => {
    setSelectedAction(null);
    setSelectedActions(null);
  }, [setSelectedAction, setSelectedActions]);

  useEffect(() => {
    const updatedNodes = nodes.map((node, index) => {
      let label: string | JSX.Element;

      if (
        selectedActions.length &&
        selectedActions.some((val) => val.index === index)
      ) {
        const match = selectedActions.find((val) => index === val.index);
        const icon = AvailableActions.find(
          (action) => action.id === match?.availableActionId
        )?.image;

        if (match) {
          label = (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "4px",
              }}
            >
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
                <Image
                  src={icon ?? ""}
                  alt="action icon"
                  height={12}
                  width={12}
                />
                {match.name}
              </div>
              <div
                style={{
                  fontSize: "10px",
                  color: "#666666",
                  textAlign: "left",
                  fontWeight: "bold",
                }}
              >
                {index + 1}.Select the event that{" "}
                {index === 0 ? "starts" : "runs"} your zap
              </div>
            </div>
          );
          return {
            ...node,
            data: { label },
          };
        }
      }

      if (index === 0) {
        label = (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "4px",
            }}
          >
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
              {icon}Trigger
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
              {icon}Action
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
      }
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

    async function getVal() {
      if (selectedActions.length) {
        const newActions = nodes
          .map((node, index) => {
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
          })
          .filter((val) => val.sortingOrder !== "dummy");
        const trigger = newActions.find((val) => val.index === 0);
        if (!trigger) {
          return;
        }

        const val = await handleZapCreate(trigger, newActions);

        if (val) {
          router.push(val);
          setSelectedActions(null);
        }
      }
    }
    getVal();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    nodes.length,
    selectedNode,
    setSelectedNode,
    selectedAction,
    setSelectedActions,
    selectedActions,
    curNodeIdx,
  ]);

  useEffect(() => {
    const fetchAvailableActions = async () => {
      const supabase = createClientComponentClient();
      const { data, error } = await supabase
        .from("AvailableActions")
        .select("*"); //

      if (error) setError(error.message);
      else setAvailableActions(data);
    };

    fetchAvailableActions();
  }, [setAvailableActions]);

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

  const findCurNodeIdx = useCallback(
    (node: CustomNode) => {
      return nodes.findIndex((val) => val.id === node.id);
    },
    [nodes]
  );

  return (
    <div className="h-full w-full flex">
      <div className="h-full bg-[#413735] flex justify-center py-4 w-10">
        <Image
          onClick={() => router.push("/dashboard")}
          className="w-8 h-8 cursor-pointer"
          width={32}
          height={32}
          src="https://img.icons8.com/?size=100&id=RYh4BCDIOen9&format=png&color=ffffff"
          alt="dashboard icon"
        />
      </div>
      <div className="h-full w-full">
        {error && <p>Error: {error}</p>}
        <ReactFlowProvider>
          <div className="h-full w-full">
            <div className="h-12 fixed top-0 z-10 w-full border-b-[0.5px] py-2 px-12 bg-[#fdf7f2] border-b-black flex items-center justify-end  ">
              <button className="bg-[#695be8] text-white font-bold px-2 py-1  rounded cursor-pointer">
                Publish
              </button>
            </div>
            <Authentication></Authentication>
            <div
              ref={reactFlowWrapper}
              style={{ height: "100%", width: "100%" }}
            >
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

            {selectedNode && (
              <ZapModal
                actions={null}
                AvailableActions={AvailableActions}
              ></ZapModal>
            )}
          </div>
        </ReactFlowProvider>
      </div>
    </div>
  );
}
