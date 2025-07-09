import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { GoogleTokenPayload, Zap } from "./type";
const supabase = createClientComponentClient();

export const fetchActions = async (zapId: string | string[] | undefined) => {
  if (!zapId || Array.isArray(zapId)) return [];

  const { data, error } = await supabase
    .from("Action")
    .select("*")
    .eq("zapId", zapId);

  if (error) throw new Error(error.message);
  return data;
};

export const fetchAvailableActions = async () => {
  const { data, error } = await supabase.from("AvailableActions").select("*");

  if (error) throw new Error(error.message);
  return data;
};

const fetchZaps = async (): Promise<Zap[]> => {
  const token = typeof window !== "undefined" && localStorage.getItem("token");

  if (!token) {
    throw new Error("No token found");
  }

  const response = await axios.get(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/zap`,
    {
      headers: {
        Authorization: token,
      },
    }
  );

  return response.data.zaps;
};

export function useZaps() {
  const {
    data: zaps = [],
    isLoading: loading,
    isError,
    error,
    refetch: refetchZaps,
  } = useQuery({
    queryKey: ["zaps"],
    queryFn: fetchZaps,
    refetchOnMount: true,
    enabled: typeof window !== "undefined", // only run on client
    staleTime: 1000 * 60 * 2, // 2 minutes
    retry: 1, // retry once on failure
  });

  return {
    loading,
    zaps,
    isError,
    error,
    refetchZaps,
  };
}

export async function updateGoogle_Tokens({
  access_token,
  refresh_token,
  scopes,
  expires_in,
  token,
}: GoogleTokenPayload & { token: string }): Promise<string> {
  const response = await axios.post(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/google-token`,
    {
      access_token,
      refresh_token,
      scopes,
      expires_in,
    },
    {
      headers: {
        Authorization: token,
      },
    }
  );

  return response.data;
}
