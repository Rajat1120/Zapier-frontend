"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import Authentication from "../../../../utils/Authentication";

export default function ActionsList() {
  const [actions, setActions] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const params = useParams();
  const id = params.id;

  useEffect(() => {
    const fetchActions = async () => {
      const supabase = createClientComponentClient();
      const { data, error } = await supabase
        .from("Action")
        .select("*")
        .eq("zapId", id);

      if (error) setError(error.message);
      else setActions(data);
    };

    if (id) fetchActions();
  }, [id]);

  return (
    <div>
      <Authentication></Authentication>
      <h2>Actions for Zap ID: {id}</h2>
      {error && <p>Error: {error}</p>}
      <ul>
        {actions.map((a) => (
          <li key={a.id}>{JSON.stringify(a)}</li>
        ))}
      </ul>
    </div>
  );
}
