"use client";

import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import axios from "axios";
import { useEffect } from "react";

import {supabase} from "../utils/supabase"
import { ParamValue } from "next/dist/server/request/params";
import { Action, SelectedAction } from "../components/ActionList";


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


export default async function handleZapCreate (selectedTrigger: SelectedAction | Action | null

,selectedActions: unknown[], zapId: ParamValue){

 

    if(zapId){
      
      const { data, error } = await supabase
      .from("Zap")
      .select("id")
      .eq("id", zapId)
      .single();
      
      if (error) {
        if (error.code === "PGRST116") {
          console.log("Zap not found");
        } else {
          console.error("Supabase error:", error.message);
        }
      } else {
        console.log("Zap exists:", data);
        return
      }
    }
    
    
  if(!selectedActions.length) return

  try {
    
    // Type guard to check for availableActionId
    const getAvailableTriggerId = (trigger: SelectedAction | Action | null) => {
      if(!trigger) return
      if ("availableActionId" in trigger && trigger.availableActionId !== undefined) {
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
          const action = a as { availableActionId: string | number; metadata: unknown , sortingOrder: string,name: string };
          return {
            availableActionId: action.availableActionId,
            actionMetadata: action.metadata,
            name:action.name,
            sortingOrder:action.sortingOrder
          };
        }),
      }),
      {
        headers: {
          Authorization: localStorage.getItem("token"),
           'Content-Type': 'application/json'
        },
      }
    );
    
    return res.data.zapId
  
  }catch(err){
    throw err
  }
}



