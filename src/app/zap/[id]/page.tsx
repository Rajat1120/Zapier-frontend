"use client";

import { useRouter } from "next/navigation";

import ActionsList from "../../../../components/ActionList";
import Image from "next/image";

export default function ZapPage() {
  
  const router = useRouter();
  return (
    <div className="h-full w-full flex">
      <div className="h-full bg-[#413735] flex justify-center py-4 w-10">
        <Image
          onClick={() => router.push("/dashboard")}
          className="h-8 w-8"
          width={32}
          height={32}
          style={{
            cursor: "pointer",
          }}
          src="https://img.icons8.com/?size=100&id=RYh4BCDIOen9&format=png&color=ffffff"
          alt=""
        />
      </div>
      <div className="h-full w-full">
        <ActionsList
          
        ></ActionsList>
        ;
      </div>
    </div>
  );
}
