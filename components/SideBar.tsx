"use client";

import Image from "next/image";
import useStore from "../store";

import ZapModal from "./ZapModal";
import { useState } from "react";

import Setup from "./Setup";
import ConfigureDocs from "./ConfigureDocs";
import Test from "./Test";
import { showConfigureArray } from "@/lib/constants/appTriggers";

export default function Sidebar({ curNodeIdx }: { curNodeIdx: number | null }) {
  const selectedNode = useStore((state) => state.selectedNode);
  const setSelectedNode = useStore((state) => state.setSelectedNode);

  const zapTriggerMeta = useStore((state) => state.zapTriggerMeta);
  const actions = useStore((state) => state.actions);

  const [selectedField, setselectedField] = useState<string>("setup");
  const showZapModal = useStore((state) => state.showZapModal);

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
          <span className={`${zapTriggerMeta ? "font-medium" : ""}`}>
            {zapTriggerMeta ? zapTriggerMeta.triggerEvent : "Select the event"}
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

          <div
            onClick={() => setselectedField("test")}
            className={`p-3 cursor-pointer font-semibold text-sm border-b-2 ${
              selectedField === "test" ? " border-[#695be8]" : "border-white"
            } `}
          >
            Test
          </div>
        </div>
      </div>
      {selectedField === "setup" && <Setup curNodeIdx={curNodeIdx}></Setup>}
      {selectedField === "configure" && <ConfigureDocs></ConfigureDocs>}
      {selectedField === "test" && <Test></Test>}
      <div className="p-3 flex justify-center items-center ">
        <button
          onClick={() => {
            if (showConfigure(curNodeIdx)) {
              setselectedField("configure");
            }
          }}
          disabled={!zapTriggerMeta?.triggerEvent}
          className={`rounded-sm ${
            !zapTriggerMeta?.triggerEvent
              ? "cursor-not-allowed text-[#737272] bg-[#ece9df]"
              : "cursor-pointer bg-[#695be8] text-white"
          } w-full   font-bold  p-2`}
        >
          {zapTriggerMeta?.triggerEvent
            ? "Continue"
            : "To continue, choose an event"}
        </button>
      </div>
      {showZapModal && <ZapModal></ZapModal>}
    </div>
  );
}
