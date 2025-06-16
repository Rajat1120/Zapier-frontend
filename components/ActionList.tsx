"use client";

import { JSX, useCallback, useEffect, useState } from "react";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

import type { Connection, Edge } from "@xyflow/react";

import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  Background,
  Controls,
  NodeChange,
  EdgeChange,
  ReactFlow,
} from "@xyflow/react";

import "@xyflow/react/dist/style.css";
import Authentication from "../utils/Authentication";
import ZapModal from "./ZapModal";
import CustomEdge from "../utils/CustomEdge";
import { useParams } from "next/navigation";

type NodeData = {
  label: string | JSX.Element; // Allow both string and JSX elements
};

type CustomNode = {
  id: string;
  position: { x: number; y: number };
  data: NodeData;
  connectable: boolean;
  style: { width: number; height: number };
};

export type Action = {
  id: string;
  zapId: string;
  adtionId: string;
  metadata: JSON;
  sortingOrder: number;
};

export type AvailableActions = {
  id: string;
  name: string;
  image: string;
};

const initialNodes = [
  {
    id: "1",
    position: { x: 0, y: 0 },
    data: {
      label: (
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
            <div>
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
            </div>
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
      ),
    },
    connectable: false,
    style: { width: 240, height: 60 },
  },
  {
    id: "2",
    position: { x: 0, y: 100 },
    data: {
      label: (
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
            2. Select the event for your zap to run
          </div>
        </div>
      ),
    },
    connectable: false,
    style: { width: 240, height: 60 },
  },
];
const initialEdges = [{ id: "e1-2", source: "1", target: "2", type: "custom" }];

const edgeTypes = {
  custom: CustomEdge,
};

export default function ActionsList({ id }: { id?: string }) {
  const [actions, setActions] = useState<Action[]>([]);
  const [AvailableActions, setAvailableActions] = useState<AvailableActions[]>(
    []
  );

  const [error, setError] = useState<string | null>(null);

  const [nodes, setNodes] = useState<CustomNode[]>(initialNodes);
  const [edges, setEdges] = useState(initialEdges);
  const [selectedNode, setSelectedNode] = useState<CustomNode | null>(null);

  const addTrailingPlusNode = (nodeList: CustomNode[], edgeList: Edge[]) => {
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

  useEffect(() => {
    const handleAddNode = (event: CustomEvent) => {
      const { edgeId } = event.detail;
      const edgeToSplit = edges.find((e) => e.id === edgeId);
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
        let label;
        if (node.id === "1") {
          label = (
            <div
              style={{ display: "flex", flexDirection: "column", gap: "4px" }}
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
            <div
              style={{ display: "flex", flexDirection: "column", gap: "4px" }}
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

    window.addEventListener("add-node", handleAddNode as EventListener);

    return () => {
      window.removeEventListener("add-node", handleAddNode as EventListener);
    };
  }, [nodes, edges]);

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

  useEffect(() => {
    const fetchActions = async () => {
      const supabase = createClientComponentClient();
      const { data, error } = await supabase
        .from("Action")
        .select("*")
        .eq("zapId", id); //

      console.log(data, error);
      if (error) setError(error.message);
      else setActions(data);
    };
    const fetchAvailableActions = async () => {
      const supabase = createClientComponentClient();
      const { data, error } = await supabase
        .from("AvailableActions")
        .select("*"); //
      console.log(data, error);
      if (error) setError(error.message);
      else setAvailableActions(data);
    };

    fetchAvailableActions();

    if (id) fetchActions();
  }, [id]);

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

  return (
    <div className="h-full w-full">
      <div className="h-12  w-full border-b-[0.5px] border-b-black flex items-center justify-end  px-4">
        <button className="bg-[#695be8] text-white font-bold px-2 py-1 rounded cursor-pointer">
          {id ? "Edit zap" : "Publish"}
        </button>
      </div>
      <Authentication></Authentication>
      <div style={{ height: "100%", width: "100%" }}>
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
        >
          <Background />
          <Controls />
        </ReactFlow>
      </div>

      {error && <p>Error: {error}</p>}
      {selectedNode && (
        <ZapModal
          actions={actions}
          selectedNode={selectedNode}
          setSelectedNode={setSelectedNode}
          AvailableActions={AvailableActions}
        ></ZapModal>
      )}
    </div>
  );
}
