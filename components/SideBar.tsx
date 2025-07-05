"use client";

import Image from "next/image";
import useStore from "../store";

import ZapModal from "./ZapModal";
import { useEffect } from "react";

export default function Sidebar() {
  const selectedNode = useStore((state) => state.selectedNode);
  const setSelectedNode = useStore((state) => state.setSelectedNode);
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-ignore
  const { name, image } = selectedNode?.data?.label?.props?.match;
  const setShowZapModal = useStore((state) => state.setShowZapModal);
  const showZapModal = useStore((state) => state.showZapModal);

  useEffect(() => {
    setShowZapModal(false);
  }, [setShowZapModal]);
  return (
    <div className="fixed top-16 right-4 w-[28%] h-[80%] flex  flex-col border-2 border-[#695be8] bg-white rounded-md">
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
            <span className="mb-1 font-medium text-sm">Action Event</span>
            <div className="w-full  flex justify-between p-2 border border-[#d7d3c9] rounded-md">
              <div>
                <span className="text-sm">Choose an event</span>
              </div>
              <button>Change</button>
            </div>
          </div>
          <div className="flex m-2 flex-col">
            <span className="mb-1 font-medium text-sm">Account</span>
            <div className="w-full  flex justify-between p-2 border border-[#d7d3c9] rounded-md">
              <div>
                <span className="text-sm">Select An account</span>
              </div>
              <button className=" px-2  text-sm cursor-pointer font-bold text-white bg-[#695be8] p-1 rounded-sm ">
                Sing in
              </button>
            </div>
          </div>
          <div className="p-3">
            <p className="text-sm leading-5  ">
              Google Drive is a secure partner with Zapier. Your credentials are
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
