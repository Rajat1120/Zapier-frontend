"use client";

import { useParams } from "next/navigation";
import ActionsList from "../../../../components/ActionList";

export default function ZapPage() {
  const params = useParams();

  return (
    <div className="h-full w-full">
      <h1 className="text-2xl font-bold">Zapier</h1>

      <ActionsList
        id={Array.isArray(params.id) ? params.id[0] : params.id}
      ></ActionsList>
    </div>
  );
}
