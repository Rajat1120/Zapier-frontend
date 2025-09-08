import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { GoogleTokenPayload, Zap } from "./type";
import { appScopes } from "@/app/api/oauth/google/start/route";
import { ParamValue } from "next/dist/server/request/params";
import { SetStateAction } from "react";

const supabase = createClientComponentClient();

export const fetchActions = async (zapId: string | string[] | undefined) => {
  if (!zapId || Array.isArray(zapId)) return [];

  const { data, error } = await supabase
    .from("Action")
    .select("*")
    .eq("zapId", zapId);

  if (error) throw new Error(error.message);
  // Normalize legacy ids to reflect backend renames
  return (data || []).map((action) => ({
    ...action,
    actionId: action.actionId === "email" ? "gmail" : action.actionId,
  }));
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
  email,
}: GoogleTokenPayload & { token: string }): Promise<string> {
  const response = await axios.post(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/google-token`,
    {
      access_token,
      refresh_token,
      scopes,
      expires_in,
      email,
    },
    {
      headers: {
        Authorization: token,
      },
    }
  );

  return response.data;
}

function normalizeServiceKey(serviceName: string) {
  // Convert "You Tube" → "youtube", "Google Slides" → "slide"
  const lower = serviceName.toLowerCase().replace(/\s+/g, "");

  const keywordMatch = Object.keys(appScopes).find((key) =>
    lower.includes(key)
  );

  return keywordMatch || ""; // return "" if not matched
}

export function useHasServiceAccess(serviceName: string, token: string | null) {
  const normalizedKey = normalizeServiceKey(serviceName);

  return useQuery({
    queryKey: ["google-token-scopes", normalizedKey, token],
    refetchOnMount: true,
    enabled: !!token && !!normalizedKey,
    queryFn: async () => {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/google-token`,
          {
            headers: { Authorization: token },
          }
        );

        return res.data;
      } catch (err: unknown) {
        if (axios.isAxiosError(err) && err.response?.status === 404) {
          return { scopes: [], email: null };
        }
        throw err; // for other errors, rethrow
      }
    },
    select: (data) => {
      const scopes = data?.scopes ?? [];
      const requiredScopes = appScopes[normalizedKey];
      
      
      let hasMatch = false;
     
        hasMatch = requiredScopes?.every((scope) => scopes.includes(scope)) ?? false;
      
      return {
        scopesMatch: hasMatch,
        email: data?.email ?? null,
        expiresAt: data?.expiresAt ?? null,
      };
    },
  });
}

export function handleGoogleConnect(
  zapId: ParamValue,
  appName: string,
  token: string,
  setConnecting: (val: boolean) => void,
  setButtonLabel: {
    (value: SetStateAction<string>): void;
    (arg0: string): void;
  },
  refetch: () => void
) {
  const app = appName.toLowerCase().replace(/\s+/g, "");
  const googleApps = [
    "sheet",
    "slide",
    "calendar",
    "docs",
    "drive",
    "youtube",
    "gmail",
  ];
  const matchedApp = googleApps.find((keyword) => app.includes(keyword));

  if (!matchedApp) {
    console.warn("No OAuth flow configured for app:", appName);
    return;
  }

  console.log(`🔗 Starting OAuth for ${appName} -> ${matchedApp}`);
  
  const url = `/api/oauth/google/start?zapId=${zapId}&app=${matchedApp}&token=${token}`;
  console.log(`🔗 OAuth URL:`, url);

  const popup = window.open(url, "google-oauth", "width=900,height=700");

  const interval = setInterval(() => {
    if (popup?.closed) {
      console.log(`❌ OAuth popup closed for ${appName}`);
      setConnecting(false);
      clearInterval(interval);
      window.removeEventListener("message", handleOAuthMessage);
    }
  }, 500);

  function handleOAuthMessage(event: MessageEvent) {
    setConnecting(false);
    if (event.origin !== window.location.origin) {
      console.warn('⚠️ OAuth message from wrong origin:', event.origin);
      return;
    }
    if (event.data === "oauth-success") {
      console.log(`✅ OAuth success for ${appName}`);
      refetch();
      setButtonLabel("Change");
      console.log("✅ Google account connected!");
      window.removeEventListener("message", handleOAuthMessage);
      clearInterval(interval);
    } else {
      console.log(`💬 OAuth message:`, event.data);
    }
  }

  window.addEventListener("message", handleOAuthMessage);
}

export function useGetDriveFolders({
  token,
  enabled,
}: {
  token: string | null;
  enabled: boolean;
}) {
  const { isLoading: gettingFolders, data: driveFolders } = useQuery({
    queryKey: ["google-drive-folders"],
    queryFn: () => getDriveFolders(token),
    enabled: typeof window !== "undefined" && enabled,
    staleTime: 1000 * 60 * 2,
    retry: 1,
  });

  if (!token) {
    return { gettingFolders: false, driveFolders: [] };
  }

  return { gettingFolders, driveFolders: driveFolders ?? [] };
}

export async function getDriveFolders(token: string | null) {
  if (!token) return [];

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/google-drive/google/folders`,
    {
      method: "GET",
      headers: {
        Authorization: token,
      },
    }
  );

  const data = await res.json();

  return data.folders || [];
}
