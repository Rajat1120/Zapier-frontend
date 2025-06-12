"use client";

import { JSX, useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import Authentication from "../../../../utils/Authentication";
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
} from "@xyflow/react";

import "@xyflow/react/dist/style.css";
import CustomEdge from "../../../../utils/CustomEdge";

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

type Action = {
  id: string;
  zapId: string;
  adtionId: string;
  metadata: JSON;
  sortingOrder: number;
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
              fontSize: "10px",
              padding: "2px 6px",
              backgroundColor: "#eee",
              borderRadius: "4px",
              display: "inline-block",
              width: "fit-content",
            }}
          >
            Trigger
          </div>
          <div style={{ fontSize: "8px" }}>
            1. Select the event that starts your zap
          </div>
        </div>
      ),
    },
    connectable: false,
    style: { width: 220, height: 60 },
  },
  {
    id: "2",
    position: { x: 0, y: 100 },
    data: { label: "2" },
    connectable: false,
    style: { width: 220, height: 60 },
  },
];
const initialEdges = [{ id: "e1-2", source: "1", target: "2", type: "custom" }];

const edgeTypes = {
  custom: CustomEdge,
};

export default function ActionsList() {
  const [actions, setActions] = useState<Action[]>([]);

  console.log("ActionsList actions:", actions);
  const [error, setError] = useState<string | null>(null);
  const params = useParams();
  const id = params.id;
  const [nodes, setNodes] = useState<CustomNode[]>(initialNodes);
  const [edges, setEdges] = useState(initialEdges);

  useEffect(() => {
    const handleAddNode = (event: CustomEvent) => {
      const { edgeId } = event.detail;
      const edgeToSplit = edges.find((e) => e.id === edgeId);
      if (!edgeToSplit) return;

      const { source, target } = edgeToSplit;
      const newNodeId = (nodes.length + 1).toString();

      const sourceIndex = nodes.findIndex((n) => n.id === source);
      const targetIndex = nodes.findIndex((n) => n.id === target);
      if (sourceIndex === -1 || targetIndex === -1) return;

      const newNode = {
        id: newNodeId,
        position: { x: 0, y: 0 }, // temporary
        data: { label: newNodeId },
        connectable: false,
        style: { width: 220, height: 60 },
      };

      const newNodeList = [...nodes];
      const insertIndex = Math.max(sourceIndex, targetIndex);
      newNodeList.splice(insertIndex, 0, newNode);

      const verticalGap = 100;
      const updatedNodes = newNodeList.map((node, index) => ({
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

      setNodes(updatedNodes);
      setEdges(updatedEdges);
    };

    window.addEventListener("add-node", handleAddNode as EventListener);

    return () => {
      window.removeEventListener("add-node", handleAddNode as EventListener);
    };
  }, [nodes, edges]);

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

    if (id) fetchActions();
  }, [id]);

  const onNodesChange = useCallback(
    (changes: NodeChange<CustomNode>[]) =>
      setNodes((nds) =>
        applyNodeChanges(changes, nds).map((node, idx) => ({
          ...node,
          style: node.style ?? nds[idx]?.style ?? { width: 220, height: 60 },
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
          Edit zap
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
        >
          <Background />
          <Controls />
        </ReactFlow>
      </div>

      {error && <p>Error: {error}</p>}
    </div>
  );
}
