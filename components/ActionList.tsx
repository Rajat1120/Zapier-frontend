"use client";

import { JSX, useCallback, useEffect, useState } from "react";

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
} from "@xyflow/react";

import "@xyflow/react/dist/style.css";
import Authentication from "../utils/Authentication";
import ZapModal from "./ZapModal";
import CustomEdge from "../utils/CustomEdge";

import useStore from "../store";
import { addTrailingPlusNode } from "@/lib/utils";
import { initialNodes } from "@/lib/reactFlow";
import { useAddNode } from "@/lib/CustomHook";
import Image from "next/image";
import Sidebar from "./SideBar";
import handleZapCreate from "../utils/HelperFunctions";
import { useParams , useRouter} from "next/navigation";



type NodeData = {
  label: string | JSX.Element; // Allow both string and JSX elements
};

export type CustomNode = {
  id: string;
  position: { x: number; y: number };
  data: NodeData;
  connectable: boolean;
  style: { width: number; height: number };
};

export type SelectedAction = {
  name: string;
  sortingOrder: string; 
  metadata: unknown; 
  availableActionId: string;
};

export type StrictEdge = {
  id: string;
  source: string;
  target: string;
  type: string; // not optional
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
  const [edges, setEdges] = useState<StrictEdge[]>(initialEdges);

  const setSelectedNode = useStore((state) => state.setSelectedNode);
  const setSelectedActions = useStore((state) => state.setSelectedActions);
  const selectedNode = useStore((state) => state.selectedNode);
  const selectedAction = useStore((state) => state.selectedAction);
  const selectedActions = useStore((state) => state.selectedActions);
   const setZapTrigger = useStore((state) => state.setZapTrigger);
  const params = useParams()
  const router = useRouter()
  const trigger = selectedActions.find((action: SelectedAction) => action.sortingOrder === "1")
  useEffect(() => {
    const filteredNodes = nodes.filter((n) => n.id !== "dummy");

    const updatedNodes = filteredNodes.map((node) => {
      let label: string | JSX.Element;
      if (selectedNode && node.id === selectedNode.id) {
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
              <Image
                height={12}
                width={12}
                src={selectedAction.image}
                alt={selectedAction.name}
              />
              <span className="font-bold">{selectedAction.name}</span>
            </div>
            <div
              style={{
                fontSize: "10px",
                color: "#666666",
                textAlign: "left",
                fontWeight: "bold",
              }}
            >
              {selectedNode.id}. Select the event that starts your zap
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

    addTrailingPlusNode(updatedNodes, updatedEdges);
    setNodes(updatedNodes);
    setEdges(updatedEdges);
    if (selectedAction && selectedNode) {
      
      setSelectedActions({ name: selectedAction.name, sortingOrder: selectedNode.id,metadata: {},availableActionId:selectedAction.id });
    }
      setZapTrigger(trigger)

      async function getVal () {
        const val = await handleZapCreate(trigger, selectedActions, params.id)
        if(val){

          router.push(val)
        }

      }
      getVal()
      setSelectedNode(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAction, setSelectedActions, setSelectedNode, trigger]);
  

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
        .eq("zapId", id); //

      
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
   {selectedNode && <Sidebar></Sidebar>}
       
    </div>
  );
}
