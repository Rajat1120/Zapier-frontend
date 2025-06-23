"use client";

import axios from "axios";
import { useEffect, useState } from "react";

import { useRouter } from "next/navigation";

import Image from "next/image";

import { DarkButton } from "../../../components/buttons/DarkButton";
import { AppBar } from "../../../components/AppBar";
import useStore from "../../../store";


const zapIcon =
  "https://img.icons8.com/?size=100&id=VvT7gqRrJ4Bp&format=png&color=000000";

interface Zap {
  id: string;
  triggerId: string;
  userId: number;
  actions: {
    id: string;
    zapId: string;
    actionId: string;
    sortingOrder: number;
    type: {
      id: string;
      name: string;
      image: string;
    };
  }[];
  trigger: {
    id: string;
    zapId: string;
    triggerId: string;
    type: {
      id: string;
      name: string;
      image: string;
    };
  };
}

function useZaps() {
  const [loading, setLoading] = useState(true);
  const [zaps, setZaps] = useState<Zap[]>([]);

  useEffect(() => {
    // This code will only run on the client-side
    const token = localStorage.getItem("token");

    if (!token) {
      // Handle cases where no token is found, e.g., redirect to login
      setLoading(false);
      return;
    }

    axios
      .get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/zap`, {
        headers: {
          Authorization: token,
        },
      })
      .then((res) => {
        setZaps(res.data.zaps);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching zaps:", error);
        setLoading(false);
      });
  }, []); // Empty dependency array means it runs once on mount

  return {
    loading,
    zaps,
  };
}

export default function DashBoard() {
  const { loading, zaps } = useZaps();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const setSelectedActions = useStore((state) => state.setSelectedActions);
  const setZapTrigger = useStore((state) => state.setZapTrigger);
  useEffect(() => {
    setIsClient(true);
  }, []);

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
                setSelectedActions(null)
                setZapTrigger(null)
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
                  onClick={() => router.push(`/zap/${z.id}`)}
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
