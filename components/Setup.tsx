import { handleGoogleConnect, useHasServiceAccess } from "@/lib/api";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import useStore from "../store";
import ActionEventSideBar from "./ActionEventSideBar";
import { useTriggerUpdate } from "@/lib/CustomHook";
import { useParams } from "next/navigation";
import { isWordIncluded } from "@/lib/utils";

const Setup = ({ curNodeIdx }: { curNodeIdx: number | null }) => {
  const selectedNode = useStore((state) => state.selectedNode);
  const setConnecting = useStore((state) => state.setConnecting);
  const connecting = useStore((state) => state.connecting);
  const updateTrigger = useStore((state) => state.updateTrigger);
  const setShowZapModal = useStore((state) => state.setShowZapModal);
  const actions = useStore((state) => state.actions);
  const setZapTriggerMeta = useStore((state) => state.setZapTriggerMeta);
  const [showActionSideBar, setShowActionSideBar] = useState<boolean>(false);
  const token = localStorage.getItem("token");
  const zapTriggerMeta = useStore((state) => state.zapTriggerMeta);

  const [isTrigger, setIsTrigger] = useState(false);
  const [buttonLabel, setButtonLabel] = useState("Connect");
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-ignore
  const { name, image } = selectedNode?.data?.label?.props?.match;
  const params = useParams();
  const { data, isLoading, refetch } = useHasServiceAccess(name, token);
  const email = data?.email;
  const scopesMatch = data?.scopesMatch;
  const { triggerData, isLoading: triggerEventLoading } = useTriggerUpdate({
    event: zapTriggerMeta?.triggerEvent,
    zapId: params.id,
  });

  useEffect(() => {
    if (isLoading || connecting) {
      setButtonLabel("Loading...");
    } else if (scopesMatch) {
      setButtonLabel("Change");
    } else {
      setButtonLabel("Connect");
    }
  }, [connecting, isLoading, name, scopesMatch]);
  useEffect(() => {
    if (zapTriggerMeta && name && zapTriggerMeta.triggerEvent) {
      setIsTrigger(isWordIncluded(zapTriggerMeta?.triggerApp, name));
    }
  }, [name, zapTriggerMeta]);
  useEffect(() => {
    setShowZapModal(false);
  }, [setShowZapModal]);

  const actionEvent = actions.find((val) => val.index === curNodeIdx);

  useEffect(() => {
    if (!triggerData) return;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore
    if (updateTrigger) {
      setZapTriggerMeta({
        zapId: triggerData?.triggerEvent,
        triggerApp: triggerData?.triggerApp,
        triggerEvent: triggerData?.triggerEvent, // updated event
      });
    }
  }, [setZapTriggerMeta, triggerData, triggerEventLoading, updateTrigger]);
  return (
    <div className="h-full">
      <div className="  border-b p-3 h-full border-[#d7d3c9]">
        <div className="flex m-2 flex-col">
          <span className="mb-1 font-medium text-sm">App</span>
          <div className="w-full rounded-md items-center  flex justify-between p-2 border border-[#d7d3c9]">
            <div className="border flex items-center space-x-2 border-[#d7d3c9] rounded-sm py-1 px-2">
              <Image
                className="max-w-4 max-h-4"
                width={16}
                height={16}
                src={image}
                alt={name}
              ></Image>{" "}
              <span className="text-sm font-medium">{name}</span>
            </div>
            <button
              onClick={() => setShowZapModal(true)}
              className=" px-2  text-sm cursor-pointer font-bold text-white bg-[#695be8] p-1 rounded-sm "
            >
              Change
            </button>
          </div>
        </div>
        <div className="flex m-2 flex-col">
          <span className="mb-1 font-medium text-sm">
            {curNodeIdx === 0 ? "Trigger" : "Action"} Event
          </span>
          {showActionSideBar && (
            <ActionEventSideBar
              curNodeIdx={curNodeIdx}
              name={name}
              setShowActionSideBar={setShowActionSideBar}
            ></ActionEventSideBar>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowActionSideBar((prev) => !prev);
            }}
            className="w-full cursor-pointer flex justify-between p-2 border border-[#d7d3c9] rounded-md"
          >
            <div>
              <span
                className={`text-sm ${
                  isTrigger || actionEvent ? "font-medium" : ""
                } `}
              >
                {triggerEventLoading
                  ? "Loading..."
                  : isTrigger && zapTriggerMeta
                  ? zapTriggerMeta.triggerEvent
                  : actionEvent?.actionEvent
                  ? actionEvent.actionEvent
                  : "Choose an event"}
              </span>
            </div>
            <div className="">
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
          </button>
        </div>
        <div className="flex m-2 flex-col">
          <span className="mb-1 font-medium text-sm">Account</span>
          <div className="w-full  flex justify-between p-2 border border-[#d7d3c9] rounded-md">
            <div>
              <span
                className={`text-sm ${
                  email && scopesMatch ? "font-medium" : ""
                }  truncate max-w-[250px] overflow-hidden whitespace-nowrap block`}
              >
                {email && scopesMatch
                  ? `${name} ${email}`
                  : `Connect to ${name}`}
              </span>
            </div>
            <button
              onClick={() => {
                const zapId = params.id;

                if (token && buttonLabel === "Connect") {
                  setConnecting(true);
                  handleGoogleConnect(
                    zapId,
                    name,
                    token,
                    setConnecting,
                    setButtonLabel,
                    refetch
                  );
                }
              }}
              className={` px-2  text-sm cursor-pointer font-bold  ${
                buttonLabel === "Connect"
                  ? "bg-[#695be8] text-white border-0"
                  : "bg-white text-[#737271] border hover:bg-[#fdfbf2] border-[#d7d3c9]"
              } p-1 rounded-sm `}
            >
              {buttonLabel}
            </button>
          </div>
        </div>
        <div className="p-3">
          <p className="text-sm leading-5  ">
            {name} is a secure partner with Zapier. Your credentials are
            encrypted and can be removed at any time. You can manage all of your
            connected accounts here.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Setup;
