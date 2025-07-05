"use client";

import { useEffect, useState } from "react";

import { useRouter } from "next/navigation";

import Image from "next/image";

import { DarkButton } from "../../../components/buttons/DarkButton";
import { AppBar } from "../../../components/AppBar";
import useStore from "../../../store";
import { useZaps } from "@/lib/api";
import { Zap } from "@/lib/type";

const zapIcon =
  "https://img.icons8.com/?size=100&id=VvT7gqRrJ4Bp&format=png&color=000000";

export default function DashBoard() {
  const { loading, zaps, refetchZaps } = useZaps();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const setSelectedActions = useStore((state) => state.setSelectedActions);
  const setZapTrigger = useStore((state) => state.setZapTrigger);
  const setActions = useStore((state) => state.setActions);
  const setSelectedNode = useStore((state) => state.setSelectedNode);
  useEffect(() => {
    setIsClient(true);
    setSelectedNode(null);
  }, [setSelectedNode]);

  useEffect(() => {
    refetchZaps();
  }, [refetchZaps]);

  if (!isClient) {
    return (
      <div>
        <AppBar />
        <div className="flex justify-center pt-8">
          <div className="max-w-screen-lg w-full">
            <div className="flex justify-between">
              <div className="text-2xl font-bold">Zaps</div>
              <DarkButton onClick={() => {}}>Create</DarkButton>
            </div>
          </div>
        </div>
        <div className="flex justify-center">
          <div className="max-w-screen-lg w-full">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <AppBar />
      <div className="flex justify-center pt-8">
        <div className="max-w-screen-lg	 w-full">
          <div className="flex justify-between  ">
            <div className="text-2xl font-bold">Zaps</div>
            <DarkButton
              onClick={() => {
                router.push("/zap/create");
                setSelectedActions(null);
                setZapTrigger(null);
                setActions([]);
              }}
            >
              Create
            </DarkButton>
          </div>
        </div>
      </div>
      {loading ? (
        "Loading..."
      ) : (
        <div className="flex justify-center">
          {" "}
          <ZapTable zaps={zaps} />{" "}
        </div>
      )}
    </div>
  );
}

function ZapTable({ zaps }: { zaps: Zap[] }) {
  const router = useRouter();

  const setSelectedActions = useStore((state) => state.setSelectedActions);

  return (
    <div className="overflow-hidden my-4 rounded-2xl border  max-w-screen-lg w-full">
      <table className="w-full text-left   border-black   border-collapse">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 border-b">Name</th>
            <th className="p-2 border-b">Apps</th>
            <th className="p-2 border-b">Created At</th>
            <th className="p-2 border-b">Owner</th>
          </tr>
        </thead>
        <tbody>
          {zaps.map((z, i) => (
            <tr key={i} className="border-b">
              <td className="p-2">
                <button
                  className="cursor-pointer"
                  onClick={() => {
                    router.push(`/zap/${z.id}`);
                    setSelectedActions(null);
                  }}
                >
                  zap name
                </button>
              </td>
              <td className="p-2 flex items-center space-x-2">
                {z.actions.map((x, j) => (
                  <Image
                    key={j}
                    alt="Action"
                    width={30}
                    height={30}
                    src={x.type.image || zapIcon}
                    className="w-[30px] h-[30px]"
                  />
                ))}
              </td>
              <td className="p-2">{new Date().toLocaleString()}</td>
              <td className="p-2 ">
                <div className="border h-10 w-10 border-black rounded-full">
                  user
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
