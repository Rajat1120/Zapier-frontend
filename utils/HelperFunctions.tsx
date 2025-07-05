"use client";

import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import axios from "axios";
import { useEffect } from "react";

import { ParamValue } from "next/dist/server/request/params";
import { SelectedAction } from "@/lib/type";
import { Node } from "@xyflow/react";

export async function handleLogin(
  email: string,
  password: string,
  router: AppRouterInstance
) {
  // This check is good, ensures it runs only in browser
  if (typeof window === "undefined") return;

  try {
    const res = await axios.post(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/user/signin`,
      {
        username: email,
        password,
      }
    );

    // These lines are fine because handleLogin is called client-side
    localStorage.setItem("token", res.data.token);
    localStorage.setItem("email", res.data.email);
    localStorage.setItem("name", res.data.name);
    router.push("/dashboard");
  } catch (error) {
    console.error("Login failed:", error);
    // Handle login error appropriately
  }
}

export async function handleLogout() {
  // This check is also good
  if (typeof window === "undefined") return;
  localStorage.removeItem("token");
  localStorage.removeItem("email");
  localStorage.removeItem("name");
}

export const useLogin = (
  email: string,
  password: string,
  router: AppRouterInstance
) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        handleLogin(email, password, router);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [router, email, password]);
};

export default async function handleZapCreate(
  selectedTrigger: SelectedAction,

  selectedActions: unknown[]
) {
  if (!selectedActions.length) return;

  try {
    // Type guard to check for availableActionId
    const getAvailableTriggerId = (trigger: SelectedAction) => {
      if (!trigger) return;
      if (
        "availableActionId" in trigger &&
        trigger.availableActionId !== undefined
      ) {
        return String(trigger.availableActionId);
      }
      if ("actionId" in trigger && trigger.actionId !== undefined) {
        return String(trigger.actionId);
      }
      return "";
    };

    const res = await axios.post(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/zap`,
      JSON.stringify({
        availableTriggerId: getAvailableTriggerId(selectedTrigger),
        triggerMetadata: {},
        actions: selectedActions.map((a) => {
          const action = a as {
            availableActionId: string | number;
            metadata: unknown;
            sortingOrder: string;
            name: string;
            index: number;
          };
          return {
            availableActionId: action.availableActionId,
            actionMetadata: action.metadata,
            index: action.index,

            sortingOrder: action.sortingOrder,
          };
        }),
      }),
      {
        headers: {
          Authorization: localStorage.getItem("token"),
          "Content-Type": "application/json",
        },
      }
    );

    return res.data.zapId;
  } catch (err) {
    throw err;
  }
}

export async function updateZap(id: ParamValue, selectedActions: unknown[]) {
  try {
    const res = await axios.post(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/zap/${id}`,
      JSON.stringify({
        zapId: id,
        actions: selectedActions.map((a) => {
          const action = a as {
            metadata: JSON;
            actionId: string;
            index: number;
            sortingOrder: number;
          };
          return action;
        }),
      }),
      {
        headers: {
          Authorization: localStorage.getItem("token"),
          "Content-Type": "application/json",
        },
      }
    );

    return res;
  } catch (err) {
    throw err;
  }
}

export function inActionTable(
  selectedNode: Node | null,
  setShowZapModal: { (val: boolean): void; (arg0: boolean): void }
): boolean {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-ignore
  const type = selectedNode?.data?.label?.props?.match;

  if (!type) {
    setShowZapModal(true);
    return true;
  }

  return false;
}

export function useShowSideBar(selectedNode: Node | null): boolean {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-ignore
  const type = selectedNode?.data?.label?.props?.match;

  if (type) {
    return true;
  }

  return false;
}
