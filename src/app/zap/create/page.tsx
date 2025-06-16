"use client";

import axios from "axios";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AppBar } from "../../../../components/AppBar";
import { PrimaryButton } from "../../../../components/buttons/PrimaryButton";
import { Input } from "../../../../components/Input";
import { ZapCell } from "../../../../components/ZapCell";
import Image from "next/image";

import ActionsList from "../../../../components/ActionList";

function useAvailableActionsAndTriggers() {
  const [availableActions, setAvailableActions] = useState([]);
  const [availableTriggers, setAvailableTriggers] = useState([]);

  useEffect(() => {
    axios
      .get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/trigger/available`)
      .then((x) => setAvailableTriggers(x.data.availableTriggers));

    axios
      .get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/action/available`)
      .then((x) => setAvailableActions(x.data.availableActions));
  }, []);

  return {
    availableActions,
    availableTriggers,
  };
}

export default function CreateZap() {
  const router = useRouter();

  const [selectedTrigger, setSelectedTrigger] = useState<{
    id: string;
    name: string;
  }>();

  return (
    <div className="h-full w-full flex">
      <div className="h-full bg-[#413735] flex justify-center py-4 w-10">
        <img
          onClick={() => router.push("/dashboard")}
          className="cursor-pointer w-8 h-8 "
          src="https://img.icons8.com/?size=100&id=RYh4BCDIOen9&format=png&color=ffffff"
          alt=""
        />
      </div>
      <div className="h-full w-full">
        <ActionsList></ActionsList>
      </div>
    </div>
  );
}
