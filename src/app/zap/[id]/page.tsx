"use client";

import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import ActionsList from "../../../../components/ActionList";
import Image from "next/image";

export default function ZapPage() {
  const params = useParams();
  const router = useRouter();
  return (
    <div className="h-full w-full flex">
      <div className="h-full bg-[#413735] flex justify-center py-4 w-10">
        <Image
          onClick={() => router.push("/dashboard")}
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
          id={Array.isArray(params.id) ? params.id[0] : params.id}
        ></ActionsList>
        ;
      </div>
    </div>
  );
}
