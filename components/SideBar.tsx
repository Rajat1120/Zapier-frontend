"use client";

import Image from "next/image";
import useStore from "../store";

import ZapModal from "./ZapModal";
import { useState, useEffect } from "react";

import Setup from "./Setup";

import { showConfigureArray } from "@/lib/constants/appTriggers";
import { configureComponentMap } from "@/lib/utils";

export default function Sidebar({ curNodeIdx, onNavigateToNextNode }: { curNodeIdx: number | null, onNavigateToNextNode?: () => void }) {
  const selectedNode = useStore((state) => state.selectedNode);
  const setSelectedNode = useStore((state) => state.setSelectedNode);

  const zapTriggerMeta = useStore((state) => state.zapTriggerMeta);
  const actions = useStore((state) => state.actions);

  const [selectedField, setselectedField] = useState<string>("setup");
  const [isContinueDisabled, setIsContinueDisabled] = useState(false);
  const showZapModal = useStore((state) => state.showZapModal);

  // Handle continue button state updates from child components
  useEffect(() => {
    const handleUpdateContinueButton = (event: Event) => {
      const customEvent = event as CustomEvent<{ disabled: boolean }>;
      setIsContinueDisabled(customEvent.detail.disabled);
    };

    window.addEventListener('updateContinueButton', handleUpdateContinueButton as EventListener);
    
    return () => {
      window.removeEventListener('updateContinueButton', handleUpdateContinueButton as EventListener);
    };
  }, []);

  // Get the appropriate event for configuration component selection
  const currentAction = curNodeIdx !== null && curNodeIdx !== 0 
    ? actions.find((action) => action.index === curNodeIdx)
    : null;
  
  const configureEvent = curNodeIdx === 0 
    ? zapTriggerMeta?.triggerEvent 
    : currentAction?.actionEvent;

  const SelectedConfigureComponent =
    configureComponentMap[
      configureEvent as keyof typeof configureComponentMap
    ];

  // Determine if event is selected for current node (trigger or action event based on node index)
  const isEventSelected = curNodeIdx === 0 
    ? !!zapTriggerMeta?.triggerEvent
    : !!currentAction?.actionEvent;

  // Determine if current node is the last node in the Zap workflow
  const isLastNode = () => {
    if (!actions.length) return curNodeIdx === 0; // Only trigger node
    const maxActionIndex = Math.max(...actions.map(action => action.index));
    return curNodeIdx === maxActionIndex;
  };

  // Compute header title: show trigger event for node 0, otherwise action event for the selected action node
  const headerTitle = curNodeIdx === 0
    ? (zapTriggerMeta?.triggerEvent || "Select the event")
    : (currentAction?.actionEvent || "Select the event");

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-ignore
  const { name, image } = selectedNode?.data?.label?.props?.match;

  function showConfigure(index: number | null) {
    if (index === null) return false;
    if (index === 0 && zapTriggerMeta?.triggerEvent) {
      return showConfigureArray.includes(zapTriggerMeta?.triggerEvent);
    } else {
      const action = actions.find((action) => action.index === curNodeIdx);
      return (
        action?.actionEvent && showConfigureArray.includes(action?.actionEvent)
      );
    }
  }

  // Reset selected tab to 'setup' when switching nodes
  useEffect(() => {
    setselectedField("setup");
  }, [curNodeIdx]);

  return (
    <div className="fixed top-16 right-4 min-w-[400px] max-w-[400px] h-[80%] flex flex-col border-2 border-[#695be8] bg-white rounded-md">
      <div className="p-3 rounded-md justify-between  bg-[#f0eefb] flex">
        <div className="flex items-center space-x-2">
          <div className="bg-white h-8 w-8 border border-[#d7d3c9] rounded-xs flex items-center justify-center ">
            <Image
              className="max-w-6 max-h-6"
              width={20}
              height={20}
              src={image}
              alt={name}
            ></Image>
          </div>
          <span className={`${headerTitle !== "Select the event" ? "font-medium" : ""}`}>
            {headerTitle}
          </span>
        </div>
        <div className="flex space-x-3 items-center">
          <Image
            height={20}
            width={20}
            src={
              "https://img.icons8.com/?size=100&id=78833&format=png&color=000000"
            }
            alt="Expand"
          ></Image>
          <Image
            onClick={() => setSelectedNode(null)}
            className="cursor-pointer"
            height={24}
            width={24}
            alt="Close button"
            src={
              "https://img.icons8.com/?size=100&id=9433&format=png&color=000000"
            }
          ></Image>
        </div>
      </div>
      <div className="flex border-b-[#d7d3c9] border h-12">
        <div className="flex items-center">
          <div
            onClick={() => setselectedField("setup")}
            className={`p-3 cursor-pointer font-semibold text-sm border-b-2 ${
              selectedField === "setup" ? " border-[#695be8]" : "border-white"
            } `}
          >
            Setup
          </div>

          {showConfigure(curNodeIdx) && (
            <>
              {" "}
              <Image
                width={40}
                height={40}
                className="w-4 h-4 object-contain"
                alt="next img"
                src={
                  "https://img.icons8.com/?size=100&id=3199&format=png&color=000000"
                }
              ></Image>
              <div
                onClick={() => setselectedField("configure")}
                className={`p-3 cursor-pointer font-semibold text-sm border-b-2 ${
                  selectedField === "configure"
                    ? " border-[#695be8]"
                    : "border-white"
                } `}
              >
                Configure
              </div>
            </>
          )}
          <Image
            width={40}
            height={40}
            className="w-4 h-4 object-contain"
            alt="next img"
            src={
              "https://img.icons8.com/?size=100&id=3199&format=png&color=000000"
            }
          ></Image>

         
        </div>
      </div>
      {selectedField === "setup" && <Setup curNodeIdx={curNodeIdx}></Setup>}
      {selectedField === "configure" && SelectedConfigureComponent && (
        <SelectedConfigureComponent />
      )}
      
      <div className="mt-auto p-3 flex justify-center items-center">
        <button
          onClick={() => {
            if (selectedField === "setup") {
              // If on setup tab
              if (showConfigure(curNodeIdx)) {
                // If configure tab exists, switch to it
                setselectedField("configure");
              } else if (onNavigateToNextNode) {
                // If no configure tab exists, navigate to next node
                onNavigateToNextNode();
              }
            } else if (selectedField === "configure" && onNavigateToNextNode) {
              // If on configure tab, navigate to next node (unless it's the last node's configure tab)
              if (!(isLastNode() && selectedField === "configure")) {
                onNavigateToNextNode();
              }
            }
          }}
          disabled={!isEventSelected || isContinueDisabled}
          className={`rounded-sm w-full font-bold p-2 ${
            !isEventSelected || isContinueDisabled
              ? "cursor-not-allowed text-[#737272] bg-[#ece9df]"
              : "cursor-pointer bg-[#695be8] text-white hover:bg-[#5a4fd3] transition-colors"
          }`}
        >
          {isEventSelected
            ? (isLastNode() 
                ? (selectedField === "configure" ? "Publish" : "Continue") 
                : "Continue")
            : "To continue, choose an event"}
        </button>
      </div>
      {showZapModal && <ZapModal></ZapModal>}
    </div>
  );
}
