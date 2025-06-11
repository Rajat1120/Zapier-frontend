"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import Authentication from "../../../../utils/Authentication";

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
    data: { label: "1" },
    connectable: false,
  },
  {
    id: "2",
    position: { x: 0, y: 100 },
    data: { label: "2" },
    connectable: false,
  },
];
const initialEdges = [{ id: "e1-2", source: "1", target: "2", type: "custom" }];

const edgeTypes = {
  custom: CustomEdge,
};

export default function ActionsList() {
  const [actions, setActions] = useState<Action[]>([]);
  const [error, setError] = useState<string | null>(null);
  const params = useParams();
  const id = params.id;

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

  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState(initialEdges);

  const onNodesChange = useCallback(
    (
      changes: NodeChange<{
        id: string;
        position: { x: number; y: number };
        data: { label: string };
        connectable: boolean;
      }>[]
    ) => setNodes((nds) => applyNodeChanges(changes, nds)),
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
    (params: any) => setEdges((eds) => addEdge(params, eds)),
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
