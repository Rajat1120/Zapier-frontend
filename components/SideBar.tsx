"use client";

import Image from "next/image";
import useStore from "../store";

import ZapModal from "./ZapModal";
import { SetStateAction, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ParamValue } from "next/dist/server/request/params";
import { useHasServiceAccess, useTriggerUpdate } from "@/lib/api";
import ActionEventSideBar from "./ActionEventSideBar";

export default function Sidebar({ curNodeIdx }: { curNodeIdx: number | null }) {
  const selectedNode = useStore((state) => state.selectedNode);
  const setSelectedNode = useStore((state) => state.setSelectedNode);
  const token = localStorage.getItem("token");
  const [showActionSideBar, setShowActionSideBar] = useState<boolean>(false);

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-ignore
  const { name, image } = selectedNode?.data?.label?.props?.match;
  const setShowZapModal = useStore((state) => state.setShowZapModal);
  const setConnecting = useStore((state) => state.setConnecting);
  const connecting = useStore((state) => state.connecting);

  const showZapModal = useStore((state) => state.showZapModal);

  const zapTriggerMeta = useStore((state) => state.zapTriggerMeta);
  const setZapTriggerMeta = useStore((state) => state.setZapTriggerMeta);

  const params = useParams();

  const { triggerEvent, isLoading: triggerEventLoading } = useTriggerUpdate({
    event: zapTriggerMeta?.triggerEvent,
    zapId: params.id,
  });
  useEffect(() => {
    console.log("Updated zapTriggerMeta:", zapTriggerMeta);
  }, [zapTriggerMeta]);

  useEffect(() => {
    if (!triggerEvent) return;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore
    setZapTriggerMeta((val) => ({
      zapId: val.zapId,
      triggerApp: val.triggerApp,
      triggerEvent, // updated event
    }));
    console.log(triggerEvent);
  }, [setZapTriggerMeta, triggerEvent]);

  useEffect(() => {
    setShowZapModal(false);
  }, [setShowZapModal]);

  const { data, isLoading, refetch } = useHasServiceAccess(name, token);
  const scopesMatch = data?.scopesMatch;
  const email = data?.email;
  const [buttonLabel, setButtonLabel] = useState("Connect");

  useEffect(() => {
    if (isLoading || connecting) {
      setButtonLabel("Loading...");
    } else if (scopesMatch) {
      setButtonLabel("Change");
    } else {
      setButtonLabel("Connect");
    }
  }, [connecting, isLoading, name, scopesMatch]);
  return (
    <div className="fixed top-16 right-4 min-w-[400px] max-w-[400px] h-[80%] flex  flex-col border-2 border-[#695be8] bg-white rounded-md">
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
          <span>Select the Event</span>
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
      <div className="flex-grow border-b-[#d7d3c9] border overflow-y-auto">
        <div className="p-3">Setup</div>
        <div className=" border-t border-b p-3 h-full border-[#d7d3c9]">
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
                  className={`text-sm ${zapTriggerMeta ? "font-medium" : ""} `}
                >
                  {zapTriggerMeta
                    ? zapTriggerMeta.triggerEvent
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
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
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
              encrypted and can be removed at any time. You can manage all of
              your connected accounts here.
            </p>
          </div>
        </div>
      </div>
      <div className="p-3 flex justify-center items-center ">
        <button className="w-full bg-[#ece9df] font-bold text-[#737272] p-2">
          To continue, choose an event
        </button>
      </div>
      {showZapModal && <ZapModal></ZapModal>}
    </div>
  );
}

function handleGoogleConnect(
  zapId: ParamValue,
  appName: string,
  token: string,
  setConnecting: (val: boolean) => void,
  setButtonLabel: {
    (value: SetStateAction<string>): void;
    (arg0: string): void;
  },
  refetch: () => void
) {
  const app = appName.toLowerCase().replace(/\s+/g, "");
  const googleApps = [
    "sheet",
    "slide",
    "calendar",
    "docs",
    "drive",
    "youtube",
    "gmail",
  ];
  const matchedApp = googleApps.find((keyword) => app.includes(keyword));

  if (!matchedApp) {
    console.warn("No OAuth flow configured for app:", appName);
    return;
  }

  const url = `/api/oauth/google/start?zapId=${zapId}&app=${matchedApp}&token=${token}`;

  const popup = window.open(url, "google-oauth", "width=900,height=700");

  const interval = setInterval(() => {
    if (popup?.closed) {
      setConnecting(false);
      clearInterval(interval);
      window.removeEventListener("message", handleOAuthMessage);
    }
  }, 500);

  function handleOAuthMessage(event: MessageEvent) {
    setConnecting(false);
    if (event.origin !== window.location.origin) return;
    if (event.data === "oauth-success") {
      refetch();
      setButtonLabel("Change");
      console.log("✅ Google account connected!");
      window.removeEventListener("message", handleOAuthMessage);
      clearInterval(interval);
    }
  }

  window.addEventListener("message", handleOAuthMessage);
}
