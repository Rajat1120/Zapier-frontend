"use client";

import { useRouter } from "next/navigation";

import Image from "next/image";

import ActionsList from "../../../../components/ActionList";

export default function CreateNewZap() {
  const router = useRouter();

  return (
    <div className="h-full w-full flex">
      <div className="h-full bg-[#413735] flex justify-center py-4 w-10">
        <Image
          onClick={() => router.push("/dashboard")}
          className="w-8 h-8 cursor-pointer"
          width={32}
          height={32}
          src="https://img.icons8.com/?size=100&id=RYh4BCDIOen9&format=png&color=ffffff"
          alt="dashboard icon"
        />
      </div>
      <div className="h-full w-full">
        <ActionsList></ActionsList>
      </div>
    </div>
  );
}
