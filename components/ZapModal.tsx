import { useEffect, useRef } from "react";
import { Action, AvailableActions } from "./ActionList";
import useStore from "../store";
import type { Node as FlowNode } from "@xyflow/react";
import Image from "next/image";


type Props = {
  actions: Action[];
  selectedNode: FlowNode | null;
  setSelectedNode: (node: FlowNode | null) => void;
  AvailableActions: AvailableActions[];
};


const builtInTools = [
  {
    name: "Ai by zapier",
    image:
      "https://zapier-images.imgix.net/storage/developer_cli/16b431cfbaf74ace3fb227afbe289582.png?auto=format%2Ccompress&fit=crop&h=64&ixlib=python-3.0.0&q=50&w=64",
  },
  {
    name: "Filter",
    image:
      "https://zapier-images.imgix.net/storage/services/ad3d7962908c17bcbe753928e8786b4a.png?auto=format%2Ccompress&fit=crop&h=64&ixlib=python-3.0.0&q=50&w=64",
  },
  {
    name: "Formatter",
    image:
      "https://zapier-images.imgix.net/storage/developer_cli/98abc2ffc5951ca33667fcd9c57726c9.png?auto=format%2Ccompress&fit=crop&h=64&ixlib=python-3.0.0&q=50&w=64",
  },
  {
    name: "Paths",
    image:
      "https://zapier-images.imgix.net/storage/services/b19117604393526d300c8a75f47f9cad.png?auto=format%2Ccompress&fit=crop&h=64&ixlib=python-3.0.0&q=50&w=64",
  },
  {
    name: "Delay",
    image:
      "https://zapier-images.imgix.net/storage/services/eb5078e112587cb2c6b12fc8c7fd3cd2.png?auto=format%2Ccompress&fit=crop&h=64&ixlib=python-3.0.0&q=50&w=64",
  },
  {
    name: "Webhooks",
    image:
      "https://zapier-images.imgix.net/storage/services/6aafbb717d42f8b42f5be2e4e89e1a15.png?auto=format%2Ccompress&fit=crop&h=64&ixlib=python-3.0.0&q=50&w=64",
  },
  {
    name: "Code",
    image:
      "https://zapier-images.imgix.net/storage/services/e6c82d55e682fbb6f94fa5bd9d5026d3.png?auto=format%2Ccompress&fit=crop&h=64&ixlib=python-3.0.0&q=50&w=64",
  },
];

export default function ZapModal({
  selectedNode,

  AvailableActions,
}: Props) {
  const modalRef = useRef<HTMLDivElement>(null);
  const setSelectedAction = useStore((state) => state.setSelectedAction);
  
  const setSelectedNode = useStore((state) => state.setSelectedNode);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        event.target instanceof Node &&
        !modalRef.current.contains(event.target)
      ) {
        setSelectedNode(null);
      }
    };
    window.addEventListener("mousedown", handleClickOutside);
    return () => {
      window.removeEventListener("mousedown", handleClickOutside);
     
    };
  }, [setSelectedNode]);
  
  if (!selectedNode) return null;
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.3)", // optional semi-transparent backdrop
        zIndex: 999,
      }}
    >
      <div
        ref={modalRef}
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          maxHeight: "70%",
          maxWidth: "60%",
          minHeight: "70%",
          overflowY: "auto",
          transform: "translate(-50%, -50%)",
          backgroundColor: "white",
          border: "1px solid #ccc",

          borderRadius: "8px",
          zIndex: 1000,
          minWidth: "300px",
          display: "flex",
        }}
      >
        <div
          style={{
            minWidth: "160px",
            borderRight: "1px solid #ccc",
            padding: "10px",
          }}
        >
          <div className="p-2 bg-[#dedcdc] rounded-md flex items-center gap-2">
            <Image
              src="https://img.icons8.com/?size=100&id=2797&format=png&color=FF4F00"
              alt="icon"
              width={20}
              height={20}
              style={{
                display: "block",
                objectFit: "contain",
              }}
            />
            <span className="">Home</span>
          </div>
        </div>
        <div style={{ minWidth: "500px" }}>
          <div
            style={{
              padding: "10px",
            }}
          >
            <input
              type="text"
              placeholder="Search 7000+ apps and tools..."
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "20px",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "10px",
                justifyContent: "left",
              }}
            >
              <h4
                className="px-2"
                style={{ color: "#88826c", fontWeight: "bold" }}
              >
                Your top apps
              </h4>
              <div>
                {AvailableActions.map((action) => (
                  <div
                    key={action.id}
                    className="flex items-center gap-2 min-w-[200px] py-2 px-2 font-bold cursor-pointer hover:bg-[#f7f6fd]"
                    onClick={() => {
                      setSelectedAction(action);
                    }}
                  >
                    <Image
                      src={action.image}
                      width={20}
                      height={20}
                      alt=""
                      style={{
                        display: "block",
                        objectFit: "contain",
                      }}
                    />
                    <span className="leading-none">{action.name}</span>
                  </div>
                ))}
              </div>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "10px",
                justifyContent: "left",
              }}
            >
              <h4 style={{ color: "#88826c", fontWeight: "bold" }}>
                Popular built-in tools
              </h4>
              <div>
                {builtInTools.map((tool) => (
                  <div
                    key={tool.name}
                    className="flex items-center gap-2 min-w-[200px] py-2 px-2 font-bold cursor-pointer hover:bg-[#f7f6fd]"
                  >
                    <Image
                      src={tool.image}
                      width={20}
                      height={20}
                      style={{
                        display: "block",
                        objectFit: "contain",
                      }}
                      alt=""
                    />
                    <span>{tool.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
