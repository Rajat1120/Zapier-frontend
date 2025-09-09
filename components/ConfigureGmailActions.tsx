import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import React, { useState, useRef, useEffect } from "react";
import { useParams } from "next/navigation";


import useStore from "../store";
import { isWordIncluded } from "@/lib/utils";
import ConfigureGmailActionsModal from "./ConfigureGmailActionsModal";

function useGetGoogleAccessToken(token: string | null) {
  return useQuery({
    queryKey: ["google-access-token"],
    queryFn: async () => {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/google-token/accessToken`,
        {
          headers: {
            Authorization: token,
          },
        }
      );
      return res.data.access_token;
    },
    enabled: !!token,
  });
}

const ConfigureGmailActions = () => {
  const token = localStorage.getItem("token");
  const [isLabelModalOpen, setIsLabelModalOpen] = useState(false);
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [isUpdatingLabel, setIsUpdatingLabel] = useState(false);
  const [isUpdatingMessage, setIsUpdatingMessage] = useState(false);
  const labelTriggerRef = useRef<HTMLDivElement | null>(null);
  const messageTriggerRef = useRef<HTMLDivElement | null>(null);
  const previousEventRef = useRef<string | null>(null);
  const selectedNode = useStore((state) => state.selectedNode);
  const params = useParams();
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-ignore
  const { name } = selectedNode?.data?.label?.props?.match;

  const actions = useStore((state) => state.actions);
  const setActions = useStore((state) => state.setActions);
  const index = actions.find((action) => isWordIncluded(action.actionId, name))?.index;
  const matchedAction = actions.find((action) => isWordIncluded(action.actionId, name));
  const metadata = matchedAction?.metadata;
  const actionEvent = matchedAction?.actionEvent;
  

  
  const labelName = (metadata as { labelName?: string } | undefined)?.labelName;
  const messageName = (metadata as { messageName?: string } | undefined)?.messageName;
  
  const {
    data: googleAccessToken,
    isLoading,
    isError,
  } = useGetGoogleAccessToken(token);

  const handleLabelClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLabelModalOpen((val) => !val);
  };

  const handleMessageClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMessageModalOpen((val) => !val);
  };

  // Clear metadata when action event changes
  useEffect(() => {
    if (!actionEvent) return;
    
  
    // Only reset if the event actually changed after initial mount
    if (previousEventRef.current === null) {
      
      previousEventRef.current = actionEvent;
      return;
    }
    
    if (previousEventRef.current === actionEvent) {
      
      return;
    }
    
  
    
    previousEventRef.current = actionEvent;
    if (typeof index !== "number") {
      
      return;
    }
    
    // Clear metadata both locally and in DB
    const clearMetadata = async () => {
      // Clear in DB first
      const { updateActionsMetadata } = await import("@/lib/CustomHook");
      await updateActionsMetadata({
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-ignore
        zapId: params.id,
        metaData: {},
        index,
      });
      
      
      // Clear metadata locally after successful DB update
      const clearedMeta = {} as unknown as JSON;
      setActions(
        actions.map((a) => (a.index === index ? { ...a, metadata: clearedMeta } : a))
      );
    };
    
    clearMetadata();
  }, [actionEvent, index, params.id]);

  // Show different UI based on action event
  const showLabelSelection = actionEvent === "Add label to email";
  const showMessageSelection = ["Add label to email", "Archive Email", "Delete Email"].includes(actionEvent || "");

  // Update the continue button state in the parent component based on required fields for each action event type
  useEffect(() => {
    let isDisabled = false;
    
    if (actionEvent === "Add label to email") {
      // Both label and message are required for "Add label to email"
      isDisabled = !labelName || !messageName;
    } else if (actionEvent === "Archive Email" || actionEvent === "Delete Email") {
      // Only message is required for these actions
      isDisabled = !messageName;
    }
    
    const event = new CustomEvent('updateContinueButton', { 
      detail: { 
        disabled: isDisabled
      } 
    });
    window.dispatchEvent(event);
  }, [labelName, messageName, actionEvent]);

  return (
    <div className="flex p-5 flex-col gap-y-2">
      {/* Label Selection - only for "Add label to email" */}
      {showLabelSelection && (
        <>
          <span className="text-sm font-semibold text-[#333333]">
            Label <span className="text-[#ff6666]">*</span>
          </span>
          <div 
            ref={labelTriggerRef} 
            onClick={handleLabelClick} 
            className="flex justify-between border cursor-pointer hover:border-black text-sm font-semibold transition-all duration-500 p-2"
          >
            <button
              className="border-none cursor-pointer outline-0"
              disabled={isLoading || isUpdatingLabel}
            >
              <span className={`${labelName ? "text-black" : "text-[#808080]"}`}>
                {isUpdatingLabel
                  ? "Saving..."
                  : isLoading
                  ? "Loading..."
                  : isError
                  ? "Error fetching token"
                  : labelName || "Choose value"}
              </span>
            </button>
            <div>
              <svg
                width="20"
                height="20"
                viewBox="0 0 32 32"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
              >
                <path
                  stroke="#535358"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 20l7 7 7-7M23 12l-7-7-7 7"
                ></path>
              </svg>
            </div>
          </div>
        </>
      )}

      {/* Message Selection - for all action events */}
      {showMessageSelection && (
        <>
          <span className="text-sm font-semibold text-[#333333]">
            Message <span className="text-[#ff6666]">*</span>
          </span>
          <div 
            ref={messageTriggerRef} 
            onClick={handleMessageClick} 
            className="flex justify-between border cursor-pointer hover:border-black text-sm font-semibold transition-all duration-500 p-2"
          >
            <button
              className="border-none cursor-pointer outline-0"
              disabled={isLoading || isUpdatingMessage}
            >
              <span className={`${messageName ? "text-black" : "text-[#808080]"}`}>
                {isUpdatingMessage
                  ? "Saving..."
                  : isLoading
                  ? "Loading..."
                  : isError
                  ? "Error fetching token"
                  : messageName || "Choose value"}
              </span>
            </button>
            <div>
              <svg
                width="20"
                height="20"
                viewBox="0 0 32 32"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
              >
                <path
                  stroke="#535358"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 20l7 7 7-7M23 12l-7-7-7 7"
                ></path>
              </svg>
            </div>
          </div>
        </>
      )}

      {/* Modals */}
      {isLabelModalOpen && (
        <ConfigureGmailActionsModal
          setIsModalOpen={setIsLabelModalOpen}
          googleAccessToken={googleAccessToken}
          triggerRef={labelTriggerRef}
          index={index}
          setIsUpdating={setIsUpdatingLabel}
          mode="label"
        />
      )}
      
      {isMessageModalOpen && (
        <ConfigureGmailActionsModal
          setIsModalOpen={setIsMessageModalOpen}
          googleAccessToken={googleAccessToken}
          triggerRef={messageTriggerRef}
          index={index}
          setIsUpdating={setIsUpdatingMessage}
          mode="message"
        />
      )}
    </div>
  );
};

export default ConfigureGmailActions;
